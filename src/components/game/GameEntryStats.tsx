import StarRating from "@/components/game/StarRating";
import type { GameStatus } from "@/lib/generated/prisma/enums";
import { formLabel, joinClass } from "@/lib/util/client/func";
import { gameStatusColorClasses } from "@/lib/util/format/gameStatus";
import { ratingToFive } from "@/lib/util/format/rating";

export type GameEntryStatsData = Readonly<{ status: GameStatus; rating: number | null; timePlayed: number | null }>;

export function GameEntryStatusBadge({ entry, className }: Readonly<{ entry: GameEntryStatsData; className?: string }>) {
	return (
		<span className={joinClass("flex min-w-0 items-center gap-2 capitalize", className)}>
			<span className={joinClass("size-2 shrink-0 rounded-full", gameStatusColorClasses(entry.status).dot)} aria-hidden="true" />
			<span className="truncate">{formLabel(entry.status)}</span>
		</span>
	);
}

export function GameEntryHoverOverlay({ name, entry }: Readonly<{ name: string; entry: GameEntryStatsData | null }>) {
	return (
		<div className="absolute inset-0 flex flex-col justify-end bg-bg/85 p-3 opacity-0 transition-opacity group-hover:opacity-100">
			<p className="truncate text-sm font-bold text-text">{name}</p>
			{entry && (
				<div className="mt-2 flex flex-col gap-2 text-xs text-text-muted">
					<GameEntryStatusBadge entry={entry} />
					<StarRating rating={ratingToFive(entry.rating)} />
					<span>{entry.timePlayed == null ? "" : `${entry.timePlayed}h`}</span>
				</div>
			)}
		</div>
	);
}
