import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GymLiveSummaryView } from "@/components/workout/GymLiveSummaryView";

vi.mock("@/components/gym/GymPickerSheet", () => ({
  GymPickerSheet: () => null,
}));

vi.mock("@/components/routine/RoutineIconPicker", () => ({
  WorkoutIconPickerTrigger: () => (
    <button type="button" aria-label="Cambiar icono del entrenamiento">
      icono
    </button>
  ),
}));

const baseProps = {
  elapsedSec: 3661,
  completedSets: 18,
  volumeKg: 4200,
  fcMedia: 142 as number | null,
  fcMax: 168 as number | null,
  titulo: "Push",
  icono: "dumbbell" as const,
  allowEditTitleAndIcon: true,
  comentarios: "",
  esPublica: false,
  rpe: null as number | null,
  gimnasio: null,
  saving: false,
  discarding: false,
  canSaveAsRoutine: true,
  onTituloChange: vi.fn(),
  onIconoChange: vi.fn(),
  onComentariosChange: vi.fn(),
  onEsPublicaChange: vi.fn(),
  onRpeChange: vi.fn(),
  onGimnasioChange: vi.fn(),
  onSaveAsRoutine: vi.fn(),
  onSave: vi.fn(),
  onDiscard: vi.fn(),
  onBack: vi.fn(),
};

describe("GymLiveSummaryView", () => {
  it("muestra métricas, título, comentarios, RPE y gimnasio", () => {
    render(<GymLiveSummaryView {...baseProps} />);

    expect(screen.getByText(/1:01:01/)).toBeInTheDocument();
    expect(screen.getByText(/18 series/)).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("Push");
    expect(screen.getByLabelText("Comentarios (opcional)")).toBeInTheDocument();
    expect(screen.getByText("¿Qué tan duro se sintió?")).toBeInTheDocument();
    expect(screen.getByLabelText("Gimnasio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar entrenamiento" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Descartar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar como rutina" })).toBeInTheDocument();
  });

  it("oculta el icono y guardar-como-rutina si viene de una rutina", () => {
    render(
      <GymLiveSummaryView {...baseProps} allowEditTitleAndIcon={false} canSaveAsRoutine={false} />,
    );

    expect(screen.queryByRole("button", { name: "Cambiar icono del entrenamiento" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Guardar como rutina" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toBeInTheDocument();
  });
});
