"use client";

import { DangerButton, GhostButton, PrimaryButton, SecondaryButton, SuccessButton } from "@/components/ui/control/Button";

const buttons = [
	{ label: "Primary", Btn: PrimaryButton },
	{ label: "Secondary", Btn: SecondaryButton },
	{ label: "Ghost", Btn: GhostButton },
	{ label: "Danger", Btn: DangerButton },
	{ label: "Success", Btn: SuccessButton },
] as const;

const variants = ["main", "outline", "text"] as const;

export default function ButtonShowcase() {
	return (
		<main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8">
			<h1 className="text-2xl font-bold text-text">Buttons</h1>
			{buttons.map(({ label, Btn }) => (
				<div key={label} className="flex flex-col gap-2">
					<h2 className="text-sm font-bold text-text-muted">{label}</h2>
					<div className="flex flex-wrap items-center gap-3">
						{variants.map((variant) => (
							<Btn key={variant} variant={variant}>
								{variant}
							</Btn>
						))}
					</div>
				</div>
			))}
		</main>
	);
}
