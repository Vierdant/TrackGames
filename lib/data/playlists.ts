import db from "../db";
import { GameListType } from "../generated/prisma/enums";
import type { GameListDefaultArgs, GameListGetPayload } from "../generated/prisma/models/GameList";
import type { UserGameEntryGetPayload } from "../generated/prisma/models/UserGameEntry";
import { getTagsForEntries } from "./library";

type PlaylistUserEntry = UserGameEntryGetPayload<{ select: typeof playlistUserEntrySelect }> & {
	tags: { id: string; name: string }[];
};

export type PlaylistEntry = PlaylistDisplayData["entries"][number] & {
	userEntry?: PlaylistUserEntry | null;
};

export type PlaylistData = Omit<PlaylistDisplayData, "entries"> & {
	entries: PlaylistEntry[];
};

export type PlaylistDisplayData = GameListGetPayload<typeof playlistInclude>;

const playlistInclude = {
	include: {
		user: {
			select: {
				id: true,
				name: true,
				image: true,
			},
		},
		entries: {
			include: {
				game: true,
			},
			orderBy: [{ position: "asc" }, { addedAt: "asc" }],
		},
	},
} satisfies GameListDefaultArgs;

const playlistUserEntrySelect = {
	id: true,
	gameId: true,
	status: true,
	rating: true,
	timePlayed: true,
	timeFinished: true,
	timeMastered: true,
	finishedAt: true,
	masteredAt: true,
} as const;

export async function getUserPlaylists(userId: string, privacy: "public" | "followers" | "private" = "public") {
	return await db.gameList.findMany({
		where: {
			userId,
			type: GameListType.PLAYLIST,
			privacy: privacy === "followers" ? { in: ["public", "followers"] } : privacy,
		},
		...playlistInclude,
		orderBy: {
			updatedAt: "desc",
		},
	});
}

export async function getTopLikedPlaylists() {
	const playlists = await db.gameList.findMany({
		...playlistInclude,
		take: 10,
		where: {
			type: GameListType.PLAYLIST,
		},
		orderBy: {
			likes: {
				_count: "desc",
			},
		},
	});

	return playlists as PlaylistDisplayData[];
}

export async function getPlaylist(id: string, viewerId?: string): Promise<PlaylistData | null> {
	const playlist = await db.gameList.findFirst({
		where: {
			id,
			type: GameListType.PLAYLIST,
		},
		...playlistInclude,
	});

	if (!playlist || !viewerId || !playlist.entries.length) return playlist;

	const libraryEntries = await db.userGameEntry.findMany({
		where: {
			userId: viewerId,
			gameId: {
				in: playlist.entries.map((entry) => entry.gameId),
			},
		},
		select: playlistUserEntrySelect,
	});
	const tags = await getTagsForEntries(libraryEntries.map((entry) => entry.id));
	const entriesByGame = new Map(
		libraryEntries.map((entry) => [
			entry.gameId,
			{
				...entry,
				tags: tags.get(entry.id) ?? [],
			},
		]),
	);

	return {
		...playlist,
		entries: playlist.entries.map((entry) => ({
			...entry,
			userEntry: entriesByGame.get(entry.gameId) ?? null,
		})),
	};
}

export async function getPlaylistLibraryCount(userId: string | undefined, gameIds: number[]) {
	if (!userId || !gameIds.length) return 0;

	return await db.userGameEntry.count({
		where: {
			userId,
			gameId: {
				in: gameIds,
			},
		},
	});
}
