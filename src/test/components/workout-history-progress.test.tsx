import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const { mockUseWorkoutHistory, mockUseCardioHistory } = vi.hoisted(() => ({
  mockUseWorkoutHistory: vi.fn(),
  mockUseCardioHistory: vi.fn(),
}));

vi.mock("@/hooks/useWorkouts", () => ({
  useWorkoutHistory: mockUseWorkoutHistory,
}));

vi.mock("@/hooks/useCardioSessions", () => ({
  useCardioHistory: mockUseCardioHistory,
}));

vi.mock("@/hooks/useMountAfterPaint", () => ({
  useMountAfterPaint: () => false,
}));

vi.mock("@/components/dashboard/ExerciseProgressWidget", () => ({
  ExerciseProgressWidget: () => null,
}));

vi.mock("@/components/dashboard/MuscleRankingWidget", () => ({
  MuscleRankingWidget: () => null,
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
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

import WorkoutHistory from "@/pages/WorkoutHistory";

describe("WorkoutHistory / Progreso", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWorkoutHistory.mockReturnValue({ data: [], isPending: false });
    mockUseCardioHistory.mockReturnValue({ data: [], isPending: false });
  });

  it("escribe el periodo por defecto en la URL y cambia con las pills", () => {
    render(
      <MemoryRouter initialEntries={["/evolution?tab=progress"]}>
        <WorkoutHistory />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Aún no hay sesiones en estas 4 semanas.",
    );

    fireEvent.mouseDown(screen.getByRole("tab", { name: "7 días" }), { button: 0 });
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Aún no hay sesiones en estos 7 días.",
    );
  });

  it("no pinta las cuatro cards KPI", () => {
    render(
      <MemoryRouter initialEntries={["/evolution?tab=progress&period=4w"]}>
        <WorkoutHistory />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Volumen de fuerza")).not.toBeInTheDocument();
    expect(screen.queryByText("Series")).not.toBeInTheDocument();
  });
});
