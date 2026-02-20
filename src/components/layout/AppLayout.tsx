import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { ProfileDrawer } from "./ProfileDrawer";
import { ActiveWorkoutPill } from "@/components/workout/ActiveWorkoutPill";
import { GlobalWorkoutDrawerProvider } from "@/hooks/useGlobalWorkoutDrawer";
import { WorkoutLogger } from "@/components/workout/WorkoutLogger";
import { Loader2 } from "lucide-react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { SwipeableRoutesWrapper } from "./SwipeableRoutesWrapper";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const { user, loading } = useAuth();
  const scrollDirection = useScrollDirection();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <GlobalWorkoutDrawerProvider>
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />
        <div className="flex-1 flex flex-col">
          {/* Mobile header — auto-hide on scroll down */}
          <header
            className={`fixed top-0 left-0 right-0 z-40 flex h-12 items-center px-4 gap-3 md:hidden transition-transform duration-300 bg-background/60 backdrop-blur-xl ${
              scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
            }`}
          >
            <ProfileDrawer />
            {location.pathname === "/evolution" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSearchParams({ tab: "history" })}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                    (searchParams.get("tab") || "history") === "history"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-foreground hover:bg-secondary"
                  )}
                >
                  Entrenamientos
                </button>
                <button
                  onClick={() => setSearchParams({ tab: "measurements" })}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                    searchParams.get("tab") === "measurements"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-foreground hover:bg-secondary"
                  )}
                >
                  Medidas
                </button>
              </div>
            )}
          </header>

          <main className="flex-1 flex flex-col pt-8 md:pt-0 pb-24 md:pb-0 min-h-screen">
            <SwipeableRoutesWrapper />
          </main>
        </div>
        <ActiveWorkoutPill />
        <BottomNav />
        <WorkoutLogger />
      </div>
    </GlobalWorkoutDrawerProvider>
  );
}
