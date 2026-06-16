import db from "../db";
import { GameListType } from "../generated/prisma/enums";
import { GameList } from "../types";

const playlistSelect = {
    id: true,
    userId: true,
    type: true,
    displayMode: true,
    tierLabels: true,
    tierColors: true,
    name: true,
    slug: true,
    description: true,
    image: true,
    background: true,
    color: true,
    accentColor: true,
    privacy: true,
    commentsHidden: true,
    createdAt: true,
    updatedAt: true,
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
            { position: "asc" as const },
            { addedAt: "asc" as const },
        ],
    },
};

export async function getUserPlaylists(userId: string): Promise<GameList[]> {
    return await db.gameList.findMany({
        where: {
            userId,
            type: GameListType.PLAYLIST,
        },
        select: playlistSelect,
        orderBy: {
            updatedAt: "desc",
        },
    }) as unknown[] as GameList[];
}

export async function getPlaylist(id: string): Promise<GameList | null> {
    return await db.gameList.findFirst({
        where: {
            id,
            type: GameListType.PLAYLIST,
        },
        select: playlistSelect,
    }) as unknown as GameList | null;
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
