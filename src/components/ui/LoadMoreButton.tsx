"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Client "Load more" control that shows a spinner while the next page streams in. */
export default function LoadMoreButton({ href }: Readonly<{ href: string }>) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	return (
		<button
			type="button"
			onClick={() => startTransition(() => router.push(href, { scroll: false }))}
			disabled={isPending}
			className="flex items-center gap-2 rounded bg-primary px-5 py-2 text-sm font-semibold text-bg transition-colors hover:bg-primary-hover disabled:opacity-60"
		>
			{isPending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
			{isPending ? "Loading..." : "Load more"}
		</button>
	);
}
