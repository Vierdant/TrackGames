// Client-side analytics buffer. Events accumulate in memory and are flushed to
// the analytics endpoint in batches (on a timer and when the page is hidden), so
// interactions never trigger a request each. Failed flushes are re-buffered.

const buffer = new Map<string, number>();

const ENDPOINT = "/api/analytics";

export function track(key: string, delta = 1) {
	buffer.set(key, (buffer.get(key) ?? 0) + delta);
}

function restore(events: Record<string, number>) {
	for (const [key, value] of Object.entries(events)) {
		buffer.set(key, (buffer.get(key) ?? 0) + value);
	}
}

export function flush(useBeacon = false) {
	if (buffer.size === 0) return;

	const events: Record<string, number> = {};
	for (const [key, value] of buffer) events[key] = value;
	buffer.clear();

	const body = JSON.stringify({ events });

	try {
		if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
			const ok = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
			if (!ok) restore(events);
			return;
		}

		fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => restore(events));
	} catch {
		restore(events);
	}
}
