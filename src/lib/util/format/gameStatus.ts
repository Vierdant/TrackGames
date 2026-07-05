import { Bookmark, CheckCircle2, CirclePause, Heart, Trophy, XCircle } from "lucide-react";
import { GameStatus } from "@/lib/generated/prisma/enums";

export const GAME_STATUS_META: Record<GameStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
	[GameStatus.PLAYING]: { label: "Playing", icon: CheckCircle2, color: "primary" },
	[GameStatus.COMPLETED]: { label: "Completed", icon: Trophy, color: "success" },
	[GameStatus.PAUSED]: { label: "Paused", icon: CirclePause, color: "warning" },
	[GameStatus.DROPPED]: { label: "Dropped", icon: XCircle, color: "error" },
	[GameStatus.BACKLOG]: { label: "Backlog", icon: Bookmark, color: "secondary" },
	[GameStatus.WISHLIST]: { label: "Wishlist", icon: Heart, color: "secondary" },
};

const colorClasses: Record<string, { dot: string; className: string; activeClassName: string }> = {
	primary: { dot: "bg-primary", className: "border-primary text-primary", activeClassName: "border-primary bg-primary text-text-inverse" },
	success: { dot: "bg-success", className: "border-success text-success", activeClassName: "border-success bg-success text-text-inverse" },
	warning: { dot: "bg-warning", className: "border-warning text-warning", activeClassName: "border-warning bg-warning text-text-inverse" },
	error: { dot: "bg-error", className: "border-error text-error", activeClassName: "border-error bg-error text-text-inverse" },
	secondary: { dot: "bg-secondary", className: "border-secondary text-secondary", activeClassName: "border-secondary bg-secondary text-text-inverse" },
};

export function gameStatusColorClasses(status: GameStatus) {
	return colorClasses[GAME_STATUS_META[status].color] ?? { dot: "bg-text-faint", className: "border-text-faint text-text-muted", activeClassName: "bg-text-faint" };
}
