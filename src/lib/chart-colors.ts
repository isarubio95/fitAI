import { createElement } from "react";

/**
 * Serie de datos compartida por los gráficos de la app.
 * Los valores viven en los tokens `--chart-*` del tema (ver `index.css`),
 * así que se adaptan solos a claro/oscuro.
 */
export const chartColors = {
  fitness: "hsl(var(--chart-fitness))",
  fatigue: "hsl(var(--chart-fatigue))",
  danger: "hsl(var(--chart-danger))",
  positive: "hsl(var(--chart-positive))",
  fresh: "hsl(var(--chart-fresh))",
  neutral: "hsl(var(--chart-neutral))",
} as const;

/** Opacidad del área sombreada entre dos series. */
export const CHART_AREA_OPACITY = 0.16;

export const chartAxis = {
  tick: "hsl(var(--muted-foreground))",
  grid: "hsl(var(--foreground))",
  gridOpacity: 0.18,
  surface: "hsl(var(--card))",
} as const;

/** Eje Y a la derecha. `width` es el gutter; las cifras se anclan por dentro. */
export const chartYAxis = {
  orientation: "right" as const,
  width: 36,
  /** Aire extra del SVG a la derecha para que las cifras no se corten. */
  marginRight: 8,
  /** Separación entre el borde derecho del gutter y el final del número. */
  tickInset: 8,
} as const;

export function ChartYAxisTick({
  x = 0,
  y = 0,
  payload,
  tickFormatter,
  index = 0,
  fontSize = 11,
  axisWidth = chartYAxis.width,
}: {
  x?: number | string;
  y?: number | string;
  payload?: { value?: number | string };
  tickFormatter?: (value: number, index: number) => string;
  index?: number;
  fontSize?: number;
  axisWidth?: number;
}) {
  const xNum = Number(x);
  const yNum = Number(y);
  if (!Number.isFinite(xNum) || !Number.isFinite(yNum) || payload?.value == null) {
    return null;
  }
  const numeric = Number(payload.value);
  const label = tickFormatter ? tickFormatter(numeric, index) : String(payload.value);

  return createElement(
    "text",
    {
      x: xNum + axisWidth - chartYAxis.tickInset,
      y: yNum,
      dy: 4,
      textAnchor: "end",
      fill: chartAxis.tick,
      fontSize,
    },
    label,
  );
}
