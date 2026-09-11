import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowDownWideNarrow, ArrowLeft, CalendarDays, ChevronRight, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  drawerSafeAreaBottom,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AnimatedTabsList,
  pillTabsListClass,
  pillTabsTriggerClass,
  Tabs,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PAGE_CARD, PAGE_CARD_STACK_GAP, PAGE_STACK_TOP } from "@/lib/pageStyles";
import { cn } from "@/lib/utils";
import { tipoSerieLabel, tipoSerieShort } from "@/lib/setTypes";
import { useExerciseSetHistory, type ExerciseHistoryTarget } from "@/hooks/useExerciseSetHistory";
import type { ExerciseProgressMetric } from "@/hooks/useExerciseProgress";
import {
  DEFAULT_EXERCISE_HISTORY_PERIOD,
  EXERCISE_HISTORY_PERIODS,
  barWidthPct,
  dayScore,
  deriveScoreUnit,
  filterDaysByPeriod,
  formatScore,
  formatSetLine,
  groupSetsByDay,
  monthsForPeriod,
  peakDay,
  scoreMetricLabel,
  sortDays,
  withScoredWork,
  type ExerciseHistoryDay,
  type ExerciseHistoryOrder,
  type ExerciseHistoryPeriodKey,
  type ExerciseScoreMetric,
} from "@/lib/exerciseHistory";

const SCORE_METRICS: ExerciseScoreMetric[] = ["1rm", "volume"];

/** Etiqueta de fecha de la barra. Añade el año solo cuando no es el actual. */
function formatDayLabel(day: string, currentYear: number): string {
  const date = parseISO(day);
  const base = format(date, "d MMM", { locale: es });
  return date.getFullYear() === currentYear ? base : `${base} ${format(date, "yy")}`;
}

function DayRow({
  day,
  metric,
  unit,
  max,
  isPeak,
  expanded,
  onToggle,
  currentYear,
}: {
  day: ExerciseHistoryDay;
  metric: ExerciseScoreMetric;
  unit: ExerciseProgressMetric;
  max: number;
  isPeak: boolean;
  expanded: boolean;
  onToggle: () => void;
  currentYear: number;
}) {
  const score = dayScore(day, metric);
  const widthPct = barWidthPct(score, max);
  const panelId = `exercise-day-${day.day}`;

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="touch-styled flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left outline-none hover:bg-accent/40"
      >
        <span className="w-16 shrink-0 text-xs tabular-nums text-muted-foreground">
          {formatDayLabel(day.day, currentYear)}
        </span>

        <span className="relative h-6 min-w-0 flex-1 overflow-hidden rounded-md bg-muted">
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-0 left-0 rounded-md",
              // Sin transición de ancho: al reordenar la lista, animar cada
              // barra hasta su nuevo valor se lee como un glitch, no como un cambio.
              isPeak ? "bg-primary" : "bg-primary/55",
            )}
            style={{ width: `${widthPct}%` }}
          />
        </span>

        <span className="flex w-24 shrink-0 items-center justify-end gap-1">
          {isPeak && <Trophy aria-hidden className="h-3.5 w-3.5 shrink-0 text-primary" />}
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatScore(score, metric, unit)}
          </span>
        </span>

        <ChevronRight
          aria-hidden
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
            expanded && "rotate-90",
          )}
        />
      </button>

      {expanded && (
        <div id={panelId} className="mb-1 ml-16 mr-8 rounded-lg bg-muted/50 px-3 py-2">
          <p className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground/80">
            {day.actividadTitulo || format(parseISO(day.day), "EEEE d 'de' MMMM", { locale: es })}
          </p>
          <ul className="space-y-1">
            {day.sets.map((set) => {
              const short = tipoSerieShort(set.tipoSerie);
              return (
                <li
                  key={`${set.actividadId}-${set.numeroSerie}`}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="w-4 shrink-0 tabular-nums text-muted-foreground">
                      {set.numeroSerie}
                    </span>
                    <span className="tabular-nums text-foreground/90">{formatSetLine(set)}</span>
                    {short && (
                      <span
                        title={tipoSerieLabel(set.tipoSerie)}
                        className="shrink-0 rounded bg-background px-1 text-[10px] font-semibold text-muted-foreground"
                      >
                        {short}
                      </span>
                    )}
                  </span>
                  {set.rir != null && (
                    <span className="shrink-0 tabular-nums text-muted-foreground">RIR {set.rir}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}

export interface ExercisePerformanceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nombre a mostrar; el drawer no lo resuelve por su cuenta. */
  exerciseName: string;
  target: ExerciseHistoryTarget;
  /**
   * Tiers de apilado. Por defecto se sitúa por encima de la ficha de ejercicio
   * anidada más profunda del logger (`z-detail`, ver `ExerciseSelector`).
   */
  overlayClassName?: string;
  contentClassName?: string;
}

/**
 * Historial de rendimiento de un ejercicio: una barra horizontal por día de
 * entreno, apiladas en vertical.
 *
 * La card "Fuerza Máxima" resuelve la tendencia, pero comprime doce meses en el
 * ancho de un gráfico, así que consultar un día concreto de hace un mes es
 * cuestión de puntería. Aquí cada sesión es una fila legible, ordenable por
 * fecha o por puntuación, y desplegable para ver las series tal y como se
 * registraron.
 */
export function ExercisePerformanceDrawer({
  open,
  onOpenChange,
  exerciseName,
  target,
  overlayClassName = "z-deep-overlay",
  contentClassName = "z-deep",
}: ExercisePerformanceDrawerProps) {
  const [metric, setMetric] = useState<ExerciseScoreMetric>("1rm");
  const [period, setPeriod] = useState<ExerciseHistoryPeriodKey>(DEFAULT_EXERCISE_HISTORY_PERIOD);
  const [order, setOrder] = useState<ExerciseHistoryOrder>("date");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const { data: sets, isLoading, isError } = useExerciseSetHistory(target, { enabled: open });

  // Cada ejercicio arranca con sus propios ajustes: heredar el periodo o el día
  // desplegado del anterior confunde más de lo que ahorra.
  useEffect(() => {
    setExpandedDay(null);
    setOrder("date");
    setPeriod(DEFAULT_EXERCISE_HISTORY_PERIOD);
    setMetric("1rm");
  }, [target.tipo_ejercicio_id, target.usuario_ejercicio_id]);

  const unit = useMemo(() => deriveScoreUnit(sets ?? []), [sets]);
  const allDays = useMemo(() => withScoredWork(groupSetsByDay(sets ?? [], unit)), [sets, unit]);
  const visibleDays = useMemo(
    () => filterDaysByPeriod(allDays, monthsForPeriod(period)),
    [allDays, period],
  );
  const rows = useMemo(() => sortDays(visibleDays, order, metric), [visibleDays, order, metric]);
  const peak = useMemo(() => peakDay(visibleDays, metric), [visibleDays, metric]);
  const max = peak ? dayScore(peak, metric) : 0;
  const currentYear = new Date().getFullYear();

  const latest = useMemo(
    () => sortDays(visibleDays, "date", metric)[0] ?? null,
    [visibleDays, metric],
  );

  return (
    <Drawer direction="left" open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="left"
        overlayClassName={overlayClassName}
        className={cn(
          "flex h-full max-h-dvh w-full max-w-none flex-col gap-0 overflow-x-hidden border-0 bg-background p-0 shadow-none dark:bg-card",
          contentClassName,
        )}
      >
        <div className={cn("min-h-0 flex-1 overflow-y-auto bg-background", drawerSafeAreaBottom)}>
          <DrawerHeader className="sticky top-0 z-10 border-b border-border/40 bg-card px-4 pb-3 pt-[calc(1.75rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] text-left">
            <div className="flex items-center gap-2">
              <DrawerClose asChild>
                <button
                  type="button"
                  aria-label="Volver"
                  className="touch-styled -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </DrawerClose>
              <div className="min-w-0">
                <DrawerTitle className="truncate text-lg font-semibold leading-tight">
                  {exerciseName}
                </DrawerTitle>
                <DrawerDescription className="text-xs">
                  Rendimiento sesión a sesión
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          {/*
            `surface-region-page` devuelve a las cards su radio y su superficie
            dentro de un drawer (ver `drawer.tsx`); tienen que ser hijas
            directas de este contenedor.
          */}
          <div
            className={cn(
              "surface-region-page mx-auto flex w-full max-w-2xl flex-col bg-background px-3 pb-10",
              PAGE_CARD_STACK_GAP,
              PAGE_STACK_TOP,
            )}
          >
            <Card className={PAGE_CARD}>
              <CardContent className="space-y-3 px-5 py-5">
                <Tabs
                  value={metric}
                  onValueChange={(v) => setMetric(v as ExerciseScoreMetric)}
                  className="w-full"
                >
                  <AnimatedTabsList value={metric} className={cn(pillTabsListClass, "w-full")}>
                    {SCORE_METRICS.map((m) => (
                      <TabsTrigger
                        key={m}
                        value={m}
                        className={cn(pillTabsTriggerClass, "min-w-0 flex-1")}
                      >
                        {scoreMetricLabel(m, unit)}
                      </TabsTrigger>
                    ))}
                  </AnimatedTabsList>
                </Tabs>

                <Tabs
                  value={period}
                  onValueChange={(v) => setPeriod(v as ExerciseHistoryPeriodKey)}
                  className="w-full"
                >
                  <AnimatedTabsList value={period} className={cn(pillTabsListClass, "w-full")}>
                    {EXERCISE_HISTORY_PERIODS.map((opt) => (
                      <TabsTrigger
                        key={opt.key}
                        value={opt.key}
                        className={cn(pillTabsTriggerClass, "min-w-0 flex-1 px-2")}
                      >
                        {opt.label}
                      </TabsTrigger>
                    ))}
                  </AnimatedTabsList>
                </Tabs>
              </CardContent>
            </Card>

            {isLoading ? (
              <Card className={PAGE_CARD}>
                <CardContent className="space-y-2.5 px-5 py-5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </CardContent>
              </Card>
            ) : isError ? (
              <Card className={PAGE_CARD}>
                <CardContent className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No se pudo cargar el historial. Prueba a cerrar y volver a abrir.
                </CardContent>
              </Card>
            ) : rows.length === 0 ? (
              <Card className={PAGE_CARD}>
                <CardContent className="px-5 py-10 text-center text-sm text-muted-foreground">
                  {allDays.length === 0
                    ? "Aún no hay series registradas de este ejercicio 💪"
                    : "Sin entrenos en este periodo. Prueba un tramo más amplio."}
                </CardContent>
              </Card>
            ) : (
              <>
                {peak && (
                  <Card className={PAGE_CARD}>
                    <CardContent className="flex items-stretch gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
                          Mejor del periodo
                        </p>
                        <p className="text-lg font-bold tabular-nums">
                          {formatScore(dayScore(peak, metric), metric, unit)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {format(parseISO(peak.day), "d 'de' MMMM yyyy", { locale: es })}
                        </p>
                      </div>
                      {latest && (
                        <div className="min-w-0 flex-1 border-l border-border/40 pl-4">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
                            Última sesión
                          </p>
                          <p className="text-lg font-bold tabular-nums">
                            {formatScore(dayScore(latest, metric), metric, unit)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {format(parseISO(latest.day), "d 'de' MMMM yyyy", { locale: es })}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className={PAGE_CARD}>
                  <CardHeader className="flex flex-row items-center justify-between gap-3 px-5 pb-3 pt-5">
                    <CardTitle asChild className="text-base font-bold">
                      <h3>
                        {rows.length} {rows.length === 1 ? "sesión" : "sesiones"}
                      </h3>
                    </CardTitle>
                    <button
                      type="button"
                      onClick={() => setOrder((o) => (o === "date" ? "score" : "date"))}
                      aria-label={
                        order === "date"
                          ? "Ordenar de mayor a menor puntuación"
                          : "Ordenar por fecha, la más reciente primero"
                      }
                      className="touch-styled inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/25 px-3 py-1.5 text-xs font-medium text-foreground/90 outline-none hover:bg-accent/40"
                    >
                      {order === "date" ? (
                        <CalendarDays aria-hidden className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownWideNarrow aria-hidden className="h-3.5 w-3.5" />
                      )}
                      {order === "date" ? "Fecha" : "Puntuación"}
                    </button>
                  </CardHeader>
                  <CardContent className="px-4 pb-5 pt-0">
                    <ul>
                      {rows.map((day) => (
                        <DayRow
                          key={day.day}
                          day={day}
                          metric={metric}
                          unit={unit}
                          max={max}
                          isPeak={!!peak && day.day === peak.day}
                          expanded={expandedDay === day.day}
                          onToggle={() =>
                            setExpandedDay((current) => (current === day.day ? null : day.day))
                          }
                          currentYear={currentYear}
                        />
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
