import { useEffect, useState, type CSSProperties } from "react";
import {
  pillCircleOriginFromElement,
  type PillCircleOrigin,
} from "@/lib/pillCircleTransition";

/** Expand from origin — still uses `in:circle:center` keyframes (center vars overridden). */
export const CIRCLE_CENTER_IN = "in:circle:center" as const;
/** Collapse back to origin — `out:circle:center`. */
export const CIRCLE_CENTER_OUT = "out:circle:center" as const;

/** Slightly snappier than the pill drawer (500ms). */
export const CIRCLE_CENTER_DURATION_MS = 320;

export type CircleCenterPhase = "in" | "settled" | "out";
export type CircleCenterOrigin = PillCircleOrigin;

export { pillCircleOriginFromElement as circleOriginFromElement };

const DURATION = `${CIRCLE_CENTER_DURATION_MS / 1000}s`;
const EASING = "ease-in-out";

function originPercents(origin: CircleCenterOrigin): { x: string; y: string } {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1;
  return {
    x: `${Math.max(0, Math.min(100, (origin.x / vw) * 100)).toFixed(2)}%`,
    y: `${Math.max(0, Math.min(100, (origin.y / vh) * 100)).toFixed(2)}%`,
  };
}

/**
 * Circles bundle references these vars but does not ship `:root` defaults;
 * set them on the element so clip-path resolves at the metrics-bar origin.
 */
function circleCenterShapeVars(origin?: CircleCenterOrigin): CSSProperties {
  const at =
    origin != null
      ? (() => {
          const { x, y } = originPercents(origin);
          return `${x} ${y}`;
        })()
      : "center";

  return {
    ["--circle-center-center-out" as string]: `circle(0% at ${at})`,
    // 150% so corners are covered when the origin sits near the bottom edge.
    ["--circle-center-center-in" as string]: `circle(150% at ${at})`,
    ["--transition__duration" as string]: DURATION,
    ["--transition__easing" as string]: EASING,
  };
}

export function circleCenterTransitionAttr(
  phase: CircleCenterPhase,
): string | undefined {
  if (phase === "settled") return undefined;
  return phase === "out" ? CIRCLE_CENTER_OUT : CIRCLE_CENTER_IN;
}

export function circleCenterTransitionStyle(
  phase: CircleCenterPhase,
  origin?: CircleCenterOrigin,
): CSSProperties {
  if (phase === "settled") {
    return { clipPath: "none" };
  }
  return circleCenterShapeVars(origin);
}

/**
 * Keeps the panel mounted through circle-out so transition-style can finish,
 * then clears it. Same lifecycle as calendar day expand / pill circle.
 */
export function useCircleCenterTransition(open: boolean): CircleCenterPhase | null {
  const [phase, setPhase] = useState<CircleCenterPhase | null>(() =>
    open ? "settled" : null,
  );

  useEffect(() => {
    if (open) {
      setPhase((prev) => {
        if (prev && prev !== "out") return prev;
        return "in";
      });
      return;
    }
    setPhase((prev) => {
      if (!prev || prev === "out") return prev;
      return "out";
    });
  }, [open]);

  useEffect(() => {
    if (phase !== "in") return;
    const t = window.setTimeout(() => {
      setPhase((prev) => (prev === "in" ? "settled" : prev));
    }, CIRCLE_CENTER_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "out") return;
    const t = window.setTimeout(() => {
      setPhase(null);
    }, CIRCLE_CENTER_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  return phase;
}
