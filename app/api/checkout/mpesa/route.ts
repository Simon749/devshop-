import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates } from "@/db/schema"
import { eq } from "drizzle-orm"
import { initiateStkPush, normalizePhone } from "@/lib/mpesa"

export async function POST(req: NextRequest) {
  try {
    const { email, phone, amount, templateId, checkoutSessionId } = await req.json()

    if (!email?.includes("@")) {
      return NextResponse.json({ message: "Valid email required" }, { status: 400 })
    }
    if (!phone) {
      return NextResponse.json({ message: "Phone number required" }, { status: 400 })
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    let normalizedPhone: string
    try {
      normalizedPhone = normalizePhone(phone)
    } catch (err: any) {
      return NextResponse.json({ message: err.message }, { status: 400 })
    }

    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1)

    if (!template || !template.isPublished) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 })
    }

    // STEP 1: Call M-Pesa FIRST (before touching DB)
    let checkoutRequestId: string
    try {
      const result = await initiateStkPush({
        phone: normalizedPhone,
        amount,
        orderId: checkoutSessionId,
      })
      checkoutRequestId = result.checkoutRequestId
    } catch (err: any) {
      console.error("[M-PESA STK ERROR]", err.message)
      return NextResponse.json(
        { message: err.message },
        { status: 502 }
      )
    }

    // STEP 2: Only save to DB after gateway success
    try {
      await db.insert(orders).values({
        checkoutSessionId,
        customerEmail: email,
        templateId,
        amountPaid: amount.toString(),
        currency: "KES",
        paymentGateway: "mpesa",
        paymentStatus: "pending",
        gatewayRequestId: checkoutRequestId,
      })
    } catch (err: any) {
      if (err.code === "23505") {
        return NextResponse.json(
          { message: "Checkout already in progress. Check your phone or email." },
          { status: 409 }
        )
      }
      console.error("[M-PESA DB ERROR]", err.message)
      return NextResponse.json(
        { message: "Database error. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      checkoutRequestId,
      message: "Check your phone for the M-Pesa prompt",
    })
  } catch (err: any) {
    console.error("[M-PESA CHECKOUT ERROR]", err.message, err.stack)
    return NextResponse.json(
      { message: err.message || "Payment initiation failed" },
      { status: 500 }
    )
  }
}