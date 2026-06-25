import db from "../db";
import { GameListType, LikeTargetType } from "../generated/prisma/enums";
import type { GameListDefaultArgs, GameListGetPayload } from "../generated/prisma/models/GameList";

const playlistArgs = {
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
            orderBy: [
                { position: "asc" },
                { addedAt: "asc" },
            ],
        },
    },
} satisfies GameListDefaultArgs;

export type Playlist = GameListGetPayload<typeof playlistArgs>;
export type PlaylistEntry = Playlist["entries"][number];

type PlaylistAccess = {
    id: string;
    userId: string;
    privacy: string;
};

export async function getUserPlaylists(userId: string) {
    return await db.gameList.findMany({
        where: {
            userId,
            type: GameListType.PLAYLIST,
        },
        ...playlistArgs,
        orderBy: {
            updatedAt: "desc",
        },
    });
}

export async function getTopPlaylists() {
    const likedPlaylists = await db.like.groupBy({
        by: ["targetId"],
        where: {
            targetType: LikeTargetType.GAME_LIST,
        },
        _count: {
            _all: true,
        },
    });
    const topLikedPlaylists = likedPlaylists
        .sort((a, b) => b._count._all - a._count._all);
    const likedPlaylistIds = topLikedPlaylists.map((playlist) => playlist.targetId);
    const playlists = likedPlaylistIds.length ? await db.gameList.findMany({
        where: {
            id: {
                in: likedPlaylistIds,
            },
            type: GameListType.PLAYLIST,
            privacy: "public",
        },
        ...playlistArgs,
    }) : [];
    const orderedPlaylists = playlists
        .sort((a, b) => {
            const aLikes = likedPlaylists.find((playlist) => playlist.targetId === a.id)?._count._all ?? 0;
            const bLikes = likedPlaylists.find((playlist) => playlist.targetId === b.id)?._count._all ?? 0;

            return bLikes - aLikes;
        })
        .slice(0, 4);

    if (orderedPlaylists.length >= 4) return orderedPlaylists;

    const recentPlaylists = await db.gameList.findMany({
        where: {
            type: GameListType.PLAYLIST,
            privacy: "public",
            id: {
                notIn: orderedPlaylists.map((playlist) => playlist.id),
            },
        },
        ...playlistArgs,
        orderBy: {
            updatedAt: "desc",
        },
        take: 4 - orderedPlaylists.length,
    });

    return [...orderedPlaylists, ...recentPlaylists];
}

export async function getPlaylistAccess(id: string): Promise<PlaylistAccess | null> {
    return await db.gameList.findFirst({
        where: {
            id,
            type: GameListType.PLAYLIST,
        },
        select: {
            id: true,
            userId: true,
            privacy: true,
        },
    });
}

export async function getPlaylist(id: string) {
    return await db.gameList.findFirst({
        where: {
            id,
            type: GameListType.PLAYLIST,
        },
        ...playlistArgs,
    });
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
