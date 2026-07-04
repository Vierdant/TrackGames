import { type CSSProperties } from "react";
import type { UserModel } from "@/lib/generated/prisma/models/User";
import { hexColor } from "@/lib/util/validate/normalize";

/** Builds CSS custom properties for a profile's primary/accent theme colors, falling back to site defaults. */
export function profileThemeStyle(profileColor: string | null | undefined, accentColor: string | null | undefined) {
	const style: CSSProperties & Record<string, string> = {};
	const primary = hexColor(profileColor, "#7b5cdb");
	const secondary = hexColor(accentColor, "#b8842f");

	style["--primary"] = primary;
	style["--primary-hover"] = `color-mix(in srgb, ${primary} 82%, white)`;
	style["--border-strong"] = primary;

	style["--secondary"] = secondary;
	style["--secondary-hover"] = `color-mix(in srgb, ${secondary} 82%, white)`;

	return style;
}

/** Resolves the viewing user's site theme (custom / default / follow-profile) to CSS variables, or `undefined` for the default theme. */
export function viewerThemeStyle(user: Pick<UserModel, "profileColor" | "accentColor" | "siteThemeMode" | "siteThemeColor" | "siteAccentColor">) {
	if (user.siteThemeMode === "custom") {
		return profileThemeStyle(hexColor(user.siteThemeColor, "#7b5cdb"), hexColor(user.siteAccentColor, "#b8842f"));
	}

	if (user.siteThemeMode === "default") {
		return undefined;
	}

	return profileThemeStyle(user.profileColor, user.accentColor);
}
