"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { GhostButton } from "@/components/ui/control/Button";
import { ColorPicker } from "@/components/ui/control/ColorPicker";
import { TextInput } from "@/components/ui/control/TextInput";

type TierLabelsFormProps = Readonly<{
	tiers: string[];
	colors: string[];
}>;

function filterLabelledColors(
	current: {
		label: string;
		color: string;
	}[],
	index: number,
) {
	return current.filter((_, itemIndex) => itemIndex !== index);
}

export default function TierLabelsForm({ tiers, colors }: TierLabelsFormProps) {
	const [open, setOpen] = useState(false);
	const [items, setItems] = useState(
		(tiers.length ? tiers : ["S", "A", "B", "C", "D"]).map((label, index) => ({
			label,
			color: colors[index] ?? "#64748b",
		})),
	);

	return (
		<div className="mt-4 w-full rounded bg-bg text-text-faint">
			{items.map((tier, index) => (
				<div key={`tier-value-${index}`} className="hidden">
					<input type="hidden" name="tiers" value={tier.label} />
					<input type="hidden" name="colors" value={tier.color} />
				</div>
			))}
			<GhostButton
				variant="outline"
				type="button"
				onClick={() => setOpen(!open)}
				className="flex h-10 w-full cursor-pointer items-center justify-between gap-2 border-none px-2.5 font-bold"
			>
				Tier labels
				{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
			</GhostButton>
			{open && (
				<div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
					{items.map((tier, index) => (
						<div key={index} className="flex gap-2">
							<ColorPicker
								value={tier.color}
								shouldShowValue={false}
								onChange={(event) => {
									const next = [...items];
									next[index] = { ...next[index], color: event.target.value };
									setItems(next);
								}}
								className="h-9 max-w-12 shrink-0 p-1"
								aria-label={`${tier.label} color`}
							/>
							<TextInput
								value={tier.label}
								maxLength={24}
								onChange={(event) => {
									const next = [...items];
									next[index] = { ...next[index], label: event.target.value };
									setItems(next);
								}}
							/>
							<button
								type="button"
								onClick={() => setItems((current) => filterLabelledColors(current, index))}
								disabled={items.length === 1}
								className="grid size-9 shrink-0 cursor-pointer place-items-center rounded text-text-muted hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
								aria-label="Remove tier"
							>
								<Trash2 size={16} />
							</button>
						</div>
					))}
					<button
						type="button"
						onClick={() => setItems((current) => [...current, { label: "New tier", color: "#64748b" }])}
						className="flex w-fit cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm font-bold text-text-muted hover:text-primary"
					>
						<Plus size={16} />
						Add tier
					</button>
				</div>
			)}
		</div>
	);
}
