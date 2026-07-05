"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import MenuPanel from "@/components/ui/MenuPanel";
import { joinClass } from "@/lib/util/client/func";

export type Tab = { id: string; label: string; icon?: LucideIcon; href?: string };

type TabsProps = Readonly<{
	tabs: Tab[];
	active: string;
	onSelect?: (id: string) => void;
	responsive?: "compact" | "drawer";
	hasViewAll?: boolean;
	drawerTitle?: string;
	children?: ReactNode;
}>;

export default function Tabs({ tabs, active, onSelect, responsive, hasViewAll, drawerTitle, children }: TabsProps) {
	if (!tabs.length) {
		return null;
	}

	if (responsive === "drawer") {
		return <SidebarTabs tabs={tabs} active={active} drawerTitle={drawerTitle} />;
	}

	return (
		<div className="min-w-0">
			{responsive === "compact" && (
				<div className="mb-5 flex min-w-0 items-center gap-2 md:hidden">
					<nav className="flex min-w-0 flex-1 gap-1 overflow-hidden p-1" aria-label="Tabs">
						{tabs.map((tab) => {
							const isActive = tab.id === active;

							return (
								<button
									key={tab.id}
									type="button"
									role="tab"
									aria-selected={isActive}
									tabIndex={isActive ? 0 : -1}
									onClick={() => onSelect?.(tab.id)}
									onKeyDown={(event) => handleTabKeyDown(event, tabs, active, onSelect)}
									className={joinClass(
										"max-w-28 min-w-0 shrink-0 rounded px-2 py-2 text-xs font-bold transition",
										isActive ? "bg-primary text-text-inverse" : "border border-border bg-bg-secondary/50 text-text-muted hover:text-text",
									)}
								>
									<span className="block truncate">{tab.label}</span>
								</button>
							);
						})}
					</nav>
					{hasViewAll && (
						<button
							type="button"
							className="group flex shrink-0 cursor-pointer items-center border-b border-border px-2 py-2 text-xs font-bold text-text-muted transition-colors hover:text-text"
						>
							View all
						</button>
					)}
				</div>
			)}

			<nav className={joinClass("mb-5 min-w-0 flex-row items-center gap-2 border-b border-border", responsive === "compact" ? "hidden md:flex" : "flex")} aria-label="Tabs">
				{tabs.map((tab) => {
					const isActive = tab.id === active;

					return (
						<button
							key={tab.id}
							type="button"
							role="tab"
							aria-selected={isActive}
							tabIndex={isActive ? 0 : -1}
							onClick={() => onSelect?.(tab.id)}
							onKeyDown={(event) => handleTabKeyDown(event, tabs, active, onSelect)}
							className={joinClass(
								"rounded-t border-b-2 px-4 py-3 text-xl font-bold transition-colors",
								isActive
									? "border-primary bg-linear-to-b from-transparent to-primary/25 bg-no-repeat text-text"
									: "border-transparent text-text-muted hover:bg-bg-secondary/60 hover:text-text",
							)}
						>
							{tab.label}
						</button>
					);
				})}
				{hasViewAll && (
					<button
						type="button"
						className="group ml-auto flex shrink-0 cursor-pointer items-center gap-2 px-1 py-2 text-sm font-bold text-text-muted transition-colors hover:text-text"
					>
						<span>View all</span>
						<span className="grid size-7 place-items-center rounded-2xl border border-border bg-bg-secondary text-text-muted transition-colors group-hover:border-primary/50 group-hover:text-primary">
							<ArrowRight size={14} />
						</span>
					</button>
				)}
			</nav>

			{children}
		</div>
	);
}

function SidebarTabs({ tabs, active, drawerTitle }: Readonly<{ tabs: Tab[]; active: string; drawerTitle?: string }>) {
	const [open, setOpen] = useState(false);
	const activeTab = tabs.find((tab) => tab.id === active) ?? tabs[0];

	return (
		<>
			<div className="lg:hidden">
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="mb-5 flex w-full min-w-0 items-center justify-between gap-3 border-b border-border bg-bg-secondary px-4 py-3 text-left transition-colors hover:text-primary"
					aria-haspopup="menu"
					aria-expanded={open}
				>
					<span className="min-w-0">
						<span className="block truncate text-lg font-bold text-text">{activeTab.label}</span>
					</span>
					<ChevronRight size={18} className="shrink-0" aria-hidden="true" />
				</button>

				<MenuPanel open={open} onClose={() => setOpen(false)} variant="drawer-left" width="20rem" role="menu" shouldShowClose={false} panelClassName="flex flex-col p-3">
					<div className="mb-2 flex flex-row items-center border-b border-border pb-5">
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="grid size-8 cursor-pointer place-items-center rounded text-text-muted hover:text-primary"
							aria-label={drawerTitle ? `Close ${drawerTitle} tabs` : "Close tabs"}
						>
							<ChevronLeft size={20} strokeWidth={3} aria-hidden="true" />
						</button>
						{drawerTitle && <p className="w-full text-center font-bold">{drawerTitle}</p>}
					</div>
					<nav className="flex flex-col gap-1" aria-label={drawerTitle ? `${drawerTitle} tabs` : "Tabs"}>
						{tabs.map((tab) => {
							const selected = tab.id === active;
							const Icon = tab.icon;

							return (
								<Link
									key={tab.id}
									href={tab.href ?? "#"}
									onClick={() => setOpen(false)}
									className={joinClass(
										"flex flex-row gap-5 border-l-2 px-4 py-3 text-left transition-colors",
										selected
											? "border-primary bg-linear-to-r from-primary/25 to-transparent bg-no-repeat text-text"
											: "border-transparent text-text-muted hover:bg-bg-secondary/60 hover:text-text",
									)}
									role="menuitem"
									aria-current={selected ? "page" : undefined}
								>
									{Icon && <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0" />}
									<span className="block text-lg font-bold">{tab.label}</span>
								</Link>
							);
						})}
					</nav>
				</MenuPanel>
			</div>
			<aside className="hidden border-r border-border lg:block">
				<nav className="flex flex-col">
					{tabs.map((tab) => {
						const selected = tab.id === active;
						const Icon = tab.icon;

						return (
							<Link
								key={tab.id}
								href={tab.href ?? "#"}
								className={joinClass(
									"flex min-w-56 items-start gap-3 border-b border-border p-5 text-left transition-colors lg:min-w-0",
									selected ? "bg-surface text-text" : "text-text-muted hover:bg-surface hover:text-text",
								)}
							>
								{Icon && <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0" />}
								<span className="min-w-0">
									<span className="text-md block font-bold">{tab.label}</span>
								</span>
							</Link>
						);
					})}
				</nav>
			</aside>
		</>
	);
}

function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, tabs: Tab[], active: string, onSelect?: (id: string) => void) {
	if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") {
		return;
	}
	event.preventDefault();

	const currentIndex = tabs.findIndex((tab) => tab.id === active);

	let nextIndex = currentIndex;
	if (event.key === "ArrowRight") {
		nextIndex = (currentIndex + 1) % tabs.length;
	} else if (event.key === "ArrowLeft") {
		nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
	} else if (event.key === "Home") {
		nextIndex = 0;
	} else if (event.key === "End") {
		nextIndex = tabs.length - 1;
	}

	onSelect?.(tabs[nextIndex].id);
	event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
}
