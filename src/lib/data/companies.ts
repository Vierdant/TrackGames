import db from "../db";
import { formatRawCompany } from "../external/igdb/util";
import type { CompanyModel } from "../generated/prisma/models/Company";
import type { MaybeArray } from "../types";
import { getByIds, getBySlugs } from "./getter";

export type Company = Partial<Pick<CompanyModel, "id" | "slug" | "name" | "logo" | "description" | "developed" | "published">>;

type DataResult<T extends MaybeArray<number>> = T extends number[] ? Company[] : Company | null;

type SlugResult<T extends string | string[]> = T extends string[] ? Company[] : Company | null;

const select = {
	id: true,
	slug: true,
	name: true,
	logo: true,
	description: true,
	developed: true,
	published: true,
};

const minifiedSelect = {
	id: true,
	slug: true,
	name: true,
};

const fetching = {
	endpoint: "companies",
	body: `fields slug, name, logo.image_id, description, developed, published;`,
};

export async function getCompany<T extends MaybeArray<number>>(id: T): Promise<DataResult<T>> {
	const ids = Array.isArray(id) ? id : [id];
	const res = await getByIds(ids as number[], select, db.company, fetching, formatRawCompany);
	return (Array.isArray(id) ? res : (res[0] ?? null)) as DataResult<T>;
}

export async function getCompanyBySlug<T extends string | string[]>(slug: T): Promise<SlugResult<T>> {
	const slugs = Array.isArray(slug) ? slug : [slug];
	const res = await getBySlugs(slugs as string[], select, db.company, fetching, formatRawCompany);
	return (Array.isArray(slug) ? res : (res[0] ?? null)) as SlugResult<T>;
}

export async function getMinifiedCompany<T extends MaybeArray<number>>(id: T): Promise<DataResult<T>> {
	const ids = Array.isArray(id) ? id : [id];
	const res = await getByIds(ids as number[], minifiedSelect, db.company, fetching, formatRawCompany);
	return (Array.isArray(id) ? res : (res[0] ?? null)) as DataResult<T>;
}

export async function getMinifiedCompanyBySlug<T extends string | string[]>(slug: T): Promise<SlugResult<T>> {
	const slugs = Array.isArray(slug) ? slug : [slug];
	const res = await getBySlugs(slugs as string[], minifiedSelect, db.company, fetching, formatRawCompany);
	return (Array.isArray(slug) ? res : (res[0] ?? null)) as SlugResult<T>;
}
