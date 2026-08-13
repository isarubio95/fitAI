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
import { LiveSessionRehydrator } from "@/components/live/LiveSessionRehydrator";
import { Loader2 } from "lucide-react";
// import { SwipeableRoutesWrapper } from "./SwipeableRoutesWrapper";
import { filterPillActive, filterPillBase, filterPillInactive } from "@/lib/filter-pill-styles";
import { FLOATING_CREATE_SLOT } from "@/lib/pageStyles";
import { cn } from "@/lib/utils";
import { topBarSurface } from "@/lib/surface-styles";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UsernameSetup from "@/pages/UsernameSetup";
import { InAppNotificationsProvider } from "@/contexts/InAppNotificationsContext";
import { InAppNotificationsBell } from "@/components/notifications/InAppNotificationsBell";
import { InAppFollowerToastSync } from "@/components/notifications/InAppFollowerToastSync";
import { InAppSocialToastSync } from "@/components/notifications/InAppSocialToastSync";
import { useSafeAreaInsetsSync } from "@/hooks/useSafeAreaInsetsSync";
import { useLogrosSync } from "@/hooks/useLogrosSync";

export function AppLayout() {
  useSafeAreaInsetsSync();
  useLogrosSync();
  const { user, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { location, pageTitle, showSectionPills, activeSubsectionLabel } =
    usePageLayoutMeta();
  const [areHeaderPillsCollapsed, setAreHeaderPillsCollapsed] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingScrollRef = useRef(false);
  const pendingScrollYRef = useRef(0);
  const areHeaderPillsCollapsedRef = useRef(false);
  const headerRef = useRef<HTMLElement>(null);

  const { data: profileSetup, isLoading: profileLoading } = useQuery({
    queryKey: ["profileSetup", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("perfil")
        .select("username")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
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

  // Mide la altura real de la cabecera fija y la expone como variable CSS, de modo
  // que el padding-top del contenido se adapte a cualquier escala de fuente del
  // sistema (evita que el contenido quede recortado bajo la cabecera).
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty("--app-header-height", `${el.offsetHeight}px`);
    };

    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, user, profileLoading, profileSetup, showSectionPills, location.pathname]);

  useEffect(() => {
    const isEditableField = (el: Element | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      return el.isContentEditable;
    };

    const getInteractive = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      if (!element || isEditableField(element) || element.closest("input, textarea, select, [contenteditable='true']")) {
        return null;
      }
      return element.closest(
        'button, [role="button"], [role="tab"], [role="menuitem"], [role="option"], [role="link"], a[href], summary',
      ) as HTMLElement | null;
    };

    const clearTouchFocus = (target: EventTarget | null) => {
      const activeElement = document.activeElement as HTMLElement | null;
      if (isEditableField(activeElement)) return;

      const interactive = getInteractive(target);
      interactive?.blur?.();

      if (activeElement && getInteractive(activeElement)) {
        activeElement.blur();
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      clearTouchFocus(event.target);
    };
    const onTouchEnd = (event: TouchEvent) => {
      clearTouchFocus(event.target);
    };
    const onClick = (event: MouseEvent) => {
      clearTouchFocus(event.target);
    };

    window.addEventListener("pointerup", onPointerUp, { passive: true, capture: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("click", onClick, { passive: true, capture: true });
    return () => {
      window.removeEventListener("pointerup", onPointerUp, { capture: true });
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
      window.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

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
      <InAppFollowerToastSync />
      <InAppSocialToastSync />
      <ProfileDrawerProvider>
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div
            id="desktop-floating-create-slot"
            className={FLOATING_CREATE_SLOT}
          />
          {/* Header superior solo en móvil */}
          <header
            ref={headerRef}
            className={cn(
              "fixed left-0 right-0 top-0 z-40 flex w-full flex-col border-b border-border/50 px-4 pb-2 pt-[calc(0.5rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] md:hidden",
              topBarSurface,
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
                <InAppNotificationsBell />
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
              "flex min-h-screen w-full min-w-0 flex-1 flex-col pb-24 md:pb-0",
              "max-md:pt-[var(--app-header-height,5rem)]",
              "md:pt-12",
            )}
          >
            {/* Navegación por gestos desactivada: usamos solo el contenido de rutas directamente */}
            <Outlet />
          </main>
        </div>
        <LiveSessionRehydrator />
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
