"use client";

import { CircleHelp } from "lucide-react";
import { GhostButton, PrimaryButton } from "@/components/ui/Buttons";
import { Checkbox, Input, SuffixedInput, Textarea } from "@/components/ui/Inputs";
import type { UserLibraryEntryWithTags } from "@/lib/data/library";

type LogTabProps = Readonly<{
	entry: UserLibraryEntryWithTags;
	saveLog: (formData: FormData) => void;
	onClose: () => void;
	pending: boolean;
	today: string;
}>;

export default function LogTab({ entry, saveLog, onClose, pending, today }: LogTabProps) {
	return (
		<form action={saveLog} className="flex min-h-full flex-col gap-3">
			<div className="grid gap-3 sm:grid-cols-2">
				<label className="text-sm font-bold text-text-muted">
					Date played
					<Input name="playedat" type="date" max={today} defaultValue={today} />
				</label>
				<label className="text-sm font-bold text-text-muted">
					Hours played
					<SuffixedInput name="hours" type="number" min={0.1} step={0.1} suffix="h" />
				</label>
			</div>
			<label className="text-sm font-bold text-text-muted">
				Log note
				<Textarea name="note" rows={4} />
			</label>
			<div className="grid gap-2 text-sm font-bold text-text-muted sm:grid-cols-3">
				<label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2">
					<Checkbox
						name="finished"
						defaultChecked={Boolean(entry.finishedAt || entry.timeFinished != null)}
						disabled={Boolean(entry.finishedAt || entry.timeFinished != null)}
					/>
					Finished
				</label>
				<label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2">
					<Checkbox name="mastered" defaultChecked={entry.timeMastered != null} disabled={entry.timeMastered != null} />
					Mastered
				</label>
				<label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2">
					<Checkbox name="skipRecap" />
					Skip recap
					<span title="This log still counts toward your game time. It will only be left out of recap features.">
						<CircleHelp size={15} className="text-text-faint" aria-label="This log still counts toward your game time. It will only be left out of recap features." />
					</span>
				</label>
			</div>
			<div className="mt-auto flex justify-end gap-2 pt-2">
				<GhostButton type="button" onClick={onClose}>
					Cancel
				</GhostButton>
				<PrimaryButton type="submit" disabled={pending}>
					{pending ? "Saving..." : "Add log"}
				</PrimaryButton>
			</div>
		</form>
	);
}
