"use client";

import { Trash2 } from "lucide-react";
import { joinClass } from "@/app/_util/func";
import { GhostButton, PrimaryButton } from "@/components/ui/Buttons";
import { Checkbox, Input, SuffixedInput, Textarea } from "@/components/ui/Inputs";
import type { UserLibraryEntryWithTags } from "@/lib/data/library";

type HistoryTabProps = Readonly<{
	saveHistoryLog: (formData: FormData) => void;
	deleteHistoryLog: (logId: string) => void;
	pending: boolean;
	today: string;
	logDate: string;
	setLogDate: (date: string) => void;
	logs: NonNullable<UserLibraryEntryWithTags["logs"]>;
	filteredLogs: NonNullable<UserLibraryEntryWithTags["logs"]>;
	selectedLog: NonNullable<UserLibraryEntryWithTags["logs"]>[number] | undefined;
	selectedLogId: string;
	setSelectedLogId: (id: string) => void;
}>;

export default function HistoryTab({
	saveHistoryLog,
	deleteHistoryLog,
	pending,
	today,
	logDate,
	setLogDate,
	logs,
	filteredLogs,
	selectedLog,
	selectedLogId,
	setSelectedLogId,
}: HistoryTabProps) {
	return (
		<div className="grid min-h-full gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
			<div className="flex max-h-112 flex-col gap-2 overflow-y-auto pr-1">
				<label className="text-sm font-bold text-text-muted">
					Filter
					<Input name="logdate" type="date" max={today} value={logDate} onChange={(event) => setLogDate(event.target.value)} />
				</label>
				{logDate && (
					<GhostButton type="button" onClick={() => setLogDate("")} className="justify-center py-2">
						Clear
					</GhostButton>
				)}
				{filteredLogs.length ? (
					filteredLogs.map((log) => (
						<button
							key={log.id}
							type="button"
							onClick={() => setSelectedLogId(log.id)}
							className={joinClass(
								"cursor-pointer rounded border p-3 text-left text-xs transition",
								selectedLogId === log.id ? "border-primary bg-primary/10" : "border-border bg-bg/60 hover:border-primary",
							)}
						>
							<span className="block font-bold text-text">
								{new Date(log.playedAt).toLocaleDateString()} - {log.hours}h
							</span>
							{log.skipRecap && <span className="mt-1 block text-text-faint">skipped in recaps</span>}
							<span className="mt-1 line-clamp-2 whitespace-pre-wrap text-text-muted">{log.note}</span>
						</button>
					))
				) : (
					<p className="bg-bg/60 p-3 text-sm text-text-muted">{logs.length ? "No logs on this date." : "No logs yet."}</p>
				)}
			</div>
			{selectedLog ? (
				<form key={selectedLog.id} action={saveHistoryLog} className="flex flex-col gap-3">
					<div className="grid gap-3 sm:grid-cols-2">
						<label className="text-sm font-bold text-text-muted">
							Date played
							<Input name="playedat" type="date" max={today} defaultValue={new Date(selectedLog.playedAt).toISOString().slice(0, 10)} />
						</label>
						<label className="text-sm font-bold text-text-muted">
							Hours played
							<SuffixedInput name="hours" type="number" min={0.1} step={0.1} defaultValue={selectedLog.hours} suffix="h" />
						</label>
					</div>
					<label className="text-sm font-bold text-text-muted">
						Log note
						<Textarea name="note" rows={4} defaultValue={selectedLog.note} />
					</label>
					<label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2 text-sm font-bold text-text-muted">
						<Checkbox name="skipRecap" defaultChecked={selectedLog.skipRecap} />
						Skip recap
					</label>
					<div className="mt-2 flex justify-end gap-2">
						<GhostButton
							type="button"
							onClick={() => deleteHistoryLog(selectedLog.id)}
							disabled={pending}
							className="px-3 py-2 text-error hover:border-error hover:text-error"
						>
							<Trash2 size={16} aria-hidden="true" />
						</GhostButton>
						<PrimaryButton type="submit" disabled={pending}>
							{pending ? "Saving..." : "Save log"}
						</PrimaryButton>
					</div>
				</form>
			) : (
				<div className=""></div>
			)}
		</div>
	);
}
