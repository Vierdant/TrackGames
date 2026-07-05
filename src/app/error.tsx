"use client";

import { useEffect } from "react";
import { Home, RotateCcw } from "lucide-react";
import { GhostButton, PrimaryButton } from "@/components/ui/Buttons";

export default function ErrorPage({ error, reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="flex h-full min-h-64 w-full flex-col items-center justify-center gap-4 p-6 text-center">
			<h1 className="mt-12 px-4 text-[clamp(4rem,18vw,6.75rem)] leading-none font-bold text-primary sm:mt-18">
				5<span className="text-secondary">0</span>0
			</h1>
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-bold text-text md:text-2xl">Something went wrong</h2>
				<p className="text-sm text-text-muted md:text-base">Oops... An unexpected error occurred, sorry</p>
			</div>
			<div className="flex w-auto flex-row justify-center gap-3">
				<PrimaryButton onClick={reset} className="w-full sm:w-auto">
					<RotateCcw className="size-4" aria-hidden="true" />
					Try again
				</PrimaryButton>
				<GhostButton href="/" className="w-full sm:w-auto">
					<Home className="size-4" aria-hidden="true" />
					Home
				</GhostButton>
			</div>
		</main>
	);
}
