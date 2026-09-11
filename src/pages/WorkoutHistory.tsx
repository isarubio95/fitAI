import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useWorkoutHistory } from "@/hooks/useWorkouts";
import { useCardioHistory } from "@/hooks/useCardioSessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy } from "lucide-react";
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
import { chartAxis, chartDiarySeries, chartYAxis, ChartYAxisTick } from "@/lib/chart-colors";
import {
  format, startOfWeek, startOfDay, addDays, subDays, addWeeks, subWeeks,
  startOfMonth, subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { type ActividadWithDetails } from "@/types/workout";
import { computeCardioSessionMetrics, type CardioSesionWithDetails } from "@/lib/cardioSessionDisplay";
import { MuscleRankingWidget } from "@/components/dashboard/MuscleRankingWidget";
import { ExerciseProgressWidget } from "@/components/dashboard/ExerciseProgressWidget";
import {
  ChartScrubStat,
  ChartScrubSummary,
  ChartScrubSync,
  CHART_SCRUB_CURSOR,
  CHART_SCRUB_TOOLTIP_WRAPPER,
} from "@/components/dashboard/chartScrub";
import {
  PAGE_CARD,
  PAGE_CARD_STACK_GAP,
  PAGE_STACK_INSET,
  PROGRESS_CARD_HEADER,
  PROGRESS_CHART_HEIGHT,
  YOU_PROGRESS_PAGE,
  YOU_PROGRESS_STACK,
} from "@/lib/pageStyles";
import { YouProgressAboveFoldSkeleton } from "@/components/layout/YouProgressSkeleton";
import { useMountAfterPaint } from "@/hooks/useMountAfterPaint";
import { cn } from "@/lib/utils";
import {
  AnimatedTabsList,
  pillTabsListClass,
  pillTabsTriggerClass,
  Tabs,
  TabsTrigger,
} from "@/components/ui/tabs";
import { buildProgressVerdict, volumeDeltaCopy } from "@/lib/progressVerdict";
import {
  parseYouProgressPeriod,
  YOU_PROGRESS_PERIODS,
  youProgressPeriodMeta,
  type YouProgressPeriod,
} from "@/lib/youProgressPeriod";

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
  const base = chartYAxis.width;
  const wide = ticks.some((tick) => Math.round(Math.abs(tick)).toString().length >= 5);
  return dataKey === "volume" && wide ? base + Y_AXIS_WIDE_EXTRA_PX : base;
}

function inRange(fecha: string, start: Date, end: Date) {
  const d = new Date(fecha);
  return d >= start && d < end;
}

function calcGymMetrics(workouts: ActividadWithDetails[], start: Date, end: Date) {
  let sessions = 0;
  let volume = 0;
  let sets = 0;
  let durationSec = 0;
  for (const w of workouts) {
    if (!inRange(w.fecha, start, end)) continue;
    sessions += 1;
    for (const ej of w.ejercicios) {
      for (const s of ej.series) {
        sets += 1;
        const dur = Number(s.duracion_seg ?? 0);
        const kgReps = s.repeticiones * Number(s.peso_kg);
        if (Number.isFinite(kgReps)) volume += kgReps;
        if (Number.isFinite(dur) && dur > 0) durationSec += dur;
      }
    }
  }
  return { sessions, volume, sets, durationSec };
}

function calcCardioMetrics(sessions: CardioSesionWithDetails[], start: Date, end: Date) {
  let count = 0;
  let distanceM = 0;
  let durationSec = 0;
  for (const s of sessions) {
    if (!inRange(s.fecha_inicio, start, end)) continue;
    count += 1;
    const m = computeCardioSessionMetrics(s);
    if (m.distanceM != null) distanceM += m.distanceM;
    if (m.movingDurationSec != null) durationSec += m.movingDurationSec;
  }
  return { sessions: count, distanceM, durationSec };
}

function formatVolume(volume: number) {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}t`;
  return `${Math.round(volume)} kg`;
}

function periodBounds(now: Date, key: YouProgressPeriod) {
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

function periodBuckets(now: Date, key: YouProgressPeriod): Bucket[] {
  if (key === "7d") {
    const buckets: Bucket[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = startOfDay(subDays(now, i));
      buckets.push({
        name: format(start, "EEE d", { locale: es }),
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
      fontSize={12}
    >
      {payload.value}
    </text>
  );
}

function ProgressChartFrame({
  data,
  yScale,
  xTicks,
  lastIndex,
  displayPoint,
  onPoint,
  yAxisWidth,
  children,
}: {
  data: ChartPoint[];
  yScale: { domain: [number, number]; ticks: number[] };
  xTicks: string[];
  lastIndex: number | undefined;
  displayPoint: ChartPoint | null;
  onPoint: (point: ChartPoint | undefined) => void;
  yAxisWidth: number;
  children: ReactNode;
}) {
  return (
    <ResponsiveContainer width="100%" height={PROGRESS_CHART_HEIGHT}>
      <AreaChart data={data} margin={{ top: 12, right: chartYAxis.marginRight, left: 0, bottom: 0 }}>
        {children}
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
          tick={<ChartYAxisTick axisWidth={yAxisWidth} fontSize={12} />}
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

function ProgressHybridChart({
  data,
  yScale,
  xTicks,
  lastIndex,
  displayPoint,
  onPoint,
}: {
  data: ChartPoint[];
  yScale: { domain: [number, number]; ticks: number[] };
  xTicks: string[];
  lastIndex: number | undefined;
  displayPoint: ChartPoint | null;
  onPoint: (point: ChartPoint | undefined) => void;
}) {
  const yAxisWidth = yAxisWidthForTicks("workouts", yScale.ticks);

  return (
    <ProgressChartFrame
      data={data}
      yScale={yScale}
      xTicks={xTicks}
      lastIndex={lastIndex}
      displayPoint={displayPoint}
      onPoint={onPoint}
      yAxisWidth={yAxisWidth}
    >
      <defs>
        <linearGradient id="progressGymGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={chartDiarySeries.gym} stopOpacity={0.32} />
          <stop offset="95%" stopColor={chartDiarySeries.gym} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="progressCardioGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={chartDiarySeries.cardio} stopOpacity={0.28} />
          <stop offset="95%" stopColor={chartDiarySeries.cardio} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area
        type="linear"
        dataKey="gym"
        stackId="sessions"
        isAnimationActive={false}
        stroke={chartDiarySeries.gym}
        strokeWidth={2}
        fill="url(#progressGymGradient)"
        dot={{
          r: 4,
          fill: chartDiarySeries.gym,
          strokeWidth: 2,
          stroke: "hsl(var(--background))",
          clipDot: false,
        }}
        activeDot={{ r: 5, fill: chartDiarySeries.gym, clipDot: false }}
      />
      <Area
        type="linear"
        dataKey="cardio"
        stackId="sessions"
        isAnimationActive={false}
        stroke={chartDiarySeries.cardio}
        strokeWidth={2}
        fill="url(#progressCardioGradient)"
        dot={{
          r: 4,
          fill: chartDiarySeries.cardio,
          strokeWidth: 2,
          stroke: "hsl(var(--background))",
          clipDot: false,
        }}
        activeDot={{ r: 5, fill: chartDiarySeries.cardio, clipDot: false }}
      />
    </ProgressChartFrame>
  );
}

function ProgressVolumeChart({
  data,
  yScale,
  xTicks,
  lastIndex,
  displayPoint,
  onPoint,
}: {
  data: ChartPoint[];
  yScale: { domain: [number, number]; ticks: number[] };
  xTicks: string[];
  lastIndex: number | undefined;
  displayPoint: ChartPoint | null;
  onPoint: (point: ChartPoint | undefined) => void;
}) {
  const yAxisWidth = yAxisWidthForTicks("volume", yScale.ticks);

  return (
    <ProgressChartFrame
      data={data}
      yScale={yScale}
      xTicks={xTicks}
      lastIndex={lastIndex}
      displayPoint={displayPoint}
      onPoint={onPoint}
      yAxisWidth={yAxisWidth}
    >
      <defs>
        <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={chartDiarySeries.gym} stopOpacity={0.3} />
          <stop offset="95%" stopColor={chartDiarySeries.gym} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area
        type="linear"
        dataKey="volume"
        isAnimationActive={false}
        stroke={chartDiarySeries.gym}
        strokeWidth={2}
        fill="url(#volumeGradient)"
        dot={{
          r: 4,
          fill: chartDiarySeries.gym,
          strokeWidth: 2,
          stroke: "hsl(var(--background))",
          clipDot: false,
        }}
        activeDot={{ r: 5, fill: chartDiarySeries.gym, clipDot: false }}
      />
    </ProgressChartFrame>
  );
}

const WorkoutHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPeriod = searchParams.get("period");
  const period = parseYouProgressPeriod(rawPeriod);
  const periodMeta = youProgressPeriodMeta(period);
  const { data: workouts, isPending: loadingGym } = useWorkoutHistory();
  const { data: cardio, isPending: loadingCardio } = useCardioHistory();
  const now = useMemo(() => new Date(), []);
  const isLoading = loadingGym || loadingCardio;
  const showPanelWidgets = useMountAfterPaint();

  useEffect(() => {
    if (rawPeriod === period) return;
    const next = new URLSearchParams(searchParams);
    next.set("period", period);
    setSearchParams(next, { replace: true });
  }, [period, rawPeriod, searchParams, setSearchParams]);

  const setPeriod = (nextPeriod: YouProgressPeriod) => {
    if (nextPeriod === rawPeriod) return;
    const next = new URLSearchParams(searchParams);
    next.set("period", nextPeriod);
    setSearchParams(next, { replace: true });
  };

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
  const verdict = useMemo(
    () =>
      buildProgressVerdict({
        period,
        sessionsCurr,
        sessionsPrev,
        gymCurr: gymCurr.sessions,
        cardioCurr: cardioCurr.sessions,
        volumeCurr: gymCurr.volume,
        volumePrev: gymPrev.volume,
      }),
    [cardioCurr.sessions, gymCurr.sessions, gymCurr.volume, gymPrev.volume, period, sessionsCurr, sessionsPrev],
  );
  const volumeDelta = volumeDeltaCopy(gymCurr.volume, gymPrev.volume);

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

  const cardClass = PAGE_CARD;
  const hasAnySession = (workouts?.length ?? 0) > 0 || (cardio?.length ?? 0) > 0;

  return (
    <div className={YOU_PROGRESS_PAGE}>
      <div className={YOU_PROGRESS_STACK} aria-busy={isLoading}>
        {isLoading ? (
          <YouProgressAboveFoldSkeleton />
        ) : (
          <>
            <div className="flex w-full flex-col gap-3 md:gap-3.5">
              <Tabs value={period} onValueChange={(v) => setPeriod(v as YouProgressPeriod)} className="w-full">
                <AnimatedTabsList value={period} className={cn(pillTabsListClass, "w-full")}>
                  {YOU_PROGRESS_PERIODS.map((opt) => (
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
              <div className="space-y-1.5 px-1">
                <h2 className="text-2xl font-semibold tracking-tight text-balance">
                  {verdict.headline}
                </h2>
                {verdict.detail ? (
                  <p className="text-sm text-muted-foreground">{verdict.detail}</p>
                ) : null}
              </div>
            </div>

            {hasAnySession && (
              <>
                <Card className={cardClass}>
                  <CardHeader className={PROGRESS_CARD_HEADER}>
                    <CardTitle asChild className="text-base">
                      <h3>Constancia</h3>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pt-0">
                    {consistencyPoint && (
                      <ChartScrubSummary date={consistencyPoint.date}>
                        <ChartScrubStat
                          label="Gym"
                          value={`${consistencyPoint.gym}`}
                          color={chartDiarySeries.gym}
                        />
                        <ChartScrubStat
                          label="Cardio"
                          value={`${consistencyPoint.cardio}`}
                          color={chartDiarySeries.cardio}
                        />
                        <ChartScrubStat
                          label="Sesiones"
                          value={`${consistencyPoint.workouts}`}
                        />
                      </ChartScrubSummary>
                    )}
                    <ProgressHybridChart
                      data={chartData}
                      yScale={consistencyYScale}
                      xTicks={xTicks}
                      lastIndex={lastIndex}
                      displayPoint={consistencyPoint}
                      onPoint={handleConsistencyScrub}
                    />
                  </CardContent>
                </Card>

                <Card className={cardClass}>
                  <CardHeader className={PROGRESS_CARD_HEADER}>
                    <CardTitle asChild className="text-base">
                      <h3>Volumen de fuerza</h3>
                    </CardTitle>
                    {volumeDelta ? (
                      <p className="text-xs font-normal text-muted-foreground">{volumeDelta}</p>
                    ) : null}
                  </CardHeader>
                  <CardContent className="px-5 pt-0">
                    {volumePoint && (
                      <ChartScrubSummary date={volumePoint.date}>
                        <ChartScrubStat
                          label="Volumen"
                          value={formatVolume(volumePoint.volume)}
                          color={chartDiarySeries.gym}
                        />
                      </ChartScrubSummary>
                    )}
                    <ProgressVolumeChart
                      data={chartData}
                      yScale={volumeYScale}
                      xTicks={xTicks}
                      lastIndex={lastIndex}
                      displayPoint={volumePoint}
                      onPoint={handleVolumeScrub}
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {showPanelWidgets && (
          <>
            <ExerciseProgressWidget flushHeader clockLabel="últimos 12 meses" />
            <MuscleRankingWidget
              clockLabel={periodMeta.clockLabel}
              range={{ start: bounds.start, end: bounds.end }}
            />
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
                  <p className="text-xs font-normal text-muted-foreground">{periodMeta.clockLabel}</p>
                </CardHeader>
                <CardContent className="space-y-1.5 px-5 pt-0">
                  {topExercises.map((ex, i) => (
                    <div key={ex.name} className="flex items-center justify-between text-sm">
                      <span className="truncate text-muted-foreground">
                        <span className="mr-1.5 font-medium text-foreground">{i + 1}.</span>
                        {ex.name}
                      </span>
                      <Badge variant="secondary" className="ml-2 shrink-0">{ex.count}×</Badge>
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
                  <p className="text-xs font-normal text-muted-foreground">{periodMeta.clockLabel}</p>
                </CardHeader>
                <CardContent className="space-y-1.5 px-5 pt-0">
                  {topLoads.map((ex, i) => (
                    <div key={ex.name} className="flex items-center justify-between text-sm">
                      <span className="truncate text-muted-foreground">
                        <span className="mr-1.5 font-medium text-foreground">{i + 1}.</span>
                        {ex.name}
                      </span>
                      <Badge variant="secondary" className="ml-2 shrink-0">{ex.max} kg</Badge>
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
