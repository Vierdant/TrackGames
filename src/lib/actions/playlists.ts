"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { siteStats } from "@/lib/cache/resources";
import db from "@/lib/db";
import { ActivityType, GameListType, InteractionTargetType, NotificationType } from "@/lib/generated/prisma/enums";
import { inputError } from "@/lib/logger";
import { formDataString, formDataStrings } from "@/lib/util/parse/formData";

const displayModes = new Set(["GRID", "RANKING", "TIER"]);
const fallbackTiers = ["S", "A", "B", "C", "D"];
const fallbackTierColors = ["#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ef4444"];

async function getOwnedPlaylist(listId: string, userId: string) {
	const playlist = await db.gameList.findFirst({
		where: {
			id: listId,
			userId,
			type: GameListType.PLAYLIST,
		},
		select: {
			id: true,
			tierLabels: true,
			tierColors: true,
		},
	});

	if (!playlist) {
		throw new Error("Playlist not found.");
	}

	return playlist;
}

async function getOwnedList(listId: string, userId: string) {
	const list = await db.gameList.findFirst({
		where: {
			id: listId,
			userId,
		},
		select: {
			id: true,
			type: true,
			slug: true,
		},
	});

	if (!list) {
		throw new Error("List not found.");
	}

	return list;
}

function nullableText(value: FormDataEntryValue | null, max: number) {
	const text = formDataString(value).trim();
	return text ? text.slice(0, max) : null;
}

function color(value: FormDataEntryValue | null) {
	const text = formDataString(value).trim();
	return /^#[0-9a-f]{6}$/i.test(text) ? text : null;
}

function url(value: FormDataEntryValue | null) {
	const text = formDataString(value).trim();
	if (!text) return null;

	try {
		return new URL(text).protocol === "https:" ? text : null;
	} catch {
		return null;
	}
}

export async function createPlaylist(formData: FormData) {
	const userId = await getCurrentUserId();
	const name = formDataString(formData.get("name")).trim();
	const description = formDataString(formData.get("description")).trim();
	const displayMode = formDataString(formData.get("displayMode"), "GRID");
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { playlistPrivacy: true },
	});

	if (!name) {
		return inputError("Playlist name is required.");
	}

	const playlist = await db.gameList.create({
		data: {
			userId,
			type: GameListType.PLAYLIST,
			name,
			description: description || null,
			displayMode: displayModes.has(displayMode) ? displayMode : "GRID",
			privacy: user?.playlistPrivacy === "private" ? "private" : "public",
		},
		select: {
			id: true,
		},
	});

	await db.activity.create({
		data: {
			userId,
			type: ActivityType.CREATED_PLAYLIST,
			targetType: InteractionTargetType.GAME_LIST,
			targetId: playlist.id,
			listId: playlist.id,
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		},
	});

	const followers = await db.userFollow.findMany({
		where: {
			followingId: userId,
		},
		select: {
			followerId: true,
		},
	});

	if (followers.length) {
		await db.notification.createMany({
			data: followers.map((follow) => ({
				userId: follow.followerId,
				actorId: userId,
				type: NotificationType.FOLLOWING_CREATED_LIST,
				targetType: InteractionTargetType.GAME_LIST,
				targetId: playlist.id,
			})),
		});
	}

	siteStats.refresh().catch((error) => {
		throw new Error(error);
	});
	revalidatePath("/u/[user]", "page");
	redirect(`/playlist/${playlist.id}`);
}

export async function addGameToPlaylist(listId: string, formData: FormData) {
	const userId = await getCurrentUserId();
	const gameId = Number(formDataString(formData.get("gameId")));
	const requestedTier = formDataString(formData.get("tier")).trim();

	if (!Number.isInteger(gameId) || gameId <= 0) {
		throw new Error("Invalid game.");
	}

	const playlist = await getOwnedPlaylist(listId, userId);
	const tier = requestedTier || playlist.tierLabels[0] || "A";

	const lastEntry = await db.gameListEntry.findFirst({
		where: {
			listId,
		},
		orderBy: {
			position: "desc",
		},
		select: {
			position: true,
		},
	});

	const entry = await db.gameListEntry.upsert({
		where: {
			listId_gameId: {
				listId,
				gameId,
			},
		},
		update: {
			tier: tier || "A",
		},
		create: {
			listId,
			gameId,
			tier: tier || "A",
			position: (lastEntry?.position ?? 0) + 1,
		},
		select: {
			id: true,
			gameId: true,
		},
	});

	revalidatePath(`/playlist/${listId}`);
	return entry;
}

export async function removeGameFromPlaylist(listId: string, entryId: string) {
	const userId = await getCurrentUserId();

	await getOwnedPlaylist(listId, userId);

	await db.gameListEntry.deleteMany({
		where: {
			id: entryId,
			listId,
		},
	});

	revalidatePath(`/playlist/${listId}`);
}

export async function updatePlaylistEntry(listId: string, entryId: string, formData: FormData) {
	const userId = await getCurrentUserId();
	const position = Number(formDataString(formData.get("position")));
	const tier = formDataString(formData.get("tier")).trim();
	const playlist = await getOwnedPlaylist(listId, userId);

	await db.gameListEntry.update({
		where: {
			id: entryId,
			listId,
		},
		data: {
			position: Number.isInteger(position) && position > 0 ? position : null,
			tier: tier || playlist.tierLabels[0] || "A",
		},
	});

	revalidatePath(`/playlist/${listId}`);
}

export async function updatePlaylistDisplayMode(listId: string, formData: FormData) {
	const userId = await getCurrentUserId();
	const displayMode = formDataString(formData.get("displayMode"), "GRID");

	await getOwnedPlaylist(listId, userId);

	await db.gameList.update({
		where: {
			id: listId,
		},
		data: {
			displayMode: displayModes.has(displayMode) ? displayMode : "GRID",
		},
	});

	revalidatePath(`/playlist/${listId}`);
}

export async function updatePlaylistTiers(listId: string, formData: FormData) {
	const userId = await getCurrentUserId();
	const tiers = formData
		.getAll("tiers")
		.map((tier) => formDataString(tier).trim())
		.filter(Boolean)
		.slice(0, 12);
	const tierLabels = tiers.length ? tiers : fallbackTiers;
	const colors = formDataStrings(formData.getAll("colors")).map((color) => color.trim());
	const tierColors = tierLabels.map((_, index) => {
		const color = colors[index] || fallbackTierColors[index] || "#64748b";
		return /^#[0-9a-f]{6}$/i.test(color) ? color : fallbackTierColors[index] || "#64748b";
	});

	await getOwnedPlaylist(listId, userId);

	await db.$transaction([
		db.gameList.update({
			where: {
				id: listId,
			},
			data: {
				tierLabels,
				tierColors,
			},
		}),
		db.gameListEntry.updateMany({
			where: {
				listId,
				OR: [{ tier: null }, { tier: { notIn: tierLabels } }],
			},
			data: {
				tier: tierLabels[0],
			},
		}),
	]);

	revalidatePath(`/playlist/${listId}`);
}

export async function updateGameListSettings(listId: string, formData: FormData) {
	const userId = await getCurrentUserId();
	const list = await getOwnedList(listId, userId);
	const name = nullableText(formData.get("name"), 80);

	if (!name) {
		return inputError("Name is required.");
	}

	await db.gameList.update({
		where: {
			id: listId,
		},
		data: {
			name,
			description: nullableText(formData.get("description"), 500),
			image: url(formData.get("image")),
			background: url(formData.get("background")),
			color: color(formData.get("color")),
			accentColor: color(formData.get("accentColor")),
			privacy: formDataString(formData.get("privacy"), "public") === "private" ? "private" : "public",
			commentsHidden: formData.get("commentsHidden") === "on",
		},
	});

	if (list.type === GameListType.PLAYLIST) {
		revalidatePath(`/playlist/${list.id}`);
	} else {
		revalidatePath(`/library/${list.slug}`);
	}

	revalidatePath("/u/[user]", "page");
}

export async function deletePlaylist(listId: string) {
	const userId = await getCurrentUserId();
	const playlist = await db.gameList.findFirst({
		where: {
			id: listId,
			userId,
			type: GameListType.PLAYLIST,
		},
		select: {
			id: true,
			user: {
				select: {
					name: true,
				},
			},
		},
	});

	if (!playlist) {
		throw new Error("Playlist not found.");
	}

	const result = await db.gameList.deleteMany({
		where: {
			id: listId,
			userId,
			type: GameListType.PLAYLIST,
		},
	});

	if (result.count === 0) {
		throw new Error("Playlist not found.");
	}

	siteStats.refresh().catch((error) => {
		throw new Error(error);
	});
	revalidatePath(`/playlist/${playlist.id}`);
	revalidatePath("/u/[user]", "page");
	redirect(playlist.user.name ? `/u/${playlist.user.name}?tab=playlists` : "/");
}
