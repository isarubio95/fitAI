import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";

const { mockUseAuth, mockUseExerciseCatalogAll, mockUseExerciseFavorites, mockCreate, mockDelete } = vi.hoisted(
  () => ({
    mockUseAuth: vi.fn(),
    mockUseExerciseCatalogAll: vi.fn(),
    mockUseExerciseFavorites: vi.fn(),
    mockCreate: vi.fn(),
    mockDelete: vi.fn(),
  }),
);

vi.mock("@/hooks/useAuth", () => ({ useAuth: mockUseAuth }));

vi.mock("@/hooks/useExerciseCatalog", () => ({
  useExerciseCatalogAll: mockUseExerciseCatalogAll,
  useCreateExercise: mockCreate,
  useDeleteExercise: mockDelete,
}));

vi.mock("@/hooks/useExerciseFavorites", () => ({ useExerciseFavorites: mockUseExerciseFavorites }));

vi.mock("@/components/exercise/ExerciseDetailSheet", () => ({ default: () => null }));

import Exercises from "@/pages/Exercises";

const CATALOG = [
  {
    id: "1",
    nombre: "Press de Banca",
    __source: "catalogo",
    tipo: "Fuerza",
    grupo_muscular: "Pecho",
    equipment: "Barra",
    equipment_list: ["Barra"],
    musculos_involucrados: ["Pectoral Mayor"],
    registro_series: "peso_reps",
    dificultad: "2",
  },
  {
    id: "2",
    nombre: "Curl de Bíceps con Mancuernas",
    __source: "catalogo",
    tipo: "Fuerza",
    grupo_muscular: "Bíceps",
    equipment: "Mancuernas",
    equipment_list: ["Mancuernas"],
    musculos_involucrados: ["Bíceps Braquial"],
    registro_series: "peso_reps",
    dificultad: "1",
  },
  {
    id: "3",
    nombre: "Elevación Lateral",
    __source: "catalogo",
    tipo: "Fuerza",
    grupo_muscular: "Hombro",
    equipment: "Mancuernas",
    equipment_list: ["Mancuernas"],
    musculos_involucrados: ["Deltoides Lateral"],
    registro_series: "peso_reps",
    dificultad: "1",
  },
  {
    id: "4",
    nombre: "Dominada",
    __source: "catalogo",
    tipo: "Fuerza",
    grupo_muscular: "Espalda",
    equipment: "Barra de Dominadas",
    equipment_list: ["Barra de Dominadas"],
    musculos_involucrados: ["Dorsal Ancho"],
    registro_series: "solo_reps",
    dificultad: "3",
  },
];

function wrap(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

const searchBox = () => screen.getByRole("textbox", { name: "Buscar ejercicio" });

/** Nombres de ejercicio visibles en la lista, en orden de aparición. */
function listedNames(): string[] {
  return CATALOG.map((x) => x.nombre).filter((nombre) => screen.queryAllByText(nombre).length > 0);
}

describe("Biblioteca › buscador de ejercicios", () => {
  beforeAll(() => {
    window.scrollTo = vi.fn();
    // El scroll infinito solo amplía el render; en jsdom no existe.
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "";
      thresholds = [];
    } as unknown as typeof IntersectionObserver;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: "u1" } });
    mockUseExerciseCatalogAll.mockReturnValue({
      data: CATALOG,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseExerciseFavorites.mockReturnValue({
      favoriteKeys: new Set<string>(),
      isFavorite: () => false,
      toggleFavorite: vi.fn(),
    });
    mockCreate.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    mockDelete.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  it("parte mostrando el catálogo entero", () => {
    render(wrap(<Exercises />));
    expect(listedNames()).toHaveLength(CATALOG.length);
  });

  it("filtra ignorando mayúsculas y tildes", () => {
    render(wrap(<Exercises />));

    for (const query of ["biceps", "BÍCEPS", "BiCePs"]) {
      fireEvent.change(searchBox(), { target: { value: query } });
      expect(listedNames()).toEqual(["Curl de Bíceps con Mancuernas"]);
    }
  });

  it("encuentra el ejercicio acentuado escribiendo sin tilde", () => {
    render(wrap(<Exercises />));
    fireEvent.change(searchBox(), { target: { value: "elevacion lateral" } });
    expect(listedNames()).toEqual(["Elevación Lateral"]);
  });

  it("acepta los términos en cualquier orden y con puntuación", () => {
    render(wrap(<Exercises />));

    fireEvent.change(searchBox(), { target: { value: "banca press" } });
    expect(listedNames()).toEqual(["Press de Banca"]);

    fireEvent.change(searchBox(), { target: { value: "press-banca" } });
    expect(listedNames()).toEqual(["Press de Banca"]);
  });

  it("aguanta una errata", () => {
    render(wrap(<Exercises />));
    fireEvent.change(searchBox(), { target: { value: "dominadda" } });
    expect(listedNames()).toEqual(["Dominada"]);
  });

  it("entiende el sinónimo en inglés", () => {
    render(wrap(<Exercises />));
    fireEvent.change(searchBox(), { target: { value: "pull up" } });
    expect(listedNames()).toEqual(["Dominada"]);
  });

  it("busca también por material", () => {
    render(wrap(<Exercises />));
    fireEvent.change(searchBox(), { target: { value: "mancuernas" } });
    expect(listedNames()).toEqual(["Curl de Bíceps con Mancuernas", "Elevación Lateral"]);
  });

  it("encuentra press de banca aunque falte una ese", () => {
    render(wrap(<Exercises />));
    fireEvent.change(searchBox(), { target: { value: "Pres banca" } });
    expect(listedNames()).toEqual(["Press de Banca"]);
  });

  it("avisa cuando no hay coincidencias y no deja un spinner girando", () => {
    render(wrap(<Exercises />));
    fireEvent.change(searchBox(), { target: { value: "natacion sincronizada" } });

    expect(listedNames()).toEqual([]);
    expect(screen.getByText(/Ningún ejercicio coincide/)).toBeInTheDocument();
    expect(document.querySelector(".animate-spin")).toBeNull();
  });

  it("al haber más resultados de los pintados no finge una carga de red", () => {
    const big = Array.from({ length: 40 }, (_, i) => ({
      ...CATALOG[0],
      id: `n${i}`,
      nombre: `Ejercicio ${String(i).padStart(2, "0")}`,
    }));
    mockUseExerciseCatalogAll.mockReturnValue({
      data: big,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(wrap(<Exercises />));

    expect(screen.getByText("Ejercicio 00")).toBeInTheDocument();
    expect(screen.queryByText("Ejercicio 39")).not.toBeInTheDocument();
    expect(document.querySelector(".animate-spin")).toBeNull();
  });

  it("el botón de borrar devuelve el catálogo completo", () => {
    render(wrap(<Exercises />));

    fireEvent.change(searchBox(), { target: { value: "dominada" } });
    expect(listedNames()).toEqual(["Dominada"]);

    fireEvent.click(screen.getByRole("button", { name: "Borrar búsqueda" }));

    expect(searchBox()).toHaveValue("");
    expect(listedNames()).toHaveLength(CATALOG.length);
  });
});
