import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { tapLight } from "@/lib/haptics";

const AXIS_LOCK_PX = 10;
const DELETE_PX = 144;
const EXIT_MS = 380;

const ICON_CENTER = "translate3d(-50%, -50%, 0)";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
}

type SwipeToDeleteRowProps = {
  onDelete: () => void;
  label: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Deslizar a la izquierda elimina la fila. El umbral actúa como confirmación:
 * un gesto corto vuelve atrás; uno amplio saca la fila y llama a onDelete.
 */
export function SwipeToDeleteRow({
  onDelete,
  label,
  disabled = false,
  className,
  children,
}: SwipeToDeleteRowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const axisRef = useRef<"undecided" | "x" | "y">("undecided");
  const pointerIdRef = useRef<number | null>(null);
  const deletingRef = useRef(false);
  const armedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const iconScaleRef = useRef<HTMLSpanElement>(null);
  const popRafRef = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);

  const setOffsetBoth = (value: number) => {
    offsetRef.current = value;
    setOffset(value);
  };

  const popIcon = (arm: boolean) => {
    const el = iconScaleRef.current;
    if (!el || typeof el.animate !== "function") return;
    el.getAnimations().forEach((animation) => animation.cancel());
    if (prefersReducedMotion()) {
      el.style.transform = `${ICON_CENTER} scale(${arm ? 1.08 : 1})`;
      return;
    }
    el.animate(
      arm
        ? [
            { transform: `${ICON_CENTER} scale(1)` },
            { transform: `${ICON_CENTER} scale(1.2)`, offset: 0.42 },
            { transform: `${ICON_CENTER} scale(1.08)` },
          ]
        : [
            { transform: `${ICON_CENTER} scale(1.08)` },
            { transform: `${ICON_CENTER} scale(1)` },
          ],
      {
        duration: arm ? 280 : 160,
        easing: arm ? "cubic-bezier(0.22, 1.15, 0.36, 1)" : "ease-out",
        fill: "forwards",
      },
    );
  };

  const setArmedBoth = (value: boolean) => {
    if (value === armedRef.current) return;
    armedRef.current = value;
    // Al cruzar el umbral, el tick confirma que soltar ya borra — sin mirar.
    if (value) tapLight();
    if (popRafRef.current != null) cancelAnimationFrame(popRafRef.current);
    popRafRef.current = requestAnimationFrame(() => {
      popRafRef.current = null;
      popIcon(armedRef.current);
    });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);
      if (popRafRef.current != null) cancelAnimationFrame(popRafRef.current);
    };
  }, []);

  const finishDelete = () => {
    if (deletingRef.current) return;
    deletingRef.current = true;
    onDelete();
  };

  const snapBack = () => {
    setAnimating(true);
    setArmedBoth(false);
    setOffsetBoth(0);
  };

  const commitDelete = () => {
    const width = rootRef.current?.offsetWidth ?? 320;
    setAnimating(true);
    setArmedBoth(true);
    setOffsetBoth(-width);
    if (prefersReducedMotion()) {
      finishDelete();
      return;
    }
    timeoutRef.current = window.setTimeout(finishDelete, EXIT_MS);
  };

  const capturePointer = (target: HTMLDivElement, pointerId: number) => {
    try {
      target.setPointerCapture(pointerId);
    } catch {
      /* jsdom */
    }
  };

  const releasePointer = (target: HTMLDivElement, pointerId: number) => {
    try {
      if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId);
    } catch {
      /* jsdom */
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || deletingRef.current || event.button !== 0) return;
    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    axisRef.current = "undecided";
    setAnimating(false);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || deletingRef.current || pointerIdRef.current !== event.pointerId) return;
    const dx = event.clientX - startXRef.current;
    const dy = event.clientY - startYRef.current;

    if (axisRef.current === "undecided") {
      if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
      axisRef.current = Math.abs(dx) > Math.abs(dy) * 1.15 ? "x" : "y";
      if (axisRef.current === "x" && rootRef.current) {
        capturePointer(rootRef.current, event.pointerId);
        const active = document.activeElement;
        if (active instanceof HTMLElement && rootRef.current.contains(active)) active.blur();
      }
    }

    if (axisRef.current !== "x") return;
    event.preventDefault();
    event.stopPropagation();
    const raw = Math.min(0, dx);
    const extra = raw < -DELETE_PX ? (raw + DELETE_PX) * 0.28 : 0;
    const next = raw < -DELETE_PX ? -DELETE_PX + extra : raw;
    setArmedBoth(raw <= -DELETE_PX);
    setOffsetBoth(next);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    const dx = event.clientX - startXRef.current;
    const lockedX = axisRef.current === "x";
    pointerIdRef.current = null;
    axisRef.current = "undecided";
    if (rootRef.current) releasePointer(rootRef.current, event.pointerId);
    if (!lockedX || deletingRef.current) {
      setArmedBoth(false);
      setOffsetBoth(0);
      return;
    }
    if (dx <= -DELETE_PX) commitDelete();
    else snapBack();
  };

  const progress = Math.min(1, Math.abs(offset) / DELETE_PX);
  const revealing = offset !== 0 || animating;

  return (
    <div
      ref={rootRef}
      data-vaul-no-drag
      data-vaul-allow-horizontal-pan
      className="relative isolate w-full overflow-hidden touch-pan-y"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {revealing ? (
        <>
          <div
            aria-hidden
            data-swipe-delete-reveal
            className="pointer-events-none absolute inset-y-0 right-0"
            style={{
              width: Math.max(0, -offset),
              opacity: progress,
              backgroundColor: "color-mix(in srgb, hsl(var(--destructive)) 52%, black)",
              transition: animating ? `opacity ${EXIT_MS}ms ease, width ${EXIT_MS}ms ease` : "none",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-0 h-0 w-0"
            style={{
              opacity: progress,
              transform: `translate3d(${offset / 2}px, 0, 0)`,
              transition: animating ? `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease` : "none",
            }}
          >
            <span
              ref={iconScaleRef}
              className="absolute left-0 top-0"
              style={{ willChange: "transform", transform: ICON_CENTER }}
            >
              <Trash2 className="h-4 w-4 text-white" />
            </span>
          </span>
        </>
      ) : null}
      <div
        className={cn("relative w-full", className)}
        style={{
          transform: revealing ? `translate3d(${offset}px, 0, 0)` : undefined,
          transition: animating ? `transform ${EXIT_MS}ms ease` : "none",
        }}
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget) return;
          if (offsetRef.current === 0) setAnimating(false);
        }}
      >
        {children}
      </div>
      <span className="sr-only">Desliza a la izquierda para eliminar {label}</span>
    </div>
  );
}
