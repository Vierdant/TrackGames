import { createOpenGraphImage } from "@/app/(net)/opengraph/OpenGraphImage";
import { DEFAULT_DESCRIPTION } from "@/lib/util/metadata";

export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export default async function Image() {
	return createOpenGraphImage({
		title: "Build Your Library :)",
		description: DEFAULT_DESCRIPTION,
	});
}

export { SITE_NAME as alt } from "@/lib/util/metadata";
