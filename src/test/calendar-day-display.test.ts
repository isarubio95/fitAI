import { describe, expect, it } from "vitest";
import {
  CALENDAR_DAY_CELL_SHAPE,
  getCalendarDayCircleClasses,
} from "@/lib/calendarDayDisplay";

const base = {
  isTrained: false,
  isCardioTrained: false,
  isScheduled: false,
  isPast: false,
  today: false,
  dataReady: true,
};

describe("getCalendarDayCircleClasses", () => {
  it("deja el día vacío sin relleno ni borde", () => {
    const styles = getCalendarDayCircleClasses(base);
    expect(styles.circleFill).toBe("bg-transparent");
    expect(styles.circleBorder).toBe("border-transparent");
    expect(styles.hasMark).toBe(false);
  });

  it("marca hoy vacío con borde piloto, sin baldosa", () => {
    const styles = getCalendarDayCircleClasses({ ...base, today: true });
    expect(styles.circleFill).toBe("bg-transparent");
    expect(styles.circleBorder).toBe("border-primary");
    expect(styles.hasMark).toBe(false);
  });

  it("rellena el día entrenado", () => {
    const styles = getCalendarDayCircleClasses({ ...base, isTrained: true });
    expect(styles.circleFill).toContain("from-primary");
    expect(styles.hasMark).toBe(true);
  });

  it("usa radio de celda, no cápsula", () => {
    expect(CALENDAR_DAY_CELL_SHAPE).toBe("rounded-md");
  });
});
