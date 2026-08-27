/**
 * Superficie de "chrome" flotante (bottom nav, cápsula del logger).
 *
 * Cristal casi opaco con filo y sombra (`surface-float` en `index.css`): todo
 * lo que flota sobre el contenido se lee igual.
 */
export const floatingGlassSurface = "surface-float";

/**
 * Chrome fijo del layout móvil (cabecera, barras de drawer).
 *
 * Cristal casi opaco tintado con el color de la página: el contenido apenas
 * se intuye al pasar por debajo, y la barra no introduce un tono intermedio
 * entre página y card. Sin soporte de `backdrop-filter` cae a opaco (ver `index.css`).
 */
export const topBarSurface = "surface-glass";
