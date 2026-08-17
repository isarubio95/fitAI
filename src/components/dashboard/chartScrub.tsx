import { useLayoutEffect, type CSSProperties, type ReactNode } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

/** Cursor vertical estilo Strava: siempre visible con `defaultIndex` + `active`. */
export const CHART_SCRUB_CURSOR = {
  stroke: "hsl(var(--foreground))",
  strokeWidth: 1.25,
  strokeOpacity: 0.5,
} as const;

export const CHART_SCRUB_TOOLTIP_WRAPPER: CSSProperties = { display: "none" };

export function formatScrubDate(dateValue: string): string {
  return format(new Date(dateValue), "d MMM yyyy", { locale: es });
}

export function ChartScrubSummary({
  date,
  children,
}: {
  date: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-2.5 min-h-13" aria-live="polite">
      <p className="text-[12px] font-medium text-muted-foreground">{formatScrubDate(date)}</p>
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">{children}</div>
    </div>
  );
}

export function ChartScrubStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className="text-[15px] font-semibold tabular-nums leading-tight text-foreground"
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

/** Sincroniza el punto activo del Tooltip de Recharts con el resumen de encima. */
export function ChartScrubSync<T>({
  payload,
  onPoint,
}: Partial<Pick<TooltipContentProps<ValueType, NameType>, "payload">> & {
  onPoint: (point: T | undefined) => void;
}) {
  const point = payload?.[0]?.payload as T | undefined;
  useLayoutEffect(() => {
    if (point !== undefined) onPoint(point);
  }, [onPoint, point]);
  return null;
}
