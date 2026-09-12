import { useState, useEffect } from "react";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { useWorkoutById } from "@/hooks/useWorkouts";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { useDraggablePillPosition } from "@/hooks/useDraggablePillPosition";
import { isActiveSessionPillCovered, pillCircleOriginFromElement } from "@/lib/pillCircleTransition";
import { tapLight } from "@/lib/haptics";
import { cn } from "@/lib/utils";
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
  // La query del logger se desactiva al minimizar; sin observador la caché
  // se queda fría y al pulsar la pill se pinta un frame de «rutina sin empezar».
  useWorkoutById(active?.id ?? null);
  const { openActiveWorkout, state } = useGlobalWorkoutDrawer();
  const [elapsed, setElapsed] = useState("0:00");
  /** En desktop: bottom-24. En móvil: encima del BottomNav (+ holgura). */
  const drag = useDraggablePillPosition("gym-log-pill-active-workout", 96, "activeWorkout");

  useEffect(() => {
    if (!active) return;
    if (!active.hasExercises) {
      setElapsed("0:00");
      return;
    }
    const update = () => setElapsed(formatElapsed(active.fecha));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [active?.id, active?.fecha, active?.hasExercises]);

  const openFromPill = () => {
    if (!active) return;
    tapLight();
    openActiveWorkout(active.id, pillCircleOriginFromElement(drag.elRef.current));
  };

  if (!active) return null;

  const covered = isActiveSessionPillCovered(state.open, state.pillCirclePhase);
  const circling = state.pillCirclePhase === "in" || state.pillCirclePhase === "out";

  return (
    <div
      ref={drag.elRef}
      data-draggable-pill
      role="button"
      tabIndex={covered || circling ? -1 : 0}
      aria-hidden={covered || circling}
      className={cn(
        "fixed bottom-24 left-1/2 z-50 w-auto max-w-[90vw] touch-none select-none cursor-grab active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-full max-md:bottom-[calc(var(--app-bottom-nav-inset,5rem)+0.75rem)]",
        (covered || circling) && "pointer-events-none",
        covered && "invisible",
      )}
      style={drag.style}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={(e) => {
        drag.onPointerUp(e);
        const wasDrag = drag.didDrag();
        drag.resetMovedFlag();
        if (!wasDrag && !covered && !circling) openFromPill();
      }}
      onPointerCancel={drag.onPointerCancel}
      onKeyDown={(e) => {
        if (covered || circling) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openFromPill();
        }
      }}
    >
      <div
        data-pressable
        className="group relative flex cursor-pointer items-center gap-3 pl-2 pr-4 py-2 rounded-full 
                   bg-neutral-900/80 backdrop-blur-md 
                   border border-white/10 shadow-2xl shadow-black/40
                   hover:bg-neutral-800/80 hover:border-white/20 hover:scale-[1.02]
                   transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out"
      >
        {/* Status Indicator (Pulse Effect) */}
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-success/10 border border-success/20">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
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
            <span className="text-sm font-mono tabular-nums text-success leading-none">
              {elapsed}
            </span>
          </div>
        </div>

        {/* Chevron with animation */}
        <ChevronRight className="h-4 w-4 text-neutral-500 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
        
        {/* Subtle gradient glow behind */}
        <div className="absolute inset-0 -z-10 rounded-full bg-linear-to-r from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      </div>
    </div>
  );
}
