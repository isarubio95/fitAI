import { Timer } from "lucide-react";
import { formatMSS } from "@/hooks/useRestTimer";

// Barra de progreso de descanso a todo el ancho: el relleno se vacía y el color
// se desplaza sutilmente de azul (lleno) a ámbar (casi vacío); verde al terminar.
export function RestProgressBar({
  remaining,
  duration,
  finished,
}: {
  remaining: number;
  duration: number;
  finished: boolean;
}) {
  const ratio = duration > 0 ? Math.min(1, Math.max(0, remaining / duration)) : 0;
  const pct = finished ? 100 : ratio * 100;
  // Interpolación de tono: 212 (azul, lleno) → 28 (ámbar, casi vacío). Verde (152) al terminar.
  const hue = finished ? 152 : Math.round(28 + ratio * (212 - 28));
  const fill = `hsl(${hue} 88% 56%)`;
  const fillSoft = `hsl(${hue} 92% 64%)`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <Timer className="h-3.5 w-3.5" />
          Descanso
        </span>
        <span
          className="font-mono text-xs font-semibold tabular-nums transition-colors duration-700"
          style={{ color: finished ? "hsl(152 70% 42%)" : fill }}
        >
          {finished ? "¡Listo!" : formatMSS(remaining)}
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
  );
}
