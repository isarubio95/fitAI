/** Cupos globales para miniaturas MapLibre (el navegador limita contextos WebGL). */
const MAX_CONCURRENT_MAP_THUMBS = 3;

type Waiter = () => void;

let active = 0;
const waiters: Waiter[] = [];

function pump() {
  while (active < MAX_CONCURRENT_MAP_THUMBS && waiters.length > 0) {
    const next = waiters.shift();
    if (!next) break;
    next();
  }
}

/**
 * Reserva un cupo para montar un mapa en miniatura.
 * Devuelve `release` que hay que llamar al desmontar.
 */
export function acquireMapThumbSlot(): Promise<() => void> {
  return new Promise((resolve) => {
    const grant = () => {
      active += 1;
      let released = false;
      resolve(() => {
        if (released) return;
        released = true;
        active = Math.max(0, active - 1);
        pump();
      });
    };

    if (active < MAX_CONCURRENT_MAP_THUMBS) {
      grant();
    } else {
      waiters.push(grant);
    }
  });
}
