import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { SelectedGimnasio } from "@/types/gimnasio";

const { mockUseAuth, mockUseDefaultGimnasio, mockPersistDefaultGimnasio } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseDefaultGimnasio: vi.fn(),
  mockPersistDefaultGimnasio: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("@/hooks/useGimnasios", () => ({
  useDefaultGimnasio: mockUseDefaultGimnasio,
  persistDefaultGimnasio: mockPersistDefaultGimnasio,
  GIMNASIOS_QUERY_KEY: ["gimnasios"],
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/components/gym/GymPickerSheet", () => ({
  GymPickerSheet: ({
    open,
    onSelect,
  }: {
    open: boolean;
    onSelect: (gym: SelectedGimnasio | null) => void;
  }) =>
    open ? (
      <div>
        <button type="button" onClick={() => onSelect({ id: "g1", nombre: "Box Centro" })}>
          Elegir gym
        </button>
        <button type="button" onClick={() => onSelect(null)}>
          Quitar gimnasio
        </button>
      </div>
    ) : null,
}));

import { DefaultGymSettings } from "@/components/layout/DefaultGymSettings";

function wrap(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

describe("DefaultGymSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: "u1" } });
    mockUseDefaultGimnasio.mockReturnValue({ data: null, isLoading: false });
    mockPersistDefaultGimnasio.mockResolvedValue(undefined);
  });

  it("abre el picker y persiste el gimnasio elegido", async () => {
    render(wrap(<DefaultGymSettings />));

    fireEvent.click(screen.getByLabelText("Gimnasio por defecto"));
    fireEvent.click(screen.getByRole("button", { name: "Elegir gym" }));

    await waitFor(() => {
      expect(mockPersistDefaultGimnasio).toHaveBeenCalledWith("u1", {
        id: "g1",
        nombre: "Box Centro",
      });
    });
  });

  it("quita el gimnasio por defecto", async () => {
    mockUseDefaultGimnasio.mockReturnValue({
      data: { id: "g1", nombre: "Box Centro" },
      isLoading: false,
    });

    render(wrap(<DefaultGymSettings />));

    fireEvent.click(screen.getByLabelText("Gimnasio por defecto"));
    fireEvent.click(screen.getByRole("button", { name: "Quitar gimnasio" }));

    await waitFor(() => {
      expect(mockPersistDefaultGimnasio).toHaveBeenCalledWith("u1", null);
    });
  });
});
