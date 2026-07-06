"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { DangerButton, GhostButton, PrimaryButton } from "@/components/ui/control/Button";
import { TextInput } from "@/components/ui/control/TextInput";
import MenuPanel from "@/components/ui/MenuPanel";
import { deferHook } from "@/lib/util/client/func";

type ConfirmActionProps = Readonly<{
	open: boolean;
	title: ReactNode;
	message: ReactNode;
	confirmLabel: string;
	cancelLabel?: string;
	secondaryLabel?: string;
	onSecondary?: () => void;
	pending?: boolean;
	requireText?: string;
	requireLabel?: string;
	error?: string;
	onClose: () => void;
	onConfirm: () => void;
}>;

export default function ConfirmAction({
	open,
	title,
	message,
	confirmLabel,
	cancelLabel = "Cancel",
	secondaryLabel,
	onSecondary,
	pending,
	requireText,
	requireLabel,
	error,
	onClose,
	onConfirm,
}: ConfirmActionProps) {
	const [step, setStep] = useState(1);
	const [text, setText] = useState("");
	const needsText = Boolean(requireText);
	const canConfirm = !needsText || text === requireText;

	useEffect(() => {
		if (!open) return;

		return deferHook(() => {
			setStep(1);
			setText("");
		});
	}, [open]);

	return (
		<MenuPanel open={open} onClose={onClose} title={title} width="28rem" shouldShowClose={false}>
			<div className="flex flex-col gap-4">
				<p className="text-sm text-text-muted">{message}</p>
				{needsText && step === 2 && (
					<>
						{}
						<TextInput label={requireLabel ?? `Type ${requireText} to confirm`} value={text} onChange={(event) => setText(event.target.value)} className="mt-1" />
					</>
				)}
				{error && <p className="text-sm font-bold text-error">{error}</p>}
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						{secondaryLabel && onSecondary && (
							<PrimaryButton type="button" onClick={onSecondary} disabled={pending} className="px-4 py-2">
								{secondaryLabel}
							</PrimaryButton>
						)}
						<GhostButton variant="outline" type="button" onClick={onClose} disabled={pending} className="px-4 py-2">
							{cancelLabel}
						</GhostButton>
					</div>
					{needsText && step === 1 ? (
						<PrimaryButton type="button" onClick={() => setStep(2)} disabled={pending} className="px-4 py-2">
							Continue
						</PrimaryButton>
					) : (
						<DangerButton type="button" onClick={onConfirm} disabled={pending || !canConfirm}>
							{pending ? "Working..." : confirmLabel}
						</DangerButton>
					)}
				</div>
			</div>
		</MenuPanel>
	);
}
