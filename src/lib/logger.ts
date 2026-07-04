import { type ActionResult } from "@/lib/types";

type Level = "debug" | "info" | "warn" | "error";

const isProduction = process.env.NODE_ENV === "production";

function formatMeta(meta: unknown): string {
	if (meta === undefined) return "";
	if (meta instanceof Error) return ` ${meta.name}: ${meta.message}`;

	try {
		return " " + JSON.stringify(meta);
	} catch {
		return " " + String(meta);
	}
}

/** Writes a single structured line: `[level][scope] message <meta>`. `debug` is dropped in production. */
function write(level: Level, scope: string, message: string, meta?: unknown) {
	if (level === "debug" && isProduction) return;

	const line = `[${level}][${scope}] ${message}${formatMeta(meta)}`;

	if (level === "error") console.error(line);
	else if (level === "warn") console.warn(line);
	else console.log(line);
}

export function inputError(error: string): ActionResult {
	return { error };
}

export const logger = {
	/** Verbose developer detail; suppressed in production. */
	debug: (scope: string, message: string, meta?: unknown) => write("debug", scope, message, meta),
	/** Normal operational events. */
	info: (scope: string, message: string, meta?: unknown) => write("info", scope, message, meta),
	/** Recoverable problems that don't fail the request. */
	warn: (scope: string, message: string, meta?: unknown) => write("warn", scope, message, meta),
	/** Failures worth investigating; pass the caught error as `meta`. */
	error: (scope: string, message: string, meta?: unknown) => write("error", scope, message, meta),
};
