import { useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  onApplySuggestionToSet?: (setIndex: number, patch: Partial<SetFormData>) => void;
  onAutoSaveSet?: (setIndex: number) => void;
  onSetCompleted?: (setIndex: number, completed: boolean) => void;
  onViewExerciseDetails?: (exercise: ExerciseFormData) => void;
}

export function SortableExerciseCard({ id, ...props }: SortableExerciseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
    isSorting,
  } = useSortable({ id });

  // Only animate displacement of other items while a drag is actively happening
  const wasSorting = useRef(false);
  useEffect(() => { wasSorting.current = isSorting; }, [isSorting]);

  const shouldAnimate = isSorting && !isDragging;

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: shouldAnimate ? 'transform 200ms cubic-bezier(0.2, 0, 0, 1)' : 'none',
  };

  return (
    // La tarjeta visible durante el arrastre la pinta el DragOverlay de la
    // lista; esta se queda como hueco atenuado en su sitio.
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-30' : undefined}>
      <ExerciseCard
        {...props}
        isInSuperset={props.isInSuperset}
        dragHandleProps={{ ...listeners, ...attributes }}
        onViewExerciseDetails={props.onViewExerciseDetails}
      />
    </div>
  );
}
