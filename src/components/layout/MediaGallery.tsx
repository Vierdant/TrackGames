"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import HorizontalScroller from "@/components/layout/HorizontalScroller";
import { ImageIdToURL } from "@/lib/external/igdb/util";
import { joinClass } from "@/lib/util/client/func";

type MediaItem =
	| {
			type: "video";
			id: string;
	  }
	| {
			type: "image";
			id: string;
	  };

export default function MediaGallery({ media }: Readonly<{ media: MediaItem[] }>) {
	const [mediaActive, setMediaActive] = useState(0);
	const activeItem = media[mediaActive];

	if (!activeItem) {
		return <div className="mb-4 aspect-video overflow-hidden rounded bg-black/50" />;
	}

	return (
		<div className="w-full max-w-full min-w-0 overflow-hidden">
			<HorizontalScroller
				className="mb-4 aspect-video rounded bg-black/50 [&>div]:h-full [&>div]:w-full [&>div]:gap-0 [&>div>div]:h-full [&>div>div]:w-full"
				selectedIndex={mediaActive}
				onSelectedIndexChange={setMediaActive}
			>
				{media.map((item) =>
					item.type === "video" ? (
						<iframe
							key={`${item.type}-${item.id}`}
							src={`https://www.youtube-nocookie.com/embed/${item.id}`}
							title="Game video"
							className="h-full w-full"
							allowFullScreen
						/>
					) : (
						<Image
							key={`${item.type}-${item.id}`}
							src={`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${item.id}.jpg`}
							alt=""
							width={1280}
							height={720}
							sizes="(min-width: 1024px) 768px, calc(100vw - 2rem)"
							className="h-full w-full object-cover"
						/>
					),
				)}
			</HorizontalScroller>

			<div className="pb-2">
				<HorizontalScroller className="w-full max-w-full min-w-0 gap-3 px-0" selectedIndex={mediaActive} onSelectedIndexChange={setMediaActive}>
					{media.map((item, index) => (
						<button
							key={`${item.type}-${item.id}`}
							type="button"
							onClick={() => setMediaActive(index)}
							className={joinClass(
								"shrink-0 cursor-pointer snap-start overflow-hidden rounded border-2 transition",
								mediaActive === index ? "border-primary" : "border-transparent opacity-80 hover:opacity-100",
							)}
							aria-label={`Show media ${index + 1}`}
						>
							{item.type === "video" ? (
								<span className="relative block aspect-video w-24 bg-black sm:w-32">
									<Image src={`https://img.youtube.com/vi/${item.id}/hqdefault.jpg`} alt="" fill sizes="128px" className="object-cover" />
									<span className="absolute inset-0 flex items-center justify-center">
										<Play color="var(--secondary)" strokeWidth={3} size={24} />
									</span>
								</span>
							) : (
								<span className="relative block aspect-video w-24 sm:w-32">
									<Image src={ImageIdToURL(item.id, "screenshot_big") ?? ""} alt="" fill sizes="128px" className="object-cover" />
								</span>
							)}
						</button>
					))}
				</HorizontalScroller>
			</div>
		</div>
	);
}
