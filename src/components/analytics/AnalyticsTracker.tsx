"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { flush, track } from "@/lib/util/client/analytics";

const FLUSH_INTERVAL_MS = 15000;

function normalizePath(path: string) {
	return path.replace(/^\/(game|u|playlist|library)\/[^/]+.*$/, "/$1/:id").replace(/\/+$/, "") || "/";
}

// Records a pageview per route change and named events for any element carrying a
// `data-analytics` attribute, then lets the shared buffer flush them in batches.
export default function AnalyticsTracker() {
	const pathname = usePathname();

	useEffect(() => {
		track("pageview:total");
		track(`pageview:${normalizePath(pathname)}`);
	}, [pathname]);

	useEffect(() => {
		function onClick(event: MouseEvent) {
			const target = event.target as HTMLElement | null;
			const key = target?.closest?.("[data-analytics]")?.getAttribute("data-analytics");
			if (key) track(`event:${key}`);
		}

		function onVisibilityChange() {
			if (document.visibilityState === "hidden") flush(true);
		}

		function onPageHide() {
			flush(true);
		}

		document.addEventListener("click", onClick, true);
		document.addEventListener("visibilitychange", onVisibilityChange);
		globalThis.addEventListener("pagehide", onPageHide);
		const interval = globalThis.setInterval(() => flush(false), FLUSH_INTERVAL_MS);

		return () => {
			document.removeEventListener("click", onClick, true);
			document.removeEventListener("visibilitychange", onVisibilityChange);
			globalThis.removeEventListener("pagehide", onPageHide);
			globalThis.clearInterval(interval);
			flush(false);
		};
	}, []);

	return null;
}
