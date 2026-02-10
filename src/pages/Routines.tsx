import { useState } from "react";
import { useRoutines, useDeleteRoutine } from "@/hooks/useRoutines";
import { useRoutineById } from "@/hooks/useRoutines";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Play, Pencil, Trash2, Dumbbell } from "lucide-react";
import { RoutineForm } from "@/components/routine/RoutineForm";
import { WorkoutLogger } from "@/components/workout/WorkoutLogger";
import { useToast } from "@/hooks/use-toast";
import type { RutinaWithDetails } from "@/types/routine";
import type { ExerciseFormData } from "@/types/workout";
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

const Routines = () => {
  const { data: routines, isLoading } = useRoutines();
  const deleteRoutine = useDeleteRoutine();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Start workout from routine
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [templateExercises, setTemplateExercises] = useState<ExerciseFormData[] | undefined>();
  const [templateTitle, setTemplateTitle] = useState<string | undefined>();

  const openCreate = () => {
    setEditId(null);
    setFormOpen(true);
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRoutine.mutateAsync(deleteId);
      toast({ title: "Rutina eliminada" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setDeleteId(null);
  };

  const startRoutine = (routine: RutinaWithDetails) => {
    const exercises: ExerciseFormData[] = routine.ejercicios
      .sort((a, b) => a.orden - b.orden)
      .map((ej) => ({
        tipo_ejercicio_id: ej.tipo_ejercicio_id,
        nombre: ej.tipo_ejercicio.nombre,
        repRange: `${ej.repes_min}-${ej.repes_max}`,
        sets: Array.from({ length: ej.series_objetivo }, () => ({
          repeticiones: 0,
          peso_kg: 0,
        })),
      }));

    setTemplateTitle(routine.nombre);
    setTemplateExercises(exercises);
    setLoggerOpen(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rutinas</h1>
          <p className="text-sm text-muted-foreground">Tus plantillas de entrenamiento</p>
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !routines?.length ? (
        <div className="text-center py-12 space-y-3">
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Aún no tienes rutinas creadas.</p>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Crear Rutina
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {routines.map((r) => (
            <Card key={r.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-base">{r.nombre}</h2>
                    {r.descripcion && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{r.descripcion}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Dumbbell className="h-3 w-3" />
                      {r.ejercicios.length} ejercicio{r.ejercicios.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full mt-3"
                  onClick={() => startRoutine(r)}
                >
                  <Play className="h-4 w-4 mr-2" /> Iniciar Entrenamiento
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* FAB */}
      <Button
        size="lg"
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 h-14 w-14 rounded-full shadow-lg shadow-primary/30 z-40"
        onClick={openCreate}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <RoutineForm open={formOpen} onOpenChange={setFormOpen} routineId={editId} />

      <WorkoutLogger
        open={loggerOpen}
        onOpenChange={(open) => {
          setLoggerOpen(open);
          if (!open) {
            setTemplateExercises(undefined);
            setTemplateTitle(undefined);
          }
        }}
        templateExercises={templateExercises}
        templateTitle={templateTitle}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rutina?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Routines;
