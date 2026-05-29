import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MainMuscleGroup } from "@/constants/muscleGroups";
import type { MouseEvent, ReactNode, Ref } from "react";

const { mockUseMuscleVolume } = vi.hoisted(() => ({
  mockUseMuscleVolume: vi.fn(),
}));

vi.mock("@/hooks/useMuscleVolume", () => ({
  useMuscleVolume: mockUseMuscleVolume,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CardContent: ({ children, ref }: { children: ReactNode; ref?: Ref<HTMLDivElement> }) => (
    <div ref={ref}>{children}</div>
  ),
  CardTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/tabs", () => ({
  pillTabsListClass: "",
  pillTabsTriggerClass: "",
  Tabs: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (next: string) => void;
    children: ReactNode;
  }) => (
    <div data-testid="month-week-tabs" data-value={value}>
      {children}
      <button onClick={() => onValueChange("month")}>Mes</button>
      <button onClick={() => onValueChange("week")}>Semana</button>
    </div>
  ),
  AnimatedTabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ value, children }: { value: string; children: ReactNode }) => (
    <button data-value={value}>{children}</button>
  ),
}));

vi.mock("@/components/dashboard/MuscleDetailSheet", () => ({
  MuscleDetailSheet: ({ open }: { open: boolean }) => <div data-testid="detail-sheet">{String(open)}</div>,
}));

vi.mock("@/components/dashboard/MuscleBodyMap", () => ({
  MuscleBodyMap: ({
    isLoading,
    onZoneHover,
    onZoneLeave,
    onZoneClick,
  }: {
    isLoading?: boolean;
    onZoneHover?: (group: MainMuscleGroup, event: MouseEvent<SVGPathElement>) => void;
    onZoneLeave?: () => void;
    onZoneClick?: (group: MainMuscleGroup) => void;
  }) => (
    <div data-loading={isLoading ? "true" : undefined}>
      <svg>
        <path
          role="button"
          aria-label="zona-pecho"
          onMouseMove={(event) => onZoneHover?.("Pecho", event)}
          onMouseLeave={onZoneLeave}
          onClick={() => onZoneClick?.("Pecho")}
        />
      </svg>
    </div>
  ),
  MuscleMapLegend: ({ period }: { period: "week" | "month" }) => <div data-testid="legend">{period}</div>,
}));

import { BodyHeatmap } from "@/components/dashboard/BodyHeatmap";

describe("BodyHeatmap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  it("muestra el mapa corporal en modo skeleton durante la carga", () => {
    mockUseMuscleVolume.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<BodyHeatmap />);
    expect(screen.getByTestId("legend")).toBeInTheDocument();
    expect(document.querySelector('[data-loading="true"]')).toBeInTheDocument();
  });

  it("renderiza tooltip al pasar por una zona y abre detalle al clicar", () => {
    mockUseMuscleVolume.mockReturnValue({
      data: {
        groupVolume: { Pecho: 4 },
        specificVolume: {},
        maxGroupVolume: 4,
      },
      isLoading: false,
    });

    render(<BodyHeatmap />);
    const zone = screen.getByLabelText("zona-pecho");
    fireEvent.mouseMove(zone, { clientX: 40, clientY: 20 });
    expect(screen.getByText("Pecho")).toBeInTheDocument();
    expect(screen.getByText("4 series")).toBeInTheDocument();

    fireEvent.click(zone);
    expect(screen.getByTestId("detail-sheet")).toHaveTextContent("true");
  });

  it("usa fallback offline desde cache local", () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });
    localStorage.setItem(
      "gym-log.dashboard.heatmap-data.v1",
      JSON.stringify({
        period: "month",
        timestamp: Date.now(),
        payload: {
          groupVolume: { Espalda: 7 },
          specificVolume: {},
          maxGroupVolume: 7,
        },
      }),
    );

    mockUseMuscleVolume.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<BodyHeatmap />);
    expect(screen.getByText("Mostrando datos guardados sin conexión.")).toBeInTheDocument();
  });
});

