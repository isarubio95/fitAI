import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Users, UserPlus, UserCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useFollows } from "@/hooks/useFollows";
import { useCommunityFeed } from "@/hooks/useCommunityFeed";

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

  const normalizedFeed = useMemo(() => {
    // Por si el backend devuelve cualquier otra cosa en el futuro.
    return (feed ?? []).slice().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [feed]);

  return (
    <div className="w-full min-w-0 p-4 md:p-8 pt-6 space-y-6 max-w-2xl mx-auto">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Comunidad</h1>
        </div>
        <p className="text-sm text-muted-foreground">Busca usuarios y sigue sus entrenos públicos.</p>
      </header>

      <section className="space-y-3">
        <Card>
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
                  <Skeleton key={i} className="h-16 rounded-xl" />
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

                  return (
                    <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10">
                          {p.avatar_url && <AvatarImage src={p.avatar_url} alt="" />}
                          <AvatarFallback>{initialsFromUsername(p.username)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{p.username}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.id === user?.id ? "Tú" : "Usuario"}</p>
                        </div>
                      </div>

                      {!isOwn && (
                        <Button
                          variant="ghost"
                          onClick={() => toggleFollow(p.id)}
                          disabled={isToggling.has(p.id)}
                          className="h-11 rounded-xl border border-emerald-600/25 bg-linear-to-b from-[#ecfdf5] to-[#d1fae5] px-4 text-sm font-medium leading-none text-emerald-800 shadow-[0_8px_20px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.75),inset_0_-1px_0_rgba(16,185,129,0.12)] transform-gpu will-change-transform transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-transparent hover:border-emerald-600/40 hover:text-emerald-700 hover:from-[#dcfce7] hover:to-[#bbf7d0] hover:shadow-[0_14px_28px_rgba(0,0,0,0.12),0_0_0_1px_rgba(16,185,129,0.18),inset_0_1px_0_rgba(255,255,255,0.65)] focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:ring-offset-0 active:duration-150 active:translate-y-[1.5px] active:scale-100 active:bg-transparent active:from-[#d1fae5] active:to-[#a7f3d0] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(16,185,129,0.12)] dark:border-emerald-500/25 dark:from-[#1b2220] dark:to-[#131917] dark:text-emerald-300 dark:shadow-[0_8px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(16,185,129,0.2)] dark:hover:bg-transparent dark:hover:border-emerald-400/50 dark:hover:text-emerald-200 dark:hover:from-[#1f2925] dark:hover:to-[#151d19] dark:hover:shadow-[0_14px_28px_rgba(0,0,0,0.38),0_0_0_1px_rgba(16,185,129,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] dark:focus-visible:ring-emerald-400/35 dark:active:from-[#151c19] dark:active:to-[#101512] dark:active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.42),0_0_0_1px_rgba(16,185,129,0.18)]"
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
        <h2 className="text-lg font-semibold">Feed</h2>

        {loadingFeed ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : normalizedFeed.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Todavía no hay entrenos publicados.</p>
        ) : (
          <div className="space-y-3">
            {normalizedFeed.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9">
                        {item.author.avatar_url && <AvatarImage src={item.author.avatar_url} alt="" />}
                        <AvatarFallback>{initialsFromUsername(item.author.username)}</AvatarFallback>
                      </Avatar>
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

