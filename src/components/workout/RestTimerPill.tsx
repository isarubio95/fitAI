import { Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRestTimerContext } from "@/components/workout/RestTimerProvider";
import { formatMSS } from "@/hooks/useRestTimer";
import { cn } from "@/lib/utils";

function pctRemaining(remaining: number, duration: number) {
  if (!duration || duration <= 0) return 0;
  return Math.max(0, Math.min(100, (remaining / duration) * 100));
}

export function RestTimerPill({ mode = "global" }: { mode?: "global" | "sheet" }) {
  const timer = useRestTimerContext();

  if (!timer.activeKey) return null;

  const percent = pctRemaining(timer.remaining, timer.duration);
  const label = timer.finished ? "¡Listo!" : formatMSS(timer.remaining);

  const wrapperClassName =
    mode === "sheet"
      ? "fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] left-1/2 -translate-x-1/2 z-50 w-auto max-w-[92%]"
      : "fixed bottom-36 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90vw]";

  return (
    <div className={wrapperClassName}>
      <div
        className={cn(
          "group relative flex items-center gap-3 pl-2 pr-2 py-2 rounded-full",
          "bg-neutral-900/80 backdrop-blur-md",
          "border border-white/10 shadow-2xl shadow-black/40",
          "transition-all duration-300 ease-out",
          !timer.finished && "hover:bg-neutral-800/80 hover:border-white/20 hover:scale-[1.02]",
        )}
      >
        <div
          className={cn(
            "relative flex h-8 w-8 items-center justify-center rounded-full border",
            timer.finished ? "bg-emerald-500/10 border-emerald-500/20" : "bg-sky-500/10 border-sky-500/20",
          )}
        >
          <Timer className={cn("h-4 w-4", timer.finished ? "text-emerald-400" : "text-sky-400")} />
        </div>

        <div className="flex flex-col items-start gap-1 min-w-[160px]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 leading-none">
              Descanso
            </span>
            <span className={cn("text-sm font-mono tabular-nums leading-none", timer.finished ? "text-emerald-400" : "text-sky-400")}>
              {label}
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-[width] duration-200 ease-linear", timer.finished ? "bg-emerald-400/70" : "bg-sky-400/70")}
              style={{ width: `${timer.finished ? 0 : percent}%` }}
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-neutral-400 hover:text-white"
          onClick={() => timer.stop()}
          aria-label="Cerrar descanso"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

