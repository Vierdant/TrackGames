"use server";

import { redirect } from "next/navigation";
import { auth } from "../auth";
import db from "../db";
import { ActivityType, InteractionTargetType, LikeTargetType, NotificationType } from "../generated/prisma/enums";

async function getCurrentUserId() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    return session.user.id;
}

function activityExpiry() {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

function commentActivityType(targetType: InteractionTargetType, parentId: string | null) {
    if (parentId) return ActivityType.REPLIED_TO_COMMENT;
    if (targetType === InteractionTargetType.GAME) return ActivityType.COMMENTED_ON_GAME;
    if (targetType === InteractionTargetType.USER_PROFILE) return ActivityType.COMMENTED_ON_PROFILE;
    return ActivityType.COMMENTED_ON_GAME_LIST;
}

export async function addComment(targetType: InteractionTargetType, targetId: string, parentId: string | null, formData: FormData) {
    const userId = await getCurrentUserId();
    const content = String(formData.get("content") ?? "").trim();

    if (!content) {
        throw new Error("Comment is required.");
    }

    if (content.length > 2000) {
        throw new Error("Comments must be 2000 characters or fewer.");
    }

    if (parentId) {
        const parent = await db.comment.findFirst({
            where: {
                id: parentId,
                targetType,
                targetId,
            },
            select: {
                id: true,
                userId: true,
            },
        });

        if (!parent) {
            throw new Error("Comment not found.");
        }

        const comment = await db.comment.create({
            data: {
                userId,
                targetType,
                targetId,
                parentId,
                content,
            },
        });

        await db.activity.create({
            data: {
                userId,
                type: ActivityType.REPLIED_TO_COMMENT,
                targetType,
                targetId,
                commentId: comment.id,
                expiresAt: activityExpiry(),
            },
        });

        if (parent.userId !== userId) {
            await db.notification.create({
                data: {
                    userId: parent.userId,
                    actorId: userId,
                    type: NotificationType.COMMENT_REPLY,
                    targetType,
                    targetId,
                    commentId: comment.id,
                },
            });
        }

        return;
    }

    const comment = await db.comment.create({
        data: {
            userId,
            targetType,
            targetId,
            content,
        },
    });

    await db.activity.create({
        data: {
            userId,
            type: commentActivityType(targetType, null),
            targetType,
            targetId,
            commentId: comment.id,
            expiresAt: activityExpiry(),
        },
    });

    if (targetType === InteractionTargetType.USER_PROFILE && targetId !== userId) {
        await db.notification.create({
            data: {
                userId: targetId,
                actorId: userId,
                type: NotificationType.COMMENTED_ON_PROFILE,
                targetType,
                targetId,
                commentId: comment.id,
            },
        });
    }
}

export async function toggleLike(targetType: LikeTargetType, targetId: string) {
    const userId = await getCurrentUserId();
    const existing = await db.like.findUnique({
        where: {
            userId_targetType_targetId: {
                userId,
                targetType,
                targetId,
            },
        },
        select: {
            id: true,
        },
    });

    if (existing) {
        await db.like.delete({
            where: {
                id: existing.id,
            },
        });

        return;
    }

    await db.like.create({
        data: {
            userId,
            targetType,
            targetId,
        },
    });

    await db.activity.create({
        data: {
            userId,
            type: targetType === LikeTargetType.COMMENT ? ActivityType.LIKED_COMMENT : ActivityType.LIKED_GAME_LIST,
            targetType: targetType === LikeTargetType.COMMENT ? null : InteractionTargetType.GAME_LIST,
            targetId,
            commentId: targetType === LikeTargetType.COMMENT ? targetId : null,
            expiresAt: activityExpiry(),
        },
    });

    const likedComment = targetType === LikeTargetType.COMMENT
        ? await db.comment.findUnique({ where: { id: targetId }, select: { userId: true, targetType: true, targetId: true } })
        : null;
    const likedList = targetType === LikeTargetType.GAME_LIST
        ? await db.gameList.findUnique({ where: { id: targetId }, select: { userId: true } })
        : null;
    const ownerId = likedComment?.userId ?? likedList?.userId;

    if (ownerId && ownerId !== userId) {
        await db.notification.create({
            data: {
                userId: ownerId,
                actorId: userId,
                type: NotificationType.RECEIVED_LIKE,
                targetType: likedComment?.targetType ?? InteractionTargetType.GAME_LIST,
                targetId: likedComment?.targetId ?? targetId,
                commentId: targetType === LikeTargetType.COMMENT ? targetId : null,
            },
        });
    }
}

export async function deleteComment(commentId: string) {
    const userId = await getCurrentUserId();
    const comment = await db.comment.findUnique({
        where: {
            id: commentId,
        },
        select: {
            id: true,
            userId: true,
        },
    });

    if (!comment || comment.userId !== userId) {
        throw new Error("Comment not found.");
    }

    await db.$transaction([
        db.like.deleteMany({
            where: {
                targetType: LikeTargetType.COMMENT,
                targetId: comment.id,
            },
        }),
        db.comment.delete({
            where: {
                id: comment.id,
            },
        }),
    ]);
}

export async function toggleFollow(userIdToFollow: string) {
    const userId = await getCurrentUserId();

    if (userId === userIdToFollow) {
        throw new Error("You cannot follow yourself.");
    }

    const existing = await db.userFollow.findUnique({
        where: {
            followerId_followingId: {
                followerId: userId,
                followingId: userIdToFollow,
            },
        },
        select: {
            id: true,
        },
    });

    if (existing) {
        await db.userFollow.delete({
            where: {
                id: existing.id,
            },
        });

        return { following: false };
    }

    await db.userFollow.create({
        data: {
            followerId: userId,
            followingId: userIdToFollow,
        },
    });

    await db.activity.create({
        data: {
            userId,
            type: ActivityType.FOLLOWED_USER,
            targetType: InteractionTargetType.USER_PROFILE,
            targetId: userIdToFollow,
            expiresAt: activityExpiry(),
        },
    });

    await db.notification.create({
        data: {
            userId: userIdToFollow,
            actorId: userId,
            type: NotificationType.FOLLOWED_USER,
            targetType: InteractionTargetType.USER_PROFILE,
            targetId: userId,
        },
    });

    return { following: true };
}

export async function markNotificationsRead() {
    const userId = await getCurrentUserId();

    await db.notification.updateMany({
        where: {
            userId,
            readAt: null,
        },
        data: {
            readAt: new Date(),
        },
    });
}
