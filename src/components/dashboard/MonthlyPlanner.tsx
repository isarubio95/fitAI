import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameMonth,
  isBefore,
  startOfDay,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { usePlannedRoutines, useDeletePlannedRoutine, useUpdatePlannedRoutine, type PlannedRoutine } from "@/hooks/useWorkoutPlan";
import { useRoutines } from "@/hooks/useRoutines";
import { useDeleteWorkout } from "@/hooks/useWorkouts";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell } from "lucide-react";

interface MonthlyPlannerProps {
  month: Date;
  onMonthChange: (d: Date) => void;
  workouts: ActividadWithDetails[];
  onDayClick: (date: Date) => void;
  onWorkoutClick: (workoutId: string) => void;
  onWorkoutDetailsClick?: (workoutId: string) => void;
  onPlannedStart?: (planned: PlannedRoutine) => void;
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function MonthlyPlanner({
  month,
  onMonthChange,
  workouts,
  onDayClick,
  onWorkoutClick,
  onWorkoutDetailsClick,
  onPlannedStart,
}: MonthlyPlannerProps) {
  const { data: planned } = usePlannedRoutines(startOfMonth(month), endOfMonth(month));

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
    workouts.forEach((w) => {
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

  const deletePlan = useDeletePlannedRoutine();
  const updatePlan = useUpdatePlannedRoutine();
  const deleteWorkout = useDeleteWorkout();
  const { data: routines } = useRoutines();
  const { toast } = useToast();
  const [confirmDeletePlanned, setConfirmDeletePlanned] = useState<PlannedRoutine | null>(null);
  const [confirmDeleteWorkout, setConfirmDeleteWorkout] = useState<ActividadWithDetails | null>(null);
  const [editPlanned, setEditPlanned] = useState<PlannedRoutine | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editRutinaId, setEditRutinaId] = useState("");
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  return (
    <div className="w-full">
      {/* Header (padding para que las flechas no queden pegadas a los bordes de la card) */}
      <div className="flex items-center justify-between mb-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onMonthChange(subMonths(month, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-base font-semibold capitalize">
          {format(month, "MMMM yyyy", { locale: es })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-t border-l border-border bg-transparent rounded-b-xl overflow-hidden">
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);
          const key = format(day, "yyyy-MM-dd");
          const dayWorkouts = workoutsByDay.get(key) || [];
          const dayPlanned = plannedByDay.get(key) || [];
          const now = startOfDay(new Date());
          const dayStart = startOfDay(day);
          const plannedCompleted = dayPlanned.some((p) => !!p.actividad_id);
          const plannedMissed = dayPlanned.some((p) => !p.actividad_id && isBefore(dayStart, now));

          // Identificamos las esquinas de la última fila
          const isBottomLeft = i === days.length - 7;
          const isBottomRight = i === days.length - 1;

          const cellClass = `
                relative border-r border-b border-border min-h-[80px] md:min-h-[100px] p-1 cursor-pointer
                transition-colors hover:bg-accent/30
                ${today ? "bg-accent/15" : ""}
                ${!inMonth ? "opacity-40" : ""}
                ${isBottomLeft ? "rounded-bl-xl" : ""}
                ${isBottomRight ? "rounded-br-xl" : ""}
              `;

          const cellContent = (
            <>
              {/* Day number */}
              <span
                className={`
                  absolute top-1 right-1.5 text-xs font-medium
                  ${today ? "text-primary font-bold" : "text-foreground"}
                `}
              >
                {format(day, "d")}
              </span>

              {/* Indicador visual de programación (solo círculo) */}
              {dayPlanned.length > 0 && (
                <span
                  className={`
                    absolute top-1 left-1.5 h-2 w-2 rounded-full
                    ${plannedCompleted ? "bg-green-500" : plannedMissed ? "bg-zinc-600" : "bg-orange-500"}
                  `}
                />
              )}

              {/* Workout pills: solo visual (clic en la celda abre el popover) */}
              <div className="mt-5 space-y-0.5 overflow-hidden">
                {dayWorkouts.slice(0, 3).map((w) => (
                  <div key={w.id} className="flex items-center gap-1 rounded px-1 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                    <span className="text-[10px] md:text-xs truncate text-foreground">{w.titulo}</span>
                  </div>
                ))}
                {dayWorkouts.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">+{dayWorkouts.length - 3} más</span>
                )}
              </div>
            </>
          );

          return (
            <Popover key={i} open={popoverOpen === key} onOpenChange={(open) => setPopoverOpen(open ? key : null)}>
              <PopoverTrigger asChild>
                <div className={cellClass}>{cellContent}</div>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2 max-h-[80vh] overflow-y-auto" align="start" onClick={(e) => e.stopPropagation()}>
                <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
                  {format(day, "d MMM yyyy", { locale: es })}
                </p>

                {/* Entrenamientos realizados */}
                {dayWorkouts.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 px-1">
                      Entrenamientos realizados
                    </p>
                    <div className="space-y-1.5">
                      {dayWorkouts.map((w) => {
                        const totalSets = w.ejercicios.reduce((acc, ej) => acc + (ej.series?.length ?? 0), 0);
                        return (
                          <div
                            key={w.id}
                            className="flex items-center justify-between gap-2 rounded-md border border-border bg-card p-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{w.titulo}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {w.ejercicios.length} ejercicios · {totalSets} series
                              </p>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {/** Details */ }
                              {onWorkoutDetailsClick && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    onWorkoutDetailsClick(w.id);
                                    setPopoverOpen(null);
                                  }}
                                  title="Ver detalles"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => { onWorkoutClick(w.id); setPopoverOpen(null); }}
                                title="Editar"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => { setConfirmDeleteWorkout(w); setPopoverOpen(null); }}
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
                {dayPlanned.length > 0 && (
                  <div className={dayWorkouts.length > 0 ? "mb-3" : ""}>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 px-1">
                      Programado
                    </p>
                <div className="space-y-1.5">
                  {dayPlanned.map((p) => {
                    const isCompleted = !!p.actividad_id;
                    const isMissed = !p.actividad_id && isBefore(dayStart, now);
                    const isPending = !p.actividad_id && !isBefore(dayStart, now);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-border bg-card p-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{p.rutina?.nombre ?? "Rutina"}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {isCompleted && "Completado"}
                            {isPending && "Pendiente"}
                            {isMissed && "Perdido"}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {onPlannedStart && isPending && (
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                onPlannedStart(p);
                                setPopoverOpen(null);
                              }}
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
                              setPopoverOpen(null);
                            }}
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => {
                              setConfirmDeletePlanned(p);
                              setPopoverOpen(null);
                            }}
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

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 gap-2"
                  onClick={() => {
                    onDayClick(day);
                    setPopoverOpen(null);
                  }}
                >
                  <Dumbbell className="h-4 w-4" />
                  Nuevo entrenamiento
                </Button>
              </PopoverContent>
            </Popover>
          );
        })}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar hoja de ruta</DialogTitle>
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