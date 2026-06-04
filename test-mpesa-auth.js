// test-mpesa-auth.js
require('dotenv').config()

const BASE_URL = "https://sandbox.safaricom.co.ke"

async function testAuth() {
  const key = process.env.MPESA_CONSUMER_KEY
  const secret = process.env.MPESA_CONSUMER_SECRET
  
  console.log("=== M-PESA AUTH TEST ===")
  console.log("Consumer Key prefix:", key?.slice(0, 8) + "...")
  console.log("Consumer Secret length:", secret?.length)
  console.log("BASE_URL:", BASE_URL)
  
  const auth = Buffer.from(`${key}:${secret}`).toString("base64")
  
  try {
    const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    })
    
    const data = await res.json()
    console.log("\nResponse status:", res.status)
    console.log("Response body:", JSON.stringify(data, null, 2))
    
    if (data.access_token) {
      console.log("\n✅ AUTH SUCCESS — Token received")
      console.log("Token prefix:", data.access_token.slice(0, 20) + "...")
    } else {
      console.log("\n❌ AUTH FAILED — No token in response")
      console.log("Error:", data.errorMessage || data.error_description || "Unknown")
    }
  } catch (err) {
    console.log("\n❌ FETCH ERROR:", err.message)
  }
}

testAuth()