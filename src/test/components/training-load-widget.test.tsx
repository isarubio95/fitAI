import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

const { mockUseTrainingLoad, mockUseMuscleFatigue, mockUseMuscleVolume } = vi.hoisted(() => ({
  mockUseTrainingLoad: vi.fn(),
  mockUseMuscleFatigue: vi.fn(),
  mockUseMuscleVolume: vi.fn(),
}));

vi.mock("@/hooks/useTrainingLoad", () => ({
  useTrainingLoad: mockUseTrainingLoad,
}));

vi.mock("@/hooks/useMuscleFatigue", () => ({
  useMuscleFatigue: mockUseMuscleFatigue,
}));

vi.mock("@/hooks/useMuscleVolume", () => ({
  useMuscleVolume: mockUseMuscleVolume,
}));

vi.mock("@/components/dashboard/MuscleBodyMap", () => ({
  MuscleBodyMap: () => <div data-testid="body-map" />,
  MuscleMapLegend: () => null,
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <svg>{children}</svg>,
  ComposedChart: ({ children }: { children: ReactNode }) => <g>{children}</g>,
  BarChart: ({ children }: { children: ReactNode }) => <g>{children}</g>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Line: () => null,
  Area: () => null,
  Bar: () => null,
  ReferenceLine: () => null,
  ReferenceDot: () => null,
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

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

const EMPTY_FATIGUE = {
  data: {
    groupFatigue: {},
    daysToBaseline: {},
    maxGroupFatigue: 0,
    fatigueSeries: {},
    lastTrainedAt: {},
    dayKeys: [],
  },
  isLoading: false,
  isFetching: false,
};

describe("TrainingLoadWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUseMuscleFatigue.mockReturnValue(EMPTY_FATIGUE);
    mockUseMuscleVolume.mockReturnValue({
      data: { groupVolume: {}, specificVolume: {}, maxGroupVolume: 0 },
      isLoading: false,
    });
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

  it("muestra los dos anillos con sus leyendas y nada más", () => {
    mockUseTrainingLoad.mockReturnValue({
      data: SAMPLE_DATA,
      isLoading: false,
      isFetching: false,
    });

    render(<TrainingLoadWidget />);
    expect(screen.getByText("Tu forma hoy")).toBeInTheDocument();
    expect(screen.getByText("Tu recuperación")).toBeInTheDocument();
    expect(screen.getAllByText("−8").length).toBeGreaterThan(0);
    expect(screen.getByText("Buena ventana para una sesión exigente.")).toBeInTheDocument();
    expect(screen.getByText("Ningún grupo limita el entrenamiento de hoy.")).toBeInTheDocument();
    // El histórico y las barras se movieron al detalle de forma.
    expect(screen.queryByTestId("form-surplus")).not.toBeInTheDocument();
    expect(screen.queryByTestId("chart-scrub-layer")).not.toBeInTheDocument();
    expect(screen.queryByText(/en los últimos 7 días/)).not.toBeInTheDocument();
  });

  it("cada anillo es un botón que abre su detalle", () => {
    mockUseTrainingLoad.mockReturnValue({
      data: SAMPLE_DATA,
      isLoading: false,
      isFetching: false,
    });

    render(<TrainingLoadWidget />);
    const formCard = screen.getByRole("button", { name: "Ver el detalle de tu forma" });
    expect(screen.getByRole("button", { name: "Ver el detalle de tu fatiga muscular" })).toBeInTheDocument();

    fireEvent.click(formCard);
    expect(screen.getByText("Las cinco zonas")).toBeInTheDocument();
    expect(screen.getByTestId("chart-scrub-layer")).toBeInTheDocument();
  });

  it("abre el detalle de fatiga con el desglose por grupo", () => {
    mockUseTrainingLoad.mockReturnValue({
      data: SAMPLE_DATA,
      isLoading: false,
      isFetching: false,
    });
    mockUseMuscleFatigue.mockReturnValue({
      data: {
        groupFatigue: { Pecho: 18 },
        daysToBaseline: { Pecho: 3 },
        maxGroupFatigue: 18,
        fatigueSeries: { Pecho: [0, 18] },
        lastTrainedAt: { Pecho: "2026-04-02" },
        dayKeys: ["2026-04-01", "2026-04-02"],
      },
      isLoading: false,
      isFetching: false,
    });

    render(<TrainingLoadWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Ver el detalle de tu fatiga muscular" }));
    expect(screen.getByText("Entrenados recientemente (1)")).toBeInTheDocument();
    expect(screen.getByText("Frescos y listos (10)")).toBeInTheDocument();
  });

  it("en modo ordenar las cards no abren nada", () => {
    mockUseTrainingLoad.mockReturnValue({
      data: SAMPLE_DATA,
      isLoading: false,
      isFetching: false,
    });

    render(<TrainingLoadWidget interactive={false} />);
    const formCard = screen.getByRole("button", { name: "Ver el detalle de tu forma" });
    expect(formCard).toBeDisabled();

    fireEvent.click(formCard);
    expect(screen.queryByText("Las cinco zonas")).not.toBeInTheDocument();
  });

  it("usa caché local cuando no hay respuesta de red", () => {
    localStorage.setItem(
      "gym-log.training-load.data.v4",
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
    expect(screen.getAllByText("+2").length).toBeGreaterThan(0);
  });

  it("muestra el grupo más fatigado en el anillo de recuperación", () => {
    mockUseTrainingLoad.mockReturnValue({
      data: SAMPLE_DATA,
      isLoading: false,
      isFetching: false,
    });
    mockUseMuscleFatigue.mockReturnValue({
      data: {
        groupFatigue: { Pecho: 18, Espalda: 9 },
        daysToBaseline: { Pecho: 3, Espalda: 1 },
        maxGroupFatigue: 18,
        fatigueSeries: {},
        lastTrainedAt: {},
        dayKeys: [],
      },
      isLoading: false,
      isFetching: false,
    });

    render(<TrainingLoadWidget />);
    expect(screen.getByText("3d")).toBeInTheDocument();
    expect(screen.getByText("Pecho necesita un par de días más.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Recuperación: 3d, Recuperando, Pecho/)).toBeInTheDocument();
  });
});
