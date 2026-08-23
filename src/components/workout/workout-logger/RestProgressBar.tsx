import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Timer } from "lucide-react";
import { formatMSS } from "@/hooks/useRestTimer";

const CURTAIN = {
  duration: 0.28,
  ease: [0.32, 0.72, 0, 1] as const,
};

// Barra de progreso de descanso a todo el ancho: el relleno se vacía y el color
// se desplaza sutilmente de azul (lleno) a ámbar (casi vacío); verde al terminar.
export function RestProgressBar({
  remaining,
  duration,
  finished,
  open,
}: {
  remaining: number;
  duration: number;
  finished: boolean;
  open: boolean;
}) {
  const snapshotRef = useRef({ remaining, duration, finished });
  if (open) {
    snapshotRef.current = { remaining, duration, finished };
  }
  const shown = open ? { remaining, duration, finished } : snapshotRef.current;
  // Un descanso recién arrancado tiene remaining === duration; si ya llevaba
  // tiempo (p. ej. al reabrir el drawer) no repetimos la cortinilla.
  const skipEnter = remaining < duration;

  const ratio = shown.duration > 0 ? Math.min(1, Math.max(0, shown.remaining / shown.duration)) : 0;
  const pct = shown.finished ? 100 : ratio * 100;
  // Interpolación de tono: 212 (azul, lleno) → 28 (ámbar, casi vacío). Verde (152) al terminar.
  const hue = shown.finished ? 152 : Math.round(28 + ratio * (212 - 28));
  const fill = `hsl(${hue} 88% 56%)`;
  const fillSoft = `hsl(${hue} 92% 64%)`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="rest-progress"
          initial={skipEnter ? false : { height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          transition={CURTAIN}
          style={{ overflow: "hidden" }}
        >
          <div className="flex w-full flex-col gap-1.5 pt-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Timer className="h-3.5 w-3.5" />
                Descanso
              </span>
              <span
                className="font-mono text-xs font-semibold tabular-nums transition-colors duration-700"
                style={{ color: shown.finished ? "hsl(152 70% 42%)" : fill }}
              >
                {shown.finished ? "¡Listo!" : formatMSS(shown.remaining)}
              </span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-border/50 bg-muted/60">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-[width,background-color] duration-1000 ease-linear"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${fill}, ${fillSoft})`,
                  boxShadow: `0 0 8px ${fill}80`,
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
