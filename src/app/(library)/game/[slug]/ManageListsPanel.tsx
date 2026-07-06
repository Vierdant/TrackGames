"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import ConfirmAction from "@/components/ui/ConfirmAction";
import { GhostButton } from "@/components/ui/control/Button";
import { Checkbox } from "@/components/ui/control/Checkbox";
import MenuPanel from "@/components/ui/MenuPanel";
import { joinClass } from "@/lib/util/client/func";

type UserPlaylist = {
	id: string;
	name: string;
	entries: {
		id: string;
		gameId: number;
	}[];
};

type ManageListsPanelProps = Readonly<{
	open: boolean;
	onClose: () => void;
	gameId: number;
	playlists: UserPlaylist[];
	pending: boolean;
	onSubmit: (listIds: string[]) => void;
}>;

export default function ManageListsPanel({ open, onClose, gameId, playlists, pending, onSubmit }: ManageListsPanelProps) {
	const initial = useMemo(
		() => new Set(playlists.filter((playlist) => playlist.entries.some((entry) => entry.gameId === gameId)).map((playlist) => playlist.id)),
		[playlists, gameId],
	);
	const [checked, setChecked] = useState<Set<string>>(initial);
	const dirty = checked.size !== initial.size || [...checked].some((id) => !initial.has(id));

	function toggle(listId: string) {
		setChecked((current) => {
			const next = new Set(current);
			if (next.has(listId)) {
				next.delete(listId);
			} else {
				next.add(listId);
			}
			return next;
		});
	}

	return (
		<MenuPanel
			open={open}
			onClose={onClose}
			title="Manage lists"
			width="30rem"
			submitLabel="Save"
			isSubmitPending={pending}
			onSubmit={() => onSubmit([...checked])}
			isConfirm
			isDirty={dirty}
			confirmModal={
				<ConfirmAction
					open={false}
					title="Discard changes?"
					message="You have unsaved changes. Save them, go back to editing, or close without saving."
					secondaryLabel="Save"
					onSecondary={() => onSubmit([...checked])}
					cancelLabel="Back"
					confirmLabel="Confirm"
					pending={pending}
					onClose={() => {}}
					onConfirm={() => {}}
				/>
			}
		>
			<div className="flex flex-col gap-2">
				{playlists.length ? (
					playlists.map((playlist) => (
						<div
							key={playlist.id}
							role="button"
							tabIndex={0}
							onClick={() => !pending && toggle(playlist.id)}
							onKeyDown={(event) => {
								if (event.key !== "Enter" && event.key !== " ") return;
								event.preventDefault();
								if (!pending) toggle(playlist.id);
							}}
							className={joinClass(
								"flex min-w-0 cursor-pointer items-center gap-3 rounded border border-border bg-bg-secondary p-3",
								pending && "cursor-wait opacity-60",
							)}
						>
							<Checkbox checked={checked.has(playlist.id)} disabled={pending} readOnly className="pointer-events-none" />
							<span className="min-w-0 flex-1 truncate font-bold text-text">{playlist.name}</span>
							<GhostButton
								variant="outline"
								href={`/playlist/${playlist.id}`}
								target="_blank"
								rel="noopener noreferrer"
								onClick={(event) => event.stopPropagation()}
								aria-label={`View ${playlist.name}`}
								title="View"
								className="px-2 py-1"
							>
								View
								<ExternalLink size={16} />
							</GhostButton>
						</div>
					))
				) : (
					<p className="rounded border border-border bg-bg-secondary p-3 text-sm text-text-muted">No playlists yet.</p>
				)}
			</div>
		</MenuPanel>
	);
}
