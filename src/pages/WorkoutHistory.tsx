import { useCallback, useEffect, useMemo, useState } from "react";
import { useWorkoutHistory } from "@/hooks/useWorkouts";
import { useCardioHistory } from "@/hooks/useCardioSessions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, TrendingDown,
  Activity, Weight, Layers, Trophy, Star, Timer, Route,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartAxis, chartYAxis, ChartYAxisTick } from "@/lib/chart-colors";
import {
  format, startOfWeek, startOfDay, addDays, subDays, addWeeks, subWeeks,
  startOfMonth, subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { type ActividadWithDetails } from "@/types/workout";
import { computeCardioSessionMetrics, type CardioSesionWithDetails } from "@/lib/cardioSessionDisplay";
import { MuscleRankingWidget } from "@/components/dashboard/MuscleRankingWidget";
import { TrainingLoadWidget } from "@/components/dashboard/TrainingLoadWidget";
import { ExerciseProgressWidget } from "@/components/dashboard/ExerciseProgressWidget";
import {
  ChartScrubStat,
  ChartScrubSummary,
  ChartScrubSync,
  CHART_SCRUB_CURSOR,
  CHART_SCRUB_TOOLTIP_WRAPPER,
} from "@/components/dashboard/chartScrub";
import { PAGE_CARD, PAGE_CARD_STACK_GAP, PAGE_STACK_INSET, PROGRESS_CARD_HEADER } from "@/lib/pageStyles";
import { useMountAfterPaint } from "@/hooks/useMountAfterPaint";
import { cn } from "@/lib/utils";
import {
  AnimatedTabsList,
  pillTabsListClass,
  pillTabsTriggerClass,
  Tabs,
  TabsTrigger,
} from "@/components/ui/tabs";

type PeriodKey = "7d" | "4w" | "3m" | "6m";

const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "7d", label: "7 días" },
  { key: "4w", label: "4 sem." },
  { key: "3m", label: "3 meses" },
  { key: "6m", label: "6 meses" },
];

const CHART_HEIGHT = 190;
const Y_TICK_COUNT = 5;
/** Una etiqueta más que el 1RM del dashboard (6). */
const X_MAX_LABELS = 7;

function getEvenXTickNames(names: readonly string[], maxTicks = X_MAX_LABELS): string[] {
  if (names.length === 0) return [];
  if (names.length <= maxTicks) return [...names];
  const last = names.length - 1;
  const ticks: string[] = [];
  const seen = new Set<number>();
  for (let i = 0; i < maxTicks; i++) {
    const idx = Math.round((i * last) / (maxTicks - 1));
    if (seen.has(idx)) continue;
    seen.add(idx);
    ticks.push(names[idx]);
  }
  return ticks;
}

type ChartPoint = {
  name: string;
  date: string;
  gym: number;
  cardio: number;
  workouts: number;
  volume: number;
};

/** El techo del eje coincide con el pico: la línea llega a la guía superior. */
function getProgressChartYScale(
  maxValue: number,
  tickCount = Y_TICK_COUNT,
): { domain: [number, number]; ticks: number[] } {
  const max = Math.max(0, maxValue);
  const divisions = Math.max(1, tickCount - 1);

  if (max <= 0) {
    const ticks = Array.from({ length: tickCount }, (_, i) => i);
    return { domain: [0, divisions], ticks };
  }

  const intMax = Math.ceil(max);
  if (intMax <= divisions && Math.abs(max - intMax) < 1e-9) {
    const ticks = Array.from({ length: intMax + 1 }, (_, i) => i);
    return { domain: [0, intMax], ticks };
  }

  const ticks = Array.from({ length: tickCount }, (_, i) => (max * i) / divisions);
  return { domain: [0, max], ticks };
}

function formatYTick(value: number): string {
  return Math.round(Number(value)).toLocaleString("es-ES");
}

const Y_AXIS_WIDE_EXTRA_PX = 5;

function yAxisWidthForTicks(dataKey: "workouts" | "volume", ticks: readonly number[]): number {
  if (dataKey !== "volume") return chartYAxis.width;
  const wide = ticks.some((tick) => Math.round(Math.abs(tick)).toString().length >= 5);
  return wide ? chartYAxis.width + Y_AXIS_WIDE_EXTRA_PX : chartYAxis.width;
}

function inRange(fecha: string, start: Date, end: Date) {
  const d = new Date(fecha);
  return d >= start && d < end;
}

function calcGymMetrics(workouts: ActividadWithDetails[], start: Date, end: Date) {
  let volume = 0;
  let durationSec = 0;
  let sets = 0;
  let sessions = 0;
  for (const w of workouts) {
    if (!inRange(w.fecha, start, end)) continue;
    sessions++;
    for (const ej of w.ejercicios) {
      for (const s of ej.series) {
        sets++;
        const dur = Number(s.duracion_seg ?? 0);
        const kgReps = s.repeticiones * Number(s.peso_kg);
        if (dur > 0 && kgReps === 0) {
          durationSec += dur;
        } else {
          volume += kgReps;
        }
      }
    }
  }
  return { volume, durationSec, sets, sessions };
}

function calcCardioMetrics(sessions: CardioSesionWithDetails[], start: Date, end: Date) {
  let distanceM = 0;
  let durationSec = 0;
  let count = 0;
  for (const s of sessions) {
    if (!inRange(s.fecha_inicio, start, end)) continue;
    count++;
    const m = computeCardioSessionMetrics(s);
    distanceM += m.distanceM;
    durationSec += m.durationSec;
  }
  return { distanceM, durationSec, sessions: count };
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function formatVolume(volume: number) {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}t`;
  return `${Math.round(volume)} kg`;
}

function formatDistance(m: number) {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

function formatDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function periodBounds(now: Date, key: PeriodKey) {
  if (key === "7d") {
    const start = startOfDay(subDays(now, 6));
    const end = addDays(startOfDay(now), 1);
    const prevStart = startOfDay(subDays(start, 7));
    return { start, end, prevStart, prevEnd: start };
  }
  if (key === "4w") {
    const start = startOfWeek(subWeeks(now, 3), { weekStartsOn: 1 });
    const end = addWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1);
    const prevStart = startOfWeek(subWeeks(now, 7), { weekStartsOn: 1 });
    return { start, end, prevStart, prevEnd: start };
  }
  if (key === "3m") {
    const start = startOfMonth(subMonths(now, 2));
    const end = addDays(startOfDay(now), 1);
    const prevStart = startOfMonth(subMonths(now, 5));
    return { start, end, prevStart, prevEnd: start };
  }
  const start = startOfMonth(subMonths(now, 5));
  const end = addDays(startOfDay(now), 1);
  const prevStart = startOfMonth(subMonths(now, 11));
  return { start, end, prevStart, prevEnd: start };
}

type Bucket = { name: string; start: Date; end: Date };

function periodBuckets(now: Date, key: PeriodKey): Bucket[] {
  if (key === "7d") {
    const buckets: Bucket[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = startOfDay(subDays(now, i));
      buckets.push({
        name: format(start, "EEE", { locale: es }),
        start,
        end: addDays(start, 1),
      });
    }
    return buckets;
  }
  const weekCount = key === "4w" ? 4 : key === "3m" ? 13 : 26;
  const buckets: Bucket[] = [];
  for (let i = weekCount - 1; i >= 0; i--) {
    const start = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    buckets.push({
      name: format(start, "d MMM", { locale: es }),
      start,
      end: addWeeks(start, 1),
    });
  }
  return buckets;
}

function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-muted-foreground">sin datos prev.</span>;
  const positive = pct >= 0;
  return (
    <Badge variant="secondary" className={`gap-0.5 text-xs ${positive ? "text-emerald-500" : "text-rose-500"}`}>
      {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {positive ? "+" : ""}{pct}%
    </Badge>
  );
}

function ProgressXTick({
  x,
  y,
  payload,
  index = 0,
  visibleTicksCount = 0,
}: {
  x?: string | number;
  y?: string | number;
  payload?: { value?: string };
  index?: number;
  visibleTicksCount?: number;
}) {
  const xNum = typeof x === "number" ? x : Number(x);
  const yNum = typeof y === "number" ? y : Number(y);
  if (!Number.isFinite(xNum) || !Number.isFinite(yNum) || payload?.value == null) return null;

  const isFirst = index === 0;
  const isLast = visibleTicksCount > 1 && index === visibleTicksCount - 1;

  return (
    <text
      x={xNum}
      y={yNum + 12}
      textAnchor={isFirst ? "start" : isLast ? "end" : "middle"}
      fill={chartAxis.tick}
      fontSize={11}
    >
      {payload.value}
    </text>
  );
}

function ProgressAreaChart({
  data,
  dataKey,
  yScale,
  xTicks,
  lastIndex,
  displayPoint,
  onPoint,
  gradientId,
}: {
  data: ChartPoint[];
  dataKey: "workouts" | "volume";
  yScale: { domain: [number, number]; ticks: number[] };
  xTicks: string[];
  lastIndex: number | undefined;
  displayPoint: ChartPoint | null;
  onPoint: (point: ChartPoint | undefined) => void;
  gradientId: string;
}) {
  const yAxisWidth = yAxisWidthForTicks(dataKey, yScale.ticks);

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <AreaChart data={data} margin={{ top: 12, right: chartYAxis.marginRight, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke={chartAxis.grid}
          strokeOpacity={chartAxis.gridOpacity}
          vertical={false}
          horizontal
          horizontalValues={yScale.ticks}
        />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tickMargin={4}
          tick={(props) => <ProgressXTick {...props} visibleTicksCount={xTicks.length} />}
          padding={{ left: 0, right: 0 }}
          ticks={xTicks}
          interval={0}
        />
        <YAxis
          type="number"
          orientation={chartYAxis.orientation}
          width={yAxisWidth}
          domain={yScale.domain}
          ticks={yScale.ticks}
          interval={0}
          allowDecimals={yScale.ticks.some((tick) => !Number.isInteger(tick))}
          axisLine={false}
          tickLine={false}
          tickMargin={0}
          tick={<ChartYAxisTick axisWidth={yAxisWidth} />}
          tickFormatter={formatYTick}
        />
        <Tooltip
          active
          defaultIndex={lastIndex}
          cursor={false}
          isAnimationActive={false}
          wrapperStyle={CHART_SCRUB_TOOLTIP_WRAPPER}
          content={<ChartScrubSync onPoint={onPoint} />}
        />
        <Area
          type="linear"
          dataKey={dataKey}
          isAnimationActive={false}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{
            r: 4,
            fill: "hsl(var(--primary))",
            strokeWidth: 2,
            stroke: "hsl(var(--background))",
            clipDot: false,
          }}
          activeDot={{ r: 5, fill: "hsl(var(--primary))", clipDot: false }}
        />
        {displayPoint && (
          <ReferenceLine
            x={displayPoint.name}
            stroke={CHART_SCRUB_CURSOR.stroke}
            strokeWidth={CHART_SCRUB_CURSOR.strokeWidth}
            strokeOpacity={CHART_SCRUB_CURSOR.strokeOpacity}
            ifOverflow="visible"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

const WorkoutHistory = () => {
  const { data: workouts, isPending: loadingGym } = useWorkoutHistory();
  const { data: cardio, isPending: loadingCardio } = useCardioHistory();
  const [period, setPeriod] = useState<PeriodKey>("4w");
  const now = useMemo(() => new Date(), []);
  const isLoading = loadingGym || loadingCardio;
  const showPanelWidgets = useMountAfterPaint();

  const bounds = useMemo(() => periodBounds(now, period), [now, period]);
  const buckets = useMemo(() => periodBuckets(now, period), [now, period]);

  const gymCurr = useMemo(
    () => calcGymMetrics(workouts ?? [], bounds.start, bounds.end),
    [workouts, bounds],
  );
  const gymPrev = useMemo(
    () => calcGymMetrics(workouts ?? [], bounds.prevStart, bounds.prevEnd),
    [workouts, bounds],
  );
  const cardioCurr = useMemo(
    () => calcCardioMetrics(cardio ?? [], bounds.start, bounds.end),
    [cardio, bounds],
  );
  const cardioPrev = useMemo(
    () => calcCardioMetrics(cardio ?? [], bounds.prevStart, bounds.prevEnd),
    [cardio, bounds],
  );

  const sessionsCurr = gymCurr.sessions + cardioCurr.sessions;
  const sessionsPrev = gymPrev.sessions + cardioPrev.sessions;

  const chartData = useMemo(() => {
    const gymList = workouts ?? [];
    const cardioList = cardio ?? [];
    return buckets.map((b) => {
      const gymIn = gymList.filter((a) => inRange(a.fecha, b.start, b.end));
      const cardioIn = cardioList.filter((s) => inRange(s.fecha_inicio, b.start, b.end));
      const gymMetrics = calcGymMetrics(gymIn, b.start, b.end);
      return {
        name: b.name,
        date: format(b.start, "yyyy-MM-dd"),
        gym: gymIn.length,
        cardio: cardioIn.length,
        workouts: gymIn.length + cardioIn.length,
        volume: gymMetrics.volume,
      };
    });
  }, [buckets, workouts, cardio]);

  const lastIndex = chartData.length > 0 ? chartData.length - 1 : undefined;
  const lastPoint = chartData[chartData.length - 1] ?? null;
  const [consistencyScrub, setConsistencyScrub] = useState<ChartPoint | null>(null);
  const [volumeScrub, setVolumeScrub] = useState<ChartPoint | null>(null);
  const handleConsistencyScrub = useCallback((point: ChartPoint | undefined) => {
    setConsistencyScrub(point ?? null);
  }, []);
  const handleVolumeScrub = useCallback((point: ChartPoint | undefined) => {
    setVolumeScrub(point ?? null);
  }, []);

  useEffect(() => {
    setConsistencyScrub(null);
    setVolumeScrub(null);
  }, [period]);

  const consistencyPoint = consistencyScrub ?? lastPoint;
  const volumePoint = volumeScrub ?? lastPoint;
  const consistencyYScale = useMemo(() => {
    let max = 0;
    for (const row of chartData) max = Math.max(max, row.workouts);
    return getProgressChartYScale(max);
  }, [chartData]);
  const volumeYScale = useMemo(() => {
    let max = 0;
    for (const row of chartData) max = Math.max(max, row.volume);
    return getProgressChartYScale(max);
  }, [chartData]);
  const xTicks = useMemo(
    () => getEvenXTickNames(chartData.map((row) => row.name)),
    [chartData],
  );

  const topExercises = useMemo(() => {
    if (!workouts) return [];
    const counts: Record<string, { name: string; count: number }> = {};
    for (const w of workouts) {
      if (!inRange(w.fecha, bounds.start, bounds.end)) continue;
      for (const ej of w.ejercicios) {
        const id = ej.tipo_ejercicio_id;
        if (!counts[id]) counts[id] = { name: ej.tipo_ejercicio.nombre, count: 0 };
        counts[id].count++;
      }
    }
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [workouts, bounds]);

  const topLoads = useMemo(() => {
    if (!workouts) return [];
    const maxes: Record<string, { name: string; max: number }> = {};
    for (const w of workouts) {
      if (!inRange(w.fecha, bounds.start, bounds.end)) continue;
      for (const ej of w.ejercicios) {
        const id = ej.tipo_ejercicio_id;
        for (const s of ej.series) {
          const kg = Number(s.peso_kg);
          if (!maxes[id] || kg > maxes[id].max) {
            maxes[id] = { name: ej.tipo_ejercicio.nombre, max: kg };
          }
        }
      }
    }
    return Object.values(maxes).sort((a, b) => b.max - a.max).slice(0, 5);
  }, [workouts, bounds]);

  const kpiCards = [
    {
      label: "Sesiones",
      value: String(sessionsCurr),
      sub: `${gymCurr.sessions} gym · ${cardioCurr.sessions} cardio`,
      pct: pctChange(sessionsCurr, sessionsPrev),
      icon: Activity,
    },
    {
      label: "Volumen de fuerza",
      value: formatVolume(gymCurr.volume),
      sub: gymCurr.durationSec > 0 ? `Tiempo: ${formatDuration(gymCurr.durationSec)}` : undefined,
      pct: pctChange(gymCurr.volume, gymPrev.volume),
      icon: Weight,
    },
    {
      label: cardioCurr.distanceM > 0 ? "Distancia cardio" : "Tiempo cardio",
      value: cardioCurr.distanceM > 0 ? formatDistance(cardioCurr.distanceM) : formatDuration(cardioCurr.durationSec),
      sub: cardioCurr.distanceM > 0 && cardioCurr.durationSec > 0
        ? formatDuration(cardioCurr.durationSec)
        : undefined,
      pct: pctChange(
        cardioCurr.distanceM > 0 ? cardioCurr.distanceM : cardioCurr.durationSec,
        cardioPrev.distanceM > 0 || cardioCurr.distanceM > 0 ? cardioPrev.distanceM : cardioPrev.durationSec,
      ),
      icon: cardioCurr.distanceM > 0 ? Route : Timer,
    },
    {
      label: "Series",
      value: String(gymCurr.sets),
      sub: undefined,
      pct: pctChange(gymCurr.sets, gymPrev.sets),
      icon: Layers,
    },
  ];

  const cardClass = PAGE_CARD;

  const hasAnySession = (workouts?.length ?? 0) > 0 || (cardio?.length ?? 0) > 0;

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col bg-background max-md:-mb-24 max-md:pb-24 md:mx-auto md:max-w-2xl md:bg-transparent md:px-8 md:pt-3">
      <div className={cn("flex w-full flex-col bg-background md:bg-transparent", PAGE_CARD_STACK_GAP, PAGE_STACK_INSET)}>
      <div className={cn("flex w-full flex-col", PAGE_CARD_STACK_GAP)}>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodKey)} className="w-full">
          <AnimatedTabsList value={period} className={cn(pillTabsListClass, "w-full")}>
            {PERIOD_OPTIONS.map((opt) => (
              <TabsTrigger
                key={opt.key}
                value={opt.key}
                className={cn(pillTabsTriggerClass, "min-w-0 flex-1")}
              >
                {opt.label}
              </TabsTrigger>
            ))}
          </AnimatedTabsList>
        </Tabs>
        <div className={cn("grid grid-cols-2", PAGE_CARD_STACK_GAP)}>
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className={cardClass}>
                <CardContent className="space-y-1 p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-inset ring-primary/15">
                      <Icon className="size-4 text-primary" />
                    </div>
                    {isLoading ? (
                      <Skeleton className="h-6 w-16" />
                    ) : (
                      <p className="text-xl font-bold leading-none">{kpi.value}</p>
                    )}
                  </div>
                  <p className="text-xs font-semibold">{kpi.label}</p>
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    {isLoading ? (
                      <Skeleton className="h-2.5 w-20" />
                    ) : kpi.sub ? (
                      <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                    ) : (
                      <span />
                    )}
                    {isLoading ? <Skeleton className="h-5 w-12 rounded-full" /> : <ChangeBadge pct={kpi.pct} />}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {!isLoading && !hasAnySession && (
        <Card className={cardClass}>
          <CardContent className="px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Aún no hay sesiones. Cuando entrenes, aquí verás el detalle de tu progreso.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className={cardClass}>
        <CardHeader className={PROGRESS_CARD_HEADER}>
          <CardTitle asChild className="text-base">
            <h2>Constancia</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pt-0">
          {isLoading ? (
            <div className="space-y-3 py-2" aria-busy="true" aria-label="Cargando gráfico">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <div className="flex gap-7">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
              <Skeleton className="h-44 w-full rounded-none md:rounded-lg" />
            </div>
          ) : (
            <>
              {consistencyPoint && (
                <ChartScrubSummary date={consistencyPoint.date}>
                  <ChartScrubStat
                    label="Sesiones"
                    value={`${consistencyPoint.workouts}`}
                    color="hsl(var(--primary))"
                  />
                  <ChartScrubStat label="Gym" value={`${consistencyPoint.gym}`} />
                  <ChartScrubStat label="Cardio" value={`${consistencyPoint.cardio}`} />
                </ChartScrubSummary>
              )}
              <ProgressAreaChart
                data={chartData}
                dataKey="workouts"
                yScale={consistencyYScale}
                xTicks={xTicks}
                lastIndex={lastIndex}
                displayPoint={consistencyPoint}
                onPoint={handleConsistencyScrub}
                gradientId="weeklyConsistencyGradient"
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader className={PROGRESS_CARD_HEADER}>
          <CardTitle asChild className="text-base">
            <h2>Volumen de fuerza</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pt-0">
          {isLoading ? (
            <div className="space-y-3 py-2" aria-busy="true" aria-label="Cargando gráfico">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-28" />
              </div>
              <Skeleton className="h-44 w-full rounded-none md:rounded-lg" />
            </div>
          ) : (
            <>
              {volumePoint && (
                <ChartScrubSummary date={volumePoint.date}>
                  <ChartScrubStat
                    label="Volumen"
                    value={formatVolume(volumePoint.volume)}
                    color="hsl(var(--primary))"
                  />
                </ChartScrubSummary>
              )}
              <ProgressAreaChart
                data={chartData}
                dataKey="volume"
                yScale={volumeYScale}
                xTicks={xTicks}
                lastIndex={lastIndex}
                displayPoint={volumePoint}
                onPoint={handleVolumeScrub}
                gradientId="volumeGradient"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/*
        * Estos tres widgets son la parte más cara de Progreso (cada uno con su
        * propia gráfica y sus propias queries). Montarlos en el mismo commit que
        * el resto bloqueaba el hilo ~1s al entrar en la pestaña, sin que nada se
        * moviese en pantalla. Van bajo el pliegue, así que se montan tras el
        * primer pintado.
        */}
      {showPanelWidgets && (
        <>
          <TrainingLoadWidget flushHeader />
          <ExerciseProgressWidget flushHeader />
          <MuscleRankingWidget />
        </>
      )}

      {!isLoading && (topExercises.length > 0 || topLoads.length > 0) && (
        <div className={cn("grid w-full grid-cols-1 bg-background md:grid-cols-2", PAGE_CARD_STACK_GAP, PAGE_STACK_INSET)}>
          {topExercises.length > 0 && (
            <Card className={cardClass}>
              <CardHeader className={PROGRESS_CARD_HEADER}>
                <CardTitle className="flex items-center gap-1.5 text-base">
                  <Star className="h-4 w-4 text-primary" /> Top ejercicios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 px-6 pt-0">
                {topExercises.map((ex, i) => (
                  <div key={ex.name} className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">
                      <span className="font-medium text-foreground mr-1.5">{i + 1}.</span>
                      {ex.name}
                    </span>
                    <Badge variant="secondary" className="shrink-0 ml-2">{ex.count}×</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {topLoads.length > 0 && (
            <Card className={cardClass}>
              <CardHeader className={PROGRESS_CARD_HEADER}>
                <CardTitle className="flex items-center gap-1.5 text-base">
                  <Trophy className="h-4 w-4 text-primary" /> Cargas máximas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 px-6 pt-0">
                {topLoads.map((ex, i) => (
                  <div key={ex.name} className="flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">
                      <span className="font-medium text-foreground mr-1.5">{i + 1}.</span>
                      {ex.name}
                    </span>
                    <Badge variant="secondary" className="shrink-0 ml-2">{ex.max} kg</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default WorkoutHistory;

