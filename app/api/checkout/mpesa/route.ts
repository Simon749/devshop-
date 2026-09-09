// app/api/checkout/mpesa/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { nanoid } from "nanoid"
import { initiateStkPush, normalizePhone } from "@/lib/mpesa"
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

/**
 * Fetches the USD→KES rate.
 * Tries the app's own endpoint first, then falls back to direct fetch.
 * Uses req.url.origin so it works on Vercel without NEXT_PUBLIC_APP_URL.
 */
async function getExchangeRate(req: NextRequest): Promise<number> {
  const origin = new URL(req.url).origin
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";
  
  const { success } = await checkRateLimit(ip);
  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }

  // Method 1: Call our own API (has caching logic)
  try {
    const res = await fetch(`${origin}/api/exchange-rate`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.rate) return data.rate as number
    }
  } catch (err) {
    console.warn("[EXCHANGE] Self-fetch failed:", err)
  }

  // Method 2: Direct fallback to exchangerate-api.com
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.rates?.KES) return data.rates.KES as number
    }
  } catch (err) {
    console.warn("[EXCHANGE] Direct fetch failed:", err)
  }

  throw new Error("Exchange rate unavailable. Please try again shortly.")
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, phone, templateId, checkoutSessionId } = body ?? {}

    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    let normalizedPhone: string
    try {
      normalizedPhone = normalizePhone(phone ?? "")
    } catch {
      return NextResponse.json(
        { message: "Phone must be in format 07XXXXXXXX or 2547XXXXXXXX" },
        { status: 400 }
      )
    }

    if (!templateId) {
      return NextResponse.json({ message: "templateId is required" }, { status: 400 })
    }

    const [template] = await db
      .select()
      .from(templates)
      .where(and(eq(templates.id, templateId), eq(templates.isPublished, true)))
      .limit(1)

    if (!template) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 })
    }

    // ── Resolve KES amount (convert from USD if needed) ──────────────
    let amountKes = Number(template.priceKes)
    let wasConverted = false
    let exchangeRate: number | undefined

    if (!amountKes || amountKes <= 0) {
      const usd = Number(template.priceUsd)
      if (usd > 0) {
        exchangeRate = await getExchangeRate(req)
        amountKes = Math.round(usd * exchangeRate)
        wasConverted = true
      }
    }

    if (!amountKes || amountKes <= 0) {
      return NextResponse.json(
        { message: "Template has no valid price" },
        { status: 400 }
      )
    }

    const sessionId = checkoutSessionId || nanoid()

    const [existing] = await db
      .select()
      .from(orders)
      .where(eq(orders.checkoutSessionId, sessionId))
      .limit(1)

    if (existing) {
      if (existing.paymentStatus === "failed") {
        await db.delete(orders).where(eq(orders.id, existing.id))
      } else {
        return NextResponse.json(
          { message: "Checkout already in progress for this session" },
          { status: 409 }
        )
      }
    }

    const [order] = await db
      .insert(orders)
      .values({
        checkoutSessionId: sessionId,
        customerEmail: email,
        templateId: template.id,
        amountPaid: String(amountKes),
        currency: "KES",
        paymentGateway: "mpesa",
        paymentStatus: "pending",
      })
      .returning()

    let stkResponse: { checkoutRequestId: string; merchantRequestId: string }
    try {
      stkResponse = await initiateStkPush({
        phone: normalizedPhone,
        amount: amountKes,
        orderId: order.id,
      })
    } catch (stkErr: any) {
      await db
        .update(orders)
        .set({ paymentStatus: "failed" })
        .where(eq(orders.id, order.id))

      return NextResponse.json(
        { message: stkErr.message || "M-Pesa initiation failed" },
        { status: 502 }
      )
    }

    // FIX (Phase 0): the webhook and status route look up orders by
    // gatewayRequestId (see db/schema.ts — "M-Pesa CheckoutRequestID").
    // Previously this wrote gatewayRef, so the webhook could never find
    // the order and M-Pesa payments never completed.
    await db
      .update(orders)
      .set({ gatewayRequestId: stkResponse.checkoutRequestId })
      .where(eq(orders.id, order.id))

    return NextResponse.json({
      checkoutRequestId: stkResponse.checkoutRequestId,
      message: "Check your phone for the M-Pesa prompt",
      ...(wasConverted && { convertedFrom: "USD", exchangeRate }),
    })
  } catch (err: any) {
    console.error("[MPESA CHECKOUT ERROR]", err)
    return NextResponse.json(
      { message: err.message || "Failed to initiate payment" },
      { status: 500 }
    )
  }
}