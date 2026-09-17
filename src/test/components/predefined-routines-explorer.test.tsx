import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { PredefinedRoutine } from "@/hooks/usePredefinedRoutines";

/**
 * El catálogo de plantillas está escrito en modo plano. La variante piramidal
 * no se duplica en base de datos: se elige al añadir y se materializa al
 * clonar. Este test fija ese contrato de la UI — cada opción del desplegable
 * debe llegar a `useCloneRoutine` con su variante.
 */
const { mockUsePredefinedRoutines, mockMutateAsync } = vi.hoisted(() => ({
  mockUsePredefinedRoutines: vi.fn(),
  mockMutateAsync: vi.fn(),
}));

vi.mock("@/hooks/usePredefinedRoutines", () => ({
  usePredefinedRoutines: mockUsePredefinedRoutines,
  useCloneRoutine: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}));

/**
 * Radix abre el menú con eventos de puntero que jsdom no implementa. El doble
 * deja el contenido siempre visible: lo que se prueba aquí es el cableado
 * opción → variante, no el primitivo de Radix.
 */
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => (
    <div role="menu">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" role="menuitem" onClick={onClick}>
      {children}
    </button>
  ),
}));

import { PredefinedRoutinesExplorer } from "@/components/routine/PredefinedRoutinesExplorer";

const routine = {
  id: "plantilla-1",
  nombre: "Torso A",
  icono: null,
  descripcion: "Empuje y tracción",
  nivel: "Intermedio",
  duracion_minutos: 45,
  grupo_muscular: "Torso",
  ejercicios: [],
} as unknown as PredefinedRoutine;

/** Los tres filtros son obligatorios para que el catálogo muestre tarjetas. */
function selectFilters() {
  fireEvent.click(screen.getByText("Media"));
  fireEvent.click(screen.getByText("45 min"));
  fireEvent.click(screen.getByText("Torso"));
}

describe("PredefinedRoutinesExplorer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePredefinedRoutines.mockReturnValue({ data: [routine], isLoading: false });
    mockMutateAsync.mockResolvedValue({
      id: "nueva",
      variant: "recta",
      applied: 0,
      total: 0,
    });
  });

  it("ofrece las tres variantes al añadir una rutina", async () => {
    render(<PredefinedRoutinesExplorer open onOpenChange={() => {}} />);
    selectFilters();

    expect(await screen.findByRole("menuitem", { name: /^Normal/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /^Piramidal inversa/ })).toBeInTheDocument();
    // La descripción es lo que explica la pirámide a quien no sabe qué es.
    expect(screen.getByText(/Bajan las repeticiones en cada serie/)).toBeInTheDocument();
  });

  it.each([
    [/^Normal/, "recta"],
    [/^Piramidal(?!\s*inversa)/, "piramidal_desc"],
    [/^Piramidal inversa/, "piramidal_asc"],
  ])("clona con la variante elegida (%s)", async (label, variant) => {
    render(<PredefinedRoutinesExplorer open onOpenChange={() => {}} />);
    selectFilters();

    fireEvent.click(await screen.findByRole("menuitem", { name: label }));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({ templateId: "plantilla-1", variant }),
    );
  });
});
