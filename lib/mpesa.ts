// src/lib/mpesa.ts

const BASE_URL = process.env.MPESA_ENV === "production" 
  ? "https://api.safaricom.co.ke" 
  : "https://sandbox.safaricom.co.ke"

// ── Phone Normalization ─────────────────────────────────────────────────────
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, "").replace(/^\+/, "")
  if (/^07\d{8}$/.test(cleaned)) return "254" + cleaned.slice(1)
  if (/^254[71]\d{8}$/.test(cleaned)) return cleaned
  throw new Error("Invalid phone number. Use 07XXXXXXXX or 2547XXXXXXXX")
}

// ── OAuth Token ─────────────────────────────────────────────────────────────
export async function getAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET")
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")

  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: { 
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(`M-Pesa auth failed: ${res.status}`)
  }

  const data = await res.json()
  if (!data.access_token) throw new Error("M-Pesa auth returned no token")
  return data.access_token
}

// ── STK Push ────────────────────────────────────────────────────────────────
export async function initiateStkPush({
  phone,
  amount,
  orderId,
}: {
  phone: string
  amount: number
  orderId: string
}) {
  const token = await getAccessToken()
  const shortcode = process.env.MPESA_SHORTCODE
  const passkey = process.env.MPESA_PASSKEY
  const callbackUrl = process.env.MPESA_CALLBACK_URL

  if (!shortcode || !passkey || !callbackUrl) {
    const missing = [
      !shortcode && "MPESA_SHORTCODE",
      !passkey && "MPESA_PASSKEY", 
      !callbackUrl && "MPESA_CALLBACK_URL",
    ].filter(Boolean)
    throw new Error(`Missing M-Pesa config: ${missing.join(", ")}`)
  }

  // Smart callback URL: use local tunnel for sandbox if production URL is set
  const isSandbox = process.env.MPESA_ENV !== "production"
  let effectiveCallbackUrl = callbackUrl
  
  if (isSandbox && callbackUrl.includes("devcraft.shop")) {
    // If testing locally with production callback, warn but still try
    console.warn("[M-PESA] Using production callback in sandbox. Callbacks won't reach localhost!")
    console.warn("[M-PESA] For local testing, run: npx ngrok http 3000")
    console.warn("[M-PESA] Then set MPESA_CALLBACK_URL=https://YOUR_NGROK.ngrok.io/api/webhooks/mpesa")
  }

  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14)
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64")

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(amount),
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: effectiveCallbackUrl,
    AccountReference: `DevCraft-${orderId.slice(0, 8)}`,
    TransactionDesc: "Template purchase",
  }

  console.log("[M-PESA STK] Sending request:", JSON.stringify(payload, null, 2))

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  console.log("[M-PESA STK] Response:", JSON.stringify(data, null, 2))

  if (!res.ok || data.ResponseCode !== "0") {
    const errorMap: Record<string, string> = {
      "404.001.03": "Daraja app not subscribed to M-Pesa Express API. Go to developer.safaricom.co.ke → My Apps → APIs → Enable M-Pesa Express",
      "404.001.04": "Invalid Shortcode — use the sandbox test shortcode (usually 174379)",
      "404.001.05": "Invalid Passkey — copy the exact passkey from your Daraja app",
      "404.001.25": "Callback URL unreachable — use ngrok for local testing",
    }
    const friendlyError = errorMap[data.errorCode] || data.errorMessage || data.ResponseDescription || "STK Push failed"
    throw new Error(friendlyError)
  }

  return {
    checkoutRequestId: data.CheckoutRequestID,
    merchantRequestId: data.MerchantRequestID,
  }
}

// ── Query Transaction ────────────────────────────────────────────────────────
export async function queryTransaction(checkoutRequestId: string) {
  const token = await getAccessToken()
  const shortcode = process.env.MPESA_SHORTCODE!
  const passkey = process.env.MPESA_PASSKEY!

  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14)
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64")

  const res = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  })

  return res.json()
}