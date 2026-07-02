import db from "../db";

const listSelect = {
	id: true,
	type: true,
	userId: true,
	displayMode: true,
	tierColors: true,
	tierLabels: true,
	name: true,
	slug: true,
	description: true,
	image: true,
	background: true,
	color: true,
	accentColor: true,
	privacy: true,
	commentsHidden: true,
	entries: true,
	user: {
		select: {
			libraryPrivacy: true,
		},
	},
};

export async function ensureAndGetUserLibrary(slug: string) {
	const user = await db.user.findFirst({
		where: {
			name: slug,
		},
		select: {
			id: true,
			name: true,
			libraryPrivacy: true,
		},
	});

	if (!user) return null;

	const library = await db.gameList.findFirst({
		where: {
			slug,
			userId: user.id,
		},
		select: listSelect,
	});

	if (library) return library;

	return await db.gameList.create({
		data: {
			userId: user.id,
			type: "LIBRARY",
			name: `${user.name}'s Library`,
			slug: `${user.name}`,
			privacy: "public",
		},
		select: listSelect,
	});
}
