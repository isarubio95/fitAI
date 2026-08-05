import { useMemo, useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useFollows } from "@/hooks/useFollows";
import { useCommunityFeed } from "@/hooks/useCommunityFeed";
import { useProfileDrawer } from "@/components/layout/ProfileDrawer";
import { WorkoutDetailsSheet } from "@/components/dashboard/WorkoutDetailsSheet";
import {
  CommunityAvatar,
  COMMUNITY_CARD_CLASS,
  WorkoutFeedCard,
  WorkoutFeedCardBody,
} from "@/components/dashboard/WorkoutFeedCard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_CARD_STACK_GAP } from "@/lib/pageStyles";
import { cn } from "@/lib/utils";

export default function Community() {
  const { user } = useAuth();
  const [usernameQuery, setUsernameQuery] = useState("");
  const [workoutDetailsId, setWorkoutDetailsId] = useState<string | null>(null);

  const { data: searchResults = [], isLoading: searching } = useUserSearch(usernameQuery);
  const { followingIds, toggleFollow, isToggling } = useFollows();
  const { data: feed, isLoading: loadingFeed } = useCommunityFeed();
  const { openMyProfile, openUserProfile } = useProfileDrawer();

  const normalizedFeed = useMemo(() => {
    return (feed ?? []).slice().sort((a, b) => new Date(b.workout.fecha).getTime() - new Date(a.workout.fecha).getTime());
  }, [feed]);

  const showSearchPanel = searching || usernameQuery.trim().length > 0;
  const communityCardClass = COMMUNITY_CARD_CLASS;

  const openAuthorProfile = (authorId: string) => {
    if (authorId === user?.id) openMyProfile();
    else openUserProfile(authorId);
  };

  const hasMergedSecondBlock = !showSearchPanel && (loadingFeed || normalizedFeed.length > 0);

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
          <Skeleton key={i} className="h-16 w-full rounded-none border-0 bg-card md:rounded-xl" />
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
                    <span className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" /> Siguiendo
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
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

  const renderFeedItemBody = (item: (typeof normalizedFeed)[number]) => (
    <WorkoutFeedCardBody
      workout={item.workout}
      author={item.author}
      onSelectAuthor={openAuthorProfile}
      onSelectWorkout={setWorkoutDetailsId}
    />
  );

  const renderFeedCard = (item: (typeof normalizedFeed)[number]) => (
    <WorkoutFeedCard
      key={item.workout.id}
      workout={item.workout}
      author={item.author}
      onSelectAuthor={openAuthorProfile}
      onSelectWorkout={setWorkoutDetailsId}
    />
  );

  return (
    <>
      <div className="flex w-full min-w-0 flex-1 flex-col bg-card max-md:-mb-24 max-md:pb-24 md:mx-auto md:max-w-2xl md:bg-transparent md:px-8">
        <section
          className={cn(
            "flex w-full flex-col",
            PAGE_CARD_STACK_GAP,
            showSearchPanel ? "flex-1 bg-card md:bg-transparent" : "bg-background md:bg-transparent",
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
            {!showSearchPanel && loadingFeed && (
              <div className="px-6 pb-4 pt-0">
                <Skeleton className="h-28 w-full rounded-none border-0 bg-muted/30" />
              </div>
            )}
            {!showSearchPanel && !loadingFeed && normalizedFeed.length > 0 && (
              <CardContent className="space-y-4 px-6 pb-4 pt-6">
                {renderFeedItemBody(normalizedFeed[0])}
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

            {!showSearchPanel && loadingFeed && (
              <Skeleton className="h-28 w-full rounded-3xl border-0 bg-card" />
            )}

            {!showSearchPanel && !loadingFeed && normalizedFeed.length > 0 && renderFeedCard(normalizedFeed[0])}
          </div>

          {!showSearchPanel && !loadingFeed && normalizedFeed.length === 0 && (
            <p className="px-6 py-6 text-center text-sm text-muted-foreground">Todavía no hay entrenos publicados.</p>
          )}

          {!showSearchPanel && loadingFeed && normalizedFeed.length === 0 && (
            <div className={cn("flex flex-col bg-background", PAGE_CARD_STACK_GAP)}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-none border-0 bg-card md:rounded-3xl" />
              ))}
            </div>
          )}

          {!showSearchPanel && !loadingFeed && normalizedFeed.length > 1 && (
            <div className={cn("flex w-full flex-col bg-background", PAGE_CARD_STACK_GAP)}>
              {normalizedFeed.slice(1).map((item) => renderFeedCard(item))}
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
    </>
  );
}
