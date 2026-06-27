import { describe, expect, it } from "vitest";
import { isWorkoutPlanExpired, maxScheduledDate } from "@/lib/workoutPlanExpiry";

describe("workoutPlanExpiry", () => {
  it("detecta el último día programado", () => {
    expect(maxScheduledDate(["2026-06-01", "2026-06-15", "2026-06-10"])).toBe("2026-06-15");
    expect(maxScheduledDate([])).toBeNull();
  });

  it("expira solo después del último día", () => {
    expect(isWorkoutPlanExpired("2026-06-27", "2026-06-27")).toBe(false);
    expect(isWorkoutPlanExpired("2026-06-27", "2026-06-28")).toBe(true);
  });
});
