"use client";

import { useEffect, useRef } from "react";
import { formatNumber } from "@/lib/util/format/numbers";

export default function IncrementedNumber({ start = 0, value, duration = 1000 }: Readonly<{ start?: number; value: number; duration?: number }>) {
	const elementRef = useRef(null);

	useEffect(() => {
		animateValue(elementRef.current!, start, value, duration);
	}, [duration, start, value]);

	return <span ref={elementRef}>{start.toLocaleString("en", { maximumFractionDigits: 1 })}</span>;
}

function animateValue(obj: HTMLElement, start: number, value: number, duration: number) {
	let startTimestamp: number | null = null;
	const step = (timestamp: number) => {
		if (!startTimestamp) startTimestamp = timestamp;
		const progress = Math.min((timestamp - startTimestamp) / duration, 1);
		obj.innerHTML = formatNumber(Math.floor(progress * (value - start) + start));
		if (progress < 1) {
			globalThis.requestAnimationFrame(step);
		}
	};
	globalThis.requestAnimationFrame(step);
}
