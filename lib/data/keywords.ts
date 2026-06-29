import db from "../db";
import { formatRawKeyword } from "../external/igdb/util";
import type { Keyword, MaybeArray } from "../types";
import { getByIds, getBySlugs } from "./getter";

type DataResult<T extends MaybeArray<number>> = T extends number[] ? Keyword[] : Keyword | null;

type SlugResult<T extends string | string[]> = T extends string[] ? Keyword[] : Keyword | null;

const select = {
    id: true,
    slug: true,
    name: true
}

const fetching = {
    endpoint: "keywords",
    body: `fields slug, name;`
}

export async function getKeyword<T extends MaybeArray<number>>(id: T): Promise<DataResult<T>> {
	const ids = Array.isArray(id) ? id : [id];
	const res = await getByIds(ids as number[], select, db.keyword, fetching, formatRawKeyword);
	return (Array.isArray(id) ? res : (res[0] ?? null)) as DataResult<T>;
}

export async function getKeywordBySlug<T extends string | string[]>(slug: T): Promise<SlugResult<T>> {
	const slugs = Array.isArray(slug) ? slug : [slug];
	const res = await getBySlugs(slugs as string[], select, db.keyword, fetching, formatRawKeyword);
	return (Array.isArray(slug) ? res : (res[0] ?? null)) as SlugResult<T>;
}

export async function searchKeywords(query: string): Promise<Keyword[]> {
    const search = query.trim();

    if (search.length < 2) return [];

    const [startsWith, contains] = await Promise.all([
        db.keyword.findMany({
            where: {
                name: {
                    startsWith: search,
                    mode: "insensitive",
                },
            },
            select,
            orderBy: { name: "asc" },
            take: 8,
        }),
        db.keyword.findMany({
            where: {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            select,
            orderBy: { name: "asc" },
            take: 16,
        }),
    ]);

    const keywords = new Map<number, Keyword>();

    for (const keyword of [...startsWith, ...contains]) {
        keywords.set(keyword.id, keyword);
    }

    return Array.from(keywords.values()).slice(0, 12);
}
