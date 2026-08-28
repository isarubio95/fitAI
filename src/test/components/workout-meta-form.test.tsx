import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkoutMetaForm } from "@/components/workout/workout-logger/WorkoutMetaForm";

vi.mock("@/components/gym/GymPickerSheet", () => ({
  GymPickerSheet: () => null,
}));

vi.mock("@/components/dashboard/WorkoutDetailsSheet", () => ({
  WorkoutLeadingRoutineIcon: () => <span>icono</span>,
}));

vi.mock("@/components/routine/RoutineIconPicker", () => ({
  RoutineIconPicker: () => null,
  WorkoutIconPickerTrigger: () => <span>icono</span>,
}));

const baseProps = {
  hideWorkoutDate: true,
  titulo: "Piernas",
  onTituloChange: vi.fn(),
  workoutIcon: "dumbbell" as const,
  onWorkoutIconChange: vi.fn(),
  creatingActive: false,
  fecha: "2026-08-18",
  onFechaChange: vi.fn(),
  esPublica: false,
  onEsPublicaChange: vi.fn(),
  gimnasio: null,
  onGimnasioChange: vi.fn(),
  rpe: null,
  onRpeChange: vi.fn(),
  comentarios: "",
  onComentariosChange: vi.fn(),
};

describe("WorkoutMetaForm", () => {
  it("no muestra el gimnasio durante un entrenamiento activo", () => {
    render(
      <WorkoutMetaForm
        {...baseProps}
        isActiveWorkout
        isEditingCompletedWorkout={false}
      />,
    );

    expect(screen.queryByLabelText("Gimnasio")).not.toBeInTheDocument();
  });

  it("muestra el gimnasio al editar un entrenamiento completado", () => {
    render(
      <WorkoutMetaForm
        {...baseProps}
        hideWorkoutDate={false}
        isActiveWorkout={false}
        isEditingCompletedWorkout
      />,
    );

    expect(screen.getByLabelText("Gimnasio")).toBeInTheDocument();
  });

  it("permite editar el RPE de un entrenamiento completado", () => {
    render(
      <WorkoutMetaForm
        {...baseProps}
        hideWorkoutDate={false}
        isActiveWorkout={false}
        isEditingCompletedWorkout
      />,
    );

    expect(screen.getByText("¿Qué tan duro se sintió?")).toBeInTheDocument();
    expect(screen.getByLabelText("Comentarios")).toBeInTheDocument();
  });

  it("pide comentarios, RPE y comunidad en alta manual", () => {
    render(
      <WorkoutMetaForm
        {...baseProps}
        hideWorkoutDate={false}
        isActiveWorkout={false}
        isEditingCompletedWorkout={false}
      />,
    );

    expect(screen.getByLabelText("Comentarios")).toBeInTheDocument();
    expect(screen.getByText("¿Qué tan duro se sintió?")).toBeInTheDocument();
    expect(screen.getByText("Publicar en comunidad")).toBeInTheDocument();
    expect(screen.getByLabelText("Gimnasio")).toBeInTheDocument();
  });
});
