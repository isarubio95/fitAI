import type { CSSProperties } from "react";

/** Viewport coords of the pill center when opening from an active session pill. */
export type PillCircleOrigin = {
  x: number;
  y: number;
};

export const PILL_CIRCLE_IN = "in:circle:bottom-right" as const;
export const PILL_CIRCLE_OUT = "out:circle:bottom-right" as const;
/** @deprecated use PILL_CIRCLE_IN */
export const PILL_CIRCLE_TRANSITION = PILL_CIRCLE_IN;

export const PILL_CIRCLE_DURATION_MS = 500;
const DURATION = "0.5s";
const EASING = "ease-in-out";

export type PillCirclePhase = "in" | "out";

/** Capture pill center in viewport coordinates for a circle reveal origin. */
export function pillCircleOriginFromElement(el: Element | null): PillCircleOrigin | undefined {
  if (!(el instanceof HTMLElement)) return undefined;
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return undefined;
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function timingVars(): CSSProperties {
  return {
    ["--transition__duration" as string]: DURATION,
    ["--transition__easing" as string]: EASING,
  };
}

/**
 * Open: expand from the pill (`in:circle:bottom-right`).
 * Close: `out:circle:bottom-right` collapsing back to the pill (bottom),
 * so the layer disappears top→bottom and the UI behind reveals top→bottom.
 */
export function pillCircleTransitionStyle(
  origin: PillCircleOrigin,
  phase: PillCirclePhase = "in",
): CSSProperties {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1;
  const pillX = `${Math.max(0, Math.min(100, (origin.x / vw) * 100)).toFixed(2)}%`;
  const pillY = `${Math.max(0, Math.min(100, (origin.y / vh) * 100)).toFixed(2)}%`;

  if (phase === "out") {
    return {
      ...timingVars(),
      ["--circle-center-center-in" as string]: `circle(150% at ${pillX} ${pillY})`,
      ["--circle-bottom-right-out" as string]: `circle(0% at ${pillX} ${pillY})`,
    };
  }

  return {
    ...timingVars(),
    ["--circle-center-center-out" as string]: `circle(0% at ${pillX} ${pillY})`,
    ["--circle-bottom-right-in" as string]: `circle(150% at ${pillX} ${pillY})`,
  };
}

/**
 * Same as {@link pillCircleTransitionStyle} but relative to a bottom sheet
 * that covers `heightRatio` of the viewport height (e.g. 0.92 for 92lvh)
 * and, from `md`, is centered with max-width 42rem (max-w-2xl).
 */
export function pillCircleTransitionStyleForBottomSheet(
  origin: PillCircleOrigin,
  heightRatio = 0.92,
  phase: PillCirclePhase = "in",
): CSSProperties {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1;
  const sheetH = vh * heightRatio;
  const sheetTop = vh - sheetH;
  const isMd = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
  const sheetW = isMd ? Math.min(vw, 42 * 16) : vw;
  const sheetLeft = isMd ? (vw - sheetW) / 2 : 0;
  const pillX = `${Math.max(0, Math.min(100, ((origin.x - sheetLeft) / sheetW) * 100)).toFixed(2)}%`;
  const pillY = `${Math.max(0, Math.min(100, ((origin.y - sheetTop) / sheetH) * 100)).toFixed(2)}%`;

  if (phase === "out") {
    return {
      ...timingVars(),
      ["--circle-center-center-in" as string]: `circle(150% at ${pillX} ${pillY})`,
      ["--circle-bottom-right-out" as string]: `circle(0% at ${pillX} ${pillY})`,
    };
  }

  return {
    ...timingVars(),
    ["--circle-center-center-out" as string]: `circle(0% at ${pillX} ${pillY})`,
    ["--circle-bottom-right-in" as string]: `circle(150% at ${pillX} ${pillY})`,
  };
}

export function pillCircleTransitionAttr(phase: PillCirclePhase) {
  return phase === "out" ? PILL_CIRCLE_OUT : PILL_CIRCLE_IN;
}
