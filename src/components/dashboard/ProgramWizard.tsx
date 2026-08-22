import { useMemo, useState, useEffect, useRef } from "react";
import { format, addDays, startOfWeek, addWeeks, getDay, startOfDay, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
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
import { PlanSchedulePreviewCalendar } from "@/components/dashboard/PlanSchedulePreviewCalendar";

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
  const startDay = startOfDay(start);
  const startWeek = startOfWeek(start, { weekStartsOn: 1 });
  const offset = dayKey === 0 ? 6 : dayKey - 1;
  let first = addDays(startWeek, offset);

  // Si ese día de la semana actual ya pasó, empezar en la siguiente ocurrencia
  if (isBefore(startOfDay(first), startDay)) {
    first = addWeeks(first, 1);
  }

  const dates: string[] = [];
  for (let w = 0; w < weeks; w++) {
    const d = addWeeks(first, w);
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
  /** Rutina por día (key = 0-6) para precargar los selects al modificar el plan */
  initialRoutineByDay?: Record<string, string>;
}

const EMPTY = "__none__";

const WIZARD_STEPS: Array<{ number: 1 | 2; label: string }> = [
  { number: 1, label: "Rutina por día" },
  { number: 2, label: "Duración" },
];

/** Duración del barrido de cada mitad de la línea del stepper */
const SEGMENT_MS = 220;

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
  const [durationWeeks, setDurationWeeks] = useState(4);
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

  const routineMeta = useMemo(() => {
    const meta: Record<string, { nombre: string; icono?: string | null }> = {};
    for (const r of routines ?? []) {
      meta[r.id] = { nombre: r.nombre, icono: r.icono };
    }
    for (const r of templates ?? []) {
      meta[r.id] = { nombre: r.nombre, icono: r.icono };
    }
    return meta;
  }, [routines, templates]);

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
        title: replaceExisting ? "Plan actualizado" : "Plan creado",
        description: `${totalDays} días planificados.`,
      });
      onOpenChange(false);
      reset();
    } catch (e: unknown) {
      toast({
        title: "Error al planificar",
        description: e instanceof Error ? e.message : "Error desconocido",
        variant: "destructive",
      });
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
      <DrawerContent side="bottom" className="h-[92lvh] max-h-[92lvh] p-0 flex flex-col overflow-hidden">
        <DrawerHeader className="border-b border-border bg-card">
          <DrawerTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Plan
          </DrawerTitle>
          <p className="text-sm text-left text-foreground/75">
            Planifica tus rutinas por días de la semana.
          </p>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-background">
          <div className="flex flex-col gap-6 px-4 pb-4">
            {/* Stepper */}
            <div className="grid grid-cols-2 pt-6 text-xs">
              {WIZARD_STEPS.map((s, i) => {
                const isDone = step > s.number;
                const isActive = step === s.number;
                const incomingFilled = isDone || isActive;
                return (
                  <div key={s.number} className="relative flex flex-col items-center gap-1.5">
                    {i > 0 && (
                      <span className="absolute left-0 right-1/2 top-3 h-0.5 overflow-hidden bg-muted">
                        <span
                          className="block h-full w-full origin-left bg-primary-solid transition-transform ease-out"
                          style={{
                            transform: `scaleX(${incomingFilled ? 1 : 0})`,
                            transitionDuration: `${SEGMENT_MS}ms`,
                            // Encadena las dos mitades del tramo para que el barrido sea continuo
                            transitionDelay: `${incomingFilled ? SEGMENT_MS : 0}ms`,
                          }}
                        />
                      </span>
                    )}
                    {i < WIZARD_STEPS.length - 1 && (
                      <span className="absolute left-1/2 right-0 top-3 h-0.5 overflow-hidden bg-muted">
                        <span
                          className="block h-full w-full origin-left bg-primary-solid transition-transform ease-out"
                          style={{
                            transform: `scaleX(${isDone ? 1 : 0})`,
                            transitionDuration: `${SEGMENT_MS}ms`,
                            transitionDelay: `${isDone ? 0 : SEGMENT_MS}ms`,
                          }}
                        />
                      </span>
                    )}
                    <span
                      className={`relative z-10 inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
                        isDone || isActive
                          ? "bg-primary-solid text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                      style={{
                        transitionDuration: `${SEGMENT_MS}ms`,
                        // El círculo cambia justo cuando la línea termina de llegar
                        transitionDelay: `${incomingFilled && i > 0 ? SEGMENT_MS * 2 : 0}ms`,
                      }}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={isDone ? "check" : "number"}
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="inline-flex"
                        >
                          {isDone ? <Check className="h-3.5 w-3.5" /> : s.number}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <span className="text-center text-foreground/70">{s.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 rounded-xl border border-border/60 bg-card p-4">
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
                      <Skeleton className="h-64 w-full rounded-none" />
                    ) : (
                      <div className="space-y-2">
                        {DAY_LABELS.map((d) => {
                          const currentValue = routineByDay[String(d.key)] || EMPTY;
                          const isNoneSelected = currentValue === EMPTY;
                          return (
                          <div key={d.key} className="flex items-center gap-2">
                            <span
                              className={`w-8 shrink-0 text-sm font-medium ${
                                isNoneSelected ? "text-muted-foreground" : "text-accent font-semibold"
                              }`}
                            >
                              {d.label}
                            </span>
                            <Select value={currentValue} onValueChange={(v) => setRoutineForDay(d.key, v)}>
                              <SelectTrigger
                                className={cn(
                                  "h-10 flex-1",
                                  isNoneSelected
                                    ? "text-muted-foreground"
                                    : "text-accent font-semibold"
                                )}
                              >
                                <SelectValue placeholder={`${d.name} — Ninguna`} />
                              </SelectTrigger>
                              <SelectContent
                                position="item-aligned"
                                onCloseAutoFocus={(e) => e.preventDefault()}
                              >
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
                    className="space-y-4 min-h-71.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <Label className="mb-0">Duración</Label>
                        <span className="text-sm font-semibold tabular-nums">
                          {durationWeeks} {durationWeeks === 1 ? "semana" : "semanas"}
                        </span>
                      </div>
                      <div className="mt-5 space-y-3">
                        <Slider
                          min={1}
                          max={8}
                          step={1}
                          value={[durationWeeks]}
                          onValueChange={([weeks]) => {
                            if (weeks == null) return;
                            setDurationWeeks(weeks);
                          }}
                          aria-label="Duración en semanas"
                        />
                        <div className="flex justify-between px-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                          {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                            <span
                              key={n}
                              className={cn(
                                "w-4 text-center transition-colors",
                                durationWeeks === n && "text-foreground"
                              )}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm">
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

                    {totalDays > 0 && (
                      <div className="mt-4">
                        <PlanSchedulePreviewCalendar schedules={schedules} routineMeta={routineMeta} />
                      </div>
                    )}
                  </motion.div>
                )}
                </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer fijo para evitar saltos y mejorar alcance con pulgar */}
        <div className="border-t border-border bg-card/95 px-5 py-3 backdrop-blur supports-backdrop-filter:bg-card/85 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
          <div className={cn("flex items-center", step === 1 ? "justify-end" : "justify-between")}>
            {step > 1 && (
              <Button
                variant="outline"
                disabled={isBusy || isStepTransitioning}
                onClick={() => goToStep(1)}
              >
                Atrás
              </Button>
            )}

            {step < 2 ? (
              <Button
                className="disabled:opacity-100 disabled:ring-border disabled:bg-muted/70 disabled:text-muted-foreground disabled:shadow-none dark:disabled:bg-muted/40"
                disabled={!canNext || isBusy || isStepTransitioning}
                onClick={() => goToStep(2)}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                disabled={!canConfirm || isBusy || isStepTransitioning}
                onClick={onConfirm}
                className="gap-2 disabled:opacity-100 disabled:ring-border disabled:bg-muted/70 disabled:text-muted-foreground disabled:shadow-none dark:disabled:bg-muted/40"
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

