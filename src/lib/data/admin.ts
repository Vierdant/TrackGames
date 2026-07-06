import "server-only";
import db from "@/lib/db";
import { FeedbackStatus, InteractionTargetType, ReportStatus, UserRole } from "@/lib/generated/prisma/enums";
import redis from "@/lib/redis";

function last30Days() {
	const days: string[] = [];
	for (let i = 29; i >= 0; i--) days.push(new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10));
	return days;
}

function fillDaily(rows: { day: Date; count: number }[]) {
	const byDay = new Map(rows.map((row) => [new Date(row.day).toISOString().slice(0, 10), row.count]));
	return last30Days().map((day) => ({ label: day.slice(5), value: byDay.get(day) ?? 0 }));
}

// Daily pageviews live in Redis (see the analytics route). Best-effort: a cache
// outage yields a flat zero series rather than breaking the dashboard.
async function getDailyPageviews() {
	const days = last30Days();
	let values: (string | null)[] = [];

	if (redis) {
		try {
			values = await redis.mget(days.map((day) => `pageviews:day:${day}`));
		} catch {
			values = [];
		}
	}

	return days.map((day, index) => ({ label: day.slice(5), value: Number(values[index] ?? 0) || 0 }));
}

export async function getAdminOverview() {
	const [
		openReports,
		newFeedback,
		logs30d,
		activeBackers,
		totalLikes,
		signupRows,
		logRows,
		commentRows,
		topPageRows,
		totalPageviewsRow,
		dailyPageviews,
		recentComments,
		topGameRows,
	] = await Promise.all([
		db.report.count({ where: { status: { not: ReportStatus.RESOLVED } } }),
		db.feedback.count({ where: { status: FeedbackStatus.NEW } }),
		db.userGamePlayLog.count({ where: { playedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
		db.user.count({ where: { roles: { has: UserRole.VIP } } }),
		db.like.count(),
		db.$queryRaw<{ day: Date; count: number }[]>`
				SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
				FROM "User" WHERE "createdAt" >= NOW() - INTERVAL '30 days' GROUP BY 1 ORDER BY 1 ASC`,
		db.$queryRaw<{ day: Date; count: number }[]>`
				SELECT date_trunc('day', "playedAt") AS day, COUNT(*)::int AS count
				FROM "UserGamePlayLog" WHERE "playedAt" >= NOW() - INTERVAL '30 days' GROUP BY 1 ORDER BY 1 ASC`,
		db.$queryRaw<{ day: Date; count: number }[]>`
				SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
				FROM "Comment" WHERE "createdAt" >= NOW() - INTERVAL '30 days' GROUP BY 1 ORDER BY 1 ASC`,
		db.analytics.findMany({ where: { key: { startsWith: "pageview:/" } }, orderBy: { value: "desc" }, take: 8 }),
		db.analytics.findUnique({ where: { key: "pageview:total" } }),
		getDailyPageviews(),
		db.comment.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { name: true } } } }),
		db.userGamePlayLog.groupBy({ by: ["gameId"], _count: { gameId: true }, orderBy: { _count: { gameId: "desc" } }, take: 8 }),
	]);

	// Resolve names/slugs for the recent comments' threads and the top logged games.
	const gameIds = [
		...new Set(
			recentComments
				.filter((c) => c.targetType === InteractionTargetType.GAME)
				.map((c) => Number(c.targetId))
				.filter(Number.isFinite),
		),
	];
	const profileIds = [...new Set(recentComments.filter((c) => c.targetType === InteractionTargetType.USER_PROFILE).map((c) => c.targetId))];

	const topGameIds = topGameRows.map((row) => row.gameId);

	const [games, profiles, topGameNames] = await Promise.all([
		gameIds.length ? db.game.findMany({ where: { id: { in: gameIds } }, select: { id: true, slug: true } }) : [],
		profileIds.length ? db.user.findMany({ where: { id: { in: profileIds } }, select: { id: true, name: true } }) : [],
		topGameIds.length ? db.game.findMany({ where: { id: { in: topGameIds } }, select: { id: true, name: true } }) : [],
	]);

	const commentHref = (comment: (typeof recentComments)[number]) => {
		if (comment.targetType === InteractionTargetType.GAME_LIST) return `/playlist/${comment.targetId}#comments`;
		if (comment.targetType === InteractionTargetType.USER_PROFILE) {
			const name = profiles.find((profile) => profile.id === comment.targetId)?.name;
			return name ? `/u/${name}#comments` : null;
		}
		const slug = games.find((game) => game.id === Number(comment.targetId))?.slug;
		return slug ? `/game/${slug}#comments` : null;
	};

	return {
		openReports,
		newFeedback,
		logs30d,
		activeBackers,
		totalLikes,
		totalPageviews: totalPageviewsRow ? Number(totalPageviewsRow.value) : 0,
		signups: fillDaily(signupRows),
		logs: fillDaily(logRows),
		comments: fillDaily(commentRows),
		dailyPageviews,
		topPages: topPageRows.map((row) => ({ label: row.key.replace("pageview:", ""), value: Number(row.value) })),
		topGames: topGameRows.map((row) => ({ label: topGameNames.find((game) => game.id === row.gameId)?.name ?? `#${row.gameId}`, value: row._count.gameId })),
		recentComments: recentComments.map((comment) => ({
			id: comment.id,
			content: comment.content,
			author: comment.user?.name ?? null,
			href: commentHref(comment),
			createdAt: comment.createdAt.toISOString(),
		})),
	};
}

export async function getReports(status?: ReportStatus) {
	return db.report.findMany({
		where: status ? { status } : {},
		orderBy: [{ status: "asc" }, { createdAt: "desc" }],
		take: 100,
		include: {
			reporter: { select: { id: true, name: true } },
			reportedUser: { select: { id: true, name: true } },
			handler: { select: { id: true, name: true } },
		},
	});
}

export async function getFeedbackList(status?: FeedbackStatus) {
	return db.feedback.findMany({
		where: status ? { status } : {},
		orderBy: [{ status: "asc" }, { createdAt: "desc" }],
		take: 100,
		include: { user: { select: { id: true, name: true } } },
	});
}

export async function searchMembers(query?: string) {
	return db.user.findMany({
		where: query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] } : {},
		orderBy: { createdAt: "desc" },
		take: 50,
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			background: true,
			bio: true,
			roles: true,
			createdAt: true,
			_count: { select: { comments: true, games: true, gameLists: true } },
		},
	});
}

export async function getAllChangelogs() {
	const rows = await db.changelog.findMany({ orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }] });
	return rows.map((row) => ({
		id: row.id,
		slug: row.slug,
		title: row.title,
		version: row.version,
		summary: row.summary,
		pinned: row.pinned,
		published: row.published,
		publishedAt: row.publishedAt.toISOString(),
		content: row.content,
	}));
}

export async function getAllRoadmapItems() {
	const rows = await db.roadmapItem.findMany({
		orderBy: [{ position: "asc" }, { createdAt: "desc" }],
		include: { _count: { select: { votes: true } } },
	});
	return rows.map((row) => ({
		id: row.id,
		slug: row.slug,
		title: row.title,
		summary: row.summary,
		status: row.status,
		position: row.position,
		public: row.public,
		content: row.content,
		voteCount: row._count.votes,
	}));
}
