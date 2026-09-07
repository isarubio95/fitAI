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
});
