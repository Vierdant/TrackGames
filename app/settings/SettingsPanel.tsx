"use client";

import { type SecuredUser } from "@/lib/account/user";
import { updateUserSettings } from "@/lib/actions/settings";
import AccountSettingsForm from "./AccountSettingsForm";
import ImportSettingsForm from "./ImportSettingsForm";
import PreferencesSettingsForm from "./PreferencesSettingsForm";
import PrivacySettingsForm from "./PrivacySettingsForm";
import ProfileSettingsForm from "./ProfileSettingsForm";
import { SaveBar } from "./SettingsShared";
import WidgetsSettingsForm from "./WidgetsSettingsForm";

type SettingsPanelProps = Readonly<{ activeTab: string; profile: SecuredUser; linkedProviders: string[]; hasPassword: boolean }>;

export default function SettingsPanel({ activeTab, profile, linkedProviders, hasPassword }: SettingsPanelProps) {
	const action = updateUserSettings.bind(null, activeTab);

	return (
		<form action={action} className="flex flex-col gap-5">
			{activeTab === "profile" && <ProfileSettingsForm profile={profile} />}
			{activeTab === "privacy" && <PrivacySettingsForm profile={profile} />}
			{activeTab === "widgets" && <WidgetsSettingsForm profile={profile} />}
			{activeTab === "preferences" && <PreferencesSettingsForm profile={profile} />}
			{activeTab === "import" && <ImportSettingsForm />}
			{activeTab === "account" && <AccountSettingsForm profile={profile} linkedProviders={linkedProviders} hasPassword={hasPassword} />}

			<SaveBar />
		</form>
	);
}
