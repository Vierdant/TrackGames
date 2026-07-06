import Redis from "ioredis";

const redis = globalThis.redisGlobal ?? createRedis();

declare global {
	// Reuse a single client across dev hot-reloads, mirroring the Prisma singleton.
	var redisGlobal: Redis | null | undefined;
}

function createRedis() {
	const url = process.env.REDIS_URL;
	if (!url) return null;

	const client = new Redis(url, {
		// Fail fast so callers can degrade gracefully instead of hanging when Redis is down.
		maxRetriesPerRequest: 1,
		enableOfflineQueue: false,
	});

	// Prevent an unhandled 'error' event from crashing the process; callers fail open.
	client.on("error", () => {});

	return client;
}

if (process.env.NODE_ENV !== "production") globalThis.redisGlobal = redis;

export default redis;
