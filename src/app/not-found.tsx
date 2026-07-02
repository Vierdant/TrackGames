import { Home } from "lucide-react";
import { PrimaryButton } from "@/components/ui/Buttons";

export default function NotFound() {
	return (
		<main className="flex h-full min-h-64 w-full flex-col items-center justify-center gap-4 p-6 text-center">
			<h1 className="mt-12 px-4 text-[clamp(4rem,18vw,6.75rem)] leading-none font-bold text-primary sm:mt-18">
				4<span className="text-secondary">0</span>4
			</h1>
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-bold text-text md:text-2xl">Page not found</h2>
				<p className="text-sm text-text-muted md:text-base">Oops... Looks like we don&apos;t have what you are looking for, sorry</p>
			</div>
			<div className="flex w-auto flex-row justify-center gap-3">
				<PrimaryButton href="/" className="w-full sm:w-auto">
					<Home className="size-4" aria-hidden="true" />
					Home
				</PrimaryButton>
			</div>
		</main>
	);
}
