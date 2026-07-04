import db from "@/lib/db";
import { GameListType } from "@/lib/generated/prisma/enums";

export async function getSiteStats() {
	const [games, users, libraries, playlists] = await Promise.all([
		db.game.count(),
		db.user.count(),
		db.gameList.count({
			where: {
				type: GameListType.LIBRARY,
			},
		}),
		db.gameList.count({
			where: {
				type: GameListType.PLAYLIST,
			},
		}),
	]);

	return {
		games,
		users,
		libraries,
		playlists,
	};
}
