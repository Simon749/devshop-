// lib/paystack.ts

const BASE_URL = "https://api.paystack.co"

export async function initializeTransaction({
  email,
  amount,
  reference,
  metadata,
  channels = ["card"],
}: {
  email: string
  amount: number // in smallest currency unit (cents/kobo)
  reference: string
  metadata: Record<string, unknown>
  channels?: string[]
}) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY not configured")

  const res = await fetch(`${BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      reference,
      metadata,
      channels, // Card only
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      // NO currency field — let Paystack use account default (KES for you)
    }),
  })

  const data = await res.json()
  if (!data.status) throw new Error(data.message || "Paystack initialization failed")
  return data.data
}

export async function verifyTransaction(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY not configured")

  const res = await fetch(`${BASE_URL}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  })

  const data = await res.json()
  if (!data.status) throw new Error(data.message || "Verification failed")
  return data.data
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const crypto = require("crypto")
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex")
  return hash === signature
}