import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExerciseCard } from "./ExerciseCard";
import type { ExerciseFormData, SetFormData } from "@/types/workout";

interface SortableExerciseCardProps {
  id: string;
  exercise: ExerciseFormData;
  exerciseIndex: number;
  onRemoveExercise: () => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, field: keyof SetFormData, value: number) => void;
  onAutoSaveSet?: (setIndex: number) => void;
}

export function SortableExerciseCard({ id, ...props }: SortableExerciseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ExerciseCard {...props} dragHandleProps={listeners} />
    </div>
  );
}
