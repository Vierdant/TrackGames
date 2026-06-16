"use client";

import GamePlaylistDisplay from "@/app/components/game/GamePlaylistDispaly";
import { createPlaylist } from "@/lib/actions/playlists";
import { GameList } from "@/lib/types";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { GhostButton, PrimaryButton } from "../../components/ui/Buttons";
import { Input, Select, Textarea } from "../../components/ui/Inputs";

export default function ProfilePlaylists({ playlists, canCreate }: { playlists: GameList[]; canCreate: boolean }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {playlists.map((playlist) => (
                    <GamePlaylistDisplay
                        key={playlist.id}
                        games={playlist.entries.slice(0, 4).map((entry) => entry.game)}
                        title={playlist.name}
                        href={`/playlist/${playlist.id}`}
                    />
                ))}
                {canCreate && (
                    <button type="button" onClick={() => setOpen(true)} className="flex aspect-80/49 w-full max-w-82 cursor-pointer flex-col items-center justify-center rounded border border-border text-text-muted transition-colors hover:border-primary hover:text-primary">
                        <Plus size={48} />
                        <span className="mt-2 text-sm font-bold">Create playlist</span>
                    </button>
                )}
                {!playlists.length && !canCreate && (
                    <p className="rounded border border-border bg-bg p-4 text-sm text-text-muted">No playlists yet.</p>
                )}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4">
                    <div className="w-full max-w-lg rounded bg-bg p-5 shadow-main">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="text-lg font-bold">Create playlist</h3>
                        </div>
                        <form action={createPlaylist} className="flex flex-col gap-3">
                            <label className="text-sm font-bold text-text-muted w-full">
                                Name
                                <Input name="name" required maxLength={80} />
                            </label>
                            <label className="text-sm font-bold text-text-muted">
                                Description
                                <Textarea name="description" rows={1} maxLength={500} />
                            </label>
                            <div className="mt-2 flex justify-end gap-2">
                                <GhostButton type="button" onClick={() => setOpen(false)}>Cancel</GhostButton>
                                <PrimaryButton type="submit">Create</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
