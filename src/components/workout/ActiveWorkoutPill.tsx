import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useActiveWorkoutQuery } from "@/hooks/useActiveWorkout";
import { Dumbbell, Timer } from "lucide-react";

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ActiveWorkoutPill() {
  const { data: activeWorkout } = useActiveWorkoutQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const [elapsed, setElapsed] = useState(0);

  const isOnWorkoutPage = location.pathname.startsWith("/workout/");

  useEffect(() => {
    if (!activeWorkout?.fecha) return;
    const start = new Date(activeWorkout.fecha).getTime();
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout?.fecha]);

  if (!activeWorkout || isOnWorkoutPage) return null;

  return (
    <button
      onClick={() => navigate(`/workout/${activeWorkout.id}`)}
      className="fixed bottom-20 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-auto z-40 flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-full px-5 py-3 shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors animate-in slide-in-from-bottom-4"
    >
      <Dumbbell className="h-4 w-4" />
      <span className="font-medium text-sm">Entreno en curso</span>
      <span className="flex items-center gap-1 font-mono text-sm opacity-90">
        <Timer className="h-3.5 w-3.5" />
        {formatElapsed(elapsed)}
      </span>
    </button>
  );
}
