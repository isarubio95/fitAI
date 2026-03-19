import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ChartContainer } from "@/components/ui/chart";
import { Check, Trophy } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { MainMuscleGroup } from "@/constants/muscleGroups";
import { MUSCLE_GROUPS } from "@/constants/muscleGroups";
import { useWorkoutById } from "@/hooks/useWorkouts";
import type { EjercicioWithDetails, Serie } from "@/types/workout";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  type TooltipProps,
} from "recharts";

type WorkoutDetailsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutId: string | null;
};

function formatWeight(value: number) {
  const n = Number(value);
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

function isSerieDone(s: Serie) {
  const reps = Number(s.repeticiones);
  const kg = Number(s.peso_kg);
  return !!s.completed || reps > 0 || kg > 0;
}

function estimate1RM(weightKg: number, reps: number) {
  const w = Number(weightKg);
  const r = Number(reps);
  if (!Number.isFinite(w) || !Number.isFinite(r) || w <= 0 || r <= 0) return 0;
  // Aproximación utilizada también en la UI existente (1 + 0.0333 × reps)
  return w * (1 + 0.0333 * r);
}

function getMainGroup(muscle: string): MainMuscleGroup | null {
  for (const [group, muscles] of Object.entries(MUSCLE_GROUPS)) {
    if ((muscles as readonly string[]).includes(muscle)) {
      return group as MainMuscleGroup;
    }
  }
  return null;
}

function getMainGroupsForExercise(ex: EjercicioWithDetails): MainMuscleGroup[] {
  const bodyParts: string[] = ex.tipo_ejercicio.body_part ?? [];
  const groups = new Set<MainMuscleGroup>();
  for (const muscle of bodyParts) {
    const group = getMainGroup(muscle);
    if (group) groups.add(group);
  }
  return [...groups];
}

function buildSupersetGroups(exercises: EjercicioWithDetails[]): {
  supersetId: string | null;
  items: EjercicioWithDetails[];
}[] {
  type EjercicioWithSuperset = EjercicioWithDetails & { superset_id?: string | null };
  const groups: { supersetId: string | null; items: EjercicioWithDetails[] }[] = [];

  exercises.forEach((ex) => {
    const sid = (ex as EjercicioWithSuperset).superset_id ?? null;
    const last = groups[groups.length - 1];
    if (sid && last?.supersetId === sid) {
      last.items.push(ex);
    } else {
      groups.push({ supersetId: sid, items: [ex] });
    }
  });

  return groups;
}

function getNiceRadarMax(max: number) {
  if (!Number.isFinite(max) || max <= 0) return 1;
  if (max < 10) return Math.ceil(max);
  if (max < 100) return Math.ceil(max / 5) * 5;
  if (max < 1000) return Math.ceil(max / 50) * 50;
  return Math.ceil(max / 250) * 250;
}

function RadarWeightTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload as { group?: string; name?: string; weight?: number } | undefined;
  const group = data?.group ?? data?.name;
  const weight = Number(data?.weight ?? payload[0]?.value ?? 0);

  if (!group) return null;

  return (
    <div className="rounded-lg border border-border/50 bg-popover px-3 py-2 text-xs shadow-xl text-popover-foreground">
      <div className="font-semibold">{group}</div>
      <div className="text-muted-foreground">
        {formatWeight(weight)} kg levantados
      </div>
    </div>
  );
}

function SeriesList({
  series,
  bestSerieId,
  bestRm,
}: {
  series: Serie[];
  bestSerieId: string | null;
  bestRm: number;
}) {
  const doneSeries = useMemo(
    () => [...series].filter(isSerieDone).sort((a, b) => a.numero_serie - b.numero_serie),
    [series]
  );

  if (!doneSeries.length) return null;

  return (
    <div className="space-y-1.5 pt-2">
      {doneSeries.map((s) => {
        const done = isSerieDone(s);
        const reps = Number(s.repeticiones);
        const kg = Number(s.peso_kg);
        const isBest = bestSerieId && s.id === bestSerieId;
        return (
          <div key={s.id} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn("text-muted-foreground", done && "text-foreground/80")}>
                Serie {s.numero_serie}
                {done ? <Check className="ml-2 inline h-3.5 w-3.5 text-emerald-500" /> : null}
              </span>

              {isBest && bestRm > 0 ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
                      title="Mayor RM estimada (pulsar para ver explicación)"
                      aria-label="Mayor RM estimada: explicación"
                    >
                      <Trophy className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
                      RM {formatWeight(bestRm)}kg
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-xs">
                    <div className="space-y-2">
                      <div className="font-semibold">¿Qué es la “Mayor RM”?</div>
                      <div className="text-sm text-muted-foreground">
                        Es la 1RM estimada a partir de la mejor serie efectiva del entrenamiento:
                        <div className="mt-1 font-mono text-[12px] text-foreground">
                          peso × (1 + 0.0333 × reps)
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : null}
            </div>

            <span
              className={cn(
                "font-mono tabular-nums",
                done ? "text-foreground" : "text-muted-foreground opacity-70"
              )}
            >
              {`${reps} reps · ${formatWeight(kg)} kg`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ExerciseBlock({
  ex,
  topExerciseId,
  rmByExerciseId,
}: {
  ex: EjercicioWithDetails;
  topExerciseId: string | null;
  rmByExerciseId: Record<string, { rm: number; bestSerieId: string | null }>;
}) {
  const series = ex.series ?? [];
  const doneSeries = series.filter(isSerieDone);
  const doneCount = doneSeries.length;
  const title = ex.tipo_ejercicio.nombre;
  const isTopExercise = topExerciseId === ex.id;
  const best = rmByExerciseId[ex.id];

  return (
    <div className="py-3 px-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{title}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {doneCount} series
          </div>
        </div>
      </div>
      <SeriesList
        series={series}
        bestSerieId={isTopExercise ? best?.bestSerieId ?? null : null}
        bestRm={isTopExercise ? best?.rm ?? 0 : 0}
      />
    </div>
  );
}

export function WorkoutDetailsSheet({ open, onOpenChange, workoutId }: WorkoutDetailsSheetProps) {
  const { data: workout, isLoading } = useWorkoutById(workoutId);

  const groups = useMemo(() => Object.keys(MUSCLE_GROUPS) as MainMuscleGroup[], []);

  const { groupSets, groupWeight, orderedExercises, exerciseGroups, topExerciseId, rmByExerciseId } = useMemo(() => {
    const groupSetsAcc: Record<MainMuscleGroup, number> = Object.fromEntries(
      groups.map((g) => [g, 0])
    ) as Record<MainMuscleGroup, number>;
    const groupWeightAcc: Record<MainMuscleGroup, number> = Object.fromEntries(
      groups.map((g) => [g, 0])
    ) as Record<MainMuscleGroup, number>;

    const rmAcc: Record<string, { rm: number; bestSerieId: string | null }> = {};
    let bestRmTop = 0;
    let topId: string | null = null;

    const exs = workout?.ejercicios ?? [];
    const ordered = [...exs].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (ta !== tb) return ta - tb;
      return a.id.localeCompare(b.id);
    });

    for (const ex of ordered) {
      const series = ex.series ?? [];

      // RM (1RM estimada) para ese ejercicio usando las series realizadas
      const doneSeries = series.filter(isSerieDone);
      let bestRmForExercise = 0;
      let bestSerieIdForExercise: string | null = null;
      for (const s of doneSeries) {
        const reps = Number(s.repeticiones);
        const kg = Number(s.peso_kg);
        const rm = estimate1RM(kg, reps);
        if (rm > bestRmForExercise) {
          bestRmForExercise = rm;
          bestSerieIdForExercise = s.id;
        }
      }

      rmAcc[ex.id] = { rm: bestRmForExercise, bestSerieId: bestSerieIdForExercise };
      if (bestRmForExercise > bestRmTop) {
        bestRmTop = bestRmForExercise;
        topId = ex.id;
      }

      // Agregados por grupo muscular (si el ejercicio tiene mapeo de body parts)
      const mainGroups = getMainGroupsForExercise(ex);
      if (mainGroups.length > 0) {
        for (const s of series) {
          if (!isSerieDone(s)) continue;
          const reps = Number(s.repeticiones);
          const kg = Number(s.peso_kg);
          const weight = reps * kg;
          for (const g of mainGroups) {
            groupSetsAcc[g] += 1;
            groupWeightAcc[g] += weight;
          }
        }
      }
    }

    const groupsBySuperset = buildSupersetGroups(ordered);
    const filteredOrderedExercises =
      ordered.filter((ex) => (ex.series ?? []).some(isSerieDone)) ?? [];

    return {
      groupSets: groupSetsAcc,
      groupWeight: groupWeightAcc,
      orderedExercises: filteredOrderedExercises,
      exerciseGroups: groupsBySuperset,
      topExerciseId: topId,
      rmByExerciseId: rmAcc,
    };
  }, [workout, groups]);

  const visibleGroups = useMemo(
    () => groups.filter((g) => (groupSets[g] ?? 0) > 0 || (groupWeight[g] ?? 0) > 0),
    [groups, groupSets, groupWeight]
  );

  const maxSets = useMemo(
    () => Math.max(1, ...visibleGroups.map((g) => groupSets[g] ?? 0)),
    [visibleGroups, groupSets]
  );

  const maxWeight = useMemo(() => {
    const max = Math.max(0, ...visibleGroups.map((g) => groupWeight[g] ?? 0));
    return getNiceRadarMax(max);
  }, [visibleGroups, groupWeight]);

  const radarData = useMemo(
    () =>
      visibleGroups.map((group) => ({
        group,
        weight: groupWeight[group] ?? 0,
      })),
    [visibleGroups, groupWeight]
  );

  const radarConfig = useMemo(
    () => ({
      weight: { label: "Peso", color: "hsl(var(--primary))" },
    }),
    []
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
      }}
    >
      <SheetContent
        side="right"
          className="w-full sm:max-w-2xl max-w-full overflow-y-auto rounded-l-[20px] p-0 inset-y-auto top-8 bottom-0 h-[calc(100dvh-1.5rem)]"
      >
        <div className="p-6">
          {isLoading || !workout ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-56 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="text-xl">{workout.titulo}</SheetTitle>
                <SheetDescription>
                  {workout.fecha ? format(new Date(workout.fecha), "d MMM yyyy", { locale: es }) : ""}
                </SheetDescription>
              </SheetHeader>

              {workout.comentarios ? (
                <Card className="mb-4">
                  <CardContent className="p-4 text-sm text-muted-foreground whitespace-pre-wrap">
                    {workout.comentarios}
                  </CardContent>
                </Card>
              ) : null}

              <div className="space-y-4">
                {/* Series per group */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="font-semibold">Series por grupo muscular</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        Total: {visibleGroups.reduce((a, g) => a + (groupSets[g] ?? 0), 0)}
                      </div>
                    </div>
                    {visibleGroups.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No hay series completadas para mostrar.</div>
                    ) : (
                      <div className="space-y-3">
                        {visibleGroups.map((g) => {
                        const sets = groupSets[g] ?? 0;
                        const pct = (sets / maxSets) * 100;
                        return (
                          <div key={g} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium truncate">{g}</span>
                              <span className="text-muted-foreground tabular-nums">{sets} series</span>
                            </div>
                            <Progress value={pct} className="h-2.5" />
                          </div>
                        );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Radar chart */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="font-semibold">Peso levantado por grupo muscular</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        Max: {formatWeight(maxWeight)} kg
                      </div>
                    </div>
                    {visibleGroups.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No hay peso levantado para mostrar.</div>
                    ) : (
                      <ChartContainer
                        id="workout-radar-weight"
                        config={radarConfig}
                        className="aspect-square w-full"
                      >
                        <RadarChart
                          data={radarData}
                          outerRadius="85%"
                          margin={{ top: 5, right: 10, bottom: 5, left: 10 }}
                        >
                          <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                          <PolarAngleAxis
                            dataKey="group"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                          />
                          <PolarRadiusAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                            domain={[0, maxWeight]}
                          />
                          <Tooltip content={<RadarWeightTooltip />} />
                          <Radar
                            name="Peso"
                            dataKey="weight"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.12}
                            strokeWidth={2}
                            dot={{
                              r: 3.2,
                              stroke: "hsl(var(--background))",
                              strokeWidth: 2,
                              fill: "hsl(var(--primary))",
                            }}
                            activeDot={{ r: 4.2 }}
                          />
                        </RadarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Chronological exercises w/ supersets */}
                <Card>
                  <CardContent className="p-0">
                    <div className="p-4 pb-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold">Ejercicios realizados</div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {orderedExercises.length} ejercicios
                        </div>
                      </div>
                    </div>
                    {orderedExercises.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground">
                        Aún no hay series completadas para mostrar.
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {exerciseGroups
                          .filter((g) => g.items.some((ex) => (ex.series ?? []).some(isSerieDone)))
                          .map((g, idx) => {
                            const superset = !!g.supersetId && g.items.length > 1;
                            if (superset) {
                              return (
                                <div
                                  key={`${g.supersetId}-${idx}`}
                                  className="relative border-t-0 bg-primary/5 border-border/0"
                                >
                                  <div className="mx-4 mb-0 mt-0 rounded-xl border-2 border-primary/40 bg-primary/5 overflow-hidden">
                                    <div className="px-3 pt-2 pb-1">
                                      <span className="text-xs font-medium text-primary">Superserie</span>
                                    </div>
                                    <div className="divide-y divide-border">
                                      {g.items.map((ex) => {
                                        if (!(ex.series ?? []).some(isSerieDone)) return null;
                                        return (
                                          <ExerciseBlock
                                            key={ex.id}
                                            ex={ex}
                                            topExerciseId={topExerciseId}
                                            rmByExerciseId={rmByExerciseId}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            const ex = g.items[0];
                            if (!ex || !(ex.series ?? []).some(isSerieDone)) return null;
                            return (
                              <div key={ex.id} className="mx-4 my-2 rounded-xl border border-border/40 bg-card">
                                <ExerciseBlock ex={ex} topExerciseId={topExerciseId} rmByExerciseId={rmByExerciseId} />
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

