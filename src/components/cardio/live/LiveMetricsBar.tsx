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
};

export function LiveMetricsBar({
  bottomOffsetPx,
  isSetup,
  elapsedSec,
  distanceM,
  elevationM,
  showNoGpsBanner,
  noGpsBannerText,
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
    <div
      className="pointer-events-none fixed inset-x-0 z-115 px-3"
      style={{ bottom: `${bottomOffsetPx}px` }}
    >
      <div
        className={cn(
          "mx-auto flex max-w-lg flex-col overflow-hidden rounded-[1.75rem]",
          "border border-border/80 bg-card/95 shadow-lg backdrop-blur-xl",
        )}
      >
        {showNoGpsBanner ? (
          <p className="border-b border-red-500/25 bg-red-500/15 px-3 py-1.5 text-center text-[11px] font-semibold tracking-wide text-red-600 dark:text-red-400">
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
      </div>
    </div>
  );
}
