import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "@/lib/logger";

const CACHE_DIR = path.join(process.cwd(), ".cache");

export async function readDiskCache<T>(key: string): Promise<T | null> {
	try {
		const file = path.join(CACHE_DIR, `${key}.json`);
		const raw = await fs.readFile(file, "utf-8");

		return JSON.parse(raw) as T;
	} catch (error: unknown) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") {
			return null;
		}

		logger.error("diskCache", "Corrupted cache: " + key, error);
		return null;
	}
}

export async function writeDiskCache<T>(key: string, data: T) {
	await fs.mkdir(CACHE_DIR, { recursive: true });
	const file = path.join(CACHE_DIR, `${key}.json`);
	await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}
