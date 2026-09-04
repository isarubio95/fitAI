/**
 * Dirección de la transición entre secciones de la bottom nav.
 *
 * React Router activa `document.startViewTransition` con la prop
 * `viewTransition` del NavLink, pero no sabe si el usuario va "hacia delante" o
 * "hacia atrás". Aquí se compara la posición de los tabs y se deja la respuesta
 * en `data-nav-direction` sobre <html>, que es lo que consulta el CSS de
 * `::view-transition-*` para elegir el sentido del desplazamiento.
 */

/** Orden de las secciones en la barra inferior, de izquierda a derecha. */
const SECTION_ORDER = ["/", "/routines", "/community", "/evolution"];

function sectionIndex(pathname: string): number {
  if (pathname === "/") return 0;
  return SECTION_ORDER.findIndex((path) => path !== "/" && pathname.startsWith(path));
}

/**
 * Marca la dirección antes de navegar. Devuelve false si alguna de las dos
 * rutas no es una sección conocida: ahí un desplazamiento lateral no significa
 * nada y es mejor no animar.
 */
export function markNavDirection(from: string, to: string): boolean {
  const fromIndex = sectionIndex(from);
  const toIndex = sectionIndex(to);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return false;

  document.documentElement.dataset.navDirection = toIndex > fromIndex ? "forward" : "back";
  return true;
}
