import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { orders, templates } from "@/db/schema"
import { eq, and, desc, isNull } from "drizzle-orm"
import { regenerateToken } from "@/lib/tokens"
import { sendRecoverEmail } from "@/services/emails"
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
    const { email } = await req.json()

    if (!email?.includes("@")) {
      return NextResponse.json({ message: "Valid email required" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find most recent completed order for this email
    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.customerEmail, normalizedEmail),
          eq(orders.paymentStatus, "completed")
        )
      )
      .orderBy(desc(orders.createdAt))
      .limit(1)

    if (!order) {
      return NextResponse.json(
        { message: "No purchase found for this email." },
        { status: 404 }
      )
    }

    // Fetch template
    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, order.templateId!))
      .limit(1)

    // Check if current token is still valid and unused
    const now = new Date()
    const hasValidToken =
      order.downloadToken &&
      order.tokenExpiresAt &&
      order.tokenExpiresAt > now &&
      !order.tokenUsedAt

    let token: string
    let expiresAt: Date

    if (hasValidToken) {
      // Reuse existing valid token
      token = order.downloadToken!
      expiresAt = order.tokenExpiresAt!
    } else {
      // Generate new token (resets expiry and used_at)
      const regenerated = await regenerateToken(order.id)
      token = regenerated.token
      expiresAt = regenerated.expiresAt
    }

    // Send recovery email
    await sendRecoverEmail({
      customerEmail: normalizedEmail,
      templateTitle: template?.title ?? "Your Template",
      downloadToken: token,
      expiresAt,
    })

    return NextResponse.json({
      success: true,
      message: "A new download link has been sent to your email.",
    })
  } catch (err: any) {
    console.error("[RECOVER ERROR]", err)
    return NextResponse.json(
      { message: err.message || "Failed to process recovery request" },
      { status: 500 }
    )
  }
}
