import { useState, type FormEvent, type MouseEvent } from "react";
import { Heart, MessageCircle, Loader2, Trash2, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useActivityComments } from "@/hooks/useActivityComments";
import { useCardioSessionComments } from "@/hooks/useCardioSessionComments";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import {
  ACTIVITY_COMMENT_MAX_LENGTH,
  normalizeActivityCommentText,
} from "@/lib/activitySocial";
import {
  CALENDAR_DAY_EXPAND_DURATION_MS,
  calendarDayExpandTransitionAttr,
  calendarDayExpandTransitionStyle,
  useCalendarDayExpandTransition,
} from "@/lib/calendarDayExpandTransition";
import { formatActivityRelativeDate } from "@/lib/formatActivityRelativeDate";
import { cn } from "@/lib/utils";

function CommentAuthorAvatar({
  avatarUrl,
  username,
}: {
  avatarUrl?: string | null;
  username?: string | null;
}) {
  const avatar = useUserAvatar([avatarUrl]);
  return (
    <Avatar className="mt-0.5 h-7 w-7 shrink-0">
      {avatar.src ? <AvatarImage src={avatar.src} alt="" onError={avatar.onError} /> : null}
      <AvatarFallback>{username?.trim()?.[0]?.toUpperCase() || "U"}</AvatarFallback>
    </Avatar>
  );
}

export type ActivitySocialKind = "gym" | "cardio";

export type ActivitySocialStatsProps = {
  kind: ActivitySocialKind;
  targetId: string;
  ownerId: string;
  likeCount: number;
  liked: boolean;
  commentCount: number;
  commented: boolean;
  onToggleLike: () => void | Promise<void>;
  isTogglingLike?: boolean;
  /** Si true, el panel de comentarios empieza abierto. */
  defaultCommentsOpen?: boolean;
  className?: string;
};

export function ActivitySocialActions({
  kind,
  targetId,
  ownerId,
  likeCount,
  liked,
  commentCount,
  commented,
  onToggleLike,
  isTogglingLike = false,
  defaultCommentsOpen = false,
  className,
}: ActivitySocialStatsProps) {
  const { user } = useAuth();
  const [commentsOpen, setCommentsOpen] = useState(defaultCommentsOpen);
  const [draft, setDraft] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const commentsPanel = useCalendarDayExpandTransition(commentsOpen ? "comments" : null);
  const commentsMounted = !!commentsPanel;

  const gymComments = useActivityComments(
    kind === "gym" ? targetId : null,
    commentsMounted && kind === "gym",
  );
  const cardioComments = useCardioSessionComments(
    kind === "cardio" ? targetId : null,
    commentsMounted && kind === "cardio",
  );

  const { comments, isLoading, addComment, removeComment, isAdding } =
    kind === "cardio" ? cardioComments : gymComments;

  const displayCommentCount = commentsMounted && comments.length > 0 ? comments.length : commentCount;
  const commentedFromList =
    commentsMounted && !isLoading && user
      ? comments.some((c) => c.usuario_id === user.id)
      : null;
  const hasCommented = commentedFromList ?? commented;

  const handleToggleLike = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user || isTogglingLike) return;
    void onToggleLike();
  };

  const handleToggleComments = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCommentsOpen((v) => !v);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSubmitError(null);
    const texto = normalizeActivityCommentText(draft);
    if (!texto) {
      setSubmitError(`Escribe entre 1 y ${ACTIVITY_COMMENT_MAX_LENGTH} caracteres.`);
      return;
    }
    try {
      await addComment(texto);
      setDraft("");
    } catch {
      setSubmitError("No se pudo publicar el comentario.");
    }
  };

  const canDelete = (commentUserId: string) =>
    !!user && (user.id === commentUserId || user.id === ownerId);

  return (
    <div
      className={cn(className)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="flex w-full items-center -mt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-11 w-1/2 flex-1 gap-2 px-3 text-muted-foreground [&_svg]:size-[1.15rem]",
            liked && "text-rose-600 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-400",
          )}
          aria-pressed={liked}
          aria-label={liked ? "Quitar me gusta" : "Me gusta"}
          disabled={!user || isTogglingLike}
          onClick={handleToggleLike}
        >
          <Heart className={cn("h-[1.15rem] w-[1.15rem]", liked && "fill-current")} />
          <span className="tabular-nums text-sm font-medium">{likeCount}</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-11 w-1/2 flex-1 gap-2 px-3 text-muted-foreground [&_svg]:size-[1.15rem]",
            commentsOpen && "text-foreground",
          )}
          aria-expanded={commentsOpen}
          aria-label={commentsOpen ? "Ocultar comentarios" : "Ver comentarios"}
          onClick={handleToggleComments}
        >
          <MessageCircle className={cn("h-[1.15rem] w-[1.15rem]", hasCommented && "fill-current")} />
          <span className="tabular-nums text-sm font-medium">{displayCommentCount}</span>
        </Button>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] ease-[cubic-bezier(0.32,0.72,0,1)]",
          commentsPanel && commentsPanel.phase !== "out"
            ? "grid-rows-[1fr]"
            : "grid-rows-[0fr]",
        )}
        style={{ transitionDuration: `${CALENDAR_DAY_EXPAND_DURATION_MS}ms` }}
      >
        <div className="min-h-0 overflow-hidden">
          {commentsPanel ? (
            <div
              className="space-y-3 border-t border-border/40 pt-3"
              data-calendar-day-expand={commentsPanel.phase}
              {...(commentsPanel.phase !== "settled"
                ? {
                    "transition-style": calendarDayExpandTransitionAttr(commentsPanel.phase),
                  }
                : {})}
              style={calendarDayExpandTransitionStyle(commentsPanel.phase)}
            >
              {isLoading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sé el primero en comentar.</p>
              ) : (
                <ul className="max-h-56 space-y-3 overflow-y-auto pr-1">
                  {comments.map((c) => (
                    <li key={c.id} className="flex gap-2">
                      <CommentAuthorAvatar
                        avatarUrl={c.author.avatar_url}
                        username={c.author.username}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="truncate text-xs font-semibold">
                            {c.author.username ?? "Usuario"}
                          </span>
                          <time
                            dateTime={c.created_at}
                            className="shrink-0 text-[10px] text-muted-foreground"
                          >
                            {formatActivityRelativeDate(c.created_at)}
                          </time>
                          {canDelete(c.usuario_id) ? (
                            <button
                              type="button"
                              className="ml-auto shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                              aria-label="Eliminar comentario"
                              onClick={(e) => {
                                e.stopPropagation();
                                void removeComment(c.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                        <p className="whitespace-pre-wrap break-words text-sm text-foreground/90">
                          {c.texto}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {user ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Escribe un comentario…"
                    rows={2}
                    maxLength={ACTIVITY_COMMENT_MAX_LENGTH}
                    className="min-h-[4.5rem] resize-none text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {draft.trim().length}/{ACTIVITY_COMMENT_MAX_LENGTH}
                    </span>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5"
                      disabled={isAdding || !draft.trim()}
                    >
                      {isAdding ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Publicar
                    </Button>
                  </div>
                  {submitError ? (
                    <p className="text-xs text-destructive">{submitError}</p>
                  ) : null}
                </form>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
