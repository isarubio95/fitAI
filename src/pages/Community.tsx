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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

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

  const { data: searchResults = [], isLoading: searching } = useUserSearch(usernameQuery);
  const { followingIds, toggleFollow, isToggling } = useFollows();
  const { data: feed, isLoading: loadingFeed } = useCommunityFeed();
  const { openMyProfile, openUserProfile } = useProfileDrawer();

  const normalizedFeed = useMemo(() => {
    // Por si el backend devuelve cualquier otra cosa en el futuro.
    return (feed ?? []).slice().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [feed]);

  return (
    <div className="w-full min-w-0 pb-8 space-y-0 md:max-w-2xl md:mx-auto md:px-8">
      <section className="space-y-0 md:space-y-3">
        <Card className="w-full rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border">
          <CardHeader className="pb-1">
            <CardTitle className="text-base">Buscar por nombre de usuario</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
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
        <Card className="w-full rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border">
          <CardContent className="space-y-3 pt-4">
            {searching ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-none md:rounded-xl" />
                ))}
              </div>
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
                        <CommunityAvatar avatarUrl={p.avatar_url} username={p.username} className="h-10 w-10 shrink-0" />
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
        )}
        {loadingFeed ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-none md:rounded-xl" />
            ))}
          </div>
        ) : normalizedFeed.length === 0 ? (
          <p className="px-6 py-6 text-center text-sm text-muted-foreground">
            Todavía no hay entrenos publicados.
          </p>
        ) : (
          <div className="space-y-3">
            {normalizedFeed.map((item, index) => (
              <Card
                key={item.id}
                className={
                  index === 0
                    ? "w-full rounded-none border-0 bg-card shadow-none"
                    : "w-full rounded-none border-x-0 md:rounded-3xl md:border-x"
                }
              >
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
                        <CommunityAvatar
                          avatarUrl={item.author.avatar_url}
                          username={item.author.username}
                          className="h-9 w-9"
                        />
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

