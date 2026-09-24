import { NextResponse } from "next/server"
import { getUsdToKesRate } from "@/lib/exchange-rate"

export async function GET() {
  try {
    const rate = await getUsdToKesRate()
    return NextResponse.json({ rate, currency: "KES" })
  } catch (err: any) {
    console.error("[EXCHANGE RATE API ERROR]", err)
    return NextResponse.json(
      { message: "Failed to fetch exchange rate", rate: 140 }, // Fallback
      { status: 500 }
    )
  }
}