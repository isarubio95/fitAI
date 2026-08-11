/**
 * Superficies de "chrome" flotante del sistema de diseño: header móvil,
 * bottom nav y barras translúcidas del logger.
 *
 * El color sale de `--surface-elevated` (un escalón por debajo de `--card`),
 * así que sigue al tema en claro y oscuro sin colores cableados.
 */
export const floatingGlassSurface =
  "border border-black/10 bg-[hsl(var(--surface-elevated)/0.75)] shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-[hsl(var(--surface-elevated)/0.88)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)] dark:ring-1 dark:ring-white/5";

/** Barra fija superior: opaca en claro, translúcida con blur en oscuro. */
export const topBarSurface =
  "bg-[hsl(var(--surface-elevated))] dark:bg-[hsl(var(--surface-elevated)/0.88)] dark:backdrop-blur-2xl";
