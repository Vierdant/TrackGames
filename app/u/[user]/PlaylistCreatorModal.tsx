"use client";

import { GhostButton, PrimaryButton } from "@/app/components/ui/Buttons";
import { Input, Textarea } from "@/app/components/ui/Inputs";
import MenuPanel from "@/app/components/ui/MenuPanel";
import { createPlaylist } from "@/lib/actions/playlists";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function PlaylistCreatorModal({ canCreate }: Readonly<{ canCreate: boolean }>) {
	const [open, setOpen] = useState(false);

	return (
		<>
			{canCreate && (
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="flex aspect-80/49 w-full max-w-82 cursor-pointer flex-col items-center justify-center rounded border border-border text-text-muted transition-colors hover:border-primary hover:text-primary"
				>
					<Plus size={48} />
					<span className="mt-2 text-sm font-bold">Create playlist</span>
				</button>
			)}
			<MenuPanel open={open} onClose={() => setOpen(false)} title="Create playlist" panelClassName="max-w-lg bg-bg">
				<form action={createPlaylist} className="flex flex-col gap-3">
					<label className="w-full text-sm font-bold text-text-muted">
						Name
						<Input name="name" required maxLength={80} />
					</label>
					<label className="text-sm font-bold text-text-muted">
						Description
						<Textarea name="description" rows={1} maxLength={500} />
					</label>
					<div className="mt-2 flex justify-end gap-2">
						<GhostButton type="button" onClick={() => setOpen(false)}>
							Cancel
						</GhostButton>
						<PrimaryButton type="submit">Create</PrimaryButton>
					</div>
				</form>
			</MenuPanel>
		</>
	);
}
