import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";

const { mockUseGimnasiosCatalog, mockUseDefaultGimnasio, mockUseLastGimnasio, mockUseBrowserLocation, mockUseCreateGimnasio } =
  vi.hoisted(() => ({
    mockUseGimnasiosCatalog: vi.fn(),
    mockUseDefaultGimnasio: vi.fn(),
    mockUseLastGimnasio: vi.fn(),
    mockUseBrowserLocation: vi.fn(),
    mockUseCreateGimnasio: vi.fn(),
  }));

vi.mock("@/components/gym/GymAddSheet", () => ({
  GymAddSheet: () => null,
}));

vi.mock("@/components/gym/GymDirectoryDrawer", () => ({
  GymDirectoryDrawer: () => null,
}));

vi.mock("@/hooks/useGimnasios", () => ({
  useGimnasiosCatalog: mockUseGimnasiosCatalog,
  useDefaultGimnasio: mockUseDefaultGimnasio,
  useLastGimnasio: mockUseLastGimnasio,
  useCreateGimnasio: mockUseCreateGimnasio,
}));

vi.mock("@/hooks/useBrowserLocation", () => ({
  useBrowserLocation: mockUseBrowserLocation,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import { GymPickerSheet } from "@/components/gym/GymPickerSheet";

function wrap(ui: ReactNode) {
  return <MemoryRouter>{ui}</MemoryRouter>;
}

describe("GymPickerSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBrowserLocation.mockReturnValue({
      point: { lat: 40.42, lng: -3.7 },
      loading: false,
      denied: false,
      request: vi.fn(),
    });
    mockUseDefaultGimnasio.mockReturnValue({ data: null });
    mockUseLastGimnasio.mockReturnValue({
      data: { id: "g-last", nombre: "Gimnasio de siempre" },
    });
    mockUseCreateGimnasio.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    mockUseGimnasiosCatalog.mockReturnValue({
      isLoading: false,
      data: [
        {
          id: "g-near",
          nombre: "Basic-Fit",
          lat: 40.417,
          lng: -3.704,
          ciudad: "Madrid",
          direccion: "Calle Mayor 12",
          brand: "Basic-Fit",
          source: "osm",
        },
        {
          id: "g-last",
          nombre: "Gimnasio de siempre",
          lat: 40.5,
          lng: -3.7,
          ciudad: "Madrid",
          direccion: null,
          brand: null,
          source: "user",
        },
      ],
    });
  });

  it("lista gimnasios y permite elegir uno", () => {
    const onSelect = vi.fn();
    render(
      wrap(
        <GymPickerSheet open onOpenChange={vi.fn()} selected={null} onSelect={onSelect} />,
      ),
    );

    expect(screen.getByText("Basic-Fit (Calle Mayor 12)")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Basic-Fit (Calle Mayor 12)"));
    expect(onSelect).toHaveBeenCalledWith({
      id: "g-near",
      nombre: "Basic-Fit (Calle Mayor 12)",
      ciudad: "Madrid",
    });
  });

  it("filtra por búsqueda", () => {
    render(
      wrap(
        <GymPickerSheet open onOpenChange={vi.fn()} selected={null} onSelect={vi.fn()} />,
      ),
    );

    fireEvent.change(screen.getByPlaceholderText("Buscar por nombre o ciudad"), {
      target: { value: "basic" },
    });
    expect(screen.getByText("Basic-Fit (Calle Mayor 12)")).toBeInTheDocument();
    expect(screen.queryByText("Gimnasio de siempre")).not.toBeInTheDocument();
  });

  it("marca el último usado cuando no hay gimnasio por defecto", () => {
    render(
      wrap(
        <GymPickerSheet open onOpenChange={vi.fn()} selected={null} onSelect={vi.fn()} />,
      ),
    );

    expect(screen.getByText(/Último/)).toBeInTheDocument();
    expect(screen.queryByText(/Por defecto/)).not.toBeInTheDocument();
  });

  it("prioriza el gimnasio por defecto y muestra el badge", () => {
    mockUseDefaultGimnasio.mockReturnValue({
      data: { id: "g-near", nombre: "Basic-Fit (Calle Mayor 12)" },
    });

    render(
      wrap(
        <GymPickerSheet open onOpenChange={vi.fn()} selected={null} onSelect={vi.fn()} />,
      ),
    );

    const items = screen.getAllByRole("button");
    const gymButtons = items.filter((el) => el.textContent?.includes("Madrid"));
    expect(gymButtons[0]).toHaveTextContent("Basic-Fit (Calle Mayor 12)");
    expect(gymButtons[0]).toHaveTextContent("Por defecto");
    expect(screen.getByText(/Último/)).toBeInTheDocument();
  });
});
