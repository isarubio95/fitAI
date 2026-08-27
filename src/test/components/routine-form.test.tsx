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

  describe("plan por serie", () => {
    /** Añade un ejercicio y entra en el modo avanzado. */
    const openPlanEditor = () => {
      render(wrap(<RoutineForm open onOpenChange={() => undefined} />));
      fireEvent.click(screen.getByRole("button", { name: "Agregar Ejercicio" }));
      fireEvent.click(
        screen.getByTitle("Personalizar series (pirámide, calentamiento…)"),
      );
    };

    it("un ejercicio nuevo empieza en modo simple", () => {
      render(wrap(<RoutineForm open onOpenChange={() => undefined} />));
      fireEvent.click(screen.getByRole("button", { name: "Agregar Ejercicio" }));

      expect(screen.getByText("Series")).toBeInTheDocument();
      expect(screen.getByText("Reps mín")).toBeInTheDocument();
      expect(screen.queryByText("Plantillas:")).not.toBeInTheDocument();
    });

    it("materializa las series actuales al personalizar, sin cambiar el objetivo", () => {
      openPlanEditor();

      expect(screen.getByText("Plantillas:")).toBeInTheDocument();
      // 3 series por defecto, todas con el rango base del ejercicio.
      const repInputs = screen.getAllByDisplayValue("8-12");
      expect(repInputs).toHaveLength(3);
      // Los inputs escalares desaparecen: el plan es ahora la fuente.
      expect(screen.queryByText("Reps mín")).not.toBeInTheDocument();
    });

    it("la pirámide descendente deja rangos distintos por serie", () => {
      openPlanEditor();
      fireEvent.click(screen.getByRole("button", { name: "Pirámide ↓" }));

      expect(screen.getByDisplayValue("8-12")).toBeInTheDocument();
      expect(screen.getByDisplayValue("6-10")).toBeInTheDocument();
      expect(screen.getByDisplayValue("4-8")).toBeInTheDocument();
    });

    it("añadir y quitar series actualiza el plan", () => {
      openPlanEditor();
      expect(screen.getAllByDisplayValue("8-12")).toHaveLength(3);

      fireEvent.click(screen.getByRole("button", { name: "+ Añadir serie" }));
      expect(screen.getAllByDisplayValue("8-12")).toHaveLength(4);

      fireEvent.click(screen.getAllByTitle("Quitar serie")[0]);
      expect(screen.getAllByDisplayValue("8-12")).toHaveLength(3);
    });

    it("un rango abierto se acepta y se conserva como 8+", () => {
      openPlanEditor();
      const first = screen.getAllByDisplayValue("8-12")[0];

      fireEvent.change(first, { target: { value: "8+" } });
      fireEvent.blur(first);

      expect(screen.getByDisplayValue("8+")).toBeInTheDocument();
    });

    it("un rango inválido revierte al valor anterior", () => {
      openPlanEditor();
      const first = screen.getAllByDisplayValue("8-12")[0];

      fireEvent.change(first, { target: { value: "no soy un rango" } });
      fireEvent.blur(first);

      expect(screen.getAllByDisplayValue("8-12")).toHaveLength(3);
    });

    it("volver a series iguales pide confirmación", () => {
      openPlanEditor();
      fireEvent.click(screen.getByTitle("Volver a series iguales"));

      expect(screen.getByText("¿Volver a series iguales?")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Simplificar" }));

      expect(screen.queryByText("Plantillas:")).not.toBeInTheDocument();
      expect(screen.getByText("Reps mín")).toBeInTheDocument();
    });
  });
});
