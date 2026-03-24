import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UserPlus, UserCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useFollows } from "@/hooks/useFollows";
import { useCommunityFeed } from "@/hooks/useCommunityFeed";
import { useProfileDrawer } from "@/components/layout/ProfileDrawer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

function initialsFromUsername(username?: string | null) {
  if (!username) return "U";
  const parts = username.trim().split(/[\s_\\-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export default function Community() {
  const { user } = useAuth();
  const [usernameQuery, setUsernameQuery] = useState("");

  const { data: searchResults = [], isLoading: searching } = useUserSearch(usernameQuery);
  const { followingIds, toggleFollow, isToggling } = useFollows();
  const { data: feed, isLoading: loadingFeed } = useCommunityFeed();
  const { openMyProfile, openUserProfile } = useProfileDrawer();

  const normalizedFeed = useMemo(() => {
    // Por si el backend devuelve cualquier otra cosa en el futuro.
    return (feed ?? []).slice().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [feed]);

  return (
    <div className="w-full min-w-0 pt-6 pb-8 space-y-6 md:max-w-2xl md:mx-auto md:px-8">
      <section className="space-y-3">
        <Card className="w-full rounded-none border-x-0 md:rounded-3xl md:border-x">
          <CardHeader>
            <CardTitle className="text-base">Buscar por nombre de usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Input
                placeholder="Ej: juan_gym"
                value={usernameQuery}
                onChange={(e) => setUsernameQuery(e.target.value)}
                className="h-12"
              />
            </div>

            {searching ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-none md:rounded-xl" />
                ))}
              </div>
            ) : usernameQuery.trim().length === 0 ? (
              <p className="text-sm text-muted-foreground">Escribe un username para encontrar usuarios.</p>
            ) : searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">No encontramos usuarios con ese nombre.</p>
            ) : (
              <div className="space-y-2">
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
                      className="flex items-center justify-between gap-3 rounded-none border p-3 md:rounded-xl"
                    >
                      <button
                        type="button"
                        onClick={openProfile}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring -m-1 p-1"
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          {p.avatar_url && <AvatarImage src={p.avatar_url} alt="" />}
                          <AvatarFallback>{initialsFromUsername(p.username)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{p.username}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {p.id === user?.id ? "Tú" : "Usuario"}
                          </p>
                        </div>
                      </button>

                      {!isOwn && (
                        <Button
                          onClick={() => toggleFollow(p.id)}
                          disabled={isToggling.has(p.id)}
                          className="w-auto mt-0"
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
      </section>

      <section className="space-y-3">
        <h2 className="px-6 text-lg font-semibold md:px-0">Feed</h2>

        {loadingFeed ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-none md:rounded-xl" />
            ))}
          </div>
        ) : normalizedFeed.length === 0 ? (
          <p className="px-6 py-6 text-center text-sm text-muted-foreground md:px-0">
            Todavía no hay entrenos publicados.
          </p>
        ) : (
          <div className="space-y-3">
            {normalizedFeed.map((item) => (
              <Card key={item.id} className="w-full rounded-none border-x-0 md:rounded-3xl md:border-x">
                <CardContent className="space-y-2 px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.author.id === user?.id) openMyProfile();
                          else openUserProfile(item.author.id);
                        }}
                        className="shrink-0 rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        aria-label={`Ver perfil de ${item.author.username ?? "usuario"}`}
                      >
                        <Avatar className="h-9 w-9">
                          {item.author.avatar_url && <AvatarImage src={item.author.avatar_url} alt="" />}
                          <AvatarFallback>{initialsFromUsername(item.author.username)}</AvatarFallback>
                        </Avatar>
                      </button>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{item.author.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(item.fecha), "d MMM yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold">{item.titulo}</p>
                    {item.comentarios ? <p className="text-sm text-muted-foreground line-clamp-3">{item.comentarios}</p> : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

