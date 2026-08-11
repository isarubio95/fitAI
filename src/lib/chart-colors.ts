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
  grid: "hsl(var(--border))",
  surface: "hsl(var(--card))",
} as const;
