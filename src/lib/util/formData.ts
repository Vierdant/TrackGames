export function formDataString(value: FormDataEntryValue | null | undefined, fallback = "") {
	return typeof value === "string" ? value : fallback;
}

export function formDataStrings(values: FormDataEntryValue[]) {
	return values.filter((value): value is string => typeof value === "string");
}
