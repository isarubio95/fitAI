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
import { useLogros, pickFeaturedLogros } from "@/hooks/useLogros";
import { useWorkoutHistory } from "@/hooks/useWorkouts";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, drawerSafeAreaBottom } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, ChevronRight, Pencil, Loader2 } from "lucide-react";
import { LogroMedal } from "@/components/logros/LogroMedal";
import { LogrosDrawer } from "@/components/logros/LogrosDrawer";
import { GamificationWidget } from "@/components/dashboard/GamificationWidget";
import { WorkoutDetailsSheet } from "@/components/dashboard/WorkoutDetailsSheet";
import { WorkoutFeedCard, type WorkoutFeedCardAuthor } from "@/components/dashboard/WorkoutFeedCard";
import { cn } from "@/lib/utils";
import { PAGE_CARD_STACK_GAP } from "@/lib/pageStyles";
import { buildAuthAvatarCandidates, useUserAvatar } from "@/hooks/useUserAvatar";
import { useProfileAvatarUpload } from "@/hooks/useProfileAvatarUpload";
import { useToast } from "@/hooks/use-toast";

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
      const { data, error } = await supabase
        .from("perfil")
        .select("avatar_url")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data?.avatar_url ?? null;
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
      aria-label="Perfil"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Avatar className="h-6.5 w-6.5">
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
  const { open, onOpenChange, targetUserId, openMyProfile, openUserProfile } = useProfileDrawer();
  const { toast } = useToast();
  const [followListMode, setFollowListMode] = useState<"seguidores" | "seguidos" | null>(null);
  const [workoutDetailsId, setWorkoutDetailsId] = useState<string | null>(null);
  const [logrosOpen, setLogrosOpen] = useState(false);
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadAvatar = useProfileAvatarUpload();

  const profileUserId = targetUserId ?? user?.id ?? "";
  const isViewingSelf = !targetUserId || targetUserId === user?.id;

  const handleProfileOpenChange = useCallback(
    (next: boolean) => {
      if (!next) setLogrosOpen(false);
      onOpenChange(next);
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (!open) {
      setWorkoutDetailsId(null);
      setLogrosOpen(false);
    }
  }, [open]);

  const statsUserId = profileUserId || undefined;
  const { data: logros = [], isLoading: loadingLogros } = useLogros(statsUserId);
  const { data: workoutsHistory = [], isLoading: loadingWorkoutHistory } = useWorkoutHistory(statsUserId);

  const { data: perfilRow, isLoading: loadingPerfil } = useQuery({
    queryKey: ["perfil-drawer", profileUserId],
    enabled: open && !!profileUserId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("perfil")
        .select("username, avatar_url")
        .eq("id", profileUserId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: followCounts, isLoading: loadingFollowCounts } = useQuery({
    queryKey: ["follow-counts", profileUserId],
    enabled: open && !!profileUserId,
    queryFn: async () => {
      const [followersRes, followingRes] = await Promise.all([
        supabase.from("seguimiento").select("seguido_id").eq("seguido_id", profileUserId),
        supabase.from("seguimiento").select("seguidor_id").eq("seguidor_id", profileUserId),
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
      const isFollowers = followListMode === "seguidores";
      const { data: relData, error: relErr } = isFollowers
        ? await supabase.from("seguimiento").select("seguidor_id").eq("seguido_id", profileUserId)
        : await supabase.from("seguimiento").select("seguido_id").eq("seguidor_id", profileUserId);
      if (relErr) throw relErr;
      const ids = (relData ?? [])
        .map((row) => ("seguidor_id" in row ? row.seguidor_id : row.seguido_id))
        .filter((id): id is string => Boolean(id));
      if (ids.length === 0) return [];
      const { data: usersData, error: usersErr } = await supabase
        .from("perfil")
        .select("id, username, avatar_url")
        .in("id", ids);
      if (usersErr) throw usersErr;
      return usersData ?? [];
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

  const workoutAuthor: WorkoutFeedCardAuthor = {
    id: profileUserId,
    username: displayNameLine,
    avatar_url: isViewingSelf && localAvatarPreview ? localAvatarPreview : perfilRow?.avatar_url ?? null,
  };

  const openAuthorProfile = (authorId: string) => {
    if (authorId === user?.id) openMyProfile();
    else openUserProfile(authorId);
  };

  const unlockedLogros = useMemo(() => logros.filter((l) => l.unlocked), [logros]);
  const featuredLogros = useMemo(() => pickFeaturedLogros(logros), [logros]);

  const goToLogros = () => setLogrosOpen(true);

  if (!user) return null;

  return (
    <>
    <Drawer direction="left" open={open} onOpenChange={handleProfileOpenChange}>
      <DrawerContent
        side="left"
        className="flex h-full max-h-dvh w-full flex-col gap-0 overflow-x-hidden border-0 bg-background p-0 shadow-none dark:bg-card"
      >
        <div className={cn("min-h-0 flex-1 overflow-y-auto bg-card dark:bg-transparent", drawerSafeAreaBottom)}>
          <DrawerHeader className="bg-card px-6 pb-2 pt-[calc(1.75rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] text-left dark:bg-transparent">
            <DrawerTitle className="sr-only">{displayNameLine}</DrawerTitle>
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
                    id="profile-avatar-upload"
                    name="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label="Subir foto de perfil"
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

          <div className="space-y-6 pb-6">
          {statsUserId ? <GamificationWidget userId={statsUserId} contentClassName="pt-5 pb-4" /> : null}

          <div className="space-y-3 bg-card dark:bg-transparent">
            <button
              type="button"
              onClick={goToLogros}
              className="flex w-full items-center justify-between px-6 text-sm font-medium transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" /> Logros
              </span>
              <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                {loadingLogros ? "…" : `${unlockedLogros.length}/${logros.length}`}
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
            {loadingLogros ? (
              <div className="grid grid-cols-5 gap-1.5 px-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="mx-auto h-14 w-14 animate-pulse rounded-full bg-muted/50" />
                ))}
              </div>
            ) : unlockedLogros.length === 0 ? (
              <button
                type="button"
                onClick={goToLogros}
                className="block w-full px-6 text-left text-xs text-muted-foreground transition-opacity hover:opacity-80"
              >
                {isViewingSelf
                  ? "Aún no has desbloqueado logros. Toca para ver todos los retos."
                  : "Este usuario aún no ha desbloqueado logros."}
              </button>
            ) : (
              <button
                type="button"
                onClick={goToLogros}
                className="grid w-full grid-cols-5 gap-1.5 px-6 transition-opacity hover:opacity-90"
              >
                {featuredLogros.map((l) => (
                  <div key={l.id} className="flex min-w-0 flex-col items-center gap-1 text-center">
                    <LogroMedal nivel={l.nivel} icono={l.icono} size={56} />
                    <p className="w-full truncate text-[10px] font-medium leading-tight">{l.nombre}</p>
                  </div>
                ))}
              </button>
            )}
          </div>

          <div className="space-y-3">
            <p className="px-6 text-sm font-medium pt-3 mb-0">Últimos entrenamientos</p>

            {loadingWorkoutHistory ? (
              <div className={cn("grid grid-cols-1 px-6", PAGE_CARD_STACK_GAP)}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 rounded-none border bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : lastWorkouts.length === 0 ? (
              <p className="px-6 text-xs text-muted-foreground">
                {isViewingSelf
                  ? "Aún no has registrado entrenos."
                  : "Este usuario no tiene entrenos visibles."}
              </p>
            ) : (
              <div className={cn("flex flex-col bg-background", PAGE_CARD_STACK_GAP)}>
                {lastWorkouts.map((w) => (
                  <WorkoutFeedCard
                    key={w.id}
                    workout={w}
                    author={workoutAuthor}
                    onSelectAuthor={openAuthorProfile}
                    onSelectWorkout={setWorkoutDetailsId}
                  />
                ))}
              </div>
            )}
          </div>
          </div>
        </div>

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
      </DrawerContent>
    </Drawer>

    <WorkoutDetailsSheet
      open={!!workoutDetailsId}
      onOpenChange={(next) => {
        if (!next) setWorkoutDetailsId(null);
      }}
      workoutId={workoutDetailsId}
    />

    {!!profileUserId && (
      <LogrosDrawer
        open={logrosOpen}
        onOpenChange={setLogrosOpen}
        userId={profileUserId}
        isSelf={isViewingSelf}
        username={perfilRow?.username}
      />
    )}
    </>
  );
}
