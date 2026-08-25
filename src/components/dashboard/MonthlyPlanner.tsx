import { useEffect, useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameMonth,
  isBefore,
  startOfDay,
  format,
} from "date-fns";
import { es } from "date-fns/locale";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CALENDAR_DAY_EXPAND_DURATION_MS,
  calendarDayExpandTransitionAttr,
  calendarDayExpandTransitionStyle,
  useCalendarDayExpandTransition,
} from "@/lib/calendarDayExpandTransition";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActividadWithDetails } from "@/types/workout";
import { getCardioDiscipline, type CardioSesionWithDetails } from "@/lib/cardioSessionDisplay";
import { usePlannedRoutines, useDeletePlannedRoutine, useUpdatePlannedRoutine, type PlannedRoutine } from "@/hooks/useWorkoutPlan";
import { useRoutines } from "@/hooks/useRoutines";
import { useDeleteWorkout } from "@/hooks/useWorkouts";
import { useDeleteCardioSession } from "@/hooks/useCardioSessions";
import { useToast } from "@/hooks/use-toast";
import { GymWorkoutIcon } from "@/components/icons/GymWorkoutIcon";
import {
  CalendarDayCircleContent,
  getCalendarDayCircleClasses,
  resolveCalendarDayDisplay,
} from "@/lib/calendarDayDisplay";
import { pendingPlannedForDay } from "@/lib/plannedRoutineVisibility";
import { resolveCardioSessionIcon } from "@/lib/cardioIcons";
import { cn } from "@/lib/utils";

function getCardioSessionLabel(session: CardioSesionWithDetails): string {
  return getCardioDiscipline(session)?.nombre ?? "Cardio";
}

interface MonthlyPlannerProps {
  month: Date;
  workouts: ActividadWithDetails[];
  cardioSessions: CardioSesionWithDetails[];
  /** false mientras cargan entrenamientos o cardio desde el padre */
  activityDataReady?: boolean;
  onDayClick: (date: Date) => void;
  onWorkoutClick: (workoutId: string) => void;
  onCardioClick?: (sessionId: string) => void;
  onCardioDetailsClick?: (sessionId: string) => void;
  onWorkoutDetailsClick?: (workoutId: string) => void;
  onPlannedStart?: (planned: PlannedRoutine) => void;
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function MonthlyPlanner({
  month,
  workouts,
  cardioSessions,
  activityDataReady = true,
  onDayClick,
  onWorkoutClick,
  onCardioClick,
  onCardioDetailsClick,
  onWorkoutDetailsClick,
  onPlannedStart,
}: MonthlyPlannerProps) {
  const { data: planned, isPending: plannedPending } = usePlannedRoutines(
    startOfMonth(month),
    endOfMonth(month),
  );
  const calendarDataReady = activityDataReady && !plannedPending;

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const allDays = eachDayOfInterval({ start, end });

    // Pad start: getDay returns 0=Sun, we want Mon=0
    const startDow = (getDay(start) + 6) % 7;
    const prefix: (Date | null)[] = Array.from({ length: startDow }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() - (startDow - i));
      return d;
    });

    // Pad end
    const endDow = (getDay(end) + 6) % 7;
    const suffix: (Date | null)[] = Array.from({ length: 6 - endDow }, (_, i) => {
      const d = new Date(end);
      d.setDate(d.getDate() + i + 1);
      return d;
    });

    return [...prefix, ...allDays, ...suffix];
  }, [month]);

  const workoutsByDay = useMemo(() => {
    const map = new Map<string, ActividadWithDetails[]>();
    const list = Array.isArray(workouts) ? workouts : [];
    list.forEach((w) => {
      const key = format(new Date(w.fecha), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    });
    return map;
  }, [workouts]);

  const plannedByDay = useMemo(() => {
    const map = new Map<string, PlannedRoutine[]>();
    (planned ?? []).forEach((p) => {
      const key = p.fecha_programada.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return map;
  }, [planned]);

  const cardioByDay = useMemo(() => {
    const map = new Map<string, CardioSesionWithDetails[]>();
    const sessions = Array.isArray(cardioSessions) ? cardioSessions : [];
    sessions.forEach((s) => {
      const key = format(new Date(s.fecha_inicio), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [cardioSessions]);

  const deletePlan = useDeletePlannedRoutine();
  const updatePlan = useUpdatePlannedRoutine();
  const deleteWorkout = useDeleteWorkout();
  const deleteCardioSession = useDeleteCardioSession();
  const { data: routines } = useRoutines();
  const { toast } = useToast();
  const [confirmDeletePlanned, setConfirmDeletePlanned] = useState<PlannedRoutine | null>(null);
  const [confirmDeleteWorkout, setConfirmDeleteWorkout] = useState<ActividadWithDetails | null>(null);
  const [confirmDeleteCardio, setConfirmDeleteCardio] = useState<CardioSesionWithDetails | null>(null);
  const [editPlanned, setEditPlanned] = useState<PlannedRoutine | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editRutinaId, setEditRutinaId] = useState("");
  const [expandedWeekIndex, setExpandedWeekIndex] = useState<number | null>(null);
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);
  const expandTargetKey =
    expandedWeekIndex != null && expandedDayKey
      ? `${expandedWeekIndex}:${expandedDayKey}`
      : null;
  const expandPanel = useCalendarDayExpandTransition(expandTargetKey);
  const panelWeekIndex = expandPanel
    ? Number(expandPanel.dayKey.slice(0, expandPanel.dayKey.indexOf(":")))
    : null;
  const panelDayKey = expandPanel
    ? expandPanel.dayKey.slice(expandPanel.dayKey.indexOf(":") + 1)
    : null;

  const weeks = useMemo(() => {
    const res: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      res.push(days.slice(i, i + 7) as Date[]);
    }
    return res;
  }, [days]);

  // Reset al cambiar de mes para evitar que se muestre información de un día anterior.
  useEffect(() => {
    setExpandedWeekIndex(null);
    setExpandedDayKey(null);
  }, [month]);

  // Evita que quede algún elemento con foco/outline visible al abrir el diálogo de edición.
  useEffect(() => {
    if (!editPlanned) return;
    if (typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      const activeEl = document.activeElement as HTMLElement | null;
      activeEl?.blur?.();
    }, 0);
    return () => window.clearTimeout(t);
  }, [editPlanned]);

  return (
    <div className="w-full">
      {/* Day labels */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-1 px-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="bg-transparent rounded-b-xl overflow-hidden">
        {weeks.map((weekDays, weekIndex) => (
          <div key={weekIndex}>
            <div className="grid grid-cols-7 px-2">
              {weekDays.map((day, colIndex) => {
                const i = weekIndex * 7 + colIndex;
                const inMonth = isSameMonth(day, month);
                const today = isToday(day);
                const key = format(day, "yyyy-MM-dd");
                const dayWorkouts = workoutsByDay.get(key) || [];
                const dayPlanned = plannedByDay.get(key) || [];
                const pendingPlanned = pendingPlannedForDay(dayPlanned, dayWorkouts);
                const dayCardio = cardioByDay.get(key) || [];
                const isTrained = dayWorkouts.length > 0;
                const isCardioTrained = !isTrained && dayCardio.length > 0;
                const isScheduled = !isTrained && pendingPlanned.length > 0;

                const now = startOfDay(new Date());
                const dayStart = startOfDay(day);
                const isPast = isBefore(dayStart, now) && !today;

                const isLastWeekRow = weekIndex === weeks.length - 1;
                const isBottomLeft = isLastWeekRow && colIndex === 0;
                const isBottomRight = isLastWeekRow && colIndex === 6;

                const isSelected = expandedDayKey === key && expandedWeekIndex === weekIndex;

                const handleClick = () => {
                  if (isSelected) {
                    setExpandedDayKey(null);
                    setExpandedWeekIndex(null);
                    return;
                  }

                  setExpandedDayKey(key);
                  setExpandedWeekIndex(weekIndex);
                };

                const circleStyles = getCalendarDayCircleClasses({
                  isTrained,
                  isCardioTrained,
                  isScheduled,
                  isPast,
                  today,
                  dataReady: calendarDataReady,
                });

                const dayDisplay = resolveCalendarDayDisplay(
                  dayWorkouts,
                  pendingPlanned,
                  dayCardio,
                  routines,
                  calendarDataReady,
                );

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={handleClick}
                    className={cn(
                      "group relative aspect-square w-full p-1 cursor-pointer",
                      isBottomLeft && "rounded-bl-xl",
                      isBottomRight && "rounded-br-xl",
                      !inMonth && "opacity-40",
                      "flex items-center justify-center",
                    )}
                    aria-label={`Día ${format(day, "d")} ${inMonth ? "" : "(fuera de mes)"}`}
                    aria-expanded={isSelected}
                  >
                    <span
                      className={cn(
                        "relative flex items-center justify-center select-none w-8 h-8 rounded-full",
                        "p-0 bg-transparent",
                      )}
                    >
                      <span
                        className={cn(
                          "relative flex items-center justify-center select-none w-full h-full rounded-full border text-xs font-semibold",
                          circleStyles.circleFill,
                          circleStyles.circleText,
                          circleStyles.circleBorder,
                          circleStyles.transitionClass,
                          circleStyles.loadingClass,
                          isSelected && !today && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
                          today
                            ? "group-hover:scale-[1.03]"
                            : "group-hover:scale-[1.03] group-hover:border-primary/28 group-hover:ring-1 group-hover:ring-primary/12 group-hover:ring-offset-0",
                        )}
                      >
                        <CalendarDayCircleContent day={day} display={dayDisplay} today={today} />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className={cn(
                "grid w-full transition-[grid-template-rows] ease-[cubic-bezier(0.32,0.72,0,1)]",
                expandPanel &&
                  panelWeekIndex === weekIndex &&
                  expandPanel.phase !== "out"
                  ? "grid-rows-[1fr]"
                  : "grid-rows-[0fr]",
              )}
              style={{ transitionDuration: `${CALENDAR_DAY_EXPAND_DURATION_MS}ms` }}
            >
              <div className="min-h-0 overflow-hidden">
                {expandPanel && panelWeekIndex === weekIndex && panelDayKey && (
                  (() => {
                  const expandedDate = new Date(`${panelDayKey}T00:00:00`);
                  const expandedWorkouts = workoutsByDay.get(panelDayKey) || [];
                  const expandedPlanned = pendingPlannedForDay(
                    plannedByDay.get(panelDayKey) || [],
                    expandedWorkouts,
                  );
                  const expandedCardio = cardioByDay.get(panelDayKey) || [];
                  const dayStart = startOfDay(expandedDate);
                  const now = startOfDay(new Date());

                  return (
                    <div
                      key={expandPanel.dayKey}
                      className="w-full bg-background"
                      data-calendar-day-expand={expandPanel.phase}
                      {...(expandPanel.phase !== "settled"
                        ? {
                            "transition-style": calendarDayExpandTransitionAttr(expandPanel.phase),
                          }
                        : {})}
                      style={calendarDayExpandTransitionStyle(expandPanel.phase)}
                    >
                      <div className="px-5 py-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {format(expandedDate, "d MMM yyyy", { locale: es })}
                        </p>

                        {/* Entrenamientos realizados */}
                        {expandedWorkouts.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                              Entrenamientos realizados
                            </p>
                            <div className="space-y-1.5">
                              {expandedWorkouts.map((w) => {
                                const totalSets = w.ejercicios.reduce((acc, ej) => acc + (ej.series?.length ?? 0), 0);
                                return (
                                  <div
                                    key={w.id}
                                    className="flex items-center justify-between gap-2 rounded-md border border-border border-l-4 border-l-primary/85 bg-card py-2 pr-2 pl-3"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium truncate">{w.titulo}</p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {w.ejercicios.length} ejercicios · {totalSets} series
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {onWorkoutDetailsClick && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7"
                                          onClick={() => onWorkoutDetailsClick(w.id)}
                                          title="Ver detalles"
                                        >
                                          <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => onWorkoutClick(w.id)}
                                        title="Editar"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => setConfirmDeleteWorkout(w)}
                                        title="Eliminar"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Programado */}
                        {expandedPlanned.length > 0 && (
                          <div className={expandedWorkouts.length > 0 ? "mb-3" : ""}>
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                              Programado
                            </p>
                            <div className="space-y-1.5">
                              {expandedPlanned.map((p) => {
                                const isCompleted = !!p.actividad_id;
                                const isMissed = !p.actividad_id && isBefore(dayStart, now);
                                const isPending = !p.actividad_id && !isBefore(dayStart, now);
                                const programStripe = isCompleted
                                  ? "border-l-emerald-500/75"
                                  : isMissed
                                    ? "border-l-zinc-500/55"
                                    : "border-l-orange-500/70";
                                return (
                                  <div
                                    key={p.id}
                                    className={cn(
                                      "flex items-center justify-between gap-2 rounded-md border border-border border-l-4 bg-card py-2 pr-2 pl-3",
                                      programStripe,
                                    )}
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium truncate">
                                        {p.rutina?.nombre ?? "Rutina"}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {isCompleted && "Completado"}
                                        {isPending && "Pendiente"}
                                        {isMissed && "Perdido"}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {onPlannedStart && isPending && (
                                        <Button
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={() => onPlannedStart(p)}
                                        >
                                          Iniciar
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => {
                                          setEditPlanned(p);
                                          setEditDate(p.fecha_programada.slice(0, 10));
                                          setEditRutinaId(p.rutina_id);
                                        }}
                                        title="Editar"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => setConfirmDeletePlanned(p)}
                                        title="Eliminar"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Cardio realizado */}
                        {expandedCardio.length > 0 && (
                          <div
                            className={cn(
                              (expandedWorkouts.length > 0 || expandedPlanned.length > 0) && "mb-3",
                            )}
                          >
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                              Cardio realizado
                            </p>
                            <div className="space-y-1.5">
                              {expandedCardio.map((s) => {
                                const CardioIcon = resolveCardioSessionIcon(s);
                                return (
                                <div
                                  key={s.id}
                                  className="flex items-center justify-between gap-2 rounded-md border border-border border-l-4 border-l-blue-500/65 bg-card py-2 pr-2 pl-3"
                                >
                                  <div className="min-w-0 flex-1 flex items-center gap-2.5">
                                    <CardioIcon className="h-4 w-4 shrink-0 text-blue-500" strokeWidth={1.75} />
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium truncate">{s.titulo}</p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {getCardioSessionLabel(s)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {onCardioDetailsClick && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => onCardioDetailsClick(s.id)}
                                        title="Ver detalles"
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                    {onCardioClick && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => onCardioClick(s.id)}
                                        title="Editar cardio"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                      onClick={() => setConfirmDeleteCardio(s)}
                                      title="Eliminar cardio"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 gap-2"
                          onClick={() => onDayClick(expandedDate)}
                        >
                          <GymWorkoutIcon className="h-4 w-4" />
                          Nuevo entrenamiento
                        </Button>
                      </div>
                    </div>
                  );
                })()
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmar eliminar entrenamiento */}
      <AlertDialog open={!!confirmDeleteWorkout} onOpenChange={(open) => !open && setConfirmDeleteWorkout(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este entrenamiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrará &quot;{confirmDeleteWorkout?.titulo}&quot; y todas sus series. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteWorkout.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!confirmDeleteWorkout) return;
                try {
                  await deleteWorkout.mutateAsync(confirmDeleteWorkout.id);
                  setConfirmDeleteWorkout(null);
                  setExpandedWeekIndex(null);
                  setExpandedDayKey(null);
                } catch {
                  // toast from mutation
                }
              }}
              disabled={deleteWorkout.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmar eliminar programación */}
      <AlertDialog open={!!confirmDeletePlanned} onOpenChange={(open) => !open && setConfirmDeletePlanned(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta programación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitará la rutina &quot;{confirmDeletePlanned?.rutina?.nombre}&quot; del día planificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePlan.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!confirmDeletePlanned) return;
                try {
                  await deletePlan.mutateAsync([confirmDeletePlanned.id]);
                  toast({ title: "Programación eliminada" });
                  setConfirmDeletePlanned(null);
                } catch (e: unknown) {
                  toast({ title: "Error al eliminar", description: (e as Error).message, variant: "destructive" });
                }
              }}
              disabled={deletePlan.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmar eliminar cardio */}
      <AlertDialog open={!!confirmDeleteCardio} onOpenChange={(open) => !open && setConfirmDeleteCardio(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este cardio?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrará &quot;{confirmDeleteCardio?.titulo}&quot; y sus datos asociados (bloques, track si hay). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCardioSession.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!confirmDeleteCardio) return;
                try {
                  await deleteCardioSession.mutateAsync(confirmDeleteCardio.id);
                  toast({ title: "Entrenamiento de cardio eliminado" });
                  setConfirmDeleteCardio(null);
                } catch (e: unknown) {
                  toast({ title: "Error al eliminar", description: (e as Error).message, variant: "destructive" });
                }
              }}
              disabled={deleteCardioSession.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Editar programación */}
      <Dialog
        open={!!editPlanned}
        onOpenChange={(open) => {
          if (!open) {
            setEditPlanned(null);
            setEditDate("");
            setEditRutinaId("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-date-month">Fecha</Label>
              <Input
                id="edit-date-month"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Rutina</Label>
              <Select value={editRutinaId} onValueChange={setEditRutinaId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Elige rutina..." />
                </SelectTrigger>
                <SelectContent>
                  {(routines ?? []).map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditPlanned(null); setEditDate(""); setEditRutinaId(""); }}>
              Cancelar
            </Button>
            <Button
              disabled={!editPlanned || !editDate || updatePlan.isPending}
              onClick={async () => {
                if (!editPlanned || !editDate) return;
                try {
                  await updatePlan.mutateAsync({
                    id: editPlanned.id,
                    fecha_programada: editDate,
                    ...(editRutinaId !== editPlanned.rutina_id ? { rutina_id: editRutinaId } : {}),
                  });
                  toast({ title: "Programación actualizada" });
                  setEditPlanned(null);
                  setEditDate("");
                  setEditRutinaId("");
                } catch (e: unknown) {
                  toast({ title: "Error al guardar", description: (e as Error).message, variant: "destructive" });
                }
              }}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}