import db from "../db";
import { formatRawPlatform } from "../external/igdb/util";
import type { MaybeArray, Platform } from "../types";
import { getByIds, getBySlugs } from "./getter";

type DataResult<T extends MaybeArray<number>> = T extends number[] ? Platform[] : Platform | null;

type SlugResult<T extends string | string[]> = T extends string[] ? Platform[] : Platform | null;

const select = {
	id: true,
	slug: true,
	name: true,
};

const fetching = {
	endpoint: "platforms",
	body: `fields slug, name;`,
};

export async function getPlatform<T extends MaybeArray<number>>(id: T): Promise<DataResult<T>> {
	const ids = Array.isArray(id) ? id : [id];
	const res = await getByIds(ids as number[], select, db.platform, fetching, formatRawPlatform);
	return (Array.isArray(id) ? res : (res[0] ?? null)) as DataResult<T>;
}

export async function getPlatformBySlug<T extends string | string[]>(slug: T): Promise<SlugResult<T>> {
	const slugs = Array.isArray(slug) ? slug : [slug];
	const res = await getBySlugs(slugs as string[], select, db.platform, fetching, formatRawPlatform);
	return (Array.isArray(slug) ? res : (res[0] ?? null)) as SlugResult<T>;
}
