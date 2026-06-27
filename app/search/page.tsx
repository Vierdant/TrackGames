import type { Metadata } from "next";
import GameCard from "../components/game/GameCard";
import Container from "../components/layout/Container";
import { searchGames } from "@/lib/data/games";
import { absoluteUrl, DEFAULT_OG_IMAGE, metadataDescription, SITE_NAME } from "@/lib/metadata";

const description = metadataDescription("Search TrackGames for games to rate, track, and add to your library.");

export const metadata: Metadata = {
    title: "Search",
    description,
    alternates: {
        canonical: absoluteUrl("/search"),
    },
    openGraph: {
        title: `Search | ${SITE_NAME}`,
        description,
        url: absoluteUrl("/search"),
        siteName: SITE_NAME,
        type: "website",
        images: [{
            url: DEFAULT_OG_IMAGE,
            alt: SITE_NAME,
        }],
    },
    twitter: {
        card: "summary_large_image",
        title: `Search | ${SITE_NAME}`,
        description,
        images: [DEFAULT_OG_IMAGE],
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
    const params = await searchParams;
    const query = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim();
    const games = query.length >= 2 ? await searchGames(query, 32) : [];

    return (
        <main className="flex-1 bg-bg py-10 text-text">
            <Container className="flex flex-col gap-8">
                <header className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">Search</h1>
                    {query.length >= 2 ? (
                        <p className="text-sm text-text-muted">{games.length} result{games.length === 1 ? "" : "s"} for &quot;{query}&quot;</p>
                    ) : (
                        <p className="text-sm text-text-muted">Enter at least two characters to search games.</p>
                    )}
                </header>

                {query.length >= 2 && games.length === 0 ? (
                    <p className="rounded border border-border bg-bg-secondary p-4 text-sm text-text-muted">No games found.</p>
                ) : null}

                {games.length > 0 ? (
                    <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                        {games.map((game) => (
                            <div key={game.id} className="min-w-0">
                                <GameCard game={game} size={140} effect="ripple" hover="name" slugged={true} />
                            </div>
                        ))}
                    </div>
                ) : null}
            </Container>
        </main>
    );
}
