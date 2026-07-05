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
