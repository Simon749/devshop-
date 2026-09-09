import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates, subscribers } from "@/db/schema"
import { eq, sql} from "drizzle-orm"
import { generateDownloadToken, getTokenExpiry } from "@/lib/tokens"
import { sendPurchaseConfirmation } from "@/services/emails"
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";
  
  const { success } = await checkRateLimit(ip);
  if (!success) {
    return new Response("Too Many Requests", { status: 429 });
  }

  try {
    const { email, templateId, checkoutSessionId } = await req.json()

    if (!email?.includes("@")) {
      return NextResponse.json({ message: "Valid email required" }, { status: 400 })
    }

    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1)

    if (!template || !template.isPublished) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 })
    }

    // Verify it's actually free
    if (Number(template.priceUsd) !== 0 || Number(template.priceKes) !== 0) {
      return NextResponse.json({ message: "This template is not free" }, { status: 400 })
    }

    const token = generateDownloadToken()
    const expiresAt = getTokenExpiry()

    // Create completed order immediately for free templates
    await db.insert(orders).values({
      checkoutSessionId,
      customerEmail: email,
      templateId,
      amountPaid: "0.00",
      currency: "USD",
      paymentGateway: "paystack",
      paymentStatus: "completed",
      downloadToken: token,
      tokenExpiresAt: expiresAt,
    })

    // Upsert subscriber
    await db
      .insert(subscribers)
      .values({ email, source: "free_download", templateId })
      .onConflictDoUpdate({
        target: subscribers.email,
        set: {
          lastActiveAt: new Date(),
          totalDownloads: sql`${subscribers.totalDownloads} + 1`,
        },
      })

    // Send email
    await sendPurchaseConfirmation({
      customerEmail: email,
      templateTitle: template.title,
      downloadToken: token,
      expiresAt,
    })

    return NextResponse.json({ success: true, message: "Download link sent to your email" })
  } catch (err: any) {
    console.error("[FREE DOWNLOAD ERROR]", err)
    return NextResponse.json(
      { message: err.message || "Failed to process download" },
      { status: 500 }
    )
  }
}
