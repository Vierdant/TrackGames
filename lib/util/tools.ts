export function filterNumber(value: string) {
	if (value === "") return null;

	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}

export function matchesNumberRange(value: number, min: number | null, max: number | null) {
	return (min === null || value >= min) && (max === null || value <= max);
}
