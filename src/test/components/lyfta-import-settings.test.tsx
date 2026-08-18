import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const {
  mockUseAuth,
  mockUseExerciseCatalog,
  mockPrepareLyftaImport,
  mockCompleteLyftaImport,
  mockClearPrepared,
  mockOpenLyftaApiKeyPage,
  mockToast,
} = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseExerciseCatalog: vi.fn(),
  mockPrepareLyftaImport: vi.fn(),
  mockCompleteLyftaImport: vi.fn(),
  mockClearPrepared: vi.fn(),
  mockOpenLyftaApiKeyPage: vi.fn(),
  mockToast: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("@/hooks/useExerciseCatalog", () => ({
  useExerciseCatalog: mockUseExerciseCatalog,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/lib/lyfta/importLyfta", () => ({
  prepareLyftaImport: mockPrepareLyftaImport,
  completeLyftaImport: mockCompleteLyftaImport,
  clearPreparedLyftaImport: mockClearPrepared,
}));

vi.mock("@/lib/lyfta/openLyftaApiKey", () => ({
  openLyftaApiKeyPage: mockOpenLyftaApiKeyPage,
}));

import { LyftaImportSettings } from "@/components/layout/LyftaImportSettings";

function wrap(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

function fillImportForm() {
  fireEvent.change(screen.getByLabelText("API key"), { target: { value: "lyfta-secret" } });
  fireEvent.click(screen.getByRole("radio", { name: /^Ambas/ }));
}

describe("LyftaImportSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: "u1" } });
    mockUseExerciseCatalog.mockReturnValue({
      data: [
        { id: "banca-barra", nombre: "Press Banca con Barra", __source: "catalogo", registro_series: "peso_reps" },
        { id: "custom-1", nombre: "Mi press raro", __source: "usuario", registro_series: "peso_reps" },
      ],
      isLoading: false,
    });
    mockPrepareLyftaImport.mockResolvedValue({
      status: "done",
      result: {
        workoutsImported: 1,
        workoutsSkipped: 0,
        routinesImported: 0,
        routinesSkipped: 0,
        exercisesOmitted: 0,
        customExercises: 0,
      },
    });
    mockCompleteLyftaImport.mockResolvedValue({
      workoutsImported: 1,
      workoutsSkipped: 0,
      routinesImported: 0,
      routinesSkipped: 0,
      exercisesOmitted: 1,
      customExercises: 0,
    });
  });

  it("muestra el enlace/botón a la API key, el campo y el selector de alcance", () => {
    render(wrap(<LyftaImportSettings resetToken />));

    expect(screen.getByRole("button", { name: "Generar API key de Lyfta" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Abrir página de API key de Lyfta" })).toHaveAttribute(
      "href",
      "https://my.lyfta.app/community/api",
    );
    expect(screen.getByLabelText("API key")).toBeTruthy();
    expect(screen.getByLabelText("Qué importar de Lyfta")).toBeTruthy();
    expect(screen.getByRole("radio", { name: /^Historial/ })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: /^Rutinas/ })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: /^Ambas/ })).not.toBeChecked();
  });

  it("deshabilita Importar sin API key ni alcance y lo habilita al completarlos", () => {
    render(wrap(<LyftaImportSettings resetToken />));

    const submit = screen.getByRole("button", { name: "Importar" });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("API key"), { target: { value: "lyfta-secret" } });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: /^Ambas/ }));
    expect(submit).not.toBeDisabled();
  });

  it("abre la página de Lyfta al pulsar generar key", () => {
    render(wrap(<LyftaImportSettings resetToken />));
    fireEvent.click(screen.getByRole("button", { name: "Generar API key de Lyfta" }));
    expect(mockOpenLyftaApiKeyPage).toHaveBeenCalled();
  });

  it("no llama a completeLyftaImport mientras hay ejercicios sin par", async () => {
    mockPrepareLyftaImport.mockResolvedValue({
      status: "needs_review",
      unmatched: [{ lyftaId: "gizmo", nombre: "Gizmo Twist 9000" }],
    });

    render(wrap(<LyftaImportSettings resetToken />));
    fillImportForm();
    fireEvent.click(screen.getByRole("button", { name: "Importar" }));

    await waitFor(() => {
      expect(screen.getByText("Emparejar ejercicios de Lyfta")).toBeTruthy();
    });
    expect(mockCompleteLyftaImport).not.toHaveBeenCalled();
    expect(screen.getByText("Gizmo Twist 9000")).toBeTruthy();
    expect(screen.queryByText("Mi press raro")).toBeNull();

    const continueBtn = screen.getByRole("button", { name: "Continuar importación" });
    expect(continueBtn).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Omitir" }));
    expect(continueBtn).not.toBeDisabled();
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(mockCompleteLyftaImport).toHaveBeenCalledWith(
        expect.objectContaining({
          resolutions: [{ lyftaId: "gizmo", tipoEjercicioId: null, createCustom: undefined }],
        }),
      );
    });
  });

  it("permite elegir un ejercicio del catálogo y entonces completa", async () => {
    mockPrepareLyftaImport.mockResolvedValue({
      status: "needs_review",
      unmatched: [{ lyftaId: "gizmo", nombre: "Gizmo Twist 9000" }],
    });

    render(wrap(<LyftaImportSettings resetToken />));
    fillImportForm();
    fireEvent.click(screen.getByRole("button", { name: "Importar" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Buscar par para Gizmo Twist 9000")).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText("Buscar par para Gizmo Twist 9000"), {
      target: { value: "Press Banca" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Press Banca con Barra" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar importación" }));

    await waitFor(() => {
      expect(mockCompleteLyftaImport).toHaveBeenCalledWith(
        expect.objectContaining({
          resolutions: [{ lyftaId: "gizmo", tipoEjercicioId: "banca-barra", createCustom: undefined }],
        }),
      );
    });
  });

  it("permite crear un ejercicio personalizado", async () => {
    mockPrepareLyftaImport.mockResolvedValue({
      status: "needs_review",
      unmatched: [{ lyftaId: "gizmo", nombre: "Gizmo Twist 9000" }],
    });
    mockCompleteLyftaImport.mockResolvedValue({
      workoutsImported: 1,
      workoutsSkipped: 0,
      routinesImported: 0,
      routinesSkipped: 0,
      exercisesOmitted: 0,
      customExercises: 1,
    });

    render(wrap(<LyftaImportSettings resetToken />));
    fillImportForm();
    fireEvent.click(screen.getByRole("button", { name: "Importar" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Crear «Gizmo Twist 9000»" })).toBeTruthy();
    });

    const continueBtn = screen.getByRole("button", { name: "Continuar importación" });
    expect(continueBtn).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Crear «Gizmo Twist 9000»" }));
    expect(continueBtn).not.toBeDisabled();
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(mockCompleteLyftaImport).toHaveBeenCalledWith(
        expect.objectContaining({
          resolutions: [{ lyftaId: "gizmo", tipoEjercicioId: null, createCustom: true }],
        }),
      );
    });
  });
});
