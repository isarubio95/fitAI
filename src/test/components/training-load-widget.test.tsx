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
  AreaChart: ({ children }: { children: ReactNode }) => <g>{children}</g>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Area: () => null,
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
          { date: "2026-04-01", load: 100, fatigueScore: 40, fatigueTrend: 38 },
          { date: "2026-04-02", load: 120, fatigueScore: 45, fatigueTrend: 41 },
        ],
        totals: { fatigueScore: 45, fatigueTrend: 41 },
      },
      isLoading: false,
      isFetching: false,
    });

    render(<TrainingLoadWidget />);
    expect(screen.getByText("Fatiga hoy")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("Cambio del periodo:"))).toBeInTheDocument();
  });

  it("usa caché local cuando no hay respuesta de red", () => {
    localStorage.setItem(
      "gym-log.training-load.data.v1",
      JSON.stringify({
        points: [{ date: "2026-03-01", load: 80, fatigueScore: 30, fatigueTrend: 29 }],
        totals: { fatigueScore: 30, fatigueTrend: 29 },
      }),
    );
    mockUseTrainingLoad.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
    });

    render(<TrainingLoadWidget />);
    expect(screen.getByText("30")).toBeInTheDocument();
  });
});

