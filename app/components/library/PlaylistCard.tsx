"use client";

import { createUserGamePlayLog, deleteUserGamePlayLog, updateUserGameEntry, updateUserGamePlayLog } from "@/lib/actions/library";
import { GameStatus } from "@/lib/generated/prisma/enums";
import { ImageIdToURL } from "@/lib/external/igdb/util";
import { UserGameEntry } from "@/lib/types";
import { ratingToFive } from "@/lib/util/rating";
import { CircleHelp, Clock, Edit3, NotebookText, Star, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import RatingStars from "../game/RatingStars";
import SubTabs from "../layout/SubTabs";
import { GhostButton, PrimaryButton } from "../ui/Buttons";
import { Checkbox, Input, Select, Textarea } from "../ui/Inputs";
import MenuPanel from "../ui/MenuPanel";

function statusLabel(status: string) {
    return status.toLowerCase().replace("_", " ");
}

function statusColor(status: GameStatus) {
    if (status === GameStatus.PLAYING) return "bg-primary";
    if (status === GameStatus.COMPLETED) return "bg-success";
    if (status === GameStatus.DROPPED) return "bg-error";
    if (status === GameStatus.PAUSED) return "bg-warning";
    if (status === GameStatus.WISHLIST) return "bg-secondary";
    return "bg-text-faint";
}

function RatingInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
    const [hover, setHover] = useState<number | null>(null);
    const shown = hover ?? value;

    function pick(element: HTMLButtonElement, clientX: number, star: number) {
        const rect = element.getBoundingClientRect();
        const half = clientX - rect.left <= rect.width / 2 ? 0.5 : 1;
        return star + half;
    }

    return (
        <div className="mt-1 flex items-center gap-3">
            <input type="hidden" name="rating" value={value} />
            <div className="flex gap-1" onPointerLeave={() => setHover(null)}>
                {Array.from({ length: 5 }, (_, index) => {
                    const rawFill = Math.round(Math.min(1, Math.max(0, shown - index)) * 100);
                    const fill = rawFill === 100 ? 100 : Math.max(0, rawFill - 5);

                    return (
                        <button
                            key={index}
                            type="button"
                            onPointerMove={(event) => setHover(pick(event.currentTarget, event.clientX, index))}
                            onClick={(event) => {
                                const next = pick(event.currentTarget, event.clientX, index);
                                onChange(value === next ? 0 : next);
                            }}
                            className="relative size-8 cursor-pointer text-text-faint transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label={`${index + 1} star rating`}
                        >
                            <Star size={28} strokeWidth={0.75} aria-hidden="true" />
                            <span className="absolute inset-0 top-0.5 overflow-hidden text-primary" style={{ width: `${fill}%` }}>
                                <Star size={28} strokeWidth={0.75} className="fill-primary" aria-hidden="true" />
                            </span>
                        </button>
                    );
                })}
            </div>
            <span className="text-sm font-bold text-text-muted">{value ? value.toFixed(1) : "No rating"}</span>
        </div>
    );
}

export default function PlaylistCard({ entry, mode, canEdit, onUpdate }: { entry: UserGameEntry; mode: "grid" | "list"; canEdit: boolean; onUpdate: (entry: UserGameEntry) => void }) {
    const [editing, setEditing] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [activeTab, setActiveTab] = useState<"entry" | "log" | "history" | "time">("entry");
    const [selectedLogId, setSelectedLogId] = useState("");
    const [rating, setRating] = useState(ratingToFive(entry.rating) ?? 0);
    const [error, setError] = useState("");
    const [pending, startTransition] = useTransition();
    const game = entry.game;
    const src = ImageIdToURL(game.cover);
    const hasNotes = Boolean(entry.notes?.trim());

    function save(formData: FormData) {
        const timePlayed = String(formData.get("timeplayed") ?? "").trim();
        const timeMode = String(formData.get("timemode") ?? "manual");
        const finished = formData.get("finished") === "on";
        const mastered = formData.get("mastered") === "on";

        if ((finished || mastered) && timeMode === "manual" && !timePlayed) {
            setError("Add time played before marking a game as finished or mastered.");
            return;
        }

        setError("");
        startTransition(async () => {
            const updated = await updateUserGameEntry(entry.id, formData);
            onUpdate(updated as unknown as UserGameEntry);
            setEditing(false);
        });
    }

    function saveLog(formData: FormData) {
        setError("");
        startTransition(async () => {
            const updated = await createUserGamePlayLog(entry.id, formData);
            onUpdate(updated as unknown as UserGameEntry);
            setActiveTab("history");
        });
    }

    function saveHistoryLog(formData: FormData) {
        if (!selectedLogId) return;

        setError("");
        startTransition(async () => {
            const updated = await updateUserGamePlayLog(selectedLogId, formData);
            onUpdate(updated as unknown as UserGameEntry);
            setSelectedLogId("");
        });
    }

    function deleteHistoryLog(logId: string) {
        setError("");
        startTransition(async () => {
            const updated = await deleteUserGamePlayLog(logId);
            onUpdate(updated as unknown as UserGameEntry);
            setSelectedLogId("");
        });
    }

    function timeModeLabel(mode: string | undefined) {
        return mode === "manual" ? "manual" : "logs";
    }

    function openEditor() {
        setActiveTab("entry");
        setSelectedLogId("");
        setRating(ratingToFive(entry.rating) ?? 0);
        setEditing(true);
    }

    return (
        <>
            {mode === "grid" ? (
                <div className="group relative min-w-0 overflow-hidden rounded border border-border bg-bg-secondary">
                    <span className={`absolute select-none left-2 top-2 z-10 rounded px-2 py-1 text-[0.65rem] font-bold uppercase text-text opacity-0 group-hover:opacity-100 ${statusColor(entry.status)}/50`}>
                        {statusLabel(entry.status)}
                    </span>
                    <Link href={`/game/${game.slug}`} className="block">
                        <div className="relative aspect-5/7 bg-bg">
                            {src && <Image src={src} alt={game.name ?? "game cover"} fill sizes="160px" className="object-cover" />}
                            <div className="absolute inset-0 flex flex-col justify-end bg-bg/85 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                                {hasNotes && (
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setShowNotes(true);
                                        }}
                                        className="grid size-8 cursor-pointer rounded text-text-muted transition hover:text-primary"
                                        aria-label="View notes"
                                    >
                                        <NotebookText size={16} aria-hidden="true" />
                                    </button>
                                )}
                                <p className="truncate text-sm font-bold text-text">{game.name}</p>
                                <div className="mt-2 flex flex-col gap-2 text-xs text-text-muted">
                                    <RatingStars rating={ratingToFive(entry.rating)} />
                                    <span>{entry.timePlayed != null ? `${entry.timePlayed}h` : ""}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                    {canEdit && (
                        <button
                            type="button"
                            onClick={openEditor}
                            className="absolute right-2 top-2 grid size-8 cursor-pointer place-items-center rounded bg-bg-secondary/90 text-text-muted opacity-0 transition hover:text-primary group-hover:opacity-100"
                            aria-label="Edit library entry"
                        >
                            <Edit3 size={16} aria-hidden="true" />
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex min-w-0 flex-row items-center gap-4 not-last:border-b border-border p-2">
                    <Link href={`/game/${game.slug}`} className="relative h-20 w-14 shrink-0 overflow-hidden rounded bg-bg">
                        {src && <Image src={src} alt={game.name ?? "game cover"} fill sizes="56px" className="object-cover" />}
                    </Link>
                    <div className="min-w-0 flex-1">
                        <div className="grid min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 text-xs text-text-muted">
                            <p className="truncate text-sm font-bold text-text">{game.name}</p>
                            <span className="flex items-center justify-end gap-2 capitalize">
                                <span className={`size-2 rounded-full ${statusColor(entry.status)}`} aria-hidden="true" />
                                {statusLabel(entry.status)}
                            </span>
                            <span className="flex min-w-18 justify-end">
                                <RatingStars rating={ratingToFive(entry.rating ?? 0)} />
                            </span>
                            <span className="grid size-8 place-items-center justify-self-end">
                                {hasNotes && (
                                <button
                                    type="button"
                                    onClick={() => setShowNotes(true)}
                                    className="grid size-8 cursor-pointer place-items-center rounded text-text-muted transition hover:text-primary"
                                    aria-label="View notes"
                                >
                                    <NotebookText size={16} aria-hidden="true" />
                                </button>
                                )}
                            </span>
                            <span className="min-w-16 text-right">{entry.timePlayed != null ? `${entry.timePlayed}h` : "No time"}</span>
                        </div>
                    </div>
                    {canEdit && (
                        <GhostButton type="button" onClick={openEditor} className="px-3 py-2">
                            <Edit3 size={16} aria-hidden="true" />
                        </GhostButton>
                    )}
                </div>
            )}

            <MenuPanel open={showNotes} onClose={() => setShowNotes(false)} title={`Notes for: ${game.name}`} closeLabel="Close notes">
                <p className="whitespace-pre-wrap text-sm text-text-muted">{entry.notes}</p>
            </MenuPanel>

            <MenuPanel open={editing} onClose={() => setEditing(false)} showClose={false} width="42rem" panelClassName="flex h-[min(36rem,calc(100vh-2rem))] flex-col gap-4 overflow-hidden bg-bg md:flex-row">
                        <div className="relative hidden h-44 w-32 shrink-0 overflow-hidden rounded bg-bg md:block">
                            {src && <Image src={src} alt={game.name ?? "game cover"} fill sizes="128px" className="object-cover" />}
                        </div>
                        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                            <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
                                <h3 className="truncate text-lg font-bold">{game.name}</h3>
                                <button type="button" onClick={() => setEditing(false)} className="grid size-8 shrink-0 cursor-pointer place-items-center rounded text-text-muted hover:text-primary" aria-label="Close">
                                    <X size={18} aria-hidden="true" />
                                </button>
                            </div>
                            <div className="shrink-0">
                                <SubTabs
                                    tabs={[
                                        { id: "entry", label: "Entry" },
                                        { id: "log", label: "Log" },
                                        { id: "history", label: "History" },
                                        { id: "time", label: "Time" },
                                    ]}
                                    active={activeTab}
                                    setter={setActiveTab}
                                />
                            </div>
                            {error && (
                                <p className="mb-3 shrink-0 rounded border border-error/50 bg-error/15 p-2 text-sm text-error">
                                    {error}
                                </p>
                            )}
                            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                            <form action={save} className={activeTab === "entry" ? "flex min-h-full flex-col gap-3" : "hidden"}>
                                <input type="hidden" name="timemode" value={timeModeLabel(entry.timeMode)} />
                                <input type="hidden" name="timeplayed" value={entry.timePlayed ?? ""} />
                                <label className="text-sm font-bold text-text-muted">
                                    Status
                                    <Select name="status" defaultValue={entry.status} className="w-full">
                                        {Object.values(GameStatus).map((status) => (
                                            <option key={status} value={status} className="capitalize">{statusLabel(status)}</option>
                                        ))}
                                    </Select>
                                </label>
                                <label className="text-sm font-bold text-text-muted">
                                    Rating
                                    <RatingInput value={rating} onChange={setRating} />
                                </label>
                                <label className="text-sm font-bold text-text-muted">
                                    Notes
                                    <Textarea name="notes" rows={3} defaultValue={entry.notes ?? ""} />
                                </label>
                                <div className="grid grid-cols-2 gap-2 text-sm font-bold text-text-muted">
                                    <label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2">
                                        <Checkbox name="finished" defaultChecked={entry.timeFinished != null} />
                                        Finished
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2">
                                        <Checkbox name="mastered" defaultChecked={entry.timeMastered != null} />
                                        Mastered
                                    </label>
                                </div>
                                <div className="mt-auto flex justify-end gap-2 pt-2">
                                    <GhostButton type="button" onClick={() => setActiveTab("log")}>Create Log</GhostButton>
                                    <GhostButton type="button" onClick={() => setEditing(false)}>Cancel</GhostButton>
                                    <PrimaryButton type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</PrimaryButton>
                                </div>
                            </form>
                            {activeTab === "log" && (
                                <form action={saveLog} className="flex min-h-full flex-col gap-3">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <label className="text-sm font-bold text-text-muted">
                                            Date played
                                            <Input name="playedat" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                                        </label>
                                        <label className="text-sm font-bold text-text-muted">
                                            Hours played
                                            <Input name="hours" type="number" min={0.1} step={0.1} />
                                        </label>
                                    </div>
                                    <label className="text-sm font-bold text-text-muted">
                                        Log note
                                        <Textarea name="note" rows={4} />
                                    </label>
                                    <div className="grid gap-2 text-sm font-bold text-text-muted sm:grid-cols-3">
                                        <label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2">
                                            <Checkbox name="finished" defaultChecked={entry.timeFinished != null} />
                                            Finished
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2">
                                            <Checkbox name="mastered" defaultChecked={entry.timeMastered != null} />
                                            Mastered
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2">
                                            <Checkbox name="skip" />
                                            Exclude
                                            <span title="Excluded logs stay visible, but do not count toward total play time, recaps, or other rollups.">
                                                <CircleHelp size={15} className="text-text-faint" aria-label="Excluded logs stay visible, but do not count toward total play time, recaps, or other rollups." />
                                            </span>
                                        </label>
                                    </div>
                                    <div className="mt-auto flex justify-end gap-2 pt-2">
                                        <GhostButton type="button" onClick={() => setEditing(false)}>Cancel</GhostButton>
                                        <PrimaryButton type="submit" disabled={pending}>{pending ? "Saving..." : "Add log"}</PrimaryButton>
                                    </div>
                                </form>
                            )}
                            {activeTab === "history" && (
                                <div className="grid min-h-full gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                    <div className="flex max-h-112 flex-col gap-2 overflow-y-auto pr-1">
                                        {entry.userGamePlayLogs?.length ? entry.userGamePlayLogs.map((log) => (
                                            <button
                                                key={log.id}
                                                type="button"
                                                onClick={() => setSelectedLogId(log.id)}
                                                className={`cursor-pointer rounded border p-3 text-left text-xs transition ${selectedLogId === log.id ? "border-primary bg-primary/10" : "border-border bg-bg/60 hover:border-primary"}`}
                                            >
                                                <span className="block font-bold text-text">{new Date(log.playedAt).toLocaleDateString()} - {log.hours}h</span>
                                                {log.skip && <span className="mt-1 block text-text-faint">excluded from recaps</span>}
                                                <span className="mt-1 line-clamp-2 whitespace-pre-wrap text-text-muted">{log.note}</span>
                                            </button>
                                        )) : (
                                            <p className="rounded border border-border bg-bg/60 p-3 text-sm text-text-muted">No logs yet.</p>
                                        )}
                                    </div>
                                    {selectedLogId ? entry.userGamePlayLogs?.filter((log) => log.id === selectedLogId).map((log) => (
                                        <form key={log.id} action={saveHistoryLog} className="flex flex-col gap-3">
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <label className="text-sm font-bold text-text-muted">
                                                    Date played
                                                    <Input name="playedat" type="date" defaultValue={new Date(log.playedAt).toISOString().slice(0, 10)} />
                                                </label>
                                                <label className="text-sm font-bold text-text-muted">
                                                    Hours played
                                                    <Input name="hours" type="number" min={0.1} step={0.1} defaultValue={log.hours} />
                                                </label>
                                            </div>
                                            <label className="text-sm font-bold text-text-muted">
                                                Log note
                                                <Textarea name="note" rows={4} defaultValue={log.note} />
                                            </label>
                                            <label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2 text-sm font-bold text-text-muted">
                                                <Checkbox name="skip" defaultChecked={log.skip} />
                                                Exclude from recaps
                                            </label>
                                            <div className="mt-2 flex justify-end gap-2">
                                                <GhostButton type="button" onClick={() => deleteHistoryLog(log.id)} disabled={pending} className="px-3 py-2 text-error hover:border-error hover:text-error">
                                                    <Trash2 size={16} aria-hidden="true" />
                                                </GhostButton>
                                                <PrimaryButton type="submit" disabled={pending}>{pending ? "Saving..." : "Save log"}</PrimaryButton>
                                            </div>
                                        </form>
                                    )) : (
                                        <div className="">
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === "time" && (
                                <form action={save} className="flex min-h-full flex-col gap-3">
                                    <input type="hidden" name="status" value={entry.status} />
                                    <input type="hidden" name="rating" value={ratingToFive(entry.rating) ?? ""} />
                                    <input type="hidden" name="notes" value={entry.notes ?? ""} />
                                    {entry.timeFinished != null && <input type="hidden" name="finished" value="on" />}
                                    {entry.timeMastered != null && <input type="hidden" name="mastered" value="on" />}
                                    <div className="flex flex-col gap-2 text-sm font-bold text-text-muted">
                                        Time source
                                        <label className="flex cursor-pointer items-center gap-3 rounded border border-border bg-bg/60 p-3 has-checked:border-primary has-checked:bg-primary/10">
                                            <input name="timemode" type="radio" value="logs" defaultChecked={timeModeLabel(entry.timeMode) === "logs"} className="peer sr-only" />
                                            <span className="size-4 rounded-full border border-border peer-checked:border-primary peer-checked:bg-primary peer-checked:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_20%,transparent)]" />
                                            <span>
                                                <span className="block text-text">Calculate from play logs</span>
                                                <span className="block text-xs font-normal text-text-faint">Every play log counts toward this game entry&apos;s time.</span>
                                            </span>
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-3 rounded border border-border bg-bg/60 p-3 has-checked:border-primary has-checked:bg-primary/10">
                                            <input name="timemode" type="radio" value="manual" defaultChecked={timeModeLabel(entry.timeMode) === "manual"} className="peer sr-only" />
                                            <span className="size-4 rounded-full border border-border peer-checked:border-primary peer-checked:bg-primary peer-checked:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_20%,transparent)]" />
                                            <span>
                                                <span className="block text-text">Use manual time</span>
                                                <span className="block text-xs font-normal text-text-faint">Set the total directly and keep logs as history.</span>
                                            </span>
                                        </label>
                                    </div>
                                    <label className="text-sm font-bold text-text-muted">
                                        Manual time played
                                        <Input name="timeplayed" type="number" min={0} step={0.1} defaultValue={entry.timePlayed ?? ""} />
                                    </label>
                                    <div className="rounded border border-border bg-bg/60 p-3 text-sm text-text-muted">
                                        <div className="flex items-center gap-2 font-bold text-text">
                                            <Clock size={15} aria-hidden="true" />
                                            Current total: {entry.timePlayed != null ? `${entry.timePlayed}h` : "No time"}
                                        </div>
                                        <p className="mt-1 text-xs text-text-faint">All logs count toward game entry time. Excluded logs are only ignored by recaps and rollups.</p>
                                    </div>
                                    <div className="mt-auto flex justify-end gap-2 pt-2">
                                        <GhostButton type="button" onClick={() => setEditing(false)}>Cancel</GhostButton>
                                        <PrimaryButton type="submit" disabled={pending}>{pending ? "Saving..." : "Save time"}</PrimaryButton>
                                    </div>
                                </form>
                            )}
                            </div>
                        </div>
            </MenuPanel>
        </>
    );
}
