import Link from "next/link";
import { Lock } from "lucide-react";

export function PrivateDisplay({ message, extended, canBackOption }: Readonly<{ message?: string; extended?: boolean; canBackOption?: boolean }>) {
	const body = (
		<div className="flex flex-col items-center justify-center gap-3 text-center">
			<Lock className="size-[clamp(4rem,18vw,8.75rem)] text-text-muted" aria-hidden="true" strokeWidth={1.5} />
			<p className="text-[clamp(0.875rem,2vw,1rem)] text-text-muted">{message || "This viewing is private"}</p>
			{canBackOption && (
				<Link href="/" className="text-[clamp(0.435rem,2vw,0.8rem)] text-text-muted underline underline-offset-5 hover:text-primary">
					Go back to home page
				</Link>
			)}
		</div>
	);

	return extended ? (
		<main className="relative z-0 grid h-full min-h-96 w-full flex-1 place-items-center bg-bg/95 p-6">{body}</main>
	) : (
		<div className="grid h-full min-h-64 w-full place-items-center p-6">{body}</div>
	);
}
