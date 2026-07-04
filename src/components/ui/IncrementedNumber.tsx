"use client";

import { useEffect, useRef } from "react";
import { formatNumber } from "@/lib/util/format/numbers";

export default function IncrementedNumber({
	start = 0,
	value,
	duration = 1000,
	chunked = false,
}: Readonly<{ start?: number; value: number; duration?: number; chunked?: boolean | number }>) {
	const elementRef = useRef(null);

	useEffect(() => {
		animateValue(elementRef.current!, start, value, duration, chunked);
	}, [duration, start, value, chunked]);

	return <span ref={elementRef}>{formatNumber(start)}</span>;
}

function chunkStep(value: number) {
	if (value < 10) return 1;
	return 10 ** Math.floor(Math.log10(value));
}

function animateValue(obj: HTMLElement, start: number, value: number, duration: number, chunked: boolean | number) {
	let step = 0;
	if (chunked === true) step = chunkStep(value);
	else if (chunked !== false) step = chunked;
	let startTimestamp: number | null = null;
	const tick = (timestamp: number) => {
		if (!startTimestamp) startTimestamp = timestamp;
		const progress = Math.min((timestamp - startTimestamp) / duration, 1);
		const current = progress * (value - start) + start;
		obj.innerHTML = formatNumber(chunked ? Math.min(Math.ceil(current / step) * step, value) : Math.floor(current));
		if (progress < 1) {
			globalThis.requestAnimationFrame(tick);
		}
	};
	globalThis.requestAnimationFrame(tick);
}
