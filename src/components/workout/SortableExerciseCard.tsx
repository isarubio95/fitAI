import { cn } from "@/lib/utils";
import { useSortableItem } from "@/components/ui/sortable-list";
import { ExerciseCard } from "./ExerciseCard";
import type { ExerciseFormData, SetFormData } from "@/types/workout";

interface SortableExerciseCardProps {
  id: string;
  exercise: ExerciseFormData;
  exerciseIndex: number;
  isInSuperset?: boolean;
  onRemoveExercise: () => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, field: keyof SetFormData, value: number | null) => void;
  onSeedSetFromPrevious?: (setIndex: number, patch: Partial<SetFormData>) => void;
  onApplySuggestionToSet?: (
    setIndex: number,
    patch: Partial<SetFormData>,
    options?: { revert?: boolean },
  ) => void;
  onAutoSaveSet?: (setIndex: number) => void;
  onSetCompleted?: (setIndex: number, completed: boolean) => void;
  onViewExerciseDetails?: (exercise: ExerciseFormData) => void;
}

export function SortableExerciseCard({ id, ...props }: SortableExerciseCardProps) {
  const { setNodeRef, handleProps, isDragging, isKeyboardDragging } = useSortableItem(id);

  return (
    // Mientras la ficha está en el aire la pinta el overlay de la lista; esta
    // se queda invisible pero ocupando su sitio, para que nada se recoloque.
    // Con teclado no hay overlay: la propia ficha se levanta y se mueve.
    <div
      ref={setNodeRef}
      className={cn(
        isDragging && "pointer-events-none opacity-0",
        isKeyboardDragging && "relative z-10 rounded-xl shadow-lg ring-1 ring-primary/40",
      )}
      inert={isDragging || undefined}
    >
      <ExerciseCard {...props} dragHandleProps={handleProps} />
    </div>
  );
}
