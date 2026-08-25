import { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

function formatElapsed(diffSec: number) {
  const h = Math.floor(diffSec / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  const s = diffSec % 60;
  return h > 0
    ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    : `${m}:${s.toString().padStart(2, "0")}`;
}

function elapsedSeconds(since: string, pausedAccumMs: number, pausedAt: number | null) {
  const now = pausedAt ?? Date.now();
  return Math.max(0, Math.floor((now - new Date(since).getTime() - pausedAccumMs) / 1000));
}

// Elapsed time display component (admite pausa: pausedAt congela el contador y pausedAccumMs descuenta lo ya pausado)
export function ElapsedTime({
  since,
  pausedAccumMs = 0,
  pausedAt = null,
  paused = false,
  running = true,
}: {
  since?: string | null;
  pausedAccumMs?: number;
  pausedAt?: number | null;
  paused?: boolean;
  /** Si es false, se muestra 0:00 sin avanzar (p. ej. entreno en blanco sin ejercicios). */
  running?: boolean;
}) {
  const clockOn = running && !!since;
  const [text, setText] = useState(() =>
    clockOn && since ? formatElapsed(elapsedSeconds(since, pausedAccumMs, pausedAt)) : "0:00",
  );
  useEffect(() => {
    if (!clockOn || !since) {
      setText("0:00");
      return;
    }
    const update = () => setText(formatElapsed(elapsedSeconds(since, pausedAccumMs, pausedAt)));
    update();
    if (pausedAt !== null) return;
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [since, pausedAccumMs, pausedAt, clockOn]);
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono tabular-nums transition-colors",
        clockOn && paused
          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-border/60 bg-muted/60 text-foreground",
      )}
      aria-label="Tiempo transcurrido"
    >
      <Timer className="h-3.5 w-3.5" />
      {text}
      {clockOn && paused && <span className="text-[10px] font-semibold uppercase tracking-wide">Pausa</span>}
    </span>
  );
}
