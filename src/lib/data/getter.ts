/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from "react";
import { type PrismaClient } from "@prisma/client/extension";
import { fetchAPI } from "@/lib/external/igdb/igdb-api";
import type { MaybeArray } from "@/lib/types";

type ByIdResult<A extends MaybeArray<number>, T> = A extends number[] ? T[] : T | null;
type BySlugResult<A extends MaybeArray<string>, T> = A extends string[] ? T[] : T | null;

/** Fetches rows by id from the local DB, falling back to IGDB (and upserting) for any ids not found locally. Result order matches the input `ids` order. */
export async function getByIds<T>(ids: number[], select: object, database: PrismaClient, fetching: { endpoint: string; body: string }, formatter: (data: any) => T): Promise<T[]> {
	if (!ids.length) return [];

	const uniqueIds = Array.from(new Set(ids));
	const localData = (await database.findMany({
		where: { id: { in: uniqueIds } },
		select,
	})) as T[];

	const localIds = new Set(localData.map((entry) => (entry as any).id));
	const missingIds = uniqueIds.filter((id) => !localIds.has(id));

	fetching = {
		...fetching,
		body: fetching.body + `where id = (${missingIds.join(",")});` + " limit 500;",
	};

	const fallbackGames = missingIds.length ? await getFallback<T>(select, database, fetching, formatter) : [];

	const gamesById = new Map<number, T>();

	for (const game of [...localData, ...fallbackGames] as any) {
		if (typeof game.id === "number") {
			gamesById.set(game.id, game);
		}
	}

	return ids.map((id) => gamesById.get(id)).filter((game): game is T => Boolean(game));
}

/** Same as `getByIds` but keyed by slug. */
export async function getBySlugs<T>(
	slugs: string[],
	select: object,
	database: PrismaClient,
	fetching: { endpoint: string; body: string },
	formatter: (data: any) => T,
): Promise<T[]> {
	if (!slugs.length) return [];

	const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));
	if (!uniqueSlugs.length) return [];

	const localGames = (await database.findMany({
		where: { slug: { in: uniqueSlugs } },
		select,
	})) as T[];

	const localSlugs = new Set(localGames.map((entry) => (entry as any).slug));
	const missingSlugs = uniqueSlugs.filter((slug) => !localSlugs.has(slug));

	fetching = {
		...fetching,
		body: fetching.body + `where slug = (${missingSlugs.map((slug) => JSON.stringify(slug)).join(",")});` + " limit 500;",
	};

	const fallbackData = missingSlugs.length ? await getFallback<T>(select, database, fetching, formatter) : [];

	const gamesBySlug = new Map<string, T>();

	for (const game of [...localGames, ...fallbackData] as any) {
		if (game.slug) {
			gamesBySlug.set(game.slug, game);
		}
	}

	return slugs.map((slug) => gamesBySlug.get(slug)).filter((game): game is T => Boolean(game));
}

/**
 * Builds a `cache()`-wrapped getter for one Prisma model, backed by `getByIds`.
 * Accepts a single id or an array.
 */
export function makeGetById<T>(select: object, database: PrismaClient, fetching: { endpoint: string; body: string }, formatter: (data: any) => T) {
	return cache(async (id: MaybeArray<number>) => {
		const ids = Array.isArray(id) ? id : [id];
		const res = await getByIds(ids, select, database, fetching, formatter);
		return Array.isArray(id) ? res : (res[0] ?? null);
	}) as <A extends MaybeArray<number>>(id: A) => Promise<ByIdResult<A, T>>;
}

/** Same as `makeGetById` but keyed by slug, backed by `getBySlugs`. */
export function makeGetBySlug<T>(select: object, database: PrismaClient, fetching: { endpoint: string; body: string }, formatter: (data: any) => T) {
	return cache(async (slug: MaybeArray<string>) => {
		const slugs = Array.isArray(slug) ? slug : [slug];
		const res = await getBySlugs(slugs, select, database, fetching, formatter);
		return Array.isArray(slug) ? res : (res[0] ?? null);
	}) as <A extends MaybeArray<string>>(slug: A) => Promise<BySlugResult<A, T>>;
}

/** Fetches rows from IGDB and upserts them into the local DB, returning the saved rows. */
export async function getFallback<T>(select: object, database: PrismaClient, fetching: { endpoint: string; body: string }, formatter: (data: any) => T): Promise<T[]> {
	const fallbackData = await fetchAPI<any[]>(fetching.endpoint, fetching.body);

	const saved = await Promise.all(
		fallbackData.map((raw) => {
			const data = formatter(raw);

			return database.upsert({
				where: { id: (data as { id: number }).id! },
				update: data as any,
				create: data as any,
				select,
			} as any);
		}),
	);

	return saved as T[];
}
