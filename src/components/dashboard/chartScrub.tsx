import { useLayoutEffect, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

/** Cursor vertical estilo Strava: siempre visible con `defaultIndex` + `active`. */
export const CHART_SCRUB_CURSOR = {
  stroke: "hsl(var(--foreground))",
  strokeWidth: 1.25,
  strokeOpacity: 1,
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
    <div className="mb-3.5 min-h-13" aria-live="polite">
      <p className="text-[12px] font-medium text-muted-foreground">{formatScrubDate(date)}</p>
      <div className="mt-1 flex flex-wrap gap-x-7 gap-y-1">{children}</div>
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

/** Índice de dato (0…n-1) a partir de la posición relativa en el área del gráfico. */
export function chartIndexFromRatio(ratio: number, count: number): number {
  if (count <= 1) return 0;
  return Math.round(Math.max(0, Math.min(1, ratio)) * (count - 1));
}

/**
 * Capa HTML encima del gráfico: el índice sale de la X del puntero, no del
 * Tooltip de Recharts (en un toque ese tooltip se queda en el último día).
 */
export function ChartScrubLayer({
  count,
  marginLeft,
  marginRight,
  onIndex,
  onActiveChange,
}: {
  count: number;
  marginLeft: number;
  marginRight: number;
  onIndex: (index: number) => void;
  onActiveChange: (active: boolean) => void;
}) {
  const pick = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const plotWidth = Math.max(1, rect.width - marginLeft - marginRight);
    onIndex(chartIndexFromRatio((event.clientX - rect.left - marginLeft) / plotWidth, count));
  };

  return (
    <div
      data-testid="chart-scrub-layer"
      className="absolute inset-0"
      style={{ touchAction: "pan-y" }}
      onPointerDown={(event) => {
        onActiveChange(true);
        pick(event);
      }}
      onPointerMove={(event) => {
        onActiveChange(true);
        pick(event);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") onActiveChange(false);
      }}
    />
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
