import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UserPlus, UserCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useFollows } from "@/hooks/useFollows";
import { useCommunityFeed } from "@/hooks/useCommunityFeed";
import { useProfileDrawer } from "@/components/layout/ProfileDrawer";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { WorkoutDetailsContent, WorkoutDetailsSheet } from "@/components/dashboard/WorkoutDetailsSheet";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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

  return (
    <>
      <div className="flex w-full min-w-0 flex-col gap-1 bg-background pb-8 md:mx-auto md:max-w-2xl md:px-8">
        <section className="flex w-full flex-col gap-1 bg-background">
          <Card className="w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20">
            <CardHeader className="px-6 pb-1 pt-8">
              <CardTitle className="text-base">Buscar por nombre de usuario</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pt-4 pb-8">
              <div className="relative">
                <Input
                  placeholder="Ej: juan_gym"
                  value={usernameQuery}
                  onChange={(e) => setUsernameQuery(e.target.value)}
                  className="h-12"
                />
              </div>
              {usernameQuery.trim().length === 0 && (
                <p className="mt-3 text-sm text-muted-foreground">Escribe un username para encontrar usuarios.</p>
              )}
            </CardContent>
          </Card>

          {(searching || usernameQuery.trim().length > 0) && (
            <Card className="w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20">
              <CardContent className="space-y-3 px-6 py-4">
                {searching ? (
                  <div className="flex flex-col gap-1 bg-background">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-none border-0 bg-card md:rounded-xl" />
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No encontramos usuarios con ese nombre.</p>
                ) : (
                  <div className="flex flex-col gap-1 bg-background">
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
                            <CommunityAvatar
                              avatarUrl={p.avatar_url}
                              username={p.username}
                              className="h-10 w-10 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-semibold">{p.username}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {p.id === user?.id ? "Tú" : "Usuario"}
                              </p>
                            </div>
                          </button>

                          {!isOwn && (
                            <Button
                              onClick={() => toggleFollow(p.id)}
                              disabled={isToggling.has(p.id)}
                              className="mt-0 w-auto"
                            >
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
                )}
              </CardContent>
            </Card>
          )}

          {loadingFeed ? (
            <div className="flex flex-col gap-1 bg-background">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-none border-0 bg-card md:rounded-3xl" />
              ))}
            </div>
          ) : normalizedFeed.length === 0 ? (
            <p className="px-6 py-6 text-center text-sm text-muted-foreground">Todavía no hay entrenos publicados.</p>
          ) : (
            <div className="flex w-full flex-col gap-1 bg-background">
              {normalizedFeed.map((item) => (
                <Card
                  key={item.workout.id}
                  className={cn(
                    "w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20",
                  )}
                >
                  <CardContent className="space-y-3 px-6 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.author.id === user?.id) openMyProfile();
                        else openUserProfile(item.author.id);
                      }}
                      className="-m-1 flex w-full min-w-0 items-center gap-3 pb-2 rounded-lg text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Ver perfil de ${item.author.username ?? "usuario"}`}
                    >
                      <CommunityAvatar
                        avatarUrl={item.author.avatar_url}
                        username={item.author.username}
                        className="h-9 w-9 shrink-0"
                      />
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold">{item.author.username}</p>
                      {item.workout.fecha ? (
                        <time
                          className="shrink-0 text-[11px] text-muted-foreground tabular-nums"
                          dateTime={item.workout.fecha}
                        >
                          {format(new Date(item.workout.fecha), "d MMM yyyy", { locale: es })}
                        </time>
                      ) : null}
                    </button>

                    <button
                      type="button"
                      className="-mx-1 w-full rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={() => setWorkoutDetailsId(item.workout.id)}
                      aria-label={`Ver detalle de ${item.workout.titulo}`}
                    >
                      <WorkoutDetailsContent
                        workout={item.workout}
                        variant="compact"
                        hideDate
                        containerClassName="px-0 py-0"
                      />
                    </button>
                  </CardContent>
                </Card>
              ))}
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
