import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  exerciseHistoryQueryOptions,
  useExerciseWithHistory,
  useExerciseHistory,
  type ExerciseProgressMetric,
} from "@/hooks/useExerciseProgress";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  usePlotArea,
  useXAxisScale,
  XAxis,
  YAxis,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { addDays, format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

/**
 * ── Medidas del gráfico de Fuerza Máxima ──────────────────────────────────────
 * Tocá solo este bloque para ajustar espaciados y tamaños.
 */
const CHART = {
  /** Altura total del ResponsiveContainer (px). */
  height: 190,

  /** Margen interno del AreaChart. `left` negativo acerca el área al borde. */
  margin: { top: 5, right: 5, left: -8, bottom: 0 },

  /** Eje Y: ancho reservado para los números (px). */
  yAxisWidth: 36,

  /** Eje Y: cantidad de marcas (ticks). */
  yTickCount: 5,

  /** Eje X: máximo de etiquetas de fecha. */
  xMaxLabels: 6,

  /**
   * Eje X — padding de las etiquetas (custom; no mueve línea/puntos).
   * - left: espacio extra de la 1.ª etiqueta hacia la derecha.
   * - top: separación entre el área del gráfico y las fechas.
   * Nativo equivalente: `padding.left` (mueve el área) y `tickMargin` (si ticks nativos).
   */
  xLabelPad: { left: 22, top: 24 },

  /** Eje X: padding nativo de la escala a la derecha (sí desplaza un poco el área). */
  xScalePadRight: 12,

  /** Tamaño de fuente de ticks/etiquetas (px). */
  tickFontSize: 11,

  /** Grosor de la línea del área. */
  strokeWidth: 2,

  /** Radio del punto en cada entrenamiento. */
  dotRadius: 4,

  /** Radio del punto activo (hover). */
  activeDotRadius: 5,

  /** Con un solo registro, días a izquierda/derecha para dibujar el trazo. */
  singlePointDaySpan: 5,

  /** Umbral de swipe horizontal entre ejercicios (px). */
  swipeThreshold: 50,
} as const;

const X_AXIS_HEIGHT = Math.ceil(CHART.xLabelPad.top + CHART.tickFontSize);

function formatWeight(value: number) {
  const n = Number(value);
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

/** Valor del eje Y: siempre entero para no gastar espacio. */
function formatProgressValue(value: number) {
  return Math.round(Math.max(0, Number(value))).toString();
}

function formatRealSet(weight: number, reps: number) {
  if (Number(weight) <= 0) return `${reps} reps · peso corporal`;
  return `${formatWeight(weight)}kg × ${reps} reps`;
}

function getNiceStep(range: number) {
  if (range <= 10) return 1;
  if (range <= 30) return 5;
  if (range <= 80) return 10;
  if (range <= 200) return 25;
  return 50;
}

function getUniformYScale(history: { oneRepMax: number }[], tickCount = CHART.yTickCount) {
  if (!history.length) {
    const ticks = [0, 10, 20, 30, 40];
    return { domain: [ticks[0], ticks[ticks.length - 1]] as [number, number], ticks };
  }

  const values = history.map((d) => d.oneRepMax);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const rawRange = Math.max(1, max - min);
  const step = getNiceStep(rawRange);
  const minDomain = Math.max(0, Math.floor((min - step) / step) * step);
  let maxDomain = Math.ceil((max + step) / step) * step;
  const divisions = tickCount - 1;
  const tickStep = Math.max(1, Math.ceil((maxDomain - minDomain) / divisions));
  maxDomain = minDomain + tickStep * divisions;

  const ticks = Array.from({ length: tickCount }, (_, i) => minDomain + i * tickStep);
  return { domain: [minDomain, maxDomain] as [number, number], ticks };
}

/** Hasta `maxTicks` posiciones equiespaciadas en el eje X (índices numéricos). */
function getEvenXTicks(pointCount: number, maxTicks = CHART.xMaxLabels): number[] {
  if (pointCount <= 0) return [];
  if (pointCount === 1) return [0];
  const tickCount = Math.min(pointCount, maxTicks);
  const last = pointCount - 1;
  return Array.from({ length: tickCount }, (_, i) => (i * last) / (tickCount - 1));
}

interface ChartHistoryPoint {
  x: number;
  date: string;
  oneRepMax: number;
  weight: number;
  reps: number;
  tooltipDate?: string;
}

/** Etiquetas del eje X: padding izquierdo + misma distancia entre todas; no mueve el área del gráfico. */
function EqualSpacedXLabels({
  chartData,
  xTicks,
}: {
  chartData: ChartHistoryPoint[];
  xTicks: number[];
}) {
  const scale = useXAxisScale();
  const plotArea = usePlotArea();

  if (!scale || !plotArea || xTicks.length === 0) return null;

  const xStart = Number(scale(xTicks[0]));
  const xEnd = Number(scale(xTicks[xTicks.length - 1]));
  if (!Number.isFinite(xStart) || !Number.isFinite(xEnd)) return null;

  const left = xStart + CHART.xLabelPad.left;
  const right = xEnd;
  const y = plotArea.y + plotArea.height;

  return (
    <g className="recharts-equal-x-labels">
      {xTicks.map((tick, i) => {
        const point = chartData[Math.round(tick)];
        if (!point) return null;
        const x =
          xTicks.length === 1
            ? (left + right) / 2
            : left + (i * (right - left)) / (xTicks.length - 1);
        return (
          <text
            key={`${tick}-${i}`}
            x={x}
            y={y}
            dy={CHART.xLabelPad.top}
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize={CHART.tickFontSize}
          >
            {format(new Date(point.date), "d MMM", { locale: es })}
          </text>
        );
      })}
    </g>
  );
}

export function ExerciseProgressWidget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: exercises, isLoading: loadingExercises } = useExerciseWithHistory();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedExercise = exercises?.[selectedIndex];
  const { data: historyData } = useExerciseHistory(selectedExercise?.id);

  useEffect(() => {
    if (!user?.id || !exercises?.length) return;
    exercises.forEach((ex) => {
      void queryClient.prefetchQuery(exerciseHistoryQueryOptions(user.id, ex.id));
    });
  }, [exercises, queryClient, user?.id]);
  const history = historyData?.history;
  const lastRecord = historyData?.lastRecord;
  const metric: ExerciseProgressMetric = historyData?.metric ?? "1rm";
  const yScale = useMemo(() => getUniformYScale(history ?? []), [history]);

  /** Un solo punto no dibuja trazo en Area; duplicamos en el eje X (misma Y) y guardamos la fecha real para el tooltip. */
  const chartData = useMemo<ChartHistoryPoint[]>(() => {
    if (!history?.length) return [];
    if (history.length === 1) {
      const p = history[0];
      const d = new Date(p.date);
      return [
        { ...p, x: 0, date: format(subDays(d, CHART.singlePointDaySpan), "yyyy-MM-dd"), tooltipDate: p.date },
        { ...p, x: 1, date: format(addDays(d, CHART.singlePointDaySpan), "yyyy-MM-dd"), tooltipDate: p.date },
      ];
    }
    return history.map((row, i) => ({ ...row, x: i, tooltipDate: row.date }));
  }, [history]);

  const xTicks = useMemo(() => getEvenXTicks(chartData.length), [chartData.length]);

  // Swipe handling
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const [swiping, setSwiping] = useState(false);

  const goNext = useCallback(() => {
    if (exercises && selectedIndex < exercises.length - 1) {
      setSelectedIndex((i) => i + 1);
    }
  }, [exercises, selectedIndex]);

  const goPrev = useCallback(() => {
    if (selectedIndex > 0) {
      setSelectedIndex((i) => i - 1);
    }
  }, [selectedIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setSwiping(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (touchDeltaX.current < -CHART.swipeThreshold) goNext();
    else if (touchDeltaX.current > CHART.swipeThreshold) goPrev();
    touchDeltaX.current = 0;
    setSwiping(false);
  };

  if (loadingExercises) {
    return (
      <Card className="w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20">
        <CardHeader className="px-6 pt-8 pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="px-6 pt-0">
          <Skeleton className="h-44 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!exercises?.length) return null;

  const canGoPrev = selectedIndex > 0;
  const canGoNext = selectedIndex < exercises.length - 1;

  return (
    <Card className="w-full min-w-0 overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20">
      <CardHeader className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <CardTitle asChild className="text-base font-bold">
              <h2>Fuerza Máxima</h2>
            </CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Qué es la fuerza máxima"
                  className="touch-styled h-6 w-6 rounded-full transition-none hover:bg-transparent focus:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 active:scale-100"
                >
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 text-sm" side="bottom" align="start">
                {metric === "reps" ? (
                  <>
                    <p className="font-semibold mb-1">¿Qué es el máximo de reps?</p>
                    <p className="text-muted-foreground mb-3">
                      En ejercicios a peso corporal (0 kg) medimos el progreso por tu{" "}
                      <strong>mejor serie del día en repeticiones</strong>, sin estimar 1RM.
                    </p>
                    {lastRecord ? (
                      <div className="space-y-1 rounded-md bg-muted p-2.5 text-xs">
                        <p className="font-medium">Tu mejor serie registrada:</p>
                        <p className="text-muted-foreground">{formatRealSet(lastRecord.weight, lastRecord.reps)}</p>
                        <p className="text-primary font-semibold">
                          Máximo: {formatProgressValue(lastRecord.oneRepMax)} reps
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 rounded-md bg-muted p-2.5 text-xs">
                        <p className="text-muted-foreground">
                          Aquí verás tu máximo de reps cuando registres el primer entrenamiento.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-semibold mb-1">¿Qué es el 1RM Estimado?</p>
                    <p className="text-muted-foreground mb-3">
                      Es el peso máximo teórico que podrías levantar a una sola repetición.
                      El cálculo toma automáticamente tu <strong>mejor serie efectiva del día</strong>, ignorando calentamientos o series de fatiga.
                    </p>
                    {lastRecord ? (
                      <div className="space-y-1 rounded-md bg-muted p-2.5 text-xs">
                        <p className="font-medium">Tu mejor serie registrada:</p>
                        <p className="text-muted-foreground">{formatRealSet(lastRecord.weight, lastRecord.reps)}</p>
                        <p className="text-primary font-semibold">Tu 1RM teórico es: {formatProgressValue(lastRecord.oneRepMax)}kg</p>
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                          {Number(lastRecord.weight).toFixed(2)} × (1 + 0.0333 × {lastRecord.reps})
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 rounded-md bg-muted p-2.5 text-xs">
                        <p className="text-muted-foreground">Aquí verás el cálculo cuando registres tu primer entrenamiento.</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">
                          Peso × (1 + 0.0333 × Reps)
                        </p>
                      </div>
                    )}
                  </>
                )}
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              className="rounded-md p-1 text-foreground/75 transition-colors hover:bg-muted/70 hover:text-foreground disabled:pointer-events-none disabled:opacity-25"
              aria-label="Ejercicio anterior"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
            <span className="min-w-10 text-center tabular-nums">
              {selectedIndex + 1}/{exercises.length}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className="rounded-md p-1 text-foreground/75 transition-colors hover:bg-muted/70 hover:text-foreground disabled:pointer-events-none disabled:opacity-25"
              aria-label="Siguiente ejercicio"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 px-6 pt-0">
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="touch-pan-y"
        >
          {historyData === undefined ? (
            <div className="h-44 py-2" aria-hidden />
          ) : !history || history.length === 0 ? (
            <div className="py-2">
              <div className="flex items-center justify-center h-44 text-sm text-muted-foreground text-center px-4">
                Sigue entrenando para ver tu progreso 💪
              </div>
            </div>
          ) : (
            <div className="py-2">
              <ResponsiveContainer width="100%" height={CHART.height}>
                <AreaChart data={chartData} margin={{ ...CHART.margin }}>
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.45}
                    vertical={false}
                    horizontal
                  />
                  <XAxis
                    type="number"
                    dataKey="x"
                    domain={[0, Math.max(0, chartData.length - 1)]}
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                    height={X_AXIS_HEIGHT}
                    ticks={xTicks}
                    padding={{ left: 0, right: CHART.xScalePadRight }}
                  />
                  <YAxis
                    width={CHART.yAxisWidth}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: CHART.tickFontSize }}
                    domain={yScale.domain}
                    ticks={yScale.ticks}
                    interval={0}
                    tickFormatter={(v) => formatProgressValue(v as number)}
                  />
                  <Tooltip content={(props) => <CustomTooltip {...props} metric={metric} />} />
                  <Area
                    type="monotone"
                    dataKey="oneRepMax"
                    isAnimationActive={false}
                    stroke="hsl(var(--primary))"
                    strokeWidth={CHART.strokeWidth}
                    fill="url(#progressGradient)"
                    dot={{
                      r: CHART.dotRadius,
                      fill: "hsl(var(--primary))",
                      strokeWidth: CHART.strokeWidth,
                      stroke: "hsl(var(--background))",
                    }}
                    activeDot={{ r: CHART.activeDotRadius, fill: "hsl(var(--primary))" }}
                  />
                  <EqualSpacedXLabels chartData={chartData} xTicks={xTicks} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* w-0 min-w-full: el select no puede ensanchar al padre con nombres largos */}
        <div className="mt-3 w-0 min-w-full max-w-full overflow-hidden">
          <Select
            value={selectedExercise?.id}
            onValueChange={(val) => {
              const idx = exercises.findIndex((e) => e.id === val);
              if (idx >= 0) setSelectedIndex(idx);
            }}
          >
            <SelectTrigger
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-10 w-full max-w-full justify-between gap-2 overflow-hidden text-left [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate",
              )}
            >
              <SelectValue placeholder="Ejercicio" />
            </SelectTrigger>
            <SelectContent className="w-(--radix-select-trigger-width) max-w-(--radix-select-trigger-width)">
              {exercises.map((ex) => (
                <SelectItem key={ex.id} value={ex.id} className="whitespace-normal wrap-break-word">
                  {ex.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({
  active,
  payload,
  metric,
}: TooltipContentProps<ValueType, NameType> & { metric: ExerciseProgressMetric }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload as ChartHistoryPoint;
  const when = data.tooltipDate ?? data.date;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md text-popover-foreground">
      <p className="font-medium">
        {format(new Date(when), "d MMM yyyy", { locale: es })}
      </p>
      {metric === "reps" ? (
        <p className="text-primary font-semibold">{formatProgressValue(data.oneRepMax)} reps</p>
      ) : (
        <p className="text-primary font-semibold">1RM: {formatProgressValue(data.oneRepMax)} kg</p>
      )}
      <p className="text-muted-foreground">Real: {formatRealSet(data.weight, data.reps)}</p>
    </div>
  );
}
