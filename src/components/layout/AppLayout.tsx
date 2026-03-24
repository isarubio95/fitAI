import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { ProfileDrawerProvider, ProfileDrawerTrigger } from "./ProfileDrawer";
import { SettingsDrawer } from "./SettingsDrawer";
import { ActiveWorkoutPill } from "@/components/workout/ActiveWorkoutPill";
import { GlobalWorkoutDrawerProvider } from "@/hooks/useGlobalWorkoutDrawer";
import { WorkoutLogger } from "@/components/workout/WorkoutLogger";
import { Loader2 } from "lucide-react";
// import { SwipeableRoutesWrapper } from "./SwipeableRoutesWrapper";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UsernameSetup from "@/pages/UsernameSetup";
import { InAppNotificationsProvider } from "@/contexts/InAppNotificationsContext";
import { InAppNotificationsBell } from "@/components/notifications/InAppNotificationsBell";

export function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const pageTitle =
    location.pathname === "/"
      ? "TrackGym"
      : location.pathname === "/evolution"
        ? "Evolución"
        : location.pathname === "/routines"
          ? "Rutinas"
          : location.pathname === "/community"
            ? "Comunidad"
            : location.pathname === "/profile"
              ? "Perfil"
              : "TrackGym";

  const showHeaderPills = location.pathname === "/evolution" || location.pathname === "/routines";
  const showNotificationsBell = location.pathname === "/";
  const activeSubsectionLabel =
    location.pathname === "/evolution"
      ? (currentTab || "history") === "measurements"
        ? "Medidas"
        : "Entrenos"
      : location.pathname === "/routines"
        ? (currentTab || "rutinas") === "ejercicios"
          ? "Ejercicios"
          : "Rutinas"
        : "";

  useEffect(() => {
    if (loading || !user || profileLoading || !profileSetup?.username || !profileSetup.username.trim()) return;
    setAreHeaderPillsCollapsed(false);
    lastScrollYRef.current = window.scrollY;
  }, [location.pathname, currentTab, loading, user, profileLoading, profileSetup]);

  useEffect(() => {
    if (loading || !user || profileLoading || !profileSetup?.username || !profileSetup.username.trim()) return;
    if (!showHeaderPills) return;

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
  }, [showHeaderPills, loading, user, profileLoading, profileSetup]);

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
      <InAppNotificationsProvider>
      <ProfileDrawerProvider>
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />
        <div className="flex-1 flex flex-col">
          {/* Mobile header — fijo siempre visible */}
          <header className="fixed left-0 right-0 top-0 z-40 w-full bg-background px-4 py-2 dark:bg-zinc-950/40 dark:backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex min-w-0 items-center gap-2">
                  <h1 className="truncate text-lg font-semibold md:text-xl">{pageTitle}</h1>
                </div>

                <p
                  className={cn(
                    "text-xs leading-tight text-muted-foreground transition-all duration-300",
                    showHeaderPills && areHeaderPillsCollapsed
                      ? "max-h-6 translate-y-0 opacity-100 mt-0.5"
                      : "max-h-0 -translate-y-1 opacity-0"
                  )}
                >
                  {activeSubsectionLabel}
                </p>
              </div>

              <div className="flex shrink-0 items-center justify-end gap-0.5">
                <div id="header-actions-slot" className="flex items-center gap-2" />
                {showNotificationsBell && <InAppNotificationsBell />}
                <SettingsDrawer />
                <ProfileDrawerTrigger />
              </div>
            </div>
          </header>

          {location.pathname === "/evolution" && (
            <div
              className={cn(
                "fixed left-0 right-0 top-16 z-30 px-4 pt-1 md:hidden transition-all duration-300",
                areHeaderPillsCollapsed
                  ? "-translate-y-3 opacity-0 pointer-events-none"
                  : "translate-y-0 opacity-100"
              )}
            >
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: "history" })}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                    (searchParams.get("tab") || "history") === "history"
                      ? "border-primary bg-primary text-black shadow-sm"
                      : "border-border/60 bg-muted/40 text-foreground hover:border-border hover:bg-muted/55",
                  )}
                >
                  Entrenos
                </button>
                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: "measurements" })}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                    searchParams.get("tab") === "measurements"
                      ? "border-primary bg-primary text-black shadow-sm"
                      : "border-border/60 bg-muted/40 text-foreground hover:border-border hover:bg-muted/55",
                  )}
                >
                  Medidas
                </button>
              </div>
            </div>
          )}

          {location.pathname === "/routines" && (
            <div
              className={cn(
                "fixed left-0 right-0 top-16 z-30 px-4 pt-1 md:hidden transition-all duration-300",
                areHeaderPillsCollapsed
                  ? "-translate-y-3 opacity-0 pointer-events-none"
                  : "translate-y-0 opacity-100"
              )}
            >
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: "rutinas" })}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                    (searchParams.get("tab") || "rutinas") === "rutinas"
                      ? "border-primary bg-primary text-black shadow-sm"
                      : "border-border/60 bg-muted/40 text-foreground hover:border-border hover:bg-muted/55",
                  )}
                >
                  Rutinas
                </button>
                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: "ejercicios" })}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                    searchParams.get("tab") === "ejercicios"
                      ? "border-primary bg-primary text-black shadow-sm"
                      : "border-border/60 bg-muted/40 text-foreground hover:border-border hover:bg-muted/55",
                  )}
                >
                  Ejercicios
                </button>
              </div>
            </div>
          )}

          <main className={cn(
            "flex min-h-screen w-full min-w-0 flex-1 flex-col pb-24 md:pb-0 md:pt-14",
            showHeaderPills && !areHeaderPillsCollapsed ? "pt-26" : "pt-12"
          )}>
            {/* Navegación por gestos desactivada: usamos solo el contenido de rutas directamente */}
            <Outlet />
          </main>
        </div>
        <ActiveWorkoutPill />
        <BottomNav />
        <WorkoutLogger />
      </div>
      </ProfileDrawerProvider>
      </InAppNotificationsProvider>
    </GlobalWorkoutDrawerProvider>
  );
}
