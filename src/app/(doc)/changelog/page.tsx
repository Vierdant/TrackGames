import type { Metadata } from "next";
import ChangelogList from "@/components/doc/ChangelogList";
import { getChangelogs } from "@/lib/data/changelog";
import { absoluteUrl, DEFAULT_OG_IMAGE, metadataDescription, SITE_NAME } from "@/lib/util/metadata";

const description = metadataDescription("New features, improvements, and fixes shipped to TrackGames.");

export const metadata: Metadata = {
	title: "Changelog",
	description,
	alternates: {
		canonical: absoluteUrl("/changelog"),
	},
	openGraph: {
		title: `Changelog | ${SITE_NAME}`,
		description,
		url: absoluteUrl("/changelog"),
		siteName: SITE_NAME,
		type: "website",
		images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
	},
	twitter: {
		card: "summary_large_image",
		title: `Changelog | ${SITE_NAME}`,
		description,
		images: [DEFAULT_OG_IMAGE],
	},
};

export default async function ChangelogPage() {
	const entries = await getChangelogs();

	return (
		<div className="flex flex-col gap-8">
			<header className="flex flex-col gap-3 border-b border-border pb-6">
				<h1 className="text-3xl font-bold">Changelog</h1>
				<p className="text-sm text-text-muted">Everything new in TrackGames. Tap a release to see the details.</p>
			</header>

			<ChangelogList entries={entries} />
		</div>
	);
}
