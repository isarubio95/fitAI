import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { XPBreakdown } from "@/hooks/useGamification";
import { PostWorkoutModal } from "@/components/workout/PostWorkoutModal";

const breakdown: XPBreakdown = {
  base: 100,
  series: 90,
  streakBonus: 0,
  total: 190,
  leveledUp: false,
  newLevel: 1,
  previousLevel: 1,
  newStreak: 1,
  volumeLabel: "Volumen",
};

function wrap(ui: ReactNode) {
  return <MemoryRouter>{ui}</MemoryRouter>;
}

describe("PostWorkoutModal", () => {
  it("muestra el desglose de XP y no pide metadatos de la sesión", () => {
    render(
      wrap(
        <PostWorkoutModal open onClose={() => {}} breakdown={breakdown} />,
      ),
    );

    expect(screen.getByText("¡Entrenamiento Completado!")).toBeInTheDocument();
    expect(screen.getByText("Base")).toBeInTheDocument();
    expect(screen.getByText("Volumen")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir al inicio" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Título")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Gimnasio")).not.toBeInTheDocument();
    expect(screen.queryByText("¿Qué tan duro se sintió?")).not.toBeInTheDocument();
    expect(screen.queryByText("Publicar en comunidad")).not.toBeInTheDocument();
  });

  it("usa la etiqueta Duración en cardio", () => {
    render(
      wrap(
        <PostWorkoutModal
          open
          onClose={() => {}}
          breakdown={{ ...breakdown, volumeLabel: "Duración" }}
        />,
      ),
    );

    expect(screen.getByText("Duración")).toBeInTheDocument();
    expect(screen.queryByText("Volumen")).not.toBeInTheDocument();
  });

  it("celebra la subida de nivel", () => {
    render(
      wrap(
        <PostWorkoutModal
          open
          onClose={() => {}}
          breakdown={{ ...breakdown, leveledUp: true, newLevel: 5, previousLevel: 4 }}
        />,
      ),
    );

    expect(screen.getByText("¡Nivel 5!")).toBeInTheDocument();
  });

  it("cierra al ir al inicio", () => {
    const onClose = vi.fn();
    render(wrap(<PostWorkoutModal open onClose={onClose} breakdown={breakdown} />));
    fireEvent.click(screen.getByRole("button", { name: "Ir al inicio" }));
    expect(onClose).toHaveBeenCalled();
  });
});
