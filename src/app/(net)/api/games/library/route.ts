import { auth } from "@/lib/auth";
import { getUserLibraryGamesByIds, searchUserLibraryGames } from "@/lib/data/library";

export async function GET(request: Request) {
	const session = await auth();

	if (!session?.user?.id) {
		return Response.json([], { status: 401 });
	}

	const params = new URL(request.url).searchParams;
	const ids = (params.get("ids") ?? "")
		.split(",")
		.map(Number)
		.filter((id) => Number.isInteger(id) && id > 0);

	if (ids.length) {
		return Response.json(await getUserLibraryGamesByIds(session.user.id, ids), {
			headers: {
				"Cache-Control": "private, max-age=30",
			},
		});
	}

	return Response.json(await searchUserLibraryGames(session.user.id, params.get("q") ?? ""), {
		headers: {
			"Cache-Control": "private, max-age=30",
		},
	});
}
