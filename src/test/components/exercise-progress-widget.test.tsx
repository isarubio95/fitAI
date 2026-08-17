import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const {
  mockUseAuth,
  mockUseExerciseWithHistory,
  mockUseExerciseHistory,
  mockPrefetchQuery,
} = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseExerciseWithHistory: vi.fn(),
  mockUseExerciseHistory: vi.fn(),
  mockPrefetchQuery: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => ({ prefetchQuery: mockPrefetchQuery }),
  };
});

vi.mock("@/hooks/useExerciseProgress", () => ({
  exerciseHistoryQueryOptions: vi.fn(() => ({ queryKey: ["x"], queryFn: vi.fn() })),
  useExerciseWithHistory: mockUseExerciseWithHistory,
  useExerciseHistory: mockUseExerciseHistory,
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  AreaChart: ({ children }: { children: ReactNode }) => <g>{children}</g>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Area: () => null,
  ReferenceLine: () => null,
  useXAxisScale: () => undefined,
  usePlotArea: () => undefined,
}));

import { ExerciseProgressWidget } from "@/components/dashboard/ExerciseProgressWidget";

describe("ExerciseProgressWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: "user-1" } });
  });

  it("muestra skeleton mientras carga ejercicios", () => {
    mockUseExerciseWithHistory.mockReturnValue({ data: undefined, isLoading: true });
    mockUseExerciseHistory.mockReturnValue({ data: undefined });

    render(<ExerciseProgressWidget />);
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("permite navegar entre ejercicios con flechas", () => {
    mockUseExerciseWithHistory.mockReturnValue({
      data: [
        { id: "press", name: "Press banca", lastPerformed: "2026-05-01" },
        { id: "sentadilla", name: "Sentadilla", lastPerformed: "2026-05-02" },
      ],
      isLoading: false,
    });
    mockUseExerciseHistory.mockReturnValue({
      data: {
        history: [{ date: "2026-05-01", oneRepMax: 100, weight: 80, reps: 8 }],
        lastRecord: { oneRepMax: 100, weight: 80, reps: 8, date: "2026-05-01" },
        metric: "1rm",
      },
    });

    render(<ExerciseProgressWidget />);
    expect(screen.getByText("1/2")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Siguiente ejercicio"));
    expect(screen.getByText("2/2")).toBeInTheDocument();
  });

  it("no precarga el historial de todos los ejercicios", () => {
    mockUseExerciseWithHistory.mockReturnValue({
      data: [
        { id: "press", name: "Press banca", lastPerformed: "2026-05-01" },
        { id: "sentadilla", name: "Sentadilla", lastPerformed: "2026-05-02" },
        { id: "peso-muerto", name: "Peso muerto", lastPerformed: "2026-05-03" },
      ],
      isLoading: false,
    });
    mockUseExerciseHistory.mockReturnValue({
      data: {
        history: [{ date: "2026-05-01", oneRepMax: 100, weight: 80, reps: 8 }],
        lastRecord: { oneRepMax: 100, weight: 80, reps: 8, date: "2026-05-01" },
        metric: "1rm",
      },
    });

    render(<ExerciseProgressWidget />);
    expect(mockPrefetchQuery).toHaveBeenCalledTimes(1);
  });

  it("muestra estado vacío cuando no hay historial", () => {
    mockUseExerciseWithHistory.mockReturnValue({
      data: [{ id: "press", name: "Press banca", lastPerformed: "2026-05-01" }],
      isLoading: false,
    });
    mockUseExerciseHistory.mockReturnValue({
      data: { history: [], lastRecord: null, metric: "1rm" },
    });

    render(<ExerciseProgressWidget />);
    expect(screen.getByText("Sigue entrenando para ver tu progreso 💪")).toBeInTheDocument();
  });

  it("explica progreso por reps en ejercicios a peso corporal", () => {
    mockUseExerciseWithHistory.mockReturnValue({
      data: [{ id: "dominadas", name: "Dominadas", lastPerformed: "2026-05-01" }],
      isLoading: false,
    });
    mockUseExerciseHistory.mockReturnValue({
      data: {
        history: [{ date: "2026-05-01", oneRepMax: 12, weight: 0, reps: 12 }],
        lastRecord: { oneRepMax: 12, weight: 0, reps: 12, date: "2026-05-01" },
        metric: "reps",
      },
    });

    render(<ExerciseProgressWidget />);
    fireEvent.click(screen.getByLabelText("Qué es la fuerza máxima"));
    expect(screen.getByText("¿Qué es el máximo de reps?")).toBeInTheDocument();
    expect(screen.getByText("Máximo: 12 reps")).toBeInTheDocument();
  });

  it("muestra el resumen del último punto encima del gráfico", () => {
    mockUseExerciseWithHistory.mockReturnValue({
      data: [{ id: "press", name: "Press banca", lastPerformed: "2026-05-01" }],
      isLoading: false,
    });
    mockUseExerciseHistory.mockReturnValue({
      data: {
        history: [{ date: "2026-05-01", oneRepMax: 100, weight: 80, reps: 8 }],
        lastRecord: { oneRepMax: 100, weight: 80, reps: 8, date: "2026-05-01" },
        metric: "1rm",
      },
    });

    render(<ExerciseProgressWidget />);
    expect(screen.getByText(/1 may\.? 2026/i)).toBeInTheDocument();
    expect(screen.getByText("1RM")).toBeInTheDocument();
    expect(screen.getByText("100 kg")).toBeInTheDocument();
    expect(screen.getByText("80kg × 8 reps")).toBeInTheDocument();
  });
});

