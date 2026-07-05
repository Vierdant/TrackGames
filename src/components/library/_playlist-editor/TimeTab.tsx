"use client";

import { Check, Clock, Crown } from "lucide-react";
import { GhostButton, PrimaryButton } from "@/components/ui/control/Button";
import { NumberInput } from "@/components/ui/control/NumberInput";
import { TextInput } from "@/components/ui/control/TextInput";
import type { UserLibraryEntryWithTags } from "@/lib/data/library";
import { ratingToFive } from "@/lib/util/format/rating";

type TimeTabProps = Readonly<{
	entry: UserLibraryEntryWithTags;
	save: (formData: FormData) => void;
	onClose: () => void;
	pending: boolean;
	timeMode: string;
	setTimeMode: (mode: string) => void;
	today: string;
	finishedAtValue: string;
	masteredAtValue: string;
}>;

export default function TimeTab({ entry, save, onClose, pending, timeMode, setTimeMode, today, finishedAtValue, masteredAtValue }: TimeTabProps) {
	return (
		<form action={save} className="flex min-h-full flex-col gap-3">
			<input type="hidden" name="status" value={entry.status} />
			<input type="hidden" name="rating" value={ratingToFive(entry.rating) ?? ""} />
			<input type="hidden" name="notes" value={entry.notes ?? ""} />
			{Boolean(entry.finishedAt || entry.timeFinished != null) && <input type="hidden" name="finished" value="on" />}
			{entry.timeMastered != null && <input type="hidden" name="mastered" value="on" />}
			<div className="flex flex-col gap-2 text-sm font-bold text-text-muted">
				<span>
					<p>Time source</p>
					<p className="text-xs font-light text-text-muted">The method used to calculate your total game time</p>
				</span>
				<label className="flex cursor-pointer items-center gap-3 bg-bg/60">
					<input name="timemode" type="radio" value="logs" checked={timeMode === "logs"} onChange={() => setTimeMode("logs")} className="peer sr-only" />
					<span className="size-4 rounded-full border border-border peer-checked:border-primary peer-checked:bg-primary" />
					<span className="block text-text">Calculate total from play logs</span>
				</label>
				<label className="flex cursor-pointer items-center gap-3 bg-bg/60">
					<input name="timemode" type="radio" value="manual" checked={timeMode === "manual"} onChange={() => setTimeMode("manual")} className="peer sr-only" />
					<span className="size-4 rounded-full border border-border peer-checked:border-primary peer-checked:bg-primary" />
					<span className="block text-text">Use manual time</span>
				</label>
			</div>
			<div className="grid gap-2 rounded bg-bg/60 p-3 text-sm text-text-muted">
				<div className="grid gap-2 font-bold text-text sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
					<span className="flex items-center gap-2 font-medium text-text-muted">
						<Clock size={15} aria-hidden="true" />
						Current total
					</span>
					<NumberInput
						name="timeplayed"
						type="number"
						min={0}
						step={0.1}
						defaultValue={entry.timePlayed ?? "0"}
						suffix="h"
						disabled={timeMode !== "manual"}
						aria-label="Current total time"
					/>
					<span className="hidden sm:block" aria-hidden="true" />
				</div>
				{Boolean(entry.finishedAt || entry.timeFinished != null) && (
					<div className="grid gap-2 font-bold text-text sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
						<span className="flex items-center gap-2 font-medium text-text-muted">
							<Check size={15} aria-hidden="true" />
							Finished
						</span>
						<NumberInput
							name="timefinished"
							type="number"
							min={0}
							step={0.1}
							defaultValue={entry.timeFinished ?? entry.timePlayed ?? 0}
							suffix="h"
							aria-label="Finished time"
						/>
						<TextInput name="finishedat" type="date" max={today} defaultValue={finishedAtValue || today} aria-label="Finished date" />
					</div>
				)}
				{entry.timeMastered != null && (
					<div className="grid gap-2 font-bold text-text sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
						<span className="flex items-center gap-2 font-medium text-text-muted">
							<Crown size={15} aria-hidden="true" />
							Mastered
						</span>
						<NumberInput name="timemastered" type="number" min={0} step={0.1} defaultValue={entry.timeMastered} suffix="h" aria-label="Mastered time" />
						<TextInput name="masteredat" type="date" max={today} defaultValue={masteredAtValue || today} aria-label="Mastered date" />
					</div>
				)}
			</div>
			<div className="mt-auto flex justify-end gap-2 pt-2">
				<GhostButton type="button" onClick={onClose}>
					Cancel
				</GhostButton>
				<PrimaryButton type="submit" disabled={pending}>
					{pending ? "Saving..." : "Save time"}
				</PrimaryButton>
			</div>
		</form>
	);
}
