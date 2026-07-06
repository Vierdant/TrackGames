import type { Metadata } from "next";
import { absoluteUrl, DEFAULT_OG_IMAGE, metadataDescription, SITE_NAME } from "@/lib/util/metadata";

const description = metadataDescription("How TrackGames handles account data, cookies, local storage, and third-party content.");

export const metadata: Metadata = {
	title: "Privacy",
	description,
	alternates: {
		canonical: absoluteUrl("/privacy"),
	},
	openGraph: {
		title: `Privacy | ${SITE_NAME}`,
		description,
		url: absoluteUrl("/privacy"),
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
		title: `Privacy | ${SITE_NAME}`,
		description,
		images: [DEFAULT_OG_IMAGE],
	},
};

export default function PrivacyPage() {
	return (
		<div className="flex flex-col gap-8">
			<header className="flex flex-col gap-3 border-b border-border pb-6">
				<h1 className="text-3xl font-bold">Privacy Policy</h1>
				<p className="text-sm text-text-muted">Last updated: June 27, 2026</p>
				<p className="text-text-muted">
					This policy explains what information TrackGames (&quot;we&quot;, &quot;us&quot;) collects, why we collect it, and the choices you have. We&apos;ve kept it
					plain-English on purpose — no lawyer-speak where we can avoid it. By creating an account or using the service, you agree to the practices described here.
				</p>
			</header>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">1. Information We Collect</h2>
				<p className="text-text-muted">To run your account and the service, we store the information you give us and the activity you create on the platform, including:</p>
				<ul className="flex flex-col gap-2 pl-5 text-text-muted">
					<li className="list-disc">Account details — your username, email address, and (if you use one) a hashed password.</li>
					<li className="list-disc">Profile content — your bio, avatar, background, colors, social links, and display preferences.</li>
					<li className="list-disc">Library activity — saved games, statuses, ratings, playtime, play logs, reviews, notes, tags, and playlists.</li>
					<li className="list-disc">Social activity — comments, likes, follows, and notifications.</li>
					<li className="list-disc">
						Sign-in providers — if you sign in with a third party (Google, GitHub, Twitch, or Discord), we store the link between your account and that provider.
					</li>
				</ul>
				<p className="text-text-muted">We do not sell your personal information, and we don&apos;t use it for advertising.</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">2. How We Use Your Information</h2>
				<p className="text-text-muted">
					We use the information above to provide and maintain your account, display your library and profile, deliver notifications, keep the service secure, and improve
					how it works. Content you choose to make public — such as a public profile, list, or comment — is visible to others according to the privacy settings you pick.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">3. Cookies &amp; Local Storage</h2>
				<p className="text-text-muted">
					We use essential authentication cookies so you can sign in and stay signed in. During sign-up with a third-party provider, we may also set a short-lived cookie
					so the registration flow can finish. These cookies are strictly necessary for the service to function.
				</p>
				<p className="text-text-muted">
					We store your theme preference (light or dark) in your browser&apos;s local storage so the interface stays the way you like it on future visits. This never
					leaves your device.
				</p>
				<p className="text-text-muted">We do not currently use analytics cookies, advertising cookies, or tracking pixels.</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">4. Third-Party Content &amp; Services</h2>
				<p className="text-text-muted">
					Game data and imagery are provided by IGDB. Some game pages may embed YouTube videos through YouTube&apos;s privacy-enhanced host. When third-party content
					loads, that provider may receive basic technical request information (such as your IP address) as a normal part of serving it. Their handling of that
					information is governed by their own privacy policies.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">5. Data Retention</h2>
				<p className="text-text-muted">
					We keep your information for as long as your account is active. Some activity records (such as recent-activity feeds) expire automatically over time. If you
					delete your account, we remove your associated personal data, except where we&apos;re required to keep certain records to comply with the law or resolve
					disputes.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">6. Your Choices &amp; Rights</h2>
				<p className="text-text-muted">You&apos;re in control of your data. You can, at any time:</p>
				<ul className="flex flex-col gap-2 pl-5 text-text-muted">
					<li className="list-disc">Adjust what&apos;s public or private from your profile and privacy settings.</li>
					<li className="list-disc">Edit or delete content you&apos;ve created, such as comments, lists, and library entries.</li>
					<li className="list-disc">Sign out to end your active session, or clear browser storage through your browser&apos;s controls.</li>
					<li className="list-disc">Request deletion of your account and associated data.</li>
				</ul>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">7. Children</h2>
				<p className="text-text-muted">TrackGames isn&apos;t directed at children under 13, and we don&apos;t knowingly collect personal information from them.</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">8. Changes To This Policy</h2>
				<p className="text-text-muted">
					We may update this policy as the service evolves. When we make meaningful changes, we&apos;ll update the &quot;last updated&quot; date above. Continuing to use
					TrackGames after a change means you accept the revised policy.
				</p>
			</section>

			<section className="flex flex-col gap-3">
				<h2 className="text-xl font-bold">9. Contact</h2>
				<p className="text-text-muted">
					Questions about privacy or your data? Reach out any time from the{" "}
					<a href="/contact" className="text-primary hover:underline">
						contact page
					</a>
					.
				</p>
			</section>
		</div>
	);
}
