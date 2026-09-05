import { useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SortableList, useSortableAnchor } from "@/components/ui/sortable-list";
import { ExerciseCard } from "../ExerciseCard";
import { SortableExerciseCard } from "../SortableExerciseCard";
import { groupExercisesBySuperset } from "./groupExercisesBySuperset";
import type { ExerciseFormData, SetFormData } from "@/types/workout";

export type WorkoutExerciseListProps = {
  exercises: ExerciseFormData[];
  isActiveWorkout: boolean;
  /** Índices sobre `exercises`, con semántica de `arrayMove`. */
  onReorder: (from: number, to: number) => void;
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

/** Handlers inertes para la copia de solo lectura que se pinta al arrastrar. */
const noop = () => {};

/**
 * Cabecera de superserie. No se arrastra, pero tiene que acompañar a la primera
 * ficha de su grupo: si se quedara fija, el bloque se partiría al reordenar.
 */
function SupersetHeader({ anchorId }: { anchorId: string }) {
  const ref = useSortableAnchor(anchorId);
  return (
    <div ref={ref} className="bg-primary/5 px-6 pt-2 pb-1">
      <span className="text-xs font-medium text-primary">🔗 Superserie</span>
    </div>
  );
}

export function WorkoutExerciseList({
  exercises,
  isActiveWorkout,
  onReorder,
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
  const sortIds = useMemo(
    () => exercises.map((ex, index) => getExerciseSortId(ex, index)),
    [exercises, getExerciseSortId],
  );

  const renderOverlay = useCallback(
    (id: string) => {
      const index = sortIds.indexOf(id);
      const exercise = exercises[index];
      if (!exercise) return null;
      return (
        <ExerciseCard
          exercise={exercise}
          exerciseIndex={index}
          isInSuperset={!!exercise.superset_id}
          onRemoveExercise={noop}
          onAddSet={noop}
          onRemoveSet={noop}
          onUpdateSet={noop}
          onAutoSaveSet={noop}
        />
      );
    },
    [exercises, sortIds],
  );

  const getItemLabel = useCallback(
    (id: string) => exercises[sortIds.indexOf(id)]?.nombre ?? "ejercicio",
    [exercises, sortIds],
  );

  if (exercises.length === 0) return null;

  return (
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

        <SortableList
          items={sortIds}
          onReorder={onReorder}
          renderOverlay={renderOverlay}
          getItemLabel={getItemLabel}
          className="flex flex-col gap-1 bg-background"
        >
          {groupExercisesBySuperset(exercises).map((group) => {
            const isSuperset = !!group.supersetId && group.items.length > 1;
            if (isSuperset) {
              const firstId = getExerciseSortId(
                group.items[0].exercise,
                group.items[0].originalIndex,
              );
              return (
                <div key={group.supersetId} className="flex flex-col gap-1 bg-background">
                  <SupersetHeader anchorId={firstId} />
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
                            ? (si, patch, options) => onApplySuggestionToSet(ei, si, patch, options)
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
                  isActiveWorkout ? (si, patch) => onSeedSetFromPrevious(ei, si, patch) : undefined
                }
                onApplySuggestionToSet={
                  isActiveWorkout
                    ? (si, patch, options) => onApplySuggestionToSet(ei, si, patch, options)
                    : undefined
                }
                onAutoSaveSet={(si) => onAutoSaveSet(ei, si)}
                onSetCompleted={
                  isActiveWorkout ? (si, completed) => onSetCompleted(ei, si, completed) : undefined
                }
                onViewExerciseDetails={onViewExerciseDetails}
              />
            );
          })}
        </SortableList>
      </CardContent>
    </Card>
  );
}
