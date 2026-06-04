// app/api/checkout/mpesa/status/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const checkoutRequestId = searchParams.get("checkoutRequestId")

  if (!checkoutRequestId) {
    return NextResponse.json({ message: "CheckoutRequestID required" }, { status: 400 })
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.gatewayRequestId, checkoutRequestId))
    .limit(1)

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 })
  }

  return NextResponse.json({
    status: order.paymentStatus, // "pending" | "completed" | "failed"
    orderId: order.id,
    downloadToken: order.paymentStatus === "completed" ? order.downloadToken : null,
  })
}