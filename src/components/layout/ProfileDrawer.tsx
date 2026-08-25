import {
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ProfileDrawerProvider as ProfileDrawerContextProvider,
  useProfileDrawer,
} from "@/components/layout/profileDrawerContext";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLogros, pickFeaturedLogros } from "@/hooks/useLogros";
import { useProfileActivityHistory } from "@/hooks/useProfileActivityHistory";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, drawerSafeAreaBottom } from "@/components/ui/drawer";
import { Trophy, ChevronRight, Pencil, Loader2 } from "lucide-react";
import { LogroMedal } from "@/components/logros/LogroMedal";
import { LogrosDrawer } from "@/components/logros/LogrosDrawer";
import { GamificationWidget } from "@/components/dashboard/GamificationWidget";
import { WorkoutDetailsSheet } from "@/components/dashboard/WorkoutDetailsSheet";
import { CardioFeedCard, type CardioFeedCardSocial } from "@/components/cardio/CardioFeedCard";
import { CardioDetailsSheet } from "@/components/cardio/CardioDetailsSheet";
import {
  WorkoutFeedCard,
  type WorkoutFeedCardAuthor,
  type WorkoutFeedCardSocial,
} from "@/components/dashboard/WorkoutFeedCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PAGE_CARD_STACK_GAP, PAGE_STACK_TOP } from "@/lib/pageStyles";
import { buildAuthAvatarCandidates, useUserAvatar } from "@/hooks/useUserAvatar";
import { useProfileAvatarUpload } from "@/hooks/useProfileAvatarUpload";
import { useToast } from "@/hooks/use-toast";
import { useActivityLikes } from "@/hooks/useActivityLikes";
import { useActivityCommentCounts } from "@/hooks/useActivityComments";
import { useCardioSessionLikes } from "@/hooks/useCardioSessionLikes";
import { useCardioSessionCommentCounts } from "@/hooks/useCardioSessionComments";

export { useProfileDrawer };

export function ProfileDrawerProvider({ children }: { children: ReactNode }) {
  return (
    <ProfileDrawerContextProvider>
      {children}
      <ProfileDrawerSheet />
    </ProfileDrawerContextProvider>
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
  const [cardioDetailsId, setCardioDetailsId] = useState<string | null>(null);
  const [logrosOpen, setLogrosOpen] = useState(false);
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadAvatar = useProfileAvatarUpload();

  const profileUserId = targetUserId ?? user?.id ?? "";
  const isViewingSelf = !targetUserId || targetUserId === user?.id;

  const nestedProfileLayerOpen = !!followListMode || logrosOpen;

  const handleProfileOpenChange = useCallback(
    (next: boolean) => {
      // El overlay de seguidores/logros no debe cerrar el perfil.
      if (!next && nestedProfileLayerOpen) return;
      if (!next) {
        setLogrosOpen(false);
        setFollowListMode(null);
      }
      onOpenChange(next);
    },
    [onOpenChange, nestedProfileLayerOpen],
  );

  useEffect(() => {
    if (!open) {
      setWorkoutDetailsId(null);
      setCardioDetailsId(null);
      setLogrosOpen(false);
      setFollowListMode(null);
    }
  }, [open]);

  const statsUserId = profileUserId || undefined;
  const { data: logros = [], isLoading: loadingLogros } = useLogros(statsUserId);
  const {
    items: lastActivities,
    totalCount: activityTotalCount,
    isLoading: loadingWorkoutHistory,
  } = useProfileActivityHistory(statsUserId);

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

  const lastWorkouts = lastActivities;

  const publicWorkoutIds = useMemo(() => {
    const ids: string[] = [];
    for (const w of lastWorkouts) {
      if (w.type === "gym" && w.workout.es_publica) ids.push(w.workout.id);
    }
    return ids;
  }, [lastWorkouts]);
  const publicCardioIds = useMemo(() => {
    const ids: string[] = [];
    for (const w of lastWorkouts) {
      if (w.type === "cardio" && w.session.es_publica) ids.push(w.session.id);
    }
    return ids;
  }, [lastWorkouts]);
  const { likeCounts, likedIds, toggleLike, isToggling: isTogglingLike } =
    useActivityLikes(publicWorkoutIds);
  const { commentCounts, commentedIds } = useActivityCommentCounts(publicWorkoutIds);
  const {
    likeCounts: cardioLikeCounts,
    likedIds: cardioLikedIds,
    toggleLike: toggleCardioLike,
    isToggling: isTogglingCardioLike,
  } = useCardioSessionLikes(publicCardioIds);
  const { commentCounts: cardioCommentCounts, commentedIds: cardioCommentedIds } =
    useCardioSessionCommentCounts(publicCardioIds);

  const socialFor = (actividadId: string): WorkoutFeedCardSocial => ({
    likeCount: likeCounts[actividadId] ?? 0,
    liked: likedIds.has(actividadId),
    commentCount: commentCounts[actividadId] ?? 0,
    commented: commentedIds.has(actividadId),
    onToggleLike: () => toggleLike(actividadId),
    isTogglingLike: isTogglingLike.has(actividadId),
  });

  const cardioSocialFor = (sessionId: string): CardioFeedCardSocial => ({
    likeCount: cardioLikeCounts[sessionId] ?? 0,
    liked: cardioLikedIds.has(sessionId),
    commentCount: cardioCommentCounts[sessionId] ?? 0,
    commented: cardioCommentedIds.has(sessionId),
    onToggleLike: () => toggleCardioLike(sessionId),
    isTogglingLike: isTogglingCardioLike.has(sessionId),
  });

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
        overlayClassName="z-[110]"
        className="z-[115] flex h-full max-h-dvh w-full flex-col gap-0 overflow-x-hidden border-0 bg-background p-0 shadow-none dark:bg-card"
        onPointerDownOutside={(e) => {
          if (nestedProfileLayerOpen) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (nestedProfileLayerOpen) e.preventDefault();
        }}
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
                <div className="min-w-0 w-full flex flex-col items-center text-center" aria-busy={loadingWorkoutHistory}>
                  {loadingWorkoutHistory ? (
                    <Skeleton className="h-4 w-7" aria-hidden />
                  ) : (
                    <p className="text-base font-bold tabular-nums leading-none">
                      {activityTotalCount}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground leading-tight mt-1 line-clamp-2">
                    Entrenos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFollowListMode("seguidores")}
                  disabled={loadingFollowCounts}
                  aria-busy={loadingFollowCounts}
                  className="min-w-0 w-full flex flex-col items-center text-center rounded-none border-0 bg-transparent p-0 shadow-none hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-100"
                >
                  {loadingFollowCounts ? (
                    <Skeleton className="h-4 w-7" aria-hidden />
                  ) : (
                    <p className="text-base font-bold tabular-nums leading-none">
                      {followCounts?.seguidores ?? 0}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground leading-tight mt-1">Seguidores</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFollowListMode("seguidos")}
                  disabled={loadingFollowCounts}
                  aria-busy={loadingFollowCounts}
                  className="min-w-0 w-full flex flex-col items-center text-center rounded-none border-0 bg-transparent p-0 shadow-none hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-100"
                >
                  {loadingFollowCounts ? (
                    <Skeleton className="h-4 w-7" aria-hidden />
                  ) : (
                    <p className="text-base font-bold tabular-nums leading-none">
                      {followCounts?.seguidos ?? 0}
                    </p>
                  )}
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
              className="flex w-full items-center justify-between px-6 text-base font-bold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Logros
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
            {loadingWorkoutHistory ? (
              <div className={cn("surface-region-page flex flex-col bg-background px-3", PAGE_CARD_STACK_GAP, PAGE_STACK_TOP)}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-2xl bg-card md:rounded-3xl" />
                ))}
              </div>
            ) : lastWorkouts.length === 0 ? (
              <p className={cn("px-6 text-xs text-muted-foreground", PAGE_STACK_TOP)}>
                {isViewingSelf
                  ? "Aún no has registrado entrenos."
                  : "Este usuario no tiene entrenos visibles."}
              </p>
            ) : (
              <div className={cn("surface-region-page flex flex-col bg-background px-3", PAGE_CARD_STACK_GAP, PAGE_STACK_TOP)}>
                {lastWorkouts.map((item) =>
                  item.type === "gym" ? (
                    <WorkoutFeedCard
                      key={`gym-${item.workout.id}`}
                      workout={item.workout}
                      author={workoutAuthor}
                      onSelectAuthor={openAuthorProfile}
                      onSelectWorkout={setWorkoutDetailsId}
                      social={item.workout.es_publica ? socialFor(item.workout.id) : null}
                    />
                  ) : (
                    <CardioFeedCard
                      key={`cardio-${item.session.id}`}
                      session={item.session}
                      author={workoutAuthor}
                      onSelectAuthor={openAuthorProfile}
                      onSelectSession={setCardioDetailsId}
                      social={item.session.es_publica ? cardioSocialFor(item.session.id) : null}
                    />
                  ),
                )}
              </div>
            )}
          </div>
          </div>
        </div>

      </DrawerContent>
    </Drawer>

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

    <Drawer
      direction="left"
      open={!!followListMode}
      onOpenChange={(next) => {
        if (!next) setFollowListMode(null);
      }}
    >
      <DrawerContent
        side="left"
        overlayClassName="z-[120]"
        className="z-[125] flex h-full max-h-dvh w-full flex-col gap-0 overflow-x-hidden border-0 bg-background p-0 shadow-none"
      >
        <div className={cn("min-h-0 flex-1 overflow-y-auto bg-background", drawerSafeAreaBottom)}>
          <DrawerHeader className="bg-background px-6 pt-[calc(1.75rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] text-left">
            <DrawerTitle className="text-lg font-semibold">
              {followListMode === "seguidores" ? "Seguidores" : "Seguidos"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="mt-3 px-6 pb-6">
            {loadingFollowUsers ? (
              <p className="py-2 text-sm text-muted-foreground">Cargando...</p>
            ) : followUsers.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">No hay usuarios para mostrar.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {followUsers.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-md border bg-card px-2 py-2 text-left transition-colors hover:bg-muted/50"
                    onClick={() => {
                      setFollowListMode(null);
                      if (p.id === user?.id) openMyProfile();
                      else openUserProfile(p.id);
                    }}
                  >
                    <UserAvatar avatarUrl={p.avatar_url} username={p.username} className="h-8 w-8" />
                    <p className="text-sm font-medium truncate">{p.username ?? "Usuario"}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>

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
