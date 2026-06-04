import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, templates } from "@/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export async function GET() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (!userId || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 1. All-time revenue totals by currency ──
  const revenueTotals = await db
    .select({
      currency: orders.currency,
      gateway: orders.paymentGateway,
      total: sql<string>`SUM(${orders.amountPaid}::numeric)`,
    })
    .from(orders)
    .where(eq(orders.paymentStatus, "completed"))
    .groupBy(orders.currency, orders.paymentGateway);

  // ── 2. Daily revenue for last 30 days ──
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyRevenue = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`,
      currency: orders.currency,
      total: sql<string>`SUM(${orders.amountPaid}::numeric)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, "completed"),
        gte(orders.createdAt, thirtyDaysAgo)
      )
    )
    .groupBy(sql`DATE(${orders.createdAt})`, orders.currency)
    .orderBy(sql`DATE(${orders.createdAt})`);

  // ── 3. Top templates by download count ──
  const topTemplates = await db
    .select({
      id: templates.id,
      title: templates.title,
      slug: templates.slug,
      downloadCount: templates.downloadCount,
      category: templates.category,
    })
    .from(templates)
    .orderBy(desc(templates.downloadCount))
    .limit(5);

  // ── 4. Recent orders (last 10) ──
  const recentOrders = await db
    .select({
      id: orders.id,
      customerEmail: orders.customerEmail,
      amountPaid: orders.amountPaid,
      currency: orders.currency,
      paymentGateway: orders.paymentGateway,
      paymentStatus: orders.paymentStatus,
      createdAt: orders.createdAt,
      templateTitle: templates.title,
      templateSlug: templates.slug,
    })
    .from(orders)
    .leftJoin(templates, eq(orders.templateId, templates.id))
    .orderBy(desc(orders.createdAt))
    .limit(10);

  // ── 5. Order status counts ──
  const statusCounts = await db
    .select({
      status: orders.paymentStatus,
      count: sql<string>`COUNT(*)`,
    })
    .from(orders)
    .groupBy(orders.paymentStatus);

  return NextResponse.json({
    revenueTotals,
    dailyRevenue,
    topTemplates,
    recentOrders,
    statusCounts,
  });
}