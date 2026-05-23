import { useEffect, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { usePageLayoutMeta } from "@/hooks/usePageLayoutMeta";
import { useAuth } from "@/hooks/useAuth";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { ProfileDrawerProvider, ProfileDrawerTrigger } from "./ProfileDrawer";
import { SettingsDrawer } from "./SettingsDrawer";
import { ActiveWorkoutPill } from "@/components/workout/ActiveWorkoutPill";
import { GlobalWorkoutDrawerProvider } from "@/hooks/useGlobalWorkoutDrawer";
import { WorkoutLogger } from "@/components/workout/WorkoutLogger";
import { GlobalCardioDrawerProvider } from "@/hooks/useGlobalCardioDrawer";
import { CardioLogger } from "@/components/cardio/CardioLogger";
import { CardioLiveRecorder } from "@/components/cardio/CardioLiveRecorder";
import { ActiveCardioPill } from "@/components/cardio/ActiveCardioPill";
import { Loader2 } from "lucide-react";
// import { SwipeableRoutesWrapper } from "./SwipeableRoutesWrapper";
import { filterPillActive, filterPillBase, filterPillInactive } from "@/lib/filter-pill-styles";
import { FLOATING_CREATE_SLOT } from "@/lib/pageStyles";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UsernameSetup from "@/pages/UsernameSetup";
import { InAppNotificationsProvider } from "@/contexts/InAppNotificationsContext";
import { InAppNotificationsBell } from "@/components/notifications/InAppNotificationsBell";

export function AppLayout() {
  const { user, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { location, pageTitle, showSectionPills, showNotificationsBell, activeSubsectionLabel } =
    usePageLayoutMeta();
  const [areHeaderPillsCollapsed, setAreHeaderPillsCollapsed] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingScrollRef = useRef(false);
  const pendingScrollYRef = useRef(0);
  const areHeaderPillsCollapsedRef = useRef(false);

  const { data: profileSetup, isLoading: profileLoading } = useQuery({
    queryKey: ["profileSetup", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("perfil")
        .select("username")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as { username: string | null } | null;
    },
  });

  const currentTab = searchParams.get("tab") || "";

  useEffect(() => {
    if (loading || !user || profileLoading || !profileSetup?.username || !profileSetup.username.trim()) return;
    setAreHeaderPillsCollapsed(false);
    areHeaderPillsCollapsedRef.current = false;
    lastScrollYRef.current = window.scrollY;
  }, [location.pathname, currentTab, loading, user, profileLoading, profileSetup]);

  useEffect(() => {
    areHeaderPillsCollapsedRef.current = areHeaderPillsCollapsed;
  }, [areHeaderPillsCollapsed]);

  useEffect(() => {
    if (loading || !user || profileLoading || !profileSetup?.username || !profileSetup.username.trim()) return;
    if (!showSectionPills) return;

    const onScroll = () => {
      pendingScrollYRef.current = window.scrollY;
      if (tickingScrollRef.current) return;

      tickingScrollRef.current = true;
      requestAnimationFrame(() => {
        const currentY = pendingScrollYRef.current;
        const lastY = lastScrollYRef.current;
        const deltaY = currentY - lastY;
        let nextCollapsed = areHeaderPillsCollapsedRef.current;

        if (currentY <= 12) {
          nextCollapsed = false;
        } else if (deltaY > 8 && currentY > 72) {
          nextCollapsed = true;
        } else if (deltaY < -10) {
          nextCollapsed = false;
        }

        setAreHeaderPillsCollapsed((prev) => (prev === nextCollapsed ? prev : nextCollapsed));
        lastScrollYRef.current = currentY;
        tickingScrollRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      tickingScrollRef.current = false;
    };
  }, [showSectionPills, loading, user, profileLoading, profileSetup]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileSetup?.username || !profileSetup.username.trim()) {
    return <UsernameSetup />;
  }

  return (
    <GlobalWorkoutDrawerProvider>
      <GlobalCardioDrawerProvider>
        <InAppNotificationsProvider>
      <ProfileDrawerProvider>
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />
        <div className="relative flex flex-1 flex-col">
          <div
            id="desktop-floating-create-slot"
            className={FLOATING_CREATE_SLOT}
          />
          {/* Header superior solo en móvil */}
          <header
            className={cn(
              "fixed left-0 right-0 top-0 z-40 flex w-full flex-col border-b border-border/40 bg-card px-4 py-2 dark:border-b-0 dark:bg-[hsl(222_47%_12%/0.88)] dark:backdrop-blur-2xl md:hidden",
              showSectionPills ? "max-md:gap-2" : "gap-0",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex min-w-0 items-center gap-2">
                  <h1 className="truncate text-lg font-semibold md:text-xl">{pageTitle}</h1>
                </div>

                <p
                  className={cn(
                    "text-xs leading-tight text-muted-foreground will-change-transform transition-[max-height,opacity,transform,margin] duration-250 ease-out",
                    showSectionPills && areHeaderPillsCollapsed
                      ? "max-h-6 translate-y-0 opacity-100 mt-0.5"
                      : "max-h-0 -translate-y-1 opacity-0"
                  )}
                >
                  {activeSubsectionLabel}
                </p>
              </div>

              <div className="flex shrink-0 items-center justify-end gap-1 max-md:gap-2">
                <div id="header-actions-slot" className="flex items-center gap-2 max-md:gap-3" />
                {showNotificationsBell && <InAppNotificationsBell />}
                <SettingsDrawer />
                <ProfileDrawerTrigger />
              </div>
            </div>

            {location.pathname === "/evolution" && (
              <div
                className={cn(
                  "overflow-hidden transform-gpu will-change-[max-height,opacity,transform] transition-[max-height,opacity,transform,margin] duration-280 ease-out motion-reduce:transition-none md:hidden",
                  areHeaderPillsCollapsed
                    ? "pointer-events-none -translate-y-1 opacity-0 max-h-0"
                    : "translate-y-0 opacity-100 max-h-16",
                )}
              >
                <div className="flex min-w-0 items-center gap-2 pb-0.5">
                  <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setSearchParams({ tab: "history" })}
                      className={cn(
                        filterPillBase,
                        "whitespace-nowrap",
                        (searchParams.get("tab") || "history") === "history"
                          ? filterPillActive
                          : filterPillInactive,
                      )}
                    >
                      Entrenos
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchParams({ tab: "measurements" })}
                      className={cn(
                        filterPillBase,
                        "whitespace-nowrap",
                        searchParams.get("tab") === "measurements"
                          ? filterPillActive
                          : filterPillInactive,
                      )}
                    >
                      Medidas
                    </button>
                  </div>
                  <div id="section-pills-actions-slot" className="flex shrink-0 items-center" />
                </div>
              </div>
            )}

            {location.pathname === "/routines" && (
              <div
                className={cn(
                  "overflow-hidden transform-gpu will-change-[max-height,opacity,transform] transition-[max-height,opacity,transform,margin] duration-280 ease-out motion-reduce:transition-none md:hidden",
                  areHeaderPillsCollapsed
                    ? "pointer-events-none -translate-y-1 opacity-0 max-h-0"
                    : "translate-y-0 opacity-100 max-h-16",
                )}
              >
                <div className="flex min-w-0 items-center gap-2 pb-0.5">
                  <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setSearchParams({ tab: "rutinas" })}
                      className={cn(
                        filterPillBase,
                        "whitespace-nowrap",
                        (searchParams.get("tab") || "rutinas") === "rutinas"
                          ? filterPillActive
                          : filterPillInactive,
                      )}
                    >
                      Rutinas
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchParams({ tab: "ejercicios" })}
                      className={cn(
                        filterPillBase,
                        "whitespace-nowrap",
                        searchParams.get("tab") === "ejercicios"
                          ? filterPillActive
                          : filterPillInactive,
                      )}
                    >
                      Ejercicios
                    </button>
                  </div>
                  <div id="section-pills-actions-slot" className="flex shrink-0 items-center" />
                </div>
              </div>
            )}
          </header>

          <main
            className={cn(
              "flex min-h-screen w-full min-w-0 flex-1 flex-col pb-24 transition-[padding-top] duration-220 ease-out motion-reduce:transition-none md:pb-0",
              showSectionPills && !areHeaderPillsCollapsed ? "pt-26 max-md:pt-26" : "pt-12 max-md:pt-12",
              "md:pt-12",
            )}
          >
            {/* Navegación por gestos desactivada: usamos solo el contenido de rutas directamente */}
            <Outlet />
          </main>
        </div>
        <ActiveWorkoutPill />
        <ActiveCardioPill />
        <div
          aria-hidden
          className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 h-[110px] bg-linear-to-t from-black/40 via-black/14 to-transparent md:hidden dark:from-black/55 dark:via-black/24"
        />
        <BottomNav />
        <WorkoutLogger />
        <CardioLogger />
        <CardioLiveRecorder />
      </div>
      </ProfileDrawerProvider>
      </InAppNotificationsProvider>
      </GlobalCardioDrawerProvider>
    </GlobalWorkoutDrawerProvider>
  );
}
