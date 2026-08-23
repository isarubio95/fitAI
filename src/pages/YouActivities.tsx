import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useProfileActivityHistory } from "@/hooks/useProfileActivityHistory";
import { useProfileDrawer } from "@/components/layout/ProfileDrawer";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PAGE_CARD_STACK_GAP } from "@/lib/pageStyles";
import { filterPillActive, filterPillBase, filterPillInactive } from "@/lib/filter-pill-styles";

type ActivityFilter = "all" | "gym" | "cardio";

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "gym", label: "Gym" },
  { id: "cardio", label: "Cardio" },
];

const YouActivities = () => {
  const { user } = useAuth();
  const { openMyProfile, openUserProfile } = useProfileDrawer();
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [workoutDetailsId, setWorkoutDetailsId] = useState<string | null>(null);
  const [cardioDetailsId, setCardioDetailsId] = useState<string | null>(null);

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

  const publicWorkoutIds = useMemo(() => {
    const ids: string[] = [];
    for (const item of filtered) {
      if (item.type === "gym" && item.workout.es_publica) ids.push(item.workout.id);
    }
    return ids;
  }, [filtered]);

  const publicCardioIds = useMemo(() => {
    const ids: string[] = [];
    for (const item of filtered) {
      if (item.type === "cardio" && item.session.es_publica) ids.push(item.session.id);
    }
    return ids;
  }, [filtered]);

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
  });

  const cardioSocialFor = (sessionId: string): CardioFeedCardSocial => ({
    likeCount: cardioLikeCounts[sessionId] ?? 0,
    liked: cardioLikedIds.has(sessionId),
    commentCount: cardioCommentCounts[sessionId] ?? 0,
    commented: cardioCommentedIds.has(sessionId),
    onToggleLike: () => toggleCardioLike(sessionId),
    isTogglingLike: isTogglingCardioLike.has(sessionId),
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

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col bg-card max-md:-mb-24 max-md:pb-24 md:mx-auto md:max-w-2xl md:bg-transparent md:px-8 md:pt-3">
      <div className={cn("flex w-full flex-col bg-background md:bg-transparent", PAGE_CARD_STACK_GAP)}>
        <div className="flex gap-2 overflow-x-auto px-4 py-2 md:px-0">
          {FILTERS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
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

        {isLoading ? (
          <div
            className={cn("flex flex-col bg-background", PAGE_CARD_STACK_GAP)}
            aria-busy="true"
            aria-label="Cargando actividades"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="space-y-4 bg-card px-6 pb-4 pt-6 md:rounded-3xl md:border md:border-border/20"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2 pt-1">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            Aún no has registrado actividades.
          </p>
        ) : (
          <div className={cn("flex flex-col bg-background", PAGE_CARD_STACK_GAP)}>
            {filtered.map((item) =>
              item.type === "gym" ? (
                <WorkoutFeedCard
                  key={`gym-${item.workout.id}`}
                  workout={item.workout}
                  author={workoutAuthor}
                  onSelectAuthor={openAuthorProfile}
                  onSelectWorkout={setWorkoutDetailsId}
                  social={item.workout.es_publica ? socialFor(item.workout.id) : null}
                />
              ) : (
                <CardioFeedCard
                  key={`cardio-${item.session.id}`}
                  session={item.session}
                  author={workoutAuthor}
                  onSelectAuthor={openAuthorProfile}
                  onSelectSession={setCardioDetailsId}
                  social={item.session.es_publica ? cardioSocialFor(item.session.id) : null}
                />
              ),
            )}
          </div>
        )}
      </div>

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
    </div>
  );
};

export default YouActivities;
