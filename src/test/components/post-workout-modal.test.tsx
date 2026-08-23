import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { SelectedGimnasio } from "@/types/gimnasio";
import type { XPBreakdown } from "@/hooks/useGamification";

const { mockPersistActividadGimnasio, mockFrom } = vi.hoisted(() => ({
  mockPersistActividadGimnasio: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock("@/hooks/useGimnasios", () => ({
  persistActividadGimnasio: mockPersistActividadGimnasio,
  GIMNASIOS_QUERY_KEY: ["gimnasios"],
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
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

vi.mock("@/components/routine/RoutineIconPicker", () => ({
  WorkoutIconPickerTrigger: ({
    onChange,
  }: {
    onChange: (icon: string) => void;
  }) => (
    <button type="button" onClick={() => onChange("flame")}>
      Cambiar icono
    </button>
  ),
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
    mockFrom.mockReturnValue({
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    });
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

  it("guarda el esfuerzo percibido al elegirlo", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const payloads: Array<{ rpe?: number }> = [];
    mockFrom.mockReturnValue({
      update: (payload: { rpe?: number }) => {
        payloads.push(payload);
        return { eq };
      },
    });

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

    const slider = screen.getByRole("slider", { name: /esfuerzo percibido/i });
    slider.focus();
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    await waitFor(() => {
      expect(payloads.at(-1)).toEqual({ rpe: 2 });
      expect(eq).toHaveBeenCalledWith("id", "act-1");
    });
  });

  it("no muestra título e icono si el entrenamiento viene de una rutina", () => {
    render(
      wrap(
        <PostWorkoutModal
          open
          onClose={vi.fn()}
          breakdown={breakdown}
          workoutId="act-1"
          initialTitulo="Push"
          allowEditTitleAndIcon={false}
        />,
      ),
    );

    expect(screen.queryByLabelText("Título")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cambiar icono" })).not.toBeInTheDocument();
  });

  it("permite cambiar el título predefinido y el icono encima del gimnasio", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const payloads: Array<{ titulo?: string; icono?: string }> = [];
    mockFrom.mockReturnValue({
      update: (payload: { titulo?: string; icono?: string }) => {
        payloads.push(payload);
        return { eq };
      },
    });

    render(
      wrap(
        <PostWorkoutModal
          open
          onClose={vi.fn()}
          breakdown={breakdown}
          workoutId="act-1"
          initialTitulo="Entrenamiento de tarde"
          initialIcono="dumbbell"
          allowEditTitleAndIcon
        />,
      ),
    );

    const titleInput = screen.getByLabelText("Título");
    const gymInput = screen.getByLabelText("Gimnasio");
    expect(titleInput).toHaveValue("Entrenamiento de tarde");
    expect(screen.getByRole("button", { name: "Cambiar icono" })).toBeInTheDocument();
    expect(
      Boolean(titleInput.compareDocumentPosition(gymInput) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);

    fireEvent.change(titleInput, { target: { value: "Push day" } });
    fireEvent.blur(titleInput);
    await waitFor(() => {
      expect(payloads).toContainEqual({ titulo: "Push day" });
    });

    fireEvent.click(screen.getByRole("button", { name: "Cambiar icono" }));
    await waitFor(() => {
      expect(payloads).toContainEqual({ icono: "flame" });
      expect(eq).toHaveBeenCalledWith("id", "act-1");
    });
  });
});
