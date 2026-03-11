import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkoutById } from "@/hooks/useWorkouts";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
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
import { Loader2, Trash2, Timer } from "lucide-react";
import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";
import { useToast } from "@/hooks/use-toast";
import { SortableExerciseCard } from "./SortableExerciseCard";
import type { ExerciseFormData, SetFormData } from "@/types/workout";

// Elapsed time display component
function ElapsedTime({ since }: { since: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(since).getTime()) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setText(h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [since]);
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono tabular-nums">
      <Timer className="h-3 w-3" />
      {text}
    </span>
  );
}

export function WorkoutLogger() {
  const { state, setOpen, close } = useGlobalWorkoutDrawer();
  const { open, workoutId, defaultDate, templateExercises, templateTitle } = state;

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const effectiveWorkoutId = workoutId || activeWorkoutId;

  const { data: existingWorkout } = useWorkoutById(effectiveWorkoutId ?? null);

  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
  const [saving, setSaving] = useState(false);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creatingActive, setCreatingActive] = useState(false);

  const isEdit = !!effectiveWorkoutId;
  const isActiveWorkout = !!activeWorkoutId || (!!existingWorkout && !existingWorkout.fecha_fin);

  // Pre-fill form when editing existing workout
  useEffect(() => {
    if (isEdit && existingWorkout && open) {
      setTitulo(existingWorkout.titulo);
      setFecha(new Date(existingWorkout.fecha).toISOString().slice(0, 10));
      setExercises(
        existingWorkout.ejercicios.map((ej) => ({
          tipo_ejercicio_id: ej.tipo_ejercicio_id,
          nombre: ej.tipo_ejercicio.nombre,
          id: ej.id,
          descanso: ej.descanso ?? undefined,
          repRange: ej.rep_range ?? undefined,
          targetRir: ej.rir_objetivo ?? undefined,
          sets: ej.series
            .sort((a, b) => a.numero_serie - b.numero_serie)
            .map((s) => ({
              repeticiones: s.repeticiones,
              peso_kg: Number(s.peso_kg),
              id: s.id,
              completed: s.completed,
            })),
        }))
      );
    }
  }, [isEdit, existingWorkout, open]);

  // Create active workout immediately when starting from template
  useEffect(() => {
    if (open && !workoutId && templateExercises && templateTitle && !activeWorkoutId && !creatingActive) {
      createActiveWorkout();
    }
  }, [open, workoutId, templateExercises, templateTitle]);

  // Reset form when opening for new workout (no template, no edit)
  useEffect(() => {
    if (open && !isEdit && !templateExercises) {
      setTitulo("");
      setExercises([]);
      setFecha(defaultDate || new Date().toISOString().slice(0, 10));
    }
  }, [open, isEdit, defaultDate, templateExercises]);

  // Reset activeWorkoutId when drawer closes
  useEffect(() => {
    if (!open) {
      setActiveWorkoutId(null);
    }
  }, [open]);

  const createActiveWorkout = async () => {
    if (!user || !templateExercises || !templateTitle) return;
    setCreatingActive(true);
    try {
      const { data: actividad, error: actError } = await supabase
        .from("actividad")
        .insert({ titulo: templateTitle.trim(), fecha: new Date().toISOString(), usuario_id: user.id })
        .select("id")
        .single();
      if (actError) throw actError;

      const ejercicioInserts = templateExercises.map((ex) => ({
        actividad_id: actividad.id,
        tipo_ejercicio_id: ex.tipo_ejercicio_id,
        usuario_id: user.id,
        descanso: ex.descanso ?? null,
        rep_range: ex.repRange ?? null,
        rir_objetivo: ex.targetRir ?? null,
      }));
      const { data: ejercicios, error: ejError } = await supabase
        .from("ejercicio")
        .insert(ejercicioInserts)
        .select("id");
      if (ejError) throw ejError;

      const serieInserts = templateExercises.flatMap((ex, i) =>
        ex.sets.map((s, si) => ({
          ejercicio_id: ejercicios![i].id,
          usuario_id: user.id,
          numero_serie: si + 1,
          repeticiones: 0,
          peso_kg: 0,
          completed: false,
        }))
      );
      const { data: series, error: sError } = await supabase
        .from("serie")
        .insert(serieInserts)
        .select("id");
      if (sError) throw sError;

      let idx = 0;
      const updatedExercises: ExerciseFormData[] = templateExercises.map((ex, i) => ({
        ...ex,
        id: ejercicios![i].id,
        sets: ex.sets.map((s) => ({
          ...s,
          id: series![idx++].id,
          completed: false,
        })),
      }));

      setActiveWorkoutId(actividad.id);
      setTitulo(templateTitle);
      setExercises(updatedExercises);
      invalidateAll();
    } catch (error: any) {
      toast({ title: "Error al crear entrenamiento", description: error.message, variant: "destructive" });
    } finally {
      setCreatingActive(false);
    }
  };

  const addExercise = async (tipoId: string, nombre: string) => {
    if (effectiveWorkoutId && user) {
      try {
        const { data: ej, error } = await supabase
          .from("ejercicio")
          .insert({ actividad_id: effectiveWorkoutId, tipo_ejercicio_id: tipoId, usuario_id: user.id })
          .select("id")
          .single();
        if (error) throw error;
        const { data: serie } = await supabase
          .from("serie")
          .insert({ ejercicio_id: ej.id, usuario_id: user.id, numero_serie: 1, repeticiones: 0, peso_kg: 0, completed: false })
          .select("id")
          .single();
        setExercises((prev) => [
          ...prev,
          { tipo_ejercicio_id: tipoId, nombre, id: ej.id, sets: [{ repeticiones: 0, peso_kg: 0, id: serie?.id, completed: false }] },
        ]);
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    } else {
      setExercises((prev) => [
        ...prev,
        { tipo_ejercicio_id: tipoId, nombre, sets: [{ repeticiones: 0, peso_kg: 0 }] },
      ]);
    }
    setExercisePickerOpen(false);
  };

  const removeExercise = async (index: number) => {
    const ex = exercises[index];
    if (ex.id && effectiveWorkoutId) {
      try {
        const setIds = ex.sets.filter((s) => s.id).map((s) => s.id!);
        if (setIds.length) await supabase.from("serie").delete().in("id", setIds);
        await supabase.from("ejercicio").delete().eq("id", ex.id);
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    }
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const addSet = async (exerciseIndex: number) => {
    const ex = exercises[exerciseIndex];
    if (ex.id && effectiveWorkoutId && user) {
      try {
        const { data, error } = await supabase
          .from("serie")
          .insert({
            ejercicio_id: ex.id,
            usuario_id: user.id,
            numero_serie: ex.sets.length + 1,
            repeticiones: 0,
            peso_kg: 0,
            completed: false,
          })
          .select("id")
          .single();
        if (error) throw error;
        setExercises((prev) =>
          prev.map((e, i) =>
            i === exerciseIndex
              ? { ...e, sets: [...e.sets, { repeticiones: 0, peso_kg: 0, id: data.id, completed: false }] }
              : e
          )
        );
        return;
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    }
    setExercises((prev) =>
      prev.map((e, i) =>
        i === exerciseIndex
          ? { ...e, sets: [...e.sets, { repeticiones: 0, peso_kg: 0 }] }
          : e
      )
    );
  };

  const removeSet = async (exerciseIndex: number, setIndex: number) => {
    const set = exercises[exerciseIndex]?.sets[setIndex];
    if (set?.id) {
      try {
        await supabase.from("serie").delete().eq("id", set.id);
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    }
    setExercises((prev) =>
      prev.map((e, i) =>
        i === exerciseIndex
          ? { ...e, sets: e.sets.filter((_, si) => si !== setIndex) }
          : e
      )
    );
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof SetFormData, value: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, sets: ex.sets.map((s, si) => (si === setIndex ? { ...s, [field]: value } : s)) }
          : ex
      )
    );
  };

  const handleAutoSaveSet = useCallback(
    async (exerciseIndex: number, setIndex: number) => {
      const set = exercises[exerciseIndex]?.sets[setIndex];
      if (!set?.id) return;
      try {
        await supabase
          .from("serie")
          .update({ repeticiones: set.repeticiones, peso_kg: set.peso_kg })
          .eq("id", set.id);
      } catch {
        // Silent fail for auto-save
      }
    },
    [exercises]
  );

  const handleToggleCompleted = useCallback(
    async (exerciseIndex: number, setIndex: number, completed: boolean) => {
      setExercises((prev) =>
        prev.map((ex, i) =>
          i === exerciseIndex
            ? { ...ex, sets: ex.sets.map((s, si) => (si === setIndex ? { ...s, completed } : s)) }
            : ex
        )
      );
      const set = exercises[exerciseIndex]?.sets[setIndex];
      if (set?.id) {
        try {
          await supabase.from("serie").update({ completed }).eq("id", set.id);
        } catch {
          // Silent fail
        }
      }
    },
    [exercises]
  );

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["lastWorkout"] });
    queryClient.invalidateQueries({ queryKey: ["weeklyWorkouts"] });
    queryClient.invalidateQueries({ queryKey: ["workoutHistory"] });
    queryClient.invalidateQueries({ queryKey: ["monthWorkoutDates"] });
    queryClient.invalidateQueries({ queryKey: ["workoutsForDate"] });
    queryClient.invalidateQueries({ queryKey: ["workout"] });
    queryClient.invalidateQueries({ queryKey: ["activeWorkout"] });
    queryClient.invalidateQueries({ queryKey: ["monthWorkouts"] });
  };

  const handleDelete = async () => {
    const targetId = effectiveWorkoutId;
    if (!targetId) return;
    setDeleting(true);
    try {
      const { data: oldEjercicios } = await supabase
        .from("ejercicio")
        .select("id")
        .eq("actividad_id", targetId);
      if (oldEjercicios?.length) {
        const oldIds = oldEjercicios.map((e) => e.id);
        await supabase.from("serie").delete().in("ejercicio_id", oldIds);
        await supabase.from("ejercicio").delete().eq("actividad_id", targetId);
      }
      const { error } = await supabase.from("actividad").delete().eq("id", targetId);
      if (error) throw error;
      toast({ title: "Entrenamiento eliminado correctamente" });
      invalidateAll();
      close();
      navigate("/history");
    } catch (error: any) {
      toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleSave = async () => {
    if (!user || !titulo.trim()) {
      toast({ title: "Completa el formulario", description: "Agrega un título.", variant: "destructive" });
      return;
    }

    // 1. Limpiamos los datos en memoria filtrando los 0
    const ejerciciosLimpios = exercises
      .map((ex) => {
        const seriesValidas = ex.sets.filter((s) => Number(s.repeticiones) > 0 || Number(s.peso_kg) > 0);
        return { ...ex, sets: seriesValidas };
      })
      .filter((ex) => ex.sets.length > 0);

    if (!isEdit && ejerciciosLimpios.length === 0) {
      toast({ title: "Entrenamiento vacío", description: "No hay ninguna serie con datos válidos.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (isEdit && effectiveWorkoutId) {
        // 2. LIMPIEZA EN BASE DE DATOS (Para entrenamientos activos o en edición)
        for (const ex of exercises) {
          const emptySets = ex.sets.filter((s) => Number(s.repeticiones) === 0 && Number(s.peso_kg) === 0);
          const validSets = ex.sets.filter((s) => Number(s.repeticiones) > 0 || Number(s.peso_kg) > 0);
          
          // Borrar las series a 0 de Supabase
          if (emptySets.length > 0) {
            const emptySetIds = emptySets.map((s) => s.id).filter(Boolean) as string[];
            if (emptySetIds.length > 0) {
              await supabase.from("serie").delete().in("id", emptySetIds);
            }
          }

          // Si el ejercicio se queda sin series válidas y tiene ID, lo borramos también de Supabase
          if (validSets.length === 0 && ex.id) {
            await supabase.from("ejercicio").delete().eq("id", ex.id);
          }
        }

        if (isActiveWorkout) {
          const { error } = await supabase
            .from("actividad")
            .update({
              titulo: titulo.trim(),
              fecha: new Date(fecha).toISOString(),
              fecha_fin: new Date().toISOString(),
            })
            .eq("id", effectiveWorkoutId);
          if (error) throw error;
          toast({ title: "¡Entrenamiento finalizado!" });
        } else {
          const { error } = await supabase
            .from("actividad")
            .update({
              titulo: titulo.trim(),
              fecha: new Date(fecha).toISOString(),
            })
            .eq("id", effectiveWorkoutId);
          if (error) throw error;
          toast({ title: "¡Entrenamiento actualizado!" });
        }
      } else {
        await handleCreate(ejerciciosLimpios);
        toast({ title: "¡Entrenamiento guardado!" });
      }
      invalidateAll();
      close();
    } catch (error: any) {
      toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (ejerciciosLimpios: ExerciseFormData[]) => {
    const { data: actividad, error: actError } = await supabase
      .from("actividad")
      .insert({
        titulo: titulo.trim(),
        fecha: new Date(fecha).toISOString(),
        fecha_fin: new Date().toISOString(),
        usuario_id: user!.id,
      })
      .select("id")
      .single();
    if (actError) throw actError;

    const ejercicioInserts = ejerciciosLimpios.map((ex) => ({
      actividad_id: actividad.id,
      tipo_ejercicio_id: ex.tipo_ejercicio_id,
      usuario_id: user!.id,
    }));

    const { data: ejerciciosDB, error: ejError } = await supabase
      .from("ejercicio")
      .insert(ejercicioInserts)
      .select("id");
    if (ejError) throw ejError;

    const serieInserts = ejerciciosLimpios.flatMap((ex, i) =>
      ex.sets.map((s, si) => ({
        ejercicio_id: ejerciciosDB![i].id,
        usuario_id: user!.id,
        numero_serie: si + 1,
        repeticiones: s.repeticiones,
        peso_kg: s.peso_kg,
        completed: true,
      }))
    );

    if (serieInserts.length > 0) {
      const { error: sError } = await supabase.from("serie").insert(serieInserts);
      if (sError) throw sError;
    }
  };

  const saveButtonLabel = isActiveWorkout ? "Finalizar" : isEdit ? "Actualizar" : "Guardar";

  // Intercept hardware back button: push a fake history entry when open
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ workoutDrawerOpen: true }, "", window.location.href);
    const handlePopState = () => {
      setOpen(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [open, setOpen]);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[92dvh] overflow-y-auto rounded-t-[20px] p-0">
          <SheetHeader className="sticky top-0 z-10 bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <SheetTitle className="text-lg">
                  {isActiveWorkout ? "Entrenamiento Activo" : isEdit ? "Editar Entrenamiento" : "Nuevo Entrenamiento"}
                </SheetTitle>
                {isActiveWorkout && existingWorkout && (
                  <ElapsedTime since={existingWorkout.fecha} />
                )}
              </div>
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
                <Button onClick={handleSave} disabled={saving || creatingActive} size="sm">
                  {(saving || creatingActive) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saveButtonLabel}
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

            {creatingActive && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Preparando entrenamiento…</span>
              </div>
            )}

            {/* Exercises */}
            <div className="space-y-4">
              {exercises.map((ex, ei) => (
                <ExerciseCard
                  key={ex.id || ei}
                  exercise={ex}
                  exerciseIndex={ei}
                  onRemoveExercise={() => removeExercise(ei)}
                  onAddSet={() => addSet(ei)}
                  onRemoveSet={(si) => removeSet(ei, si)}
                  onUpdateSet={(si, field, value) => updateSet(ei, si, field, value)}
                  onAutoSaveSet={(si) => handleAutoSaveSet(ei, si)}
                  onToggleCompleted={(si, completed) => handleToggleCompleted(ei, si, completed)}
                />
              ))}

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