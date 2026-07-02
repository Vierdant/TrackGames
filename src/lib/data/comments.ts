import db from "../db";
import { InteractionTargetType } from "../generated/prisma/enums";

export async function getComments(targetType: InteractionTargetType, targetId: string, userId?: string) {
	const comments = await db.comment.findMany({
		where: {
			targetType,
			targetId,
		},
		orderBy: {
			createdAt: "asc",
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					image: true,
					roles: true,
				},
			},
		},
	});

	const likes = await db.like.groupBy({
		by: ["commentId"],
		where: {
			commentId: {
				in: comments.map((comment) => comment.id),
			},
		},
		_count: true,
	});

	const userLikes = userId
		? await db.like.findMany({
				where: {
					userId,
					commentId: {
						in: comments.map((comment) => comment.id),
					},
				},
				select: {
					commentId: true,
				},
			})
		: [];

	const ratings =
		targetType === InteractionTargetType.GAME
			? await db.userGameEntry.findMany({
					where: {
						gameId: Number(targetId),
						userId: {
							in: Array.from(new Set(comments.map((comment) => comment.userId))),
						},
					},
					select: {
						userId: true,
						rating: true,
					},
				})
			: [];

	return comments.map((comment) => ({
		...comment,
		likes: likes.find((like) => like.commentId === comment.id)?._count ?? 0,
		liked: userLikes.some((like) => like.commentId === comment.id),
		userRating: ratings.find((rating) => rating.userId === comment.userId)?.rating ?? null,
	}));
}
