import { useCallback, useLayoutEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

const DRAG_THRESHOLD_PX = 8;
const EDGE_PX = 8;

export type DraggablePillBoundsMode = "activeWorkout" | "restSheet" | "restGlobal";

/** Pill “en curso”: respeta BottomNav en móvil. */
function bottomInsetPx(): number {
  if (typeof window === "undefined") return EDGE_PX;
  if (window.matchMedia("(min-width: 768px)").matches) return EDGE_PX;
  const nav = document.querySelector("[data-app-bottom-nav]");
  if (nav instanceof HTMLElement) {
    const h = nav.getBoundingClientRect().height;
    return h + EDGE_PX;
  }
  return 80 + 24 + EDGE_PX;
}

function minTopPx(mode: DraggablePillBoundsMode): number {
  if (mode !== "restSheet") return EDGE_PX;
  const header = document.querySelector("[data-active-workout-sheet-header]");
  if (header instanceof HTMLElement) {
    return Math.max(EDGE_PX, header.getBoundingClientRect().bottom + EDGE_PX);
  }
  return EDGE_PX;
}

function maxBottomPx(mode: DraggablePillBoundsMode, vh: number): number {
  if (mode === "activeWorkout") return vh - bottomInsetPx();
  return vh - EDGE_PX;
}

/**
 * Limita el offset con la geometría real (transform incluido).
 */
function clampOffset(
  next: Point,
  el: HTMLElement | null,
  prev: Point,
  mode: DraggablePillBoundsMode,
): Point {
  if (!el) return next;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxBottom = maxBottomPx(mode, vh);
  const minTop = minTopPx(mode);
  const rect = el.getBoundingClientRect();

  let nx = next.x;
  let ny = next.y;
  let dx = nx - prev.x;
  let dy = ny - prev.y;

  if (rect.left + dx < EDGE_PX) nx += EDGE_PX - (rect.left + dx);
  dx = nx - prev.x;
  if (rect.right + dx > vw - EDGE_PX) nx -= rect.right + dx - (vw - EDGE_PX);

  dx = nx - prev.x;
  dy = ny - prev.y;
  if (rect.top + dy < minTop) ny += minTop - (rect.top + dy);
  dy = ny - prev.y;
  if (rect.bottom + dy > maxBottom) ny -= rect.bottom + dy - maxBottom;

  return { x: nx, y: ny };
}

/**
 * Arrastre con dedo / puntero. Persiste offset en localStorage.
 */
export function useDraggablePillPosition(
  storageKey: string,
  bottomPxFromViewport: number | null,
  boundsMode: DraggablePillBoundsMode = "activeWorkout",
) {
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const elRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<Point>({ x: 0, y: 0 });
  offsetRef.current = offset;

  const modeRef = useRef(boundsMode);
  modeRef.current = boundsMode;

  const drag = useRef({
    active: false,
    pointerId: -1,
    startClient: { x: 0, y: 0 },
    startOffset: { x: 0, y: 0 },
    moved: false,
  });

  /** Antes del primer paint: evita un frame en (0,0) y luego salto desde localStorage. */
  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const p = JSON.parse(raw) as Point;
      if (typeof p.x !== "number" || typeof p.y !== "number") return;
      const c = clampOffset(p, el, p, modeRef.current);
      setOffset((prev) => (prev.x === c.x && prev.y === c.y ? prev : c));
    } catch {
      /* ignore */
    }
  }, [storageKey, boundsMode]);

  const persist = useCallback(
    (p: Point) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(p));
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = {
      active: true,
      pointerId: e.pointerId,
      startClient: { x: e.clientX, y: e.clientY },
      startOffset: { ...offsetRef.current },
      moved: false,
    };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active || e.pointerId !== drag.current.pointerId) return;
    const dx = e.clientX - drag.current.startClient.x;
    const dy = e.clientY - drag.current.startClient.y;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) drag.current.moved = true;
    const next = {
      x: drag.current.startOffset.x + dx,
      y: drag.current.startOffset.y + dy,
    };
    setOffset(clampOffset(next, elRef.current, offsetRef.current, modeRef.current));
  }, []);

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!drag.current.active || e.pointerId !== drag.current.pointerId) return;
      drag.current.active = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      setOffset((prev) => {
        const c = clampOffset(prev, elRef.current, prev, modeRef.current);
        persist(c);
        return c;
      });
    },
    [persist],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      endDrag(e);
    },
    [endDrag],
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      endDrag(e);
    },
    [endDrag],
  );

  const style =
    bottomPxFromViewport == null
      ? ({ transform: `translate(${offset.x}px, ${offset.y}px)` } as const)
      : ({ transform: `translateX(calc(-50% + ${offset.x}px)) translateY(${offset.y}px)` } as const);

  return {
    elRef,
    style,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    didDrag: () => drag.current.moved,
    resetMovedFlag: () => {
      drag.current.moved = false;
    },
  };
}
