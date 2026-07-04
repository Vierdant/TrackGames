type KeyValue = string | number | symbol;

/** Finds the first item whose field exactly matches a value. */
export function byKey<T extends Record<K, KeyValue>, K extends keyof T>(items: readonly T[], key: K, value: unknown) {
	return items.find((item) => item[key] === value);
}

/** Finds the first item that matches every provided field/value pair. */
export function byKeys<T extends object>(items: readonly T[], matches: Partial<T>) {
	const entries = Object.entries(matches) as [keyof T, unknown][];

	return items.find((item) => entries.every(([key, value]) => item[key] === value));
}

/** Resolves an external value to the canonical value stored in a known list. */
export function value<T extends Record<K, KeyValue>, K extends keyof T, F extends T[K]>(input: unknown, items: readonly T[], key: K, fallback: F) {
	return byKey(items, key, input)?.[key] ?? fallback;
}

/** Resolves a display label for a value stored in a known list. */
export function label<T extends Record<ValueKey | LabelKey, KeyValue>, ValueKey extends keyof T, LabelKey extends keyof T>(
	items: readonly T[],
	valueKey: ValueKey,
	labelKey: LabelKey,
	input: unknown,
	fallback: string,
) {
	const label = byKey(items, valueKey, input)?.[labelKey];

	return typeof label === "string" ? label : fallback;
}
