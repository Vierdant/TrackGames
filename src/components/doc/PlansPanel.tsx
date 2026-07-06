import { Check, Heart, Minus } from "lucide-react";
import { PrimaryButton } from "@/components/ui/control/Button";
import { joinClass } from "@/lib/util/client/func";

const features = [
	{ label: "Track unlimited games", free: true, backer: true },
	{ label: "Playlists, tier lists & custom sorting", free: true, backer: true },
	{ label: "Ratings, play logs & reviews", free: true, backer: true },
	{ label: "Customizable profile & widgets", free: true, backer: true },
	{ label: "Import from other trackers", free: true, backer: true },
	{ label: "Supporter badge on your profile", free: false, backer: true },
	{ label: "Animated profile backgrounds", free: false, backer: true },
	{ label: "Extra accent themes & profile colors", free: false, backer: true },
	{ label: "Higher import & playlist limits", free: false, backer: true },
	{ label: "Early access to new features", free: false, backer: true },
	{ label: "A warm fuzzy feeling for keeping the lights on", free: false, backer: true },
];

function FeatureRow({ included }: Readonly<{ included: boolean }>) {
	return included ? (
		<Check size={16} className="mt-0.5 shrink-0 text-success" aria-label="Included" />
	) : (
		<Minus size={16} className="mt-0.5 shrink-0 text-text-faint" aria-label="Not included" />
	);
}

function PlanCard({ name, price, blurb, highlight, cta, values }: Readonly<{ name: string; price: string; blurb: string; highlight?: boolean; cta: string; values: boolean[] }>) {
	return (
		<div
			className={joinClass(
				"flex flex-col gap-5 rounded border p-6",
				highlight ? "border-primary bg-linear-to-b from-primary/10 to-transparent" : "border-border bg-bg-secondary/40",
			)}
		>
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-2">
					{highlight && <Heart size={18} className="text-primary" aria-hidden="true" />}
					<h3 className="text-xl font-bold text-text">{name}</h3>
				</div>
				<p className="text-2xl font-bold text-text">{price}</p>
				<p className="text-sm text-text-muted">{blurb}</p>
			</div>

			<ul className="flex flex-col gap-2.5">
				{features.map((feature, index) => (
					<li key={feature.label} className={joinClass("flex gap-2 text-sm", values[index] ? "text-text" : "text-text-faint")}>
						<FeatureRow included={values[index]} />
						<span>{feature.label}</span>
					</li>
				))}
			</ul>

			<PrimaryButton href="/backing" variant={highlight ? "main" : "outline"} className="mt-auto">
				{cta}
			</PrimaryButton>
		</div>
	);
}

export default function PlansPanel({ showHeader = true }: Readonly<{ showHeader?: boolean }>) {
	return (
		<div className="flex flex-col gap-6">
			{showHeader && (
				<div className="flex flex-col gap-2">
					<h2 className="text-2xl font-bold text-text">Support TrackGames</h2>
					<p className="max-w-2xl text-sm text-text-muted">
						TrackGames is free to use and always will be. Backing the project is an optional way to help cover hosting and development — and it unlocks a few extras as
						a thank you.
					</p>
				</div>
			)}

			<div className="grid gap-4 md:grid-cols-2">
				<PlanCard name="Free" price="$0" blurb="Everything you need to track your games." cta="Current plan" values={features.map((feature) => feature.free)} />
				<PlanCard
					name="Backer"
					price="$4 / month"
					blurb="Support development and unlock the extras."
					highlight
					cta="Become a backer"
					values={features.map((feature) => feature.backer)}
				/>
			</div>

			<p className="text-xs text-text-faint">Prices are placeholders. Backing is optional and cancellable at any time — nothing behind it locks away your existing data.</p>
		</div>
	);
}
