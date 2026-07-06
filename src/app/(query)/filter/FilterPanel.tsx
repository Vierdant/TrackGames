"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { AdvancedFilterButton, GhostButton, PrimaryButton } from "@/components/ui/control/Button";
import { TextInput } from "@/components/ui/control/TextInput";
import MenuPanel from "@/components/ui/MenuPanel";
import RemovableChip from "@/components/ui/RemovableChip";
import { MULTIPLAYER_FILTERS, type MultiplayerFilterKey } from "@/lib/data/filters";
import { PlayerPerspective } from "@/lib/generated/prisma/enums";
import { joinClass } from "@/lib/util/client/func";

export type FilterOption = { id: number; name: string };

type IdFacet = "genres" | "themes" | "platforms";

type FilterPanelProps = Readonly<{
	selectedGenres: FilterOption[];
	selectedThemes: FilterOption[];
	selectedPlatforms: FilterOption[];
	selectedPerspectives: PlayerPerspective[];
	selectedModes: MultiplayerFilterKey[];
	selectedFrom: string;
	selectedTill: string;
}>;

export const PERSPECTIVE_LABELS: Record<PlayerPerspective, string> = {
	FIRST_PERSON: "First person",
	THIRD_PERSON: "Third person",
	BIRD_VIEW__SLASH_ISOMETRIC: "Bird view / isometric",
	SIDE_VIEW: "Side view",
	TEXT: "Text",
	AUDITORY: "Auditory",
	VIRTUAL_REALITY: "Virtual reality",
};

const ID_FACET_LABELS: Record<IdFacet, string> = {
	genres: "Genres",
	themes: "Themes",
	platforms: "Platforms",
};

export default function FilterPanel({ selectedGenres, selectedThemes, selectedPlatforms, selectedPerspectives, selectedModes, selectedFrom, selectedTill }: FilterPanelProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [open, setOpen] = useState(false);
	const [genres, setGenres] = useState<FilterOption[]>(selectedGenres);
	const [themes, setThemes] = useState<FilterOption[]>(selectedThemes);
	const [platforms, setPlatforms] = useState<FilterOption[]>(selectedPlatforms);
	const [perspectives, setPerspectives] = useState<PlayerPerspective[]>(selectedPerspectives);
	const [modes, setModes] = useState<MultiplayerFilterKey[]>(selectedModes);
	const [from, setFrom] = useState(selectedFrom);
	const [till, setTill] = useState(selectedTill);

	const facetState: Record<IdFacet, [FilterOption[], (value: FilterOption[]) => void]> = {
		genres: [genres, setGenres],
		themes: [themes, setThemes],
		platforms: [platforms, setPlatforms],
	};

	const filterCount = genres.length + themes.length + platforms.length + perspectives.length + modes.length + (from ? 1 : 0) + (till ? 1 : 0);

	// Compare the draft to what's actually applied (props) so the "Apply changes" button only shows
	// when a re-fetch would change results.
	const draftKey = filterKey(genres, themes, platforms, perspectives, modes, from, till);
	const appliedKey = filterKey(selectedGenres, selectedThemes, selectedPlatforms, selectedPerspectives, selectedModes, selectedFrom, selectedTill);
	const dirty = draftKey !== appliedKey;

	function apply() {
		const params = new URLSearchParams();
		if (genres.length) params.set("genres", genres.map((option) => option.id).join(","));
		if (themes.length) params.set("themes", themes.map((option) => option.id).join(","));
		if (platforms.length) params.set("platforms", platforms.map((option) => option.id).join(","));
		if (perspectives.length) params.set("perspectives", perspectives.join(","));
		if (modes.length) params.set("modes", modes.join(","));
		if (from) params.set("from", from);
		if (till) params.set("till", till);

		setOpen(false);
		startTransition(() => router.push(params.toString() ? `/filter?${params}` : "/filter"));
	}

	function clearAll() {
		setGenres([]);
		setThemes([]);
		setPlatforms([]);
		setPerspectives([]);
		setModes([]);
		setFrom("");
		setTill("");
		setOpen(false);
		startTransition(() => router.push("/filter"));
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<AdvancedFilterButton onClick={() => setOpen(true)} filterCount={filterCount} />
				{dirty && (
					<PrimaryButton type="button" onClick={apply} className="h-9 py-0" disabled={isPending}>
						{isPending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : "Apply changes"}
					</PrimaryButton>
				)}
				{isPending && !dirty && <Loader2 size={18} className="animate-spin text-text-muted" aria-label="Applying filters" />}
				{filterCount > 0 && (
					<button
						type="button"
						onClick={clearAll}
						disabled={isPending}
						className="cursor-pointer text-sm text-text-muted transition-colors hover:text-primary disabled:opacity-50"
					>
						Clear all
					</button>
				)}
			</div>

			{filterCount > 0 && (
				<div className={joinClass("flex flex-wrap gap-2 transition-opacity", isPending && "opacity-60")}>
					{(["genres", "themes", "platforms"] as IdFacet[]).flatMap((facet) => {
						const [values, setValues] = facetState[facet];
						return values.map((option) => (
							<RemovableChip key={`${facet}-${option.id}`} variant="include" onRemove={() => setValues(values.filter((item) => item.id !== option.id))}>
								{option.name}
							</RemovableChip>
						));
					})}
					{perspectives.map((perspective) => (
						<RemovableChip key={perspective} variant="include" onRemove={() => setPerspectives(perspectives.filter((item) => item !== perspective))}>
							{PERSPECTIVE_LABELS[perspective]}
						</RemovableChip>
					))}
					{modes.map((mode) => (
						<RemovableChip key={mode} variant="include" onRemove={() => setModes(modes.filter((item) => item !== mode))}>
							{MULTIPLAYER_FILTERS[mode]}
						</RemovableChip>
					))}
					{from && (
						<RemovableChip variant="include" onRemove={() => setFrom("")}>
							From {from}
						</RemovableChip>
					)}
					{till && (
						<RemovableChip variant="include" onRemove={() => setTill("")}>
							Till {till}
						</RemovableChip>
					)}
				</div>
			)}

			<MenuPanel open={open} onClose={() => setOpen(false)} variant="drawer-left" width="28rem" title="Filter" shouldShowClose={false}>
				<div className="-m-5 flex h-full flex-col">
					<div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5 text-sm">
						<section className="grid gap-3 sm:grid-cols-2">
							<h4 className="font-bold text-text sm:col-span-2">Release date</h4>
							<TextInput type="date" label="From" value={from} max={till || undefined} onChange={(event) => setFrom(event.target.value)} className="h-9 text-sm" />
							<TextInput type="date" label="Till" value={till} min={from || undefined} onChange={(event) => setTill(event.target.value)} className="h-9 text-sm" />
						</section>

						{(["genres", "themes", "platforms"] as IdFacet[]).map((facet) => (
							<OptionSearchFacet key={facet} type={facet} label={ID_FACET_LABELS[facet]} selected={facetState[facet][0]} onChange={facetState[facet][1]} />
						))}

						<section>
							<h4 className="mb-2 font-bold text-text">Player perspectives</h4>
							<div className="flex flex-wrap gap-2">
								{Object.values(PlayerPerspective).map((perspective) => {
									const active = perspectives.includes(perspective);
									return (
										<ToggleChip
											key={perspective}
											active={active}
											onClick={() => setPerspectives(active ? perspectives.filter((item) => item !== perspective) : [...perspectives, perspective])}
										>
											{PERSPECTIVE_LABELS[perspective]}
										</ToggleChip>
									);
								})}
							</div>
						</section>

						<section>
							<h4 className="mb-2 font-bold text-text">Multiplayer modes</h4>
							<div className="flex flex-wrap gap-2">
								{(Object.keys(MULTIPLAYER_FILTERS) as MultiplayerFilterKey[]).map((mode) => {
									const active = modes.includes(mode);
									return (
										<ToggleChip key={mode} active={active} onClick={() => setModes(active ? modes.filter((item) => item !== mode) : [...modes, mode])}>
											{MULTIPLAYER_FILTERS[mode]}
										</ToggleChip>
									);
								})}
							</div>
						</section>
					</div>

					<div className="flex shrink-0 justify-end gap-2 border-t border-border bg-bg px-5 py-4">
						<GhostButton variant="outline" type="button" onClick={clearAll} disabled={isPending}>
							Reset
						</GhostButton>
						<PrimaryButton type="button" onClick={apply} disabled={isPending}>
							{isPending ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : "Apply"}
						</PrimaryButton>
					</div>
				</div>
			</MenuPanel>
		</div>
	);
}

function ToggleChip({ active, onClick, children }: Readonly<{ active: boolean; onClick: () => void; children: React.ReactNode }>) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={joinClass(
				"cursor-pointer rounded border px-2 py-1 text-xs font-bold transition-colors",
				active ? "border-primary/60 bg-primary/10 text-primary" : "border-border bg-bg-secondary text-text-muted hover:border-primary hover:text-primary",
			)}
		>
			{children}
		</button>
	);
}

function OptionSearchFacet({ type, label, selected, onChange }: Readonly<{ type: IdFacet; label: string; selected: FilterOption[]; onChange: (value: FilterOption[]) => void }>) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<FilterOption[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		const timer = globalThis.setTimeout(async () => {
			setLoading(true);
			try {
				const response = await fetch(`/api/filter/options?type=${type}&q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
				if (response.ok) setResults(await response.json());
			} catch {
				if (!controller.signal.aborted) setResults([]);
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		}, 180);

		return () => {
			controller.abort();
			globalThis.clearTimeout(timer);
		};
	}, [type, query]);

	const selectedIds = new Set(selected.map((option) => option.id));
	const available = results.filter((option) => !selectedIds.has(option.id));

	return (
		<section>
			<h4 className="mb-2 font-bold text-text">{label}</h4>
			<div className="relative">
				<Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-faint" size={16} aria-hidden="true" />
				<TextInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label.toLowerCase()}`} className="h-9 pr-3 pl-9 text-sm" />
			</div>

			{selected.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-2">
					{selected.map((option) => (
						<RemovableChip key={option.id} variant="include" onRemove={() => onChange(selected.filter((item) => item.id !== option.id))}>
							{option.name}
						</RemovableChip>
					))}
				</div>
			)}

			<div className="mt-2 flex flex-wrap gap-2">
				{loading && !available.length ? (
					<p className="text-text-muted">Loading...</p>
				) : (
					available.slice(0, 30).map((option) => (
						<ToggleChip key={option.id} active={false} onClick={() => onChange([...selected, option])}>
							{option.name}
						</ToggleChip>
					))
				)}
			</div>
		</section>
	);
}

function filterKey(
	genres: FilterOption[],
	themes: FilterOption[],
	platforms: FilterOption[],
	perspectives: PlayerPerspective[],
	modes: MultiplayerFilterKey[],
	from: string,
	till: string,
) {
	const ids = (options: FilterOption[]) =>
		options
			.map((option) => option.id)
			.sort((a, b) => a - b)
			.join(",");
	const values = (items: string[]) => [...items].sort((a, b) => a.localeCompare(b)).join(",");

	return [ids(genres), ids(themes), ids(platforms), values(perspectives), values(modes), from, till].join("|");
}
