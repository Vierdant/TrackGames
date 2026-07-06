import { logger } from "@/lib/logger";
import redis from "@/lib/redis";

const PREFIX = "cache:";

export type StoredEntry<T> = { data: T; updatedAt: number };

// Durable store for cached resources. Backed by Redis; entries are persisted
// without expiry so stale data is still served while a refresh runs in the
// background (stale-while-revalidate). Degrades to no-op if Redis is unavailable.

export async function readCache<T>(key: string): Promise<StoredEntry<T> | null> {
	if (!redis) return null;

	try {
		const raw = await redis.get(PREFIX + key);
		return raw ? (JSON.parse(raw) as StoredEntry<T>) : null;
	} catch (error) {
		logger.error("cache", "read failed for " + key, error);
		return null;
	}
}

export async function writeCache<T>(key: string, data: T) {
	if (!redis) return;

	try {
		const entry: StoredEntry<T> = { data, updatedAt: Date.now() };
		await redis.set(PREFIX + key, JSON.stringify(entry));
	} catch (error) {
		logger.error("cache", "write failed for " + key, error);
	}
}
