import { useMemo, useState } from "react";
import { useWorkoutHistory } from "@/hooks/useWorkouts";
import { useCardioHistory } from "@/hooks/useCardioSessions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, TrendingDown,
  Activity, Weight, Layers, Trophy, Star, Timer, Route,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { chartYAxis, ChartYAxisTick } from "@/lib/chart-colors";
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
import { PAGE_CARD_STACK_GAP } from "@/lib/pageStyles";
import { cn } from "@/lib/utils";
import {
  AnimatedTabsList,
  pillTabsListClass,
  pillTabsTriggerClass,
  Tabs,
  TabsTrigger,
} from "@/components/ui/tabs";

type PeriodKey = "7d" | "4w" | "3m";

const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "7d", label: "7 días" },
  { key: "4w", label: "4 sem." },
  { key: "3m", label: "3 meses" },
];

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
  const start = startOfMonth(subMonths(now, 2));
  const end = addDays(startOfDay(now), 1);
  const prevStart = startOfMonth(subMonths(now, 5));
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
  const weekCount = key === "4w" ? 4 : 13;
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
  if (pct === null) return <span className="text-[10px] text-muted-foreground">sin datos prev.</span>;
  const positive = pct >= 0;
  return (
    <Badge variant="secondary" className={`text-[10px] gap-0.5 ${positive ? "text-emerald-500" : "text-rose-500"}`}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? "+" : ""}{pct}%
    </Badge>
  );
}

const WorkoutHistory = () => {
  const { data: workouts, isLoading: loadingGym } = useWorkoutHistory();
  const { data: cardio, isLoading: loadingCardio } = useCardioHistory();
  const [period, setPeriod] = useState<PeriodKey>("4w");
  const now = useMemo(() => new Date(), []);
  const isLoading = loadingGym || loadingCardio;

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
        gym: gymIn.length,
        cardio: cardioIn.length,
        workouts: gymIn.length + cardioIn.length,
        volume: gymMetrics.volume,
      };
    });
  }, [buckets, workouts, cardio]);

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

  const cardClass =
    "w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20";

  const hasAnySession = (workouts?.length ?? 0) > 0 || (cardio?.length ?? 0) > 0;

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col bg-card max-md:-mb-24 max-md:pb-24 md:mx-auto md:max-w-2xl md:bg-transparent md:px-8 md:pt-3">
      <div className={cn("flex w-full flex-col bg-background md:bg-transparent", PAGE_CARD_STACK_GAP)}>
      <Card className={cardClass}>
        <CardHeader className="px-6 pt-8 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle asChild className="text-base">
              <h2>Resumen</h2>
            </CardTitle>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodKey)}>
              <AnimatedTabsList value={period} className={cn(pillTabsListClass, "w-full sm:w-auto")}>
                {PERIOD_OPTIONS.map((opt) => (
                  <TabsTrigger key={opt.key} value={opt.key} className={pillTabsTriggerClass}>
                    {opt.label}
                  </TabsTrigger>
                ))}
              </AnimatedTabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-0">
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon;
              const cellBorder =
                i === 0
                  ? "border-r border-b border-black/5 dark:border-white/10"
                  : i === 1
                    ? "border-b border-black/5 dark:border-white/10"
                    : i === 2
                      ? "border-r border-black/5 dark:border-white/10"
                      : "";
              return (
                <div key={kpi.label} className={`space-y-1 px-6 py-8 ${cellBorder}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xl font-bold leading-none">{isLoading ? "–" : kpi.value}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
                      {kpi.sub && !isLoading && (
                        <p className="text-[10px] text-muted-foreground/80 mt-0.5">{kpi.sub}</p>
                      )}
                    </div>
                    {!isLoading && <ChangeBadge pct={kpi.pct} />}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
        <CardHeader className="px-6 pt-8 pb-4">
          <CardTitle asChild className="text-base">
            <h2>Constancia</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pt-0">
          {isLoading ? (
            <div className="py-2">
              <Skeleton className="h-44 w-full rounded-none md:rounded-lg" />
            </div>
          ) : (
            <div className="py-2">
              <ResponsiveContainer width="100%" height={176}>
                <AreaChart data={chartData} margin={{ top: 5, right: chartYAxis.marginRight, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weeklyConsistencyGradient" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis
                    orientation={chartYAxis.orientation}
                    width={chartYAxis.width}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={0}
                    tick={<ChartYAxisTick />}
                    interval={0}
                  />
                  <Tooltip content={ConsistencyTooltip} />
                  <Area
                    type="linear"
                    dataKey="workouts"
                    isAnimationActive={false}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#weeklyConsistencyGradient)"
                    dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                    activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader className="px-6 pt-8 pb-4">
          <CardTitle asChild className="text-base">
            <h2>Volumen de fuerza</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pt-0">
          {isLoading ? (
            <div className="py-2">
              <Skeleton className="h-44 w-full rounded-none md:rounded-lg" />
            </div>
          ) : (
            <div className="py-2">
              <ResponsiveContainer width="100%" height={176}>
                <AreaChart data={chartData} margin={{ top: 5, right: chartYAxis.marginRight, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis
                    orientation={chartYAxis.orientation}
                    width={chartYAxis.width}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={0}
                    tick={<ChartYAxisTick />}
                  />
                  <Tooltip content={VolumeTooltip} />
                  <Area
                    type="linear"
                    dataKey="volume"
                    isAnimationActive={false}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#volumeGradient)"
                    dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                    activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <TrainingLoadWidget />
      <ExerciseProgressWidget />
      <MuscleRankingWidget />

      {!isLoading && (topExercises.length > 0 || topLoads.length > 0) && (
        <div className={cn("grid w-full grid-cols-1 bg-background md:grid-cols-2", PAGE_CARD_STACK_GAP)}>
          {topExercises.length > 0 && (
            <Card className={cardClass}>
              <CardHeader className="px-6 pt-8 pb-4">
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
              <CardHeader className="px-6 pt-8 pb-4">
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

function ConsistencyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: readonly {
    payload?: {
      name?: string;
      workouts?: number;
      gym?: number;
      cardio?: number;
    };
  }[];
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md text-popover-foreground">
      <p className="font-medium">{data.name}</p>
      <p className="text-primary font-semibold">
        {data.workouts} sesión{data.workouts === 1 ? "" : "es"}
      </p>
      <p className="text-muted-foreground">
        {data.gym ?? 0} gym · {data.cardio ?? 0} cardio
      </p>
    </div>
  );
}

function VolumeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: readonly {
    payload?: {
      name?: string;
      volume?: number;
    };
  }[];
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md text-popover-foreground">
      <p className="font-medium">{data.name}</p>
      <p className="text-primary font-semibold">{formatVolume(data.volume ?? 0)}</p>
    </div>
  );
}
