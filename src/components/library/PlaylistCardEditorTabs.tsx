"use client";

import type { Dispatch, SetStateAction } from "react";
import Tabs from "@/components/layout/Tabs";
import EntryTab from "@/components/library/_playlist-editor/EntryTab";
import HistoryTab from "@/components/library/_playlist-editor/HistoryTab";
import LogTab from "@/components/library/_playlist-editor/LogTab";
import PlaylistTab from "@/components/library/_playlist-editor/PlaylistTab";
import type { EditorTab } from "@/components/library/_playlist-editor/shared";
import TimeTab from "@/components/library/_playlist-editor/TimeTab";
import type { UserLibraryEntryWithTags } from "@/lib/data/library";
import type { GameStatus } from "@/lib/generated/prisma/enums";

export { timeModeLabel } from "@/components/library/_playlist-editor/shared";
export type { EditorTab } from "@/components/library/_playlist-editor/shared";

type PlaylistEditorContext = Readonly<{
	position: number | null;
	tier: string | null;
	tiers: string[];
	save: (formData: FormData) => void;
	onRemove: () => void;
}>;

export type PlaylistCardEditorTabsProps = Readonly<{
	entry: UserLibraryEntryWithTags;
	activeTab: string;
	setActiveTab: Dispatch<SetStateAction<string>>;
	error: string;
	save: (formData: FormData) => void;
	saveLog: (formData: FormData) => void;
	saveHistoryLog: (formData: FormData) => void;
	deleteHistoryLog: (logId: string) => void;
	onClose: () => void;
	pending: boolean;
	timeMode: string;
	setTimeMode: (mode: string) => void;
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
	today: string;
	logDate: string;
	setLogDate: (date: string) => void;
	logs: NonNullable<UserLibraryEntryWithTags["logs"]>;
	filteredLogs: NonNullable<UserLibraryEntryWithTags["logs"]>;
	selectedLog: NonNullable<UserLibraryEntryWithTags["logs"]>[number] | undefined;
	selectedLogId: string;
	setSelectedLogId: (id: string) => void;
	finishedAtValue: string;
	masteredAtValue: string;
	playlistEditor?: PlaylistEditorContext | null;
}>;

export default function PlaylistCardEditorTabs({
	entry,
	activeTab,
	setActiveTab,
	error,
	save,
	saveLog,
	saveHistoryLog,
	deleteHistoryLog,
	onClose,
	pending,
	timeMode,
	setTimeMode,
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
	today,
	logDate,
	setLogDate,
	logs,
	filteredLogs,
	selectedLog,
	selectedLogId,
	setSelectedLogId,
	finishedAtValue,
	masteredAtValue,
	playlistEditor,
}: PlaylistCardEditorTabsProps) {
	const tabs = [
		{ id: "entry", label: "Entry" },
		{ id: "log", label: "Log" },
		{ id: "history", label: "History" },
		{ id: "time", label: "Time" },
		...(playlistEditor ? [{ id: "playlist", label: "Playlist" }] : []),
	];

	return (
		<>
			<Tabs tabs={tabs} active={activeTab} onSelect={(id) => setActiveTab(id as EditorTab)} responsive="compact" />
			{error && <p className="mb-3 shrink-0 rounded border border-error/50 bg-error/15 p-2 text-sm text-error">{error}</p>}
			<div className="min-h-0 flex-1 overflow-y-auto pr-1">
				<EntryTab
					entry={entry}
					isActive={activeTab === "entry"}
					save={save}
					onClose={onClose}
					pending={pending}
					entryStatus={entryStatus}
					setEntryStatus={setEntryStatus}
					isFinished={isFinished}
					setEntryFinished={setEntryFinished}
					tags={tags}
					setTags={setTags}
					isAddingTag={isAddingTag}
					setAddingTag={setAddingTag}
					tagInput={tagInput}
					setTagInput={setTagInput}
					addTag={addTag}
					rating={rating}
					setRating={setRating}
					setActiveTab={setActiveTab}
				/>
				{activeTab === "log" && <LogTab entry={entry} saveLog={saveLog} onClose={onClose} pending={pending} today={today} />}
				{activeTab === "history" && (
					<HistoryTab
						saveHistoryLog={saveHistoryLog}
						deleteHistoryLog={deleteHistoryLog}
						pending={pending}
						today={today}
						logDate={logDate}
						setLogDate={setLogDate}
						logs={logs}
						filteredLogs={filteredLogs}
						selectedLog={selectedLog}
						selectedLogId={selectedLogId}
						setSelectedLogId={setSelectedLogId}
					/>
				)}
				{activeTab === "time" && (
					<TimeTab
						entry={entry}
						save={save}
						onClose={onClose}
						pending={pending}
						timeMode={timeMode}
						setTimeMode={setTimeMode}
						today={today}
						finishedAtValue={finishedAtValue}
						masteredAtValue={masteredAtValue}
					/>
				)}
				{activeTab === "playlist" && playlistEditor && (
					<PlaylistTab
						position={playlistEditor.position}
						tier={playlistEditor.tier}
						tiers={playlistEditor.tiers}
						save={playlistEditor.save}
						onRemove={playlistEditor.onRemove}
						onClose={onClose}
						pending={pending}
					/>
				)}
			</div>
		</>
	);
}
