import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isToday,
  isBefore,
  startOfDay,
  format,
  startOfMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Pencil, Trash2, Eye } from "lucide-react";
import { GymWorkoutIcon } from "@/components/icons/GymWorkoutIcon";
import { CalendarLoadingIndicator } from "@/components/dashboard/CalendarLoadingIndicator";
import {
  CalendarDayCircleContent,
  getCalendarDayCircleClasses,
  resolveCalendarDayDisplay,
} from "@/lib/calendarDayDisplay";
import { pendingPlannedForDay } from "@/lib/plannedRoutineVisibility";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { CardioSesion } from "@/types/cardio";
import { useMonthWorkouts, useDeleteWorkout } from "@/hooks/useWorkouts";
import { useMonthCardioSessions, useDeleteCardioSession } from "@/hooks/useCardioSessions";
import { usePlannedRoutines, useDeletePlannedRoutine, useUpdatePlannedRoutine, type PlannedRoutine } from "@/hooks/useWorkoutPlan";
import { useRoutines } from "@/hooks/useRoutines";
import { useToast } from "@/hooks/use-toast";

type CardioSessionLabelData = {
  deporte?: string | null;
  cardio_disciplina?: { nombre?: string | null } | { nombre?: string | null }[] | null;
};

function getCardioSessionLabel(session: CardioSessionLabelData): string {
  const disciplina = session.cardio_disciplina;
  const disciplinaNombre = Array.isArray(disciplina) ? disciplina[0]?.nombre : disciplina?.nombre;
  return disciplinaNombre ?? session.deporte ?? "Cardio";
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface WeekCalendarProps {
  selectedDate: Date | null;
  displayWeekStart?: Date | null;
  onDateSelect: (date: Date) => void;
  onDayClick?: (date: Date) => void;
  workoutDates: Date[];
  cardioSessionDates?: Date[];
  onWorkoutClick?: (id: string) => void;
  onWorkoutDetailsClick?: (id: string) => void;
  onPlannedClick?: (planned: PlannedRoutine) => void;
  onCardioClick?: (id: string) => void;
}

export function WeekCalendar({
  selectedDate,
  displayWeekStart,
  onDateSelect,
  onDayClick,
  onWorkoutClick,
  onWorkoutDetailsClick,
  onPlannedClick,
  onCardioClick,
}: WeekCalendarProps) {
  const weekStart = useMemo(
    () => startOfWeek(selectedDate ?? displayWeekStart ?? new Date(), { weekStartsOn: 1 }),
    [selectedDate, displayWeekStart],
  );

  const monthForWeek = useMemo(() => startOfMonth(weekStart), [weekStart]);

  const { data: monthWorkouts, isPending: workoutsPending } = useMonthWorkouts(monthForWeek);
  const { data: monthCardioSessions, isPending: cardioPending } = useMonthCardioSessions(monthForWeek);
  const { data: planned, isPending: plannedPending } = usePlannedRoutines(
    weekStart,
    addDays(weekStart, 6),
  );
  const calendarDataReady = !workoutsPending && !cardioPending && !plannedPending;
  const deletePlan = useDeletePlannedRoutine();
  const deleteWorkout = useDeleteWorkout();
  const deleteCardioSession = useDeleteCardioSession();
  const updatePlan = useUpdatePlannedRoutine();
  const { data: routines } = useRoutines();
  const { toast } = useToast();
  const [confirmDeletePlanned, setConfirmDeletePlanned] = useState<PlannedRoutine | null>(null);
  const [confirmDeleteWorkout, setConfirmDeleteWorkout] = useState<ActividadWithDetails | null>(null);
  const [confirmDeleteCardio, setConfirmDeleteCardio] = useState<CardioSesion | null>(null);
  const [editPlanned, setEditPlanned] = useState<PlannedRoutine | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editRutinaId, setEditRutinaId] = useState("");
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const workoutsByDay = useMemo(() => {
    const map = new Map<string, ActividadWithDetails[]>();
    const weekDateKeys = new Set(days.map((d) => format(d, "yyyy-MM-dd")));

    (monthWorkouts ?? []).forEach((w) => {
      const key = typeof w.fecha === "string"
        ? w.fecha.slice(0, 10)
        : format(new Date(w.fecha), "yyyy-MM-dd");
      if (!weekDateKeys.has(key)) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    });

    return map;
  }, [monthWorkouts, days]);

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
    const map = new Map<string, CardioSesion[]>();
    (monthCardioSessions ?? []).forEach((s) => {
      const key = format(new Date(s.fecha_inicio), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [monthCardioSessions]);

  useEffect(() => {
    setExpandedDayKey(null);
  }, [weekStart]);

  useEffect(() => {
    if (!editPlanned) return;
    if (typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      const activeEl = document.activeElement as HTMLElement | null;
      activeEl?.blur?.();
    }, 0);
    return () => window.clearTimeout(t);
  }, [editPlanned]);

  const goBack = () => onDateSelect(subWeeks(selectedDate ?? weekStart, 1));
  const goForward = () => onDateSelect(addWeeks(selectedDate ?? weekStart, 1));

  const expandedDate = expandedDayKey ? new Date(`${expandedDayKey}T00:00:00`) : null;
  const expandedWorkouts = expandedDayKey ? workoutsByDay.get(expandedDayKey) ?? [] : [];
  const expandedPlanned = expandedDayKey
    ? pendingPlannedForDay(plannedByDay.get(expandedDayKey) ?? [], expandedWorkouts)
    : [];
  const expandedCardio = expandedDayKey ? cardioByDay.get(expandedDayKey) ?? [] : [];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-base font-semibold capitalize">
          {format(weekStart, "d", { locale: es })} -{" "}
          {format(addDays(weekStart, 6), "d 'de' MMMM", { locale: es })}
        </h2>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goForward}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-1 px-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <CalendarLoadingIndicator show={!calendarDataReady} />

      {/* Week row */}
      <div className="bg-transparent rounded-b-xl overflow-hidden px-2">
        <div className="grid grid-cols-7">
          {days.map((day, colIndex) => {
            const today = isToday(day);
            const key = format(day, "yyyy-MM-dd");
            const dayWorkouts = workoutsByDay.get(key) ?? [];
            const dayPlanned = plannedByDay.get(key) ?? [];
            const pendingPlanned = pendingPlannedForDay(dayPlanned, dayWorkouts);
            const dayCardio = cardioByDay.get(key) ?? [];
            const isTrained = dayWorkouts.length > 0;
            const isCardioTrained = !isTrained && dayCardio.length > 0;
            const isScheduled = !isTrained && pendingPlanned.length > 0;

            const now = startOfDay(new Date());
            const dayStart = startOfDay(day);
            const isPast = isBefore(dayStart, now) && !today;
            const isSelected = expandedDayKey === key;

            const isBottomLeft = colIndex === 0;
            const isBottomRight = colIndex === 6;

            const handleClick = () => {
              if (isSelected) {
                setExpandedDayKey(null);
                return;
              }

              setExpandedDayKey(key);
              onDateSelect(day);
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
                key={key}
                type="button"
                onClick={handleClick}
                className={cn(
                  "group relative aspect-square w-full p-1 cursor-pointer",
                  isBottomLeft && "rounded-bl-xl",
                  isBottomRight && "rounded-br-xl",
                  "flex items-center justify-center",
                )}
                aria-label={`Día ${format(day, "d")}`}
                aria-expanded={isSelected}
              >
                <span className="relative flex items-center justify-center select-none w-8 h-8 rounded-full p-0 bg-transparent">
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
                        : "group-hover:scale-[1.03] group-hover:border-primary/50 group-hover:ring-1 group-hover:ring-primary/25 group-hover:ring-offset-0",
                    )}
                  >
                    <CalendarDayCircleContent day={day} display={dayDisplay} today={today} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {expandedDayKey && expandedDate && (
            <motion.div
              key={expandedDayKey}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="bg-background"
            >
              <div className="px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {format(expandedDate, "d MMM yyyy", { locale: es })}
                </p>

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
                              {onWorkoutClick && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => onWorkoutClick(w.id)}
                                  title="Editar"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              )}
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

                {expandedPlanned.length > 0 && (
                  <div className={expandedWorkouts.length > 0 ? "mb-3" : ""}>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                      Programado
                    </p>
                    <div className="space-y-1.5">
                      {expandedPlanned.map((p) => {
                        const dayStart = startOfDay(expandedDate);
                        const now = startOfDay(new Date());
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
                              {onPlannedClick && isPending && (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => onPlannedClick(p)}
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

                {expandedCardio.length > 0 && (
                  <div className={(expandedWorkouts.length > 0 || expandedPlanned.length > 0) ? "mb-3" : ""}>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                      Cardio realizado
                    </p>
                    <div className="space-y-1.5">
                      {expandedCardio.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between gap-2 rounded-md border border-border border-l-4 border-l-blue-500/65 bg-card py-2 pr-2 pl-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{s.titulo}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {getCardioSessionLabel(s)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
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
                      ))}
                    </div>
                  </div>
                )}

                {onDayClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 gap-2"
                    onClick={() => onDayClick(expandedDate)}
                  >
                    <GymWorkoutIcon className="h-4 w-4" />
                    Nuevo entrenamiento
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              Se borrará &quot;{confirmDeleteCardio?.titulo}&quot; y sus datos asociados. Esta acción no se puede deshacer.
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
              <Label htmlFor="edit-date-week">Fecha</Label>
              <Input
                id="edit-date-week"
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
            <Button
              variant="outline"
              onClick={() => {
                setEditPlanned(null);
                setEditDate("");
                setEditRutinaId("");
              }}
            >
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
