import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { chartIndexFromRatio } from "@/components/dashboard/chartScrub";

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

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

import { TrainingLoadChart } from "@/components/dashboard/training-load/TrainingLoadChart";

const POINTS = [
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
];

describe("TrainingLoadChart", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("resume la tendencia de la forma en vez del detalle por día", () => {
    render(<TrainingLoadChart points={POINTS} />);
    expect(screen.getByText(/en los últimos 7 días/)).toBeInTheDocument();
    // El desglose por día solo aparece al recorrer el gráfico.
    expect(screen.queryByText("Carga")).not.toBeInTheDocument();
    expect(screen.queryByText(/2 abr\.? 2026/i)).not.toBeInTheDocument();
  });

  it("no muestra textos didácticos del modo explicación", () => {
    render(<TrainingLoadChart points={POINTS} />);
    expect(screen.queryByText(/La fatiga se pasa/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Equilibrio entre entrenar/)).not.toBeInTheDocument();
  });

  it("al tocar el gráfico muestra el día de esa X, no el último", () => {
    render(<TrainingLoadChart points={POINTS} />);
    const layer = screen.getByTestId("chart-scrub-layer");
    vi.spyOn(layer, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      width: 300,
      height: 190,
      right: 300,
      bottom: 190,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(layer, { clientX: 12, clientY: 80, pointerType: "touch" });

    expect(screen.getByText(/1 abr\.? 2026/i)).toBeInTheDocument();
    expect(screen.getByText("Carga")).toBeInTheDocument();
    expect(screen.getByText("Fitness")).toBeInTheDocument();
    expect(screen.queryByText(/2 abr\.? 2026/i)).not.toBeInTheDocument();
  });

  it("persiste el rango elegido", () => {
    render(<TrainingLoadChart points={POINTS} />);
    fireEvent.click(screen.getByRole("tab", { name: "2 meses" }));
    expect(localStorage.getItem("gym-log.training-load.range")).toBe("2m");
  });
});

describe("chartIndexFromRatio", () => {
  it("elige el primer y el último extremo", () => {
    expect(chartIndexFromRatio(0, 30)).toBe(0);
    expect(chartIndexFromRatio(1, 30)).toBe(29);
  });

  it("elige el punto más cercano, no solo las marcas del eje", () => {
    expect(chartIndexFromRatio(0.5, 31)).toBe(15);
    expect(chartIndexFromRatio(-0.2, 10)).toBe(0);
    expect(chartIndexFromRatio(1.4, 10)).toBe(9);
  });
});
