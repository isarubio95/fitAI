import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { ExerciseFormData, SetFormData } from "@/types/workout";
import type { OverloadSuggestion } from "@/lib/progressiveOverload";

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

const lastPerf = {
  fecha: "2026-08-10",
  sets: [
    { numero_serie: 1, peso_kg: 60, repeticiones: 8, duracion_seg: null, ritmo_seg_km: null, rir: null },
    { numero_serie: 2, peso_kg: 62.5, repeticiones: 6, duracion_seg: null, ritmo_seg_km: null, rir: null },
  ],
};

vi.mock("@/hooks/useLastPerformance", () => ({
  useLastPerformance: () => ({ data: lastPerf }),
}));

vi.mock("@/hooks/useProgressiveOverload", () => ({
  useProgressiveOverload: () => mockOverloadSuggestion,
}));

let mockOverloadSuggestion: OverloadSuggestion | null = null;

import { ExerciseCard } from "@/components/workout/ExerciseCard";

const emptySet = (): SetFormData => ({
  repeticiones: 0,
  peso_kg: 0,
  duracion_seg: null,
  ritmo_seg_km: null,
  completed: false,
});

function ActiveExerciseHarness({
  initialSets = [emptySet(), emptySet()],
}: {
  initialSets?: SetFormData[];
}) {
  const [exercise, setExercise] = useState<ExerciseFormData>({
    nombre: "Press banca",
    tipo_ejercicio_id: "press",
    registro_series: "peso_reps",
    sets: initialSets,
  });

  return (
    <ExerciseCard
      exercise={exercise}
      exerciseIndex={0}
      onRemoveExercise={() => undefined}
      onAddSet={() => undefined}
      onRemoveSet={() => undefined}
      onUpdateSet={() => undefined}
      onSeedSetFromPrevious={(si, patch) => {
        setExercise((ex) => ({
          ...ex,
          sets: ex.sets.map((s, i) =>
            i === si ? { ...s, ...patch, seededFromPrevious: true } : s,
          ),
        }));
      }}
      onApplySuggestionToSet={(si, patch) => {
        setExercise((ex) => ({
          ...ex,
          sets: ex.sets.map((s, i) =>
            i === si ? { ...s, ...patch, seededFromPrevious: false } : s,
          ),
        }));
      }}
      onSetCompleted={() => undefined}
    />
  );
}

describe("ExerciseCard", () => {
  beforeAll(() => {
    mockOverloadSuggestion = null;
  });

  it("precarga los inputs con el último registro en un entreno activo", async () => {
    render(<ActiveExerciseHarness />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("8")).toBeInTheDocument();
      expect(screen.getByDisplayValue("60")).toBeInTheDocument();
      expect(screen.getByDisplayValue("6")).toBeInTheDocument();
      expect(screen.getByDisplayValue("62.5")).toBeInTheDocument();
    });
  });

  it("no pisa series que ya tienen datos de la sesión", async () => {
    render(
      <ActiveExerciseHarness
        initialSets={[
          { repeticiones: 10, peso_kg: 70, duracion_seg: null, ritmo_seg_km: null, completed: false },
          emptySet(),
        ]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("10")).toBeInTheDocument();
      expect(screen.getByDisplayValue("70")).toBeInTheDocument();
      expect(screen.getByDisplayValue("6")).toBeInTheDocument();
      expect(screen.getByDisplayValue("62.5")).toBeInTheDocument();
    });
    expect(screen.queryByDisplayValue("8")).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("60")).not.toBeInTheDocument();
  });

  it("aplica la sugerencia de sobrecarga en series precargadas", async () => {
    mockOverloadSuggestion = {
      action: "increase_reps",
      suggestedWeight: 57.5,
      suggestedReps: 8,
      confidence: 0.8,
      reason: "Añade 1 rep",
    };

    render(
      <ActiveExerciseHarness
        initialSets={[
          {
            repeticiones: 7,
            peso_kg: 57.5,
            duracion_seg: null,
            ritmo_seg_km: null,
            completed: false,
            seededFromPrevious: true,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("8")).toBeInTheDocument();
      expect(screen.getByDisplayValue("57.5")).toBeInTheDocument();
    });
  });

  describe("objetivos por serie", () => {
    it("cada serie muestra su propio rango de reps como placeholder", () => {
      render(
        <ActiveExerciseHarness
          initialSets={[
            { ...emptySet(), objetivo_repes_min: 12, objetivo_repes_max: 12 },
            { ...emptySet(), objetivo_repes_min: 8, objetivo_repes_max: 10 },
          ]}
        />,
      );

      expect(screen.getByPlaceholderText("12")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("8-10")).toBeInTheDocument();
    });

    it("marca las series que no son efectivas", () => {
      render(
        <ActiveExerciseHarness
          initialSets={[
            { ...emptySet(), tipo_serie: "calentamiento" },
            { ...emptySet(), tipo_serie: "amrap" },
          ]}
        />,
      );

      expect(screen.getByTitle("Calentamiento")).toHaveTextContent("W");
      expect(screen.getByTitle("AMRAP")).toHaveTextContent("A");
    });

    it("el peso prescrito gana sobre el del último entreno", async () => {
      // lastPerf trae 60 y 62.5; la rutina prescribe 40 y 80.
      render(
        <ActiveExerciseHarness
          initialSets={[
            { ...emptySet(), tipo_serie: "calentamiento", objetivo_peso_kg: 40 },
            { ...emptySet(), objetivo_peso_kg: 80 },
          ]}
        />,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue("40")).toBeInTheDocument();
        expect(screen.getByDisplayValue("80")).toBeInTheDocument();
      });
      expect(screen.queryByDisplayValue("62.5")).not.toBeInTheDocument();
    });

    it("la sugerencia de sobrecarga no toca los calentamientos", async () => {
      mockOverloadSuggestion = {
        action: "increase_weight",
        suggestedWeight: 90,
        suggestedReps: 8,
        confidence: 0.8,
        reason: "Sube peso",
      };

      render(
        <ActiveExerciseHarness
          initialSets={[
            {
              ...emptySet(),
              tipo_serie: "calentamiento",
              peso_kg: 40,
              repeticiones: 15,
              seededFromPrevious: true,
            },
            { ...emptySet(), peso_kg: 80, repeticiones: 8, seededFromPrevious: true },
          ]}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));

      await waitFor(() => {
        expect(screen.getByDisplayValue("90")).toBeInTheDocument();
      });
      // El calentamiento conserva sus 40 kg.
      expect(screen.getByDisplayValue("40")).toBeInTheDocument();
    });
  });
});
