import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const { mockUseTrainingLoad } = vi.hoisted(() => ({
  mockUseTrainingLoad: vi.fn(),
}));

vi.mock("@/hooks/useTrainingLoad", () => ({
  useTrainingLoad: mockUseTrainingLoad,
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  ComposedChart: ({ children }: { children: ReactNode }) => <g>{children}</g>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Line: () => null,
  Area: () => null,
  ReferenceLine: () => null,
  ReferenceDot: () => null,
}));

import { TrainingLoadWidget } from "@/components/dashboard/TrainingLoadWidget";

const SAMPLE_DATA = {
  points: [
    {
      date: "2026-04-01",
      load: 100,
      loadStrength: 60,
      loadCardio: 40,
      fitness: 40,
      fatigue: 45,
      form: -5,
    },
    {
      date: "2026-04-02",
      load: 120,
      loadStrength: 70,
      loadCardio: 50,
      fitness: 42,
      fatigue: 50,
      form: -8,
    },
  ],
  totals: { fitness: 42, fatigue: 50, form: -8 },
};

describe("TrainingLoadWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("muestra skeleton durante la carga inicial", () => {
    mockUseTrainingLoad.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
    });

    render(<TrainingLoadWidget />);
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renderiza métricas con datos del hook", () => {
    mockUseTrainingLoad.mockReturnValue({
      data: SAMPLE_DATA,
      isLoading: false,
      isFetching: false,
    });

    render(<TrainingLoadWidget />);
    expect(screen.getAllByText("Fitness").length).toBeGreaterThan(0);
    expect(screen.getAllByText("42").length).toBeGreaterThan(0);
    expect(screen.getByText("Tu forma hoy")).toBeInTheDocument();
    expect(screen.getAllByText("−8").length).toBeGreaterThan(0);
    expect(screen.getByText((content) => content.includes("Últimos 7 días"))).toBeInTheDocument();
  });

  it("usa caché local cuando no hay respuesta de red", () => {
    localStorage.setItem(
      "gym-log.training-load.data.v2",
      JSON.stringify({
        points: [
          {
            date: "2026-03-01",
            load: 80,
            loadStrength: 80,
            loadCardio: 0,
            fitness: 30,
            fatigue: 28,
            form: 2,
          },
        ],
        totals: { fitness: 30, fatigue: 28, form: 2 },
      }),
    );
    mockUseTrainingLoad.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
    });

    render(<TrainingLoadWidget />);
    expect(screen.getAllByText("30").length).toBeGreaterThan(0);
  });

  it("muestra textos didácticos en la primera visita", () => {
    mockUseTrainingLoad.mockReturnValue({
      data: SAMPLE_DATA,
      isLoading: false,
      isFetching: false,
    });

    render(<TrainingLoadWidget />);
    expect(screen.getByText(/La fatiga se pasa/)).toBeInTheDocument();
    expect(screen.getByText(/Equilibrio entre entrenar/)).toBeInTheDocument();
  });

  it("oculta textos didácticos cuando el modo explicación está desactivado", () => {
    localStorage.setItem("gym-log.training-load.explain-mode", "0");
    mockUseTrainingLoad.mockReturnValue({
      data: SAMPLE_DATA,
      isLoading: false,
      isFetching: false,
    });

    render(<TrainingLoadWidget />);
    expect(screen.queryByText(/La fatiga se pasa/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Equilibrio entre entrenar/)).not.toBeInTheDocument();
  });

  it("permite conmutar el modo explicación y persiste la preferencia", () => {
    mockUseTrainingLoad.mockReturnValue({
      data: SAMPLE_DATA,
      isLoading: false,
      isFetching: false,
    });

    render(<TrainingLoadWidget />);
    const toggle = screen.getByRole("button", { name: "Ocultar explicaciones" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(toggle);
    expect(screen.queryByText(/La fatiga se pasa/)).not.toBeInTheDocument();
    expect(localStorage.getItem("gym-log.training-load.explain-mode")).toBe("0");
    expect(screen.getByRole("button", { name: "Mostrar explicaciones" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
