import CommentSectionClient from "@/components/comments/CommentSectionClient";
import { auth } from "@/lib/auth";
import { getComments } from "@/lib/data/comments";
import { type InteractionTargetType } from "@/lib/generated/prisma/enums";

export default async function CommentSection({ targetType, targetId }: Readonly<{ targetType: InteractionTargetType; targetId: string }>) {
	const session = await auth();
	const comments = await getComments(targetType, targetId, session?.user?.id);

	return <CommentSectionClient targetType={targetType} targetId={targetId} comments={comments} currentUserId={session?.user?.id ?? null} />;
}
