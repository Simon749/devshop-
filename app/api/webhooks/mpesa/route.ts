// app/api/webhooks/mpesa/route.ts
//
// SECURITY MODEL (progresstracker.md decision D6):
// The callback body is a NOTIFICATION, never proof of payment.
// Daraja does NOT sign its callbacks (unlike Paystack's HMAC), so the
// only thing between a forged POST and a free download link is the
// server-side re-query via queryTransaction(). Never remove it.
//
// Flow:
//   1. Gate 1  — CheckoutRequestID must match a real pending order
//   2. Cancel/fail paths — mark failed atomically (pending-guarded)
//   3. Success claimed — re-query Daraja, confirm ResultCode + amount
//   4. Atomic completion via lib/orders.ts (Postgres decides the winner
//      of duplicate deliveries — retries are safe by construction)

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates, subscribers } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import { queryTransaction } from "@/lib/mpesa"
import { completeOrderByGatewayRequestId, markOrderFailed } from "@/lib/orders"
import { generateDownloadToken, getTokenExpiry } from "@/lib/tokens"
import { sendPurchaseConfirmation } from "@/services/emails"

// ── Helpers ────────────────────────────────────────────────────────────────

// Read a value from the STK callback's metadata array
function getCallbackValue(callback: any, key: string): string | undefined {
  const items = callback?.CallbackMetadata?.Item
  if (!Array.isArray(items)) return undefined
  const found = items.find((i: any) => i.Name === key)
  return found?.Value?.toString()
}

// Read a value from the STK *query* response's result parameters
function getQueryValue(query: any, key: string): string | undefined {
  const params = query?.ResultParameters?.ResultParameter
  if (!Array.isArray(params)) return undefined
  const found = params.find((p: any) => p.Name === key)
  return found?.Value?.toString()
}

// Daraja can legitimately answer "still being processed" if we re-query
// too soon after the callback. Those orders must stay pending — the cron
// sweep (Week 4 task 4.4) re-checks them later. Never mark these failed.
function isStillProcessing(query: any): boolean {
  const desc = (query?.ResultDesc ?? query?.ResponseDescription ?? "")
    .toString()
    .toLowerCase()
  const code = (query?.ResultCode ?? query?.ResponseCode ?? "").toString()
  return code === "500.001.1001" || desc.includes("still being processed")
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

    if (!checkoutRequestId) {
      return NextResponse.json({ message: "Missing CheckoutRequestID" }, { status: 400 })
    }

    console.log(`[M-PESA WEBHOOK] CheckoutRequestID=${checkoutRequestId} ResultCode=${resultCode}`)

    // ── Gate 1: must belong to a real pending order ──
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.gatewayRequestId, checkoutRequestId))
      .limit(1)

    if (!order) {
      console.warn(`[M-PESA WEBHOOK] Order not found: ${checkoutRequestId}`)
      return NextResponse.json({ message: "Order not found" }, { status: 200 })
    }

    // Idempotency: already processed (the completion path re-checks atomically too)
    if (order.paymentStatus === "completed") {
      console.log(`[M-PESA WEBHOOK] Order ${order.id} already completed`)
      return NextResponse.json({ message: "Already processed" })
    }

    // ── Customer cancelled / insufficient funds / prompt timed out ──
    if (resultCode !== 0) {
      console.log(`[M-PESA WEBHOOK] Failed: ${resultDesc} (code ${resultCode})`)
      await markOrderFailed(order.id)
      return NextResponse.json({ message: "Failed recorded" })
    }

    // ── Success claimed → verify with Daraja before trusting it (D6) ──
    let query: any
    try {
      query = await queryTransaction(checkoutRequestId)
    } catch (err: any) {
      // Could not reach Daraja (network/auth). Leave pending; cron sweeps later.
      console.error(`[M-PESA WEBHOOK] queryTransaction error for ${checkoutRequestId}:`, err.message)
      return NextResponse.json({ message: "Requery failed — will retry via cron" }, { status: 200 })
    }

    if (isStillProcessing(query)) {
      console.log(`[M-PESA WEBHOOK] ${checkoutRequestId} still processing per Daraja — leaving pending`)
      return NextResponse.json({ message: "Still processing" }, { status: 200 })
    }

    const confirmed =
      String(query?.ResponseCode) === "0" && Number(query?.ResultCode) === 0

    if (!confirmed) {
      console.warn(
        `[M-PESA WEBHOOK] Daraja could NOT confirm ${checkoutRequestId}:`,
        JSON.stringify(query)
      )
      await markOrderFailed(order.id)
      return NextResponse.json({ message: "Not confirmed by Daraja" }, { status: 200 })
    }

    // Amount check — a confirmed transaction must match what we charged
    const confirmedAmount = Number(getQueryValue(query, "Amount"))
    const expectedAmount = Math.round(Number(order.amountPaid))
    if (!confirmedAmount || confirmedAmount !== expectedAmount) {
      console.error(
        `[M-PESA WEBHOOK] AMOUNT MISMATCH order=${order.id}: expected ${expectedAmount}, Daraja says ${confirmedAmount}`
      )
      await markOrderFailed(order.id)
      return NextResponse.json({ message: "Amount mismatch" }, { status: 200 })
    }

    // Receipt number: prefer Daraja's query response, fall back to callback metadata
    const mpesaReceiptNumber =
      getQueryValue(query, "MpesaReceiptNumber") ||
      getCallbackValue(callback, "MpesaReceiptNumber") ||
      checkoutRequestId

    // ── Atomic completion: Postgres decides the winner of duplicate deliveries ──
    const token = generateDownloadToken()
    const expiresAt = getTokenExpiry()

    const { isNewCompletion } = await completeOrderByGatewayRequestId(checkoutRequestId, {
      gatewayRef: mpesaReceiptNumber,
      downloadToken: token,
      tokenExpiresAt: expiresAt,
    })

    if (!isNewCompletion) {
      console.log(`[M-PESA WEBHOOK] ${checkoutRequestId} already completed (duplicate delivery)`)
      return NextResponse.json({ message: "Already processed" }, { status: 200 })
    }

    console.log(`[M-PESA WEBHOOK] Order ${order.id} completed, receipt: ${mpesaReceiptNumber}`)

    // ── Post-completion: subscriber + email ──
    // Email failure must NOT unwind the completed order — the buyer can
    // always recover the link via /recover.
    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, order.templateId!))
      .limit(1)

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
    }

    return NextResponse.json({ message: "Success" })
  } catch (err: any) {
    console.error("[M-PESA WEBHOOK ERROR]", err)
    // Always 200 — Daraja does not use our status code to retry, and a 500
    // would just spam logs. The cron sweep is the safety net for failures here.
    return NextResponse.json({ message: "Error logged" }, { status: 200 })
  }
}