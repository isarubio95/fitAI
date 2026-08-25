import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ElapsedTime } from "@/components/workout/workout-logger/ElapsedTime";

describe("ElapsedTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("muestra 0:00 y no avanza si el cronómetro no está en marcha", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-24T12:00:00.000Z"));
    render(<ElapsedTime since="2026-08-24T11:59:00.000Z" running={false} />);

    expect(screen.getByLabelText("Tiempo transcurrido")).toHaveTextContent("0:00");
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByLabelText("Tiempo transcurrido")).toHaveTextContent("0:00");
  });

  it("muestra 0:00 al instante aunque aún no haya since", () => {
    render(<ElapsedTime running={false} />);
    expect(screen.getByLabelText("Tiempo transcurrido")).toHaveTextContent("0:00");
  });

  it("avanza cuando está en marcha", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-24T12:00:00.000Z"));
    render(<ElapsedTime since="2026-08-24T12:00:00.000Z" running />);

    expect(screen.getByLabelText("Tiempo transcurrido")).toHaveTextContent("0:00");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByLabelText("Tiempo transcurrido")).toHaveTextContent("0:01");
  });
});
