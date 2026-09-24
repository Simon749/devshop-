// test-daraja-apis.js
require('dotenv').config()

const BASE_URL = "https://sandbox.safaricom.co.ke"

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64")
  
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  })
  const data = await res.json()
  return data.access_token
}

async function testStkPush() {
  const token = await getAccessToken()
  
  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: "174379",
      Password: "test",
      Timestamp: "20240101000000",
      TransactionType: "CustomerPayBillOnline",
      Amount: 1,
      PartyA: "254708374149",
      PartyB: "174379",
      PhoneNumber: "254708374149",
      CallBackURL: "https://example.com/callback",
      AccountReference: "test",
      TransactionDesc: "test",
    }),
  })

  const data = await res.json()
  console.log("Status:", res.status)
  console.log("Response:", JSON.stringify(data, null, 2))
  
  if (data.errorCode === "404.001.03") {
    console.log("\n❌ CONFIRMED: Your app is NOT subscribed to M-Pesa Express API")
    console.log("Go to: https://developer.safaricom.co.ke → My Apps → [Your App] → APIs → Subscribe to 'M-Pesa Express'")
  }
}

testStkPush()