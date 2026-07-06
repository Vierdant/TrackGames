"use client";

import { useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Columns3, Eye, Image as ImageIcon, Italic, Link, Palette, Strikethrough, Table, Video } from "lucide-react";
import { MarkdownBlocks } from "@/components/markdown/MarkdownBlocks";
import { GhostButton } from "@/components/ui/control/Button";
import { ColorPicker } from "@/components/ui/control/ColorPicker";
import { TextArea } from "@/components/ui/control/TextArea";
import { TextInput } from "@/components/ui/control/TextInput";
import MenuPanel from "@/components/ui/MenuPanel";
import { parseMarkdownBlocks } from "@/lib/util/parse/markdown";

type MarkdownWidgetEditorProps = Readonly<{
	value: string;
	onChange: (value: string) => void;
}>;

function quoteAttribute(value: string) {
	return value.replaceAll('"', "&quot;");
}

export default function MarkdownWidgetEditor({ value, onChange }: MarkdownWidgetEditorProps) {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const [mediaModal, setMediaModal] = useState<"image" | "video" | null>(null);
	const [lastMediaModal, setLastMediaModal] = useState<"image" | "video">("image");
	const [colorModal, setColorModal] = useState(false);
	const [color, setColor] = useState("#7B5CDB");
	const [showPreview, setShowPreview] = useState(false);
	const [imageSrc, setImageSrc] = useState("");
	const [videoSrc, setVideoSrc] = useState("");
	const [mediaAlt, setMediaAlt] = useState("");
	const [mediaWidth, setMediaWidth] = useState("520");
	const [mediaHeight, setMediaHeight] = useState("280");

	function replaceSelection(format: (selection: string) => string) {
		const textarea = textareaRef.current;

		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selection = value.slice(start, end);
		const replacement = format(selection);
		const next = `${value.slice(0, start)}${replacement}${value.slice(end)}`;

		onChange(next);

		globalThis.requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(start, start + replacement.length);
		});
	}

	function insertBlock(block: string) {
		replaceSelection((selection) => {
			const content = selection || block;
			const prefix = value.endsWith("\n") || value.length === 0 ? "" : "\n";

			return `${prefix}${content}\n`;
		});
	}

	function wrapSelection(before: string, after = before, fallback = "text") {
		replaceSelection((selection) => `${before}${selection || fallback}${after}`);
	}

	function wrapBlock(tag: "left" | "center" | "right") {
		replaceSelection((selection) => `[${tag}]\n${selection || "Text"}\n[/${tag}]`);
	}

	function insertColor() {
		wrapSelection(`[color=${color}]`, "[/color]", "colored text");
		setColorModal(false);
	}

	function insertImage() {
		if (!imageSrc.trim()) return;

		insertBlock(
			`[image src="${quoteAttribute(imageSrc.trim())}" alt="${quoteAttribute(mediaAlt.trim())}" align=center width=${mediaWidth || 520} height=${mediaHeight || 280} fit=cover position=center rounded]`,
		);
		setImageSrc("");
		setMediaAlt("");
		setMediaModal(null);
	}

	function insertVideo() {
		if (!videoSrc.trim()) return;

		insertBlock(`[video src="${quoteAttribute(videoSrc.trim())}" align=center width=${mediaWidth || 520} height=${mediaHeight || 292} rounded]`);
		setVideoSrc("");
		setMediaModal(null);
	}

	const previewBlocks = showPreview ? parseMarkdownBlocks(value) : [];

	return (
		<div className="mt-3 flex flex-col gap-3">
			<div className="flex flex-wrap gap-2">
				<GhostButton variant="outline" type="button" onClick={() => wrapSelection("**")} className="px-3 py-2" title="Bold selected text" aria-label="Bold selected text">
					<Bold size={16} />
				</GhostButton>
				<GhostButton
					variant="outline"
					type="button"
					onClick={() => wrapSelection("*")}
					className="px-3 py-2"
					title="Italic selected text"
					aria-label="Italic selected text"
				>
					<Italic size={16} />
				</GhostButton>
				<GhostButton
					variant="outline"
					type="button"
					onClick={() => wrapSelection("~~")}
					className="px-3 py-2"
					title="Strikethrough selected text"
					aria-label="Strikethrough selected text"
				>
					<Strikethrough size={16} />
				</GhostButton>
				<GhostButton
					variant="outline"
					type="button"
					onClick={() => wrapSelection("[", "](https://example.com)", "link text")}
					className="px-3 py-2"
					title="Add link"
					aria-label="Add link"
				>
					<Link size={16} />
				</GhostButton>
				<GhostButton variant="outline" type="button" onClick={() => setColorModal(true)} className="px-3 py-2" title="Color selected text" aria-label="Color selected text">
					<Palette size={16} />
				</GhostButton>
				<GhostButton
					variant="outline"
					type="button"
					onClick={() => insertBlock("| Head | Value |\n| --- | --- |\n| Label | Text |")}
					className="px-3 py-2"
					title="Insert table"
					aria-label="Insert table"
				>
					<Table size={16} />
				</GhostButton>
				<GhostButton
					variant="outline"
					type="button"
					onClick={() => insertBlock("[grid cols=2 gap=8]\nLeft column\n[cell]\nRight column\n[/grid]")}
					className="px-3 py-2"
					title="Insert grid"
					aria-label="Insert grid"
				>
					<Columns3 size={16} />
				</GhostButton>
				<GhostButton variant="outline" type="button" onClick={() => wrapBlock("left")} className="px-3 py-2" title="Align block left" aria-label="Align block left">
					<AlignLeft size={16} />
				</GhostButton>
				<GhostButton variant="outline" type="button" onClick={() => wrapBlock("center")} className="px-3 py-2" title="Center block" aria-label="Center block">
					<AlignCenter size={16} />
				</GhostButton>
				<GhostButton variant="outline" type="button" onClick={() => wrapBlock("right")} className="px-3 py-2" title="Align block right" aria-label="Align block right">
					<AlignRight size={16} />
				</GhostButton>
				<GhostButton
					variant="outline"
					type="button"
					onClick={() => {
						setLastMediaModal("image");
						setMediaModal("image");
					}}
					className="px-3 py-2"
					title="Insert image"
					aria-label="Insert image"
				>
					<ImageIcon size={16} />
				</GhostButton>
				<GhostButton
					variant="outline"
					type="button"
					onClick={() => {
						setLastMediaModal("video");
						setMediaModal("video");
					}}
					className="px-3 py-2"
					title="Insert video"
					aria-label="Insert video"
				>
					<Video size={16} />
				</GhostButton>
			</div>

			<TextArea
				ref={textareaRef}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="min-h-72 font-mono text-sm leading-6"
				placeholder="# Markdown widget"
			/>

			<p className="text-xs text-text-faint">
				Standard markdown plus layout tags: <code>[center]…[/center]</code>, <code>[color=#ff5500]…[/color]</code>, <code>[link=https://…]…[/link]</code>, and{" "}
				<code>[grid cols=2]…[cell]…[/grid]</code>. Tags on their own line wrap a block; nest them to layer effects.
			</p>

			<GhostButton
				variant="outline"
				type="button"
				onClick={() => setShowPreview((current) => !current)}
				className="px-3 py-2"
				title={showPreview ? "Hide preview" : "Show preview"}
				aria-label={showPreview ? "Hide preview" : "Show preview"}
			>
				<Eye size={16} />
				Preview
			</GhostButton>

			{showPreview && (
				<div className="border border-border bg-bg p-4">
					{value.trim() ? (
						<div className="space-y-4 text-sm leading-6 text-text md:text-base">
							<MarkdownBlocks blocks={previewBlocks} />
						</div>
					) : (
						<p className="text-sm text-text-muted">Nothing to preview.</p>
					)}
				</div>
			)}

			<MenuPanel open={colorModal} onClose={() => setColorModal(false)} title="Color text">
				<ColorPicker value={color} onChange={(event) => setColor(event.target.value)} label="Pick a color" />
				<div className="mt-5 flex justify-end gap-2">
					<GhostButton variant="outline" type="button" onClick={() => setColorModal(false)}>
						Cancel
					</GhostButton>
					<GhostButton variant="outline" type="button" onClick={insertColor}>
						Apply
					</GhostButton>
				</div>
			</MenuPanel>

			<MenuPanel open={Boolean(mediaModal)} onClose={() => setMediaModal(null)} title={lastMediaModal === "image" ? "Insert image" : "Insert video"}>
				<div className="flex flex-col gap-2">
					{lastMediaModal === "image" ? (
						<>
							<TextInput value={imageSrc} onChange={(event) => setImageSrc(event.target.value)} placeholder="https://images.unsplash.com/..." />
							<TextInput value={mediaAlt} onChange={(event) => setMediaAlt(event.target.value)} placeholder="Alt text" />
						</>
					) : (
						<TextInput value={videoSrc} onChange={(event) => setVideoSrc(event.target.value)} placeholder="https://cdn.pixabay.com/video.mp4" />
					)}
					<div className="grid grid-cols-2 gap-2">
						<TextInput value={mediaWidth} onChange={(event) => setMediaWidth(event.target.value)} placeholder="Width" inputMode="numeric" />
						<TextInput value={mediaHeight} onChange={(event) => setMediaHeight(event.target.value)} placeholder="Height" inputMode="numeric" />
					</div>
				</div>
				<div className="mt-5 flex justify-end gap-2">
					<GhostButton variant="outline" type="button" onClick={() => setMediaModal(null)}>
						Cancel
					</GhostButton>
					<GhostButton
						variant="outline"
						type="button"
						onClick={lastMediaModal === "image" ? insertImage : insertVideo}
						disabled={lastMediaModal === "image" ? !imageSrc.trim() : !videoSrc.trim()}
					>
						Insert
					</GhostButton>
				</div>
			</MenuPanel>
		</div>
	);
}
