"use client";

import AvatarView from "@/app/components/user/AvatarView";
import { addComment, toggleLike } from "@/lib/actions/social";
import { InteractionTargetType, LikeTargetType } from "@/lib/generated/prisma/enums";
import { Heart, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { GhostButton, PrimaryButton } from "../ui/Buttons";
import { Textarea } from "../ui/Inputs";

type Comment = {
    id: string;
    userId: string;
    parentId: string | null;
    content: string;
    createdAt: Date;
    likes: number;
    liked: boolean;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
};

function CommentForm({ action, placeholder = "Write a comment" }: { action: (formData: FormData) => Promise<void>; placeholder?: string }) {
    const ref = useRef<HTMLFormElement>(null);
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    function save(formData: FormData) {
        startTransition(async () => {
            await action(formData);
            ref.current?.reset();
            router.refresh();
        });
    }

    return (
        <form ref={ref} action={save} className="flex flex-col gap-2">
            <Textarea name="content" rows={3} maxLength={2000} placeholder={placeholder} required />
            <div className="flex justify-end">
                <PrimaryButton type="submit" disabled={pending} className="gap-2 px-4 py-2">
                    <Send size={16} />
                    {pending ? "Posting..." : "Post"}
                </PrimaryButton>
            </div>
        </form>
    );
}

function CommentItem({ comment, comments, targetType, targetId, currentUserId }: { comment: Comment; comments: Comment[]; targetType: InteractionTargetType; targetId: string; currentUserId: string | null }) {
    const [replying, setReplying] = useState(false);
    const [pending, startTransition] = useTransition();
    const router = useRouter();
    const replies = comments.filter((reply) => reply.parentId === comment.id);
    const replyAction = addComment.bind(null, targetType, targetId, comment.id);

    function like() {
        startTransition(async () => {
            await toggleLike(LikeTargetType.COMMENT, comment.id);
            router.refresh();
        });
    }

    return (
        <div className="flex gap-3">
            <AvatarView image={comment.user.image} size={8} mdSize={8} iconSize={18} />
            <div className="min-w-0 flex-1">
                <div className="rounded bg-bg pl-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        {comment.user.name ? (
                            <Link href={`/u/${comment.user.name}`} className="font-bold hover:text-primary">{comment.user.name}</Link>
                        ) : (
                            <span className="font-bold">Unknown</span>
                        )}
                        <span className="text-xs text-text-faint">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-text-muted">{comment.content}</p>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-text-faint">
                    {currentUserId && (
                        <button type="button" onClick={like} disabled={pending} className={`flex cursor-pointer items-center gap-1 rounded px-2 py-1 hover:text-primary ${comment.liked ? "text-primary" : ""}`}>
                            <Heart size={14} className={comment.liked ? "fill-primary" : ""} />
                            {comment.likes}
                        </button>
                    )}
                    {currentUserId && (
                        <button type="button" onClick={() => setReplying(!replying)} className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 hover:text-primary">
                            <MessageCircle size={14} />
                            Reply
                        </button>
                    )}
                </div>
                {replying && (
                    <div className="mt-2">
                        <CommentForm action={replyAction} placeholder="Write a reply" />
                    </div>
                )}
                {replies.length > 0 && (
                    <div className="mt-3 flex flex-col gap-3 border-l border-border pl-3">
                        {replies.map((reply) => (
                            <CommentItem key={reply.id} comment={reply} comments={comments} targetType={targetType} targetId={targetId} currentUserId={currentUserId} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CommentSectionClient({ targetType, targetId, comments, currentUserId }: { targetType: InteractionTargetType; targetId: string; comments: Comment[]; currentUserId: string | null }) {
    const topLevelComments = comments.filter((comment) => !comment.parentId);
    const addTopLevel = addComment.bind(null, targetType, targetId, null);

    return (
        <section className="flex flex-col gap-4 rounded bg-bg p-4">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                <h2 className="text-sm font-bold">Comments</h2>
                <span className="text-xs text-text-faint">{comments.length}</span>
            </div>
            {currentUserId ? (
                <CommentForm action={addTopLevel} />
            ) : (
                <p className="rounded border border-border p-3 text-sm text-text-muted">
                    <Link href="/login" className="font-bold text-primary">Log in</Link> to comment.
                </p>
            )}
            <div className="flex flex-col gap-4">
                {topLevelComments.length ? topLevelComments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} comments={comments} targetType={targetType} targetId={targetId} currentUserId={currentUserId} />
                )) : (
                    <p className="text-sm text-text-muted">No comments yet.</p>
                )}
            </div>
        </section>
    );
}
