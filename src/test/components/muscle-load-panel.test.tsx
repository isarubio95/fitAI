import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MainMuscleGroup } from "@/constants/muscleGroups";
import type { MouseEvent, ReactNode } from "react";

const { mockUseMuscleVolume, mockUseMuscleFatigue } = vi.hoisted(() => ({
  mockUseMuscleVolume: vi.fn(),
  mockUseMuscleFatigue: vi.fn(),
}));

vi.mock("@/hooks/useMuscleVolume", () => ({
  useMuscleVolume: mockUseMuscleVolume,
}));

vi.mock("@/hooks/useMuscleFatigue", () => ({
  useMuscleFatigue: mockUseMuscleFatigue,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "u1" } }),
}));

vi.mock("@/components/ui/tabs", () => ({
  pillTabsListClass: "",
  pillTabsTriggerClass: "",
  underlineTabsListClass: "",
  underlineTabsTriggerClass: "",
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

import { MuscleLoadPanel } from "@/components/dashboard/MuscleLoadPanel";

describe("MuscleLoadPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
    mockUseMuscleFatigue.mockReturnValue({
      data: {
        groupFatigue: {},
        daysToBaseline: {},
        maxGroupFatigue: 0,
        fatigueSeries: {},
        lastTrainedAt: {},
        dayKeys: [],
      },
      isLoading: false,
    });
  });

  it("muestra el mapa corporal en modo skeleton durante la carga", () => {
    mockUseMuscleVolume.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<MuscleLoadPanel />);
    expect(screen.getByTestId("legend")).toBeInTheDocument();
    expect(document.querySelector('[data-loading="true"]')).toBeInTheDocument();
  });

  it("renderiza tooltip al pasar por una zona y avisa del grupo al clicar", () => {
    mockUseMuscleVolume.mockReturnValue({
      data: {
        groupVolume: { Pecho: 4 },
        specificVolume: {},
        maxGroupVolume: 4,
      },
      isLoading: false,
    });

    const onZoneSelect = vi.fn();
    render(<MuscleLoadPanel onZoneSelect={onZoneSelect} />);
    const zone = screen.getByLabelText("zona-pecho");
    fireEvent.mouseMove(zone, { clientX: 40, clientY: 20 });
    expect(screen.getByText("Pecho")).toBeInTheDocument();
    expect(screen.getByText("4 series")).toBeInTheDocument();

    fireEvent.click(zone);
    expect(onZoneSelect).toHaveBeenCalledWith("Pecho");
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

    render(<MuscleLoadPanel />);
    expect(screen.getByText("Mostrando datos guardados sin conexión.")).toBeInTheDocument();
  });

  it("ofrece las dos lecturas del mapa", () => {
    mockUseMuscleVolume.mockReturnValue({
      data: { groupVolume: {}, specificVolume: {}, maxGroupVolume: 0 },
      isLoading: false,
    });

    render(<MuscleLoadPanel />);
    expect(screen.getByText("Volumen")).toBeInTheDocument();
    expect(screen.getByText("Fatiga")).toBeInTheDocument();
  });
});

