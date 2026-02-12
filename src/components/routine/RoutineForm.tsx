import { useState, useEffect, useCallback, useRef } from "react";
import { formatMSS, parseMSS } from "@/hooks/useRestTimer";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { useRoutineById } from "@/hooks/useRoutines";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Loader2, GripVertical, Link, Unlink } from "lucide-react";
import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";
import { useToast } from "@/hooks/use-toast";
import type { RoutineExerciseFormData } from "@/types/routine";

interface RoutineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineId?: string | null;
}

function generateUUID(): string {
  return crypto.randomUUID();
}

/** Group consecutive exercises that share the same superset_id */
function groupExercises(ejercicios: RoutineExerciseFormData[]) {
  const groups: { supersetId: string | null; items: { exercise: RoutineExerciseFormData; originalIndex: number }[] }[] = [];

  ejercicios.forEach((ej, i) => {
    const sid = ej.superset_id || null;
    const lastGroup = groups[groups.length - 1];

    if (sid && lastGroup && lastGroup.supersetId === sid) {
      lastGroup.items.push({ exercise: ej, originalIndex: i });
    } else {
      groups.push({ supersetId: sid, items: [{ exercise: ej, originalIndex: i }] });
    }
  });

  return groups;
}

export function RoutineForm({ open, onOpenChange, routineId = null }: RoutineFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: existingRoutine } = useRoutineById(routineId);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ejercicios, setEjercicios] = useState<RoutineExerciseFormData[]>([]);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // When linking a superset, we store the index + generated superset_id
  const [supersetLink, setSupersetLink] = useState<{ afterIndex: number; supersetId: string } | null>(null);

  const isEdit = !!routineId;

  useEffect(() => {
    if (isEdit && existingRoutine && open) {
      setNombre(existingRoutine.nombre);
      setDescripcion(existingRoutine.descripcion || "");
      setEjercicios(
        existingRoutine.ejercicios.map((ej) => ({
          tipo_ejercicio_id: ej.tipo_ejercicio_id,
          nombre: ej.tipo_ejercicio.nombre,
          series_objetivo: ej.series_objetivo,
          repes_min: ej.repes_min,
          repes_max: ej.repes_max,
          rir: (ej as any).rir ?? 1,
          orden: ej.orden,
          superset_id: (ej as any).superset_id ?? null,
          descanso: (ej as any).descanso ?? 120,
        }))
      );
    }
  }, [isEdit, existingRoutine, open]);

  useEffect(() => {
    if (open && !isEdit) {
      setNombre("");
      setDescripcion("");
      setEjercicios([]);
      setSupersetLink(null);
    }
  }, [open, isEdit]);

  const addExercise = useCallback(
    (tipoId: string, nombreEj: string) => {
      if (supersetLink) {
        // Insert immediately after the linking exercise with same superset_id
        const { afterIndex, supersetId } = supersetLink;
        setEjercicios((prev) => {
          // Also ensure the source exercise has the superset_id
          const updated = prev.map((ej, i) =>
            i === afterIndex ? { ...ej, superset_id: supersetId } : ej
          );
          const newExercise: RoutineExerciseFormData = {
            tipo_ejercicio_id: tipoId,
            nombre: nombreEj,
            series_objetivo: 3,
            repes_min: 8,
            repes_max: 12,
            rir: 1,
            orden: 0,
            superset_id: supersetId,
            descanso: 120,
          };
          // Insert after afterIndex
          const result = [
            ...updated.slice(0, afterIndex + 1),
            newExercise,
            ...updated.slice(afterIndex + 1),
          ].map((ej, i) => ({ ...ej, orden: i }));
          return result;
        });
        setSupersetLink(null);
      } else {
        setEjercicios((prev) => [
          ...prev,
          {
            tipo_ejercicio_id: tipoId,
            nombre: nombreEj,
            series_objetivo: 3,
            repes_min: 8,
            repes_max: 12,
            rir: 1,
            orden: prev.length,
            superset_id: null,
            descanso: 120,
          },
        ]);
      }
      setPickerOpen(false);
    },
    [supersetLink]
  );

  const removeExercise = (index: number) => {
    setEjercicios((prev) => prev.filter((_, i) => i !== index).map((ej, i) => ({ ...ej, orden: i })));
  };

  const updateExercise = (index: number, field: keyof RoutineExerciseFormData, value: number) => {
    setEjercicios((prev) =>
      prev.map((ej, i) => (i === index ? { ...ej, [field]: value } : ej))
    );
  };

  const startSupersetLink = (index: number) => {
    const existing = ejercicios[index].superset_id;
    const supersetId = existing || generateUUID();
    setSupersetLink({ afterIndex: index, supersetId });
    setPickerOpen(true);
  };

  const breakSuperset = (index: number) => {
    setEjercicios((prev) =>
      prev.map((ej, i) => (i === index ? { ...ej, superset_id: null } : ej))
    );
  };

  const handleSave = async () => {
    if (!user || !nombre.trim() || ejercicios.length === 0) {
      toast({ title: "Completa el formulario", description: "Agrega nombre y al menos un ejercicio.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      let rutinaId: string;

      if (isEdit && routineId) {
        const { error } = await supabase
          .from("rutina")
          .update({ nombre: nombre.trim(), descripcion: descripcion.trim() || null })
          .eq("id", routineId);
        if (error) throw error;
        rutinaId = routineId;
        await supabase.from("rutina_ejercicio").delete().eq("rutina_id", routineId);
      } else {
        const { data, error } = await supabase
          .from("rutina")
          .insert({ nombre: nombre.trim(), descripcion: descripcion.trim() || null, usuario_id: user.id })
          .select("id")
          .single();
        if (error) throw error;
        rutinaId = data.id;
      }

      const inserts = ejercicios.map((ej, i) => ({
        rutina_id: rutinaId,
        tipo_ejercicio_id: ej.tipo_ejercicio_id,
        series_objetivo: ej.series_objetivo,
        repes_min: ej.repes_min,
        repes_max: ej.repes_max,
        rir: ej.rir,
        orden: i,
        superset_id: ej.superset_id || null,
        descanso: ej.descanso,
      }));

      if (inserts.length > 0) {
        const { error } = await supabase.from("rutina_ejercicio").insert(inserts);
        if (error) throw error;
      }

      toast({ title: isEdit ? "¡Rutina actualizada!" : "¡Rutina creada!" });
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["routine"] });
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const groups = groupExercises(ejercicios);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto rounded-t-2xl p-0">
        <SheetHeader className="sticky top-0 z-10 bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">
              {isEdit ? "Editar Rutina" : "Nueva Rutina"}
            </SheetTitle>
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </SheetHeader>

        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="routine-name">Nombre</Label>
              <Input
                id="routine-name"
                placeholder="Ej: Push Day, Pierna A..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="routine-desc">Descripción</Label>
              <Textarea
                id="routine-desc"
                placeholder="Descripción opcional..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4">
            {groups.map((group, gIdx) => {
              const isSuperset = !!group.supersetId && group.items.length > 1;

              if (isSuperset) {
                return (
                  <div key={group.supersetId} className="relative rounded-xl border-2 border-primary/40 bg-primary/5">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
                     <div className="px-3 pt-2 pb-1">
                      <span className="text-xs font-medium text-primary">🔗 Superserie</span>
                    </div>
                    <div className="divide-y divide-border">
                      {group.items.map(({ exercise: ej, originalIndex: i }) => (
                        <ExerciseRow
                          key={i}
                          exercise={ej}
                          index={i}
                          onUpdate={updateExercise}
                          onRemove={removeExercise}
                          onLinkSuperset={startSupersetLink}
                          onBreakSuperset={breakSuperset}
                          isInSuperset
                        />
                      ))}
                    </div>
                  </div>
                );
              }

              // Single exercise (possibly with a superset_id but alone — treat as normal)
              const { exercise: ej, originalIndex: i } = group.items[0];
              return (
                <ExerciseRow
                  key={i}
                  exercise={ej}
                  index={i}
                  onUpdate={updateExercise}
                  onRemove={removeExercise}
                  onLinkSuperset={startSupersetLink}
                  onBreakSuperset={breakSuperset}
                  isInSuperset={false}
                />
              );
            })}

            <ExerciseSelector
              open={pickerOpen}
              onOpenChange={(o) => { setPickerOpen(o); if (!o) setSupersetLink(null); }}
              onSelect={addExercise}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Individual exercise row used inside the form */
function ExerciseRow({
  exercise: ej,
  index: i,
  onUpdate,
  onRemove,
  onLinkSuperset,
  onBreakSuperset,
  isInSuperset,
}: {
  exercise: RoutineExerciseFormData;
  index: number;
  onUpdate: (index: number, field: keyof RoutineExerciseFormData, value: number) => void;
  onRemove: (index: number) => void;
  onLinkSuperset: (index: number) => void;
  onBreakSuperset: (index: number) => void;
  isInSuperset: boolean;
}) {
  const wrapperClass = isInSuperset
    ? "p-4 space-y-3"
    : "rounded-xl border border-border bg-card p-4 space-y-3";

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">{ej.nombre}</h3>
        </div>
        <div className="flex items-center gap-0.5">
          {isInSuperset ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Romper superserie"
              onClick={() => onBreakSuperset(i)}
            >
              <Unlink className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              title="Crear superserie"
              onClick={() => onLinkSuperset(i)}
            >
              <Link className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemove(i)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Series</Label>
          <Input
            type="number"
            min={1}
            value={ej.series_objetivo}
            onChange={(e) => onUpdate(i, "series_objetivo", Number(e.target.value))}
            className="h-10"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Reps mín</Label>
          <Input
            type="number"
            min={1}
            value={ej.repes_min}
            onChange={(e) => onUpdate(i, "repes_min", Number(e.target.value))}
            className="h-10"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Reps máx</Label>
          <Input
            type="number"
            min={1}
            value={ej.repes_max}
            onChange={(e) => onUpdate(i, "repes_max", Number(e.target.value))}
            className="h-10"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">RIR</Label>
          <Select
            value={String(ej.rir)}
            onValueChange={(val) => onUpdate(i, "rir", Number(val))}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 - Fallo</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <RestTimeInput
          value={ej.descanso}
          onChange={(val) => onUpdate(i, "descanso", val)}
        />
      </div>
    </div>
  );
}

/** M:SS rest time input */
function RestTimeInput({ value, onChange }: { value: number; onChange: (seconds: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [display, setDisplay] = useState(formatMSS(value));

  useEffect(() => {
    setDisplay(formatMSS(value));
  }, [value]);

  const handleBlur = () => {
    const parsed = parseMSS(display);
    if (parsed != null) {
      onChange(parsed);
      setDisplay(formatMSS(parsed));
    } else {
      setDisplay(formatMSS(value));
    }
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">Descanso</Label>
      <Input
        ref={inputRef}
        value={display}
        onChange={(e) => setDisplay(e.target.value)}
        onBlur={handleBlur}
        className="h-10 text-center"
        placeholder="2:00"
      />
    </div>
  );
}
