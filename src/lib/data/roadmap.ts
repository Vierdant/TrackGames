import db from "@/lib/db";
import { type RoadmapStatus } from "@/lib/generated/prisma/enums";

export type RoadmapItemView = {
	id: string;
	slug: string;
	title: string;
	summary: string | null;
	status: RoadmapStatus;
	content: string;
	voteCount: number;
	hasVoted: boolean;
};

export async function getRoadmapItems(viewerId?: string | null): Promise<RoadmapItemView[]> {
	const rows = await db.roadmapItem.findMany({
		where: { public: true },
		orderBy: [{ position: "asc" }, { createdAt: "desc" }],
		include: { _count: { select: { votes: true } } },
	});

	const votedIds = viewerId ? new Set((await db.roadmapVote.findMany({ where: { userId: viewerId }, select: { itemId: true } })).map((vote) => vote.itemId)) : new Set<string>();

	return rows.map((row) => ({
		id: row.id,
		slug: row.slug,
		title: row.title,
		summary: row.summary,
		status: row.status,
		content: row.content,
		voteCount: row._count.votes,
		hasVoted: votedIds.has(row.id),
	}));
}
