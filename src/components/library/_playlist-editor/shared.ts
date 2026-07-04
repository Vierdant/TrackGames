export function timeModeLabel(mode: string | undefined) {
	return mode === "manual" ? "manual" : "logs";
}

export type EditorTab = "entry" | "log" | "history" | "time";
