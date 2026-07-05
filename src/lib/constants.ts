import z from "zod";
import { LinkType } from "@/lib/types";

export const SOCIAL_PLATFORMS = [
	{ id: "x-link", value: "x", kind: LinkType.LINK, label: "X (Twitter)", placeholder: "https://x.com/username" },
	{ id: "discord-copy", value: "discord", kind: LinkType.COPY, label: "Discord username", placeholder: "username" },
	{
		id: "discord-link",
		value: "discord",
		kind: LinkType.LINK,
		label: "Discord server",
		placeholder: "https://discord.gg/invite",
	},
	{
		id: "github-link",
		value: "github",
		kind: LinkType.LINK,
		label: "GitHub",
		placeholder: "https://github.com/username",
	},
	{
		id: "twitch-link",
		value: "twitch",
		kind: LinkType.LINK,
		label: "Twitch",
		placeholder: "https://twitch.tv/username",
	},
	{
		id: "youtube-link",
		value: "youtube",
		kind: LinkType.LINK,
		label: "YouTube",
		placeholder: "https://youtube.com/@username",
	},
	{ id: "website-link", value: "website", kind: LinkType.LINK, label: "Website", placeholder: "https://example.com" },
];

export const AUTH_PROVIDERS = [
	{ slug: "google", label: "Google" },
	{ slug: "github", label: "GitHub" },
	{ slug: "twitch", label: "Twitch" },
	{ slug: "discord", label: "Discord" },
];

export const SETTING_TABS: { id: string; label: string; href: string }[] = [
	{ id: "profile", label: "Profile", href: "/settings?tab=profile" },
	{ id: "privacy", label: "Privacy", href: "/settings?tab=privacy" },
	{ id: "widgets", label: "Widgets", href: "/settings?tab=widgets" },
	{ id: "preferences", label: "Preferences", href: "/settings?tab=preferences" },
	{ id: "import", label: "Import", href: "/settings?tab=import" },
	{ id: "account", label: "Account", href: "/settings?tab=account" },
];

export const ALLOWED_HOSTS = new Set(["i.imgur.com", "images.unsplash.com", "media.discordapp.net", "cdn.discordapp.com", "cdn.pixabay.com"]);

export const ALLOWED_TAGS = [
	"p",
	"br",
	"strong",
	"em",
	"del",
	"blockquote",
	"ul",
	"ol",
	"li",
	"code",
	"pre",
	"h1",
	"h2",
	"h3",
	"a",
	"img",
	"hr",
	"table",
	"thead",
	"tbody",
	"tr",
	"th",
	"td",
];

export const USERNAME_MAX_LENGTH = 32;
export const USERNAME_ERROR = "Use 1-32 letters, numbers, underscores, or hyphens.";
export const USERNAME_PATTERN = /^[A-Za-z0-9_-]+$/;
export const usernameSchema = z.string().min(1).max(USERNAME_MAX_LENGTH).regex(USERNAME_PATTERN);
