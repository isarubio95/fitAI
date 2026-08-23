import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { RegistroSeries } from "@/types/workout";

const { mockUseAuth, mockUseRoutineById, mockUseExerciseCatalog } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseRoutineById: vi.fn(),
  mockUseExerciseCatalog: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("@/hooks/useRoutines", () => ({
  useRoutineById: mockUseRoutineById,
}));

vi.mock("@/hooks/useExerciseCatalog", () => ({
  useExerciseCatalog: mockUseExerciseCatalog,
}));

vi.mock("@/components/exercise/ExerciseSelector", () => ({
  ExerciseSelector: ({
    onSelect,
    trigger,
  }: {
    onSelect: (
      catalogRef: { tipo_ejercicio_id?: string; registro_series?: RegistroSeries },
      nombre: string,
    ) => void;
    trigger?: ReactNode;
  }) => (
    <div>
      {trigger}
      <button
        type="button"
        onClick={() => onSelect({ tipo_ejercicio_id: "ex-1", registro_series: "peso_reps" }, "Press banca")}
      >
        Agregar Ejercicio
      </button>
    </div>
  ),
}));

vi.mock("@/components/exercise/ExerciseDetailSheet", () => ({
  default: () => null,
}));

import { RoutineForm } from "@/components/routine/RoutineForm";

function wrap(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

describe("RoutineForm", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: { id: "u1" } });
    mockUseRoutineById.mockReturnValue({ data: undefined });
    mockUseExerciseCatalog.mockReturnValue({ data: [] });
  });

  it("muestra el estado vacío del entreno y desactiva Guardar sin ejercicios", () => {
    render(wrap(<RoutineForm open onOpenChange={() => undefined} />));

    expect(screen.getByText("Añade un ejercicio para completar la rutina")).toBeInTheDocument();
    expect(screen.getByLabelText("Agregar ejercicio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
  });

  it("habilita Guardar al añadir el primer ejercicio", () => {
    render(wrap(<RoutineForm open onOpenChange={() => undefined} />));

    fireEvent.click(screen.getByRole("button", { name: "Agregar Ejercicio" }));

    expect(screen.getByRole("button", { name: "Guardar" })).toBeEnabled();
    expect(screen.getByText("Press banca")).toBeInTheDocument();
  });
});
