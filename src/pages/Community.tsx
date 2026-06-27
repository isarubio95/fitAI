import { useMemo, useState } from "react";
import { Shield, UserPlus, UserCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useFollows } from "@/hooks/useFollows";
import { useCommunityFeed } from "@/hooks/useCommunityFeed";
import { useProfileDrawer } from "@/components/layout/ProfileDrawer";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { fetchProfileLevelsForUsers } from "@/hooks/useGamification";
import { WorkoutDetailsContent, WorkoutDetailsSheet } from "@/components/dashboard/WorkoutDetailsSheet";
import { supabase } from "@/integrations/supabase/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_CARD_STACK_GAP } from "@/lib/pageStyles";
import { cn } from "@/lib/utils";
function initialsFromUsername(username?: string | null) {
  return username?.trim()?.[0]?.toUpperCase() || "U";
}

function CommunityAvatar({
  avatarUrl,
  username,
  className,
}: {
  avatarUrl?: string | null;
  username?: string | null;
  className: string;
}) {
  const avatar = useUserAvatar([avatarUrl]);
  return (
    <Avatar className={className}>
      {avatar.src ? <AvatarImage src={avatar.src} alt="" onError={avatar.onError} /> : null}
      <AvatarFallback>{initialsFromUsername(username)}</AvatarFallback>
    </Avatar>
  );
}

function CommunityAuthorLevel({ nivel }: { nivel: number }) {
  return (
    <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold leading-tight tabular-nums text-foreground">
      <Shield className="h-3.5 w-3.5 text-primary" />
      Nivel {nivel}
    </span>
  );
}

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
  const communityCardClass =
    "w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20";

  const workoutCompactCardClass =
    "w-full max-w-none overflow-hidden rounded-none border-x-0 border-border/20 shadow-xs transition-colors hover:bg-muted/30 md:border-x";

  const authorIds = useMemo(
    () => Array.from(new Set(normalizedFeed.map((item) => item.author.id))),
    [normalizedFeed],
  );

  const { data: routineIconsByAuthor = {} } = useQuery({
    queryKey: ["community-routine-icons", authorIds],
    enabled: authorIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rutina")
        .select("usuario_id, nombre, icono")
        .in("usuario_id", authorIds)
        .not("es_plantilla", "eq", true);
      if (error) throw error;

      const map: Record<string, Record<string, string>> = {};
      for (const row of data ?? []) {
        if (!map[row.usuario_id]) map[row.usuario_id] = {};
        if (!map[row.usuario_id][row.nombre]) map[row.usuario_id][row.nombre] = row.icono;
      }
      return map;
    },
  });

  const { data: profileLevelsByAuthor = {} } = useQuery({
    queryKey: ["community-profile-levels", authorIds],
    enabled: authorIds.length > 0,
    queryFn: () => fetchProfileLevelsForUsers(authorIds),
  });

  const hasMergedSecondBlock =
    showSearchPanel || (!showSearchPanel && (loadingFeed || normalizedFeed.length > 0));

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
      {usernameQuery.trim().length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground mb-4">Escribe un username para encontrar usuarios.</p>
      )}
    </>
  );

  const searchResultsBody =
    searching ? (
      <div className={cn("flex flex-col bg-background", PAGE_CARD_STACK_GAP)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-none border-0 bg-card md:rounded-xl" />
        ))}
      </div>
    ) : searchResults.length === 0 ? (
      <p className="text-sm text-muted-foreground">No encontramos usuarios con ese nombre.</p>
    ) : (
      <div className={cn("flex flex-col bg-background", PAGE_CARD_STACK_GAP)}>
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
              className="flex items-center justify-between gap-3 rounded-none border-0 bg-card px-6 py-3 md:rounded-xl"
            >
              <button
                type="button"
                onClick={openProfile}
                className="-m-1 flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CommunityAvatar avatarUrl={p.avatar_url} username={p.username} className="h-10 w-10 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.username}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.id === user?.id ? "Tú" : "Usuario"}</p>
                </div>
              </button>

              {!isOwn && (
                <Button onClick={() => toggleFollow(p.id)} disabled={isToggling.has(p.id)} className="mt-0 w-auto">
                  {isToggling.has(p.id) ? (
                    "..."
                  ) : isFollowing ? (
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

  const renderFeedItemBody = (item: (typeof normalizedFeed)[number]) => {
    const authorLevel = profileLevelsByAuthor[item.author.id];

    return (
      <>
        <button
          type="button"
          onClick={() => {
            if (item.author.id === user?.id) openMyProfile();
            else openUserProfile(item.author.id);
          }}
          className="-m-1 mb-2 flex w-full min-w-0 items-center gap-3 rounded-lg p-1 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Ver perfil de ${item.author.username ?? "usuario"}`}
        >
          <CommunityAvatar
            avatarUrl={item.author.avatar_url}
            username={item.author.username}
            className="h-9 w-9 shrink-0"
          />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{item.author.username}</p>
          {authorLevel != null ? (
            <CommunityAuthorLevel nivel={authorLevel} />
          ) : (
            <Skeleton className="h-3.5 w-14 shrink-0" />
          )}
        </button>

        <button
          type="button"
          className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => setWorkoutDetailsId(item.workout.id)}
          aria-label={`Ver detalle de ${item.workout.titulo}`}
        >
          <Card className={workoutCompactCardClass}>
            <WorkoutDetailsContent
              workout={item.workout}
              variant="compact"
              leadingRoutineIcon={routineIconsByAuthor[item.author.id]?.[item.workout.titulo]}
            />
          </Card>
        </button>
      </>
    );
  };

  const renderFeedCard = (item: (typeof normalizedFeed)[number]) => (
    <Card key={item.workout.id} className={communityCardClass}>
      <CardContent className="space-y-3 px-6 py-4">{renderFeedItemBody(item)}</CardContent>
    </Card>
  );

  return (
    <>
      <div className="flex w-full min-w-0 flex-col bg-background md:mx-auto md:max-w-2xl md:px-8">
        <section className={cn("flex w-full flex-col bg-background", PAGE_CARD_STACK_GAP)}>
          {/* Móvil: una sola card sin línea entre búsqueda y el bloque siguiente */}
          <Card className={cn(communityCardClass, "md:hidden")}>
            <CardHeader className="px-6 pb-0 pt-8">
              <CardTitle className="text-base">Buscar por nombre de usuario</CardTitle>
            </CardHeader>
            <CardContent className={cn("px-6 pt-4", hasMergedSecondBlock && "pb-4")}>{searchFields}</CardContent>
            {showSearchPanel && (
              <CardContent className="space-y-3 px-6 pb-4 pt-0">{searchResultsBody}</CardContent>
            )}
            {!showSearchPanel && loadingFeed && (
              <div className="px-6 pb-4 pt-0">
                <Skeleton className="h-28 w-full rounded-none border-0 bg-muted/30" />
              </div>
            )}
            {!showSearchPanel && !loadingFeed && normalizedFeed.length > 0 && (
              <CardContent className="space-y-3 px-6 pb-4 pt-0">
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
              <CardContent className="px-6 pt-4">{searchFields}</CardContent>
            </Card>

            {showSearchPanel && (
              <Card className={communityCardClass}>
                <CardContent className="space-y-3 px-6 py-4">{searchResultsBody}</CardContent>
              </Card>
            )}

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

          {showSearchPanel && (
            <>
              {loadingFeed ? (
                <div className={cn("flex flex-col bg-background", PAGE_CARD_STACK_GAP)}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-none border-0 bg-card md:rounded-3xl" />
                  ))}
                </div>
              ) : normalizedFeed.length === 0 ? (
                <p className="px-6 py-6 text-center text-sm text-muted-foreground">Todavía no hay entrenos publicados.</p>
              ) : (
                <div className={cn("flex w-full flex-col bg-background", PAGE_CARD_STACK_GAP)}>
                  {normalizedFeed.map((item) => renderFeedCard(item))}
                </div>
              )}
            </>
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
