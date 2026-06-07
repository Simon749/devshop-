import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPriceCompact(priceUsd: number | string, priceKes: number | string, isKenyan: boolean): string {
  const usd = Number(priceUsd)
  const kes = Number(priceKes)
  if (usd === 0 && kes === 0) return "FREE"
  if (isKenyan) {
    return `KES ${kes.toLocaleString("en-KE")}`
  }
  return `$${usd.toFixed(2)}`
}

export function formatPrice(priceUsd: number | string, priceKes: number | string, isKenyan: boolean): string {
  const usd = Number(priceUsd)
  const kes = Number(priceKes)
  if (usd === 0 && kes === 0) return "FREE"
  if (isKenyan) {
    return `KES ${kes.toLocaleString("en-KE")}`
  }
  return `$${usd.toFixed(2)} USD`
}

export function formatKes(priceKes: number | string): string {
  const kes = Number(priceKes)
  if (kes === 0) return "FREE"
  return `KES ${kes.toLocaleString("en-KE")}`
}

export function formatUsd(priceUsd: number | string): string {
  const usd = Number(priceUsd)
  if (usd === 0) return "FREE"
  return `$${usd.toFixed(2)}`
}

export function detectKenyaMarket(headers?: Headers): boolean {
  const country = headers?.get("x-vercel-ip-country")
  if (country === "KE") return true

  if (typeof window !== "undefined") {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz.includes("Nairobi") || tz.includes("Mombasa")) return true
  }

  return false
}

export function formatExpiryTime(date: Date | string): string {
  const expiry = new Date(date)
  const now = new Date()
  const diffMs = expiry.getTime() - now.getTime()
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))

  if (diffHours <= 0) return "Expired"
  if (diffHours === 1) return "in 1 hour"
  if (diffHours < 24) return `in ${diffHours} hours`
  const diffDays = Math.ceil(diffHours / 24)
  if (diffDays === 1) return "in 1 day"
  return `in ${diffDays} days`
}