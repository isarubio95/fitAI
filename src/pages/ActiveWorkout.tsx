import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useActiveWorkoutById, useActiveWorkoutActions } from "@/hooks/useActiveWorkout";
import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";
import { ActiveExerciseCard } from "@/components/workout/ActiveExerciseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, Square, Trash2, Timer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatMSS } from "@/hooks/useRestTimer";

function useElapsedTime(startDate: string | undefined) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startDate) return;
    const start = new Date(startDate).getTime();
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startDate]);
  return elapsed;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const ActiveWorkout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: workout, isLoading } = useActiveWorkoutById(id);
  const actions = useActiveWorkoutActions();

  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const elapsed = useElapsedTime(workout?.fecha);

  // Sync title
  useEffect(() => {
    if (workout) setTitleValue(workout.titulo);
  }, [workout?.titulo]);

  // If workout is finished, redirect
  useEffect(() => {
    if (workout && workout.fecha_fin) {
      navigate("/history", { replace: true });
    }
  }, [workout?.fecha_fin, navigate]);

  const handleAddExercise = async (tipoId: string, _nombre: string) => {
    if (!id) return;
    try {
      await actions.addExercise(id, tipoId);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setExercisePickerOpen(false);
  };

  const handleAddSet = async (ejercicioId: string) => {
    if (!id || !workout) return;
    const exercise = workout.ejercicios.find((e) => e.id === ejercicioId);
    const nextNum = (exercise?.series.length ?? 0) + 1;
    try {
      await actions.addSet(id, ejercicioId, nextNum);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteSet = async (serieId: string) => {
    if (!id) return;
    try {
      await actions.deleteSet(id, serieId);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteExercise = async (ejercicioId: string) => {
    if (!id) return;
    try {
      await actions.deleteExercise(id, ejercicioId);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdateSetField = async (serieId: string, field: string, value: number) => {
    try {
      await actions.updateSetField(serieId, field, value);
    } catch (e: any) {
      toast({ title: "Error al guardar", description: e.message, variant: "destructive" });
    }
  };

  const handleToggleCompleted = async (serieId: string, completed: boolean) => {
    try {
      await actions.toggleSetCompleted(serieId, completed);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleTitleBlur = async () => {
    setEditingTitle(false);
    if (!id || !titleValue.trim() || titleValue === workout?.titulo) return;
    try {
      await actions.updateTitle(id, titleValue.trim());
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleFinish = async () => {
    if (!id) return;
    setFinishing(true);
    try {
      await actions.finishWorkout(id);
      toast({ title: "¡Entrenamiento finalizado!" });
      navigate("/history");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setFinishing(false);
      setConfirmFinish(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await actions.deleteWorkout(id);
      toast({ title: "Entrenamiento eliminado correctamente" });
      navigate("/");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="p-4 md:p-8 text-center">
        <p className="text-muted-foreground">Entrenamiento no encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  const completedSets = workout.ejercicios.reduce(
    (acc, ej) => acc + ej.series.filter((s) => s.completed).length, 0
  );
  const totalSets = workout.ejercicios.reduce(
    (acc, ej) => acc + ej.series.length, 0
  );

  return (
    <div className="p-4 md:p-8 space-y-4 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md -mx-4 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <Input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
                autoFocus
                className="h-9 text-lg font-bold"
              />
            ) : (
              <h1
                className="text-lg font-bold truncate cursor-pointer hover:text-primary transition-colors"
                onClick={() => setEditingTitle(true)}
              >
                {workout.titulo}
              </h1>
            )}
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1 font-mono">
                <Timer className="h-3.5 w-3.5" />
                {formatElapsed(elapsed)}
              </span>
              <span>{completedSets}/{totalSets} series</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" onClick={() => setConfirmFinish(true)}>
              <Square className="h-3.5 w-3.5 mr-1" />
              Terminar
            </Button>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {workout.ejercicios.map((ej, i) => (
          <ActiveExerciseCard
            key={ej.id}
            exercise={ej}
            exerciseIndex={i}
            onAddSet={() => handleAddSet(ej.id)}
            onDeleteSet={handleDeleteSet}
            onDeleteExercise={() => handleDeleteExercise(ej.id)}
            onUpdateSetField={handleUpdateSetField}
            onToggleCompleted={handleToggleCompleted}
          />
        ))}

        <ExerciseSelector
          open={exercisePickerOpen}
          onOpenChange={setExercisePickerOpen}
          onSelect={handleAddExercise}
        />
      </div>

      {/* Confirm finish */}
      <AlertDialog open={confirmFinish} onOpenChange={setConfirmFinish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Finalizar entrenamiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Se registrará la duración total y el entrenamiento pasará al historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={finishing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinish} disabled={finishing}>
              {finishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Finalizar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete */}
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
    </div>
  );
};

export default ActiveWorkout;
