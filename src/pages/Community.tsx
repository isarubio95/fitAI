import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, UserPlus, UserCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useFollows } from "@/hooks/useFollows";
import { useCommunityFeed, type CommunityFeedItem } from "@/hooks/useCommunityFeed";
import { useCommunityFocusedItem } from "@/hooks/useCommunityFocusedItem";
import { useActivityLikes } from "@/hooks/useActivityLikes";
import { useActivityCommentCounts } from "@/hooks/useActivityComments";
import { useCardioSessionLikes } from "@/hooks/useCardioSessionLikes";
import { useCardioSessionCommentCounts } from "@/hooks/useCardioSessionComments";
import { useProfileDrawer } from "@/components/layout/ProfileDrawer";
import { WorkoutDetailsSheet } from "@/components/dashboard/WorkoutDetailsSheet";
import {
  CardioFeedCard,
  CardioFeedCardBody,
  type CardioFeedCardSocial,
} from "@/components/cardio/CardioFeedCard";
import { CardioDetailsSheet } from "@/components/cardio/CardioDetailsSheet";
import {
  CommunityAvatar,
  COMMUNITY_CARD_CLASS,
  WorkoutFeedCard,
  WorkoutFeedCardBody,
  type WorkoutFeedCardSocial,
} from "@/components/dashboard/WorkoutFeedCard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_CARD_STACK_GAP, PAGE_STACK_INSET } from "@/lib/pageStyles";
import { communityFeedEmptyMessage } from "@/lib/communityFeedVisibility";
import { cn } from "@/lib/utils";

function feedItemKey(item: CommunityFeedItem) {
  return item.type === "gym" ? `gym-${item.workout.id}` : `cardio-${item.session.id}`;
}

export default function Community() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const focusGymId = searchParams.get("gym");
  const focusCardioId = searchParams.get("cardio");
  const focusCommentsOpen = searchParams.get("comments") === "1";
  const [usernameQuery, setUsernameQuery] = useState("");
  const [workoutDetailsId, setWorkoutDetailsId] = useState<string | null>(null);
  const [cardioDetailsId, setCardioDetailsId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data: searchResults = [], isLoading: searching } = useUserSearch(usernameQuery);
  const { followingIds, toggleFollow, isToggling, isFetched: followsFetched } = useFollows();
  const {
    data,
    isLoading: loadingFeedQuery,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommunityFeed(followingIds, { enabled: followsFetched });
  const loadingFeed = !followsFetched || loadingFeedQuery;
  const { item: focusedItem, isLoading: loadingFocused } = useCommunityFocusedItem(
    focusGymId,
    focusCardioId,
  );
  const { openMyProfile, openUserProfile } = useProfileDrawer();

  const showSearchPanel = searching || usernameQuery.trim().length > 0;
  const communityCardClass = COMMUNITY_CARD_CLASS;

  const normalizedFeed = useMemo(() => {
    const items = data?.pages.flatMap((page) => page.items) ?? [];
    return items
      .slice()
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [data]);

  const displayFeed = useMemo(() => {
    if (!focusedItem) return normalizedFeed;
    const key = feedItemKey(focusedItem);
    return [focusedItem, ...normalizedFeed.filter((item) => feedItemKey(item) !== key)];
  }, [focusedItem, normalizedFeed]);

  const feedActividadIds = useMemo(() => {
    const ids = displayFeed.filter((item) => item.type === "gym").map((item) => item.workout.id);
    if (focusGymId && !ids.includes(focusGymId)) ids.unshift(focusGymId);
    return ids;
  }, [displayFeed, focusGymId]);
  const feedCardioIds = useMemo(() => {
    const ids = displayFeed.filter((item) => item.type === "cardio").map((item) => item.session.id);
    if (focusCardioId && !ids.includes(focusCardioId)) ids.unshift(focusCardioId);
    return ids;
  }, [displayFeed, focusCardioId]);
  const { likeCounts, likedIds, toggleLike, isToggling: isTogglingLike } =
    useActivityLikes(feedActividadIds);
  const { commentCounts, commentedIds } = useActivityCommentCounts(feedActividadIds);
  const {
    likeCounts: cardioLikeCounts,
    likedIds: cardioLikedIds,
    toggleLike: toggleCardioLike,
    isToggling: isTogglingCardioLike,
  } = useCardioSessionLikes(feedCardioIds);
  const { commentCounts: cardioCommentCounts, commentedIds: cardioCommentedIds } =
    useCardioSessionCommentCounts(feedCardioIds);

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

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || showSearchPanel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: null, rootMargin: "300px 0px", threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, displayFeed.length, showSearchPanel]);

  const openAuthorProfile = (authorId: string) => {
    if (authorId === user?.id) openMyProfile();
    else openUserProfile(authorId);
  };

  const hasMergedSecondBlock = !showSearchPanel && (loadingFeed || loadingFocused || displayFeed.length > 0);

  const searchFields = (
    <>
      <div className="relative">
        <Input
          placeholder="Ej: juan_gym"
          value={usernameQuery}
          onChange={(e) => setUsernameQuery(e.target.value)}
          className="h-12"
        />
      </div>
    </>
  );

  const searchResultsBody =
    searching ? (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl bg-card" />
        ))}
      </div>
    ) : searchResults.length === 0 ? (
      <p className="text-sm text-muted-foreground">No encontramos usuarios con ese nombre.</p>
    ) : (
      <div className="flex flex-col gap-2">
        {searchResults.map((p) => {
          const isOwn = p.id === user?.id;
          const isFollowing = followingIds.has(p.id);

          const openProfile = () => {
            if (p.id === user?.id) openMyProfile();
            else openUserProfile(p.id);
          };

          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 border-0 p-3 rounded-xl bg-muted"
            >
              <button
                type="button"
                onClick={openProfile}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CommunityAvatar avatarUrl={p.avatar_url} username={p.username} className="h-10 w-10 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.username}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.id === user?.id ? "Tú" : "Usuario"}</p>
                </div>
              </button>

              {!isOwn && (
                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  onClick={() => toggleFollow(p.id)}
                  disabled={isToggling.has(p.id)}
                  className={cn(
                    "mt-0 w-auto",
                    isFollowing && "bg-border hover:bg-border/80 dark:hover:bg-border/90",
                  )}
                >
                  {isFollowing ? (
                    <span className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4" /> Siguiendo
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <UserPlus className="h-4 w-4" /> Seguir
                    </span>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    );

  const renderFeedItemBody = (item: CommunityFeedItem) =>
    item.type === "gym" ? (
      <WorkoutFeedCardBody
        workout={item.workout}
        author={item.author}
        onSelectAuthor={openAuthorProfile}
        onSelectWorkout={setWorkoutDetailsId}
        social={socialFor(item.workout.id)}
      />
    ) : (
      <CardioFeedCardBody
        session={item.session}
        author={item.author}
        onSelectAuthor={openAuthorProfile}
        onSelectSession={setCardioDetailsId}
        social={cardioSocialFor(item.session.id)}
      />
    );

  const renderFeedCard = (item: CommunityFeedItem) =>
    item.type === "gym" ? (
      <WorkoutFeedCard
        key={feedItemKey(item)}
        workout={item.workout}
        author={item.author}
        onSelectAuthor={openAuthorProfile}
        onSelectWorkout={setWorkoutDetailsId}
        social={socialFor(item.workout.id)}
      />
    ) : (
      <CardioFeedCard
        key={feedItemKey(item)}
        session={item.session}
        author={item.author}
        onSelectAuthor={openAuthorProfile}
        onSelectSession={setCardioDetailsId}
        social={cardioSocialFor(item.session.id)}
      />
    );

  return (
    <>
      <div className="flex w-full min-w-0 flex-1 flex-col bg-background max-md:-mb-24 max-md:pb-24 md:mx-auto md:max-w-2xl md:bg-transparent md:px-8">
        <section
          className={cn(
            "flex w-full flex-col bg-background md:bg-transparent",
            PAGE_CARD_STACK_GAP,
            PAGE_STACK_INSET,
            showSearchPanel && "flex-1",
          )}
        >
          {/* Móvil: una sola card sin línea entre búsqueda y el bloque siguiente */}
          <Card
            className={cn(
              communityCardClass,
              "md:hidden",
              showSearchPanel && "flex-1",
            )}
          >
            <CardHeader className="px-6 pb-0 pt-6">
              <CardTitle className="text-base">Buscar por nombre de usuario</CardTitle>
            </CardHeader>
            <CardContent
              className={cn(
                "px-6 pt-3",
                showSearchPanel ? "pb-4" : hasMergedSecondBlock && "pb-4",
              )}
            >
              {searchFields}
            </CardContent>
            {showSearchPanel && (
              <CardContent className="space-y-3 px-6 pb-4 pt-0">{searchResultsBody}</CardContent>
            )}
            {!showSearchPanel && (loadingFeed || loadingFocused) && displayFeed.length === 0 && (
              <div className="px-6 pb-4 pt-0">
                <Skeleton className="h-28 w-full rounded-xl bg-muted/30" />
              </div>
            )}
            {!showSearchPanel && displayFeed.length > 0 && (
              <CardContent
                className={cn(
                  "space-y-4 pb-4 pt-6",
                  displayFeed[0].type === "cardio" ? "px-0" : "px-6",
                )}
              >
                {renderFeedItemBody(displayFeed[0])}
              </CardContent>
            )}
          </Card>

          {/* Escritorio: cards separadas */}
          <div className={cn("hidden md:flex md:flex-col", PAGE_CARD_STACK_GAP)}>
            <Card className={communityCardClass}>
              <CardHeader className="px-6 pt-8">
                <CardTitle className="text-base">Buscar por nombre de usuario</CardTitle>
              </CardHeader>
              <CardContent className={cn("px-6 pt-4", showSearchPanel && "pb-4")}>
                {searchFields}
              </CardContent>
              {showSearchPanel && (
                <CardContent className="space-y-3 px-6 pb-4 pt-0">{searchResultsBody}</CardContent>
              )}
            </Card>

            {!showSearchPanel && (loadingFeed || loadingFocused) && displayFeed.length === 0 && (
              <Skeleton className="h-28 w-full rounded-3xl bg-card" />
            )}

            {!showSearchPanel && displayFeed.length > 0 && renderFeedCard(displayFeed[0])}
          </div>

          {!showSearchPanel && !loadingFeed && !loadingFocused && displayFeed.length === 0 && (
            <p className="px-6 py-6 text-center text-sm text-muted-foreground">
              {communityFeedEmptyMessage(followingIds.size)}
            </p>
          )}

          {!showSearchPanel && (loadingFeed || loadingFocused) && displayFeed.length === 0 && (
            <div className={cn("flex flex-col bg-background", PAGE_CARD_STACK_GAP)}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl bg-card md:rounded-3xl" />
              ))}
            </div>
          )}

          {!showSearchPanel && displayFeed.length > 1 && (
            <div className={cn("flex w-full flex-col bg-background", PAGE_CARD_STACK_GAP)}>
              {displayFeed.slice(1).map((item) => renderFeedCard(item))}
            </div>
          )}

          {!showSearchPanel && !loadingFeed && hasNextPage && (
            <div ref={loadMoreRef} className="flex items-center justify-center py-4">
              {isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            </div>
          )}
        </section>
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
    </>
  );
}
