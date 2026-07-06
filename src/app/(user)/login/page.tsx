import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginClient from "@/app/(user)/login/LoginClient";
import Loading from "@/components/ui/Loading";
import { auth } from "@/lib/auth";
import { absoluteUrl, DEFAULT_OG_IMAGE, metadataDescription, SITE_NAME } from "@/lib/util/metadata";

const description = metadataDescription("Log in or create a TrackGames account to track your game library, playlists, ratings, and profile.");

export const metadata: Metadata = {
	title: "Log in",
	description,
	alternates: {
		canonical: absoluteUrl("/login"),
	},
	openGraph: {
		title: `Log in | ${SITE_NAME}`,
		description,
		url: absoluteUrl("/login"),
		siteName: SITE_NAME,
		type: "website",
		images: [
			{
				url: DEFAULT_OG_IMAGE,
				alt: SITE_NAME,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: `Log in | ${SITE_NAME}`,
		description,
		images: [DEFAULT_OG_IMAGE],
	},
	robots: {
		index: false,
		follow: false,
	},
};

export default async function Page() {
	const session = await auth();

	if (session?.user?.id) redirect("/");

	return (
		<Suspense fallback={<Loading />}>
			<main className="relative flex flex-1 items-center justify-center px-5 py-8 text-text sm:px-8">
				<div className="pointer-events-none absolute inset-0 bg-[url('/assets/games-bg-perped-rev.webp')] bg-cover bg-center" />
				<div className="pointer-events-none absolute inset-0 bg-bg/80" />
				<div className="pointer-events-none absolute inset-0 bg-linear-to-t from-bg via-bg/50 to-bg/20" />

				<section className="relative w-full max-w-md">
					<LoginClient />
				</section>
			</main>
		</Suspense>
	);
}
