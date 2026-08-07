import { useEffect, useState, type CSSProperties } from "react";

/** Reveal downward — same alias as `in:wipe:top` in transition-style. */
export const CALENDAR_DAY_EXPAND_IN = "in:wipe:down" as const;
/** Collapse upward — same alias as `out:wipe:top`. */
export const CALENDAR_DAY_EXPAND_OUT = "out:wipe:up" as const;

export const CALENDAR_DAY_EXPAND_DURATION_MS = 280;

export type CalendarDayExpandPhase = "in" | "settled" | "out";

export type CalendarDayExpandPanel = {
  dayKey: string;
  phase: CalendarDayExpandPhase;
};

const DURATION = `${CALENDAR_DAY_EXPAND_DURATION_MS / 1000}s`;
const EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

export function calendarDayExpandTransitionAttr(
  phase: CalendarDayExpandPhase,
): string | undefined {
  if (phase === "settled") return undefined;
  return phase === "out" ? CALENDAR_DAY_EXPAND_OUT : CALENDAR_DAY_EXPAND_IN;
}

export function calendarDayExpandTransitionStyle(
  phase: CalendarDayExpandPhase,
): CSSProperties {
  if (phase === "settled") {
    return { clipPath: "none" };
  }
  return {
    ["--transition__duration" as string]: DURATION,
    ["--transition__easing" as string]: EASING,
  };
}

/**
 * Keeps the day panel mounted through the wipe-out so transition-style can finish,
 * then clears it. Mirrors the pill circle in → settled → out lifecycle.
 */
export function useCalendarDayExpandTransition(
  expandedDayKey: string | null,
): CalendarDayExpandPanel | null {
  const [panel, setPanel] = useState<CalendarDayExpandPanel | null>(() =>
    expandedDayKey ? { dayKey: expandedDayKey, phase: "settled" } : null,
  );

  useEffect(() => {
    if (expandedDayKey) {
      setPanel((prev) => {
        if (prev?.dayKey === expandedDayKey && prev.phase !== "out") return prev;
        return { dayKey: expandedDayKey, phase: "in" };
      });
      return;
    }
    setPanel((prev) => {
      if (!prev || prev.phase === "out") return prev;
      return { ...prev, phase: "out" };
    });
  }, [expandedDayKey]);

  useEffect(() => {
    if (panel?.phase !== "in") return;
    const t = window.setTimeout(() => {
      setPanel((prev) =>
        prev?.phase === "in" ? { ...prev, phase: "settled" } : prev,
      );
    }, CALENDAR_DAY_EXPAND_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [panel?.phase, panel?.dayKey]);

  useEffect(() => {
    if (panel?.phase !== "out") return;
    const t = window.setTimeout(() => {
      setPanel(null);
    }, CALENDAR_DAY_EXPAND_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [panel?.phase]);

  return panel;
}
