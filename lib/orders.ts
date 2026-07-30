// lib/orders.ts
import { db } from "@/db";
import { orders, type NewOrder } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function upsertOrder(data: NewOrder) {
  const existing = await db
    .select()
    .from(orders)
    .where(eq(orders.checkoutSessionId, data.checkoutSessionId))
    .limit(1);

  if (existing.length > 0) {
    return { order: existing[0], isNew: false };
  }

  const [order] = await db.insert(orders).values(data).returning();
  return { order, isNew: true };
}

type CompletionUpdate = {
  gatewayRef: string;
  downloadToken: string;
  tokenExpiresAt: Date;
};

/**
 * Atomically flips a pending order to completed.
 * The "pending" guard lives in the WHERE clause itself, so Postgres — not
 * app code — decides which of two concurrent webhook deliveries wins.
 * Returns isNewCompletion: false if the row was already completed
 * (or didn't exist), so callers never double-send email/tokens.
 */
async function atomicComplete(
  whereClause: ReturnType<typeof eq>,
  updates: CompletionUpdate
) {
  const [updated] = await db
    .update(orders)
    .set({
      paymentStatus: "completed",
      gatewayRef: updates.gatewayRef,
      downloadToken: updates.downloadToken,
      tokenExpiresAt: updates.tokenExpiresAt,
    })
    .where(and(whereClause, eq(orders.paymentStatus, "pending")))
    .returning();

  if (!updated) {
    return { order: null, isNewCompletion: false };
  }
  return { order: updated, isNewCompletion: true };
}

export async function completeOrder(checkoutSessionId: string, updates: CompletionUpdate) {
  return atomicComplete(eq(orders.checkoutSessionId, checkoutSessionId), updates);
}

export async function completeOrderByGatewayRequestId(
  gatewayRequestId: string,
  updates: CompletionUpdate
) {
  return atomicComplete(eq(orders.gatewayRequestId, gatewayRequestId), updates);
}

export async function markOrderFailed(orderId: string) {
  await db
    .update(orders)
    .set({ paymentStatus: "failed" })
    .where(and(eq(orders.id, orderId), eq(orders.paymentStatus, "pending")));
}