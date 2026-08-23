import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkoutExerciseList } from "@/components/workout/workout-logger/WorkoutExerciseList";
import type { ExerciseFormData } from "@/types/workout";

vi.mock("@/components/workout/SortableExerciseCard", () => ({
  SortableExerciseCard: ({ exercise }: { exercise: { nombre: string } }) => (
    <div>{exercise.nombre}</div>
  ),
}));

const noop = () => undefined;

const listProps = {
  creatingActive: false,
  isActiveWorkout: true,
  onDragEnd: noop,
  getExerciseSortId: (ex: ExerciseFormData, index: number) => ex.id ?? `${ex.nombre}-${index}`,
  onRemoveExercise: noop,
  onAddSet: noop,
  onRemoveSet: noop,
  onUpdateSet: noop,
  onSeedSetFromPrevious: noop,
  onApplySuggestionToSet: noop,
  onAutoSaveSet: noop,
  onSetCompleted: noop,
  onViewExerciseDetails: noop,
};

describe("WorkoutExerciseList", () => {
  it("no muestra el encabezado ni el texto de vacío si no hay ejercicios", () => {
    render(<WorkoutExerciseList {...listProps} exercises={[]} />);

    expect(screen.queryByText("Ejercicios")).not.toBeInTheDocument();
    expect(screen.queryByText(/0 ejercicios/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText("Añade ejercicios para registrar tu entrenamiento."),
    ).not.toBeInTheDocument();
  });

  it("no muestra el encabezado en el entrenamiento activo", () => {
    render(
      <WorkoutExerciseList
        {...listProps}
        exercises={[
          {
            nombre: "Press banca",
            registro_series: "peso_reps",
            sets: [{ repeticiones: 0, peso_kg: 0 }],
          },
        ]}
      />,
    );

    expect(screen.queryByText("Ejercicios")).not.toBeInTheDocument();
    expect(screen.queryByText("1 ejercicio")).not.toBeInTheDocument();
    expect(screen.getByText("Press banca")).toBeInTheDocument();
  });

  it("muestra el encabezado al editar un entrenamiento completado", () => {
    render(
      <WorkoutExerciseList
        {...listProps}
        isActiveWorkout={false}
        exercises={[
          {
            nombre: "Press banca",
            registro_series: "peso_reps",
            sets: [{ repeticiones: 0, peso_kg: 0 }],
          },
        ]}
      />,
    );

    expect(screen.getByText("Ejercicios")).toBeInTheDocument();
    expect(screen.getByText("1 ejercicio")).toBeInTheDocument();
    expect(screen.getByText("Press banca")).toBeInTheDocument();
  });
});
