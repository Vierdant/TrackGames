"use client";

import { usePathname } from "next/navigation";
import { FileText, Heart, Info, Map, ScrollText, Shield } from "lucide-react";
import Tabs, { type Tab } from "@/components/layout/Tabs";
import { DOC_TABS } from "@/lib/constants";

const icons: Record<string, Tab["icon"]> = {
	about: Info,
	backing: Heart,
	changelog: ScrollText,
	roadmap: Map,
	privacy: Shield,
	terms: FileText,
};

export default function DocNav() {
	const pathname = usePathname();
	const tabs: Tab[] = DOC_TABS.map((tab) => ({ ...tab, icon: icons[tab.id] }));
	const active = DOC_TABS.find((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`))?.id ?? DOC_TABS[0].id;

	return <Tabs tabs={tabs} active={active} responsive="drawer" drawerTitle="Documentation" />;
}
