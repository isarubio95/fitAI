import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useProfileStats, xpProgress } from "@/hooks/useGamification";
import { useLogros } from "@/hooks/useLogros";
import { useWorkoutHistory } from "@/hooks/useWorkouts";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Flame, Zap, Trophy, Swords, Target, Award, Eye, Dumbbell } from "lucide-react";
import { WorkoutDetailsSheet } from "@/components/dashboard/WorkoutDetailsSheet";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const iconMap: Record<string, React.ElementType> = {
  Swords, Shield, Flame, Target, Trophy, Award,
};

export function ProfileDrawer() {
  const { user } = useAuth();
  const { data: stats } = useProfileStats();
  const { data: logros = [], isLoading: loadingLogros } = useLogros();
  const [open, setOpen] = useState(false);
  const [followListMode, setFollowListMode] = useState<"seguidores" | "seguidos" | null>(null);
  const [workoutDetailsOpen, setWorkoutDetailsOpen] = useState(false);
  const [workoutDetailsId, setWorkoutDetailsId] = useState<string | null>(null);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "U";

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined);

  const xp = stats ? xpProgress(stats.xp_total) : null;
  const { data: followCounts, isLoading: loadingFollowCounts } = useQuery({
    queryKey: ["follow-counts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const sb = supabase as any;
      const [followersRes, followingRes] = await Promise.all([
        sb
          .from("seguimiento")
          .select("seguido_id")
          .eq("seguido_id", user!.id),
        sb
          .from("seguimiento")
          .select("seguidor_id")
          .eq("seguidor_id", user!.id),
      ]);

      if (followersRes.error) throw followersRes.error;
      if (followingRes.error) throw followingRes.error;

      return {
        seguidores: followersRes.data?.length ?? 0,
        seguidos: followingRes.data?.length ?? 0,
      };
    },
  });

  const { data: followUsers = [], isLoading: loadingFollowUsers } = useQuery({
    queryKey: ["follow-users", user?.id, followListMode],
    enabled: !!user && !!followListMode,
    queryFn: async (): Promise<{ id: string; username: string | null; avatar_url: string | null }[]> => {
      const sb = supabase as any;
      const isFollowers = followListMode === "seguidores";

      const { data: relData, error: relErr } = await sb
        .from("seguimiento")
        .select(isFollowers ? "seguidor_id" : "seguido_id")
        .eq(isFollowers ? "seguido_id" : "seguidor_id", user!.id);

      if (relErr) throw relErr;

      const ids: string[] = (relData ?? [])
        .map((row: any) => (isFollowers ? row.seguidor_id : row.seguido_id))
        .filter(Boolean);

      if (ids.length === 0) return [];

      const { data: usersData, error: usersErr } = await sb
        .from("perfil")
        .select("id, username, avatar_url")
        .in("id", ids);

      if (usersErr) throw usersErr;
      return (usersData ?? []) as { id: string; username: string | null; avatar_url: string | null }[];
    },
  });

  const { data: workoutsHistory = [], isLoading: loadingWorkoutHistory } = useWorkoutHistory();
  const lastWorkouts = workoutsHistory.slice(0, 5);

  const { data: profileUsername, isLoading: loadingProfileUsername } = useQuery({
    queryKey: ["profileUsername", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await (supabase as any)
        .from("perfil")
        .select("username")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return (data?.username as string | null) ?? null;
    },
  });

  const initialsFromUsername = (username?: string | null) => {
    if (!username) return "U";
    const parts = username.trim().split(/[\s_\-]+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "U";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-8 w-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-full max-w-full sm:max-w-full flex flex-col"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-lg">Mi cuenta</SheetTitle>
        </SheetHeader>

        {/* User info */}
        <div className="flex items-center gap-3 pt-2">
          <Avatar className="h-12 w-12">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">
              {loadingProfileUsername ? "..." : profileUsername ?? user?.email}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFollowListMode("seguidores")}
              className="rounded-lg border px-3 py-2 text-center transition-colors hover:bg-muted/50"
            >
              <p className="text-sm font-semibold">
                {loadingFollowCounts ? "..." : followCounts?.seguidores ?? 0}
              </p>
              <p className="text-[11px] text-muted-foreground">Seguidores</p>
            </button>
            <button
              type="button"
              onClick={() => setFollowListMode("seguidos")}
              className="rounded-lg border px-3 py-2 text-center transition-colors hover:bg-muted/50"
            >
              <p className="text-sm font-semibold">
                {loadingFollowCounts ? "..." : followCounts?.seguidos ?? 0}
              </p>
              <p className="text-[11px] text-muted-foreground">Seguidos</p>
            </button>
          </div>
        </div>

        <Separator />

        <Dialog open={!!followListMode} onOpenChange={(next) => !next && setFollowListMode(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{followListMode === "seguidores" ? "Seguidores" : "Seguidos"}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[50dvh] overflow-y-auto pr-1">
              {loadingFollowUsers ? (
                <p className="py-2 text-sm text-muted-foreground">Cargando...</p>
              ) : followUsers.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">No hay usuarios para mostrar.</p>
              ) : (
                <div className="space-y-1">
                  {followUsers.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-md border px-2 py-2">
                      <Avatar className="h-8 w-8">
                        {p.avatar_url && <AvatarImage src={p.avatar_url} alt="" />}
                        <AvatarFallback className="text-[10px]">
                          {initialsFromUsername(p.username)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm font-medium truncate">{p.username ?? "Usuario"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Contenido del perfil */}
        <div className="flex-1 overflow-y-auto space-y-6 mt-3">
          {/* Level & XP */}
          {xp && stats && (
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-bold">Nivel {xp.level}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame
                    className={`h-4 w-4 ${stats.racha_actual > 0 ? "text-orange-500" : "text-muted-foreground"}`}
                    fill={stats.racha_actual > 0 ? "currentColor" : "none"}
                  />
                  <span className={`text-sm font-semibold ${stats.racha_actual > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
                    {stats.racha_actual} días
                  </span>
                </div>
              </div>
              <Progress value={xp.percent} className="h-2" />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" /> {xp.progress} / {xp.needed} XP para nivel {xp.level + 1}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>XP Total: <span className="font-semibold text-foreground">{stats.xp_total}</span></div>
                <div>Racha máx: <span className="font-semibold text-foreground">{stats.racha_maxima} días</span></div>
              </div>
            </div>
          )}

          {/* Logros */}
          <div className="space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" /> Logros
            </p>
            {loadingLogros ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 rounded-lg border bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : logros.length === 0 ? (
              <p className="text-xs text-muted-foreground">No hay logros definidos.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {logros.map((a) => {
                  const Icon = iconMap[a.icono] || Trophy;
                  return (
                    <div
                      key={a.id}
                      className={`flex flex-col items-center text-center gap-2 p-3 rounded-lg border transition-opacity ${
                        a.unlocked ? "" : "opacity-50 grayscale"
                      }`}
                    >
                      <div className={`p-2 rounded-full ${a.unlocked ? "bg-primary/10" : "bg-muted"}`}>
                        <Icon className={`h-6 w-6 ${a.unlocked ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <p className="text-xs font-semibold leading-tight">{a.nombre}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{a.descripcion}</p>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Zap className="h-2.5 w-2.5" /> {a.xp_recompensa} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Últimos entrenamientos */}
          <div className="space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-muted-foreground" /> Últimos entrenamientos
            </p>

            {loadingWorkoutHistory ? (
              <div className="grid grid-cols-1 gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 rounded-lg border bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : lastWorkouts.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aún no has registrado entrenamientos.</p>
            ) : (
              <div className="space-y-1.5">
                {lastWorkouts.map((w) => {
                  const totalSets = w.ejercicios.reduce((acc, ej) => acc + (ej.series?.length ?? 0), 0);
                  return (
                    <div
                      key={w.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-border bg-card p-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{w.titulo}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {w.ejercicios.length} ejercicios · {totalSets} series ·{" "}
                          {w.fecha ? format(new Date(w.fecha), "d MMM yyyy", { locale: es }) : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setWorkoutDetailsId(w.id);
                            setWorkoutDetailsOpen(true);
                          }}
                          title="Ver detalles"
                          aria-label="Ver detalles"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </SheetContent>

      <WorkoutDetailsSheet
        open={workoutDetailsOpen}
        onOpenChange={(next) => {
          setWorkoutDetailsOpen(next);
          if (!next) setWorkoutDetailsId(null);
        }}
        workoutId={workoutDetailsId}
      />
    </Sheet>
  );
}
