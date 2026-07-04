"use client";

import { useState } from "react";
import { GameCard } from "@/components/game/GameDisplays";
import HorizontalScroller from "@/components/layout/HorizontalScroller";
import SubTabs from "@/components/layout/SubTabs";
import type { Game } from "@/lib/data/games";
import * as lookup from "@/lib/util/validate/lookup";

type RelatedGamesTabsProps = Readonly<{ franchiseGames: Game[]; seriesGames: Game[]; similarGames: Game[] }>;

export default function RelatedGamesTabs({ franchiseGames, seriesGames, similarGames }: RelatedGamesTabsProps) {
	const tabs = [
		{ id: "series" as const, label: "Series", games: seriesGames },
		{ id: "franchies" as const, label: "Franchise", games: franchiseGames },
		{ id: "similar" as const, label: "Similar Games", games: similarGames },
	].filter((tab) => tab.games.length > 0);

	const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? "similar");
	const activeGames = lookup.byKey(tabs, "id", activeTab)?.games ?? tabs[0]?.games ?? [];

	if (!tabs.length) {
		return null;
	}

	return (
		<SubTabs tabs={tabs} active={activeTab} setter={setActiveTab} hasViewAll={activeTab !== "similar"} shouldCompact>
			<HorizontalScroller className="mt-4 max-w-full gap-5 overflow-clip rounded-md">
				{activeGames.map((game) => (
					<GameCard key={game.id} game={game} size={160} effect="ripple" hover="name" hasHref={true} />
				))}
			</HorizontalScroller>
		</SubTabs>
	);
}
