import { useState, useMemo } from "react";
import { useWorkoutHistory } from "@/hooks/useWorkouts";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Calendar, Dumbbell, Hash, Pencil, TrendingUp, TrendingDown,
  Activity, Weight, Layers, Trophy, Star,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  format, startOfWeek, subWeeks, isAfter, isBefore, addWeeks,
  startOfMonth, endOfMonth, subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { type ActividadWithDetails, normalizeRegistroSeries, formatRitmoSegKmLabel } from "@/types/workout";
import { MuscleRankingWidget } from "@/components/dashboard/MuscleRankingWidget";

const INITIAL_SHOW = 5;

const chartConfig = {
  workouts: {
    label: "Entrenamientos",
    color: "hsl(var(--primary))",
  },
};

// ── helpers ──────────────────────────────────────────────
function inRange(fecha: string, start: Date, end: Date) {
  const d = new Date(fecha);
  return !isBefore(d, start) && isBefore(d, end);
}

function calcMetrics(workouts: ActividadWithDetails[], start: Date, end: Date) {
  let volume = 0;
  let durationSec = 0;
  let sets = 0;
  for (const w of workouts) {
    if (!inRange(w.fecha, start, end)) continue;
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
  return { volume, durationSec, sets };
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

// ── Change badge ─────────────────────────────────────────
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

// ── Main component ───────────────────────────────────────
const WorkoutHistory = () => {
  const { data: workouts, isLoading } = useWorkoutHistory();
  const { openEdit } = useGlobalWorkoutDrawer();
  const [showAll, setShowAll] = useState(false);

  const now = useMemo(() => new Date(), []);

  // ── Week ranges ──
  const thisWeekStart = useMemo(() => startOfWeek(now, { weekStartsOn: 1 }), [now]);
  const thisWeekEnd = useMemo(() => addWeeks(thisWeekStart, 1), [thisWeekStart]);
  const prevWeekStart = useMemo(() => subWeeks(thisWeekStart, 1), [thisWeekStart]);

  // ── Month ranges ──
  const thisMonthStart = useMemo(() => startOfMonth(now), [now]);
  const thisMonthEnd = useMemo(() => addWeeks(endOfMonth(now), 0), [now]); // endOfMonth is inclusive
  const prevMonthStart = useMemo(() => startOfMonth(subMonths(now, 1)), [now]);
  const prevMonthEnd = useMemo(() => startOfMonth(now), [now]);

  // ── Metrics ──
  const weekCurr = useMemo(
    () => (workouts ? calcMetrics(workouts, thisWeekStart, thisWeekEnd) : { volume: 0, durationSec: 0, sets: 0 }),
    [workouts, thisWeekStart, thisWeekEnd]
  );
  const weekPrev = useMemo(
      () => (workouts ? calcMetrics(workouts, prevWeekStart, thisWeekStart) : { volume: 0, durationSec: 0, sets: 0 }),
      [workouts, prevWeekStart, thisWeekStart]
    );
  const monthCurr = useMemo(
      () => (workouts ? calcMetrics(workouts, thisMonthStart, thisMonthEnd) : { volume: 0, durationSec: 0, sets: 0 }),
      [workouts, thisMonthStart, thisMonthEnd]
    );
  const monthPrev = useMemo(
      () => (workouts ? calcMetrics(workouts, prevMonthStart, prevMonthEnd) : { volume: 0, durationSec: 0, sets: 0 }),
      [workouts, prevMonthStart, prevMonthEnd]
    );

  // ── Weekly bar chart (last 4 weeks) ──
  const weeklyData = useMemo(() => {
    if (!workouts) return [];
    const weeks: { label: string; start: Date; end: Date }[] = [];
    for (let i = 3; i >= 0; i--) {
      const ws = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const we = addWeeks(ws, 1);
      weeks.push({ label: format(ws, "d MMM", { locale: es }), start: ws, end: we });
    }
    return weeks.map((w) => ({
      name: w.label,
      workouts: workouts.filter((a) => inRange(a.fecha, w.start, w.end)).length,
    }));
  }, [workouts, now]);

  // ── Top 5 most performed exercises ──
  const topExercises = useMemo(() => {
    if (!workouts) return [];
    const counts: Record<string, { name: string; count: number }> = {};
    for (const w of workouts) {
      for (const ej of w.ejercicios) {
        const id = ej.tipo_ejercicio_id;
        if (!counts[id]) counts[id] = { name: ej.tipo_ejercicio.nombre, count: 0 };
        counts[id].count++;
      }
    }
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [workouts]);

  // ── Top 5 max loads ──
  const topLoads = useMemo(() => {
    if (!workouts) return [];
    const maxes: Record<string, { name: string; max: number }> = {};
    for (const w of workouts) {
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
  }, [workouts]);

  const visibleWorkouts = showAll ? workouts : workouts?.slice(0, INITIAL_SHOW);
  const hasMore = (workouts?.length ?? 0) > INITIAL_SHOW;

  const kpiCards = [
    {
      label: "Volumen semanal",
      value: `${(weekCurr.volume / 1000).toFixed(1)}t`,
      sub: weekCurr.durationSec > 0 ? `Tiempo: ${Math.round(weekCurr.durationSec / 60)} min` : undefined,
      pct: pctChange(weekCurr.volume, weekPrev.volume),
      icon: Weight,
    },
    { label: "Series semanales", value: weekCurr.sets, sub: undefined, pct: pctChange(weekCurr.sets, weekPrev.sets), icon: Layers },
    {
      label: "Volumen mensual",
      value: `${(monthCurr.volume / 1000).toFixed(1)}t`,
      sub: monthCurr.durationSec > 0 ? `Tiempo: ${Math.round(monthCurr.durationSec / 60)} min` : undefined,
      pct: pctChange(monthCurr.volume, monthPrev.volume),
      icon: TrendingUp,
    },
    { label: "Series mensuales", value: monthCurr.sets, sub: undefined, pct: pctChange(monthCurr.sets, monthPrev.sets), icon: Activity },
  ];

  return (
    <div className="w-full min-w-0 pb-28 pt-6 md:mx-auto md:max-w-2xl md:px-8">
      <div className="space-y-3">
      {/* ── KPI Grid (sin gap ni fondo de card; solo líneas divisorias) ── */}
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

      {/* ── Weekly Consistency Chart ── */}
      <Card className="w-full rounded-none border-x-0 md:rounded-3xl md:border-x">
        <CardHeader className="px-6 pt-8 pb-4">
          <CardTitle asChild className="text-base">
            <h2>Constancia semanal</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-8 pt-0">
          {isLoading ? (
            <Skeleton className="h-[180px] rounded-none md:rounded-lg" />
          ) : (
            <ChartContainer config={chartConfig} className="aspect-2/1 w-full">
              <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="workouts" fill="var(--color-workouts)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Muscle Ranking ── */}
      <MuscleRankingWidget />

      {/* ── Records & Favorites ── */}
      {!isLoading && (topExercises.length > 0 || topLoads.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topExercises.length > 0 && (
            <Card className="w-full rounded-none border-x-0 md:rounded-3xl md:border-x">
              <CardHeader className="px-6 pt-8 pb-4">
                <CardTitle className="flex items-center gap-1.5 text-base">
                  <Star className="h-4 w-4 text-primary" /> Top ejercicios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 px-6 pb-8 pt-0">
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
            <Card className="w-full rounded-none border-x-0 md:rounded-3xl md:border-x">
              <CardHeader className="px-6 pt-8 pb-4">
                <CardTitle className="flex items-center gap-1.5 text-base">
                  <Trophy className="h-4 w-4 text-primary" /> Cargas máximas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 px-6 pb-8 pt-0">
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

      {/* ── Recent History ── */}
      <section className="space-y-3">
        <h2 className="px-6 text-lg font-semibold md:px-0">Historial Reciente</h2>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-none md:rounded-2xl" />
            ))}
          </div>
        ) : !workouts?.length ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground md:px-0">
            Aún no tienes entrenamientos registrados.
          </p>
        ) : (
          <>
            <Accordion type="single" collapsible className="space-y-2">
              {visibleWorkouts?.map((w) => {
                const totalSets = w.ejercicios.reduce((a, ej) => a + ej.series.length, 0);
                return (
                  <AccordionItem key={w.id} value={w.id} className="rounded-none border border-x-0 px-4 md:rounded-2xl md:border-x">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <article className="flex flex-col items-start text-left gap-1">
                        <h3 className="font-semibold">{w.titulo}</h3>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <time className="flex items-center gap-1" dateTime={w.fecha}>
                            <Calendar className="h-3 w-3" />
                            {format(new Date(w.fecha), "d MMM yyyy", { locale: es })}
                          </time>
                          <span className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" />
                            {w.ejercicios.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {totalSets} series
                          </span>
                        </div>
                      </article>
                    </AccordionTrigger>
                    <AccordionContent>
                      <section className="space-y-3 pb-2">
                        {w.ejercicios.map((ej) => (
                          <div key={ej.id} className="space-y-1">
                            <h4 className="text-sm font-medium">{ej.tipo_ejercicio.nombre}</h4>
                            <div className="space-y-0.5">
                              {ej.series
                                .sort((a, b) => a.numero_serie - b.numero_serie)
                                .map((s) => {
                                  const mode = normalizeRegistroSeries((ej as { registro_series?: string }).registro_series);
                                  const ds = s.duracion_seg;
                                  const pace = (s as { ritmo_seg_km?: number | null }).ritmo_seg_km;
                                  const showPace =
                                    mode === "duracion_ritmo" || ((ds ?? 0) > 0 && (pace ?? 0) > 0);
                                  const txt = showPace
                                    ? `Serie ${s.numero_serie}: ${ds ?? 0} s · ${formatRitmoSegKmLabel(pace ?? null)}`
                                    : mode === "duracion" || (ds != null && ds > 0)
                                      ? `Serie ${s.numero_serie}: ${ds ?? 0} s`
                                      : `Serie ${s.numero_serie}: ${s.repeticiones} reps × ${s.peso_kg} kg`;
                                  return (
                                    <p key={s.id} className="text-xs text-muted-foreground pl-3">
                                      {txt}
                                    </p>
                                  );
                                })}
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => openEdit(w.id)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
                        </Button>
                      </section>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
            {hasMore && !showAll && (
              <Button variant="ghost" size="sm" className="w-full px-6" onClick={() => setShowAll(true)}>
                Ver anteriores ({(workouts?.length ?? 0) - INITIAL_SHOW} más)
              </Button>
            )}
          </>
        )}
      </section>
      </div>
    </div>
  );
};

export default WorkoutHistory;
