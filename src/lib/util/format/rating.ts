import { clamp } from "@/lib/util/validate/normalize";

export function ratingToFive(value?: number | null) {
	if (value == null) return undefined;
	return clamp(value / 20, 0, 5);
}

export function ratingToHundred(value?: number | null) {
	if (value == null) return undefined;
	return clamp(value * 20, 0, 100);
}
