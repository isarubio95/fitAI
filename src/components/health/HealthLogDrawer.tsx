import { useEffect, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { Flame, Moon, Scale } from "lucide-react";
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

const sectionCardClass = "space-y-4 rounded-xl border border-border/60 bg-secondary/40 p-4";

const MEASURE_FIELDS = [
  { key: "peso", label: "Peso (kg)", step: "0.1", inputMode: "decimal" },
  { key: "grasa", label: "% Grasa", step: "0.1", inputMode: "decimal" },
  { key: "cintura", label: "Cintura (cm)", step: "0.1", inputMode: "decimal" },
  { key: "pecho", label: "Pecho (cm)", step: "0.1", inputMode: "decimal" },
  { key: "brazo", label: "Brazo (cm)", step: "0.1", inputMode: "decimal" },
  { key: "pierna", label: "Pierna (cm)", step: "0.1", inputMode: "decimal" },
] as const;

type MeasureKey = (typeof MEASURE_FIELDS)[number]["key"];

type HealthLogForm = Record<MeasureKey, string> & {
  fecha: string;
  calorias: string;
  suenoHoras: string;
  fcReposo: string;
  notas: string;
  calidad: number | null;
};

const SLEEP_QUALITY = [1, 2, 3, 4, 5] as const;

function todayIso() {
  return format(new Date(), "yyyy-MM-dd");
}

function emptyForm(): HealthLogForm {
  return {
    fecha: todayIso(),
    peso: "",
    grasa: "",
    cintura: "",
    pecho: "",
    brazo: "",
    pierna: "",
    calorias: "",
    suenoHoras: "",
    fcReposo: "",
    notas: "",
    calidad: null,
  };
}

function parseOptionalNumber(
  raw: string,
  min?: number,
  max?: number,
): { ok: true; value: number | null } | { ok: false } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };
  const n = Number(trimmed.replace(",", "."));
  if (!Number.isFinite(n)) return { ok: false };
  if (min != null && n < min) return { ok: false };
  if (max != null && n > max) return { ok: false };
  return { ok: true, value: n };
}

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
};

export function HealthLogDrawer({ open, onOpenChange }: HealthLogDrawerProps) {
  const { toast } = useToast();
  const { addMeasurement, isAdding } = useMeasurements();
  const { upsertDailyHealth, isSaving } = useDailyHealth();
  const [form, setForm] = useState<HealthLogForm>(emptyForm);
  const saving = isAdding || isSaving;

  useEffect(() => {
    if (open) setForm(emptyForm());
  }, [open]);

  const setField = (key: Exclude<keyof HealthLogForm, "calidad">, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setForm(emptyForm());
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (saving) return;

    const fecha = form.fecha.trim() || todayIso();
    const notas = form.notas.trim() || null;

    const medidaPayload: Omit<MedidaInsert, "usuario_id"> = { fecha, notas };
    let hasMedida = false;
    for (const field of MEASURE_FIELDS) {
      const parsed = parseOptionalNumber(form[field.key], 0);
      if (!parsed.ok) {
        toast({ title: `${field.label}: valor no válido`, variant: "destructive" });
        return;
      }
      medidaPayload[field.key] = parsed.value;
      if (parsed.value != null) hasMedida = true;
    }

    const calorias = parseOptionalNumber(form.calorias, 0, 20000);
    const suenoHoras = parseOptionalNumber(form.suenoHoras, 0, 24);
    const fcReposo = parseOptionalNumber(form.fcReposo, 30, 120);
    if (!calorias.ok) {
      toast({ title: "Calorías: usa un número entre 0 y 20.000", variant: "destructive" });
      return;
    }
    if (!suenoHoras.ok) {
      toast({ title: "Sueño: usa horas entre 0 y 24", variant: "destructive" });
      return;
    }
    if (!fcReposo.ok) {
      toast({ title: "FC reposo: usa un valor entre 30 y 120", variant: "destructive" });
      return;
    }

    const suenoMin = suenoHoras.value != null ? Math.round(suenoHoras.value * 60) : null;
    const caloriasEnteras = calorias.value != null ? Math.round(calorias.value) : null;
    const fcEntera = fcReposo.value != null ? Math.round(fcReposo.value) : null;
    const hasSalud =
      caloriasEnteras != null || suenoMin != null || form.calidad != null || fcEntera != null;

    if (!hasMedida && !hasSalud) {
      toast({ title: "Añade al menos un dato", variant: "destructive" });
      return;
    }

    try {
      if (hasMedida) await addMeasurement(medidaPayload);
      if (hasSalud) {
        const patch: SaludDiariaPatch = { fecha };
        if (caloriasEnteras != null) patch.calorias = caloriasEnteras;
        if (suenoMin != null) patch.sueno_min = suenoMin;
        if (form.calidad != null) patch.calidad_sueno = form.calidad;
        if (fcEntera != null) patch.fc_reposo = fcEntera;
        if (notas) patch.notas = notas;
        await upsertDailyHealth(patch);
      }

      handleOpenChange(false);
      toast({ title: "Registro guardado" });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent
        side="bottom"
        className="flex h-[92lvh] max-h-[92lvh] min-h-0 flex-col overflow-hidden bg-card p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DrawerHeader className="shrink-0 text-left">
          <DrawerTitle>Registrar salud</DrawerTitle>
          <DrawerDescription>
            Peso, medidas, calorías, sueño o frecuencia cardíaca. Los campos vacíos se ignoran.
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4">
          <div className="space-y-4 pb-2">
            <Field id="health-log-fecha" label="Fecha">
              <Input
                id="health-log-fecha"
                type="date"
                max={todayIso()}
                value={form.fecha}
                onChange={(event) => setField("fecha", event.target.value)}
                className="h-12"
              />
            </Field>

            <section className={sectionCardClass}>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Scale className="h-4 w-4 text-muted-foreground" />
                Medidas
              </p>
              <div className="grid grid-cols-2 gap-3">
                {MEASURE_FIELDS.map((field) => (
                  <Field key={field.key} id={`health-log-${field.key}`} label={field.label}>
                    <Input
                      id={`health-log-${field.key}`}
                      type="number"
                      step={field.step}
                      min={0}
                      inputMode={field.inputMode}
                      autoComplete="off"
                      placeholder="—"
                      value={form[field.key]}
                      onChange={(event) => setField(field.key, event.target.value)}
                      className="h-12"
                    />
                  </Field>
                ))}
              </div>
            </section>

            <section className={sectionCardClass}>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Flame className="h-4 w-4 text-muted-foreground" />
                Día a día
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field id="health-log-calorias" label="Calorías ingeridas">
                  <Input
                    id="health-log-calorias"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="kcal"
                    value={form.calorias}
                    onChange={(event) => setField("calorias", event.target.value)}
                    className="h-12"
                  />
                </Field>
                <Field id="health-log-sueno" label="Sueño (horas)">
                  <Input
                    id="health-log-sueno"
                    type="number"
                    min={0}
                    max={24}
                    step="0.25"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="7.5"
                    value={form.suenoHoras}
                    onChange={(event) => setField("suenoHoras", event.target.value)}
                    className="h-12"
                  />
                </Field>
                <Field id="health-log-fc" label="FC reposo (lpm)" className="col-span-2">
                  <Input
                    id="health-log-fc"
                    type="number"
                    min={30}
                    max={120}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="60"
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
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          calidad: current.calidad === n ? null : n,
                        }))
                      }
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
                <p className="text-[11px] text-muted-foreground">1 mala · 5 excelente. Opcional.</p>
              </div>
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
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
