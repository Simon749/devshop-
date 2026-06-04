import { randomUUID } from "crypto"
import { db } from "@/db"
import { orders, templates } from "@/db/schema"
import { eq, and, isNull, gt } from "drizzle-orm"

const TOKEN_TTL_HOURS = 24
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export function generateDownloadToken(): string {
  return randomUUID()
}

export function getTokenExpiry(): Date {
  return new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000)
}

export function buildDownloadUrl(token: string): string {
  return `${APP_URL}/api/download?token=${token}`
}

export async function validateToken(token: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.downloadToken, token),
        gt(orders.tokenExpiresAt, new Date()),
        isNull(orders.tokenUsedAt)
      )
    )
    .limit(1)

  if (!order) return null

  // Fetch template for the ZIP key
  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, order.templateId!))
    .limit(1)

  return { order, template }
}

export async function consumeToken(token: string) {
  await db
    .update(orders)
    .set({ tokenUsedAt: new Date() })
    .where(eq(orders.downloadToken, token))
}

export async function regenerateToken(orderId: string) {
  const newToken = generateDownloadToken()
  const newExpiry = getTokenExpiry()

  await db
    .update(orders)
    .set({
      downloadToken: newToken,
      tokenExpiresAt: newExpiry,
      tokenUsedAt: null,
    })
    .where(eq(orders.id, orderId))

  return { token: newToken, expiresAt: newExpiry }
}
