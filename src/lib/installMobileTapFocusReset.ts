/**
 * En dispositivos táctiles, los navegadores dejan foco en botones/enlaces tras un tap.
 * Eso muestra anillos y estilos :focus que no existen en apps nativas.
 * Este módulo quita el foco tras cada toque, excepto en campos de texto reales.
 */

let installed = false;

function isTouchDevice(): boolean {
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
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

export function installMobileTapFocusReset(): void {
  if (installed || typeof window === "undefined") return;
  if (!isTouchDevice()) return;
  installed = true;

  const scheduleBlur = () => {
    requestAnimationFrame(() => {
      blurNonTextFocus();
    });
  };

  document.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    scheduleBlur();
  }, true);

  document.addEventListener(
    "touchend",
    () => {
      scheduleBlur();
    },
    { capture: true, passive: true },
  );
}
