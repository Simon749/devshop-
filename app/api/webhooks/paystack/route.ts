// app/api/webhooks/paystack/route.ts

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates, subscribers, downloadHistory } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { verifyWebhookSignature, verifyTransaction } from "@/lib/paystack"
import { generateDownloadToken, getTokenExpiry } from "@/lib/tokens"
import { sendPurchaseConfirmation } from "@/services/emails"
import { completeOrder } from "@/lib/orders"

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-paystack-signature")
  const body = await req.text()

  // Validate signature
  if (!signature || !verifyWebhookSignature(body, signature)) {
    console.warn("[PAYSTACK WEBHOOK] Invalid signature")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const event = JSON.parse(body)

  if (event.event !== "charge.success") {
    return NextResponse.json({ message: "Event ignored" }, { status: 200 })
  }

  const { reference, amount, currency, customer, metadata } = event.data

  // Find order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.checkoutSessionId, reference))
    .limit(1)

  if (!order) {
    console.warn(`[PAYSTACK WEBHOOK] Order not found for reference: ${reference}`)
    return NextResponse.json({ message: "Order not found" }, { status: 404 })
  }

  // Idempotency: already completed
  if (order.paymentStatus === "completed") {
    return NextResponse.json({ message: "Already processed" }, { status: 200 })
  }

  // Server-side verification
  try {
    const verified = await verifyTransaction(reference)
    if (!verified.status || verified.data.status !== "success") {
      throw new Error("Verification failed")
    }
    // Verify amount matches (Paystack returns amount in smallest currency unit)
    const expectedAmount = Math.round(Number(order.amountPaid) * 100)
    if (verified.data.amount !== expectedAmount) {
      throw new Error(`Amount mismatch: expected ${expectedAmount}, got ${verified.data.amount}`)
    }
  } catch (err: any) {
    console.error("[PAYSTACK WEBHOOK] Verification failed:", err.message)
    await db
      .update(orders)
      .set({ paymentStatus: "failed" })
      .where(eq(orders.id, order.id))
    return NextResponse.json({ message: "Verification failed" }, { status: 400 })
  }

  // Complete order
  const token = generateDownloadToken()
  const expiresAt = getTokenExpiry()

  const { isNewCompletion } = await completeOrder(reference, {
    gatewayRef: reference,
    downloadToken: token,
    tokenExpiresAt: expiresAt,
  })

  if (!isNewCompletion) {
    return NextResponse.json({ message: "Already processed" }, { status: 200 })
  }

  // Get template title
  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, order.templateId!))
    .limit(1)

  // Upsert subscriber
  await db
    .insert(subscribers)
    .values({
      email: order.customerEmail,
      source: "purchase",
      templateId: order.templateId,
    })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: {
        lastActiveAt: new Date(),
        totalPurchases: sql`${subscribers.totalPurchases} + 1`,
      },
    })

  // Send email
  await sendPurchaseConfirmation({
    customerEmail: order.customerEmail,
    templateTitle: template?.title ?? "Your Template",
    downloadToken: token,
    expiresAt,
  })

  console.log(`[PAYSTACK WEBHOOK] Order ${order.id} completed, email sent to ${order.customerEmail}`)

  return NextResponse.json({ message: "Success" }, { status: 200 })
}
