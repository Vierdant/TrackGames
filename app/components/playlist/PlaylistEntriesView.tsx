"use client";

import GameCard from "@/app/components/game/GameCard";
import { Input, Select } from "@/app/components/ui/Inputs";
import { removeGameFromPlaylist, updatePlaylistEntry } from "@/lib/actions/playlists";
import { GameListEntry } from "@/lib/types";
import { Edit3, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { GhostButton, PrimaryButton } from "../ui/Buttons";

function EntryShell({ listId, entry, canEdit, tiers, children }: { listId: string; entry: GameListEntry; canEdit: boolean; tiers: string[]; children: ReactNode }) {
    const [editing, setEditing] = useState(false);
    const [pending, startTransition] = useTransition();
    const router = useRouter();
    const updateAction = updatePlaylistEntry.bind(null, listId, entry.id);
    const removeAction = removeGameFromPlaylist.bind(null, listId, entry.id);

    function save(formData: FormData) {
        startTransition(async () => {
            await updateAction(formData);
            router.refresh();
            setEditing(false);
        });
    }

    function remove() {
        startTransition(async () => {
            await removeAction();
            router.refresh();
            setEditing(false);
        });
    }

    return (
        <div className="group relative min-w-0">
            {children}
            {canEdit && (
                <button type="button" onClick={() => setEditing(true)} className="absolute right-1 top-1 grid size-8 cursor-pointer place-items-center rounded bg-bg-secondary/90 text-text-muted opacity-0 transition-opacity hover:text-primary group-hover:opacity-100" aria-label="Edit playlist entry" title="Edit playlist entry">
                    <Edit3 size={16} />
                </button>
            )}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4">
                    <div className="w-full max-w-md rounded bg-bg-secondary p-5 shadow-main">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="truncate text-lg font-bold">{entry.game.name}</h3>
                            <button type="button" onClick={() => setEditing(false)} className="cursor-pointer rounded p-1 text-text-muted hover:text-primary" aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>
                        <form action={save} className="flex flex-col gap-3">
                            <label className="text-sm font-bold text-text-muted">
                                Position
                                <Input name="position" type="number" min={1} step={1} defaultValue={entry.position ?? ""} />
                            </label>
                            <label className="text-sm font-bold text-text-muted">
                                Tier
                                <Select name="tier" defaultValue={entry.tier ?? tiers[0] ?? "A"} className="w-full">
                                    {tiers.map((tier) => (
                                        <option key={tier} value={tier}>{tier}</option>
                                    ))}
                                </Select>
                            </label>
                            <div className="mt-2 flex flex-wrap justify-between gap-2">
                                <button type="button" onClick={remove} disabled={pending} className="flex cursor-pointer items-center gap-2 rounded border border-error/50 px-4 py-2 text-sm font-bold text-error hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-60">
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                                <div className="flex gap-2">
                                    <GhostButton type="button" onClick={() => setEditing(false)}>Cancel</GhostButton>
                                    <PrimaryButton type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PlaylistEntriesView({ listId, entries, mode, canEdit, tiers, tierColors }: { listId: string; entries: GameListEntry[]; mode: string; canEdit: boolean; tiers: string[]; tierColors: string[] }) {
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("position");
    const ordered = useMemo(() => [...entries].sort((a, b) => (a.position ?? 999999) - (b.position ?? 999999) || Number(a.addedAt ?? 0) - Number(b.addedAt ?? 0)), [entries]);
    const filtered = useMemo(() => {
        const search = query.trim().toLowerCase();

        return entries.filter((entry) => {
            if (!search) return true;
            return (entry.game.name ?? "").toLowerCase().includes(search);
        }).sort((a, b) => {
            if (sort === "name") return (a.game.name ?? "").localeCompare(b.game.name ?? "");
            if (sort === "release") return Number(b.game.releaseDate ?? 0) - Number(a.game.releaseDate ?? 0);
            if (sort === "added") return Number(b.addedAt ?? 0) - Number(a.addedAt ?? 0);
            return (a.position ?? 0) - (b.position ?? 0);
        });
    }, [entries, query, sort]);

    if (!entries.length) {
        return <p className="rounded border border-border bg-bg p-4 text-text-muted">No games in this playlist yet.</p>;
    }

    if (mode === "RANKING") {
        return (
            <div className="flex flex-col gap-2">
                {ordered.map((entry, index) => (
                    <EntryShell key={entry.id} listId={listId} entry={entry} canEdit={canEdit} tiers={tiers}>
                        <Link href={`/game/${entry.game.slug}`} className="grid grid-cols-[3rem_4rem_minmax(0,1fr)] items-center gap-4 border-b border-border bg-bg p-3 hover:border-primary">
                            <p className="text-center text-2xl font-bold text-primary">#{index + 1}</p>
                            <GameCard game={entry.game} size={56} />
                            <div className="min-w-0 pr-10">
                                <p className="truncate font-bold">{entry.game.name}</p>
                                <p className="text-sm text-text-muted">{entry.game.releaseDate ? new Date(entry.game.releaseDate).getFullYear() : "Unknown release"}</p>
                            </div>
                        </Link>
                    </EntryShell>
                ))}
            </div>
        );
    }

    if (mode === "TIER") {
        return (
            <div className="flex flex-col">
                {tiers.map((tier, index) => {
                    const tierEntries = ordered.filter((entry) => (entry.tier ?? tiers[0] ?? "A") === tier);

                    return (
                        <div key={tier} className="grid grid-cols-[4rem_minmax(0,1fr)] overflow-hidden border-border bg-bg not-last:border-b">
                            <div className="flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: tierColors[index] ?? "var(--primary)", color: "var(--text)" }}>{tier}</div>
                            <div className="grid min-h-38 grid-cols-[repeat(auto-fill,7rem)] p-3">
                                {tierEntries.map((entry) => (
                                    <EntryShell key={entry.id} listId={listId} entry={entry} canEdit={canEdit} tiers={tiers}>
                                        <GameCard game={entry.game} size={96} hover="name" slugged={true} />
                                    </EntryShell>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" size={17} />
                    <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search playlist" className="pl-9" />
                </div>
                <Select value={sort} onChange={(event) => setSort(event.target.value)} className="border-t-0 border-l-0 border-r-0 rounded-none">
                    <option value="position">Playlist order</option>
                    <option value="added">Recently added</option>
                    <option value="name">Name</option>
                    <option value="release">Release date</option>
                </Select>
            </div>
            {filtered.length ? (
                <div className="grid gap-4 grid-cols-[repeat(auto-fill,8rem)]">
                    {filtered.map((entry) => (
                        <EntryShell key={entry.id} listId={listId} entry={entry} canEdit={canEdit} tiers={tiers}>
                            <GameCard game={entry.game} size={128} hover="name" slugged={true} />
                        </EntryShell>
                    ))}
                </div>
            ) : (
                <p className="rounded border border-border bg-bg p-4 text-text-muted">No games found.</p>
            )}
        </div>
    );
}
