import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const {
  mockUseAuth,
  mockUseMeasurements,
  mockUseDailyHealth,
  mockUseWorkoutHistory,
  mockUseCardioHistory,
  mockUseActiveSessionFabOffset,
} = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseMeasurements: vi.fn(),
  mockUseDailyHealth: vi.fn(),
  mockUseWorkoutHistory: vi.fn(),
  mockUseCardioHistory: vi.fn(),
  mockUseActiveSessionFabOffset: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({ useAuth: mockUseAuth }));
vi.mock("@/hooks/useMeasurements", () => ({ useMeasurements: mockUseMeasurements }));
vi.mock("@/hooks/useDailyHealth", () => ({ useDailyHealth: mockUseDailyHealth }));
vi.mock("@/hooks/useWorkouts", () => ({ useWorkoutHistory: mockUseWorkoutHistory }));
vi.mock("@/hooks/useCardioSessions", () => ({ useCardioHistory: mockUseCardioHistory }));
vi.mock("@/hooks/useActiveSessionFabOffset", async () => {
  const actual = await vi.importActual<typeof import("@/hooks/useActiveSessionFabOffset")>(
    "@/hooks/useActiveSessionFabOffset",
  );
  return {
    ...actual,
    useActiveSessionFabOffset: mockUseActiveSessionFabOffset,
  };
});

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  return {
    ...actual,
    useQuery: () => ({ data: null }),
  };
});

vi.mock("@/components/health/HealthLogDrawer", () => ({
  HealthLogDrawer: ({ open }: { open: boolean }) => (open ? <div>Drawer abierto</div> : null),
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  ComposedChart: ({ children }: { children: ReactNode }) => <g>{children}</g>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Area: () => null,
  Line: () => null,
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

import YouHealth from "@/pages/YouHealth";

const idleQuery = {
  data: [] as unknown[],
  isPending: false,
  isError: false,
  refetch: vi.fn(),
};

function renderHealth() {
  return render(
    <MemoryRouter initialEntries={["/evolution?tab=health"]}>
      <YouHealth />
    </MemoryRouter>,
  );
}

describe("YouHealth / Salud", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: "u1" } });
    mockUseMeasurements.mockReturnValue(idleQuery);
    mockUseDailyHealth.mockReturnValue({
      ...idleQuery,
      upsertDailyHealth: vi.fn(),
      isSaving: false,
    });
    mockUseWorkoutHistory.mockReturnValue(idleQuery);
    mockUseCardioHistory.mockReturnValue(idleQuery);
    mockUseActiveSessionFabOffset.mockReturnValue(0);
  });

  it("muestra empty de operate y CTA, sin pills duplicadas", () => {
    renderHealth();

    expect(screen.getByText("Aún no hay peso.")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Registrar salud" })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /^FC$/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("FC reposo").length).toBeGreaterThan(0);
  });

  it("cambia el empty al elegir otra métrica", () => {
    renderHealth();
    fireEvent.click(screen.getByRole("button", { name: /Sueño/ }));
    expect(screen.getByText("Aún no hay sueño.")).toBeInTheDocument();
  });

  it("pinta gráfico desde un solo punto y la fecha del último valor", () => {
    mockUseMeasurements.mockReturnValue({
      ...idleQuery,
      data: [{ fecha: "2026-09-12", peso: 74.4 }],
    });

    renderHealth();

    expect(screen.getByRole("heading", { name: "Evolución del peso" })).toBeInTheDocument();
    expect(screen.getByText("74.4 kg")).toBeInTheDocument();
    expect(screen.getByText("12 sep")).toBeInTheDocument();
    expect(screen.queryByText("Aún no hay peso.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Registrar salud" })).toHaveAttribute("title", "Registrar salud");
  });

  it("con solo calidad no dice que no hay sueño", () => {
    mockUseDailyHealth.mockReturnValue({
      ...idleQuery,
      data: [{ fecha: "2026-09-12", sueno_min: null, calidad_sueno: 5, calorias: null, fc_reposo: null }],
    });

    renderHealth();
    fireEvent.click(screen.getByRole("button", { name: /Sueño/ }));

    expect(screen.getByText("5/5")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Calidad del sueño" })).toBeInTheDocument();
    expect(screen.queryByText("Aún no hay sueño.")).not.toBeInTheDocument();
  });

  it("colorea más sueño como favorable", () => {
    mockUseDailyHealth.mockReturnValue({
      ...idleQuery,
      data: [
        { fecha: "2026-09-12", sueno_min: 480, calidad_sueno: 4, calorias: null, fc_reposo: null },
        { fecha: "2026-09-11", sueno_min: 420, calidad_sueno: 3, calorias: null, fc_reposo: null },
      ],
    });

    renderHealth();
    fireEvent.click(screen.getByRole("button", { name: /Sueño/ }));

    expect(screen.getByText("Calidad 4/5")).toBeInTheDocument();
    const badge = screen.getByText("+1.0 h");
    expect(badge.className).toContain("text-success");
  });

  it("muestra error con reintentar", () => {
    const refetch = vi.fn();
    mockUseMeasurements.mockReturnValue({ ...idleQuery, isError: true, refetch });
    mockUseDailyHealth.mockReturnValue({
      ...idleQuery,
      isError: true,
      refetch,
      upsertDailyHealth: vi.fn(),
      isSaving: false,
    });

    renderHealth();
    expect(screen.getByText("No se pudo cargar tu salud.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("abre el drawer desde el empty", () => {
    renderHealth();
    fireEvent.click(screen.getByRole("button", { name: "Registrar salud" }));
    expect(screen.getByText("Drawer abierto")).toBeInTheDocument();
  });
});
