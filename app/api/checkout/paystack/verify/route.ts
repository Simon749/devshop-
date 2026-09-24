import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates, subscribers } from "@/db/schema"
import { eq, sql} from "drizzle-orm"
import { verifyTransaction } from "@/lib/paystack"
import { completeOrder } from "@/lib/orders"
import { generateDownloadToken, getTokenExpiry } from "@/lib/tokens"
import { sendPurchaseConfirmation } from "@/services/emails"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const reference = searchParams.get("reference")

  if (!reference) {
    return NextResponse.json({ message: "Reference required" }, { status: 400 })
  }

  console.log("[PAYSTACK VERIFY] Starting verification for:", reference)

  try {
    // Find order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.checkoutSessionId, reference))
      .limit(1)

    if (!order) {
      console.log("[PAYSTACK VERIFY] Order not found:", reference)
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    console.log("[PAYSTACK VERIFY] Order found:", order.id, "status:", order.paymentStatus)

    // Already completed
    if (order.paymentStatus === "completed") {
      const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/download?token=${order.downloadToken}`
      return NextResponse.json({
        verified: true,
        message: "Payment already verified",
        downloadUrl,
      })
    }

    // Verify with Paystack
    console.log("[PAYSTACK VERIFY] Calling Paystack verify...")
    
    // verifyTransaction returns the inner data object directly (per your paystack.ts)
    const paystackData = await verifyTransaction(reference)
    console.log("[PAYSTACK VERIFY] Paystack response:", paystackData)

    // Check status directly on the returned data (not wrapped in .data)
    if (paystackData.status !== "success") {
      console.log("[PAYSTACK VERIFY] Paystack says not successful:", paystackData.status)
      await db
        .update(orders)
        .set({ paymentStatus: "failed" })
        .where(eq(orders.id, order.id))
      return NextResponse.json({ 
        verified: false, 
        message: "Payment verification failed" 
      }, { status: 400 })
    }

    // Verify amount
    const expectedAmount = Math.round(Number(order.amountPaid) * 100)
    if (paystackData.amount !== expectedAmount) {
      console.log("[PAYSTACK VERIFY] Amount mismatch:", expectedAmount, "vs", paystackData.amount)
      return NextResponse.json({ 
        verified: false, 
        message: "Amount mismatch" 
      }, { status: 400 })
    }

    // Complete order
    const token = generateDownloadToken()
    const expiresAt = getTokenExpiry()

    console.log("[PAYSTACK VERIFY] Completing order...")
    const { isNewCompletion } = await completeOrder(reference, {
      gatewayRef: reference,
      downloadToken: token,
      tokenExpiresAt: expiresAt,
    })

    if (!isNewCompletion) {
      const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/download?token=${order.downloadToken}`
      return NextResponse.json({
        verified: true,
        message: "Payment already processed",
        downloadUrl,
      })
    }

    console.log("[PAYSTACK VERIFY] Order completed, fetching template...")

    // Get template
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
    console.log("[PAYSTACK VERIFY] Sending email to:", order.customerEmail)
    console.log("[PAYSTACK VERIFY] RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY)
    console.log("[PAYSTACK VERIFY] RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL)

    try {
      const emailResult = await sendPurchaseConfirmation({
        customerEmail: order.customerEmail,
        templateTitle: template?.title ?? "Your Template",
        downloadToken: token,
        expiresAt,
      })
      console.log("[PAYSTACK VERIFY] Email sent successfully:", emailResult)
    } catch (emailErr: any) {
      console.error("[PAYSTACK VERIFY] Email failed:", emailErr.message)
      console.error("[PAYSTACK VERIFY] Full error:", emailErr)
      // Don't fail the request — user still gets download on success page
    }

    const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/download?token=${token}`

    return NextResponse.json({
      verified: true,
      message: "Payment verified successfully!",
      downloadUrl,
    })

  } catch (err: any) {
    console.error("[PAYSTACK VERIFY ERROR]", err.message)
    console.error("[PAYSTACK VERIFY STACK]", err.stack)
    return NextResponse.json(
      { verified: false, message: err.message || "Verification failed" },
      { status: 500 }
    )
  }
}