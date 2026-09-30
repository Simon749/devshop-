// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Guards against both "not set" and a literal placeholder value
// (e.g. copied from a .env.example and never replaced) — either
// case should disable rate limiting gracefully, not crash the build.
const isConfigured =
  !!upstashUrl &&
  !!upstashToken &&
  upstashUrl.startsWith("https://") &&
  !upstashUrl.includes("...");

let rateLimit: Ratelimit | null = null;

if (isConfigured) {
  const redis = new Redis({ url: upstashUrl, token: upstashToken });
  // 5 requests per minute per IP. Adjust as needed.
  rateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
  });
} else {
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN missing or invalid — " +
    "rate limiting is DISABLED (failing open). Set real Upstash credentials in your " +
    "environment to re-enable it. This should be fixed before real launch traffic."
  );
}

export async function checkRateLimit(ip: string) {
  if (!rateLimit) {
    // Fail open: allow the request rather than break checkout or the build.
    return { success: true, limit: 0, reset: 0, remaining: 0 };
  }
  const { success, limit, reset, remaining } = await rateLimit.limit(`ratelimit_${ip}`);
  return { success, limit, reset, remaining };
}