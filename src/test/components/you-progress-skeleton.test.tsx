import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { YouProgressSkeleton } from "@/components/layout/YouProgressSkeleton";

describe("YouProgressSkeleton", () => {
  it("replica el layout de Progreso: pills, grid 2×2 y cards de gráfico", () => {
    render(<YouProgressSkeleton />);

    expect(screen.getByText("7 días")).toBeInTheDocument();
    expect(screen.getByText("4 sem.")).toBeInTheDocument();
    expect(screen.getAllByText("Sesiones").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("heading", { name: "Constancia" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Volumen de fuerza" })).toBeInTheDocument();
    expect(screen.getByText("Gym")).toBeInTheDocument();
    expect(screen.getByText("Cardio")).toBeInTheDocument();
    expect(screen.getByText("Series")).toBeInTheDocument();
  });
});
