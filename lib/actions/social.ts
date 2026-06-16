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
                content: content.slice(0, 2000),
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
            content: content.slice(0, 2000),
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
