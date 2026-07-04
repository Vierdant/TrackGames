import { makeGetById, makeGetBySlug } from "@/lib/data/getter";
import db from "@/lib/db";
import { formatRawGenre } from "@/lib/external/igdb/util";
import type { GenreModel } from "@/lib/generated/prisma/models/Genre";

export type Genre = Pick<GenreModel, "id" | "slug" | "name">;

const select = {
	id: true,
	slug: true,
	name: true,
};

const fetching = {
	endpoint: "genres",
	body: `fields slug, name;`,
};

export const getGenre = makeGetById<Genre>(select, db.genre, fetching, formatRawGenre);

export const getGenreBySlug = makeGetBySlug<Genre>(select, db.genre, fetching, formatRawGenre);
