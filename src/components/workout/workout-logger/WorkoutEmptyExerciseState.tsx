import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";
import type { RegistroSeries } from "@/types/workout";

type WorkoutEmptyExerciseStateProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExercise: (
    catalogRef: {
      tipo_ejercicio_id?: string;
      usuario_ejercicio_id?: string;
      registro_series?: RegistroSeries;
    },
    nombre: string,
  ) => void;
};

export function WorkoutEmptyExerciseState({
  open,
  onOpenChange,
  onAddExercise,
}: WorkoutEmptyExerciseStateProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6">
      <div className="pointer-events-auto flex flex-col items-center gap-4 text-center">
        <p className="max-w-66 text-sm text-muted-foreground">
          Añade un ejercicio para empezar el entrenamiento
        </p>
        <ExerciseSelector
          variant="drawer"
          open={open}
          onOpenChange={onOpenChange}
          onSelect={onAddExercise}
          trigger={
            <Button
              variant="default"
              size="icon"
              className="h-12 w-12 rounded-full shadow-md"
              aria-label="Agregar ejercicio"
            >
              <Plus className="h-5 w-5 stroke-[2px]" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
