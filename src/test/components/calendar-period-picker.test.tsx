import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { startOfMonth, startOfWeek } from "date-fns";
import { CalendarPeriodPicker } from "@/components/dashboard/CalendarPeriodPicker";

describe("CalendarPeriodPicker", () => {
  it("elige un mes y cierra el selector", async () => {
    const onSelectMonth = vi.fn();
    render(
      <CalendarPeriodPicker
        view="month"
        label="Agosto 2026"
        month={new Date(2026, 7, 1)}
        weekStart={startOfWeek(new Date(2026, 7, 1), { weekStartsOn: 1 })}
        onSelectMonth={onSelectMonth}
        onSelectWeek={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText("Elegir mes y año"));
    fireEvent.click(screen.getByRole("button", { name: "mar" }));

    expect(onSelectMonth).toHaveBeenCalledTimes(1);
    const selected = onSelectMonth.mock.calls[0][0] as Date;
    expect(startOfMonth(selected)).toEqual(startOfMonth(new Date(2026, 2, 1)));
  });

  it("elige una semana desde el mini calendario", async () => {
    const onSelectWeek = vi.fn();
    render(
      <CalendarPeriodPicker
        view="week"
        label="17 - 23 de agosto"
        month={new Date(2026, 7, 1)}
        weekStart={startOfWeek(new Date(2026, 7, 17), { weekStartsOn: 1 })}
        onSelectMonth={vi.fn()}
        onSelectWeek={onSelectWeek}
      />,
    );

    fireEvent.click(screen.getByLabelText("Elegir semana"));
    fireEvent.click(screen.getByRole("button", { name: "10" }));

    expect(onSelectWeek).toHaveBeenCalledTimes(1);
    const selected = onSelectWeek.mock.calls[0][0] as Date;
    expect(selected.getDate()).toBe(10);
    expect(selected.getMonth()).toBe(7);
  });
});
