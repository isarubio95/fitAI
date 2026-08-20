import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { SwipeToDeleteRow } from "@/components/workout/SwipeToDeleteRow";

function swipe(el: HTMLElement, fromX: number, toX: number, y = 10) {
  fireEvent.pointerDown(el, { pointerId: 1, button: 0, clientX: fromX, clientY: y });
  fireEvent.pointerMove(el, { pointerId: 1, clientX: toX, clientY: y });
  fireEvent.pointerUp(el, { pointerId: 1, button: 0, clientX: toX, clientY: y });
}

describe("SwipeToDeleteRow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("elimina al deslizar a la izquierda más del umbral", () => {
    const onDelete = vi.fn();
    render(
      <SwipeToDeleteRow label="serie 1" onDelete={onDelete}>
        <span>60 × 10</span>
      </SwipeToDeleteRow>,
    );

    const row = screen.getByText("60 × 10").closest("[data-vaul-no-drag]");
    expect(row).toBeTruthy();
    swipe(row as HTMLElement, 200, 40);

    expect(onDelete).not.toHaveBeenCalled();
    vi.advanceTimersByTime(380);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("no elimina si el deslizamiento es corto", () => {
    const onDelete = vi.fn();
    render(
      <SwipeToDeleteRow label="serie 1" onDelete={onDelete}>
        <span>60 × 10</span>
      </SwipeToDeleteRow>,
    );

    const row = screen.getByText("60 × 10").closest("[data-vaul-no-drag]");
    swipe(row as HTMLElement, 200, 110);
    vi.advanceTimersByTime(380);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("la opacidad del fondo llega al máximo en el umbral de borrado", () => {
    render(
      <SwipeToDeleteRow label="serie 1" onDelete={vi.fn()}>
        <span>60 × 10</span>
      </SwipeToDeleteRow>,
    );

    const row = screen.getByText("60 × 10").closest("[data-vaul-no-drag]") as HTMLElement;
    fireEvent.pointerDown(row, { pointerId: 1, button: 0, clientX: 200, clientY: 10 });
    fireEvent.pointerMove(row, { pointerId: 1, clientX: 128, clientY: 10 });

    const reveal = row.querySelector("[data-swipe-delete-reveal]");
    expect(reveal).toBeTruthy();
    expect(Number((reveal as HTMLElement).style.opacity)).toBeCloseTo(0.5, 5);

    fireEvent.pointerMove(row, { pointerId: 1, clientX: 56, clientY: 10 });
    expect(Number((reveal as HTMLElement).style.opacity)).toBe(1);
  });
});
