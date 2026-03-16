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
  onUpdateSet: (setIndex: number, field: keyof SetFormData, value: number) => void;
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
    transition: shouldAnimate ? 'transform 150ms ease' : 'none',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ExerciseCard
        {...props}
        isInSuperset={props.isInSuperset}
        dragHandleProps={listeners}
        onViewExerciseDetails={props.onViewExerciseDetails}
      />
    </div>
  );
}
