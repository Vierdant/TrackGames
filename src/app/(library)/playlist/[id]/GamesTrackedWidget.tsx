"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { joinClass } from "@/lib/util/client/func";

type GamesTrackedWidgetProps = Readonly<{ ownedCount: number; total: number; ownedPercent: number }>;

export default function GamesTrackedWidget({ ownedCount, total, ownedPercent }: GamesTrackedWidgetProps) {
	const [open, setOpen] = useState(false);

	return (
		<div className="rounded bg-bg p-4">
			<button
				type="button"
				onClick={() => setOpen((current) => !current)}
				className="flex w-full cursor-pointer items-center justify-between gap-2 border-b border-border pb-2 text-left text-sm font-bold text-text lg:cursor-default"
			>
				Games tracked
				<span className="flex items-center gap-1 text-text-muted lg:hidden">
					{ownedPercent}%
					<ChevronDown size={16} aria-hidden="true" className={joinClass("transition-transform", open && "rotate-180")} />
				</span>
			</button>
			<div className={joinClass("mt-4 flex-col items-center", open ? "flex" : "hidden", "lg:flex")}>
				<div className="grid size-32 place-items-center rounded-full" style={{ background: `conic-gradient(var(--primary) ${ownedPercent}%, var(--border) 0)` }}>
					<div className="grid size-24 place-items-center rounded-full bg-bg">
						<p className="text-2xl font-bold text-primary">{ownedPercent}%</p>
					</div>
				</div>
				<p className="mt-3 text-sm text-text-muted">
					{ownedCount} of {total} playlist games
				</p>
			</div>
		</div>
	);
}
