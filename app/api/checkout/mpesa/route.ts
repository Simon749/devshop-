// app/api/checkout/mpesa/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates } from "@/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { initiateStkPush, normalizePhone } from "@/lib/mpesa"
import { getEffectivePrice } from "@/lib/prices"

async function getExchangeRate(): Promise<number> {
  // Reuse your existing endpoint or fetch directly
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/exchange-rate`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Failed to fetch exchange rate")
  const data = await res.json()
  return data.rate as number
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
      .where(eq(templates.id, templateId))
      .limit(1)

    if (!template || !template.isPublished) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 })
    }

    // ── Get effective KES price (convert from USD if needed) ────────
    const rate = await getExchangeRate()
    const { amount: amountKes, wasConverted } = getEffectivePrice(template, "KES", rate)

    if (amountKes <= 0) {
      return NextResponse.json(
        { message: "Template has no valid price. Cannot checkout for free via M-Pesa." },
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

    // Store the *converted* amount so the ledger is accurate
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

      console.error("[M-PESA STK FAILED]", stkErr)
      return NextResponse.json(
        { message: stkErr.message || "Failed to initiate M-Pesa payment" },
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
      ...(wasConverted && { convertedFrom: "USD", exchangeRate: rate }),
    })
  } catch (err: any) {
    console.error("[MPESA CHECKOUT ERROR]", err)
    return NextResponse.json(
      { message: "Failed to initiate payment" },
      { status: 500 }
    )
  }
}