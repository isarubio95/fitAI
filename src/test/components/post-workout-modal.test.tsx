import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { SelectedGimnasio } from "@/types/gimnasio";
import type { XPBreakdown } from "@/hooks/useGamification";

const { mockPersistActividadGimnasio } = vi.hoisted(() => ({
  mockPersistActividadGimnasio: vi.fn(),
}));

vi.mock("@/hooks/useGimnasios", () => ({
  persistActividadGimnasio: mockPersistActividadGimnasio,
  GIMNASIOS_QUERY_KEY: ["gimnasios"],
}));

vi.mock("@/components/gym/GymPickerSheet", () => ({
  GymPickerSheet: ({
    open,
    onSelect,
  }: {
    open: boolean;
    onSelect: (gym: SelectedGimnasio | null) => void;
  }) =>
    open ? (
      <div>
        <button type="button" onClick={() => onSelect({ id: "g1", nombre: "Box Centro" })}>
          Elegir gym
        </button>
        <button type="button" onClick={() => onSelect(null)}>
          Quitar gimnasio
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/routine/RoutineForm", () => ({
  RoutineForm: () => null,
}));

import { PostWorkoutModal } from "@/components/workout/PostWorkoutModal";

const breakdown: XPBreakdown = {
  base: 10,
  series: 20,
  streakBonus: 0,
  total: 30,
  leveledUp: false,
  newLevel: 1,
  previousLevel: 1,
  newStreak: 0,
};

function wrap(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("PostWorkoutModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPersistActividadGimnasio.mockResolvedValue(undefined);
  });

  it("permite elegir el gimnasio al terminar el entrenamiento", async () => {
    render(
      wrap(
        <PostWorkoutModal
          open
          onClose={vi.fn()}
          breakdown={breakdown}
          workoutId="act-1"
        />,
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: /Gimnasio|Dónde has entrenado/i }));
    fireEvent.click(screen.getByText("Elegir gym"));

    await waitFor(() => {
      expect(mockPersistActividadGimnasio).toHaveBeenCalledWith("act-1", {
        id: "g1",
        nombre: "Box Centro",
      });
    });
    expect(await screen.findByRole("button", { name: /Gimnasio|Box Centro/i })).toHaveTextContent("Box Centro");
  });

  it("muestra el gimnasio prellenado", async () => {
    render(
      wrap(
        <PostWorkoutModal
          open
          onClose={vi.fn()}
          breakdown={breakdown}
          workoutId="act-1"
          initialGimnasio={{ id: "g2", nombre: "Basic Fit" }}
        />,
      ),
    );

    expect(await screen.findByRole("button", { name: /Gimnasio|Basic Fit/i })).toHaveTextContent("Basic Fit");
  });
});
