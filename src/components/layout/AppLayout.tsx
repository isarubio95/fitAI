import { useState, useEffect } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { ProfileDrawer } from "./ProfileDrawer";
import { SettingsDrawer } from "./SettingsDrawer";
import { ActiveWorkoutPill } from "@/components/workout/ActiveWorkoutPill";
import { GlobalWorkoutDrawerProvider } from "@/hooks/useGlobalWorkoutDrawer";
import { WorkoutLogger } from "@/components/workout/WorkoutLogger";
import { Loader2 } from "lucide-react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
// import { SwipeableRoutesWrapper } from "./SwipeableRoutesWrapper";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UsernameSetup from "@/pages/UsernameSetup";

export function AppLayout() {
  const { user, loading } = useAuth();
  const scrollDirection = useScrollDirection();
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
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />
        <div className="flex-1 flex flex-col">
          {/* Mobile header — auto-hide on scroll down */}
          <header
            className={cn(
              "fixed top-0 left-0 right-0 z-40 flex min-h-12 items-center px-4 pt-3 md:hidden transition-[transform,border-color] duration-300 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border-b",
              atTop ? "border-transparent" : "border-black/5 dark:border-white/5",
              scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <ProfileDrawer />
              {location.pathname === "/evolution" && (
                <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                  <button
                    onClick={() => setSearchParams({ tab: "history" })}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap border border-transparent",
                      (searchParams.get("tab") || "history") === "history"
                        ? "bg-background text-foreground border-emerald-500/40"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Entrenamientos
                  </button>
                  <button
                    onClick={() => setSearchParams({ tab: "measurements" })}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap border border-transparent",
                      searchParams.get("tab") === "measurements"
                        ? "bg-background text-foreground border-emerald-500/40"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Medidas
                  </button>
                </div>
              )}

              {location.pathname === "/routines" && (
                <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                  <button
                    onClick={() => setSearchParams({ tab: "rutinas" })}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap border border-transparent",
                      (searchParams.get("tab") || "rutinas") === "rutinas"
                        ? "bg-background text-foreground border-emerald-500/40"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Rutinas
                  </button>
                  <button
                    onClick={() => setSearchParams({ tab: "ejercicios" })}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap border border-transparent",
                      searchParams.get("tab") === "ejercicios"
                        ? "bg-background text-foreground border-emerald-500/40"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Ejercicios
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end ml-auto">
              <SettingsDrawer />
            </div>
          </header>

          <main className="flex-1 flex flex-col min-w-0 w-full pt-8 md:pt-0 pb-24 md:pb-0 min-h-screen">
            {/* Navegación por gestos desactivada: usamos solo el contenido de rutas directamente */}
            <Outlet />
          </main>
        </div>
        <ActiveWorkoutPill />
        <BottomNav />
        <WorkoutLogger />
      </div>
    </GlobalWorkoutDrawerProvider>
  );
}
