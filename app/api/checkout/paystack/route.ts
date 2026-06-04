import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates } from "@/db/schema"
import { eq } from "drizzle-orm"
import { initializeTransaction } from "@/lib/paystack"

export async function POST(req: NextRequest) {
  try {
    const { email, amount, templateId, checkoutSessionId, templateSlug } = await req.json()

    if (!email?.includes("@")) {
      return NextResponse.json({ message: "Valid email required" }, { status: 400 })
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 })
    }

    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1)

    if (!template || !template.isPublished) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 })
    }

    // STEP 1: Call Paystack FIRST (before touching DB)
    let authorization_url: string
    try {
      const result = await initializeTransaction({
        email,
        amount: Math.round(amount * 100), // Convert to cents/kobo
        reference: checkoutSessionId,
        metadata: { templateId, templateSlug, templateTitle: template.title },
        channels: ["card"],
      })
      authorization_url = result.authorization_url
    } catch (err: any) {
      console.error("[PAYSTACK INIT ERROR]", err.message)
      return NextResponse.json(
        { message: `Paystack error: ${err.message}` },
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
        currency: "USD",
        paymentGateway: "paystack",
        paymentStatus: "pending",
      })
    } catch (err: any) {
      if (err.code === "23505") {
        return NextResponse.json(
          { message: "Checkout already in progress." },
          { status: 409 }
        )
      }
      console.error("[PAYSTACK DB ERROR]", err.message)
      return NextResponse.json(
        { message: "Database error. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ authorization_url })
  } catch (err: any) {
    console.error("[PAYSTACK CHECKOUT ERROR]", err.message, err.stack)
    return NextResponse.json(
      { message: err.message || "Payment initiation failed" },
      { status: 500 }
    )
  }
}