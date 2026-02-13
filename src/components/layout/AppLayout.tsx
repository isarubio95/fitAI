import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { ActiveWorkoutPill } from "@/components/workout/ActiveWorkoutPill";
import { WorkoutLogger } from "@/components/workout/WorkoutLogger";
import { GlobalWorkoutDrawerProvider, useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { Loader2 } from "lucide-react";

function AppLayoutInner() {
  const { user, loading } = useAuth();
  const { state, setOpen } = useGlobalWorkoutDrawer();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <ActiveWorkoutPill />
      <BottomNav />
      <WorkoutLogger
        open={state.open}
        onOpenChange={setOpen}
        workoutId={state.workoutId}
        defaultDate={state.defaultDate}
        templateExercises={state.templateExercises}
        templateTitle={state.templateTitle}
      />
    </div>
  );
}

export function AppLayout() {
  return (
    <GlobalWorkoutDrawerProvider>
      <AppLayoutInner />
    </GlobalWorkoutDrawerProvider>
  );
}
