/**
 * Los tokens de `index.css` guardan canales HSL (`142 71% 28%`).
 * Tailwind y el DOM entienden `hsl(var(--primary-solid))`; MapLibre (canvas)
 * no. Esta helper los resuelve a `hsl(H, S, L)` en runtime, así el pin sigue
 * `data-accent` en vez de un hex esmeralda de paleta default.
 */

/** Alineado con `:root` verde de `index.css`. */
export const CSS_HSL_TOKEN_FALLBACK = "hsl(142, 71%, 28%)";

export function cssHslToken(
  name: `--${string}`,
  fallback = CSS_HSL_TOKEN_FALLBACK,
): string {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  if (/^(hsl|hsla|hwb|lab|lch|oklch|oklab|color|rgb|rgba|#)/i.test(raw)) return raw;

  const withAlpha = raw.match(
    /^(-?[\d.]+)\s+([\d.]+%)\s+([\d.]+%)\s*\/\s*([\d.]+%?)$/,
  );
  if (withAlpha) {
    const [, h, s, l, a] = withAlpha;
    return `hsla(${h}, ${s}, ${l}, ${a})`;
  }

  const channels = raw.match(/^(-?[\d.]+)\s+([\d.]+%)\s+([\d.]+%)$/);
  if (channels) {
    const [, h, s, l] = channels;
    return `hsl(${h}, ${s}, ${l})`;
  }

  return raw;
}

/** Relleno accesible vs. pin seleccionado (más luminoso en oscuro). */
export function gymMapPinColors(): { fill: string; selected: string } {
  return {
    fill: cssHslToken("--primary-solid"),
    selected: cssHslToken("--primary"),
  };
}
