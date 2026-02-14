import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { ProfileDrawer } from "./ProfileDrawer";
import { ActiveWorkoutPill } from "@/components/workout/ActiveWorkoutPill";
import { GlobalWorkoutDrawerProvider } from "@/hooks/useGlobalWorkoutDrawer";
import { WorkoutLogger } from "@/components/workout/WorkoutLogger";
import { Dumbbell, Loader2 } from "lucide-react";

const routeTitles: Record<string, string> = {
  "/": "Inicio",
  "/routines": "Rutinas",
  "/exercises": "Ejercicios",
  "/history": "Progreso",
  "/measurements": "Medidas",
};

export function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const pageTitle = routeTitles[location.pathname] ?? "TrackGym";

  return (
    <GlobalWorkoutDrawerProvider>
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />
        <div className="flex-1 flex flex-col">
          {/* Mobile header */}
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-xl px-4 md:hidden">
            <ProfileDrawer />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Dumbbell className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold">{pageTitle}</span>
            </div>
            {/* Spacer to center title */}
            <div className="w-8" />
          </header>

          <main className="flex-1 pb-24 md:pb-0">
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
