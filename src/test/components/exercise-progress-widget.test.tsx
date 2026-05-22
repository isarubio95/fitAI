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
  Tooltip: ({ content }: { content: (props: unknown) => ReactNode }) => (
    <div>{content({ active: false, payload: [] })}</div>
  ),
  Area: () => null,
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
      },
    });

    render(<ExerciseProgressWidget />);
    expect(screen.getByText("1/2")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Siguiente ejercicio"));
    expect(screen.getByText("2/2")).toBeInTheDocument();
  });

  it("muestra estado vacío cuando no hay historial", () => {
    mockUseExerciseWithHistory.mockReturnValue({
      data: [{ id: "press", name: "Press banca", lastPerformed: "2026-05-01" }],
      isLoading: false,
    });
    mockUseExerciseHistory.mockReturnValue({
      data: { history: [], lastRecord: null },
    });

    render(<ExerciseProgressWidget />);
    expect(screen.getByText("Sigue entrenando para ver tu progreso 💪")).toBeInTheDocument();
  });
});

