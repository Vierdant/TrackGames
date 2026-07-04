import Link from "next/link";
import { Lock } from "lucide-react";

export default function PrivateDisplay({ message, canBackOption }: Readonly<{ message?: string; canBackOption?: boolean }>) {
	return (
		<div className="grid h-full min-h-64 w-full place-items-center p-6">
			<div className="flex flex-col items-center justify-center gap-3 text-center">
				<Lock className="size-[clamp(4rem,18vw,8.75rem)] text-text-muted" aria-hidden="true" strokeWidth={1.5} />
				<p className="text-[clamp(0.875rem,2vw,1rem)] text-text-muted">{message || "This viewing is private"}</p>
				{canBackOption && (
					<Link href="/" className="text-[clamp(0.435rem,2vw,0.8rem)] text-text-muted underline underline-offset-5 hover:text-primary">
						Go back to home page
					</Link>
				)}
			</div>
		</div>
	);
}
