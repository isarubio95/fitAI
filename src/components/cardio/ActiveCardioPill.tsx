import { useEffect, useState } from "react";
import { useActiveCardioSession } from "@/hooks/useActiveCardioSession";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useActiveWorkout } from "@/hooks/useActiveWorkout";
import { useDraggablePillPosition } from "@/hooks/useDraggablePillPosition";
import { ChevronRight } from "lucide-react";

function formatElapsed(startDate: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(startDate).getTime()) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function firstDisciplinaNombre(data: {
  cardio_disciplina?: { nombre?: string | null } | { nombre?: string | null }[] | null;
  titulo?: string | null;
}): string {
  const d = data.cardio_disciplina;
  const name = Array.isArray(d) ? d[0]?.nombre : d?.nombre;
  return (name?.trim() || data.titulo?.trim() || "Cardio") as string;
}

export function ActiveCardioPill() {
  const { data: active } = useActiveCardioSession();
  const { data: activeWorkout } = useActiveWorkout();
  const { state, openLiveRecording } = useGlobalCardioDrawer();
  const [elapsed, setElapsed] = useState("");
  const stackAboveWorkout = !!activeWorkout;
  const drag = useDraggablePillPosition("gym-log-pill-active-cardio", 96, "activeWorkout");

  useEffect(() => {
    if (!active) return;
    const update = () => setElapsed(formatElapsed(active.fecha_inicio));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [active?.id, active?.fecha_inicio]);

  if (!active || state.liveOpen) return null;

  const label = firstDisciplinaNombre(active);

  return (
    <div
      ref={drag.elRef}
      role="button"
      tabIndex={0}
      className={`fixed left-1/2 z-50 w-auto max-w-[90vw] touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-full ${
        stackAboveWorkout ? "bottom-40" : "bottom-24"
      }`}
      style={drag.style}
      onPointerDown={drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={(e) => {
        drag.onPointerUp(e);
        const wasDrag = drag.didDrag();
        drag.resetMovedFlag();
        if (!wasDrag) openLiveRecording(active.id);
      }}
      onPointerCancel={drag.onPointerCancel}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLiveRecording(active.id);
        }
      }}
    >
      <div
        className="group relative flex cursor-pointer items-center gap-3 pl-2 pr-4 py-2 rounded-full 
                   bg-neutral-900/80 backdrop-blur-md 
                   border border-white/10 shadow-2xl shadow-black/40
                   hover:bg-neutral-800/80 hover:border-white/20 hover:scale-[1.02]
                   transition-all duration-300 ease-out"
      >
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/25">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" />
          </span>
        </div>

        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 leading-none">Cardio en curso</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white leading-none max-w-[42vw] truncate">{label}</span>
            <div className="h-3 w-px bg-white/10 mx-0.5 shrink-0" />
            <span className="text-sm font-mono tabular-nums text-sky-400 leading-none">{elapsed}</span>
          </div>
        </div>

        <ChevronRight className="h-4 w-4 text-neutral-500 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:text-white shrink-0" />
        <div className="absolute inset-0 -z-10 rounded-full bg-linear-to-r from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      </div>
    </div>
  );
}
