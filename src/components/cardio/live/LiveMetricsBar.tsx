import { cn } from "@/lib/utils";
import {
  formatCardioDistanceM,
  formatCardioDuration,
  formatCardioElevationM,
} from "@/lib/cardioFormat";

type Props = {
  bottomOffsetPx: number;
  isSetup: boolean;
  elapsedSec: number;
  distanceM: number;
  elevationM: number;
  showNoGpsBanner: boolean;
  noGpsBannerText: string;
  onOpenStats?: () => void;
};

export function LiveMetricsBar({
  bottomOffsetPx,
  isSetup,
  elapsedSec,
  distanceM,
  elevationM,
  showNoGpsBanner,
  noGpsBannerText,
  onOpenStats,
}: Props) {
  const metrics = [
    {
      key: "time",
      label: "Tiempo",
      value: formatCardioDuration(isSetup ? 0 : elapsedSec),
    },
    {
      key: "distance",
      label: "Distancia",
      value: formatCardioDistanceM(isSetup ? 0 : distanceM),
    },
    {
      key: "elevation",
      label: "Elevación",
      value: formatCardioElevationM(isSetup ? 0 : elevationM),
    },
  ] as const;

  return (
    <div className="fixed inset-x-0 z-115 px-3" style={{ bottom: `${bottomOffsetPx}px` }}>
      <button
        type="button"
        aria-label="Ver estadísticas"
        onClick={onOpenStats}
        className={cn(
          "mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] text-left",
          "border border-border/80 bg-card/95 shadow-lg backdrop-blur-xl",
          "transition-transform active:scale-[0.98]",
        )}
      >
        {showNoGpsBanner ? (
          <p className="pointer-events-none border-b border-red-500/25 bg-red-500/15 px-3 py-1.5 text-center text-[11px] font-semibold tracking-wide text-red-600 dark:text-red-400">
            {noGpsBannerText}
          </p>
        ) : null}
        <div className="flex items-stretch gap-1 p-1.5">
          {metrics.map((metric, index) => (
            <div
              key={metric.key}
              className={cn(
                "min-w-0 flex-1 px-2 py-2 text-center",
                index > 0 && "border-l border-border/60",
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-0.5 truncate font-mono text-lg font-semibold tabular-nums sm:text-xl">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </button>
    </div>
  );
}
