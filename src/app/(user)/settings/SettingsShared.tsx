"use client";

import { useEffect, useState } from "react";
import { GhostButton, PrimaryButton } from "@/components/ui/control/Button";
import { TextInput } from "@/components/ui/control/TextInput";
import MenuPanel from "@/components/ui/MenuPanel";

type MediaModelProps = Readonly<{ open: boolean; title: string; value: string; onClose: () => void; onSave: (value: string) => void }>;

export function MediaModal({ open, title, value, onClose, onSave }: MediaModelProps) {
	const [draft, setDraft] = useState(value);

	useEffect(() => {
		if (!open) return;

		const frame = globalThis.requestAnimationFrame(() => setDraft(value));
		return () => globalThis.cancelAnimationFrame(frame);
	}, [open, value]);

	return (
		<MenuPanel open={open} onClose={onClose} title={title}>
			<div className="flex flex-col gap-3 text-text">
				<TextInput value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="https://..." />
			</div>
			<div className="mt-5 flex justify-end gap-2">
				<GhostButton variant="outline" type="button" onClick={onClose}>
					Cancel
				</GhostButton>
				<PrimaryButton type="button" onClick={() => onSave(draft)}>
					Apply
				</PrimaryButton>
			</div>
		</MenuPanel>
	);
}

export function SaveBar({ pending }: Readonly<{ pending?: boolean }>) {
	return (
		<div className="bottom-4 z-nav mt-5 flex justify-end">
			<div className="flex gap-2 rounded p-2">
				<PrimaryButton type="submit" disabled={pending}>
					{pending ? "Saving..." : "Save"}
				</PrimaryButton>
			</div>
		</div>
	);
}
