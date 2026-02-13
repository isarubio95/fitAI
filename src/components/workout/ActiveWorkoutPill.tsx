import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { Dumbbell, ChevronRight } from "lucide-react";

function formatElapsed(startDate: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(startDate).getTime()) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ActiveWorkoutPill() {
  const { data: active } = useActiveWorkout();
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!active) return;
    const update = () => setElapsed(formatElapsed(active.fecha));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [active?.id, active?.fecha]);

  if (!active) return null;

  return (
    <button
      onClick={() => navigate(`/?workout=${active.id}`)}
      className="fixed bottom-[4.5rem] left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2.5 shadow-lg shadow-primary/30 md:bottom-6 transition-transform active:scale-95"
    >
      <Dumbbell className="h-4 w-4" />
      <span className="text-sm font-medium">Entreno en curso</span>
      <span className="text-sm font-mono tabular-nums">{elapsed}</span>
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}
