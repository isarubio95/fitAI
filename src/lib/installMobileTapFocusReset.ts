/**
 * En dispositivos táctiles, los navegadores dejan foco en botones/enlaces tras un tap.
 * Eso muestra anillos y estilos :focus que no existen en apps nativas.
 * Este módulo quita el foco tras cada toque, excepto en campos de texto reales.
 */

let installed = false;
let lastTouchLikeAt = 0;

const TOUCH_FOCUS_GRACE_MS = 900;

function isCoarsePointerDevice(): boolean {
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

function isTouchLikeEvent(event: Event): boolean {
  if (event instanceof PointerEvent) {
    return event.pointerType === "touch" || event.pointerType === "pen";
  }
  return isCoarsePointerDevice() || "ontouchstart" in window;
}

function markTouchLikeInteraction(): void {
  lastTouchLikeAt = Date.now();
}

/** Campos donde el foco debe conservarse (teclado, edición). */
function isTextEntryField(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT") {
    const type = (el as HTMLInputElement).type.toLowerCase();
    const textLike = new Set([
      "",
      "text",
      "email",
      "password",
      "search",
      "tel",
      "url",
      "number",
      "date",
      "datetime-local",
      "time",
      "month",
      "week",
    ]);
    return textLike.has(type);
  }
  return false;
}

function blurNonTextFocus(): void {
  const active = document.activeElement;
  if (!active || active === document.body || active === document.documentElement) return;
  if (isTextEntryField(active)) return;
  if (active instanceof HTMLElement && typeof active.blur === "function") {
    active.blur();
  }
}

function isMobileFocusableControl(el: Element | null): boolean {
  if (!(el instanceof Element)) return false;
  return Boolean(
    el.closest(
      "button, select, [role='button'], [role='tab'], [role='menuitem'], [role='option'], [data-slot='button']",
    ),
  );
}

function scheduleBlur(): void {
  blurNonTextFocus();
  requestAnimationFrame(blurNonTextFocus);
  window.setTimeout(blurNonTextFocus, 0);
  window.setTimeout(blurNonTextFocus, 50);
  window.setTimeout(blurNonTextFocus, 150);
  window.setTimeout(blurNonTextFocus, 300);
}

export function installMobileTapFocusReset(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const onTouchLikeStart = (event: Event) => {
    if (!isTouchLikeEvent(event)) return;
    markTouchLikeInteraction();
  };

  const onTouchInteractionEnd = (event: Event) => {
    if (!isTouchLikeEvent(event)) return;
    markTouchLikeInteraction();
    scheduleBlur();
  };

  const onFocusIn = () => {
    if (Date.now() - lastTouchLikeAt > TOUCH_FOCUS_GRACE_MS) return;
    scheduleBlur();
  };

  const onMobileControlTap = (event: Event) => {
    if (!isCoarsePointerDevice()) return;
    if (!isMobileFocusableControl(event.target as Element | null)) return;
    markTouchLikeInteraction();
    scheduleBlur();
  };

  document.addEventListener("pointerdown", onTouchLikeStart, true);
  document.addEventListener("touchstart", onTouchLikeStart, { capture: true, passive: true });
  document.addEventListener("pointerup", onTouchInteractionEnd, true);
  document.addEventListener("touchend", onTouchInteractionEnd, { capture: true, passive: true });
  document.addEventListener("click", onTouchInteractionEnd, true);
  document.addEventListener("click", onMobileControlTap, true);
  document.addEventListener("focusin", onFocusIn, true);
}
