import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"
import { verifyTransaction } from "@/lib/paystack"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json({ verified: false, message: "No reference provided" }, { status: 400 })
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.checkoutSessionId, reference))
      .limit(1)

    if (!order) {
      return NextResponse.json({ verified: false, message: "Order not found" }, { status: 404 })
    }

    // Already completed — return immediately
    if (order.paymentStatus === "completed") {
      return NextResponse.json({ verified: true, message: "Payment already confirmed" })
    }

    // Pending — verify with gateway
    if (order.paymentGateway === "paystack") {
      try {
        const paystackData = await verifyTransaction(reference)
        if (paystackData.status === "success") {
          return NextResponse.json({ verified: true, message: "Payment confirmed" })
        }
      } catch (err: any) {
        console.error("[VERIFY] Paystack verification failed:", err.message)
      }
    }

    // M-Pesa: if we got here, it's still pending (webhook hasn't fired yet)
    // The webhook handler will update status to "completed"
    if (order.paymentGateway === "mpesa") {
      return NextResponse.json({ 
        verified: false, 
        message: "M-Pesa payment is being processed. Check your phone and wait for the confirmation SMS." 
      })
    }

    return NextResponse.json({ verified: false, message: "Payment pending or failed" })
  } catch (err: any) {
    console.error("[VERIFY ERROR]", err)
    return NextResponse.json({ verified: false, message: "Verification error" }, { status: 500 })
  }
}