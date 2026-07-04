"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";
import { getTagsForEntries, syncEntryTags } from "@/lib/data/library";
import db from "@/lib/db";
import { getOwnedGames, getSteamProfile } from "@/lib/external/steam/api";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ActivityType, GameStatus, InteractionTargetType } from "@/lib/generated/prisma/enums";
import { inputError } from "@/lib/logger";
import { chunked } from "@/lib/util/format/numbers";

type TgLibraryEntry = {
	game?: {
		id?: number;
		slug?: string | null;
	};
	status?: string;
	rating?: number | null;
	timePlayed?: number | null;
	timeMode?: string | null;
	timeFinished?: number | null;
	timeMastered?: number | null;
	notes?: string | null;
	favorite?: boolean;
	addedAt?: string | null;
	startedAt?: string | null;
	finishedAt?: string | null;
	masteredAt?: string | null;
	tags?: string[];
	logs?: {
		hours?: number;
		note?: string;
		skipRecap?: boolean;
		playedAt?: string | null;
		createdAt?: string | null;
	}[];
};

function gameSlug(name: string) {
	return name
		.trim()
		.toLowerCase()
		.replace(/[^\w]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function gameSlugs(name: string) {
	return Array.from(new Set([gameSlug(name), gameSlug(name.replace(/['’]/g, ""))].filter(Boolean)));
}

function dateFromBackup(value: string | null | undefined) {
	if (!value) return null;

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function numberFromBackup(value: number | null | undefined) {
	return Number.isFinite(value) ? value : null;
}

function getGameObject(item: TgLibraryEntry, gamesBySlug: Map<string, { slug: string; id: number }>, gamesById: Map<number, { id: number; slug: string }>) {
	const sluggedHolder = item.game?.slug ? gamesBySlug.get(item.game.slug) : null;
	return item.game?.id ? gamesById.get(item.game.id) : sluggedHolder;
}

async function importBackupEntryItem(
	tx: Prisma.TransactionClient,
	userId: string,
	item: TgLibraryEntry,
	gamesBySlug: Map<string, { slug: string; id: number }>,
	gamesById: Map<number, { id: number; slug: string }>,
) {
	const game = getGameObject(item, gamesBySlug, gamesById);
	const status = Object.values(GameStatus).includes(item.status as GameStatus) ? (item.status as GameStatus) : null;

	if (!game || !status) return null;

	return importBackupEntry(tx, userId, item, game, status);
}

async function importBackupEntry(tx: Prisma.TransactionClient, userId: string, item: TgLibraryEntry, game: { id: number; slug: string }, status: GameStatus) {
	item.timeMode = item.timeMode === "manual" ? "manual" : "logs";

	const entryData = {
		status,
		rating: numberFromBackup(item.rating),
		timePlayed: numberFromBackup(item.timePlayed),
		timeMode: item.timeMode,
		timeFinished: numberFromBackup(item.timeFinished),
		timeMastered: numberFromBackup(item.timeMastered),
		notes: item.notes?.trim() || null,
		favorite: Boolean(item.favorite),
		addedAt: dateFromBackup(item.addedAt) ?? undefined,
		startedAt: dateFromBackup(item.startedAt),
		finishedAt: dateFromBackup(item.finishedAt),
		masteredAt: dateFromBackup(item.masteredAt),
	};
	const entry = await tx.userGameEntry.upsert({
		where: {
			userId_gameId: {
				userId,
				gameId: game.id,
			},
		},
		update: entryData,
		create: {
			userId,
			gameId: game.id,
			...entryData,
		},
		select: {
			id: true,
		},
	});

	await tx.userGamePlayLog.deleteMany({
		where: {
			userId,
			entryId: entry.id,
		},
	});
	await tx.userGameEntryTag.deleteMany({
		where: {
			entryId: entry.id,
		},
	});

	const tagNames = Array.from(
		new Set(
			(item.tags ?? [])
				.map((tag) => tag.trim())
				.filter(Boolean)
				.map((tag) => tag.slice(0, 40)),
		),
	);

	const importedLogs = (item.logs ?? [])
		.filter((log) => Number.isFinite(log.hours) && log.hours! > 0)
		.map((log) => ({
			userId,
			entryId: entry.id,
			gameId: game.id,
			hours: log.hours!,
			note: log.note?.trim() || "Imported from .tg backup.",
			skipRecap: Boolean(log.skipRecap),
			playedAt: dateFromBackup(log.playedAt) ?? new Date(),
			createdAt: dateFromBackup(log.createdAt) ?? new Date(),
		}));

	if (importedLogs.length) {
		await tx.userGamePlayLog.createMany({
			data: importedLogs,
		});
	}

	return { entryId: entry.id, tagNames, logCount: importedLogs.length };
}

async function importSteamGameEntry(tx: Prisma.TransactionClient, userId: string, game: { id: number; hours: number }, playedAt: Date, skipImportedLogsRecap: boolean) {
	const current = await tx.userGameEntry.findUnique({
		where: {
			userId_gameId: {
				userId,
				gameId: game.id,
			},
		},
		select: {
			id: true,
			timePlayed: true,
		},
	});
	const currentHours = current?.timePlayed ?? 0;
	const hours = Math.round((game.hours - currentHours) * 10) / 10;

	const entry =
		current ??
		(await tx.userGameEntry.create({
			data: {
				userId,
				gameId: game.id,
				timePlayed: game.hours,
			},
			select: {
				id: true,
			},
		}));

	if (hours <= 0) {
		return { imported: !current };
	}

	if (current) {
		await tx.userGameEntry.update({
			where: {
				id: current.id,
			},
			data: {
				timePlayed: game.hours,
			},
		});
	}

	await tx.userGamePlayLog.create({
		data: {
			userId,
			entryId: entry.id,
			gameId: game.id,
			hours,
			note: "Imported from Steam.",
			skipRecap: skipImportedLogsRecap,
			playedAt,
		},
	});

	await tx.activity.create({
		data: {
			userId,
			type: ActivityType.LOGGED_GAME_PLAY,
			targetType: InteractionTargetType.GAME,
			targetId: String(game.id),
			gameId: game.id,
			message: "Imported from Steam.",
		},
	});

	return { imported: true };
}

export async function getSteamProfileImportPreview(steamId: string) {
	const id = steamId.trim();

	if (!/^\d{17}$/.test(id)) {
		return inputError("Enter a valid Steam profile ID.");
	}

	let profile;

	try {
		profile = await getSteamProfile(id);
	} catch {
		return inputError("Could not reach Steam. Try again later.");
	}

	if (!profile?.personaname) {
		return inputError("No Steam profile found for that ID.");
	}

	return {
		steamId: id,
		personaname: String(profile.personaname),
		profileurl: profile.profileurl,
		avatar: profile.avatarfull,
	};
}

export async function importSteamLibrary(steamId: string, skipImportedLogsRecap = true) {
	const id = steamId.trim();

	if (!/^\d{17}$/.test(id)) {
		return inputError("Enter a valid Steam profile ID.");
	}

	const userId = await getCurrentUserId();
	let ownedGames;

	try {
		ownedGames = await getOwnedGames(id);
	} catch {
		return inputError("Could not reach Steam. Try again later.");
	}

	if (!Array.isArray(ownedGames) || ownedGames.length === 0) {
		return { imported: 0, failed: [] as string[] };
	}

	const steamGames = new Map<string, { name: string; hours: number; slugs: string[] }>();

	for (const game of ownedGames as { name?: string; playtime_forever?: number }[]) {
		if (!game.name) continue;

		const slugs = gameSlugs(game.name);
		if (!slugs.length) continue;

		const hours = Math.round(((game.playtime_forever ?? 0) / 60) * 10) / 10;
		const existing = steamGames.get(slugs[0]);
		steamGames.set(slugs[0], {
			name: game.name,
			hours: Math.max(existing?.hours ?? 0, hours),
			slugs,
		});
	}

	const slugs = Array.from(new Set(Array.from(steamGames.values()).flatMap((game) => game.slugs)));
	const foundGames: { id: number; slug: string }[] = [];

	await chunked(slugs, 100, async (slugsChunk) => {
		foundGames.push(
			...(await db.game.findMany({
				where: {
					slug: {
						in: slugsChunk,
					},
				},
				select: {
					id: true,
					slug: true,
				},
			})),
		);
	});

	const foundBySlug = new Map(foundGames.map((game) => [game.slug, game]));
	const failed: string[] = [];
	const matchedGames = new Map<number, { id: number; hours: number }>();

	for (const steamGame of steamGames.values()) {
		const match = steamGame.slugs.map((slug) => foundBySlug.get(slug)).find(Boolean);

		if (!match) {
			failed.push(`${steamGame.name} (${steamGame.hours})`);
			continue;
		}

		const existing = matchedGames.get(match.id);
		matchedGames.set(match.id, {
			id: match.id,
			hours: Math.max(existing?.hours ?? 0, steamGame.hours),
		});
	}

	const matched = Array.from(matchedGames.values());
	const playedAt = new Date();
	let imported = 0;

	await chunked(matched, 50, async (matchedChunk) => {
		await db.$transaction(async (tx) => {
			for (const game of matchedChunk) {
				const result = await importSteamGameEntry(tx, userId, game, playedAt, skipImportedLogsRecap);
				if (result.imported) imported += 1;
			}
		});
	});

	revalidatePath("/library/[slug]", "page");
	revalidatePath("/u/[user]", "page");
	return { imported, failed };
}

export async function exportTgLibrary() {
	const userId = await getCurrentUserId();
	const user = await db.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			name: true,
		},
	});

	const entries = await db.userGameEntry.findMany({
		where: {
			userId,
		},
		select: {
			id: true,
			game: {
				select: {
					id: true,
					slug: true,
				},
			},
			status: true,
			rating: true,
			timePlayed: true,
			timeMode: true,
			timeFinished: true,
			timeMastered: true,
			notes: true,
			favorite: true,
			addedAt: true,
			startedAt: true,
			finishedAt: true,
			masteredAt: true,
			logs: {
				orderBy: {
					playedAt: "asc",
				},
				select: {
					hours: true,
					note: true,
					skipRecap: true,
					playedAt: true,
					createdAt: true,
				},
			},
		},
		orderBy: {
			addedAt: "asc",
		},
	});
	const entryTags = await getTagsForEntries(entries.map((entry) => entry.id));

	const now = new Date();
	const day = String(now.getDate()).padStart(2, "0");
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const year = now.getFullYear();
	const name =
		(user?.name ?? "TrackGames")
			.trim()
			.replace(/[^a-z0-9_-]+/gi, "-")
			.replace(/^-|-$/g, "") || "TrackGames";

	return {
		filename: `${name}-Library-${day}-${month}-${year}.tg`,
		data: JSON.stringify({
			version: 1,
			exportedAt: now.toISOString(),
			entries: entries.map((entry) => ({
				game: entry.game,
				status: entry.status,
				rating: entry.rating,
				timePlayed: entry.timePlayed,
				timeMode: entry.timeMode,
				timeFinished: entry.timeFinished,
				timeMastered: entry.timeMastered,
				notes: entry.notes,
				favorite: entry.favorite,
				addedAt: entry.addedAt.toISOString(),
				startedAt: entry.startedAt?.toISOString() ?? null,
				finishedAt: entry.finishedAt?.toISOString() ?? null,
				masteredAt: entry.masteredAt?.toISOString() ?? null,
				tags: (entryTags.get(entry.id) ?? []).map((tag) => tag.name),
				logs: entry.logs.map((log) => ({
					hours: log.hours,
					note: log.note,
					skipRecap: log.skipRecap,
					playedAt: log.playedAt.toISOString(),
					createdAt: log.createdAt.toISOString(),
				})),
			})),
		}),
	};
}

export async function importTgLibrary(contents: string) {
	const userId = await getCurrentUserId();
	let backup: { version?: number; entries?: TgLibraryEntry[] };

	try {
		backup = JSON.parse(contents);
	} catch {
		return inputError("Invalid .tg file.");
	}

	if (backup.version !== 1 || !Array.isArray(backup.entries)) {
		return inputError("Unsupported .tg file.");
	}

	const gameIds = Array.from(new Set(backup.entries.map((entry) => entry.game?.id).filter((id): id is number => Number.isInteger(id))));
	const slugs = Array.from(new Set(backup.entries.map((entry) => entry.game?.slug).filter((slug): slug is string => Boolean(slug))));
	const games = await db.game.findMany({
		where: {
			OR: [{ id: { in: gameIds } }, { slug: { in: slugs } }],
		},
		select: {
			id: true,
			slug: true,
		},
	});
	const gamesById = new Map(games.map((game) => [game.id, game]));
	const gamesBySlug = new Map(games.map((game) => [game.slug, game]));
	const entries = backup.entries;
	let imported = 0;
	let logs = 0;
	let skipped = 0;

	await chunked(entries, 50, async (entriesChunk) => {
		await db.$transaction(async (tx) => {
			const entryTagNames = new Map<string, string[]>();

			for (const item of entriesChunk) {
				const result = await importBackupEntryItem(tx, userId, item, gamesBySlug, gamesById);
				if (!result) {
					skipped += 1;
					continue;
				}

				if (result.tagNames.length > 0) {
					entryTagNames.set(result.entryId, result.tagNames);
				}

				imported += 1;
				logs += result.logCount;
			}

			await syncEntryTags(tx, userId, entryTagNames);
		});
	});

	revalidatePath("/library/[slug]", "page");
	revalidatePath("/u/[user]", "page");
	return { imported, logs, skipped };
}
