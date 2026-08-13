import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildLiveStatItems, type LiveStatMetrics } from "@/lib/cardioLiveStats";
import {
  circleCenterTransitionAttr,
  circleCenterTransitionStyle,
  type CircleCenterOrigin,
  type CircleCenterPhase,
} from "@/lib/circleCenterTransition";

type Props = {
  title: string;
  disciplineCode: string | null | undefined;
  metrics: LiveStatMetrics;
  phase: CircleCenterPhase;
  origin?: CircleCenterOrigin;
  onClose: () => void;
};

export function LiveStatsFullscreen({
  title,
  disciplineCode,
  metrics,
  phase,
  origin,
  onClose,
}: Props) {
  const items = buildLiveStatItems(disciplineCode, metrics);

  return (
    <div
      className="fixed inset-0 z-120 flex flex-col bg-card text-card-foreground"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-circle-center={phase}
      {...(phase !== "settled"
        ? { "transition-style": circleCenterTransitionAttr(phase) }
        : {})}
      style={circleCenterTransitionStyle(phase, origin)}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-border/60 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          onClick={onClose}
          aria-label="Cerrar estadísticas"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold tracking-tight">{title}</p>
          <p className="text-xs text-muted-foreground">Estadísticas en vivo</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-border/60 bg-secondary/30 px-4 py-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1.5 truncate font-mono text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
