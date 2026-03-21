import { useState, useEffect } from "react";
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

export function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const check = () => setAtTop(window.scrollY < 2);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

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
      <ProfileDrawerProvider>
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />
        <div className="flex-1 flex flex-col">
          {/* Mobile header — fijo siempre visible */}
          <header
            className={cn(
              "fixed left-0 right-0 top-0 z-40 flex w-full items-center justify-between gap-3 border-b bg-white/40 px-4 py-2 backdrop-blur-xl transition-[border-color] duration-300 dark:bg-zinc-950/40 md:hidden",
              atTop ? "border-transparent" : "border-black/5 dark:border-white/5",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <ProfileDrawerTrigger />
              {location.pathname === "/evolution" && (
                <div className="flex shrink-0 items-center gap-2">
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
                    Entrenamientos
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
              )}

              {location.pathname === "/routines" && (
                <div className="flex shrink-0 items-center gap-2">
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
              )}
            </div>

            <div className="flex shrink-0 items-center justify-end">
              <SettingsDrawer />
            </div>
          </header>

          <main className="flex min-h-screen w-full min-w-0 flex-1 flex-col pb-24 pt-10 md:pb-0 md:pt-0">
            {/* Navegación por gestos desactivada: usamos solo el contenido de rutas directamente */}
            <Outlet />
          </main>
        </div>
        <ActiveWorkoutPill />
        <BottomNav />
        <WorkoutLogger />
      </div>
      </ProfileDrawerProvider>
    </GlobalWorkoutDrawerProvider>
  );
}
