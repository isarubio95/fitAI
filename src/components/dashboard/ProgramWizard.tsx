import { useMemo, useState, useEffect } from "react";
import { format, addDays, startOfWeek, addWeeks, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  const [routineByDay, setRoutineByDay] = useState<Record<string, string>>(defaultRoutineByDay);
  const [durationWeeks, setDurationWeeks] = useState<1 | 4 | 8>(4);

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

  const isBusy = schedule.isPending || deleteAll.isPending || loadingRoutines || loadingTemplates;

  const setRoutineForDay = (dayKey: DayKey, value: string) => {
    setRoutineByDay((prev) => ({ ...prev, [String(dayKey)]: value === EMPTY ? "" : value }));
  };

  const reset = () => {
    setStep(1);
    setRoutineByDay(defaultRoutineByDay());
    setDurationWeeks(4);
  };

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
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <SheetContent side="bottom" className="h-[88dvh] rounded-t-2xl p-0">
        <SheetHeader className="p-5 pb-3 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Hoja de Ruta
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Planifica tus rutinas por días de la semana.
          </p>
        </SheetHeader>

        <div className="p-5 space-y-6">
          {/* Stepper */}
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>1</span>
            <span className="text-muted-foreground">Rutina por día</span>
            <span className="text-muted-foreground">→</span>
            <span className={`px-2 py-1 rounded-full ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</span>
            <span className="text-muted-foreground">Duración</span>
          </div>

          {step === 1 && (
            <div className="space-y-3">
              <Label>Asigna una rutina a cada día (deja vacío si no entrenas ese día)</Label>
              {loadingRoutines || loadingTemplates ? (
                <Skeleton className="h-64 w-full rounded-lg" />
              ) : (
                <div className="space-y-2">
                  {DAY_LABELS.map((d) => (
                    <div key={d.key} className="flex items-center gap-3">
                      <span className="w-8 text-sm font-medium text-muted-foreground shrink-0">{d.label}</span>
                      <Select
                        value={routineByDay[String(d.key)] || EMPTY}
                        onValueChange={(v) => setRoutineForDay(d.key, v)}
                      >
                        <SelectTrigger className="h-10 flex-1">
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
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Semana base:{" "}
                <span className="font-medium">
                  {format(startDate ?? new Date(), "d MMM yyyy", { locale: es })}
                </span>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Label>Duración</Label>
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
                  <span className="text-muted-foreground">Días resultantes</span>
                  <span className="font-semibold">{totalDays}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-1.5">
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
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              disabled={step === 1 || isBusy}
              onClick={() => setStep(1)}
            >
              Atrás
            </Button>

            {step < 2 ? (
              <Button disabled={!canNext || isBusy} onClick={() => setStep(2)}>
                Siguiente
              </Button>
            ) : (
              <Button disabled={!canConfirm || isBusy} onClick={onConfirm} className="gap-2">
                <Check className="h-4 w-4" />
                Confirmar
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

