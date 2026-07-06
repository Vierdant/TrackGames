import type { Metadata } from "next";
import PlansPanel from "@/components/doc/PlansPanel";
import { absoluteUrl, DEFAULT_OG_IMAGE, metadataDescription, SITE_NAME } from "@/lib/util/metadata";

const description = metadataDescription("Back TrackGames — compare the Free and Backer plans and help keep the project running.");

export const metadata: Metadata = {
	title: "Backing",
	description,
	alternates: {
		canonical: absoluteUrl("/backing"),
	},
	openGraph: {
		title: `Backing | ${SITE_NAME}`,
		description,
		url: absoluteUrl("/backing"),
		siteName: SITE_NAME,
		type: "website",
		images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
	},
	twitter: {
		card: "summary_large_image",
		title: `Backing | ${SITE_NAME}`,
		description,
		images: [DEFAULT_OG_IMAGE],
	},
};

export default function BackingPage() {
	return (
		<div className="flex flex-col gap-8">
			<header className="flex flex-col gap-3 border-b border-border pb-6">
				<h1 className="text-3xl font-bold">Backing</h1>
				<p className="text-sm text-text-muted">Free forever. Backing is an optional thank-you tier that helps keep the servers on.</p>
			</header>

			<PlansPanel />

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">Frequently asked</h2>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<h3 className="font-bold text-text">Do I lose anything if I don&apos;t back?</h3>
						<p className="text-sm text-text-muted">
							No. Every core feature — tracking, rating, playlists, imports — stays free. Backer perks are cosmetic and convenience extras.
						</p>
					</div>
					<div className="flex flex-col gap-1">
						<h3 className="font-bold text-text">Can I cancel?</h3>
						<p className="text-sm text-text-muted">Any time. Your library and data are yours and are never locked behind a plan.</p>
					</div>
					<div className="flex flex-col gap-1">
						<h3 className="font-bold text-text">Where does the money go?</h3>
						<p className="text-sm text-text-muted">Hosting, the game-data API, and time spent building the features you vote for on the roadmap.</p>
					</div>
				</div>
			</section>
		</div>
	);
}
