export function formatNumber(num: number): string {
	return Intl.NumberFormat("en", {
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(num);
}

export function filterNumber(value: string) {
	if (value === "") return null;

	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}

export function matchesNumberRange(value: number, min: number | null, max: number | null) {
	return (min === null || value >= min) && (max === null || value <= max);
}

export async function chunked<T>(items: T[], size: number, fn: (chunk: T[]) => Promise<void>) {
	for (let index = 0; index < items.length; index += size) {
		await fn(items.slice(index, index + size));
	}
}
