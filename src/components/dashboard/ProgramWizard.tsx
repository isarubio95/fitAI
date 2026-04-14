import { useMemo, useState, useEffect, useRef } from "react";
import { format, addDays, startOfWeek, addWeeks, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useRoutines } from "@/hooks/useRoutines";
import { usePredefinedRoutines } from "@/hooks/usePredefinedRoutines";
import { useScheduleRoutines, useDeleteAllPlannedRoutines, type PlannedRoutine } from "@/hooks/useWorkoutPlan";
import { Calendar, Check } from "lucide-react";

/** A partir de las rutinas programadas, infiere qué rutina_id está asignada a cada día de la semana (0=Dom, 1=Lun...6=Sab). */
export function deriveRoutineByDayFromPlanned(planned: PlannedRoutine[]): Record<string, string> {
  const byDay = new Map<number, Map<string, number>>();
  for (const p of planned) {
    const day = getDay(new Date(p.fecha_programada + "T12:00:00"));
    if (!byDay.has(day)) byDay.set(day, new Map());
    const counts = byDay.get(day)!;
    counts.set(p.rutina_id, (counts.get(p.rutina_id) ?? 0) + 1);
  }
  const result: Record<string, string> = {};
  for (const [day, counts] of byDay) {
    let bestId = "";
    let bestCount = 0;
    for (const [id, c] of counts) {
      if (c > bestCount) {
        bestCount = c;
        bestId = id;
      }
    }
    if (bestId) result[String(day)] = bestId;
  }
  return result;
}

type DayKey = 1 | 2 | 3 | 4 | 5 | 6 | 0; // date-fns getDay(): 0=Dom ... 6=Sáb

const DAY_LABELS: Array<{ key: DayKey; label: string; name: string }> = [
  { key: 1, label: "L", name: "Lunes" },
  { key: 2, label: "M", name: "Martes" },
  { key: 3, label: "X", name: "Miércoles" },
  { key: 4, label: "J", name: "Jueves" },
  { key: 5, label: "V", name: "Viernes" },
  { key: 6, label: "S", name: "Sábado" },
  { key: 0, label: "D", name: "Domingo" },
];

/** Fechas para un día de la semana (dayKey) durante N semanas desde start. */
function getDatesForWeekday(dayKey: DayKey, start: Date, weeks: number): string[] {
  const startWeek = startOfWeek(start, { weekStartsOn: 1 });
  const dates: string[] = [];
  const offset = dayKey === 0 ? 6 : dayKey - 1;
  for (let w = 0; w < weeks; w++) {
    const d = addDays(addWeeks(startWeek, w), offset);
    dates.push(format(d, "yyyy-MM-dd"));
  }
  return dates;
}

/** Agrupa por rutinaId las fechas a planificar según routineByDay. */
function buildSchedulesFromRoutineByDay(
  routineByDay: Record<string, string>,
  start: Date,
  weeks: number
): Array<{ rutinaId: string; fechasArray: string[] }> {
  const byRutina = new Map<string, string[]>();
  for (const { key } of DAY_LABELS) {
    const rutinaId = routineByDay[String(key)];
    if (!rutinaId) continue;
    const dates = getDatesForWeekday(key, start, weeks);
    const existing = byRutina.get(rutinaId) ?? [];
    byRutina.set(rutinaId, [...existing, ...dates]);
  }
  return Array.from(byRutina.entries()).map(([rutinaId, fechasArray]) => ({
    rutinaId,
    fechasArray: Array.from(new Set(fechasArray)).sort(),
  }));
}

interface ProgramWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fecha base (por defecto, hoy) para calcular semanas */
  startDate?: Date;
  /** Si es true, al confirmar se borra toda la planificación actual y se reemplaza por la nueva */
  replaceExisting?: boolean;
  /** Rutina por día (key = 0-6) para precargar los selects al modificar la hoja de ruta */
  initialRoutineByDay?: Record<string, string>;
}

const EMPTY = "__none__";

const defaultRoutineByDay = () =>
  Object.fromEntries(DAY_LABELS.map((d) => [String(d.key), ""]));

export function ProgramWizard({
  open,
  onOpenChange,
  startDate,
  replaceExisting,
  initialRoutineByDay,
}: ProgramWizardProps) {
  const { toast } = useToast();
  const { data: routines, isLoading: loadingRoutines } = useRoutines();
  const { data: templates, isLoading: loadingTemplates } = usePredefinedRoutines();
  const schedule = useScheduleRoutines();
  const deleteAll = useDeleteAllPlannedRoutines();

  const [step, setStep] = useState<1 | 2>(1);
  const [transitioningStep, setTransitioningStep] = useState<1 | 2 | null>(null);
  const [routineByDay, setRoutineByDay] = useState<Record<string, string>>(defaultRoutineByDay);
  const [durationWeeks, setDurationWeeks] = useState<1 | 4 | 8>(4);
  const stepTransitionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open && replaceExisting && initialRoutineByDay && Object.keys(initialRoutineByDay).length > 0) {
      setRoutineByDay({ ...defaultRoutineByDay(), ...initialRoutineByDay });
    }
  }, [open, replaceExisting, initialRoutineByDay]);

  const routineOptions = useMemo(() => {
    const mine = (routines ?? []).map((r) => ({ id: r.id, name: r.nombre, group: "Tus rutinas" as const }));
    const tpl = (templates ?? []).map((r) => ({ id: r.id, name: r.nombre, group: "Plantillas" as const }));
    return { mine, tpl };
  }, [routines, templates]);

  const schedules = useMemo(() => {
    const base = startDate ?? new Date();
    const withRoutines = Object.fromEntries(
      Object.entries(routineByDay).filter(([, id]) => id && id !== EMPTY)
    ) as Record<string, string>;
    return buildSchedulesFromRoutineByDay(withRoutines, base, durationWeeks);
  }, [startDate, durationWeeks, routineByDay]);

  const totalDays = useMemo(() => schedules.reduce((acc, s) => acc + s.fechasArray.length, 0), [schedules]);

  const hasAtLeastOneRoutine = useMemo(
    () => Object.values(routineByDay).some((id) => id && id !== EMPTY),
    [routineByDay]
  );

  const canNext = step === 1 ? hasAtLeastOneRoutine : true;
  const canConfirm = hasAtLeastOneRoutine && schedules.length > 0 && totalDays > 0;
  const isStepTransitioning = transitioningStep !== null;

  const isBusy = schedule.isPending || deleteAll.isPending || loadingRoutines || loadingTemplates;

  const setRoutineForDay = (dayKey: DayKey, value: string) => {
    setRoutineByDay((prev) => ({ ...prev, [String(dayKey)]: value === EMPTY ? "" : value }));
  };

  const reset = () => {
    if (stepTransitionTimerRef.current != null) {
      window.clearTimeout(stepTransitionTimerRef.current);
      stepTransitionTimerRef.current = null;
    }
    setTransitioningStep(null);
    setStep(1);
    setRoutineByDay(defaultRoutineByDay());
    setDurationWeeks(4);
  };

  const goToStep = (next: 1 | 2) => {
    if (next === step) return;
    if (stepTransitionTimerRef.current != null) {
      window.clearTimeout(stepTransitionTimerRef.current);
      stepTransitionTimerRef.current = null;
    }
    setTransitioningStep(next);
    stepTransitionTimerRef.current = window.setTimeout(() => {
      setStep(next);
      setTransitioningStep(null);
      stepTransitionTimerRef.current = null;
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (stepTransitionTimerRef.current != null) {
        window.clearTimeout(stepTransitionTimerRef.current);
      }
    };
  }, []);

  const onConfirm = async () => {
    if (!schedules.length || totalDays === 0) return;
    try {
      if (replaceExisting) {
        await deleteAll.mutateAsync();
      }
      await schedule.mutateAsync(schedules);
      toast({
        title: replaceExisting ? "Hoja de ruta actualizada" : "Hoja de ruta creada",
        description: `${totalDays} días planificados.`,
      });
      onOpenChange(false);
      reset();
    } catch (e: any) {
      toast({ title: "Error al planificar", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DrawerContent side="bottom" className="h-[92dvh] rounded-t-2xl p-0 flex flex-col overflow-hidden">
        <DrawerHeader className="p-5 pb-3 border-b border-border">
          <DrawerTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Hoja de Ruta
          </DrawerTitle>
          <p className="text-sm text-foreground/75">
            Planifica tus rutinas por días de la semana.
          </p>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-20">
          {/* Stepper */}
          <div className="mb-6 flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>1</span>
            <span className="text-foreground/70">Rutina por día</span>
            <span className="text-foreground/60">→</span>
            <span className={`px-2 py-1 rounded-full ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</span>
            <span className="text-foreground/70">Duración</span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div
              key="wizard-step-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-4 min-h-[286px]"
            >
              <Label className="text-sm font-medium text-foreground/75 pb-3 block mb-0">Asigna una rutina a cada día (deja vacío si no entrenas ese día)</Label>
              {loadingRoutines || loadingTemplates ? (
                <Skeleton className="h-64 w-full rounded-lg" />
              ) : (
                <div className="space-y-2">
                  {DAY_LABELS.map((d) => {
                    const currentValue = routineByDay[String(d.key)] || EMPTY;
                    const isNoneSelected = currentValue === EMPTY;
                    return (
                    <div key={d.key} className="flex items-center gap-3">
                      <span
                        className={`w-8 shrink-0 text-sm font-medium ${
                          isNoneSelected ? "text-muted-foreground" : "text-foreground/80"
                        }`}
                      >
                        {d.label}
                      </span>
                      <Select
                        value={currentValue}
                        onValueChange={(v) => setRoutineForDay(d.key, v)}
                      >
                        <SelectTrigger className={`h-10 flex-1 ${isNoneSelected ? "text-muted-foreground" : ""}`}>
                          <SelectValue placeholder={`${d.name} — Ninguna`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EMPTY}>Ninguna</SelectItem>
                          {routineOptions.mine.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
                                Tus rutinas
                              </div>
                              {routineOptions.mine.map((r) => (
                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                              ))}
                            </>
                          )}
                          {routineOptions.tpl.length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">
                                Plantillas
                              </div>
                              {routineOptions.tpl.map((r) => (
                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )})}
                </div>
              )}
              <p className="text-xs text-foreground/70">
                Semana base:{" "}
                <span className="font-medium">
                  {format(startDate ?? new Date(), "d MMM yyyy", { locale: es })}
                </span>
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="wizard-step-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-4 min-h-[286px]"
            >
              <Label className="mb-2 block">Duración</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                className="justify-start flex-wrap gap-2"
                value={String(durationWeeks)}
                onValueChange={(v) => {
                  if (!v) return;
                  setDurationWeeks(Number(v) as 1 | 4 | 8);
                }}
              >
                <ToggleGroupItem value="1" className="h-10 px-4">1 semana</ToggleGroupItem>
                <ToggleGroupItem value="4" className="h-10 px-4">4 semanas</ToggleGroupItem>
                <ToggleGroupItem value="8" className="h-10 px-4">8 semanas</ToggleGroupItem>
              </ToggleGroup>

              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground/70">Días resultantes</span>
                  <span className="font-semibold">{totalDays}</span>
                </div>
                <div className="mt-2 text-xs text-foreground/70 flex flex-wrap gap-1.5">
                  {schedules.flatMap((s) => s.fechasArray).slice(0, 8).map((d) => (
                    <span key={d} className="inline-flex items-center rounded-full bg-muted px-2 py-0.5">
                      {format(new Date(d + "T12:00:00.000Z"), "d MMM", { locale: es })}
                    </span>
                  ))}
                  {totalDays > 8 && (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5">
                      +{totalDays - 8} más
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Footer fijo para evitar saltos y mejorar alcance con pulgar */}
        <div className="border-t border-border bg-card/95 px-5 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/85 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              className="disabled:opacity-100 disabled:bg-muted/70 disabled:text-muted-foreground dark:disabled:bg-muted/40"
              disabled={step === 1 || isBusy || isStepTransitioning}
              onClick={() => goToStep(1)}
            >
              Atrás
            </Button>

            {step < 2 ? (
              <Button
                className="disabled:opacity-100 disabled:bg-muted/70 disabled:text-muted-foreground dark:disabled:bg-muted/40"
                disabled={!canNext || isBusy || isStepTransitioning}
                onClick={() => goToStep(2)}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                disabled={!canConfirm || isBusy || isStepTransitioning}
                onClick={onConfirm}
                className="gap-2 disabled:opacity-100 disabled:bg-muted/70 disabled:text-muted-foreground dark:disabled:bg-muted/40"
              >
                <Check className="h-4 w-4" />
                Confirmar
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

