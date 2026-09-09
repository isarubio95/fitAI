import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import type { FetchGimnasiosSearchParams } from "@/hooks/useGimnasios";
import type { GimnasioCatalogItem } from "@/types/gimnasio";

const { mockUseGimnasiosSearch, mockUseDefaultGimnasio, mockUseLastGimnasio, mockUseBrowserLocation, mockUseCreateGimnasio } =
  vi.hoisted(() => ({
    mockUseGimnasiosSearch: vi.fn(),
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
  useGimnasiosSearch: mockUseGimnasiosSearch,
  useDefaultGimnasio: mockUseDefaultGimnasio,
  useLastGimnasio: mockUseLastGimnasio,
  useCreateGimnasio: mockUseCreateGimnasio,
  GIMNASIO_SEARCH_LIMIT: 50,
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

const nearGym: GimnasioCatalogItem = {
  id: "g-near",
  nombre: "Basic-Fit",
  lat: 40.417,
  lng: -3.704,
  ciudad: "Madrid",
  direccion: "Calle Mayor 12",
  brand: "Basic-Fit",
  source: "osm",
  tipo: "private",
};

const lastGym: GimnasioCatalogItem = {
  id: "g-last",
  nombre: "Gimnasio de siempre",
  lat: 40.5,
  lng: -3.7,
  ciudad: "Madrid",
  direccion: null,
  brand: null,
  source: "user",
  tipo: "unknown",
};

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
    mockUseGimnasiosSearch.mockImplementation((opts: FetchGimnasiosSearchParams = {}) => {
      const q = (opts.query ?? "").trim().toLowerCase();
      const all = [
        { ...nearGym, distanceKm: 0.4 },
        { ...lastGym, distanceKm: 8.2 },
      ];
      const data = q
        ? all.filter(
            (gym) =>
              gym.nombre.toLowerCase().includes(q) ||
              (gym.ciudad ?? "").toLowerCase().includes(q),
          )
        : all;
      return { isLoading: false, data, isFetching: false };
    });
  });

  it("lista gimnasios y permite elegir uno", () => {
    const onSelect = vi.fn();
    render(
      wrap(
        <GymPickerSheet open onOpenChange={vi.fn()} selected={null} onSelect={onSelect} />,
      ),
    );

    expect(screen.getByText(/España · OSM y datos municipales/)).toBeInTheDocument();
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

  it("no busca el catálogo mientras el sheet está cerrado", () => {
    render(
      wrap(
        <GymPickerSheet open={false} onOpenChange={vi.fn()} selected={null} onSelect={vi.fn()} />,
      ),
    );

    expect(mockUseGimnasiosSearch).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
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
