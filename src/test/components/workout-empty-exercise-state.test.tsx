import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkoutEmptyExerciseState } from "@/components/workout/workout-logger/WorkoutEmptyExerciseState";

vi.mock("@/components/exercise/ExerciseSelector", () => ({
  ExerciseSelector: ({ trigger }: { trigger: React.ReactNode }) => <div>{trigger}</div>,
}));

describe("WorkoutEmptyExerciseState", () => {
  it("centra el mensaje y el botón de añadir", () => {
    render(
      <WorkoutEmptyExerciseState
        open={false}
        onOpenChange={() => undefined}
        onAddExercise={() => undefined}
      />,
    );

    expect(
      screen.getByText("Añade un ejercicio para empezar el entrenamiento"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Agregar ejercicio")).toBeInTheDocument();
  });
});
