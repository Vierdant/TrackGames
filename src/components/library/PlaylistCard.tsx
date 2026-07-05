"use client";

import type { CSSProperties } from "react";
import GameEntryMenu from "@/components/game/GameEntryMenu";
import PlaylistCardPreview from "@/components/library/PlaylistCardPreview";
import type { UserLibraryEntryWithTags, ViewerGameEntry } from "@/lib/data/library";

type PlayListCardProps = Readonly<{
	entry: UserLibraryEntryWithTags;
	mode: "grid" | "list";
	canEdit: boolean;
	isLoggedIn: boolean;
	viewerEntry?: ViewerGameEntry | null;
	onUpdate: (entry: UserLibraryEntryWithTags) => void;
	onRemove: (entryId: string) => void;
	themeStyle?: CSSProperties;
}>;

export default function PlaylistCard({ entry, mode, canEdit, isLoggedIn, viewerEntry, onUpdate, onRemove, themeStyle }: PlayListCardProps) {
	const libraryEntry = canEdit ? entry : (viewerEntry ?? null);

	return (
		<GameEntryMenu
			gameId={entry.gameId}
			gameSlug={entry.game.slug}
			gameName={entry.game.name}
			gameCover={entry.game.cover}
			isLoggedIn={isLoggedIn}
			libraryEntry={libraryEntry}
			onLibraryChange={canEdit ? (updated) => updated && onUpdate(updated) : undefined}
			onRemoved={canEdit ? () => onRemove(entry.id) : undefined}
			themeStyle={themeStyle}
		>
			{(ctrl) => <PlaylistCardPreview entry={entry} mode={mode} onTileClick={ctrl.onTileClick} />}
		</GameEntryMenu>
	);
}
