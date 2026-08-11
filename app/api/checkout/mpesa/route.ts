// app/api/checkout/mpesa/route.ts — DIAGNOSTIC VERSION
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { nanoid } from "nanoid"
import { initiateStkPush, normalizePhone } from "@/lib/mpesa"

async function getExchangeRate(): Promise<number> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) throw new Error("Missing NEXT_PUBLIC_APP_URL")
  const res = await fetch(`${appUrl}/api/exchange-rate`, { cache: "no-store" })
  if (!res.ok) throw new Error(`Exchange rate API returned ${res.status}`)
  const data = await res.json()
  if (!data.rate) throw new Error("Exchange rate API returned no rate")
  return data.rate as number
}

export async function POST(req: NextRequest) {
  try {
    // ── DIAGNOSTIC: Check all env vars first ───────────────────────
    const requiredEnvVars = [
      "DATABASE_URL",
      "NEXT_PUBLIC_APP_URL",
      "MPESA_CONSUMER_KEY",
      "MPESA_CONSUMER_SECRET",
      "MPESA_SHORTCODE",
      "MPESA_PASSKEY",
      "MPESA_CALLBACK_URL",
      "MPESA_ENV",
    ]
    const missing = requiredEnvVars.filter((k) => !process.env[k])
    if (missing.length > 0) {
      return NextResponse.json(
        {
          message: "Server misconfiguration: missing environment variables",
          missing,
          hint: "Go to Vercel Dashboard → Project Settings → Environment Variables. Ensure these are set for your current deployment environment (Production / Preview).",
        },
        { status: 500 }
      )
    }

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

    // ── Resolve effective KES amount ───────────────────────────────
    let amountKes = Number(template.priceKes)
    let wasConverted = false
    let exchangeRate: number | undefined

    if (!amountKes || amountKes <= 0) {
      const usd = Number(template.priceUsd)
      if (usd > 0) {
        exchangeRate = await getExchangeRate()
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

    await db
      .update(orders)
      .set({ gatewayRef: stkResponse.checkoutRequestId })
      .where(eq(orders.id, order.id))

    return NextResponse.json({
      checkoutRequestId: stkResponse.checkoutRequestId,
      message: "Check your phone for the M-Pesa prompt",
      ...(wasConverted && { convertedFrom: "USD", exchangeRate }),
    })
  } catch (err: any) {
    console.error("[MPESA CHECKOUT ERROR]", err)
    return NextResponse.json(
      { message: err.message || "Failed to initiate payment", stack: err.stack },
      { status: 500 }
    )
  }
}