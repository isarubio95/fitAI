import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
  format,
  startOfMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ChevronDown, Pencil, Check, Clock, CalendarX2, Trash2 } from "lucide-react";
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
import { useMonthWorkouts } from "@/hooks/useWorkouts";
import { getPlannedRoutines, deletePlannedRoutine, updatePlannedRoutine, type PlannedRoutine } from "@/hooks/useWorkoutPlan";
import { useRoutines } from "@/hooks/useRoutines";
import { useToast } from "@/hooks/use-toast";

interface WeekCalendarProps {
  selectedDate: Date | null;
  /** Inicio de la semana a mostrar cuando no hay día seleccionado (evita volver a hoy al cerrar dropdown) */
  displayWeekStart?: Date | null;
  onDateSelect: (date: Date) => void;
  workoutDates: Date[];
  onWorkoutClick?: (id: string) => void;
  onPlannedClick?: (planned: PlannedRoutine) => void;
}

export function WeekCalendar({
  selectedDate,
  displayWeekStart,
  onDateSelect,
  workoutDates,
  onWorkoutClick,
  onPlannedClick,
}: WeekCalendarProps) {
  const weekStart = useMemo(
    () => startOfWeek(selectedDate ?? displayWeekStart ?? new Date(), { weekStartsOn: 1 }),
    [selectedDate, displayWeekStart]
  );

  const monthForWeek = useMemo(
    () => startOfMonth(weekStart),
    [weekStart]
  );

  const { data: monthWorkouts } = useMonthWorkouts(monthForWeek);
  const { data: planned } = getPlannedRoutines(weekStart, addDays(weekStart, 6));
  const deletePlan = deletePlannedRoutine();
  const updatePlan = updatePlannedRoutine();
  const { data: routines } = useRoutines();
  const { toast } = useToast();
  const [confirmDeletePlanned, setConfirmDeletePlanned] = useState<PlannedRoutine | null>(null);
  const [editPlanned, setEditPlanned] = useState<PlannedRoutine | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editRutinaId, setEditRutinaId] = useState("");

  const plannedByDate = useMemo(() => {
    const map: Record<string, PlannedRoutine[]> = {};
    (planned ?? []).forEach((p) => {
      const key = p.fecha_programada.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [planned]);

  const weekWorkoutsByDate = useMemo(() => {
    if (!monthWorkouts) return {} as Record<string, ActividadWithDetails[]>;

    const weekDateKeys = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), "yyyy-MM-dd"));
    const keySet = new Set(weekDateKeys);

    const map: Record<string, ActividadWithDetails[]> = {};

    monthWorkouts.forEach((w) => {
      const dateStr = typeof w.fecha === "string" ? w.fecha.slice(0, 10) : format(new Date(w.fecha), "yyyy-MM-dd");
      if (keySet.has(dateStr)) {
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(w);
      }
    });

    return map;
  }, [monthWorkouts, weekStart]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const hasWorkout = (day: Date) =>
    workoutDates.some((d) => isSameDay(d, day));

  const goBack = () => onDateSelect(subWeeks(selectedDate ?? weekStart ?? new Date(), 1));
  const goForward = () => onDateSelect(addWeeks(selectedDate ?? weekStart ?? new Date(), 1));

  return (
    <div className="w-full space-y-3">
      {/* Header: rango de la semana (fuera de la card) */}
      <div className="flex items-center justify-between">
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

      {/* Lista de días lunes - domingo, dentro de la card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border/40">
        {days.map((day) => {
          const selected = selectedDate !== null && isSameDay(day, selectedDate);
          const today = isToday(day);
          const dateKey = format(day, "yyyy-MM-dd");
          const dayWorkouts = weekWorkoutsByDate?.[dateKey] ?? [];
          const dayPlanned = plannedByDate?.[dateKey] ?? [];

          let summary: string;
          if (dayWorkouts.length === 0) {
            summary = dayPlanned.length === 1 ? dayPlanned[0].rutina?.nombre ?? "" : "";
          } else if (dayWorkouts.length === 1) {
            summary = dayWorkouts[0].titulo;
          } else if (dayWorkouts.length === 2) {
            summary = `${dayWorkouts[0].titulo}, ${dayWorkouts[1].titulo}`;
          } else {
            summary = `${dayWorkouts[0].titulo}, ${dayWorkouts[1].titulo} +${dayWorkouts.length - 2} más`;
          }

          const hasWorkouts = dayWorkouts.length > 0;
          const hasPlanned = dayPlanned.length > 0;
          const isOpen = selected && (hasWorkouts || hasPlanned);

          const now = startOfDay(new Date());
          const dayStart = startOfDay(day);
          const plannedCompleted = hasPlanned && dayPlanned.some((p) => !!p.actividad_id);
          const plannedMissed = hasPlanned && dayPlanned.some((p) => !p.actividad_id && isBefore(dayStart, now));
          const plannedPending = hasPlanned && dayPlanned.some((p) => !p.actividad_id && !isBefore(dayStart, now));

          const planDotClass = plannedCompleted
            ? "bg-green-500"
            : plannedPending
              ? "bg-orange-500"
              : plannedMissed
                ? "bg-zinc-600"
                : null;

          return (
            <motion.div
              key={day.toISOString()}
              className="bg-card/0"
              layout
              transition={{ layout: { duration: 0.22, ease: "easeInOut" } }}
            >
              <div className="w-full rounded-none">
              <button
                onClick={() => onDateSelect(day)}
                className="w-full px-3 py-3 text-left"
              >
                <div className="flex items-center gap-3 w-full min-w-0">
                  <div className="flex items-baseline gap-3 shrink-0">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {format(day, "EEE", { locale: es })}
                    </span>
                    <span
                      className={`
                        text-lg font-semibold text-foreground
                        ${today && !selected ? "underline underline-offset-4 decoration-primary decoration-2" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex justify-end">
                    {!isOpen && summary ? (
                      <span className="text-xs text-muted-foreground truncate text-right block max-w-full">
                        {summary}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {today && !selected && (
                      <span className="text-[11px] font-medium text-primary">
                        Hoy
                      </span>
                    )}
                    {hasWorkouts && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                    {planDotClass && (
                      <span className={cn("h-2 w-2 rounded-full shrink-0", planDotClass)} />
                    )}
                    {(hasWorkouts || hasPlanned) && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    )}
                  </div>
                </div>
              </button>

              {/* Mismo contenedor: contenido expandido hacia abajo (AnimatePresence para cerrar suave) */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={dateKey}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: 0.25,
                      ease: [0.32, 0.72, 0, 1],
                      opacity: { duration: 0.2 },
                    }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-0 text-xs">
                      {hasPlanned && dayPlanned.map((p) => {
                        const isCompleted = !!p.actividad_id;
                        const isMissed = !p.actividad_id && isBefore(dayStart, now);
                        const isPending = !p.actividad_id && !isBefore(dayStart, now);
                        return (
                          <div
                            key={p.id}
                            className="pt-2 pb-3 border-b border-border/20 last:border-b-0"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-[13px] text-foreground truncate">
                                    {p.rutina?.nombre ?? "Rutina programada"}
                                  </span>
                                  {isCompleted && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-green-600">
                                      <Check className="h-3.5 w-3.5" /> Completado
                                    </span>
                                  )}
                                  {isPending && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-orange-600">
                                      <Clock className="h-3.5 w-3.5" /> Pendiente
                                    </span>
                                  )}
                                  {isMissed && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-zinc-600">
                                      <CalendarX2 className="h-3.5 w-3.5" /> Perdido
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  Planificado
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {onPlannedClick && isPending && (
                                  <Button
                                    size="sm"
                                    className="h-8"
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
                          </div>
                        );
                      })}

                      {dayWorkouts.map((w) => (
                        <div
                          key={w.id}
                          className="py-2 first:pt-1 last:pb-0 border-b border-border/20 last:border-b-0"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium text-[13px] text-foreground">{w.titulo}</span>
                            {onWorkoutClick && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={() => onWorkoutClick(w.id)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {w.ejercicios.map((ej) => (
                              <span
                                key={ej.id}
                                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                              >
                                {ej.tipo_ejercicio.nombre}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmar eliminar programación */}
      <AlertDialog open={!!confirmDeletePlanned} onOpenChange={(open) => !open && setConfirmDeletePlanned(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta programación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitará la rutina &quot;{confirmDeletePlanned?.rutina?.nombre}&quot; del día planificado. El historial de entrenamientos no se verá afectado.
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

      {/* Editar programación: fecha y/o rutina */}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar hoja de ruta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Fecha</Label>
              <Input
                id="edit-date"
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

