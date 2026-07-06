import { readCache, writeCache } from "@/lib/cache/store";
import { logger } from "@/lib/logger";

export default class CachedResource<T> {
	private data: T | null = null;
	private lastUpdated = 0;
	private isUpdating = false;

	constructor(
		private readonly options: {
			name: string;
			ttlMs: number;
			fetcher: () => Promise<T>;
			fallback: T;
		},
	) {}

	public get name() {
		return this.options.name;
	}

	public get ttlMs() {
		return this.options.ttlMs;
	}

	public get isExpired() {
		return Date.now() - this.lastUpdated > this.options.ttlMs;
	}

	public async hydrateFromStore() {
		const entry = await readCache<T>(this.options.name);

		if (entry != null) {
			this.data = entry.data;
			this.lastUpdated = entry.updatedAt;
		}
	}

	public async get(): Promise<T> {
		if (this.data === null) {
			await this.hydrateFromStore();
		}

		if ((this.data === null || this.isExpired) && !this.isUpdating) {
			this.refresh().catch((error) => logger.error("cache", `refresh failed for ${this.options.name}`, error));
		}

		return this.data ?? this.options.fallback;
	}

	public async refresh(): Promise<T> {
		if (this.isUpdating) {
			while (this.isUpdating) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			return this.data as T;
		}

		this.isUpdating = true;

		try {
			const freshData = await this.options.fetcher();

			this.data = freshData;
			this.lastUpdated = Date.now();

			await writeCache(this.options.name, freshData);

			return freshData;
		} finally {
			this.isUpdating = false;
		}
	}
}
