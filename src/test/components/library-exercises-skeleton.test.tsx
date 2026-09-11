import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LibraryExercisesSkeleton } from "@/components/layout/LibraryExercisesSkeleton";

describe("LibraryExercisesSkeleton", () => {
  it("replica buscador, filtros y filas del catálogo", () => {
    render(<LibraryExercisesSkeleton />);

    expect(screen.getByPlaceholderText("Buscar ejercicio...")).toBeInTheDocument();
    expect(screen.getByText("Favoritos")).toBeInTheDocument();
    expect(screen.getByText("Tipo")).toBeInTheDocument();
    expect(screen.getByText("Grupo")).toBeInTheDocument();
    expect(screen.getByText("Equipo")).toBeInTheDocument();
    expect(screen.getByText("Crear")).toBeInTheDocument();
  });

  it("el FAB Crear usa h-9 de compoundVariants, sin !h-9", () => {
    render(<LibraryExercisesSkeleton />);
    const crear = screen.getByText("Crear").closest("button");
    expect(crear).toBeTruthy();
    expect(crear?.className).toMatch(/\bh-9\b/);
    expect(crear?.className).not.toMatch(/!h-/);
    expect(crear?.className).not.toMatch(/\bh-10\b/);
    expect(crear?.className).toMatch(/\brounded-full\b/);
  });
});
