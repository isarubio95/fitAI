import type { ReactNode } from "react";
import { Loader2, Trash2, Pause, Play, Plus, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";
import type { RegistroSeries } from "@/types/workout";
import { cn } from "@/lib/utils";
import { ACTIVE_WORKOUT_FLOATING_SHELL } from "./constants";

type WorkoutFloatingActionBarProps = {
  isEditingCompletedWorkout: boolean;
  isActiveWorkout: boolean;
  deleting: boolean;
  creatingActive: boolean;
  onClose: () => void;
  onRequestDelete: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  exercisePickerOpen: boolean;
  onExercisePickerOpenChange: (open: boolean) => void;
  onAddExercise: (
    catalogRef: {
      tipo_ejercicio_id?: string;
      usuario_ejercicio_id?: string;
      registro_series?: RegistroSeries;
    },
    nombre: string,
  ) => void;
  exerciseCount: number;
  showFinishButton: boolean;
  onFinish: () => void;
  saving: boolean;
  canSubmitPrimaryAction: boolean;
  saveButtonLabel: string;
  primaryActionIcon: ReactNode;
};

export function WorkoutFloatingActionBar({
  isEditingCompletedWorkout,
  isActiveWorkout,
  deleting,
  creatingActive,
  onClose,
  onRequestDelete,
  isPaused,
  onTogglePause,
  exercisePickerOpen,
  onExercisePickerOpenChange,
  onAddExercise,
  exerciseCount,
  showFinishButton,
  onFinish,
  saving,
  canSubmitPrimaryAction,
  saveButtonLabel,
  primaryActionIcon,
}: WorkoutFloatingActionBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0))]">
      <div
        data-vaul-no-drag
        className={cn("pointer-events-auto flex items-center gap-1.5", ACTIVE_WORKOUT_FLOATING_SHELL)}
      >
        {isEditingCompletedWorkout ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-foreground hover:bg-muted/60 hover:text-foreground"
            onClick={onClose}
            disabled={deleting || creatingActive}
            aria-label="Salir de la edición"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onRequestDelete}
            disabled={deleting || creatingActive}
            aria-label="Cancelar entrenamiento"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        {isActiveWorkout ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full",
              isPaused && "bg-amber-500/15 text-amber-600 hover:bg-amber-500/20 hover:text-amber-600 dark:text-amber-400",
            )}
            onClick={onTogglePause}
            aria-label={isPaused ? "Reanudar tiempo" : "Pausar tiempo"}
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onRequestDelete}
            disabled={deleting || creatingActive}
            aria-label="Borrar entrenamiento"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
        {exerciseCount > 0 ? (
          <ExerciseSelector
            variant="drawer"
            open={exercisePickerOpen}
            onOpenChange={onExercisePickerOpenChange}
            onSelect={onAddExercise}
            trigger={
              <Button
                variant={isActiveWorkout ? "secondary" : "default"}
                size="icon"
                className="h-12 w-12 rounded-full shadow-md"
                aria-label="Agregar ejercicio"
              >
                <Plus className="h-5 w-5 stroke-[2px]" />
              </Button>
            }
          />
        ) : null}
      </div>
      {showFinishButton && (
        <div
          data-vaul-no-drag
          className={cn("pointer-events-auto flex items-center", ACTIVE_WORKOUT_FLOATING_SHELL)}
        >
          <Button
            variant="default"
            className="h-12 gap-1.5 rounded-full px-5 font-semibold"
            onClick={onFinish}
            disabled={saving || creatingActive || !canSubmitPrimaryAction}
          >
            {saving || creatingActive ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              primaryActionIcon
            )}
            {saveButtonLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
