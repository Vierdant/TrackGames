import { SOCIAL_PLATFORMS } from "@/lib/constants";
import { LinkType, type SocialLink } from "@/lib/types";
import * as normalize from "@/lib/util/validate/normalize";

function normalizeSocialKind(value: unknown): LinkType {
	if (value === LinkType.COPY) return LinkType.COPY;
	return LinkType.LINK;
}

export function isSocialPlatform(value: string): boolean {
	return SOCIAL_PLATFORMS.some((platform) => platform.value === value);
}

export function getSocialPlatform(value: string, kind: LinkType) {
	return normalize.byKeys(SOCIAL_PLATFORMS, { value, kind }) ?? normalize.byKey(SOCIAL_PLATFORMS, "value", value);
}

export function getSocialOption(id: string) {
	return normalize.byKey(SOCIAL_PLATFORMS, "id", id);
}

export function getSocialPlatformLabel(value: string, kind: LinkType) {
	return getSocialPlatform(value, kind)?.label ?? value;
}

export function getSocialPlaceholder(value: string, kind: LinkType) {
	return getSocialPlatform(value, kind)?.placeholder ?? (kind === LinkType.COPY ? "username" : "https://...");
}

export function parseSocials(value: string | null | undefined): SocialLink[] {
	if (!value) return [];

	try {
		const parsed = JSON.parse(value);

		if (!Array.isArray(parsed)) return [];

		return parsed.flatMap((item, index) => {
			if (!isSocialPlatform(item?.platform) || typeof item.value !== "string") return [];

			return [
				{
					id: typeof item.id === "string" ? item.id : `${Date.now()}-${index}`,
					platform: item.platform,
					kind: normalizeSocialKind(item.kind),
					value: item.value,
				},
			];
		});
	} catch {
		return [];
	}
}

export function serializeSocials(socialLinks: SocialLink[]) {
	return JSON.stringify(socialLinks.map(({ platform, kind, value }) => ({ platform, kind, value: value.trim() })).filter((item) => item.value));
}
