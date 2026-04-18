import { useMemo, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useScheduleRoutines } from "@/hooks/useWorkoutPlan";
import { useToast } from "@/hooks/use-toast";
import { useGenerateCustomRoutine } from "@/hooks/useGenerateCustomRoutine";
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedTrainingPlan, PremiumGoal, PremiumLevel, PremiumRoutineFormData, PremiumSex } from "@/types/premiumRoutine";

const DAY_OPTIONS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miercoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sabado" },
  { value: 0, label: "Domingo" },
];

const GOAL_OPTIONS: Array<{ value: PremiumGoal; label: string }> = [
  { value: "fuerza", label: "Fuerza" },
  { value: "hipertrofia", label: "Hipertrofia" },
  { value: "perdida_grasa", label: "Perdida de grasa" },
  { value: "resistencia", label: "Resistencia" },
  { value: "salud_general", label: "Salud general" },
];

const LEVEL_OPTIONS: Array<{ value: PremiumLevel; label: string }> = [
  { value: "principiante", label: "Principiante" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

const EMPTY_NUMBER = Number.NaN;

function parseOptionalNumberInput(value: string): number {
  if (value.trim() === "") return EMPTY_NUMBER;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : EMPTY_NUMBER;
}

function numericValueOrEmpty(value: number): number | "" {
  return Number.isFinite(value) ? value : "";
}

interface GenerateRoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyPlan?: (plan: GeneratedTrainingPlan) => void;
}

export function GenerateRoutineDialog({ open, onOpenChange, onApplyPlan }: GenerateRoutineDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const generateRoutine = useGenerateCustomRoutine();
  const scheduleRoutines = useScheduleRoutines();

  const [form, setForm] = useState<PremiumRoutineFormData>({
    age: EMPTY_NUMBER,
    sex: "otro",
    heightCm: EMPTY_NUMBER,
    weightKg: EMPTY_NUMBER,
    trainingDaysPerWeek: EMPTY_NUMBER,
    sessionDurationMinutes: EMPTY_NUMBER,
    selectedDays: [],
    targetSport: "",
    goal: "salud_general",
    level: "principiante",
    availableEquipment: "",
    injuriesOrLimits: "",
  });
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedTrainingPlan | null>(null);

  const canGenerate =
    form.selectedDays.length >= 1 &&
    Number.isFinite(form.trainingDaysPerWeek) &&
    form.trainingDaysPerWeek >= 1 &&
    form.trainingDaysPerWeek <= 7;

  const selectedDaysLabel = useMemo(() => {
    return DAY_OPTIONS.filter((d) => form.selectedDays.includes(d.value))
      .map((d) => d.label)
      .join(", ");
  }, [form.selectedDays]);

  const toggleDay = (day: number) => {
    setForm((prev) => {
      const exists = prev.selectedDays.includes(day);
      if (exists) {
        return { ...prev, selectedDays: prev.selectedDays.filter((d) => d !== day) };
      }
      return { ...prev, selectedDays: [...prev.selectedDays, day].sort((a, b) => a - b) };
    });
  };

  const generatePlan = async () => {
    if (!user?.id) {
      toast({ title: "No autenticado", variant: "destructive" });
      return;
    }

    const missingOrInvalidFields: string[] = [];
    if (!Number.isFinite(form.age) || form.age < 14 || form.age > 90) {
      missingOrInvalidFields.push("Edad (14-90)");
    }
    if (!Number.isFinite(form.heightCm) || form.heightCm < 120 || form.heightCm > 230) {
      missingOrInvalidFields.push("Altura en cm (120-230)");
    }
    if (!Number.isFinite(form.weightKg) || form.weightKg < 35 || form.weightKg > 250) {
      missingOrInvalidFields.push("Peso en kg (35-250)");
    }
    if (!Number.isFinite(form.trainingDaysPerWeek) || form.trainingDaysPerWeek < 1 || form.trainingDaysPerWeek > 7) {
      missingOrInvalidFields.push("Dias por semana (1-7)");
    }
    if (!Number.isFinite(form.sessionDurationMinutes) || form.sessionDurationMinutes < 20 || form.sessionDurationMinutes > 180) {
      missingOrInvalidFields.push("Minutos por sesion (20-180)");
    }
    if (form.selectedDays.length === 0) {
      missingOrInvalidFields.push("Al menos un dia de entrenamiento");
    }

    if (missingOrInvalidFields.length > 0) {
      toast({
        title: "Faltan datos por completar",
        description: `Revisa estos campos: ${missingOrInvalidFields.join(", ")}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const plan = await generateRoutine.mutateAsync({
        ...form,
        userId: user.id,
      });
      setGeneratedPlan(plan);
      toast({
        title: "Plan generado con IA",
        description: "Ya puedes revisarlo y aplicarlo a tu hoja de ruta.",
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error inesperado";
      toast({
        title: "No se pudo generar el plan",
        description: message,
        variant: "destructive",
      });
    }
  };

  const getDatesForWeekday = (dayOfWeek: number, weeks: number): string[] => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // lunes
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const values: string[] = [];
    for (let w = 0; w < weeks; w++) {
      const d = new Date(start);
      d.setDate(start.getDate() + (w * 7) + offset);
      values.push(d.toISOString().slice(0, 10));
    }
    return values;
  };

  const parseRepRange = (value: string) => {
    const match = value.match(/(\d+)\s*-\s*(\d+)/);
    if (!match) return { min: 8, max: 12 };
    const min = Number(match[1]);
    const max = Number(match[2]);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 8, max: 12 };
    return { min: Math.max(1, min), max: Math.max(min, max) };
  };

  const applyGeneratedPlan = async () => {
    if (!generatedPlan) return;
    if (!user) {
      toast({ title: "No autenticado", variant: "destructive" });
      return;
    }

    try {
      const weeks = Math.max(1, Math.min(8, generatedPlan.roadmap.length || 4));
      const schedules: Array<{ rutinaId: string; fechasArray: string[] }> = [];

      for (const weekly of generatedPlan.weeklyStructure) {
        const { data: routineRow, error: routineError } = await supabase
          .from("rutina")
          .insert({
            usuario_id: user.id,
            nombre: `IA · ${weekly.routineTitle}`,
            descripcion: `${weekly.focus}. ${weekly.notes}`.trim(),
            es_plantilla: false,
          })
          .select("id")
          .single();

        if (routineError || !routineRow) throw routineError ?? new Error("No se pudo crear la rutina");

        for (let index = 0; index < weekly.exercises.length; index++) {
          const ex = weekly.exercises[index];
          const { data: customExercise, error: customExerciseError } = await supabase
            .from("usuario_ejercicio")
            .insert({
              usuario_id: user.id,
              nombre: ex.name,
              descripcion: `Generado por IA para ${weekly.focus}`,
            })
            .select("id")
            .single();

          if (customExerciseError || !customExercise) {
            throw customExerciseError ?? new Error("No se pudo crear ejercicio personalizado");
          }

          const reps = parseRepRange(ex.reps);
          const { error: routineExerciseError } = await supabase.from("rutina_ejercicio").insert({
            rutina_id: routineRow.id,
            usuario_ejercicio_id: customExercise.id,
            series_objetivo: ex.sets,
            repes_min: reps.min,
            repes_max: reps.max,
            descanso: ex.restSeconds,
            rir: ex.rir,
            orden: index,
          });

          if (routineExerciseError) throw routineExerciseError;
        }

        schedules.push({
          rutinaId: routineRow.id,
          fechasArray: getDatesForWeekday(weekly.dayOfWeek, weeks),
        });
      }

      await scheduleRoutines.mutateAsync(schedules);

      onApplyPlan?.(generatedPlan);
      onOpenChange(false);
      setGeneratedPlan(null);
      toast({
        title: "Hoja de ruta creada",
        description: "Se han generado rutinas y planificacion personalizada.",
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error al aplicar el plan";
      toast({
        title: "No se pudo aplicar el plan",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setGeneratedPlan(null);
        }
      }}
    >
      <DrawerContent className="max-w-3xl p-0 overflow-hidden">
        <div className="flex h-[92lvh] max-h-[92lvh] flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              Generar plan de entrenamiento
            </DrawerTitle>
            <DrawerDescription>
              Completa tu perfil de entrenamiento para crear una hoja de ruta personalizada con IA.
            </DrawerDescription>
            </DrawerHeader>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Edad</Label>
              <Input
                type="number"
                min={14}
                max={90}
                inputMode="numeric"
                value={numericValueOrEmpty(form.age)}
                onChange={(e) => setForm((p) => ({ ...p, age: parseOptionalNumberInput(e.target.value) }))}
                placeholder="Ejemplo: 28"
                aria-label="Edad en años, por ejemplo 28"
              />
            </div>
            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select value={form.sex} onValueChange={(value: PremiumSex) => setForm((p) => ({ ...p, sex: value }))}>
                <SelectTrigger><SelectValue placeholder="Selecciona sexo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hombre">Hombre</SelectItem>
                  <SelectItem value="mujer">Mujer</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Altura (cm)</Label>
              <Input
                type="number"
                min={120}
                max={230}
                inputMode="numeric"
                value={numericValueOrEmpty(form.heightCm)}
                onChange={(e) => setForm((p) => ({ ...p, heightCm: parseOptionalNumberInput(e.target.value) }))}
                placeholder="Ejemplo: 175"
                aria-label="Altura en centímetros, por ejemplo 175"
              />
            </div>
            <div className="space-y-2">
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                min={35}
                max={250}
                inputMode="decimal"
                value={numericValueOrEmpty(form.weightKg)}
                onChange={(e) => setForm((p) => ({ ...p, weightKg: parseOptionalNumberInput(e.target.value) }))}
                placeholder="Ejemplo: 72.5"
                aria-label="Peso en kilogramos, por ejemplo 72.5"
              />
            </div>
            <div className="space-y-2">
              <Label>Dias por semana</Label>
              <Input
                type="number"
                min={1}
                max={7}
                inputMode="numeric"
                value={numericValueOrEmpty(form.trainingDaysPerWeek)}
                onChange={(e) => setForm((p) => ({ ...p, trainingDaysPerWeek: parseOptionalNumberInput(e.target.value) }))}
                placeholder="Ejemplo: 4"
                aria-label="Días de entrenamiento por semana, por ejemplo 4"
              />
            </div>
            <div className="space-y-2">
              <Label>Minutos por sesion</Label>
              <Input
                type="number"
                min={20}
                max={180}
                inputMode="numeric"
                value={numericValueOrEmpty(form.sessionDurationMinutes)}
                onChange={(e) => setForm((p) => ({ ...p, sessionDurationMinutes: parseOptionalNumberInput(e.target.value) }))}
                placeholder="Ejemplo: 60"
                aria-label="Duración de sesión en minutos, por ejemplo 60"
              />
            </div>
            <div className="space-y-2">
              <Label>Objetivo principal</Label>
              <Select value={form.goal} onValueChange={(value: PremiumGoal) => setForm((p) => ({ ...p, goal: value }))}>
                <SelectTrigger><SelectValue placeholder="Selecciona objetivo" /></SelectTrigger>
                <SelectContent>
                  {GOAL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nivel actual</Label>
              <Select value={form.level} onValueChange={(value: PremiumLevel) => setForm((p) => ({ ...p, level: value }))}>
                <SelectTrigger><SelectValue placeholder="Selecciona nivel" /></SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            </div>

            <div className="mt-4 space-y-2">
            <Label>Dias de entrenamiento</Label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {DAY_OPTIONS.map((day) => (
                <label key={day.value} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm">
                  <Checkbox
                    checked={form.selectedDays.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Dias concretos (minimo 1): {form.selectedDays.length} · {selectedDaysLabel || "ninguno"}
            </p>
            </div>

            <div className="mt-4 grid gap-4">
            <div className="space-y-2">
              <Label>Deporte a mejorar (opcional)</Label>
              <Input
                value={form.targetSport || ""}
                onChange={(e) => setForm((p) => ({ ...p, targetSport: e.target.value }))}
                placeholder="Ejemplo: futbol, padel, running..."
              />
            </div>
            <div className="space-y-2">
              <Label>Equipamiento disponible (opcional)</Label>
              <Input
                value={form.availableEquipment || ""}
                onChange={(e) => setForm((p) => ({ ...p, availableEquipment: e.target.value }))}
                placeholder="Mancuernas, barra, bandas, gimnasio completo..."
              />
            </div>
            <div className="space-y-2">
              <Label>Lesiones o limitaciones (opcional)</Label>
              <Textarea
                value={form.injuriesOrLimits || ""}
                onChange={(e) => setForm((p) => ({ ...p, injuriesOrLimits: e.target.value }))}
                placeholder="Dolor de hombro, molestias lumbares, etc."
              />
            </div>
            </div>

            {generatedPlan && (
              <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                <p className="text-sm font-semibold">Resumen generado</p>
                <p className="mt-1 text-sm text-muted-foreground">{generatedPlan.summary}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Rutinas semanales: {generatedPlan.weeklyStructure.length} · Recomendaciones: {generatedPlan.recommendations.length}
                </p>
              </div>
            )}
          </div>

          <DrawerFooter className="mt-auto border-t border-border bg-background p-4">
            <Button
              onClick={generatePlan}
              disabled={generateRoutine.isPending || !canGenerate}
              className="gap-2 bg-linear-to-r from-violet-600 to-fuchsia-500 text-white hover:opacity-90"
            >
              <Wand2 className="h-4 w-4" />
              {generateRoutine.isPending ? "Generando..." : "Generar plan de entrenamiento"}
            </Button>
            <Button
              disabled={!generatedPlan}
              onClick={applyGeneratedPlan}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Aplicar a hoja de ruta
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
