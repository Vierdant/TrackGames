import { MarkdownAlign, type MarkdownBlock } from "@/lib/types";
import * as normalize from "@/lib/util/validate/normalize";
import { isSafeLinkHref, isSafeUrl } from "@/lib/util/validate/safety";

type BlockTagName = (typeof BLOCK_TAGS)[number];

type OpenTag = { name: BlockTagName; attributes: string };

const BLOCK_TAGS = ["center", "left", "right", "color", "link", "grid"] as const;

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

/** Parses a `key=value` attribute list. Bare words (e.g. `rounded`) become flags. */
function parseAttributes(input: string) {
	const attributes: Record<string, string> = {};
	let index = 0;

	while (index < input.length) {
		index = skipWhitespace(input, index);
		const key = readAttributeKey(input, index);

		if (!key) {
			index += 1;
			continue;
		}

		if (input[key.end] !== "=") {
			attributes[key.value] = "true";
			index = key.end;
			continue;
		}

		const value = readAttributeValue(input, key.end + 1);
		attributes[key.value] = value.value;
		index = value.end;
	}

	return attributes;
}

/** Reads the shorthand value in `[color=…]` / `[link=…]`, quoted or bare. */
function readShorthandValue(attributes: string) {
	const rest = attributes.trimStart();
	if (!rest.startsWith("=")) return undefined;

	const body = rest.slice(1);
	if (body.startsWith('"') || body.startsWith("'")) {
		const end = body.indexOf(body[0], 1);
		return end === -1 ? body.slice(1) : body.slice(1, end);
	}

	const match = /^[^\s\]]+/.exec(body);
	return match ? match[0] : "";
}

/** Matches an opening block tag that stands alone on its line. */
function parseOpenTag(line: string): OpenTag | null {
	const trimmed = line.trim();
	if (!trimmed.startsWith("[") || trimmed.startsWith("[/") || !trimmed.endsWith("]")) return null;

	const inner = trimmed.slice(1, -1);
	// A stray "]" means the tag was used inline on this line (e.g. [center]x[/center]);
	// only own-line tags open a block.
	if (inner.includes("]")) return null;

	let index = 0;
	while (index < inner.length && isAttributeKeyChar(inner[index])) index += 1;

	const name = inner.slice(0, index).toLowerCase();
	if (!(BLOCK_TAGS as readonly string[]).includes(name)) return null;

	return { name: name as BlockTagName, attributes: inner.slice(index) };
}

/** Matches a closing tag that stands alone on its line, returning its name. */
function parseCloseTag(line: string) {
	const match = /^\[\/([a-z]+)]$/i.exec(line.trim());
	return match ? match[1].toLowerCase() : null;
}

/** Builds an image/video block from a self-closing media tag alone on its line. */
function parseMediaLine(line: string): MarkdownBlock | null | undefined {
	const match = /^\[(image|video)\b([^\]]*)]$/i.exec(line.trim());
	if (!match) return null;

	const attributes = parseAttributes(match[2]);
	const src = attributes.src;

	// Recognized as media but the source is unsafe: drop it (undefined) instead of
	// leaking the raw tag into the text.
	if (!isSafeUrl(src)) return undefined;

	const width = normalize.integer(attributes.width, { min: 40, max: 1200 });
	const height = normalize.integer(attributes.height, { min: 40, max: 1200 });
	const align = normalizeAlign(attributes.align);
	const rounded = normalize.boolean(attributes.rounded);

	if (match[1].toLowerCase() === "image") {
		return {
			type: "image",
			src,
			alt: attributes.alt ?? "",
			align,
			width,
			height,
			fit: normalize.choice(attributes.fit, ["contain", "cover"] as const),
			position: normalize.choice(attributes.position, ["center", "left", "right", "top", "bottom"] as const),
			rounded,
		};
	}

	return {
		type: "video",
		src,
		poster: isSafeUrl(attributes.poster) ? attributes.poster : undefined,
		align,
		width,
		height,
		rounded,
	};
}

/** Splits grid inner lines into cells on `[cell]` separators (leading one optional). */
function splitGridCells(lines: string[]) {
	const cells: string[] = [];
	const current: string[] = [];

	for (const line of lines) {
		if (/^\[cell]$/i.test(line.trim())) {
			cells.push(current.join("\n").trim());
			current.length = 0;
			continue;
		}

		current.push(line);
	}

	cells.push(current.join("\n").trim());

	return cells.filter((cell) => cell.length > 0);
}

function buildBlock(open: OpenTag, innerLines: string[]): MarkdownBlock | null {
	const inner = innerLines.join("\n");

	if (open.name === "grid") {
		const attributes = parseAttributes(open.attributes);
		const cells = splitGridCells(innerLines).map(parseMarkdownBlocks);
		if (cells.length === 0) return null;

		return {
			type: "grid",
			columns: normalize.integer(attributes.columns ?? attributes.cols, { min: 1, max: 4, fallback: 2 }) ?? 2,
			gap: normalize.integer(attributes.gap, { min: 0, max: 32, fallback: 8 }) ?? 8,
			cells,
		};
	}

	const children = parseMarkdownBlocks(inner);
	if (children.length === 0) return null;

	if (open.name === "link") {
		const href = readShorthandValue(open.attributes) ?? parseAttributes(open.attributes).href;
		return { type: "group", href: href && isSafeLinkHref(href) ? href : undefined, children };
	}

	if (open.name === "color") {
		const attributes = parseAttributes(open.attributes);
		const color = normalize.markdownColor(readShorthandValue(open.attributes) ?? attributes.value ?? attributes.color);
		return { type: "group", color, children };
	}

	return { type: "group", align: normalizeAlign(open.name), children };
}

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
	const blocks: MarkdownBlock[] = [];
	const text: string[] = [];
	const lines = markdown.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");

	const flushText = () => {
		const content = text.join("\n").trim();
		if (content) blocks.push({ type: "markdown", align: MarkdownAlign.START, content });
		text.length = 0;
	};

	let index = 0;

	while (index < lines.length) {
		const line = lines[index];

		const media = parseMediaLine(line);
		if (media !== null) {
			flushText();
			if (media) blocks.push(media);
			index += 1;
			continue;
		}

		const open = parseOpenTag(line);
		if (open) {
			// Walk forward to the matching close, balancing nested tags of the same name
			// so [center] inside [center] closes at the right depth.
			let depth = 1;
			let close = lines.length;

			for (let scan = index + 1; scan < lines.length; scan += 1) {
				if (parseOpenTag(lines[scan])?.name === open.name) {
					depth += 1;
				} else if (parseCloseTag(lines[scan]) === open.name) {
					depth -= 1;
					if (depth === 0) {
						close = scan;
						break;
					}
				}
			}

			flushText();
			const block = buildBlock(open, lines.slice(index + 1, close));
			if (block) blocks.push(block);
			index = close < lines.length ? close + 1 : close;
			continue;
		}

		text.push(line);
		index += 1;
	}

	flushText();

	return blocks;
}
