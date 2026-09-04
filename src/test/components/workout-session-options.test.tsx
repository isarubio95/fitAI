import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WorkoutSessionOptions } from "@/components/workout/workout-logger/WorkoutSessionOptions";
import {
  PROGRESSIVE_OVERLOAD_SUGGESTIONS_KEY,
  isProgressiveOverloadSuggestionsEnabled,
} from "@/lib/progressiveOverloadPreferences";

describe("WorkoutSessionOptions", () => {
  afterEach(() => {
    localStorage.removeItem(PROGRESSIVE_OVERLOAD_SUGGESTIONS_KEY);
  });

  it("permite desactivar las sugerencias de progresión", () => {
    render(
      <div className="relative flex items-center justify-between gap-3">
        <span>Entrenamiento activo</span>
        <div className="flex h-8 items-center gap-1.5">
          <WorkoutSessionOptions />
          <span>15:11</span>
        </div>
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Opciones de entrenamiento" }));
    const dialog = screen.getByRole("dialog", { name: "Opciones" });
    expect(dialog).toHaveTextContent("Opciones");
    expect(dialog.className).toContain("inset-x-0");
    expect(dialog.className).toContain("md:w-72");

    const toggle = screen.getByRole("switch", { name: "Mostrar sugerencias de progresión" });
    expect(toggle).toHaveAttribute("data-state", "checked");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "unchecked");
    expect(isProgressiveOverloadSuggestionsEnabled()).toBe(false);
  });
});
