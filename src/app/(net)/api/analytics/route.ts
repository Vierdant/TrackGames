import db from "@/lib/db";
import { logger } from "@/lib/logger";
import redis from "@/lib/redis";
import { rateLimit } from "@/lib/util/server/rateLimit";

const DAILY_TTL_SECONDS = 60 * 60 * 24 * 45;

const MAX_KEYS = 100;
const MAX_DELTA = 1000;
const KEY_PATTERN = /^(pageview|event):[\w\-/.:%~@]{1,190}$/;
const RATE_LIMIT = 120;
const RATE_WINDOW_SECONDS = 60;

export async function POST(request: Request) {
	const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
	const { allowed } = await rateLimit(`analytics:${ip}`, RATE_LIMIT, RATE_WINDOW_SECONDS);
	if (!allowed) return new Response(null, { status: 429 });

	let payload: unknown;

	try {
		const text = await request.text();
		if (text.length > 20000) return new Response(null, { status: 413 });
		payload = JSON.parse(text);
	} catch {
		return new Response(null, { status: 400 });
	}

	const events = (payload as { events?: unknown })?.events;
	if (!events || typeof events !== "object") return new Response(null, { status: 400 });

	const updates: { key: string; delta: number }[] = [];
	for (const [key, raw] of Object.entries(events as Record<string, unknown>)) {
		if (updates.length >= MAX_KEYS) break;
		if (!KEY_PATTERN.test(key)) continue;

		const delta = Math.floor(Number(raw));
		if (!Number.isFinite(delta) || delta < 1) continue;

		updates.push({ key, delta: Math.min(delta, MAX_DELTA) });
	}

	if (updates.length === 0) return new Response(null, { status: 204 });

	try {
		await db.$transaction(
			updates.map(({ key, delta }) =>
				db.analytics.upsert({
					where: { key },
					create: { key, value: BigInt(delta) },
					update: { value: { increment: BigInt(delta) } },
				}),
			),
		);
	} catch (error) {
		logger.error("analytics", "Failed to record analytics", error);
		return new Response(null, { status: 500 });
	}

	// Keep a daily pageview counter in Redis for the admin trend chart. Best-effort:
	// a cache outage must never fail the request.
	const dailyDelta = updates.reduce((sum, { key, delta }) => (key === "pageview:total" ? sum + delta : sum), 0);

	if (dailyDelta > 0 && redis) {
		const dayKey = `pageviews:day:${new Date().toISOString().slice(0, 10)}`;

		try {
			await redis.multi().incrby(dayKey, dailyDelta).expire(dayKey, DAILY_TTL_SECONDS, "NX").exec();
		} catch (error) {
			logger.warn("analytics", "Failed to record daily pageviews in Redis", error);
		}
	}

	return new Response(null, { status: 204 });
}
