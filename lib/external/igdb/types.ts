export type PopScoreEntry = {
	game_id: number;
	popularity_type: number;
	value: number;
	created_at: number;
};

export type RawGame = {
	id?: number;
	slug?: string;
	name?: string;
	summary?: string;
	total_rating?: number;
	total_rating_count?: number;
	first_release_date?: number;
	cover?: { image_id: string };
	screenshots?: { image_id: string }[];
	videos?: { video_id: string }[];
	platforms?: { id: number; name: string; slug: string }[];
	involved_companies?: { company: number; developer: boolean; publisher: boolean }[];
	genres?: { id: number; name: string; slug: string }[];
	franchises?: { id: number; name: string; slug: string; games: number[] }[];
	collections?: { id: number; name: string; slug: string; games: number[] }[];
	similar_games?: number[];
	standalone_expansions?: number[];
	dlcs?: number[];
	expanded_games?: number[];
	expansions?: number[];
	themes?: number[];
	player_perspectives?: { id: number; slug: string }[];
	multiplayer_modes?: number[];
	keywords?: number[];
	version_parent?: number;
	parent_game?: number;
	game_status?: number;
	game_type: number;
};

export type RawCollection = {
	id?: number;
	name?: string;
	slug?: string;
	games?: number[];
};

export type RawFranchise = {
	id?: number;
	name?: string;
	slug?: string;
	games?: number[];
};

export type RawGenre = {
	id?: number;
	name?: string;
	slug?: string;
};

export type RawPlatform = {
	id?: number;
	name?: string;
	slug?: string;
};

export type RawCompany = {
	id?: number;
	slug?: string;
	logo?: { image_id: string };
	name?: string;
	description?: string;
	developed?: number[];
	published?: number[];
};

export type RawKeyword = {
	id?: number;
	name?: string;
	slug?: string;
};

export type RawTheme = {
	id?: number;
	name?: string;
	slug?: string;
};

export type RawMultiplayerMode = {
	id?: number;
	campaigncoop?: boolean;
	dropin?: boolean;
	game?: number;
	lancoop?: boolean;
	offlinecoop?: boolean;
	offlinecoopmax?: number;
	offlinemax?: number;
	onlinecoop?: boolean;
	onlinecoopmax?: number;
	onlinemax?: number;
	platform?: number;
	splitscreen?: boolean;
};
