import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { useWorkoutById } from "@/hooks/useWorkouts";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Trash2 } from "lucide-react";
import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";
import { useToast } from "@/hooks/use-toast";
import { ExerciseCard } from "./ExerciseCard";
import type { ExerciseFormData, SetFormData } from "@/types/workout";

interface WorkoutLoggerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutId?: string | null;
  defaultDate?: string;
  templateExercises?: ExerciseFormData[];
  templateTitle?: string;
}

export function WorkoutLogger({ open, onOpenChange, workoutId = null, defaultDate, templateExercises, templateTitle }: WorkoutLoggerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { data: existingWorkout } = useWorkoutById(workoutId);

  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
  const [saving, setSaving] = useState(false);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEdit = !!workoutId;

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && existingWorkout && open) {
      setTitulo(existingWorkout.titulo);
      setFecha(new Date(existingWorkout.fecha).toISOString().slice(0, 10));
      setExercises(
        existingWorkout.ejercicios.map((ej) => ({
          tipo_ejercicio_id: ej.tipo_ejercicio_id,
          nombre: ej.tipo_ejercicio.nombre,
          id: ej.id,
          sets: ej.series
            .sort((a, b) => a.numero_serie - b.numero_serie)
            .map((s) => ({ repeticiones: s.repeticiones, peso_kg: Number(s.peso_kg), id: s.id })),
        }))
      );
    }
  }, [isEdit, existingWorkout, open]);

  // Reset form when opening for new workout or pre-fill from template
  useEffect(() => {
    if (open && !isEdit) {
      if (templateExercises && templateTitle) {
        setTitulo(templateTitle);
        setExercises(templateExercises);
      } else {
        setTitulo("");
        setExercises([]);
      }
      setFecha(defaultDate || new Date().toISOString().slice(0, 10));
    }
  }, [open, isEdit, defaultDate, templateExercises, templateTitle]);

  const addExercise = (tipoId: string, nombre: string) => {
    setExercises((prev) => [
      ...prev,
      { tipo_ejercicio_id: tipoId, nombre, sets: [{ repeticiones: 0, peso_kg: 0 }] },
    ]);
    setExercisePickerOpen(false);
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const addSet = (exerciseIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, sets: [...ex.sets, { repeticiones: 0, peso_kg: 0 }] }
          : ex
      )
    );
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) }
          : ex
      )
    );
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof SetFormData,
    value: number
  ) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si === setIndex ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["lastWorkout"] });
    queryClient.invalidateQueries({ queryKey: ["weeklyWorkouts"] });
    queryClient.invalidateQueries({ queryKey: ["workoutHistory"] });
    queryClient.invalidateQueries({ queryKey: ["monthWorkoutDates"] });
    queryClient.invalidateQueries({ queryKey: ["workoutsForDate"] });
    queryClient.invalidateQueries({ queryKey: ["workout"] });
  };

  const handleDelete = async () => {
    if (!workoutId) return;
    setDeleting(true);
    try {
      // Delete series first, then ejercicios, then actividad
      const { data: oldEjercicios } = await supabase
        .from("ejercicio")
        .select("id")
        .eq("actividad_id", workoutId);

      if (oldEjercicios?.length) {
        const oldIds = oldEjercicios.map((e) => e.id);
        await supabase.from("serie").delete().in("ejercicio_id", oldIds);
        await supabase.from("ejercicio").delete().eq("actividad_id", workoutId);
      }

      const { error } = await supabase.from("actividad").delete().eq("id", workoutId);
      if (error) throw error;

      toast({ title: "Entrenamiento eliminado correctamente" });
      invalidateAll();
      onOpenChange(false);
      navigate("/history");
    } catch (error: any) {
      toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleSave = async () => {
    if (!user || !titulo.trim() || exercises.length === 0) {
      toast({ title: "Completa el formulario", description: "Agrega título y al menos un ejercicio.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (isEdit && workoutId) {
        await handleUpdate(workoutId);
      } else {
        await handleCreate();
      }

      toast({ title: isEdit ? "¡Entrenamiento actualizado!" : "¡Entrenamiento guardado!" });
      invalidateAll();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    const { data: actividad, error: actError } = await supabase
      .from("actividad")
      .insert({ titulo: titulo.trim(), fecha: new Date(fecha).toISOString(), usuario_id: user!.id })
      .select("id")
      .single();
    if (actError) throw actError;

    const ejercicioInserts = exercises.map((ex) => ({
      actividad_id: actividad.id,
      tipo_ejercicio_id: ex.tipo_ejercicio_id,
      usuario_id: user!.id,
    }));

    const { data: ejercicios, error: ejError } = await supabase
      .from("ejercicio")
      .insert(ejercicioInserts)
      .select("id");
    if (ejError) throw ejError;

    const serieInserts = exercises.flatMap((ex, i) =>
      ex.sets.map((s, si) => ({
        ejercicio_id: ejercicios[i].id,
        usuario_id: user!.id,
        numero_serie: si + 1,
        repeticiones: s.repeticiones,
        peso_kg: s.peso_kg,
        ...(s.rir != null || ex.targetRir != null ? { rir: s.rir ?? ex.targetRir } : {}),
      }))
    );

    if (serieInserts.length > 0) {
      const { error: sError } = await supabase.from("serie").insert(serieInserts as any);
      if (sError) throw sError;
    }
  };

  const handleUpdate = async (actId: string) => {
    // Update actividad
    const { error: actError } = await supabase
      .from("actividad")
      .update({ titulo: titulo.trim(), fecha: new Date(fecha).toISOString() })
      .eq("id", actId);
    if (actError) throw actError;

    // Delete old ejercicios + series (cascade via foreign key not guaranteed, so delete series first)
    const { data: oldEjercicios } = await supabase
      .from("ejercicio")
      .select("id")
      .eq("actividad_id", actId);

    if (oldEjercicios?.length) {
      const oldIds = oldEjercicios.map((e) => e.id);
      await supabase.from("serie").delete().in("ejercicio_id", oldIds);
      await supabase.from("ejercicio").delete().eq("actividad_id", actId);
    }

    // Re-insert ejercicios + series
    const ejercicioInserts = exercises.map((ex) => ({
      actividad_id: actId,
      tipo_ejercicio_id: ex.tipo_ejercicio_id,
      usuario_id: user!.id,
    }));

    const { data: ejercicios, error: ejError } = await supabase
      .from("ejercicio")
      .insert(ejercicioInserts)
      .select("id");
    if (ejError) throw ejError;

    const serieInserts = exercises.flatMap((ex, i) =>
      ex.sets.map((s, si) => ({
        ejercicio_id: ejercicios[i].id,
        usuario_id: user!.id,
        numero_serie: si + 1,
        repeticiones: s.repeticiones,
        peso_kg: s.peso_kg,
        ...(s.rir != null || ex.targetRir != null ? { rir: s.rir ?? ex.targetRir } : {}),
      }))
    );

    if (serieInserts.length > 0) {
      const { error: sError } = await supabase.from("serie").insert(serieInserts as any);
      if (sError) throw sError;
    }
  };

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto rounded-t-2xl p-0">
        <SheetHeader className="sticky top-0 z-10 bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">
              {isEdit ? "Editar Entrenamiento" : "Nuevo Entrenamiento"}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {isEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/50 hover:bg-destructive/10"
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleting}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Borrar
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="p-4 space-y-6">
          {/* Title & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="Ej: Día de Pierna"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            {exercises.map((ex, ei) => (
              <ExerciseCard
                key={ei}
                exercise={ex}
                exerciseIndex={ei}
                onRemoveExercise={() => removeExercise(ei)}
                onAddSet={() => addSet(ei)}
                onRemoveSet={(si) => removeSet(ei, si)}
                onUpdateSet={(si, field, value) => updateSet(ei, si, field, value)}
              />
            ))}

            {/* Add Exercise Button */}
            <ExerciseSelector
              open={exercisePickerOpen}
              onOpenChange={setExercisePickerOpen}
              onSelect={addExercise}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>

    {/* Confirm delete workout */}
    <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Borrar este entrenamiento?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente el registro de esta sesión. No se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
