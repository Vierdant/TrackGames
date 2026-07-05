"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, X } from "lucide-react";
import Tabs from "@/components/layout/Tabs";
import PlaylistTab from "@/components/library/_playlist-editor/PlaylistTab";
import PlaylistCardEditorTabs, { type PlaylistCardEditorTabsProps, timeModeLabel } from "@/components/library/PlaylistCardEditorTabs";
import ConfirmAction from "@/components/ui/ConfirmAction";
import { GhostButton } from "@/components/ui/control/Button";
import MenuPanel from "@/components/ui/MenuPanel";
import {
	createUserGamePlayLog,
	deleteUserGamePlayLog,
	fetchUserGameEntry,
	removeGameFromLibrary,
	setGameLibraryStatus,
	updateUserGameEntry,
	updateUserGamePlayLog,
} from "@/lib/actions/library";
import { removeGameFromPlaylist, updatePlaylistEntry } from "@/lib/actions/playlists";
import type { UserLibraryEntryWithTags, ViewerGameEntry } from "@/lib/data/library";
import { ImageIdToURL } from "@/lib/external/igdb/util";
import { GameStatus } from "@/lib/generated/prisma/enums";
import { joinClass } from "@/lib/util/client/func";
import { GAME_STATUS_META, gameStatusColorClasses } from "@/lib/util/format/gameStatus";
import { ratingToFive } from "@/lib/util/format/rating";
import { formDataString } from "@/lib/util/parse/formData";

type LibraryEntry = UserLibraryEntryWithTags | ViewerGameEntry;

type PlaylistEditorContext = Readonly<{
	listId: string;
	entryId: string;
	position: number | null;
	tier: string | null;
	tiers: string[];
}>;

type GameEntryMenuProps = Readonly<{
	gameId: number;
	gameSlug: string;
	gameName: string;
	gameCover?: string | null;
	isLoggedIn: boolean;
	libraryEntry: LibraryEntry | null;
	onLibraryChange?: (entry: UserLibraryEntryWithTags | null) => void;
	onRemoved?: () => void;
	playlistEditor?: PlaylistEditorContext | null;
	themeStyle?: CSSProperties;
	children: (ctrl: { onTileClick: (event: React.MouseEvent) => void }) => React.ReactNode;
}>;

type GameEntryMenuContentProps = Omit<PlaylistCardEditorTabsProps, "entry" | "onClose" | "playlistEditor"> &
	Readonly<{
		entry: LibraryEntry | null;
		fullEntry: UserLibraryEntryWithTags | null;
		loadingFull: boolean;
		onClose: () => void;
		gameSlug: string;
		quickTab: "add" | "playlist";
		setQuickTab: (tab: "add" | "playlist") => void;
		playlistEditor?: PlaylistEditorContext | null;
		addWithStatus: (status: GameStatus) => void;
		savePlaylistEntry: (formData: FormData) => void;
		removeFromPlaylist: () => void;
	}>;

const quickAddStatuses = [GameStatus.PLAYING, GameStatus.BACKLOG, GameStatus.WISHLIST, GameStatus.COMPLETED, GameStatus.PAUSED, GameStatus.DROPPED];

function GameEntryMenuContent({
	entry,
	fullEntry,
	loadingFull,
	onClose,
	pending,
	gameSlug,
	quickTab,
	setQuickTab,
	playlistEditor,
	addWithStatus,
	savePlaylistEntry,
	removeFromPlaylist,
	...editorProps
}: GameEntryMenuContentProps) {
	if (fullEntry) {
		return (
			<PlaylistCardEditorTabs
				entry={fullEntry}
				onClose={onClose}
				pending={pending}
				playlistEditor={
					playlistEditor
						? {
								position: playlistEditor.position,
								tier: playlistEditor.tier,
								tiers: playlistEditor.tiers,
								save: savePlaylistEntry,
								onRemove: removeFromPlaylist,
							}
						: null
				}
				{...editorProps}
			/>
		);
	}

	if (entry && loadingFull) {
		return <p className="text-sm text-text-muted">Loading...</p>;
	}

	let quickBody: ReactNode;
	if (quickTab === "playlist" && playlistEditor) {
		quickBody = (
			<PlaylistTab
				position={playlistEditor.position}
				tier={playlistEditor.tier}
				tiers={playlistEditor.tiers}
				save={savePlaylistEntry}
				onRemove={removeFromPlaylist}
				onClose={onClose}
				pending={pending}
			/>
		);
	} else {
		quickBody = (
			<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
				<p className="text-sm text-text-muted">Not in your library yet. Add it with a status:</p>
				<div className="flex flex-col gap-2">
					{quickAddStatuses.map((status) => {
						const meta = GAME_STATUS_META[status];
						const Icon = meta.icon;
						const colors = gameStatusColorClasses(status);

						return (
							<button
								key={status}
								type="button"
								disabled={pending}
								onClick={() => addWithStatus(status)}
								className={joinClass(
									"flex cursor-pointer items-center gap-3 rounded border p-3 text-sm font-bold transition hover:bg-bg-secondary disabled:cursor-wait disabled:opacity-60",
									colors.className,
								)}
							>
								<Icon size={17} />
								{meta.label}
							</button>
						);
					})}
				</div>
				<div className="border-t border-border pt-3">
					<GhostButton href={`/game/${gameSlug}`} className="w-full justify-center px-4 py-2">
						<ArrowUpRight size={16} aria-hidden="true" />
						Visit game
					</GhostButton>
				</div>
			</div>
		);
	}

	return (
		<>
			{playlistEditor && (
				<Tabs
					tabs={[
						{ id: "add", label: "Add to library" },
						{ id: "playlist", label: "Playlist" },
					]}
					active={quickTab}
					onSelect={(id) => setQuickTab(id as "add" | "playlist")}
					responsive="compact"
				/>
			)}
			{quickBody}
		</>
	);
}

export default function GameEntryMenu({
	gameId,
	gameSlug,
	gameName,
	gameCover,
	isLoggedIn,
	libraryEntry,
	onLibraryChange,
	onRemoved,
	playlistEditor,
	themeStyle,
	children,
}: GameEntryMenuProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [override, setOverride] = useState<UserLibraryEntryWithTags | null>(null);
	const [loadingFull, setLoadingFull] = useState(false);
	const [confirmingRemove, setConfirmingRemove] = useState(false);
	const [quickTab, setQuickTab] = useState<"add" | "playlist">("add");
	const [error, setError] = useState("");
	const [pending, startTransition] = useTransition();

	const [activeTab, setActiveTab] = useState<string>("entry");
	const [selectedLogId, setSelectedLogId] = useState("");
	const [logDate, setLogDate] = useState("");
	const [timeMode, setTimeMode] = useState("manual");
	const [entryStatus, setEntryStatus] = useState<GameStatus>(GameStatus.BACKLOG);
	const [isFinished, setIsFinished] = useState(false);
	const [tags, setTags] = useState<string[]>([]);
	const [isAddingTag, setAddingTag] = useState(false);
	const [tagInput, setTagInput] = useState("");
	const [rating, setRating] = useState(0);

	const src = ImageIdToURL(gameCover ?? undefined);
	const entry = override ?? libraryEntry;

	function syncEntry(updated: UserLibraryEntryWithTags | null) {
		setOverride(updated);
		if (onLibraryChange) onLibraryChange(updated);
		else router.refresh();
	}

	function resetFormFromEntry(full: UserLibraryEntryWithTags) {
		setActiveTab("entry");
		setSelectedLogId("");
		setLogDate("");
		setTimeMode(timeModeLabel(full.timeMode));
		setEntryStatus(full.status);
		setIsFinished(Boolean(full.finishedAt || full.timeFinished != null));
		setTags(full.tags.map((tag) => tag.name));
		setAddingTag(false);
		setTagInput("");
		setRating(ratingToFive(full.rating) ?? 0);
	}

	function onTileClick(event: React.MouseEvent) {
		if (!isLoggedIn) return;

		event.preventDefault();
		setError("");
		setOpen(true);
		setQuickTab("add");

		if (entry && isFullEntry(entry)) {
			resetFormFromEntry(entry);
		} else if (entry && !isFullEntry(entry)) {
			setLoadingFull(true);
			startTransition(async () => {
				const full = await fetchUserGameEntry(gameId);
				setLoadingFull(false);
				if (full) {
					setOverride(full);
					resetFormFromEntry(full);
				}
			});
		}
	}

	function addWithStatus(status: GameStatus) {
		setError("");
		startTransition(async () => {
			const result = await setGameLibraryStatus(gameId, gameSlug, status);
			if ("error" in result) {
				setError(result.error);
				return;
			}

			syncEntry(result);
			resetFormFromEntry(result);
		});
	}

	function addTag() {
		const name = tagInput.trim().slice(0, 40);
		if (name && !tags.some((tag) => tag.toLowerCase() === name.toLowerCase())) {
			setTags((current) => [...current, name]);
		}
		setTagInput("");
		setAddingTag(false);
	}

	function save(formData: FormData) {
		if (!entry || !isFullEntry(entry)) return;

		const timePlayed = formDataString(formData.get("timeplayed")).trim();
		const timeMastered = formDataString(formData.get("timemastered")).trim();
		const mode = formDataString(formData.get("timemode"), "manual");
		const mastered = formData.get("mastered") === "on";

		if (mastered && !timeMastered && mode === "manual" && !timePlayed) {
			setError("Add time played or mastered time before marking a game as mastered.");
			return;
		}

		setError("");
		startTransition(async () => {
			const updated = await updateUserGameEntry(entry.id, formData);
			if ("error" in updated) {
				setError(updated.error);
				return;
			}

			syncEntry(updated);
			setOpen(false);
		});
	}

	function saveLog(formData: FormData) {
		if (!entry || !isFullEntry(entry)) return;

		setError("");
		startTransition(async () => {
			const updated = await createUserGamePlayLog(entry.id, formData);
			if ("error" in updated) {
				setError(updated.error);
				return;
			}

			syncEntry(updated);
			setOpen(false);
		});
	}

	function saveHistoryLog(formData: FormData) {
		if (!selectedLogId) return;

		setError("");
		startTransition(async () => {
			const updated = await updateUserGamePlayLog(selectedLogId, formData);
			if ("error" in updated) {
				setError(updated.error);
				return;
			}

			syncEntry(updated);
			setSelectedLogId("");
		});
	}

	function deleteHistoryLog(logId: string) {
		setError("");
		startTransition(async () => {
			const updated = await deleteUserGamePlayLog(logId);
			if ("error" in updated) {
				setError(updated.error);
				return;
			}

			syncEntry(updated);
			setSelectedLogId("");
		});
	}

	function removeEntry() {
		setError("");
		startTransition(async () => {
			await removeGameFromLibrary(gameId, gameSlug);
			setConfirmingRemove(false);
			setOpen(false);
			syncEntry(null);
			onRemoved?.();
		});
	}

	function savePlaylistEntry(formData: FormData) {
		if (!playlistEditor) return;

		startTransition(async () => {
			await updatePlaylistEntry(playlistEditor.listId, playlistEditor.entryId, formData);
			router.refresh();
		});
	}

	function removeFromPlaylist() {
		if (!playlistEditor) return;

		startTransition(async () => {
			await removeGameFromPlaylist(playlistEditor.listId, playlistEditor.entryId);
			router.refresh();
			setOpen(false);
		});
	}

	const now = new Date();
	const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	const fullEntry = entry && isFullEntry(entry) ? entry : null;
	const logs = fullEntry ? [...fullEntry.logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
	const filteredLogs = logDate ? logs.filter((log) => new Date(log.playedAt).toISOString().slice(0, 10) === logDate) : logs;
	const selectedLog = logs.find((log) => log.id === selectedLogId);
	const finishedAtValue = fullEntry?.finishedAt ? new Date(fullEntry.finishedAt).toISOString().slice(0, 10) : "";
	const masteredAtValue = fullEntry?.masteredAt ? new Date(fullEntry.masteredAt).toISOString().slice(0, 10) : "";
	const isEditorView = Boolean(fullEntry);

	return (
		<>
			{children({ onTileClick })}

			<MenuPanel
				open={open}
				onClose={() => setOpen(false)}
				shouldShowClose={false}
				width={isEditorView ? "42rem" : "26rem"}
				panelClassName={
					isEditorView
						? "flex h-[min(42rem,calc(100dvh-1rem))] w-[calc(100vw-1rem)] flex-col gap-4 overflow-hidden bg-bg p-4 md:h-[min(36rem,calc(100vh-2rem))] md:w-[min(var(--menu-panel-width,42rem),calc(100vw-2rem))] md:flex-row md:p-5"
						: "flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] flex-col gap-4 overflow-hidden bg-bg p-4 md:w-[min(var(--menu-panel-width,26rem),calc(100vw-2rem))]"
				}
				style={themeStyle}
			>
				{isEditorView && (
					<div className="hidden w-32 shrink-0 flex-col gap-3 md:flex">
						<Link href={`/game/${gameSlug}`} className="relative h-44 overflow-hidden rounded bg-bg">
							{src && <Image src={src} alt={gameName} fill sizes="128px" className="object-cover" />}
						</Link>
						<GhostButton
							type="button"
							onClick={() => setConfirmingRemove(true)}
							disabled={pending}
							className="px-3 py-2 text-error hover:border-error hover:text-error"
						>
							Remove
						</GhostButton>
					</div>
				)}
				<div className="flex min-h-0 min-w-0 flex-1 flex-col">
					<div
						className={joinClass(
							"mb-3 grid shrink-0 grid-cols-[3.75rem_minmax(0,1fr)_auto_auto] items-center gap-3",
							isEditorView && "md:mb-4 md:flex md:justify-between",
						)}
					>
						<Link href={`/game/${gameSlug}`} className={joinClass("relative h-20 overflow-hidden rounded bg-bg", isEditorView && "md:hidden")}>
							{src && <Image src={src} alt={gameName} fill sizes="60px" className="object-cover" />}
						</Link>
						<Link href={`/game/${gameSlug}`}>
							<h3 className="min-w-0 truncate text-base font-bold text-text md:text-lg">{gameName}</h3>
						</Link>
						<div className="flex flex-row">
							<Link
								href={`/game/${gameSlug}`}
								className={joinClass("grid size-8 shrink-0 cursor-pointer place-items-center rounded text-text-muted hover:text-primary")}
								aria-label="Visit game"
							>
								<ArrowUpRight size={18} aria-hidden="true" />
							</Link>
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="grid size-8 shrink-0 cursor-pointer place-items-center rounded text-text-muted hover:text-primary"
								aria-label="Close"
							>
								<X size={18} aria-hidden="true" />
							</button>
						</div>
					</div>
					{!fullEntry && error && <p className="mb-3 shrink-0 rounded border border-error/50 bg-error/15 p-2 text-sm text-error">{error}</p>}
					<GameEntryMenuContent
						entry={entry}
						fullEntry={fullEntry}
						loadingFull={loadingFull}
						onClose={() => setOpen(false)}
						pending={pending}
						gameSlug={gameSlug}
						quickTab={quickTab}
						setQuickTab={setQuickTab}
						playlistEditor={playlistEditor}
						addWithStatus={addWithStatus}
						savePlaylistEntry={savePlaylistEntry}
						removeFromPlaylist={removeFromPlaylist}
						activeTab={activeTab}
						setActiveTab={setActiveTab}
						error={error}
						save={save}
						saveLog={saveLog}
						saveHistoryLog={saveHistoryLog}
						deleteHistoryLog={deleteHistoryLog}
						timeMode={timeMode}
						setTimeMode={setTimeMode}
						entryStatus={entryStatus}
						setEntryStatus={setEntryStatus}
						isFinished={isFinished}
						setEntryFinished={setIsFinished}
						tags={tags}
						setTags={setTags}
						isAddingTag={isAddingTag}
						setAddingTag={setAddingTag}
						tagInput={tagInput}
						setTagInput={setTagInput}
						addTag={addTag}
						rating={rating}
						setRating={setRating}
						today={today}
						logDate={logDate}
						setLogDate={setLogDate}
						logs={logs}
						filteredLogs={filteredLogs}
						selectedLog={selectedLog}
						selectedLogId={selectedLogId}
						setSelectedLogId={setSelectedLogId}
						finishedAtValue={finishedAtValue}
						masteredAtValue={masteredAtValue}
					/>
				</div>
			</MenuPanel>

			<ConfirmAction
				open={confirmingRemove}
				title="Remove from library?"
				message="This will delete this library entry, including all play logs and related data for it."
				confirmLabel="Remove"
				pending={pending}
				onClose={() => setConfirmingRemove(false)}
				onConfirm={removeEntry}
			/>
		</>
	);
}

function isFullEntry(entry: LibraryEntry): entry is UserLibraryEntryWithTags {
	return "logs" in entry;
}
