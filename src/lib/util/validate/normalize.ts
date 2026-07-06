type KeyValue = string | number | symbol;

type IntegerOptions = {
	min?: number;
	max?: number;
	fallback?: number;
};

export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

/** Parses an integer-like value, then optionally clamps it or returns a fallback. */
export function integer(value: unknown, options: IntegerOptions = {}) {
	const parsed = typeof value === "number" ? value : Number(value);

	if (!Number.isInteger(parsed)) return options.fallback;

	return clamp(parsed, options.min ?? parsed, options.max ?? parsed);
}

/*
 * Primitive input normalization
 * Use these for small user/config inputs where multiple spellings should resolve
 * to one accepted value.
 */

/** Accepts common string boolean spellings, plus real booleans. */
export function boolean(value: unknown, fallback = false) {
	if (typeof value === "boolean") return value;
	if (typeof value !== "string") return fallback;

	const normalized = value.trim().toLowerCase();

	if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") return true;
	if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") return false;

	return fallback;
}

/** Lowercases a string input and returns it only when it is in the allowed choices. */
export function choice<T extends string>(value: unknown, choices: readonly T[], fallback?: T) {
	if (typeof value !== "string") return fallback;

	const normalized = value.trim().toLowerCase();
	return choices.find((choice) => choice === normalized) ?? fallback;
}

/** Validates a six-digit hex color and falls back to the site default color. */
export function hexColor(value: unknown, fallback = "#7B5CDB"): string {
	return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

/** Named palette tokens usable in markdown colors, resolved to theme-aware CSS values. */
export const MARKDOWN_COLOR_TOKENS: Record<string, string> = {
	primary: "var(--color-primary)",
	secondary: "var(--color-secondary)",
	success: "var(--color-success)",
	warning: "var(--color-warning)",
	error: "var(--color-error)",
	muted: "var(--color-text-muted)",
};

/**
 * Resolves a markdown color to a safe CSS value: a 3- or 6-digit hex, or a named
 * palette token. Returns undefined when the value is not recognized so callers can
 * skip coloring instead of forcing a fallback.
 */
export function markdownColor(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;

	const token = value.trim().toLowerCase();
	if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(token)) return token;

	return MARKDOWN_COLOR_TOKENS[token];
}

/*
 * List and map-style normalization
 * Use these when an external value must resolve to one item or field from a
 * known list. These are cousins of choice, but for object collections.
 */

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
