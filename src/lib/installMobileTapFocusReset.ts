/**
 * En dispositivos táctiles, los navegadores dejan foco en botones/enlaces tras un tap.
 * Eso muestra anillos y estilos :focus que no existen en apps nativas.
 * Este módulo quita el foco tras cada toque, excepto en campos de texto reales.
 */

let installed = false;

function isCoarsePointerDevice(): boolean {
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

function isTouchLikeEvent(event: Event): boolean {
  if (event instanceof PointerEvent) {
    return event.pointerType === "touch" || event.pointerType === "pen";
  }
  return isCoarsePointerDevice() || "ontouchstart" in window;
}

/** Campos donde el foco debe conservarse (teclado, edición). */
function isTextEntryField(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
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

function scheduleBlur(): void {
  blurNonTextFocus();
  requestAnimationFrame(blurNonTextFocus);
  window.setTimeout(blurNonTextFocus, 0);
  window.setTimeout(blurNonTextFocus, 50);
}

export function installMobileTapFocusReset(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const onTouchInteractionEnd = (event: Event) => {
    if (!isTouchLikeEvent(event)) return;
    scheduleBlur();
  };

  document.addEventListener("pointerup", onTouchInteractionEnd, true);
  document.addEventListener("touchend", onTouchInteractionEnd, { capture: true, passive: true });
  document.addEventListener("click", onTouchInteractionEnd, true);
}
