import db from "@/lib/db";

export type ChangelogEntry = {
	id: string;
	slug: string;
	title: string;
	version: string | null;
	summary: string | null;
	pinned: boolean;
	publishedAt: string;
	content: string;
};

export async function getChangelogs(): Promise<ChangelogEntry[]> {
	const rows = await db.changelog.findMany({
		where: { published: true },
		orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
	});

	return rows.map((row) => ({
		id: row.id,
		slug: row.slug,
		title: row.title,
		version: row.version,
		summary: row.summary,
		pinned: row.pinned,
		publishedAt: row.publishedAt.toISOString(),
		content: row.content,
	}));
}
