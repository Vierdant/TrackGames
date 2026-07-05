/**
 * Shared, client-safe filter constants for the `/filter` page. Kept out of `games.ts` so the
 * client bundle (FilterPanel) does not pull in the Prisma/pg database client.
 */

/**
 * Boolean multiplayer-mode columns that can be filtered on, mapped to the human label shown by
 * `getMultiplayerFeatures`. Keeps the filter page and the game page in sync.
 */
export const MULTIPLAYER_FILTERS = {
	onlineCoop: "Online co-op",
	offlineCoop: "Offline co-op",
	lanCoop: "LAN co-op",
	campaignCoop: "Campaign co-op",
	dropIn: "Drop-in / drop-out",
	splitscreen: "Split screen",
} satisfies Record<string, string>;

export type MultiplayerFilterKey = keyof typeof MULTIPLAYER_FILTERS;
