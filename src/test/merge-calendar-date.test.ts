import { describe, expect, it } from "vitest";
import { mergeCalendarDatePreservingTime } from "@/lib/mergeCalendarDate";

describe("mergeCalendarDatePreservingTime", () => {
  it("cambia el día y conserva la hora local", () => {
    const original = new Date(2026, 7, 21, 18, 30, 0);
    const merged = new Date(mergeCalendarDatePreservingTime("2026-08-22", original.toISOString()));
    expect(merged.getFullYear()).toBe(2026);
    expect(merged.getMonth()).toBe(7);
    expect(merged.getDate()).toBe(22);
    expect(merged.getHours()).toBe(18);
    expect(merged.getMinutes()).toBe(30);
  });
});
