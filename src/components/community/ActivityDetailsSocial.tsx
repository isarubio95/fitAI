import { useMemo } from "react";
import { ActivitySocialActions } from "@/components/community/ActivitySocialActions";
import { useActivityCommentCounts } from "@/hooks/useActivityComments";
import { useActivityLikes } from "@/hooks/useActivityLikes";
import { useCardioSessionCommentCounts } from "@/hooks/useCardioSessionComments";
import { useCardioSessionLikes } from "@/hooks/useCardioSessionLikes";

type Props = {
  kind: "gym" | "cardio";
  targetId: string;
  ownerId: string;
  isPublic: boolean;
  initialCommentsOpen?: boolean;
  className?: string;
};

/** Likes y comentarios en el detalle de un entreno o sesión de cardio. */
export function ActivityDetailsSocial({
  kind,
  targetId,
  ownerId,
  isPublic,
  initialCommentsOpen,
  className,
}: Props) {
  const ids = useMemo(() => [targetId], [targetId]);
  const gymLikes = useActivityLikes(kind === "gym" ? ids : []);
  const gymComments = useActivityCommentCounts(kind === "gym" ? ids : []);
  const cardioLikes = useCardioSessionLikes(kind === "cardio" ? ids : []);
  const cardioComments = useCardioSessionCommentCounts(kind === "cardio" ? ids : []);

  if (!isPublic) return null;

  const likes = kind === "cardio" ? cardioLikes : gymLikes;
  const comments = kind === "cardio" ? cardioComments : gymComments;

  return (
    <ActivitySocialActions
      key={`${kind}-${targetId}-${initialCommentsOpen ? "comments" : "idle"}`}
      kind={kind}
      targetId={targetId}
      ownerId={ownerId}
      likeCount={likes.likeCounts[targetId] ?? 0}
      liked={likes.likedIds.has(targetId)}
      commentCount={comments.commentCounts[targetId] ?? 0}
      commented={comments.commentedIds.has(targetId)}
      onToggleLike={() => likes.toggleLike(targetId)}
      isTogglingLike={likes.isToggling.has(targetId)}
      defaultCommentsOpen={!!initialCommentsOpen}
      className={className}
    />
  );
}
