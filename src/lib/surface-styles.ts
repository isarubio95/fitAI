/**
 * Superficie de "chrome" flotante del sistema de diseño (barras del logger).
 *
 * El color sale de `--surface-elevated` (un escalón por debajo de `--card`),
 * así que sigue al tema en claro y oscuro sin colores cableados.
 */
export const floatingGlassSurface =
  "border border-black/10 bg-[hsl(var(--surface-elevated))] shadow-[0_10px_35px_rgba(0,0,0,0.16)] dark:border-white/10 dark:bg-[hsl(var(--surface-elevated))] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)] dark:ring-1 dark:ring-white/5";

/** Chrome fijo del layout móvil (header y bottom nav): opaco en claro y oscuro. */
export const topBarSurface =
  "bg-[hsl(var(--surface-elevated))]";
