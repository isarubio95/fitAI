import { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

// Elapsed time display component (admite pausa: pausedAt congela el contador y pausedAccumMs descuenta lo ya pausado)
export function ElapsedTime({
  since,
  pausedAccumMs = 0,
  pausedAt = null,
  paused = false,
}: {
  since: string;
  pausedAccumMs?: number;
  pausedAt?: number | null;
  paused?: boolean;
}) {
  const [text, setText] = useState("");
  useEffect(() => {
    const update = () => {
      const now = pausedAt ?? Date.now();
      const diff = Math.max(0, Math.floor((now - new Date(since).getTime() - pausedAccumMs) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setText(h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`);
    };
    update();
    if (pausedAt !== null) return;
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [since, pausedAccumMs, pausedAt]);
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono tabular-nums transition-colors",
        paused
          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-border/60 bg-muted/60 text-foreground",
      )}
    >
      <Timer className="h-3.5 w-3.5" />
      {text}
      {paused && <span className="text-[10px] font-semibold uppercase tracking-wide">Pausa</span>}
    </span>
  );
}
