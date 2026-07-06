import "server-only";
import { logger } from "@/lib/logger";
import redis from "@/lib/redis";

type RateLimitResult = { allowed: boolean; remaining: number };

// Fixed-window per-key limiter backed by Redis. Fails open (allows the request) if
// Redis is unavailable so a cache outage never takes the site down.
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
	if (!redis) return { allowed: true, remaining: limit };

	const redisKey = `ratelimit:${key}`;

	try {
		const results = await redis.multi().incr(redisKey).expire(redisKey, windowSeconds, "NX").exec();
		const count = Number(results?.[0]?.[1] ?? 0);

		return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
	} catch (error) {
		logger.warn("ratelimit", "Redis unavailable, allowing request", error);
		return { allowed: true, remaining: limit };
	}
}
