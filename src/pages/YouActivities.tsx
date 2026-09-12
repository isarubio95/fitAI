import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useProfileActivityHistory } from "@/hooks/useProfileActivityHistory";
import { useProfileDrawer } from "@/components/layout/profileDrawerContext";
import { WorkoutDetailsSheet } from "@/components/dashboard/WorkoutDetailsSheet";
import { CardioFeedCard, type CardioFeedCardSocial } from "@/components/cardio/CardioFeedCard";
import { CardioDetailsSheet } from "@/components/cardio/CardioDetailsSheet";
import {
  WorkoutFeedCard,
  type WorkoutFeedCardAuthor,
  type WorkoutFeedCardSocial,
} from "@/components/dashboard/WorkoutFeedCard";
import { useActivityLikes } from "@/hooks/useActivityLikes";
import { useActivityCommentCounts } from "@/hooks/useActivityComments";
import { useCardioSessionLikes } from "@/hooks/useCardioSessionLikes";
import { useCardioSessionCommentCounts } from "@/hooks/useCardioSessionComments";
import { useMountAfterPaint } from "@/hooks/useMountAfterPaint";
import { usePagedWindow } from "@/hooks/usePagedWindow";
import { cn } from "@/lib/utils";
import { PAGE_CARD_STACK_GAP, PAGE_STACK_INSET, YOU_ACTIVITIES_PAGE } from "@/lib/pageStyles";
import { filterPillActive, filterPillBase, filterPillInactive } from "@/lib/filter-pill-styles";
import { pinFocusedYouActivity } from "@/lib/youActivityHref";
import { FeedListSkeleton } from "@/components/layout/skeletons/blocks";

type ActivityFilter = "all" | "gym" | "cardio";

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "gym", label: "Gym" },
  { id: "cardio", label: "Cardio" },
];

function ActivitiesFeedSkeleton() {
  return <FeedListSkeleton showAuthor showSocial />;
}

function YouActivitiesFrame({
  filter,
  onFilter,
  children,
}: {
  filter: ActivityFilter;
  onFilter: (next: ActivityFilter) => void;
  children: ReactNode;
}) {
  return (
    <div className={YOU_ACTIVITIES_PAGE}>
      <div className={cn("flex w-full flex-col bg-background md:bg-transparent", PAGE_CARD_STACK_GAP, PAGE_STACK_INSET)}>
        <div className="flex gap-2 overflow-x-auto px-4 py-2 md:px-0">
          {FILTERS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onFilter(opt.id)}
              className={cn(
                filterPillBase,
                "whitespace-nowrap",
                filter === opt.id ? filterPillActive : filterPillInactive,
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Historial, likes y tarjetas (mapas incluidos) son demasiado caros para el
 * mismo commit que el cambio de pestaña: Progreso ya suele tener el historial
 * en caché, `isLoading` sale en falso y el skeleton no llegaba a pintarse.
 */
function YouActivitiesContent() {
  const { user } = useAuth();
  const { openMyProfile, openUserProfile } = useProfileDrawer();
  const [searchParams] = useSearchParams();
  const focusGymId = searchParams.get("gym");
  const focusCardioId = searchParams.get("cardio");
  const focusCommentsOpen = searchParams.get("comments") === "1";
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [workoutDetailsId, setWorkoutDetailsId] = useState<string | null>(null);
  const [cardioDetailsId, setCardioDetailsId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const focusedRef = useRef<HTMLDivElement | null>(null);

  const { items, isLoading } = useProfileActivityHistory(user?.id, Number.POSITIVE_INFINITY);

  const { data: perfilRow } = useQuery({
    queryKey: ["perfil-you-activities", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("perfil")
        .select("username, avatar_url")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.type === filter);
  }, [items, filter]);

  const displayItems = useMemo(
    () => pinFocusedYouActivity(filtered, focusGymId, focusCardioId),
    [filtered, focusGymId, focusCardioId],
  );

  const { visible, hasMore, loadMore } = usePagedWindow(displayItems, {
    pageSize: 8,
    resetKey: `${filter}:${focusGymId ?? ""}:${focusCardioId ?? ""}`,
  });

  const publicWorkoutIds = useMemo(() => {
    const ids: string[] = [];
    for (const item of visible) {
      if (item.type === "gym" && item.workout.es_publica) ids.push(item.workout.id);
    }
    return ids;
  }, [visible]);

  const publicCardioIds = useMemo(() => {
    const ids: string[] = [];
    for (const item of visible) {
      if (item.type === "cardio" && item.session.es_publica) ids.push(item.session.id);
    }
    return ids;
  }, [visible]);

  const { likeCounts, likedIds, toggleLike, isToggling: isTogglingLike } = useActivityLikes(publicWorkoutIds);
  const { commentCounts, commentedIds } = useActivityCommentCounts(publicWorkoutIds);
  const {
    likeCounts: cardioLikeCounts,
    likedIds: cardioLikedIds,
    toggleLike: toggleCardioLike,
    isToggling: isTogglingCardioLike,
  } = useCardioSessionLikes(publicCardioIds);
  const { commentCounts: cardioCommentCounts, commentedIds: cardioCommentedIds } =
    useCardioSessionCommentCounts(publicCardioIds);

  const socialFor = (actividadId: string): WorkoutFeedCardSocial => ({
    likeCount: likeCounts[actividadId] ?? 0,
    liked: likedIds.has(actividadId),
    commentCount: commentCounts[actividadId] ?? 0,
    commented: commentedIds.has(actividadId),
    onToggleLike: () => toggleLike(actividadId),
    isTogglingLike: isTogglingLike.has(actividadId),
    defaultCommentsOpen: focusCommentsOpen && focusGymId === actividadId,
  });

  const cardioSocialFor = (sessionId: string): CardioFeedCardSocial => ({
    likeCount: cardioLikeCounts[sessionId] ?? 0,
    liked: cardioLikedIds.has(sessionId),
    commentCount: cardioCommentCounts[sessionId] ?? 0,
    commented: cardioCommentedIds.has(sessionId),
    onToggleLike: () => toggleCardioLike(sessionId),
    isTogglingLike: isTogglingCardioLike.has(sessionId),
    defaultCommentsOpen: focusCommentsOpen && focusCardioId === sessionId,
  });

  const workoutAuthor: WorkoutFeedCardAuthor = {
    id: user?.id ?? "",
    username: perfilRow?.username ?? user?.email ?? "Tú",
    avatar_url: perfilRow?.avatar_url ?? null,
  };

  const openAuthorProfile = (authorId: string) => {
    if (authorId === user?.id) openMyProfile();
    else openUserProfile(authorId);
  };

  useEffect(() => {
    if (focusGymId || focusCardioId) setFilter("all");
  }, [focusGymId, focusCardioId]);

  useEffect(() => {
    if (!focusGymId && !focusCardioId) return;
    focusedRef.current?.scrollIntoView?.({ block: "start", behavior: "smooth" });
  }, [focusGymId, focusCardioId, isLoading, visible.length]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: null, rootMargin: "300px 0px", threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore, visible.length]);

  return (
    <>
      <YouActivitiesFrame filter={filter} onFilter={setFilter}>
        {isLoading ? (
          <ActivitiesFeedSkeleton />
        ) : filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Aún no has registrado actividades.
          </p>
        ) : (
          <div className={cn("flex flex-col bg-background", PAGE_CARD_STACK_GAP)}>
            {visible.map((item) => {
              if (item.type === "gym") {
                const isFocused = item.workout.id === focusGymId;
                return (
                  <div
                    key={`gym-${item.workout.id}`}
                    ref={isFocused ? focusedRef : undefined}
                    className="scroll-mt-24"
                    data-focused-activity={isFocused ? "true" : undefined}
                  >
                    <WorkoutFeedCard
                      workout={item.workout}
                      author={workoutAuthor}
                      onSelectAuthor={openAuthorProfile}
                      onSelectWorkout={setWorkoutDetailsId}
                      social={item.workout.es_publica ? socialFor(item.workout.id) : null}
                    />
                  </div>
                );
              }

              const isFocused = item.session.id === focusCardioId;
              return (
                <div
                  key={`cardio-${item.session.id}`}
                  ref={isFocused ? focusedRef : undefined}
                  className="scroll-mt-24"
                  data-focused-activity={isFocused ? "true" : undefined}
                >
                  <CardioFeedCard
                    session={item.session}
                    author={workoutAuthor}
                    onSelectAuthor={openAuthorProfile}
                    onSelectSession={setCardioDetailsId}
                    social={item.session.es_publica ? cardioSocialFor(item.session.id) : null}
                  />
                </div>
              );
            })}
            {hasMore ? <div ref={loadMoreRef} className="h-px w-full" aria-hidden /> : null}
          </div>
        )}
      </YouActivitiesFrame>

      <WorkoutDetailsSheet
        open={!!workoutDetailsId}
        onOpenChange={(next) => {
          if (!next) setWorkoutDetailsId(null);
        }}
        workoutId={workoutDetailsId}
      />

      <CardioDetailsSheet
        open={!!cardioDetailsId}
        onOpenChange={(next) => {
          if (!next) setCardioDetailsId(null);
        }}
        sessionId={cardioDetailsId}
      />
    </>
  );
}

const YouActivities = () => {
  const ready = useMountAfterPaint();

  if (!ready) {
    return (
      <YouActivitiesFrame filter="all" onFilter={() => undefined}>
        <ActivitiesFeedSkeleton />
      </YouActivitiesFrame>
    );
  }

  return <YouActivitiesContent />;
};

export default YouActivities;
