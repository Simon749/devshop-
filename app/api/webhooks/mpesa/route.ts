import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates, subscribers } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { generateDownloadToken, getTokenExpiry } from "@/lib/tokens"
import { sendPurchaseConfirmation } from "@/services/emails"

// Helper to safely extract values from M-PESA callback metadata
function getCallbackValue(callback: any, key: string): string | undefined {
  const items = callback?.CallbackMetadata?.Item
  if (!Array.isArray(items)) return undefined
  const found = items.find((i: any) => i.Name === key)
  return found?.Value?.toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const callback = body?.Body?.stkCallback

    if (!callback) {
      console.warn("[M-PESA WEBHOOK] Missing stkCallback in body")
      return NextResponse.json({ message: "Invalid callback" }, { status: 400 })
    }

    const checkoutRequestId = callback.CheckoutRequestID
    const resultCode = callback.ResultCode
    const resultDesc = callback.ResultDesc

    console.log(`[M-PESA WEBHOOK] CheckoutRequestID=${checkoutRequestId} ResultCode=${resultCode}`)

    if (!checkoutRequestId) {
      return NextResponse.json({ message: "Missing CheckoutRequestID" }, { status: 400 })
    }

    // Find order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.gatewayRequestId, checkoutRequestId))
      .limit(1)

    if (!order) {
      console.warn(`[M-PESA WEBHOOK] Order not found: ${checkoutRequestId}`)
      // Return 200 so Safaricom doesn't retry
      return NextResponse.json({ message: "Order not found" }, { status: 200 })
    }

    // Idempotency: already processed
    if (order.paymentStatus === "completed") {
      console.log(`[M-PESA WEBHOOK] Order ${order.id} already completed`)
      return NextResponse.json({ message: "Already processed" })
    }

    // Payment failed or cancelled by user
    if (resultCode !== 0) {
      console.log(`[M-PESA WEBHOOK] Failed: ${resultDesc} (code ${resultCode})`)
      await db
        .update(orders)
        .set({ paymentStatus: "failed" })
        .where(eq(orders.id, order.id))
      return NextResponse.json({ message: "Failed recorded" })
    }

    // === SUCCESS PATH ===
    const mpesaReceiptNumber = getCallbackValue(callback, "MpesaReceiptNumber")
    const token = generateDownloadToken()
    const expiresAt = getTokenExpiry()

    console.log(`[M-PESA WEBHOOK] Completing order ${order.id}, receipt: ${mpesaReceiptNumber}`)

    // Complete order inline (no external query — trust the webhook)
    await db
      .update(orders)
      .set({
        paymentStatus: "completed",
        gatewayRef: mpesaReceiptNumber || checkoutRequestId,
        downloadToken: token,
        tokenExpiresAt: expiresAt,
      })
      .where(eq(orders.id, order.id))

    // Fetch template for email
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
    try {
      await sendPurchaseConfirmation({
        customerEmail: order.customerEmail,
        templateTitle: template?.title ?? "Your Template",
        downloadToken: token,
        expiresAt,
      })
      console.log(`[M-PESA WEBHOOK] Email sent to ${order.customerEmail}`)
    } catch (emailErr: any) {
      console.error("[M-PESA WEBHOOK] Email failed:", emailErr.message)
      // Don't fail the webhook — email can be retried manually
    }

    return NextResponse.json({ message: "Success" })

  } catch (err: any) {
    console.error("[M-PESA WEBHOOK ERROR]", err)
    // Return 200 so Safaricom doesn't retry and spam
    return NextResponse.json({ message: "Error logged" }, { status: 200 })
  }
}