import { MarkdownAlign, type MarkdownBlock } from "@/lib/types";
import * as normalize from "@/lib/util/validate/normalize";
import { isSafeLinkHref, isSafeUrl } from "@/lib/util/validate/safety";

type ActiveState =
	| {
			type: "group";
			align?: MarkdownAlign;
			color?: string;
			href?: string;
			lines: string[];
	  }
	| {
			type: "grid";
			columns: number;
			gap: number;
			lines: string[];
	  };

type MediaDirectiveResult = {
	handled: boolean;
	block?: MarkdownBlock;
};

function normalizeAlign(value: string | undefined): MarkdownAlign | undefined {
	switch (normalize.choice(value, ["start", "left", "center", "end", "right"] as const)) {
		case "start":
		case "left":
			return MarkdownAlign.START;
		case "center":
			return MarkdownAlign.CENTER;
		case "end":
		case "right":
			return MarkdownAlign.END;
		default:
			return undefined;
	}
}

function isAttributeKeyChar(char: string) {
	const code = char.codePointAt(0);
	if (!code) return false;

	return (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || code === 95 || (code >= 97 && code <= 122);
}

function isWhitespace(char: string) {
	return char === " " || char === "\t" || char === "\n" || char === "\r";
}

function skipWhitespace(input: string, index: number) {
	while (index < input.length && isWhitespace(input[index])) index += 1;
	return index;
}

function readAttributeKey(input: string, index: number) {
	const start = index;

	while (index < input.length && isAttributeKeyChar(input[index])) index += 1;
	if (start === index) return null;

	return {
		value: input.slice(start, index).toLowerCase(),
		end: index,
	};
}

function readAttributeValue(input: string, index: number) {
	const quote = input[index] === '"' || input[index] === "'" ? input[index] : "";
	const start = quote ? index + 1 : index;
	let end = start;

	while (end < input.length && (quote ? input[end] !== quote : !isWhitespace(input[end]))) end += 1;

	return {
		value: input.slice(start, end),
		end: quote && input[end] === quote ? end + 1 : end,
	};
}

function parseAttributes(input: string) {
	const attributes: Record<string, string> = {};
	let index = 0;

	while (index < input.length) {
		index = skipWhitespace(input, index);
		const key = readAttributeKey(input, index);

		if (!key || input[key.end] !== "=") {
			index += 1;
			continue;
		}

		const value = readAttributeValue(input, key.end + 1);
		attributes[key.value] = value.value;
		index = value.end;
	}

	return attributes;
}

function splitGridCells(content: string) {
	const cells: string[] = [];
	const current: string[] = [];

	for (const line of content.split("\n")) {
		if (line.trim() === "---cell---") {
			const cell = current.join("\n").trim();
			if (cell) cells.push(cell);
			current.length = 0;
			continue;
		}

		current.push(line);
	}

	const cell = current.join("\n").trim();
	if (cell) cells.push(cell);

	return cells;
}

function parseDirective(line: string, names: readonly string[]) {
	if (!line.startsWith("::")) return null;

	const content = line.slice(2).trimStart();
	let spaceIndex = -1;

	for (let index = 0; index < content.length; index += 1) {
		if (isWhitespace(content[index])) {
			spaceIndex = index;
			break;
		}
	}

	const name = (spaceIndex === -1 ? content : content.slice(0, spaceIndex)).toLowerCase();

	if (!names.includes(name)) return null;

	return {
		name,
		attributes: spaceIndex === -1 ? "" : content.slice(spaceIndex + 1).trimStart(),
	};
}

function pushDefaultBlock(blocks: MarkdownBlock[], defaultLines: string[]) {
	const content = defaultLines.join("\n").trim();
	if (!content) return;

	blocks.push({ type: "markdown", align: MarkdownAlign.START, content });
	defaultLines.length = 0;
}

function activeStateToBlock(active: ActiveState): MarkdownBlock | null {
	const content = active.lines.join("\n").trim();
	if (!content) return null;

	if (active.type === "grid") {
		return {
			type: "grid",
			columns: active.columns,
			gap: active.gap,
			cells: splitGridCells(content).map(parseMarkdownBlocks),
		};
	}

	return {
		type: "group",
		align: active.align,
		color: active.color,
		href: active.href,
		children: parseMarkdownBlocks(content),
	};
}

function pushActiveBlock(blocks: MarkdownBlock[], active: ActiveState | null) {
	if (!active) return;

	const block = activeStateToBlock(active);
	if (block) blocks.push(block);
}

function parseMediaDirective(line: string): MediaDirectiveResult {
	const directive = parseDirective(line, ["image", "video"]);
	if (!directive?.attributes) return { handled: false };

	const attributes = parseAttributes(directive.attributes);
	const src = attributes.src;

	if (!isSafeUrl(src)) return { handled: true };

	const width = normalize.integer(attributes.width, { min: 40, max: 1200 });
	const height = normalize.integer(attributes.height, { min: 40, max: 1200 });
	const align = normalizeAlign(attributes.align ?? "") ?? undefined;
	const rounded = normalize.boolean(attributes.rounded);

	if (directive.name === "image") {
		return {
			handled: true,
			block: {
				type: "image",
				src,
				alt: attributes.alt ?? "",
				align,
				width,
				height,
				fit: normalize.choice(attributes.fit, ["contain", "cover"] as const),
				position: normalize.choice(attributes.position, ["center", "left", "right", "top", "bottom"] as const),
				rounded,
			},
		};
	}

	return {
		handled: true,
		block: {
			type: "video",
			src,
			poster: isSafeUrl(attributes.poster) ? attributes.poster : undefined,
			align,
			width,
			height,
			rounded,
		},
	};
}

function parseBlockDirective(line: string): ActiveState | null {
	const directive = parseDirective(line, ["start", "left", "center", "end", "right", "color", "link", "grid"]);
	if (!directive) return null;

	const attributes = parseAttributes(directive.attributes);

	if (directive.name === "grid") {
		return {
			type: "grid",
			columns: normalize.integer(attributes.columns, { min: 1, max: 4, fallback: 2 }) ?? 2,
			gap: normalize.integer(attributes.gap, { min: 0, max: 32, fallback: 8 }) ?? 8,
			lines: [],
		};
	}

	const href = attributes.href && isSafeLinkHref(attributes.href) ? attributes.href : undefined;
	const colorValue = attributes.value ?? attributes.color;

	return {
		type: "group",
		align: normalizeAlign(directive.name) ?? undefined,
		color: colorValue ? normalize.hexColor(colorValue) : undefined,
		href,
		lines: [],
	};
}

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
	const blocks: MarkdownBlock[] = [];
	const defaultLines: string[] = [];
	const lines = markdown.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");
	let active: ActiveState | null = null;

	for (const line of lines) {
		const trimmed = line.trim();

		if (!active) {
			const mediaDirective = parseMediaDirective(trimmed);

			if (mediaDirective.handled) {
				pushDefaultBlock(blocks, defaultLines);
				if (mediaDirective.block) blocks.push(mediaDirective.block);
				continue;
			}

			active = parseBlockDirective(trimmed);
			if (active) {
				pushDefaultBlock(blocks, defaultLines);
				continue;
			}
		}

		if (trimmed === "::" && active) {
			pushActiveBlock(blocks, active);
			active = null;
			continue;
		}

		if (active) {
			active.lines.push(line);
		} else {
			defaultLines.push(line);
		}
	}

	pushActiveBlock(blocks, active);
	pushDefaultBlock(blocks, defaultLines);

	return blocks;
}
