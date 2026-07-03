import IncrementedNumber from "./ui/IncrementedNumber";

type StatBlockProps = Readonly<{ color: string; title: string; value: number }>;

export default function StatBlock({ color, title, value }: StatBlockProps) {
	return (
		<div className="z-1 w-fit min-w-24 justify-self-start rounded-md bg-bg-secondary/80 text-text">
			<div className="flex flex-col items-start px-3 py-2">
				<div className="flex items-center gap-2">
					<span className="block size-2.5 shrink-0" style={{ background: color }}></span>
					<h3 className="text-xs leading-none font-bold">{title}</h3>
				</div>
				<p className="mt-1 text-lg leading-tight font-semibold">
					<IncrementedNumber value={(value as number) ?? "0"} />
				</p>
			</div>
		</div>
	);
}
