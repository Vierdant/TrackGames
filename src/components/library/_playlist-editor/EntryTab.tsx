"use client";

import type { Dispatch, SetStateAction } from "react";
import { Plus, X } from "lucide-react";
import { formLabel } from "@/app/_util/func";
import StarRating from "@/components/game/StarRating";
import { timeModeLabel } from "@/components/library/_playlist-editor/shared";
import { GhostButton, PrimaryButton } from "@/components/ui/Buttons";
import { Checkbox, Select, Textarea } from "@/components/ui/Inputs";
import type { UserLibraryEntryWithTags } from "@/lib/data/library";
import { GameStatus } from "@/lib/generated/prisma/enums";

type EntryTabProps = Readonly<{
	entry: UserLibraryEntryWithTags;
	isActive: boolean;
	save: (formData: FormData) => void;
	onClose: () => void;
	pending: boolean;
	entryStatus: GameStatus;
	setEntryStatus: (status: GameStatus) => void;
	isFinished: boolean;
	setEntryFinished: (finished: boolean) => void;
	tags: string[];
	setTags: Dispatch<SetStateAction<string[]>>;
	isAddingTag: boolean;
	setAddingTag: (adding: boolean) => void;
	tagInput: string;
	setTagInput: (value: string) => void;
	addTag: () => void;
	rating: number;
	setRating: (rating: number) => void;
	setActiveTab: (tab: string) => void;
}>;

export default function EntryTab({
	entry,
	isActive,
	save,
	onClose,
	pending,
	entryStatus,
	setEntryStatus,
	isFinished,
	setEntryFinished,
	tags,
	setTags,
	isAddingTag,
	setAddingTag,
	tagInput,
	setTagInput,
	addTag,
	rating,
	setRating,
	setActiveTab,
}: EntryTabProps) {
	return (
		<form action={save} className={isActive ? "flex min-h-full flex-col gap-3" : "hidden"}>
			<input type="hidden" name="timemode" value={timeModeLabel(entry.timeMode)} />
			<input type="hidden" name="timeplayed" value={entry.timePlayed ?? ""} />
			<input type="hidden" name="tagsTouched" value="1" />
			{tags.map((tag) => (
				<input key={tag} type="hidden" name="tags" value={tag} />
			))}
			<label className="text-sm font-bold text-text-muted">
				Status
				<Select
					name="status"
					value={entryStatus}
					onChange={(event) => {
						const status = event.target.value as GameStatus;
						setEntryStatus(status);
						if (status === GameStatus.COMPLETED) setEntryFinished(true);
					}}
					className="w-full capitalize"
				>
					{Object.values(GameStatus).map((status) => (
						<option key={status} value={status}>
							{formLabel(status)}
						</option>
					))}
				</Select>
			</label>
			<div className="grid gap-2 text-sm font-bold text-text-muted sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
				<StarRating rating={rating} size={28} isInteractive shouldShowValue name="rating" onChange={setRating} />
				<label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2">
					<Checkbox name="finished" checked={isFinished} onChange={(event) => setEntryFinished(event.target.checked)} />
					Finished
				</label>
				<label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2">
					<Checkbox name="mastered" defaultChecked={entry.timeMastered != null} />
					Mastered
				</label>
			</div>
			<div className="text-sm font-bold text-text-muted">
				Tags
				<div className="mt-1 flex min-h-10 flex-wrap items-center gap-2">
					{tags.map((tag) => (
						<span key={tag} className="flex max-w-full items-center gap-1 rounded border border-border bg-bg px-2 py-1 text-xs text-text">
							<span className="truncate">{tag}</span>
							<button
								type="button"
								onClick={() => setTags((current) => current.filter((item) => item !== tag))}
								className="grid size-4 shrink-0 cursor-pointer place-items-center rounded text-text-muted hover:text-error"
								aria-label={`Remove ${tag}`}
							>
								<X size={12} aria-hidden="true" />
							</button>
						</span>
					))}
					{isAddingTag ? (
						<input
							name="tags"
							autoFocus
							value={tagInput}
							onChange={(event) => setTagInput(event.target.value)}
							onBlur={addTag}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									event.preventDefault();
									addTag();
								}
							}}
							className="rounded border border-border bg-bg px-2 py-1 text-xs text-text outline-none"
							maxLength={40}
						/>
					) : (
						<button
							type="button"
							onClick={() => setAddingTag(true)}
							className="grid size-7 cursor-pointer place-items-center rounded border border-border text-text-muted hover:border-primary hover:text-primary"
							aria-label="Add tag"
						>
							<Plus size={14} aria-hidden="true" />
						</button>
					)}
				</div>
			</div>
			<label className="text-sm font-bold text-text-muted">
				Notes
				<Textarea name="notes" rows={3} defaultValue={entry.notes ?? ""} />
			</label>
			<div className="mt-auto grid grid-cols-3 gap-2 pt-2 md:flex md:justify-end">
				<GhostButton type="button" className="md:text-md text-sm" onClick={() => setActiveTab("log")}>
					Create Log
				</GhostButton>
				<GhostButton type="button" className="md:text-md text-sm" onClick={onClose}>
					Cancel
				</GhostButton>
				<PrimaryButton type="submit" className="md:text-md text-sm" disabled={pending}>
					{pending ? "Saving..." : "Save"}
				</PrimaryButton>
			</div>
		</form>
	);
}
