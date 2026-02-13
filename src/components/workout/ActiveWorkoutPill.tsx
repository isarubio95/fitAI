import { useState, useEffect } from "react";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { ChevronRight } from "lucide-react";

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
  const { openActiveWorkout, state } = useGlobalWorkoutDrawer();
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!active) return;
    const update = () => setElapsed(formatElapsed(active.fecha));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [active?.id, active?.fecha]);

  // Don't show pill if drawer is already open or no active workout
  if (!active || state.open) return null;

  return (
    <div className="fixed bottom-[5rem] left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90vw]">
      <button
        onClick={() => openActiveWorkout(active.id)}
        className="group relative flex items-center gap-3 pl-2 pr-4 py-2 rounded-full 
                   bg-neutral-900/80 backdrop-blur-md 
                   border border-white/10 shadow-2xl shadow-black/40
                   hover:bg-neutral-800/80 hover:border-white/20 hover:scale-[1.02]
                   transition-all duration-300 ease-out"
      >
        {/* Status Indicator (Pulse Effect) */}
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>

        {/* Content Wrapper */}
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 leading-none">
            En curso
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white leading-none">
              Entrenamiento
            </span>
            {/* Vertical Separator */}
            <div className="h-3 w-px bg-white/10 mx-0.5" />
            <span className="text-sm font-mono tabular-nums text-emerald-400 leading-none">
              {elapsed}
            </span>
          </div>
        </div>

        {/* Chevron with animation */}
        <ChevronRight className="h-4 w-4 text-neutral-500 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
        
        {/* Subtle gradient glow behind */}
        <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      </button>
    </div>
  );
}