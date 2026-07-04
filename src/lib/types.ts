import type { UserRole } from "@/lib/generated/prisma/enums";

export enum WidgetType {
	STATS,
	GAMELIST,
	MARKDOWN,
}

export enum LinkType {
	LINK,
	COPY,
}

export enum MarkdownAlign {
	START,
	END,
	CENTER,
}

export type MaybeArray<T> = T | T[];

export type ActionResult = {
	error: string;
};

export type TrendingScore = {
	game_id: number;
	wantToPlay: number;
	playing: number;
	weightedScore: number;
};

export type PublicUser = {
	id: string;
	name: string;
	createdAt: Date;
	image?: string;
	background?: string;
	bio?: string;
	profileColor?: string | null;
	accentColor?: string | null;
	privacy: string;
	libraryPrivacy: string;
	logsPrivacy: string;
	activityPrivacy: string;
	playlistPrivacy: string;
	socials?: string;
	widgets?: string;
	commentsHidden: boolean;
	hideCommentsEverywhere: boolean;
	roles: UserRole[];
};

export type Widget = {
	id: string;
	type: WidgetType;
	title: string;
	visible: boolean;
	content: string;
	stats: string[];
	games: number[];
};

export type SocialLink = {
	id: string;
	platform: string;
	kind: LinkType;
	value: string;
};

export type MarkdownBlock =
	| {
			type: "markdown";
			align: MarkdownAlign;
			color?: string;
			content: string;
	  }
	| {
			type: "group";
			align?: MarkdownAlign;
			color?: string;
			href?: string;
			children: MarkdownBlock[];
	  }
	| {
			type: "image";
			src: string;
			alt: string;
			align?: MarkdownAlign;
			width?: number;
			height?: number;
			fit?: string;
			position?: string;
			rounded?: boolean;
	  }
	| {
			type: "video";
			src: string;
			poster?: string;
			align?: MarkdownAlign;
			width?: number;
			height?: number;
			rounded?: boolean;
	  }
	| {
			type: "grid";
			columns: number;
			gap: number;
			cells: MarkdownBlock[][];
	  };
