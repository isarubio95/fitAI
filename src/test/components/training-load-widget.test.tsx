import { render, screen } from "@testing-library/react";
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
  AreaChart: ({ children }: { children: ReactNode }) => <g>{children}</g>,
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
      data: {
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
      },
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
});
