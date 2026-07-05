"use client";

import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import Tabs from "@/components/layout/Tabs";

type ProfileSwitcherPanelProps = Readonly<{ user: string; defaultTab: string; children: ReactNode }>;

export default function ProfileSwitcherPanel({ user, defaultTab, children }: ProfileSwitcherPanelProps) {
	const router = useRouter();

	const tabs = [
		{ id: "profile" as const, label: "Profile" },
		{ id: "activity" as const, label: "Activity" },
		{ id: "playlists" as const, label: "Playlists" },
	];

	function setTab(tab: string) {
		router.push(`/u/${user}?tab=${tab}`);
		setActiveTab(tab);
	}

	const [activeTab, setActiveTab] = useState(defaultTab);

	return (
		<Tabs tabs={tabs} active={activeTab} onSelect={setTab} responsive="compact">
			{children}
		</Tabs>
	);
}
