"use client";

import { ImageIdToURL } from "@/lib/external/igdb/util";
import Image from "next/image";
import { useState } from "react";
import HorizontalScroller from "./HorizontalScroller";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

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
		return <div className="aspect-video bg-black/50 rounded-md overflow-hidden mb-4" />;
	}

	return (
		<div className="w-full min-w-0 max-w-full overflow-hidden">
			<div className="relative aspect-video bg-black/50 rounded-md overflow-hidden mb-4">
				{activeItem.type === "video" ? (
					<iframe
						src={`https://www.youtube-nocookie.com/embed/${activeItem.id}`}
						title="Game video"
						className="w-full h-full"
						allowFullScreen
					/>
				) : (
					<Image
						src={`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${activeItem.id}.jpg`}
						alt=""
						fill
						sizes="(min-width: 1024px) 768px, calc(100vw - 2rem)"
						className="object-cover"
					/>
				)}
				{mediaActive > 0 && (
					<button
						type="button"
						aria-label="Show previous media"
						onClick={() => setMediaActive(mediaActive - 1)}
						className="absolute left-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center cursor-pointer"
					>
						<ChevronLeft size={30} strokeWidth={3} />
					</button>
				)}
				{mediaActive < media.length - 1 && (
					<button
						type="button"
						aria-label="Show next media"
						onClick={() => setMediaActive(mediaActive + 1)}
						className="absolute right-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center cursor-pointer"
					>
						<ChevronRight size={30} strokeWidth={3} />
					</button>
				)}
			</div>

			<div className="pb-2">
				<HorizontalScroller
					className="w-full min-w-0 max-w-full gap-3 px-0"
					selectedIndex={mediaActive}
					onSelectedIndexChange={setMediaActive}
				>
					{media.map((item, index) => (
						<button
							key={`${item.type}-${item.id}`}
							type="button"
							onClick={() => setMediaActive(index)}
							className={`snap-start shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition ${
								mediaActive === index ? "border-primary" : "border-transparent opacity-80 hover:opacity-100"
							}`}
							aria-label={`Show media ${index + 1}`}
						>
							{item.type === "video" ? (
								<span className="relative block w-24 sm:w-32 aspect-video bg-black">
									<Image
										src={`https://img.youtube.com/vi/${item.id}/hqdefault.jpg`}
										alt=""
										fill
										sizes="128px"
										className="object-cover"
									/>
									<span className="absolute inset-0 flex items-center justify-center">
										<Play color="var(--secondary)" strokeWidth={3} size={24} />
									</span>
								</span>
							) : (
								<span className="relative block w-24 sm:w-32 aspect-video">
									<Image
										src={ImageIdToURL(item.id, "screenshot_big") ?? ""}
										alt=""
										fill
										sizes="128px"
										className="object-cover"
									/>
								</span>
							)}
						</button>
					))}
				</HorizontalScroller>
			</div>
		</div>
	);
}
