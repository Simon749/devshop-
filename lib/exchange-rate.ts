// src/lib/exchange-rate.ts
// Fetches live USD→KES rate, caches for 6 hours

let cachedRate: { rate: number; fetchedAt: number } | null = null
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

export async function getUsdToKesRate(): Promise<number> {
  // Return cached if fresh
  if (cachedRate && Date.now() - cachedRate.fetchedAt < CACHE_TTL_MS) {
    console.log(`[EXCHANGE] Using cached rate: ${cachedRate.rate}`)
    return cachedRate.rate
  }

  // Try multiple free APIs for resilience
  const apis = [
    "https://api.exchangerate-api.com/v4/latest/USD",
    "https://open.er-api.com/v6/latest/USD",
  ]

  for (const url of apis) {
    try {
      const res = await fetch(url, { next: { revalidate: 21600 } })
      if (!res.ok) continue
      
      const data = await res.json()
      const rate = data.rates?.KES
      
      if (rate && rate > 100 && rate < 200) { // Sanity check: KES is ~128-145 per USD
        cachedRate = { rate, fetchedAt: Date.now() }
        console.log(`[EXCHANGE] Fetched fresh rate from ${url}: ${rate}`)
        return rate
      }
    } catch (err) {
      console.warn(`[EXCHANGE] Failed to fetch from ${url}:`, err)
      continue
    }
  }

  // Fallback: use cached even if stale, or hardcoded safe rate
  if (cachedRate) {
    console.warn(`[EXCHANGE] All APIs failed, using stale cached rate: ${cachedRate.rate}`)
    return cachedRate.rate
  }

  console.warn("[EXCHANGE] All APIs failed, no cache. Using fallback rate: 140")
  return 140 // Conservative fallback — adjust based on current market
}

export function calculateKesPrice(usdPrice: number, rate: number): number {
  // Round up to nearest 10 KES for clean pricing
  const raw = usdPrice * rate
  return Math.ceil(raw / 10) * 10
}

// Helper to refresh rate in background (call this in a cron job or on startup)
export async function refreshExchangeRate(): Promise<void> {
  await getUsdToKesRate()
}