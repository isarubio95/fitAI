import { useState, useMemo } from "react";
import { useWorkoutHistory } from "@/hooks/useWorkouts";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Calendar, Dumbbell, Hash, Pencil, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, startOfWeek, subWeeks, isAfter, isBefore, addWeeks, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

const INITIAL_SHOW = 5;

const chartConfig = {
  workouts: {
    label: "Entrenamientos",
    color: "hsl(var(--primary))",
  },
};

const WorkoutHistory = () => {
  const { data: workouts, isLoading } = useWorkoutHistory();
  const { openEdit } = useGlobalWorkoutDrawer();
  const [showAll, setShowAll] = useState(false);

  // KPI: total workouts
  const totalWorkouts = workouts?.length ?? 0;

  // KPI: workouts this month
  const workoutsThisMonth = useMemo(() => {
    if (!workouts) return 0;
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    return workouts.filter((w) => {
      const d = new Date(w.fecha);
      return !isBefore(d, monthStart) && !isAfter(d, monthEnd);
    }).length;
  }, [workouts]);

  // Chart: workouts per week for last 4 weeks
  const weeklyData = useMemo(() => {
    if (!workouts) return [];
    const now = new Date();
    const weeks: { label: string; start: Date; end: Date }[] = [];
    for (let i = 3; i >= 0; i--) {
      const ws = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const we = addWeeks(ws, 1);
      weeks.push({
        label: format(ws, "d MMM", { locale: es }),
        start: ws,
        end: we,
      });
    }
    return weeks.map((w) => ({
      name: w.label,
      workouts: workouts.filter((a) => {
        const d = new Date(a.fecha);
        return !isBefore(d, w.start) && isBefore(d, w.end);
      }).length,
    }));
  }, [workouts]);

  const visibleWorkouts = showAll ? workouts : workouts?.slice(0, INITIAL_SHOW);
  const hasMore = (workouts?.length ?? 0) > INITIAL_SHOW;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold">Progreso</h1>
        <p className="text-sm text-muted-foreground">Tu rendimiento y estadísticas</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{isLoading ? "–" : totalWorkouts}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total entrenamientos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{isLoading ? "–" : workoutsThisMonth}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Este mes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Consistency Chart */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold mb-3">Constancia semanal</h2>
          {isLoading ? (
            <Skeleton className="h-[180px] rounded-lg" />
          ) : (
            <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
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

      {/* Recent History */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Historial Reciente</h2>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !workouts?.length ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Aún no tienes entrenamientos registrados.
          </p>
        ) : (
          <>
            <Accordion type="single" collapsible className="space-y-2">
              {visibleWorkouts?.map((w) => {
                const totalSets = w.ejercicios.reduce((a, ej) => a + ej.series.length, 0);
                return (
                  <AccordionItem key={w.id} value={w.id} className="border rounded-xl px-4">
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
                                .map((s) => (
                                  <p key={s.id} className="text-xs text-muted-foreground pl-3">
                                    Serie {s.numero_serie}: {s.repeticiones} reps × {s.peso_kg} kg
                                  </p>
                                ))}
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
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowAll(true)}>
                Ver anteriores ({(workouts?.length ?? 0) - INITIAL_SHOW} más)
              </Button>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default WorkoutHistory;
