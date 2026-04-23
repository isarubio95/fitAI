import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useProfileStats, xpProgress } from "@/hooks/useGamification";
import { useLogros } from "@/hooks/useLogros";
import { useWorkoutHistory } from "@/hooks/useWorkouts";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Flame, Zap, Trophy, Swords, Target, Award, Dumbbell, Pencil, Loader2 } from "lucide-react";
import { WorkoutDetailsContent } from "@/components/dashboard/WorkoutDetailsSheet";
import { cn } from "@/lib/utils";
import { buildAuthAvatarCandidates, useUserAvatar } from "@/hooks/useUserAvatar";
import { useProfileAvatarUpload } from "@/hooks/useProfileAvatarUpload";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, React.ElementType> = {
  Swords,
  Shield,
  Flame,
  Target,
  Trophy,
  Award,
};

type ProfileDrawerContextValue = {
  open: boolean;
  targetUserId: string | null;
  openMyProfile: () => void;
  openUserProfile: (userId: string) => void;
  onOpenChange: (open: boolean) => void;
};

const ProfileDrawerContext = createContext<ProfileDrawerContextValue | null>(null);

export function useProfileDrawer() {
  const ctx = useContext(ProfileDrawerContext);
  if (!ctx) {
    throw new Error("useProfileDrawer debe usarse dentro de ProfileDrawerProvider");
  }
  return ctx;
}

export function ProfileDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  const openMyProfile = useCallback(() => {
    setTargetUserId(null);
    setOpen(true);
  }, []);

  const openUserProfile = useCallback((userId: string) => {
    setTargetUserId(userId);
    setOpen(true);
  }, []);

  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setTargetUserId(null);
  }, []);

  const value = useMemo(
    () => ({
      open,
      targetUserId,
      openMyProfile,
      openUserProfile,
      onOpenChange,
    }),
    [open, targetUserId, openMyProfile, openUserProfile, onOpenChange],
  );

  return (
    <ProfileDrawerContext.Provider value={value}>
      {children}
      <ProfileDrawerSheet />
    </ProfileDrawerContext.Provider>
  );
}

export function ProfileDrawerTrigger() {
  const { user } = useAuth();
  const { openMyProfile } = useProfileDrawer();
  const { data: profileAvatar } = useQuery({
    queryKey: ["profile-avatar", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("perfil")
        .select("avatar_url")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data?.avatar_url as string | null) ?? null;
    },
  });

  const initials = user?.email?.trim()?.[0]?.toUpperCase() || "U";
  const avatar = useUserAvatar(
    useMemo(() => {
      const authCandidates = buildAuthAvatarCandidates(user);
      return profileAvatar ? [profileAvatar, ...authCandidates] : authCandidates;
    }, [profileAvatar, user]),
  );

  return (
    <button
      type="button"
      onClick={openMyProfile}
      className="flex items-center justify-center rounded-full pl-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Avatar className="h-8 w-8">
        {avatar.src && <AvatarImage src={avatar.src} alt="" onError={avatar.onError} />}
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold ring-1 ring-primary/35 ring-inset">
          {initials}
        </AvatarFallback>
      </Avatar>
    </button>
  );
}

function initialsFromUsername(username?: string | null) {
  return username?.trim()?.[0]?.toUpperCase() || "U";
}

function UserAvatar({
  avatarUrl,
  username,
  className,
}: {
  avatarUrl?: string | null;
  username?: string | null;
  className?: string;
}) {
  const avatar = useUserAvatar([avatarUrl]);
  return (
    <Avatar className={className}>
      {avatar.src ? <AvatarImage src={avatar.src} alt="" onError={avatar.onError} /> : null}
      <AvatarFallback className="text-[10px]">{initialsFromUsername(username)}</AvatarFallback>
    </Avatar>
  );
}

function ProfileDrawerSheet() {
  const { user } = useAuth();
  const { open, onOpenChange, targetUserId, openUserProfile } = useProfileDrawer();
  const { toast } = useToast();
  const [followListMode, setFollowListMode] = useState<"seguidores" | "seguidos" | null>(null);
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadAvatar = useProfileAvatarUpload();

  const profileUserId = targetUserId ?? user?.id ?? "";
  const isViewingSelf = !targetUserId || targetUserId === user?.id;

  const statsUserId = profileUserId || undefined;
  const { data: stats } = useProfileStats(statsUserId);
  const { data: logros = [], isLoading: loadingLogros } = useLogros(statsUserId);
  const { data: workoutsHistory = [], isLoading: loadingWorkoutHistory } = useWorkoutHistory(statsUserId);

  const { data: perfilRow, isLoading: loadingPerfil } = useQuery({
    queryKey: ["perfil-drawer", profileUserId],
    enabled: open && !!profileUserId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("perfil")
        .select("username, avatar_url")
        .eq("id", profileUserId)
        .maybeSingle();
      if (error) throw error;
      return data as { username: string | null; avatar_url: string | null } | null;
    },
  });

  const xp = stats ? xpProgress(stats.xp_total) : null;

  const { data: followCounts, isLoading: loadingFollowCounts } = useQuery({
    queryKey: ["follow-counts", profileUserId],
    enabled: open && !!profileUserId,
    queryFn: async () => {
      const sb = supabase as any;
      const [followersRes, followingRes] = await Promise.all([
        sb.from("seguimiento").select("seguido_id").eq("seguido_id", profileUserId),
        sb.from("seguimiento").select("seguidor_id").eq("seguidor_id", profileUserId),
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
    queryKey: ["follow-users", profileUserId, followListMode],
    enabled: open && !!profileUserId && !!followListMode,
    queryFn: async (): Promise<{ id: string; username: string | null; avatar_url: string | null }[]> => {
      const sb = supabase as any;
      const isFollowers = followListMode === "seguidores";
      const { data: relData, error: relErr } = await sb
        .from("seguimiento")
        .select(isFollowers ? "seguidor_id" : "seguido_id")
        .eq(isFollowers ? "seguido_id" : "seguidor_id", profileUserId);
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

  const lastWorkouts = workoutsHistory.slice(0, 5);

  const displayAvatar = useUserAvatar(
    useMemo(() => {
      if (isViewingSelf && localAvatarPreview) return [localAvatarPreview];
      const fromProfile = perfilRow?.avatar_url;
      if (!isViewingSelf) return fromProfile ? [fromProfile] : [];
      const base = buildAuthAvatarCandidates(user);
      return fromProfile ? [fromProfile, ...base] : base;
    }, [isViewingSelf, localAvatarPreview, perfilRow?.avatar_url, user]),
  );

  useEffect(() => {
    if (!open) setLocalAvatarPreview(null);
  }, [open]);

  const displayNameLine = loadingPerfil
    ? "..."
    : (perfilRow?.username ?? (isViewingSelf ? user?.email : null) ?? "Usuario");

  const headerInitials =
    isViewingSelf && user?.email && !displayAvatar.src
      ? user.email.trim()?.[0]?.toUpperCase() || "U"
      : initialsFromUsername(perfilRow?.username);

  if (!user) return null;

  return (
    <Drawer direction="left" open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="left"
        className="flex h-full max-h-dvh w-full flex-col gap-0 overflow-x-hidden border-0 bg-background p-0 shadow-none dark:bg-card"
      >
        <DrawerHeader className="bg-card px-6 pb-2 pt-6 text-left dark:bg-transparent">
          <div className="flex gap-4 items-start">
            <div className="relative mr-1 shrink-0">
              <Avatar className="h-16 w-16 ring-2 ring-border/60">
                {displayAvatar.src && (
                  <AvatarImage src={displayAvatar.src} alt="" className="object-cover" onError={displayAvatar.onError} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {headerInitials}
                </AvatarFallback>
              </Avatar>
              {isViewingSelf && (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full border border-border shadow-sm"
                  disabled={uploadAvatar.isPending}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Cambiar foto de perfil"
                >
                  {uploadAvatar.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Pencil className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
            <div className="min-w-0 flex-1 flex flex-col gap-3">
              {isViewingSelf && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      event.currentTarget.value = "";
                      if (!file || !user?.id) return;
                      try {
                        const result = await uploadAvatar.mutateAsync({
                          file,
                          userId: user.id,
                          currentAvatarPath: perfilRow?.avatar_url ?? null,
                        });
                        setLocalAvatarPreview(result.signedUrl);
                        toast({ title: "Foto de perfil actualizada" });
                      } catch (error) {
                        const description =
                          error instanceof Error ? error.message : "No se pudo actualizar la foto de perfil.";
                        toast({
                          title: "Error al subir foto",
                          description,
                          variant: "destructive",
                        });
                      }
                    }}
                  />
                </>
              )}
              <p className="text-lg font-semibold leading-tight truncate">{displayNameLine}</p>
              <div className="grid w-full min-w-0 grid-cols-3 gap-x-5 gap-y-0">
                <div className="min-w-0 w-full flex flex-col items-start text-left">
                  <p className="text-base font-bold tabular-nums leading-none">
                    {loadingWorkoutHistory ? "…" : workoutsHistory.length}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight mt-1 line-clamp-2">
                    Entrenos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFollowListMode("seguidores")}
                  className="min-w-0 w-full flex flex-col items-start text-left rounded-none border-0 bg-transparent p-0 shadow-none hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <p className="text-base font-bold tabular-nums leading-none">
                    {loadingFollowCounts ? "…" : followCounts?.seguidores ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight mt-1">Seguidores</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFollowListMode("seguidos")}
                  className="min-w-0 w-full flex flex-col items-start text-left rounded-none border-0 bg-transparent p-0 shadow-none hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <p className="text-base font-bold tabular-nums leading-none">
                    {loadingFollowCounts ? "…" : followCounts?.seguidos ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight mt-1">Seguidos</p>
                </button>
              </div>
            </div>
          </div>
        </DrawerHeader>

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
                    <button
                      key={p.id}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-md border px-2 py-2 text-left transition-colors hover:bg-muted/50"
                      onClick={() => {
                        setFollowListMode(null);
                        openUserProfile(p.id);
                      }}
                    >
                      <UserAvatar avatarUrl={p.avatar_url} username={p.username} className="h-8 w-8" />
                      <p className="text-sm font-medium truncate">{p.username ?? "Usuario"}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-card pb-6 pt-3 dark:bg-transparent">
          {xp && stats && (
            <Card className="w-full max-w-none rounded-none border-0 bg-card shadow-none dark:bg-transparent md:rounded-3xl">
              <CardContent className="space-y-3 px-6 py-4">
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
                    <span
                      className={`text-sm font-semibold ${stats.racha_actual > 0 ? "text-orange-500" : "text-muted-foreground"}`}
                    >
                      {stats.racha_actual} días
                    </span>
                  </div>
                </div>
                <Progress value={xp.percent} className="h-2" />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {xp.progress} / {xp.needed} XP para nivel {xp.level + 1}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground text-left">
                  <div>
                    XP Total: <span className="font-semibold text-foreground">{stats.xp_total}</span>
                  </div>
                  <div>
                    Racha máx:{" "}
                    <span className="font-semibold text-foreground">{stats.racha_maxima} días</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3 bg-card dark:bg-transparent">
            <p className="flex items-center gap-2 px-6 text-sm font-medium">
              <Trophy className="h-4 w-4 text-muted-foreground" /> Logros
            </p>
            {loadingLogros ? (
              <div className="grid grid-cols-2 gap-0 px-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse border-b border-r border-black/5 bg-muted/50 p-3 nth-[n+3]:border-b-0 dark:border-white/10 nth-[2n]:border-r-0"
                  />
                ))}
              </div>
            ) : logros.length === 0 ? (
              <p className="px-6 text-xs text-muted-foreground">No hay logros definidos.</p>
            ) : (
              <div className="grid grid-cols-2 gap-0 px-6">
                {logros.map((a, i) => {
                  const Icon = iconMap[a.icono] || Trophy;
                  const row = Math.floor(i / 2);
                  const totalRows = Math.ceil(logros.length / 2);
                  const hasCellToRight = i % 2 === 0 && i + 1 < logros.length;
                  const showBottomSep = row < totalRows - 1;
                  return (
                    <div
                      key={a.id}
                      className={cn(
                        "flex min-w-0 w-full flex-col items-center gap-2 p-3 text-center transition-opacity",
                        hasCellToRight && "border-r border-black/5 dark:border-white/10",
                        showBottomSep && "border-b border-black/5 dark:border-white/10",
                        !a.unlocked && "opacity-50 grayscale",
                      )}
                    >
                      <div className={`p-2 rounded-full ${a.unlocked ? "bg-primary/10" : "bg-muted"}`}>
                        <Icon
                          className={`h-6 w-6 ${a.unlocked ? "text-primary" : "text-muted-foreground"}`}
                        />
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

          <div className="space-y-3">
            <p className="flex items-center gap-2 px-6 text-sm font-medium">
              <Dumbbell className="h-4 w-4 text-muted-foreground" /> Últimos entrenos
            </p>

            {loadingWorkoutHistory ? (
              <div className="grid grid-cols-1 gap-2 px-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 rounded-none border bg-muted/30 animate-pulse md:rounded-xl" />
                ))}
              </div>
            ) : lastWorkouts.length === 0 ? (
              <p className="px-6 text-xs text-muted-foreground">
                {isViewingSelf
                  ? "Aún no has registrado entrenos."
                  : "Este usuario no tiene entrenos visibles."}
              </p>
            ) : (
              <div className="space-y-4 bg-background">
                {lastWorkouts.map((w) => (
                  <Card
                    key={w.id}
                    className="w-full max-w-none overflow-hidden rounded-none border-x-0 border-border/20 shadow-xs md:rounded-3xl md:border-x"
                  >
                    <WorkoutDetailsContent workout={w} containerClassName="p-4" />
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
