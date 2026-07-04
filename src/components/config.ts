import { Rss } from "lucide-react";
import { DiscordIcon, GithubIcon, TwitchIcon, XIcon, YoutubeIcon } from "@/components/SVG";

export const socialPlatformIcons = {
	"x-link": XIcon,
	"discord-copy": DiscordIcon,
	"discord-link": DiscordIcon,
	"github-link": GithubIcon,
	"twitch-link": TwitchIcon,
	"youtube-link": YoutubeIcon,
	"website-link": Rss,
} as const;
