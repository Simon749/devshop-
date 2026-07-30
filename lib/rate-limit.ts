// lib/rate-limit.ts
// In-memory fallback (fine for a single Vercel instance / low traffic MVP).
// Swap for Upstash Redis (@upstash/ratelimit) once traffic justifies it —
// this version resets on cold start and won't work across multiple instances.

const hits = new Map<string, { count: number; resetAt: number }>()

export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{ allowed: boolean }> {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { allowed: true }
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false }
  }

  entry.count++
  return { allowed: true }
}