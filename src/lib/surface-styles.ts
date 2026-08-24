/**
 * Superficie de "chrome" flotante (bottom nav, cápsula del logger).
 *
 * Cristal translúcido con filo y sombra (`surface-float` en `index.css`): todo
 * lo que flota sobre el contenido se lee igual.
 */
export const floatingGlassSurface = "surface-float";

/**
 * Chrome fijo del layout móvil (cabecera, barras de drawer).
 *
 * Cristal translúcido tintado con el color de la página: el contenido se intuye
 * al pasar por debajo, pero la barra no introduce un tono intermedio entre
 * página y card. Sin soporte de `backdrop-filter` cae a opaco (ver `index.css`).
 */
export const topBarSurface = "surface-glass";
