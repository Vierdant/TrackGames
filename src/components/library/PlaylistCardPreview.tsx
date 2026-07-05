"use client";

import Image from "next/image";
import Link from "next/link";
import { NotebookText } from "lucide-react";
import { GameEntryHoverOverlay, GameEntryStatusBadge } from "@/components/game/GameEntryStats";
import StarRating from "@/components/game/StarRating";
import type { UserLibraryEntryWithTags } from "@/lib/data/library";
import { ImageIdToURL } from "@/lib/external/igdb/util";
import { ratingToFive } from "@/lib/util/format/rating";

type PlaylistCardPreviewProps = Readonly<{
	entry: UserLibraryEntryWithTags;
	mode: "grid" | "list";
	onTileClick: (event: React.MouseEvent) => void;
}>;

export default function PlaylistCardPreview({ entry, mode, onTileClick }: PlaylistCardPreviewProps) {
	const game = entry.game;
	const src = ImageIdToURL(game.cover ?? undefined);
	const hasNotes = Boolean(entry.notes?.trim());

	if (mode === "grid") {
		return (
			<div className="animate-content-in group relative min-w-0 overflow-hidden rounded border border-border bg-bg-secondary">
				<Link href={`/game/${game.slug}`} onClick={onTileClick} className="block">
					<div className="relative aspect-5/7 bg-bg">
						{src && <Image src={src} alt={game.name ?? "game cover"} fill sizes="160px" className="object-cover" />}
						{hasNotes && (
							<span className="absolute top-2 right-2 z-elevated grid size-7 place-items-center rounded bg-bg-secondary/90 text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
								<NotebookText size={15} aria-hidden="true" />
							</span>
						)}
						<GameEntryHoverOverlay name={game.name ?? ""} entry={entry} />
					</div>
				</Link>
			</div>
		);
	}

	return (
		<Link href={`/game/${game.slug}`} onClick={onTileClick} className="flex min-w-0 flex-row items-center gap-2 border-border p-2 not-last:border-b md:gap-4">
			<div className="relative h-18 w-12 shrink-0 overflow-hidden rounded bg-bg md:h-20 md:w-14">
				{src && <Image src={src} alt={game.name ?? "game cover"} fill sizes="56px" className="object-cover" />}
			</div>
			<div className="min-w-0 flex-1">
				<div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 text-xs text-text-muted md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4">
					<p className="hidden truncate text-sm font-bold text-text md:block">{game.name}</p>
					<GameEntryStatusBadge entry={entry} className="md:justify-end" />
					<span className="hidden min-w-18 justify-end md:flex">
						<StarRating rating={ratingToFive(entry.rating ?? 0)} />
					</span>
					<span className="justify-self-end font-bold text-text md:hidden">{(ratingToFive(entry.rating ?? 0) ?? 0).toFixed(1)}/5</span>
					<span className="justify-self-end text-right md:hidden">{entry.timePlayed === null ? "No time" : `${entry.timePlayed}h`}</span>
					<span className="grid size-7 place-items-center justify-self-end md:size-8">
						{hasNotes && <NotebookText size={16} className="text-text-muted" aria-hidden="true" />}
					</span>
					<span className="hidden min-w-16 text-right md:block">{entry.timePlayed === null ? "No time" : `${entry.timePlayed}h`}</span>
				</div>
			</div>
		</Link>
	);
}
