import type { Metadata } from "next";
import { absoluteUrl, DEFAULT_OG_IMAGE, metadataDescription, SITE_NAME } from "@/lib/util/metadata";

const description = metadataDescription("The terms of service for using TrackGames — your account, your content, and the ground rules.");

export const metadata: Metadata = {
	title: "Terms",
	description,
	alternates: {
		canonical: absoluteUrl("/terms"),
	},
	openGraph: {
		title: `Terms | ${SITE_NAME}`,
		description,
		url: absoluteUrl("/terms"),
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
		title: `Terms | ${SITE_NAME}`,
		description,
		images: [DEFAULT_OG_IMAGE],
	},
};

export default function TermsPage() {
	return (
		<div className="flex flex-col gap-8">
			<header className="flex flex-col gap-3 border-b border-border pb-6">
				<h1 className="text-3xl font-bold">Terms of Service</h1>
				<p className="text-sm text-text-muted">Last updated: June 27, 2026</p>
				<p className="text-text-muted">
					These terms are the agreement between you and TrackGames (&quot;we&quot;, &quot;us&quot;) for using the service. We&apos;ve tried to keep them readable. By
					creating an account or using TrackGames, you agree to these terms — if you don&apos;t agree, please don&apos;t use the service.
				</p>
			</header>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">1. Your Account</h2>
				<p className="text-text-muted">
					You&apos;re responsible for your account and for keeping your login secure. Give us accurate information when you sign up, and don&apos;t share your account or
					impersonate someone else. You must be at least 13 years old to use TrackGames. You&apos;re responsible for the activity that happens under your account.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">2. Acceptable Use</h2>
				<p className="text-text-muted">Keep it civil and keep it legal. When using TrackGames, you agree not to:</p>
				<ul className="flex flex-col gap-2 pl-5 text-text-muted">
					<li className="list-disc">Post content that&apos;s illegal, hateful, harassing, or infringes someone else&apos;s rights.</li>
					<li className="list-disc">Spam, scrape, overload, or otherwise abuse the service or its APIs.</li>
					<li className="list-disc">Attempt to break, probe, or bypass our security or access data that isn&apos;t yours.</li>
					<li className="list-disc">Use the service to impersonate others or misrepresent your affiliation.</li>
				</ul>
				<p className="text-text-muted">We may remove content or suspend accounts that break these rules.</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">3. Your Content</h2>
				<p className="text-text-muted">
					You keep ownership of the content you create — your reviews, notes, lists, comments, and profile. By posting it, you give us the permission we need to store and
					display it so the service can work (for example, showing your public list to other users). You&apos;re responsible for the content you post, and you confirm you
					have the right to post it.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">4. Game Data &amp; Intellectual Property</h2>
				<p className="text-text-muted">
					Game information, artwork, and imagery are provided by IGDB and belong to their respective owners. The TrackGames name, design, and software are ours. Nothing
					in these terms transfers ownership of those materials to you.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">5. Backing &amp; Payments</h2>
				<p className="text-text-muted">
					TrackGames is free to use. Backing the project is optional and mainly helps cover hosting and development. Backer perks may change over time, and paid support
					does not unlock or restrict access to your core account data. If we ever offer paid tiers, any billing terms will be shown clearly at checkout.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">6. Service Availability</h2>
				<p className="text-text-muted">
					We work to keep TrackGames running smoothly, but the service is provided &quot;as is&quot; and &quot;as available.&quot; We can&apos;t promise it will always be
					uninterrupted or error-free, and we may change, pause, or discontinue features. We recommend keeping your own backups of anything important to you.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">7. Limitation Of Liability</h2>
				<p className="text-text-muted">
					To the fullest extent allowed by law, TrackGames isn&apos;t liable for indirect, incidental, or consequential damages, or for any loss of data or profits
					arising from your use of the service. Some places don&apos;t allow certain limitations, so parts of this may not apply to you.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">8. Termination</h2>
				<p className="text-text-muted">
					You can stop using TrackGames and delete your account at any time. We may suspend or terminate accounts that violate these terms or the law. Some provisions —
					like content ownership and liability limits — naturally survive after your account ends.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">9. Changes To These Terms</h2>
				<p className="text-text-muted">
					We may update these terms as the service grows. When we make meaningful changes, we&apos;ll update the &quot;last updated&quot; date above. Continuing to use
					TrackGames after a change means you accept the revised terms.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">10. Contact</h2>
				<p className="text-text-muted">
					Questions about these terms? Get in touch from the{" "}
					<a href="/contact" className="text-primary hover:underline">
						contact page
					</a>
					.
				</p>
			</section>
		</div>
	);
}
