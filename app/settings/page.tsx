import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bell, Download, LayoutGrid, Settings, Shield, UserIcon } from "lucide-react";
import Container from "@/app/components/layout/Container";
import ProfileBackground from "@/app/components/user/BackgroundView";
import ProfileHeader from "@/app/components/user/ProfileHeader";
import { getUser, getUserProviders, hasUserPassword, profileThemeStyle } from "@/lib/account/user";
import { auth } from "@/lib/auth";
import { absoluteUrl, DEFAULT_OG_IMAGE, metadataDescription, SITE_NAME } from "@/lib/metadata";
import { type PublicUser } from "@/lib/types";
import * as normalize from "@/lib/util/normalize";
import SettingsPanel from "./SettingsPanel";
import SettingsTabs from "./SettingsTabs";

type SearchPageProps = Readonly<{
	searchParams: Promise<{ tab?: string; edit?: string; saved?: string; error?: string }>;
}>;

const description = metadataDescription("Manage your TrackGames profile, privacy, widgets, preferences, imports, and account settings.");

export const metadata: Metadata = {
	title: "Settings",
	description,
	alternates: {
		canonical: absoluteUrl("/settings"),
	},
	openGraph: {
		title: `Settings | ${SITE_NAME}`,
		description,
		url: absoluteUrl("/settings"),
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
		title: `Settings | ${SITE_NAME}`,
		description,
		images: [DEFAULT_OG_IMAGE],
	},
	robots: {
		index: false,
		follow: false,
	},
};

export const SETTINGTABS: { id: string; label: string; icon: typeof UserIcon }[] = [
	{ id: "profile", label: "Profile", icon: UserIcon },
	{ id: "privacy", label: "Privacy", icon: Shield },
	{ id: "widgets", label: "Widgets", icon: LayoutGrid },
	{ id: "preferences", label: "Preferences", icon: Bell },
	{ id: "import", label: "Import", icon: Download },
	{ id: "account", label: "Account", icon: Settings },
];

export default async function SettingsPage({ searchParams }: SearchPageProps) {
	const params = await searchParams;
	const activeTab = normalize.value(params.tab, SETTINGTABS, "id", "profile");
	const session = await auth();
	if (!session?.user) redirect("/login");

	const profile = await getUser(session.user);
	if (!profile) redirect("/login");

	const hasPassword = await hasUserPassword(profile.email!);
	const accounts = activeTab === "account" ? await getUserProviders(profile.id) : [];
	const active = normalize.byKey(SETTINGTABS, "id", activeTab) ?? SETTINGTABS[0];

	return (
		<main className="relative z-0 flex-1" style={profileThemeStyle(profile.profileColor, profile.accentColor)}>
			<ProfileBackground src={profile.background} />

			<Container>
				<ProfileHeader isSettings={true} profile={profile as PublicUser} />

				<section className="relative z-10 bg-bg/95 py-5">
					<Container className="grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
						<SettingsTabs activeTab={activeTab} />

						<div className="min-w-0">
							{params.saved === "1" && (
								<div className="mb-4 rounded border border-success/40 bg-success/10 px-4 py-3 text-sm font-bold text-success">Settings saved.</div>
							)}
							{params.error && (
								<div className="mb-4 rounded border border-error/40 bg-error/10 px-4 py-3 text-sm font-bold text-error">{settingsErrorMessage(params.error)}</div>
							)}

							<div className="rounded bg-bg p-5">
								<div className="mb-5 flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-start md:justify-between">
									<div>
										<h2 className="text-2xl font-bold">{active.label}</h2>
									</div>
								</div>
								<SettingsPanel activeTab={activeTab} profile={profile} linkedProviders={accounts.map((account) => account.provider)} hasPassword={hasPassword} />
							</div>
						</div>
					</Container>
				</section>
			</Container>
		</main>
	);
}

function settingsErrorMessage(error: string) {
	switch (error) {
		case "duplicate":
			return "That username or email is already in use.";
		case "invalid-username":
			return "Use 1-32 letters, numbers, underscores, or hyphens.";
		case "invalid-password":
			return "Enter matching passwords with at least 8 characters.";
		case "current-password":
			return "Your current password was incorrect.";
		case "email-required":
			return "Add an email before setting a password.";
		case "last-login":
			return "Add another login method before unlinking that provider.";
		case "invalid-provider":
			return "That provider could not be linked.";
		default:
			return "Some settings were invalid. Check the fields and try again.";
	}
}
