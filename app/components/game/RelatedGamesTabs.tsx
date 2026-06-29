"use client";

import { useState } from "react";
import type { Game } from "@/lib/types";
import * as normalize from "@/lib/util/normalize";
import GameCard from "./GameCard";
import HorizontalScroller from "../layout/HorizontalScroller";
import SubTabs from "../layout/SubTabs";

type RelatedGamesTabsProps = Readonly<{ franchiesGames: Game[]; seriesGames: Game[]; similarGames: Game[] }>;

export default function RelatedGamesTabs({ franchiesGames, seriesGames, similarGames }: RelatedGamesTabsProps) {
	const tabs = [
		{ id: "series" as const, label: "Series", games: seriesGames },
		{ id: "franchies" as const, label: "Franchise", games: franchiesGames },
		{ id: "similar" as const, label: "Similar Games", games: similarGames },
	].filter((tab) => tab.games.length > 0);

	const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? "similar");
	const activeGames = normalize.byKey(tabs, "id", activeTab)?.games ?? tabs[0]?.games ?? [];

	if (!tabs.length) {
		return null;
	}

	return (
		<SubTabs tabs={tabs} active={activeTab} setter={setActiveTab} viewAll={activeTab !== "similar"} compact>
			<HorizontalScroller className="rounded-md overflow-clip gap-5 mt-4 max-w-full">
				{activeGames.map((game) => (
					<GameCard key={game.id} game={game} size={160} effect="ripple" hover="name" slugged={true} />
				))}
			</HorizontalScroller>
		</SubTabs>
	);
}
