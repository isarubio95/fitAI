import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RoutineCardDragPreview } from "@/components/routine/SortableRoutineCard";
import type { RutinaWithDetails } from "@/types/routine";

/**
 * `RoutineCardDragPreview` es la copia que pinta el `DragOverlay` mientras se
 * reordenan las rutinas. Vive fuera del `SortableContext`, así que no puede
 * depender de `useSortable`: si lo hiciera, reventaría en cuanto empieza el
 * arrastre y la tarjeta no se vería.
 */
const routine = {
  id: "rutina-1",
  nombre: "Push Day",
  descripcion: null,
  icono: null,
  orden: 0,
  ejercicios: [
    {
      id: "ej-1",
      orden: 0,
      series_objetivo: 3,
      repes_min: 8,
      repes_max: 12,
      rir: 1,
      descanso: 120,
      superset_id: null,
      tipo_ejercicio: { nombre: "Press banca" },
    },
  ],
} as unknown as RutinaWithDetails;

describe("RoutineCardDragPreview", () => {
  it("se renderiza fuera de un SortableContext sin depender de dnd-kit", () => {
    expect(() => render(<RoutineCardDragPreview routine={routine} />)).not.toThrow();

    expect(screen.getByText("Push Day")).toBeInTheDocument();
  });

  it("se pinta siempre plegada", () => {
    const { container } = render(<RoutineCardDragPreview routine={routine} />);

    expect(screen.getByLabelText("Ver ejercicios de Push Day")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    // El detalle plegado queda inerte, no solo oculto por CSS.
    expect(container.querySelector("[inert]")).not.toBeNull();
  });
});
