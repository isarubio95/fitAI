import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Moon, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useDailyHealth, type SaludDiariaPatch } from "@/hooks/useDailyHealth";
import { useMeasurements, type MedidaInsert } from "@/hooks/useMeasurements";
import { cn } from "@/lib/utils";
import {
  COMPOSITION_FIELDS,
  dailyHealthFieldsFromForm,
  dateHasHealthRecord,
  emptyHealthLogForm,
  findRecordByFecha,
  formFromRecords,
  hasCompositionValues,
  HEALTH_FOCUS_FIELD,
  isoDateKey,
  MEASURE_FIELDS,
  parseOptionalNumber,
  readInputValue,
  sameHealthDay,
  todayIso,
  type HealthLogForm,
  type MeasureKey,
} from "@/lib/healthLogForm";
import { formatSleepHours, type HealthMetric } from "@/lib/healthMetrics";

const SLEEP_QUALITY = [1, 2, 3, 4, 5] as const;

function Field({
  id,
  label,
  className,
  children,
}: {
  id: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

type HealthLogDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  focusMetric?: HealthMetric;
};

export function HealthLogDrawer({ open, onOpenChange, focusMetric = "peso" }: HealthLogDrawerProps) {
  const { toast } = useToast();
  const { addMeasurement, isAdding, data: medidas, isPending: loadingMedidas } = useMeasurements();
  const { upsertDailyHealth, isSaving, data: daily, isPending: loadingDaily } = useDailyHealth();
  const [form, setForm] = useState<HealthLogForm>(emptyHealthLogForm);
  const [moreOpen, setMoreOpen] = useState(false);
  const didPrefill = useRef(false);
  const dirty = useRef(false);
  const saving = isAdding || isSaving;
  const loading = loadingMedidas || loadingDaily;

  const currentMedida = findRecordByFecha(medidas, form.fecha);
  const currentDaily = findRecordByFecha(daily, form.fecha);
  const updatingExisting = dateHasHealthRecord(form.fecha, currentMedida, currentDaily);

  useEffect(() => {
    if (!open) {
      didPrefill.current = false;
      dirty.current = false;
      setForm(emptyHealthLogForm());
      setMoreOpen(false);
      return;
    }
    if (loading) return;
    if (didPrefill.current) return;
    if (dirty.current) {
      didPrefill.current = true;
      return;
    }
    didPrefill.current = true;
    const fecha = todayIso();
    const medida = findRecordByFecha(medidas, fecha);
    const row = findRecordByFecha(daily, fecha);
    setMoreOpen(hasCompositionValues(medida, fecha));
    setForm(formFromRecords(fecha, medida, row));
  }, [open, loading, medidas, daily]);

  const setField = (key: Exclude<keyof HealthLogForm, "calidad">, value: string) => {
    dirty.current = true;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const applyFecha = (fecha: string) => {
    const next = isoDateKey(fecha) || todayIso();
    if (sameHealthDay(next, form.fecha)) return;
    dirty.current = false;
    const medida = findRecordByFecha(medidas, next);
    const row = findRecordByFecha(daily, next);
    setMoreOpen(hasCompositionValues(medida, next));
    setForm(formFromRecords(next, medida, row));
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      didPrefill.current = false;
      dirty.current = false;
      setForm(emptyHealthLogForm());
      setMoreOpen(false);
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (saving) return;

    const synced: HealthLogForm = {
      ...form,
      fecha: isoDateKey(form.fecha) || todayIso(),
      peso: readInputValue("health-log-peso", form.peso),
      calorias: readInputValue("health-log-calorias", form.calorias),
      suenoHoras: readInputValue("health-log-sueno", form.suenoHoras),
      fcReposo: readInputValue("health-log-fc", form.fcReposo),
    };
    for (const field of COMPOSITION_FIELDS) {
      synced[field.key] = readInputValue(`health-log-${field.key}`, form[field.key]);
    }

    const fecha = synced.fecha;
    const notas = synced.notas.trim() || null;

    const medidaPayload: Omit<MedidaInsert, "usuario_id"> = { fecha, notas };
    let hasMedida = false;
    for (const field of MEASURE_FIELDS) {
      const parsed = parseOptionalNumber(synced[field.key], 0);
      if (!parsed.ok) {
        toast({ title: `${field.label}: valor no válido`, variant: "destructive" });
        return;
      }
      medidaPayload[field.key] = parsed.value;
      if (parsed.value != null) hasMedida = true;
    }

    const dailyParsed = dailyHealthFieldsFromForm(synced);
    if (!dailyParsed.ok) {
      const message =
        dailyParsed.error === "calorias"
          ? "Calorías: usa un número entre 0 y 20.000"
          : dailyParsed.error === "sueno"
            ? "Sueño: usa horas entre 0 y 24"
            : "FC reposo: usa un valor entre 30 y 120";
      toast({ title: message, variant: "destructive" });
      return;
    }

    if (!hasMedida && !dailyParsed.fields) {
      toast({ title: "Añade al menos un dato", variant: "destructive" });
      return;
    }

    try {
      if (hasMedida) await addMeasurement(medidaPayload);
      if (dailyParsed.fields) {
        const patch: SaludDiariaPatch = { ...dailyParsed.fields };
        await upsertDailyHealth(patch);
      }

      handleOpenChange(false);
      const saved: string[] = [];
      if (dailyParsed.fields?.sueno_min != null) saved.push(formatSleepHours(dailyParsed.fields.sueno_min));
      if (dailyParsed.fields?.calidad_sueno != null) {
        saved.push(`calidad ${dailyParsed.fields.calidad_sueno}/5`);
      }
      toast({
        title: updatingExisting ? "Registro actualizado" : "Registro guardado",
        description: saved.length ? saved.join(" · ") : undefined,
      });
    } catch {
      toast({ title: "No se pudo guardar. Inténtalo de nuevo.", variant: "destructive" });
    }
  };

  return (
    <Drawer handleOnly open={open} onOpenChange={handleOpenChange}>
      <DrawerContent
        side="bottom"
        className="flex h-[92lvh] max-h-[92lvh] min-h-0 flex-col overflow-hidden bg-card p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          const id = HEALTH_FOCUS_FIELD[focusMetric];
          requestAnimationFrame(() => document.getElementById(id)?.focus());
        }}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DrawerHeader className="shrink-0 text-left">
          <DrawerTitle>Registrar salud</DrawerTitle>
          <DrawerDescription>Los campos vacíos se ignoran.</DrawerDescription>
        </DrawerHeader>

        <div
          data-vaul-no-drag
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4"
        >
          <div className="space-y-5 pb-2">
            <Field id="health-log-fecha" label="Fecha">
              <Input
                id="health-log-fecha"
                type="date"
                max={todayIso()}
                value={form.fecha}
                onChange={(event) => applyFecha(event.target.value)}
                className="h-12"
              />
            </Field>

            {updatingExisting && (
              <p className="text-xs text-muted-foreground">
                {form.fecha === todayIso()
                  ? "Hoy ya hay registro. Guardar actualiza los campos que rellenes."
                  : "Este día ya tiene registro. Guardar actualiza esos campos."}
              </p>
            )}

            <section className="space-y-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Scale className="h-4 w-4 text-primary" />
                Día
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field id="health-log-peso" label="Peso (kg)">
                  <Input
                    id="health-log-peso"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="kg"
                    value={form.peso}
                    onChange={(event) => setField("peso", event.target.value)}
                    className="h-12"
                  />
                </Field>
                <Field id="health-log-calorias" label="Calorías ingeridas">
                  <Input
                    id="health-log-calorias"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="kcal"
                    value={form.calorias}
                    onChange={(event) => setField("calorias", event.target.value)}
                    className="h-12"
                  />
                </Field>
                <Field id="health-log-sueno" label="Horas de anoche">
                  <Input
                    id="health-log-sueno"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="7,5"
                    value={form.suenoHoras}
                    onChange={(event) => setField("suenoHoras", event.target.value)}
                    className="h-12"
                  />
                </Field>
                <Field id="health-log-fc" label="FC reposo (lpm)">
                  <Input
                    id="health-log-fc"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="lpm"
                    value={form.fcReposo}
                    onChange={(event) => setField("fcReposo", event.target.value)}
                    className="h-12"
                  />
                </Field>
              </div>

              <div className="space-y-1.5">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  Calidad del sueño
                </p>
                <div className="flex gap-1.5">
                  {SLEEP_QUALITY.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        dirty.current = true;
                        setForm((current) => ({
                          ...current,
                          calidad: current.calidad === n ? null : n,
                        }));
                      }}
                      onPointerUp={(event) => {
                        if (event.pointerType === "touch") event.currentTarget.blur();
                      }}
                      aria-pressed={form.calidad === n}
                      aria-label={`Calidad ${n} de 5`}
                      className={cn(
                        "touch-styled flex h-12 min-w-0 flex-1 items-center justify-center rounded-md border text-sm font-semibold tabular-nums outline-none",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        form.calidad === n
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">1 mala · 5 excelente. Opcional.</p>
              </div>
            </section>

            <section className="space-y-3">
              <button
                type="button"
                onClick={() => setMoreOpen((current) => !current)}
                aria-expanded={moreOpen}
                className="flex w-full items-center justify-between py-1 text-left text-sm font-semibold"
              >
                <span>Más medidas</span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", moreOpen && "rotate-180")} />
              </button>
              {moreOpen && (
                <div className="grid grid-cols-2 gap-3">
                  {COMPOSITION_FIELDS.map((field) => (
                    <Field key={field.key} id={`health-log-${field.key}`} label={field.label}>
                      <Input
                        id={`health-log-${field.key}`}
                        type="text"
                        inputMode={field.inputMode}
                        autoComplete="off"
                        placeholder={field.key === "grasa" ? "%" : "cm"}
                        value={form[field.key as MeasureKey]}
                        onChange={(event) => setField(field.key, event.target.value)}
                        className="h-12"
                      />
                    </Field>
                  ))}
                </div>
              )}
            </section>

            <Field id="health-log-notas" label="Notas">
              <Textarea
                id="health-log-notas"
                placeholder="Observaciones opcionales…"
                value={form.notas}
                onChange={(event) => setField("notas", event.target.value)}
                rows={3}
              />
            </Field>
          </div>
        </div>

        <DrawerFooter className="shrink-0 border-t border-border/60 bg-card pt-3">
          <Button type="button" className="w-full" onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? "Guardando…" : updatingExisting ? "Actualizar" : "Guardar"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
