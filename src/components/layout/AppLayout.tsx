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
    lastScrollYRef.current = window.scrollY;
  }, [location.pathname, currentTab, loading, user, profileLoading, profileSetup]);

  useEffect(() => {
    if (loading || !user || profileLoading || !profileSetup?.username || !profileSetup.username.trim()) return;
    if (!showSectionPills) return;

    const onScroll = () => {
      const currentY = window.scrollY;
      const lastY = lastScrollYRef.current;

      if (currentY <= 8) {
        setAreHeaderPillsCollapsed(false);
      } else if (currentY > lastY + 6 && currentY > 56) {
        setAreHeaderPillsCollapsed(true);
      }

      lastScrollYRef.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
            className="pointer-events-none fixed right-4 top-4 z-40 hidden items-center gap-2 md:flex [&>*]:pointer-events-auto"
          />
          {/* Header superior solo en móvil */}
          <header
            className={cn(
              "fixed left-0 right-0 top-0 z-40 flex w-full flex-col border-b border-border/40 bg-card px-4 py-2 dark:border-b-0 dark:bg-zinc-950/40 dark:backdrop-blur-xl md:hidden",
              "transition-[gap] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
              showSectionPills && !areHeaderPillsCollapsed ? "max-md:gap-2" : "gap-0",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex min-w-0 items-center gap-2">
                  <h1 className="truncate text-lg font-semibold md:text-xl">{pageTitle}</h1>
                </div>

                <p
                  className={cn(
                    "text-xs leading-tight text-muted-foreground transition-all duration-300",
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
                  "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none md:hidden",
                  areHeaderPillsCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className={cn(
                      "flex min-w-0 items-center gap-2 pb-0.5",
                      "transition-[opacity,transform] duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                      areHeaderPillsCollapsed
                        ? "pointer-events-none opacity-0 transform-[translate3d(0,4px,0)_scale(0.98)]"
                        : "opacity-100 transform-[translate3d(0,0,0)_scale(1)]",
                    )}
                  >
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
              </div>
            )}

            {location.pathname === "/routines" && (
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none md:hidden",
                  areHeaderPillsCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className={cn(
                      "flex min-w-0 items-center gap-2 pb-0.5",
                      "transition-[opacity,transform] duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                      areHeaderPillsCollapsed
                        ? "pointer-events-none opacity-0 transform-[translate3d(0,4px,0)_scale(0.98)]"
                        : "opacity-100 transform-[translate3d(0,0,0)_scale(1)]",
                    )}
                  >
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
              </div>
            )}
          </header>

          <main
            className={cn(
              "flex min-h-screen w-full min-w-0 flex-1 flex-col pb-24 transition-[padding-top] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none md:pb-0",
              showSectionPills && !areHeaderPillsCollapsed ? "pt-26 max-md:pt-26" : "pt-12 max-md:pt-12",
              "md:pt-6",
            )}
          >
            {/* Navegación por gestos desactivada: usamos solo el contenido de rutas directamente */}
            <Outlet />
          </main>
        </div>
        <ActiveWorkoutPill />
        <ActiveCardioPill />
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
