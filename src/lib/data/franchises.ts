import db from "../db";
import { formatRawFranchise } from "../external/igdb/util";
import type { FranchiseModel } from "../generated/prisma/models/Franchise";
import type { MaybeArray } from "../types";
import { getByIds, getBySlugs } from "./getter";

export type Franchise = Pick<FranchiseModel, "id" | "slug" | "name" | "games">;

type DataResult<T extends MaybeArray<number>> = T extends number[] ? Franchise[] : Franchise | null;

type SlugResult<T extends string | string[]> = T extends string[] ? Franchise[] : Franchise | null;

const select = {
	id: true,
	slug: true,
	name: true,
	games: true,
};

const fetching = {
	endpoint: "franchises",
	body: `fields slug, name, games;`,
};

export async function getFranchise<T extends MaybeArray<number>>(id: T): Promise<DataResult<T>> {
	const ids = Array.isArray(id) ? id : [id];
	const res = await getByIds(ids as number[], select, db.franchise, fetching, formatRawFranchise);
	return (Array.isArray(id) ? res : (res[0] ?? null)) as DataResult<T>;
}

export async function getFranchiseBySlug<T extends string | string[]>(slug: T): Promise<SlugResult<T>> {
	const slugs = Array.isArray(slug) ? slug : [slug];
	const res = await getBySlugs(slugs as string[], select, db.franchise, fetching, formatRawFranchise);
	return (Array.isArray(slug) ? res : (res[0] ?? null)) as SlugResult<T>;
}
