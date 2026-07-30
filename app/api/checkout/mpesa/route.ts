// app/api/webhooks/mpesa/[secret]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates, subscribers } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { queryTransaction } from "@/lib/mpesa"
import { generateDownloadToken, getTokenExpiry } from "@/lib/tokens"
import { sendPurchaseConfirmation } from "@/services/emails"
import { completeOrderByGatewayRequestId, markOrderFailed } from "@/lib/orders"

function getCallbackValue(callback: any, key: string): string | undefined {
  const items = callback?.CallbackMetadata?.Item
  if (!Array.isArray(items)) return undefined
  const found = items.find((i: any) => i.Name === key)
  return found?.Value?.toString()
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ secret: string }> }) {
  const { secret } = await params
  if (secret !== process.env.MPESA_WEBHOOK_SECRET) {
    console.warn("[M-PESA WEBHOOK] Invalid secret segment — rejecting")
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const callback = body?.Body?.stkCallback
    if (!callback) {
      return NextResponse.json({ message: "Invalid callback" }, { status: 400 })
    }

    const checkoutRequestId = callback.CheckoutRequestID
    const resultCode = callback.ResultCode

    if (!checkoutRequestId) {
      return NextResponse.json({ message: "Missing CheckoutRequestID" }, { status: 400 })
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.gatewayRequestId, checkoutRequestId))
      .limit(1)

    if (!order) {
      console.warn(`[M-PESA WEBHOOK] Order not found: ${checkoutRequestId}`)
      return NextResponse.json({ message: "Order not found" }, { status: 200 })
    }

    if (order.paymentStatus === "completed") {
      return NextResponse.json({ message: "Already processed" })
    }

    if (resultCode !== 0) {
      await markOrderFailed(order.id)
      return NextResponse.json({ message: "Failed recorded" })
    }

    // ── Do NOT trust the callback payload alone (D6) ──
    // Confirm independently via the Daraja query API before fulfilling.
    let confirmed = false
    try {
      const verification = await queryTransaction(checkoutRequestId)
      confirmed = verification.ResultCode === "0" || verification.ResultCode === 0
    } catch (err: any) {
      console.error("[M-PESA WEBHOOK] Query verification failed:", err.message)
    }

    if (!confirmed) {
      console.warn(`[M-PESA WEBHOOK] Callback claimed success but query did not confirm: ${checkoutRequestId}`)
      // Don't fulfil, don't mark failed either — leave pending for the cron to
      // re-check / expire, in case Daraja's query API is just lagging.
      return NextResponse.json({ message: "Unconfirmed — left pending" })
    }

    const mpesaReceiptNumber = getCallbackValue(callback, "MpesaReceiptNumber")
    const token = generateDownloadToken()
    const expiresAt = getTokenExpiry()

    const { isNewCompletion } = await completeOrderByGatewayRequestId(checkoutRequestId, {
      gatewayRef: mpesaReceiptNumber || checkoutRequestId,
      downloadToken: token,
      tokenExpiresAt: expiresAt,
    })

    if (!isNewCompletion) {
      return NextResponse.json({ message: "Already processed" })
    }

    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, order.templateId!))
      .limit(1)

    await db
      .insert(subscribers)
      .values({ email: order.customerEmail, source: "purchase", templateId: order.templateId })
      .onConflictDoUpdate({
        target: subscribers.email,
        set: { lastActiveAt: new Date(), totalPurchases: sql`${subscribers.totalPurchases} + 1` },
      })

    try {
      await sendPurchaseConfirmation({
        customerEmail: order.customerEmail,
        templateTitle: template?.title ?? "Your Template",
        downloadToken: token,
        expiresAt,
      })
    } catch (emailErr: any) {
      console.error("[M-PESA WEBHOOK] Email failed:", emailErr.message)
    }

    return NextResponse.json({ message: "Success" })
  } catch (err: any) {
    console.error("[M-PESA WEBHOOK ERROR]", err)
    return NextResponse.json({ message: "Error logged" }, { status: 200 })
  }
}