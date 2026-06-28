import db from "../db";
import { formatRawGenre } from "../external/igdb/util";
import type { Genre, MaybeArray } from "../types";
import { getByIds, getBySlugs } from "./getter";

const select = {
    id: true,
    slug: true,
    name: true
}

const fetching = {
    endpoint: "genres",
    body: `fields slug, name;`
}

type DataResult<T extends MaybeArray<number>> = T extends number[] ? Genre[] : Genre | null;
type SlugResult<T extends string | string[]> = T extends string[] ? Genre[] : Genre | null;

export async function getGenre<T extends MaybeArray<number>>(id: T): Promise<DataResult<T>> {
	const ids = Array.isArray(id) ? id : [id];
	const res = await getByIds(ids as number[], select, db.genre, fetching, formatRawGenre);
	return (Array.isArray(id) ? res : (res[0] ?? null)) as DataResult<T>;
}

export async function getGenreBySlug<T extends string | string[]>(slug: T): Promise<SlugResult<T>> {
	const slugs = Array.isArray(slug) ? slug : [slug];
	const res = await getBySlugs(slugs as string[], select, db.genre, fetching, formatRawGenre);
	return (Array.isArray(slug) ? res : (res[0] ?? null)) as SlugResult<T>;
}
