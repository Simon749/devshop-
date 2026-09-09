import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, eq, lt } from "drizzle-orm";

export async function GET(req: NextRequest) {
  // 1. Protect the endpoint so only Vercel Cron (or you) can trigger it
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

  // 2. Find pending orders older than 30 minutes
  const staleOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, "pending"),
        lt(orders.createdAt, thirtyMinsAgo)
      )
    );

  let cleanedCount = 0;

  // 3. Process each stale order
  for (const order of staleOrders) {
    if (order.paymentGateway === "mpesa" && order.gatewayRequestId) {
      // TODO: In the next iteration, call queryTransaction(order.gatewayRequestId) here.
      // For now, safely expire them to prevent infinite pending state.
      await db
        .update(orders)
        .set({ paymentStatus: "expired" })
        .where(eq(orders.id, order.id));
      cleanedCount++;
    } else {
      await db
        .update(orders)
        .set({ paymentStatus: "expired" })
        .where(eq(orders.id, order.id));
      cleanedCount++;
    }
  }

  return NextResponse.json({ success: true, cleaned: cleanedCount });
}