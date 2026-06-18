"use client";

import { markNotificationsRead } from "@/lib/actions/social";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import MenuPanel from "../ui/MenuPanel";

type Notification = {
    id: string;
    type: string;
    targetType: string | null;
    targetId: string | null;
    targetHref: string;
    readAt: Date | string | null;
    createdAt: Date | string;
    actor: {
        name: string | null;
    } | null;
};

function notificationText(notification: Notification) {
    const actor = notification.actor?.name ?? "Someone";

    if (notification.type === "COMMENT_REPLY") return `${actor} replied to your comment.`;
    if (notification.type === "COMMENTED_ON_PROFILE") return `${actor} commented on your profile.`;
    if (notification.type === "RECEIVED_LIKE") return `${actor} liked your post.`;
    if (notification.type === "FOLLOWED_USER") return `${actor} followed you.`;
    if (notification.type === "FOLLOWING_CREATED_LIST") return `${actor} created a new list.`;
    if (notification.type === "EARNED_BADGE") return "You earned a badge.";
    return "New notification.";
}

export default function NotificationMenu({ notifications }: { notifications: Notification[] }) {
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(notifications.some((notification) => !notification.readAt));
    const [pending, startTransition] = useTransition();
    const buttonRef = useRef<HTMLButtonElement>(null);

    function toggle() {
        setOpen(!open);

        if (!open && unread) {
            setUnread(false);
            startTransition(async () => {
                await markNotificationsRead();
            });
        }
    }

    return (
        <div className="relative">
            <button ref={buttonRef} type="button" onClick={toggle} disabled={pending} className="relative grid size-10 cursor-pointer place-items-center rounded text-text-muted transition hover:text-primary" aria-label="Notifications">
                <Bell size={19} />
                {unread && <span className="absolute right-2 top-2 size-2 rounded-full bg-error" />}
            </button>
            <MenuPanel open={open} onClose={() => setOpen(false)} variant="anchored" showClose={false} role="menu" anchorRef={buttonRef}>
                    <h2 className="border-b border-border px-2 pb-2 text-sm font-bold">Notifications</h2>
                    <div className="mt-2 flex max-h-96 flex-col overflow-y-auto">
                        {notifications.length ? notifications.map((notification) => (
                            <Link key={notification.id} href={notification.targetHref} onClick={() => setOpen(false)} className="rounded px-3 py-2 text-text-muted hover:bg-primary hover:text-text">
                                <p>{notificationText(notification)}</p>
                                <p className="mt-1 text-xs opacity-75">{new Date(notification.createdAt).toLocaleDateString()}</p>
                            </Link>
                        )) : (
                            <p className="px-3 py-4 text-text-muted">No notifications yet.</p>
                        )}
                    </div>
            </MenuPanel>
        </div>
    );
}
