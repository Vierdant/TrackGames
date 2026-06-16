import { ActivityType, InteractionTargetType } from "@/lib/generated/prisma/enums";
import Link from "next/link";
import { GhostButton } from "@/app/components/ui/Buttons";

function commentTargetAfter(targetType: InteractionTargetType | null) {
    if (targetType === InteractionTargetType.GAME_LIST) return "playlist.";
    if (targetType === InteractionTargetType.USER_PROFILE) return "'s profile.";
    if (targetType === InteractionTargetType.GAME) return ".";
    return ".";
}

function activityMessage(activity: { type: ActivityType; targetType: InteractionTargetType | null; targetName: string | null; targetHref: string | null }) {
    const name = activity.targetName;

    if (activity.type === ActivityType.ADDED_GAME_TO_LIBRARY) return { before: "Added", name, after: "to their library." };
    if (activity.type === ActivityType.RATED_GAME) return { before: "Rated", name, after: "." };
    if (activity.type === ActivityType.CREATED_PLAYLIST) return { before: "Created the playlist", name, after: "." };
    if (activity.type === ActivityType.ADDED_GAME_TO_PLAYLIST) return { before: "Added", name, after: "to a playlist." };
    if (activity.type === ActivityType.LIKED_GAME_LIST) return { before: "Liked the playlist", name, after: "." };
    if (activity.type === ActivityType.COMMENTED_ON_GAME_LIST) return name ? { before: "Commented on the playlist", name, after: "." } : { before: "Commented on a playlist", name: null, after: "." };
    if (activity.type === ActivityType.COMMENTED_ON_PROFILE) return name ? { before: "Commented on", name, after: "'s profile." } : { before: "Commented on a profile", name: null, after: "." };
    if (activity.type === ActivityType.COMMENTED_ON_GAME) return name ? { before: "Commented on", name, after: "." } : { before: "Commented on a game", name: null, after: "." };
    if (activity.type === ActivityType.FOLLOWED_USER) return { before: "Followed", name, after: "." };

    if (activity.type === ActivityType.LIKED_COMMENT) return name ? { before: "Liked a comment on", name, after: commentTargetAfter(activity.targetType) } : { before: "Liked a comment", name: null, after: "." };
    if (activity.type === ActivityType.REPLIED_TO_COMMENT) return name ? { before: "Replied to a comment on", name, after: commentTargetAfter(activity.targetType) } : { before: "Replied to a comment", name: null, after: "." };
    if (activity.type === ActivityType.EARNED_BADGE) return { before: "Earned a badge", name: null, after: "." };

    return { before: "New activity", name: null, after: "." };
}

function ActivityText({ activity }: { activity: { type: ActivityType; targetType: InteractionTargetType | null; targetName: string | null; targetHref: string | null } }) {
    const message = activityMessage(activity);
    const spacer = message.after.startsWith(".") || message.after.startsWith("'") ? "" : " ";

    return (
        <p className="text-sm font-bold text-text">
            {message.before}
            {message.name && (
                <>
                    {" "}
                    {activity.targetHref ? (
                        <Link href={activity.targetHref} className="text-primary hover:text-primary-hover">{message.name}</Link>
                    ) : (
                        <span className="text-primary">{message.name}</span>
                    )}
                </>
            )}
            {spacer}{message.after}
        </p>
    );
}

export default function ActivityList({ user, activities, page, totalPages }: { user: string; activities: { id: string; type: ActivityType; targetType: InteractionTargetType | null; targetId: string | null; listId: string | null; targetName: string | null; targetHref: string | null; createdAt: Date; game?: { slug: string | null; name: string | null } | null }[]; page: number; totalPages: number }) {
    return (
        <div className="flex flex-col gap-3">
            {activities.length ? activities.map((activity) => (
                <div key={activity.id} className="rounded border border-border bg-bg p-4">
                    <ActivityText activity={activity} />
                    <p className="mt-1 text-xs text-text-faint">{new Date(activity.createdAt).toLocaleDateString()}</p>
                </div>
            )) : (
                <p className="rounded border border-border bg-bg p-4 text-sm text-text-muted">No activity yet.</p>
            )}

            {totalPages > 1 && (
                <div className="mt-2 flex justify-end gap-2">
                    {page > 1 && <GhostButton href={`/u/${user}?tab=activity&activityPage=${page - 1}`}>Previous</GhostButton>}
                    {page < totalPages && <GhostButton href={`/u/${user}?tab=activity&activityPage=${page + 1}`}>Next</GhostButton>}
                </div>
            )}
        </div>
    );
}
