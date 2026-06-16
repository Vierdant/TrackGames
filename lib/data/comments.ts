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

    const userLikes = userId ? await db.like.findMany({
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
    }) : [];

    return comments.map((comment) => ({
        ...comment,
        likes: likes.find((like) => like.targetId === comment.id)?._count ?? 0,
        liked: userLikes.some((like) => like.targetId === comment.id),
    }));
}
