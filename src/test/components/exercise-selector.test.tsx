import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const {
  mockUseAuth,
  mockUseExerciseCatalogInfinite,
  mockUseFavoriteExercisesCatalog,
  mockUseExercisesByKeys,
  mockUseExerciseFavorites,
  mockUseExerciseUsageStats,
} = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseExerciseCatalogInfinite: vi.fn(),
  mockUseFavoriteExercisesCatalog: vi.fn(),
  mockUseExercisesByKeys: vi.fn(),
  mockUseExerciseFavorites: vi.fn(),
  mockUseExerciseUsageStats: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("@/hooks/useExerciseCatalog", () => ({
  useExerciseCatalogInfinite: mockUseExerciseCatalogInfinite,
  useFavoriteExercisesCatalog: mockUseFavoriteExercisesCatalog,
  useExercisesByKeys: mockUseExercisesByKeys,
}));

vi.mock("@/hooks/useExerciseFavorites", () => ({
  useExerciseFavorites: mockUseExerciseFavorites,
}));

vi.mock("@/hooks/useExerciseUsageStats", () => ({
  useExerciseUsageStats: mockUseExerciseUsageStats,
}));

vi.mock("@/components/exercise/ExerciseDetailSheet", () => ({
  default: () => null,
}));

import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";

function wrap(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

const catalogPages = {
  pages: [
    {
      usuario: [
        {
          id: "mine-1",
          nombre: "Press mío",
          usuario_id: "u1",
          __source: "usuario",
          grupo_muscular: "Pecho",
          registro_series: "peso_reps",
        },
      ],
      catalogo: [
        {
          id: "cat-fav",
          nombre: "Press banca",
          __source: "catalogo",
          grupo_muscular: "Pecho",
          registro_series: "peso_reps",
        },
        {
          id: "cat-other",
          nombre: "Remo con barra",
          __source: "catalogo",
          grupo_muscular: "Espalda",
          registro_series: "peso_reps",
        },
        {
          id: "cat-fly-1",
          nombre: "Aperturas con Mancuernas",
          __source: "catalogo",
          grupo_muscular: "Pecho",
          equipment: "Mancuernas",
          registro_series: "peso_reps",
        },
        {
          id: "cat-fly-2",
          nombre: "Aperturas en Máquina",
          __source: "catalogo",
          grupo_muscular: "Pecho",
          equipment: "Máquina",
          registro_series: "peso_reps",
        },
      ],
    },
  ],
};

describe("ExerciseSelector", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: "u1" } });
    mockUseExerciseCatalogInfinite.mockReturnValue({
      data: catalogPages,
      isLoading: false,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    mockUseFavoriteExercisesCatalog.mockReturnValue({
      data: [
        {
          id: "cat-fav",
          nombre: "Press banca",
          __source: "catalogo",
          grupo_muscular: "Pecho",
          registro_series: "peso_reps",
        },
      ],
      isLoading: false,
    });
    mockUseExercisesByKeys.mockReturnValue({ data: [], isLoading: false });
    mockUseExerciseFavorites.mockReturnValue({
      favoriteKeys: new Set(["catalogo:cat-fav"]),
      isFavorite: (source: string, id: string) => source === "catalogo" && id === "cat-fav",
      toggleFavorite: vi.fn(),
    });
    mockUseExerciseUsageStats.mockReturnValue({
      usage: new Map(),
      topKeys: [],
      isLoading: false,
    });
  });

  it("muestra el filtro de favoritos y deja solo esos ejercicios", () => {
    render(
      wrap(<ExerciseSelector open onOpenChange={() => undefined} onSelect={() => undefined} />),
    );

    const favBtn = screen.getByRole("button", { name: "Solo favoritos" });
    expect(favBtn).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("checkbox", { name: /Remo con barra/ })).toBeInTheDocument();

    fireEvent.click(favBtn);

    expect(favBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("checkbox", { name: /Press banca/ })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /Remo con barra/ })).not.toBeInTheDocument();
  });

  it("agrupa las variantes y las despliega al pulsar la familia", () => {
    render(
      wrap(<ExerciseSelector open onOpenChange={() => undefined} onSelect={() => undefined} />),
    );

    const family = screen.getByRole("button", { name: /Aperturas.*2 variantes/s });
    expect(screen.queryByRole("checkbox", { name: /Con Mancuernas/ })).not.toBeInTheDocument();

    fireEvent.click(family);

    expect(screen.getByRole("checkbox", { name: /Con Mancuernas/ })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /En Máquina/ })).toBeInTheDocument();
  });

  it("añade en lote los ejercicios seleccionados y cierra el selector", async () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(wrap(<ExerciseSelector open onOpenChange={onOpenChange} onSelect={onSelect} />));

    const addButton = screen.getByRole("button", { name: "Añadir a la rutina" });
    expect(addButton).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: /Remo con barra/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Press mío/ }));

    expect(screen.getByText("2 seleccionados")).toBeInTheDocument();

    fireEvent.click(addButton);
    await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));

    expect(onSelect).toHaveBeenNthCalledWith(
      1,
      { tipo_ejercicio_id: "cat-other", registro_series: "peso_reps" },
      "Remo con barra",
    );
    expect(onSelect).toHaveBeenNthCalledWith(
      2,
      { usuario_ejercicio_id: "mine-1", registro_series: "peso_reps" },
      "Press mío",
    );
  });
});
