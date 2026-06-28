import db from "../db";
import { InteractionTargetType, LikeTargetType } from "../generated/prisma/enums";

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
		by: ["targetId"],
		where: {
			targetType: LikeTargetType.COMMENT,
			targetId: {
				in: comments.map((comment) => comment.id),
			},
		},
		_count: true,
	});

	const userLikes = userId
		? await db.like.findMany({
				where: {
					userId,
					targetType: LikeTargetType.COMMENT,
					targetId: {
						in: comments.map((comment) => comment.id),
					},
				},
				select: {
					targetId: true,
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
		likes: likes.find((like) => like.targetId === comment.id)?._count ?? 0,
		liked: userLikes.some((like) => like.targetId === comment.id),
		userRating: ratings.find((rating) => rating.userId === comment.userId)?.rating ?? null,
	}));
}
