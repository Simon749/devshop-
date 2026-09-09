// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 5 requests per minute per IP. Adjust as needed.
export const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});

export async function checkRateLimit(ip: string) {
  const { success, limit, reset, remaining } = await rateLimit.limit(`ratelimit_${ip}`);
  return { success, limit, reset, remaining };
}