/**
 * Carga diferida de las páginas, con precarga bajo demanda.
 *
 * Los chunks se piden en el `click`, así que en un móvil de gama media hay un
 * hueco visible entre tocar el tab y ver la pantalla. `preloadRoute` dispara el
 * `import()` en el `pointerdown` — 100-200 ms antes — y como el registro de
 * módulos deduplica, cuando React.lazy lo pide ya está resuelto.
 */

type Loader = () => Promise<unknown>;

const loaders = {
  "/": () => import("@/pages/Dashboard"),
  "/auth": () => import("@/pages/Auth"),
  "/routines": () => import("@/pages/Library"),
  "/community": () => import("@/pages/Community"),
  "/evolution": () => import("@/pages/Evolution"),
  "/cardio-routines": () => import("@/pages/CardioRoutines"),
  "/gimnasios": () => import("@/pages/Gyms"),
} satisfies Record<string, Loader>;

export type PreloadablePath = keyof typeof loaders;

const started = new Set<string>();

/** Idempotente y silenciosa: un fallo de red aquí lo reintenta React.lazy. */
export function preloadRoute(path: string) {
  if (started.has(path)) return;
  const loader = (loaders as Record<string, Loader | undefined>)[path];
  if (!loader) return;
  started.add(path);
  void loader().catch(() => {
    // Permite reintentar en el siguiente toque.
    started.delete(path);
  });
}

export const routeLoaders = loaders;
