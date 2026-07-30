// app/api/checkout/paystack/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { initializeTransaction } from "@/lib/paystack"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
    const limited = await checkRateLimit(`paystack-checkout:${ip}`, 5, 60)
    if (!limited.allowed) {
      return NextResponse.json({ message: "Too many attempts. Please wait a minute." }, { status: 429 })
    }

    // NOTE: no `amount` accepted from the client at all
    const { email, templateId, checkoutSessionId, templateSlug } = await req.json()

    if (!email?.includes("@")) {
      return NextResponse.json({ message: "Valid email required" }, { status: 400 })
    }
    if (!templateId || !checkoutSessionId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const [template] = await db
      .select()
      .from(templates)
      .where(and(eq(templates.id, templateId), eq(templates.isPublished, true)))
      .limit(1)

    if (!template) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 })
    }

    const amount = Number(template.priceUsd)
    if (amount <= 0) {
      return NextResponse.json({ message: "This template isn't payable via card" }, { status: 400 })
    }

    let authorization_url: string
    try {
      const result = await initializeTransaction({
        email,
        amount: Math.round(amount * 100), // Paystack wants smallest unit
        reference: checkoutSessionId,
        metadata: { templateId, templateSlug, templateTitle: template.title },
        channels: ["card"],
      })
      authorization_url = result.authorization_url
    } catch (err: any) {
      console.error("[PAYSTACK INIT ERROR]", err.message)
      return NextResponse.json({ message: `Paystack error: ${err.message}` }, { status: 502 })
    }

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
        return NextResponse.json({ message: "Checkout already in progress." }, { status: 409 })
      }
      console.error("[PAYSTACK DB ERROR]", err.message)
      return NextResponse.json({ message: "Database error. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ authorization_url })
  } catch (err: any) {
    console.error("[PAYSTACK CHECKOUT ERROR]", err.message, err.stack)
    return NextResponse.json({ message: "Payment initiation failed" }, { status: 500 })
  }
}