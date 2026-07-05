"use client";

import { GhostButton, PrimaryButton } from "@/components/ui/control/Button";
import { Checkbox } from "@/components/ui/control/Checkbox";
import { NumberInput } from "@/components/ui/control/NumberInput";
import { TextArea } from "@/components/ui/control/TextArea";
import { TextInput } from "@/components/ui/control/TextInput";
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
				<TextInput label="Date played" name="playedat" type="date" max={today} defaultValue={today} />
				<NumberInput label="Hours played" name="hours" type="number" min={0.1} step={0.1} suffix="h" />
			</div>
			<TextArea label="Log note" name="note" rows={4} />
			<div className="grid gap-2 text-sm font-bold text-text-muted sm:grid-cols-3">
				<Checkbox
					label="Finished"
					name="finished"
					defaultChecked={Boolean(entry.finishedAt || entry.timeFinished != null)}
					disabled={Boolean(entry.finishedAt || entry.timeFinished != null)}
					fieldClassName="rounded border border-border p-2"
				/>
				<Checkbox
					label="Mastered"
					name="mastered"
					defaultChecked={entry.timeMastered != null}
					disabled={entry.timeMastered != null}
					fieldClassName="rounded border border-border p-2"
				/>
				<Checkbox
					label={
						<>
							<p>Skip recap</p>
							<span title="This log still counts toward your game time. It will only be left out of recap features."></span>
						</>
					}
					name="skipRecap"
					fieldClassName="rounded border border-border p-2"
				/>
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
