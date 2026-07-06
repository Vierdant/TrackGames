import { cachedResources } from "@/lib/cache/resources";

let started = false;

export async function startCacheJobs() {
	if (started) return;
	started = true;

	for (const resource of cachedResources) {
		await resource.hydrateFromStore();

		resource.refresh().catch(Error);

		setInterval(() => {
			resource.refresh().catch(Error);
		}, resource.ttlMs);
	}
}
