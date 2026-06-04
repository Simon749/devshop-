import { db } from "@/db";
import { orders, type NewOrder } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Idempotent order upsert.
 * If checkout_session_id already exists, return existing order (prevents double-write).
 * If not, insert new pending order.
 */
export async function upsertOrder(data: NewOrder) {
  // Check for existing order by idempotency key
  const existing = await db
    .select()
    .from(orders)
    .where(eq(orders.checkoutSessionId, data.checkoutSessionId))
    .limit(1);

  if (existing.length > 0) {
    return { order: existing[0], isNew: false };
  }

  // Insert new order
  const [order] = await db.insert(orders).values(data).returning();
  return { order, isNew: true };
}

/**
 * Mark order as completed — idempotent.
 * If already completed, return existing without side effects.
 */
export async function completeOrder(
  checkoutSessionId: string,
  updates: { gatewayRef: string; downloadToken: string; tokenExpiresAt: Date }
) {
  const existing = await db
    .select()
    .from(orders)
    .where(eq(orders.checkoutSessionId, checkoutSessionId))
    .limit(1);

  if (existing.length === 0) {
    throw new Error(`Order not found: ${checkoutSessionId}`);
  }

  const order = existing[0];

  // Already completed → idempotent no-op
  if (order.paymentStatus === "completed") {
    return { order, isNewCompletion: false };
  }

  const [updated] = await db
    .update(orders)
    .set({
      paymentStatus: "completed",
      gatewayRef: updates.gatewayRef,
      downloadToken: updates.downloadToken,
      tokenExpiresAt: updates.tokenExpiresAt,
    })
    .where(eq(orders.checkoutSessionId, checkoutSessionId))
    .returning();

  return { order: updated, isNewCompletion: true };
}
