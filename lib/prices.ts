// src/lib/prices.ts
import { templates } from "@/db/schema"

type Template = typeof templates.$inferSelect

/**
 * Returns the effective price in the requested currency.
 * If the DB value is missing or zero, converts from the other currency.
 */
export function getEffectivePrice(
  template: Template,
  targetCurrency: "KES" | "USD",
  exchangeRate: number // KES per 1 USD (e.g. 129.51)
): { amount: number; wasConverted: boolean; sourceCurrency: "KES" | "USD" } {
  const kes = Number(template.priceKes)
  const usd = Number(template.priceUsd)

  if (targetCurrency === "KES") {
    if (kes > 0) {
      return { amount: kes, wasConverted: false, sourceCurrency: "KES" }
    }
    if (usd > 0 && exchangeRate > 0) {
      return {
        amount: Math.round(usd * exchangeRate), // round to whole KES
        wasConverted: true,
        sourceCurrency: "USD",
      }
    }
  }

  if (targetCurrency === "USD") {
    if (usd > 0) {
      return { amount: usd, wasConverted: false, sourceCurrency: "USD" }
    }
    if (kes > 0 && exchangeRate > 0) {
      return {
        amount: Number((kes / exchangeRate).toFixed(2)),
        wasConverted: true,
        sourceCurrency: "KES",
      }
    }
  }

  return { amount: 0, wasConverted: false, sourceCurrency: targetCurrency }
}

/** Format for display: KES 1,295 or $10.00 */
export function formatPrice(amount: number, currency: "KES" | "USD"): string {
  if (currency === "KES") {
    return `KES ${Math.round(amount).toLocaleString("en-KE")}`
  }
  return `$${amount.toFixed(2)}`
}