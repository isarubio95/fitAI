import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

const DRAG_THRESHOLD_PX = 8;
const EDGE_PX = 8;
const VELOCITY_WINDOW_MS = 120;
const MOMENTUM_MIN_SPEED = 0.02; // ~20 px/s
const MOMENTUM_DECAY_PER_MS = 0.994;
const MOMENTUM_STOP_SPEED = 0.004;

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

  if (rect.left + dx < EDGE_PX) nx += EDGE_PX - (rect.left + dx);
  dx = nx - prev.x;
  if (rect.right + dx > vw - EDGE_PX) nx -= rect.right + dx - (vw - EDGE_PX);

  let dy = ny - prev.y;
  if (rect.top + dy < minTop) ny += minTop - (rect.top + dy);
  dy = ny - prev.y;
  if (rect.bottom + dy > maxBottom) ny -= rect.bottom + dy - maxBottom;

  return { x: nx, y: ny };
}

function getVelocityFromSamples(samples: Array<{ x: number; y: number; t: number }>): Point {
  const first = samples[0];
  const last = samples[samples.length - 1];
  const dt = Math.max(8, last.t - first.t);
  return {
    x: (last.x - first.x) / dt,
    y: (last.y - first.y) / dt,
  };
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
  const [isDragging, setIsDragging] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<Point>({ x: 0, y: 0 });
  offsetRef.current = offset;
  const pendingOffsetRef = useRef<Point>(offset);
  const rafRef = useRef<number | null>(null);
  const momentumRafRef = useRef<number | null>(null);

  const modeRef = useRef(boundsMode);
  modeRef.current = boundsMode;

  const drag = useRef({
    active: false,
    pointerId: -1,
    startClient: { x: 0, y: 0 },
    startOffset: { x: 0, y: 0 },
    lastClient: { x: 0, y: 0 },
    lastTs: 0,
    velocity: { x: 0, y: 0 },
    moved: false,
  });
  const velocitySamplesRef = useRef<Array<{ x: number; y: number; t: number }>>([]);

  const resetVelocitySamples = useCallback((x: number, y: number, t: number) => {
    velocitySamplesRef.current = [{ x, y, t }];
  }, []);

  const pushVelocitySample = useCallback((x: number, y: number, t: number) => {
    const samples = velocitySamplesRef.current;
    samples.push({ x, y, t });
    const cutoff = t - VELOCITY_WINDOW_MS;
    while (samples.length > 1 && samples[0].t < cutoff) samples.shift();
    drag.current.velocity = getVelocityFromSamples(samples);
  }, []);

  const getReleaseVelocity = useCallback(() => {
    const samples = velocitySamplesRef.current;
    if (samples.length < 2) return { x: 0, y: 0 };
    return getVelocityFromSamples(samples);
  }, []);

  const flushOffset = useCallback(() => {
    rafRef.current = null;
    const next = pendingOffsetRef.current;
    setOffset(next);
  }, []);

  const scheduleOffset = useCallback(
    (next: Point) => {
      pendingOffsetRef.current = next;
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(flushOffset);
    },
    [flushOffset],
  );

  const stopMomentum = useCallback(() => {
    if (momentumRafRef.current != null) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
  }, []);

  const stopRafs = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (momentumRafRef.current != null) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRafs();
    };
  }, [stopRafs]);

  /** Antes del primer paint: evita un frame en (0,0) y luego salto desde localStorage. */
  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const p = JSON.parse(raw) as Point;
      if (typeof p.x !== "number" || typeof p.y !== "number") return;
      const c = clampOffset(p, el, offsetRef.current, modeRef.current);
      setOffset((prev) => (prev.x === c.x && prev.y === c.y ? prev : c));
    } catch {
      /* ignore */
    }
  }, [storageKey, boundsMode]);

  // Failsafe: si por cualquier motivo la pill queda fuera de pantalla (offset guardado raro),
  // reseteamos a posición segura para evitar que "desaparezca".
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const mode = modeRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const minTop = minTopPx(mode);
    const maxBottom = maxBottomPx(mode, vh);

    const check = () => {
      const rect = el.getBoundingClientRect();
      const completelyOff =
        rect.right < EDGE_PX ||
        rect.left > vw - EDGE_PX ||
        rect.bottom < minTop ||
        rect.top > maxBottom;
      if (!completelyOff) return;
      const safe: Point = { x: 0, y: 0 };
      scheduleOffset(safe);
      try {
        localStorage.setItem(storageKey, JSON.stringify(safe));
      } catch {
        /* ignore */
      }
    };

    const id = requestAnimationFrame(check);
    return () => cancelAnimationFrame(id);
  }, [storageKey, boundsMode, scheduleOffset]);

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

  const detachWindowListenersRef = useRef<(() => void) | null>(null);
  const finishDragRef = useRef<(pointerId: number) => void>(() => {});

  const detachWindowListeners = useCallback(() => {
    detachWindowListenersRef.current?.();
    detachWindowListenersRef.current = null;
  }, []);

  const applyPointerMove = useCallback(
    (clientX: number, clientY: number, pointerId: number) => {
      if (!drag.current.active || pointerId !== drag.current.pointerId) return;
      const now = performance.now();
      const dx = clientX - drag.current.startClient.x;
      const dy = clientY - drag.current.startClient.y;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) drag.current.moved = true;

      pushVelocitySample(clientX, clientY, now);
      drag.current.lastClient = { x: clientX, y: clientY };
      drag.current.lastTs = now;

      const next = {
        x: drag.current.startOffset.x + dx,
        y: drag.current.startOffset.y + dy,
      };
      const clamped = clampOffset(next, elRef.current, offsetRef.current, modeRef.current);
      scheduleOffset(clamped);
    },
    [pushVelocitySample, scheduleOffset],
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (e.pointerType === "touch") e.preventDefault();
    stopMomentum();
    detachWindowListeners();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    const now = performance.now();
    resetVelocitySamples(e.clientX, e.clientY, now);
    drag.current = {
      active: true,
      pointerId: e.pointerId,
      startClient: { x: e.clientX, y: e.clientY },
      startOffset: { ...pendingOffsetRef.current },
      lastClient: { x: e.clientX, y: e.clientY },
      lastTs: now,
      velocity: { x: 0, y: 0 },
      moved: false,
    };
    setIsDragging(true);

    const onWindowMove = (ev: PointerEvent) => {
      if (ev.pointerType === "touch") ev.preventDefault();
      applyPointerMove(ev.clientX, ev.clientY, ev.pointerId);
    };
    const onWindowEnd = (ev: PointerEvent) => {
      if (!drag.current.active || ev.pointerId !== drag.current.pointerId) return;
      try {
        target.releasePointerCapture(ev.pointerId);
      } catch {
        /* already released */
      }
      finishDragRef.current(ev.pointerId);
    };

    window.addEventListener("pointermove", onWindowMove, { passive: false });
    window.addEventListener("pointerup", onWindowEnd);
    window.addEventListener("pointercancel", onWindowEnd);
    detachWindowListenersRef.current = () => {
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerup", onWindowEnd);
      window.removeEventListener("pointercancel", onWindowEnd);
    };
  }, [applyPointerMove, detachWindowListeners, resetVelocitySamples, stopMomentum]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "touch") e.preventDefault();
      applyPointerMove(e.clientX, e.clientY, e.pointerId);
    },
    [applyPointerMove],
  );

  const finishDrag = useCallback(
    (pointerId: number) => {
      if (!drag.current.active || pointerId !== drag.current.pointerId) return;
      drag.current.active = false;
      detachWindowListeners();

      const start = { ...pendingOffsetRef.current };
      const startV = getReleaseVelocity();
      const speed = Math.hypot(startV.x, startV.y);
      const shouldMomentum = drag.current.moved && speed > MOMENTUM_MIN_SPEED;

      if (!shouldMomentum) {
        const c = clampOffset(start, elRef.current, start, modeRef.current);
        scheduleOffset(c);
        persist(c);
        velocitySamplesRef.current = [];
        setIsDragging(false);
        return;
      }

      // Inercia con desaceleración exponencial para sensación "native"
      let v = { ...startV };
      let p = { ...start };
      let last = performance.now();

      const tick = () => {
        const now = performance.now();
        const dt = Math.max(1, now - last);
        last = now;

        const decay = Math.pow(MOMENTUM_DECAY_PER_MS, dt);
        v = { x: v.x * decay, y: v.y * decay };
        p = { x: p.x + v.x * dt, y: p.y + v.y * dt };
        p = clampOffset(p, elRef.current, pendingOffsetRef.current, modeRef.current);
        pendingOffsetRef.current = p;
        setOffset(p);

        if (Math.hypot(v.x, v.y) < MOMENTUM_STOP_SPEED) {
          momentumRafRef.current = null;
          persist(p);
          velocitySamplesRef.current = [];
          setIsDragging(false);
          return;
        }
        momentumRafRef.current = requestAnimationFrame(tick);
      };

      stopMomentum();
      velocitySamplesRef.current = [];
      momentumRafRef.current = requestAnimationFrame(tick);
    },
    [detachWindowListeners, getReleaseVelocity, persist, scheduleOffset, stopMomentum],
  );
  finishDragRef.current = finishDrag;

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      finishDrag(e.pointerId);
    },
    [finishDrag],
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

  useEffect(() => {
    return () => {
      detachWindowListeners();
    };
  }, [detachWindowListeners]);

  const style =
    bottomPxFromViewport == null
      ? ({
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          willChange: "transform",
        } as const)
      : ({
          transform: `translateX(calc(-50% + ${offset.x}px)) translateY(${offset.y}px)`,
          willChange: "transform",
        } as const);

  return {
    elRef,
    style,
    isDragging,
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
