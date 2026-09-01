import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent } from "@/components/ui/card";
import { SortableDragOverlay } from "@/components/ui/sortable-drag-overlay";
import { restrictToVerticalAxis } from "@/lib/dndModifiers";
import { ExerciseCard } from "../ExerciseCard";
import { SortableExerciseCard } from "../SortableExerciseCard";
import { groupExercisesBySuperset } from "./groupExercisesBySuperset";
import type { ExerciseFormData, SetFormData } from "@/types/workout";

export type WorkoutExerciseListProps = {
  exercises: ExerciseFormData[];
  isActiveWorkout: boolean;
  onDragEnd: (event: DragEndEvent) => void;
  getExerciseSortId: (ex: ExerciseFormData, index: number) => string;
  onRemoveExercise: (index: number) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onUpdateSet: (
    exerciseIndex: number,
    setIndex: number,
    field: keyof SetFormData,
    value: number | null,
  ) => void;
  onSeedSetFromPrevious: (exerciseIndex: number, setIndex: number, patch: Partial<SetFormData>) => void;
  onApplySuggestionToSet: (
    exerciseIndex: number,
    setIndex: number,
    patch: Partial<SetFormData>,
    options?: { revert?: boolean },
  ) => void;
  onAutoSaveSet: (exerciseIndex: number, setIndex: number) => void;
  onSetCompleted: (exerciseIndex: number, setIndex: number, completed: boolean) => void;
  onViewExerciseDetails: (exercise: ExerciseFormData) => void;
};

/** Handlers inertes para la copia de solo lectura que muestra el DragOverlay. */
const noop = () => {};

export function WorkoutExerciseList({
  exercises,
  isActiveWorkout,
  onDragEnd,
  getExerciseSortId,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onSeedSetFromPrevious,
  onApplySuggestionToSet,
  onAutoSaveSet,
  onSetCompleted,
  onViewExerciseDetails,
}: WorkoutExerciseListProps) {
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /** sortId del ejercicio en arrastre; alimenta la tarjeta del DragOverlay. */
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggingIndex = draggingId
    ? exercises.findIndex((ex, i) => getExerciseSortId(ex, i) === draggingId)
    : -1;
  const draggingExercise = draggingIndex >= 0 ? exercises[draggingIndex] : null;

  const handleDragStart = (event: DragStartEvent) => setDraggingId(String(event.active.id));
  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingId(null);
    onDragEnd(event);
  };

  return (
    <>
      {exercises.length === 0 ? null : (
      <Card className="w-full max-w-none rounded-none border-x-0 border-border/20 bg-background shadow-none md:border-x">
        <CardContent className="p-0">
          {!isActiveWorkout && (
            <div className="flex items-center justify-between gap-3 px-6 pt-4">
              <div className="font-semibold">Ejercicios</div>
              <div className="text-xs text-muted-foreground tabular-nums">
                {exercises.length} ejercicio{exercises.length === 1 ? "" : "s"}
              </div>
            </div>
          )}

          <DndContext
            sensors={dndSensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDraggingId(null)}
          >
            <SortableContext
              items={exercises.map((ex, i) => getExerciseSortId(ex, i))}
              strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-1 bg-background">
                  {groupExercisesBySuperset(exercises).map((group) => {
                    const isSuperset = !!group.supersetId && group.items.length > 1;
                    if (isSuperset) {
                      return (
                        <div key={group.supersetId} className="flex flex-col gap-1 bg-background">
                          <div className="bg-primary/5 px-6 pt-2 pb-1">
                            <span className="text-xs font-medium text-primary">🔗 Superserie</span>
                          </div>
                          <div className="flex flex-col gap-1 bg-background">
                            {group.items.map(({ exercise: ex, originalIndex: ei }) => (
                              <SortableExerciseCard
                                key={getExerciseSortId(ex, ei)}
                                id={getExerciseSortId(ex, ei)}
                                exercise={ex}
                                exerciseIndex={ei}
                                isInSuperset
                                onRemoveExercise={() => onRemoveExercise(ei)}
                                onAddSet={() => onAddSet(ei)}
                                onRemoveSet={(si) => onRemoveSet(ei, si)}
                                onUpdateSet={(si, field, value) => onUpdateSet(ei, si, field, value)}
                                onSeedSetFromPrevious={
                                  isActiveWorkout
                                    ? (si, patch) => onSeedSetFromPrevious(ei, si, patch)
                                    : undefined
                                }
                                onApplySuggestionToSet={
                                  isActiveWorkout
                                    ? (si, patch, options) =>
                                        onApplySuggestionToSet(ei, si, patch, options)
                                    : undefined
                                }
                                onAutoSaveSet={(si) => onAutoSaveSet(ei, si)}
                                onSetCompleted={
                                  isActiveWorkout
                                    ? (si, completed) => onSetCompleted(ei, si, completed)
                                    : undefined
                                }
                                onViewExerciseDetails={onViewExerciseDetails}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    }
                    const { exercise: ex, originalIndex: ei } = group.items[0];
                    return (
                      <SortableExerciseCard
                        key={getExerciseSortId(ex, ei)}
                        id={getExerciseSortId(ex, ei)}
                        exercise={ex}
                        exerciseIndex={ei}
                        onRemoveExercise={() => onRemoveExercise(ei)}
                        onAddSet={() => onAddSet(ei)}
                        onRemoveSet={(si) => onRemoveSet(ei, si)}
                        onUpdateSet={(si, field, value) => onUpdateSet(ei, si, field, value)}
                        onSeedSetFromPrevious={
                          isActiveWorkout
                            ? (si, patch) => onSeedSetFromPrevious(ei, si, patch)
                            : undefined
                        }
                        onApplySuggestionToSet={
                          isActiveWorkout
                            ? (si, patch, options) =>
                                onApplySuggestionToSet(ei, si, patch, options)
                            : undefined
                        }
                        onAutoSaveSet={(si) => onAutoSaveSet(ei, si)}
                        onSetCompleted={
                          isActiveWorkout
                            ? (si, completed) => onSetCompleted(ei, si, completed)
                            : undefined
                        }
                        onViewExerciseDetails={onViewExerciseDetails}
                      />
                    );
                  })}
                </div>
            </SortableContext>

            <SortableDragOverlay>
              {draggingExercise ? (
                <ExerciseCard
                  exercise={draggingExercise}
                  exerciseIndex={draggingIndex}
                  isInSuperset={!!draggingExercise.superset_id}
                  onRemoveExercise={noop}
                  onAddSet={noop}
                  onRemoveSet={noop}
                  onUpdateSet={noop}
                  onAutoSaveSet={noop}
                />
              ) : null}
            </SortableDragOverlay>
          </DndContext>
        </CardContent>
      </Card>
      )}
    </>
  );
}
