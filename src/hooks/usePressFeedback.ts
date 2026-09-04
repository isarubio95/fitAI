import { useEffect } from "react";

/**
 * Elementos que reciben feedback de pulsación. Debe mantenerse en sintonía con
 * la lista de `touch-action: manipulation` de src/index.css.
 */
const PRESSABLE_SELECTOR = [
  "button",
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="link"]',
  "a[href]",
  "summary",
].join(",");

/**
 * Componentes que ya traen su propia animación de pulsación (pills flotantes,
 * handles de dnd-kit, switches) o que no deben encogerse.
 */
const EXCLUDED_SELECTOR = [
  ".touch-pill",
  ".touch-styled",
  ".no-press",
  "[data-draggable-pill]",
  "[data-dnd-handle]",
  '[role="switch"]',
].join(",");

/** Mismo umbral de axis-lock que usa SwipeToDeleteRow: por debajo es un tap. */
const MOVE_CANCEL_PX = 10;
/** Debe coincidir con la transición de [data-pressed="release"] en index.css. */
const RELEASE_MS = 180;

export function usePressFeedback() {
  useEffect(() => {
    const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
    if (!coarse) return;

    let pressed: HTMLElement | null = null;
    let startX = 0;
    let startY = 0;
    let pointerId: number | null = null;
    const releaseTimers = new WeakMap<HTMLElement, number>();

    /** Quita el estado de golpe, sin animación de salida (el gesto no era un tap). */
    const cancel = () => {
      if (!pressed) return;
      const timer = releaseTimers.get(pressed);
      if (timer) window.clearTimeout(timer);
      pressed.removeAttribute("data-pressed");
      pressed = null;
      pointerId = null;
    };

    /** Suelta con la curva de salida larga. */
    const release = () => {
      if (!pressed) return;
      const el = pressed;
      pressed = null;
      pointerId = null;

      el.setAttribute("data-pressed", "release");
      const timer = window.setTimeout(() => {
        el.removeAttribute("data-pressed");
        releaseTimers.delete(el);
      }, RELEASE_MS);
      releaseTimers.set(el, timer);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      cancel();

      const target = event.target as Element | null;
      const candidate = target?.closest?.(PRESSABLE_SELECTOR) as HTMLElement | null;
      if (!candidate) return;
      if (candidate.closest(EXCLUDED_SELECTOR)) return;
      if (candidate.hasAttribute("disabled") || candidate.getAttribute("aria-disabled") === "true") return;

      // Si el elemento venía de una salida en curso, corta el temporizador.
      const pendingRelease = releaseTimers.get(candidate);
      if (pendingRelease) {
        window.clearTimeout(pendingRelease);
        releaseTimers.delete(candidate);
      }

      pressed = candidate;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      candidate.setAttribute("data-pressed", "");
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pressed || event.pointerId !== pointerId) return;
      const dx = Math.abs(event.clientX - startX);
      const dy = Math.abs(event.clientY - startY);
      if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) cancel();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!pressed || event.pointerId !== pointerId) return;
      release();
    };

    // La WebView puede empezar a scrollear sin emitir `pointermove` sobre el
    // elemento, así que el scroll también cancela.
    const onScroll = () => cancel();

    const opts = { passive: true, capture: true } as const;
    document.addEventListener("pointerdown", onPointerDown, opts);
    document.addEventListener("pointermove", onPointerMove, opts);
    document.addEventListener("pointerup", onPointerUp, opts);
    document.addEventListener("pointercancel", cancel, opts);
    window.addEventListener("scroll", onScroll, opts);
    window.addEventListener("blur", cancel);

    return () => {
      cancel();
      document.removeEventListener("pointerdown", onPointerDown, opts);
      document.removeEventListener("pointermove", onPointerMove, opts);
      document.removeEventListener("pointerup", onPointerUp, opts);
      document.removeEventListener("pointercancel", cancel, opts);
      window.removeEventListener("scroll", onScroll, opts);
      window.removeEventListener("blur", cancel);
    };
  }, []);
}
