// app/api/checkout/mpesa/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates } from "@/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"
import { initiateStkPush, normalizePhone } from "@/lib/mpesa"

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

    // Idempotency key — either client-generated (nanoid, per D4/D1 in the
    // progress tracker) or generated here as a fallback.
    const sessionId = checkoutSessionId || nanoid()

    // DB has a UNIQUE constraint on checkout_session_id — a duplicate rapid
    // tap will collide here and we return 409 instead of double-charging.
    const [existing] = await db
      .select()
      .from(orders)
      .where(eq(orders.checkoutSessionId, sessionId))
      .limit(1)

    if (existing) {
      return NextResponse.json(
        { message: "Checkout already in progress for this session" },
        { status: 409 }
      )
    }

    // template.priceKes comes back as a string (Drizzle numeric() columns are
    // typed as string, not number, to avoid precision loss). Keep a numeric
    // copy for the M-Pesa call and pass the string straight through to the DB.
    const amountNumeric = Number(template.priceKes)
    const amountForDb = template.priceKes // already a string

    const [order] = await db
      .insert(orders)
      .values({
        checkoutSessionId: sessionId,
        customerEmail: email,
        templateId: template.id,
        amountPaid: amountForDb,
        currency: "KES",
        paymentGateway: "mpesa",
        paymentStatus: "pending",
      })
      .returning()

    const stkResponse = await initiateStkPush({
      phone: normalizedPhone,
      amount: amountNumeric,
      orderId: order.id,
    })

    // Store Daraja's CheckoutRequestID so the webhook can find this order later.
    await db
      .update(orders)
      .set({ gatewayRequestId: stkResponse.checkoutRequestId })
      .where(eq(orders.id, order.id))

    return NextResponse.json({
      checkoutRequestId: stkResponse.checkoutRequestId,
      message: "Check your phone for the M-Pesa prompt",
    })
  } catch (err: any) {
    console.error("[MPESA CHECKOUT ERROR]", err)
    return NextResponse.json({ message: "Failed to initiate payment" }, { status: 500 })
  }
}