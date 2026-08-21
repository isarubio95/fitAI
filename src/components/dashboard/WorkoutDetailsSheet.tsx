import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { Progress } from "@/components/ui/progress";
import { ChartContainer } from "@/components/ui/chart";
import { Check, ListPlus, Trophy } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { MainMuscleGroup } from "@/constants/muscleGroups";
import { MUSCLE_GROUPS, MUSCLE_GROUP_ICON_SRC } from "@/constants/muscleGroups";
import { resolveMainMuscleGroup } from "@/lib/muscleMapping";
import { useWorkoutById } from "@/hooks/useWorkouts";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoutineForm } from "@/components/routine/RoutineForm";
import { actividadToRoutineFormSnapshot } from "@/lib/workoutToRoutine";
import type { RoutineFormSnapshot } from "@/types/routine";
import {
  type ActividadWithDetails,
  type EjercicioWithDetails,
  type Serie,
  normalizeRegistroSeries,
  setHasWork,
  formatRitmoSegKmLabel,
} from "@/types/workout";
import { cn } from "@/lib/utils";
import { PAGE_CARD_STACK_GAP } from "@/lib/pageStyles";
import { resolveRoutineIcon } from "@/lib/routineIcons";
import { WorkoutMuscleMiniMap } from "@/components/dashboard/WorkoutMuscleMiniMap";
import { GymStartMetaRow } from "@/components/dashboard/GymStartMetaRow";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  type BaseTickContentProps,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

type WorkoutDetailsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutId: string | null;
};

const RADAR = {
  /** Centro del radar (porcentaje del contenedor). */
  cx: "50%",
  cy: "50%",

  /** Radio exterior del polígono (porcentaje). */
  outerRadius: "98%",

  /**
   * Relación de aspecto del contenedor (ancho ÷ alto).
   * 1 = cuadrado. Valores >1 (p. ej. 1.2–1.4) recortan el espacio muerto arriba/abajo.
   */
  aspectRatio: 1.05,

  /**
   * Márgenes del RadarChart.
   * - top/bottom fijos: espacio para etiquetas verticales.
   * - laterales: se calculan según la etiqueta más larga (ver `labelSide*`).
   */
  marginY: 12,

  /**
   * Márgenes laterales dinámicos para etiquetas del eje angular.
   * - min/max: límites del margen lateral (px).
   * - charFactor: ancho aproximado por carácter × tickFontSize.
   * - pad: padding extra tras el cálculo.
   */
  labelSideMin: 18,
  labelSideMax: 44,
  labelSideCharFactor: 0.38,
  labelSidePad: 6,

  /** Tamaño de fuente de etiquetas de grupo (PolarAngleAxis). */
  tickFontSize: 11,

  /** Tamaño de fuente de ticks del radio (PolarRadiusAxis). */
  radiusTickFontSize: 10,

  /** Ancho reservado para ticks del radio (px). */
  radiusAxisWidth: 28,

  /** Opacidad de la rejilla polar. */
  gridOpacity: 0.2,

  /** Opacidad del relleno del polígono. */
  fillOpacity: 0.12,

  /** Grosor del trazo del polígono. */
  strokeWidth: 2,

  /** Radio del punto en cada grupo. */
  dotRadius: 3.2,

  /** Grosor del borde del punto. */
  dotStrokeWidth: 2,

  /** Radio del punto activo (hover). */
  activeDotRadius: 4.2,

  /**
   * Ajuste extra solo para etiquetas laterales (no arriba/abajo).
   * - nudgeY: negativo = hacia arriba (px).
   * - nudgeXTowardCenter: desplazamiento horizontal hacia el centro (px).
   */
  sideLabelNudgeY: -16,
  sideLabelNudgeXTowardCenter: 10,

  /**
   * Separación extra de etiquetas verticales (arriba/abajo) hacia afuera (px).
   * Positivo = más lejos del centro.
   */
  verticalLabelNudgeOut: 5,
} as const;

function formatWeight(value: number) {
  const n = Number(value);
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

function isSerieDone(s: Serie) {
  return !!s.completed || setHasWork(s);
}

function countDoneSeries(ejercicios: EjercicioWithDetails[]): number {
  return ejercicios.reduce((acc, ex) => acc + (ex.series ?? []).filter(isSerieDone).length, 0);
}

function estimate1RM(weightKg: number, reps: number) {
  const w = Number(weightKg);
  const r = Number(reps);
  if (!Number.isFinite(w) || !Number.isFinite(r) || w <= 0 || r <= 0) return 0;
  // Aproximación utilizada también en la UI existente (1 + 0.0333 × reps)
  return w * (1 + 0.0333 * r);
}

function getMainGroupsForExercise(ex: EjercicioWithDetails): MainMuscleGroup[] {
  const bodyParts: string[] = ex.tipo_ejercicio?.musculos_involucrados ?? [];
  const groups = new Set<MainMuscleGroup>();
  for (const muscle of bodyParts) {
    const group = resolveMainMuscleGroup(muscle);
    if (group) groups.add(group);
  }
  if (groups.size === 0) {
    const fallback = resolveMainMuscleGroup(ex.tipo_ejercicio?.grupo_muscular ?? null);
    if (fallback) groups.add(fallback);
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

/** Instante aproximado de ejecución: primera serie hecha, o alta del ejercicio. */
function exerciseExecutionTime(ex: EjercicioWithDetails): number {
  const doneTimes = (ex.series ?? [])
    .filter(isSerieDone)
    .map((s) => new Date(s.created_at).getTime())
    .filter((t) => Number.isFinite(t));
  if (doneTimes.length > 0) return Math.min(...doneTimes);
  const t = ex.created_at ? new Date(ex.created_at).getTime() : NaN;
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
}

function compareExercisesByExecutionOrder(a: EjercicioWithDetails, b: EjercicioWithDetails): number {
  const byExec = exerciseExecutionTime(a) - exerciseExecutionTime(b);
  if (byExec !== 0) return byExec;
  const ca = a.created_at ? new Date(a.created_at).getTime() : 0;
  const cb = b.created_at ? new Date(b.created_at).getTime() : 0;
  if (ca !== cb) return ca - cb;
  return a.id.localeCompare(b.id);
}

function getNiceRadarMax(max: number) {
  if (!Number.isFinite(max) || max <= 0) return 1;
  if (max < 10) return Math.ceil(max);
  if (max < 100) return Math.ceil(max / 5) * 5;
  if (max < 1000) return Math.ceil(max / 50) * 50;
  return Math.ceil(max / 250) * 250;
}

function RadarWeightTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
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

/** Tick del eje angular: las etiquetas laterales se acercan al centro y suben. */
function RadarAngleTick(props: BaseTickContentProps) {
  const { payload, x, y, textAnchor, fill } = props;
  const label = payload?.value != null ? String(payload.value) : "";
  if (!label) return null;

  const xNum = Number(x) || 0;
  const yNum = Number(y) || 0;
  // PolarAngleAxis pasa cx/cy en runtime aunque no formen parte del tipo público.
  const polar = props as BaseTickContentProps & { cx?: number | string; cy?: number | string };
  const cx = Number(polar.cx) || 0;
  const cy = Number(polar.cy) || 0;

  // Más horizontal que vertical → etiqueta de lado (izq/der).
  const isSide = Math.abs(xNum - cx) > Math.abs(yNum - cy);
  const dx = isSide
    ? xNum < cx
      ? RADAR.sideLabelNudgeXTowardCenter
      : -RADAR.sideLabelNudgeXTowardCenter
    : 0;
  const dy = isSide
    ? RADAR.sideLabelNudgeY
    : yNum < cy
      ? -RADAR.verticalLabelNudgeOut
      : RADAR.verticalLabelNudgeOut;

  return (
    <text
      x={xNum + dx}
      y={yNum + dy}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fill={fill ?? "hsl(var(--muted-foreground))"}
      fontSize={RADAR.tickFontSize}
    >
      {label}
    </text>
  );
}

function SeriesList({
  series,
  bestSerieId,
  bestRm,
  registroSeries,
}: {
  series: Serie[];
  bestSerieId: string | null;
  bestRm: number;
  registroSeries: ReturnType<typeof normalizeRegistroSeries>;
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
        const ds = s.duracion_seg;
        const pace = s.ritmo_seg_km;
        const isBest = bestSerieId && s.id === bestSerieId;
        const showDurationPace =
          registroSeries === "duracion_ritmo" || ((ds ?? 0) > 0 && (pace ?? 0) > 0);
        const showDurationOnly =
          !showDurationPace && (registroSeries === "duracion" || (ds != null && ds > 0));
        return (
          <div key={s.id} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn("text-muted-foreground", done && "text-foreground/80")}>
                Serie {s.numero_serie}
                {done ? <Check className="ml-2 inline h-3.5 w-3.5 text-emerald-500" /> : null}
              </span>

              {isBest && bestRm > 0 && registroSeries === "peso_reps" ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="touch-styled inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 outline-none focus-visible:outline-none dark:text-emerald-300"
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
              {showDurationPace
                ? `${ds ?? 0} s · ${formatRitmoSegKmLabel(pace ?? null)}`
                : showDurationOnly
                  ? `${ds ?? 0} s`
                  : reps > 0 && kg <= 0
                    ? `${reps} reps · peso corporal`
                    : `${reps} reps · ${formatWeight(kg)} kg`}
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
  const title = ex.tipo_ejercicio?.nombre ?? "Ejercicio";
  const isTopExercise = topExerciseId === ex.id;
  const best = rmByExerciseId[ex.id];
  const registroSeries = normalizeRegistroSeries((ex as { registro_series?: string }).registro_series);

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
        registroSeries={registroSeries}
      />
    </div>
  );
}

export function WorkoutDetailsSheet({ open, onOpenChange, workoutId }: WorkoutDetailsSheetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: workout, isLoading } = useWorkoutById(workoutId);
  const [routineFormOpen, setRoutineFormOpen] = useState(false);
  const [routinePrefill, setRoutinePrefill] = useState<RoutineFormSnapshot | null>(null);

  const isForeign = !!workout && !!user && workout.usuario_id !== user.id;

  const { data: authorUsername } = useQuery({
    queryKey: ["perfil-username", workout?.usuario_id],
    enabled: open && isForeign && !!workout?.usuario_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("perfil")
        .select("username")
        .eq("id", workout!.usuario_id)
        .maybeSingle();
      if (error) throw error;
      return data?.username ?? null;
    },
    staleTime: 60_000,
  });

  const canSaveAsRoutine = useMemo(() => {
    if (!isForeign || !workout) return false;
    return actividadToRoutineFormSnapshot(workout) != null;
  }, [isForeign, workout]);

  const onSaveAsRoutine = () => {
    if (!workout) return;
    const snapshot = actividadToRoutineFormSnapshot(workout, {
      savedFromUsername: authorUsername,
    });
    if (!snapshot) {
      toast({
        title: "No se puede guardar",
        description: "Este entreno no tiene ejercicios del catálogo con series registradas.",
        variant: "destructive",
      });
      return;
    }
    setRoutinePrefill(snapshot);
    setRoutineFormOpen(true);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          side="bottom"
          className="flex h-[92lvh] max-h-[92lvh] flex-col overflow-hidden bg-card p-0"
        >
          <DrawerHeader className="shrink-0 border-b border-border bg-card text-left">
            <DrawerTitle className={isLoading || !workout ? "sr-only" : undefined}>
              {workout?.titulo ?? "Detalle del entrenamiento"}
            </DrawerTitle>
            {isLoading || !workout ? (
              <>
                <Skeleton className="h-5 w-2/3" aria-hidden />
                <Skeleton className="mt-2 h-4 w-1/3" aria-hidden />
              </>
            ) : (
              <DrawerDescription>
                {workout.fecha ? format(new Date(workout.fecha), "d MMM yyyy", { locale: es }) : ""}
                {workout.gimnasio_nombre
                  ? `${workout.fecha ? " · " : ""}${workout.gimnasio_nombre}`
                  : ""}
              </DrawerDescription>
            )}
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto bg-card">
            <WorkoutDetailsContent
              workout={workout}
              isLoading={isLoading}
              hideHeader
              radarChartId={workout?.id ? `workout-radar-weight-${workout.id}` : undefined}
              containerClassName={
                canSaveAsRoutine
                  ? "pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]"
                  : "pb-[calc(5rem+env(safe-area-inset-bottom,0px))]"
              }
            />
          </div>

          {canSaveAsRoutine ? (
            <div className="shrink-0 border-t border-border bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Button type="button" className="w-full" variant="secondary" onClick={onSaveAsRoutine}>
                <ListPlus className="h-4 w-4" />
                Guardar como rutina
              </Button>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>

      <RoutineForm
        open={routineFormOpen}
        onOpenChange={(next) => {
          setRoutineFormOpen(next);
          if (!next) setRoutinePrefill(null);
        }}
        prefillSnapshot={routinePrefill}
      />
    </>
  );
}

export type WorkoutLeadingAvatar = {
  avatarUrl?: string | null;
  username?: string | null;
};

type WorkoutDetailsContentProps = {
  workout: ActividadWithDetails | null;
  isLoading?: boolean;
  radarChartId?: string;
  containerClassName?: string;
  /** Resumen compacto (perfil/comunidad): mapa muscular en lugar de barras. */
  variant?: "full" | "compact";
  /** Oculta título/fecha cuando el drawer ya los muestra en su header. */
  hideHeader?: boolean;
  /** Oculta la fecha en el resumen (p. ej. si ya va en la fila del autor). */
  hideDate?: boolean;
  /** Avatar a la izquierda del título en variante compacta. */
  leadingAvatar?: WorkoutLeadingAvatar;
  /** Icono de rutina a la izquierda del título en variante compacta. */
  leadingRoutineIcon?: string | null;
};

function WorkoutLeadingRoutineIcon({
  iconKey,
  className,
}: {
  iconKey?: string | null;
  className?: string;
}) {
  const Icon = resolveRoutineIcon(iconKey);
  return <Icon className={cn("h-5 w-5 shrink-0 text-primary", className)} strokeWidth={1.75} />;
}

export { WorkoutLeadingRoutineIcon };

function WorkoutLeadingAvatarBadge({ avatar }: { avatar: WorkoutLeadingAvatar }) {
  const resolved = useUserAvatar([avatar.avatarUrl]);
  const initials = avatar.username?.trim()?.[0]?.toUpperCase() || "U";
  return (
    <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border/60">
      {resolved.src ? <AvatarImage src={resolved.src} alt="" onError={resolved.onError} /> : null}
      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
    </Avatar>
  );
}

function WorkoutCompactSummary({
  workout,
  visibleGroups,
  groupSets,
  maxSets,
  hideDate = false,
  leadingAvatar,
  leadingRoutineIcon,
}: {
  workout: ActividadWithDetails;
  visibleGroups: MainMuscleGroup[];
  groupSets: Record<MainMuscleGroup, number>;
  maxSets: number;
  hideDate?: boolean;
  leadingAvatar?: WorkoutLeadingAvatar;
  leadingRoutineIcon?: string | null;
}) {
  const totalSets = countDoneSeries(workout.ejercicios);
  const exerciseCount = workout.ejercicios.filter((ex) => (ex.series ?? []).some(isSerieDone)).length;
  const statsLabel = `${exerciseCount} ejercicio${exerciseCount === 1 ? "" : "s"} · ${totalSets} series`;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        {leadingRoutineIcon ? (
          <WorkoutLeadingRoutineIcon iconKey={leadingRoutineIcon} className="mt-0.5 h-4 w-4" />
        ) : leadingAvatar ? (
          <WorkoutLeadingAvatarBadge avatar={leadingAvatar} />
        ) : null}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <h3
              className={cn(
                "min-w-0 flex-1 text-sm font-semibold leading-snug",
                leadingAvatar && "pt-1.5",
              )}
            >
              {workout.titulo}
            </h3>
            <p className="shrink-0 text-right text-[11px] leading-snug text-muted-foreground tabular-nums">
              {statsLabel}
            </p>
          </div>
          {!hideDate ? (
            <GymStartMetaRow dateTime={workout.fecha} gymName={workout.gimnasio_nombre} />
          ) : null}
        </div>
      </div>
      {totalSets === 0 ? (
        <p className="text-xs text-muted-foreground">Sin series registradas.</p>
      ) : visibleGroups.length > 0 ? (
        <WorkoutMuscleMiniMap groupSets={groupSets} maxSets={maxSets} />
      ) : null}
    </div>
  );
}

export function WorkoutDetailsContent({
  workout,
  isLoading = false,
  radarChartId,
  containerClassName,
  variant = "full",
  hideHeader = false,
  hideDate = false,
  leadingAvatar,
  leadingRoutineIcon,
}: WorkoutDetailsContentProps) {
  const groups = useMemo(() => Object.keys(MUSCLE_GROUPS) as MainMuscleGroup[], []);

  const {
    groupSets,
    groupWeight,
    orderedExercises,
    exerciseGroups,
    topExerciseId,
    rmByExerciseId,
  } = useMemo(() => {
    const groupSetsAcc: Record<MainMuscleGroup, number> = Object.fromEntries(groups.map((g) => [g, 0])) as Record<
      MainMuscleGroup,
      number
    >;
    const groupWeightAcc: Record<MainMuscleGroup, number> = Object.fromEntries(groups.map((g) => [g, 0])) as Record<
      MainMuscleGroup,
      number
    >;

    const rmAcc: Record<string, { rm: number; bestSerieId: string | null }> = {};
    let bestRmTop = 0;
    let topId: string | null = null;

    const exs = workout?.ejercicios ?? [];
    const ordered = [...exs].sort(compareExercisesByExecutionOrder);

    for (const ex of ordered) {
      const series = ex.series ?? [];

      const doneSeries = series.filter(isSerieDone);
      let bestRmForExercise = 0;
      let bestSerieIdForExercise: string | null = null;
      for (const s of doneSeries) {
        const reps = Number(s.repeticiones);
        const kg = Number(s.peso_kg);
        if (reps <= 0 || kg <= 0) continue;
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

      const mainGroups = getMainGroupsForExercise(ex);
      if (mainGroups.length > 0) {
        for (const s of series) {
          if (!isSerieDone(s)) continue;
          const reps = Number(s.repeticiones);
          const kg = Number(s.peso_kg);
          const weight = reps * kg;
          for (const g of mainGroups) {
            groupSetsAcc[g] += 1;
            if (weight > 0) groupWeightAcc[g] += weight;
          }
        }
      }
    }

    const filteredOrderedExercises = ordered.filter((ex) => (ex.series ?? []).some(isSerieDone));
    const groupsBySuperset = buildSupersetGroups(filteredOrderedExercises);

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

  const maxSets = useMemo(() => Math.max(1, ...visibleGroups.map((g) => groupSets[g] ?? 0)), [visibleGroups, groupSets]);

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

  // Reserva espacio para las etiquetas del eje (fuera del radio) sin
  // encoger demasiado el gráfico: márgenes laterales grandes dejan el
  // radar pequeño y centrado con mucho vacío arriba/abajo.
  const radarMargin = useMemo(() => {
    const longest = visibleGroups.reduce((max, g) => Math.max(max, g.length), 0);
    const side = Math.min(
      RADAR.labelSideMax,
      Math.max(
        RADAR.labelSideMin,
        Math.round(longest * RADAR.tickFontSize * RADAR.labelSideCharFactor) + RADAR.labelSidePad,
      ),
    );
    return { top: RADAR.marginY, right: side, bottom: RADAR.marginY, left: side };
  }, [visibleGroups]);

  const radarId = radarChartId ?? (workout?.id ? `workout-radar-weight-${workout.id}` : "workout-radar-weight");
  const isCompact = variant === "compact";

  return (
    <div className={cn(containerClassName)}>
      {isLoading || !workout ? (
        isCompact ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="mx-auto h-32 w-full max-w-[280px] rounded-xl" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-40 w-full rounded-none" />
            <Skeleton className="h-56 w-full rounded-none" />
            <Skeleton className="h-32 w-full rounded-none" />
          </div>
        )
      ) : isCompact ? (
        <WorkoutCompactSummary
          workout={workout}
          visibleGroups={visibleGroups}
          groupSets={groupSets}
          maxSets={maxSets}
          hideDate={hideDate}
          leadingAvatar={leadingAvatar}
          leadingRoutineIcon={leadingRoutineIcon}
        />
      ) : (
        <>
          {!hideHeader ? (
            <DrawerHeader className="pb-4">
              <DrawerTitle className="text-xl">{workout.titulo}</DrawerTitle>
              <DrawerDescription>
                {workout.fecha ? format(new Date(workout.fecha), "d MMM yyyy", { locale: es }) : ""}
                {workout.gimnasio_nombre
                  ? `${workout.fecha ? " · " : ""}${workout.gimnasio_nombre}`
                  : ""}
              </DrawerDescription>
            </DrawerHeader>
          ) : null}

          <div className={cn("flex flex-col bg-background", PAGE_CARD_STACK_GAP)}>
            {workout.comentarios ? (
              <Card className="w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20">
                <CardContent className="px-6 py-6 text-sm text-muted-foreground whitespace-pre-wrap">
                  {workout.comentarios}
                </CardContent>
              </Card>
            ) : null}

            <Card className="w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20">
              <CardContent className="px-6 py-6">
                <div className="flex items-baseline justify-between gap-3 mb-4">
                  <div className="font-semibold leading-none">Series por grupo muscular</div>
                  <div className="text-xs text-muted-foreground tabular-nums leading-none">
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
                          <div className="flex items-end justify-between gap-2 text-xs">
                            <span className="flex min-w-0 items-end gap-2">
                              <img
                                src={MUSCLE_GROUP_ICON_SRC[g]}
                                alt=""
                                className="h-7 w-8 shrink-0"
                                draggable={false}
                              />
                              <span className="truncate text-muted-foreground">{g}</span>
                            </span>
                            <span className="shrink-0 text-muted-foreground tabular-nums">{sets} series</span>
                          </div>
                          <Progress value={pct} className="h-2.5" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20">
              <CardContent className="px-3 py-6 sm:px-6">
                <div className="flex items-baseline justify-between gap-3 mb-3 px-3 sm:px-0">
                  <div className="font-semibold leading-none">Peso levantado por grupo</div>
                  <div className="text-xs text-muted-foreground tabular-nums leading-none">Max: {formatWeight(maxWeight)} kg</div>
                </div>
                {visibleGroups.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No hay peso levantado para mostrar.</div>
                ) : (
                  <ChartContainer
                    id={radarId}
                    config={radarConfig}
                    className="aspect-auto w-full overflow-visible [&_.recharts-surface]:overflow-visible"
                    style={{ aspectRatio: RADAR.aspectRatio }}
                  >
                    <RadarChart
                      data={radarData}
                      cx={RADAR.cx}
                      cy={RADAR.cy}
                      outerRadius={RADAR.outerRadius}
                      margin={radarMargin}
                    >
                      <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={RADAR.gridOpacity} />
                      <PolarAngleAxis
                        dataKey="group"
                        tickLine={false}
                        axisLine={false}
                        tick={RadarAngleTick}
                      />
                      <PolarRadiusAxis
                        tickLine={false}
                        axisLine={false}
                        width={RADAR.radiusAxisWidth}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: RADAR.radiusTickFontSize }}
                        domain={[0, maxWeight]}
                      />
                      <Tooltip content={RadarWeightTooltip} />
                      <Radar
                        name="Peso"
                        dataKey="weight"
                        isAnimationActive={false}
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={RADAR.fillOpacity}
                        strokeWidth={RADAR.strokeWidth}
                        dot={{
                          r: RADAR.dotRadius,
                          stroke: "hsl(var(--background))",
                          strokeWidth: RADAR.dotStrokeWidth,
                          fill: "hsl(var(--primary))",
                        }}
                        activeDot={{ r: RADAR.activeDotRadius }}
                      />
                    </RadarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card className="w-full overflow-hidden rounded-none border-0 bg-card shadow-none md:rounded-3xl md:border md:border-border/20">
              <CardContent className="px-0 py-6">
                <div className="px-6 pb-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-semibold leading-none">Ejercicios realizados</div>
                    <div className="text-xs text-muted-foreground tabular-nums leading-none">{orderedExercises.length} ejercicios</div>
                  </div>
                </div>
                {orderedExercises.length === 0 ? (
                  <div className="px-6 text-sm text-muted-foreground">Aún no hay series completadas para mostrar.</div>
                ) : (
                  <div className="flex flex-col gap-2 px-4">
                    {exerciseGroups.map((g, idx) => {
                        const superset = !!g.supersetId && g.items.length > 1;
                        if (superset) {
                          return (
                            <div
                              key={`${g.supersetId}-${idx}`}
                              className="overflow-hidden rounded-xl border-2 border-primary/40 bg-muted/50"
                            >
                              <div className="px-3 pt-2 pb-1">
                                <span className="text-xs font-medium text-primary">Superserie</span>
                              </div>
                              <div className="divide-y divide-border">
                                {g.items.map((ex) => (
                                  <ExerciseBlock key={ex.id} ex={ex} topExerciseId={topExerciseId} rmByExerciseId={rmByExerciseId} />
                                ))}
                              </div>
                            </div>
                          );
                        }

                        const ex = g.items[0];
                        if (!ex) return null;
                        return (
                          <div
                            key={ex.id}
                            className="rounded-xl border border-border/40 bg-muted/50"
                          >
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
  );
}

