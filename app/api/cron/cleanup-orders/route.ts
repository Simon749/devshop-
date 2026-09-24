// app/api/cron/cleanup-orders/route.ts
//
// Safety net for orders stuck in "pending": either the webhook never
// arrived, or the customer genuinely abandoned checkout. Per gap-closure
// P2-3, we must NOT just expire on a timer — we re-verify server-side
// (queryTransaction for M-Pesa, verifyTransaction for Paystack) before
// giving up, the same way the webhooks do, using the same atomic
// completion path so a late-arriving webhook can never race this job.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, templates, subscribers } from "@/db/schema";
import { and, eq, lt, sql } from "drizzle-orm";
import { queryTransaction } from "@/lib/mpesa";
import { verifyTransaction } from "@/lib/paystack";
import { completeOrderByGatewayRequestId, completeOrder } from "@/lib/orders";
import { generateDownloadToken, getTokenExpiry } from "@/lib/tokens";
import { sendPurchaseConfirmation } from "@/services/emails";

// Atomic pending → expired transition, mirroring the guard pattern in
// lib/orders.ts markOrderFailed — Postgres decides the outcome, never a
// blind write, so this can never clobber an order a webhook just completed.
async function markOrderExpired(orderId: string) {
  await db
    .update(orders)
    .set({ paymentStatus: "expired" })
    .where(and(eq(orders.id, orderId), eq(orders.paymentStatus, "pending")));
}

// Mirrors the "still being processed" check in the M-Pesa webhook — never
// expire an order Daraja itself says is still in flight.
function isStillProcessing(query: any): boolean {
  const desc = (query?.ResultDesc ?? query?.ResponseDescription ?? "").toString().toLowerCase();
  const code = (query?.ResultCode ?? query?.ResponseCode ?? "").toString();
  return code === "500.001.1001" || desc.includes("still being processed");
}

async function finishSuccessfulOrder(order: typeof orders.$inferSelect, gatewayRef: string) {
  const token = generateDownloadToken();
  const expiresAt = getTokenExpiry();

  const { isNewCompletion } =
    order.paymentGateway === "mpesa"
      ? await completeOrderByGatewayRequestId(order.gatewayRequestId!, {
          gatewayRef,
          downloadToken: token,
          tokenExpiresAt: expiresAt,
        })
      : await completeOrder(order.checkoutSessionId, {
          gatewayRef,
          downloadToken: token,
          tokenExpiresAt: expiresAt,
        });

  if (!isNewCompletion) return; // webhook beat us to it — nothing more to do

  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, order.templateId!))
    .limit(1);

  await db
    .insert(subscribers)
    .values({ email: order.customerEmail, source: "purchase", templateId: order.templateId })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: { lastActiveAt: new Date(), totalPurchases: sql`${subscribers.totalPurchases} + 1` },
    });

  try {
    await sendPurchaseConfirmation({
      customerEmail: order.customerEmail,
      templateTitle: template?.title ?? "Your Template",
      downloadToken: token,
      expiresAt,
    });
  } catch (emailErr: any) {
    console.error("[CRON] Email failed for recovered order:", order.id, emailErr.message);
  }
}

export async function GET(req: NextRequest) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

  const staleOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.paymentStatus, "pending"), lt(orders.createdAt, thirtyMinsAgo)));

  let recoveredCount = 0;
  let expiredCount = 0;
  let stillPendingCount = 0;

  for (const order of staleOrders) {
    try {
      if (order.paymentGateway === "mpesa" && order.gatewayRequestId) {
        const query = await queryTransaction(order.gatewayRequestId);

        if (isStillProcessing(query)) {
          stillPendingCount++;
          continue; // leave pending, check again next hour
        }

        const confirmed = String(query?.ResponseCode) === "0" && Number(query?.ResultCode) === 0;
        if (confirmed) {
          const params = query?.ResultParameters?.ResultParameter;
          const receipt =
            (Array.isArray(params) && params.find((p: any) => p.Name === "MpesaReceiptNumber")?.Value) ||
            order.gatewayRequestId;
          await finishSuccessfulOrder(order, String(receipt));
          recoveredCount++;
        } else {
          await markOrderExpired(order.id);
          expiredCount++;
        }
      } else if (order.paymentGateway === "paystack") {
        try {
          const data = await verifyTransaction(order.checkoutSessionId);
          if (data?.status === "success") {
            await finishSuccessfulOrder(order, order.checkoutSessionId);
            recoveredCount++;
          } else {
            await markOrderExpired(order.id);
            expiredCount++;
          }
        } catch {
          // Paystack has no record of this reference at all — genuinely abandoned.
          await markOrderExpired(order.id);
          expiredCount++;
        }
      } else {
        // No gateway request id to verify against — nothing to check, expire it.
        await markOrderExpired(order.id);
        expiredCount++;
      }
    } catch (err: any) {
      // Verification call itself failed (network/auth) — leave pending, retry next hour.
      console.error("[CRON] Verification error for order", order.id, err.message);
      stillPendingCount++;
    }
  }

  return NextResponse.json({
    success: true,
    scanned: staleOrders.length,
    recovered: recoveredCount,
    expired: expiredCount,
    stillPending: stillPendingCount,
  });
}