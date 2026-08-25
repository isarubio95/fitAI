import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkoutFloatingActionBar } from "@/components/workout/workout-logger/WorkoutFloatingActionBar";

vi.mock("@/components/exercise/ExerciseSelector", () => ({
  ExerciseSelector: ({ trigger }: { trigger: React.ReactNode }) => <div>{trigger}</div>,
}));

const barProps = {
  isEditingCompletedWorkout: false,
  isActiveWorkout: true,
  deleting: false,
  creatingActive: false,
  onClose: () => undefined,
  onRequestDelete: () => undefined,
  isPaused: false,
  onTogglePause: () => undefined,
  exercisePickerOpen: false,
  onExercisePickerOpenChange: () => undefined,
  onAddExercise: () => undefined,
  showFinishButton: false,
  onFinish: () => undefined,
  saving: false,
  canSubmitPrimaryAction: false,
  saveButtonLabel: "Finalizar",
  primaryActionIcon: null,
};

describe("WorkoutFloatingActionBar", () => {
  it("oculta el botón de añadir cuando no hay ejercicios", () => {
    render(<WorkoutFloatingActionBar {...barProps} exerciseCount={0} />);
    expect(screen.queryByLabelText("Agregar ejercicio")).not.toBeInTheDocument();
  });

  it("muestra el botón de añadir cuando ya hay ejercicios", () => {
    render(<WorkoutFloatingActionBar {...barProps} exerciseCount={1} />);
    expect(screen.getByLabelText("Agregar ejercicio")).toBeInTheDocument();
  });

  it("deshabilita la pausa hasta que arranca el cronómetro", () => {
    render(<WorkoutFloatingActionBar {...barProps} exerciseCount={0} canPause={false} />);
    expect(screen.getByLabelText("Pausar tiempo")).toBeDisabled();
  });
});
