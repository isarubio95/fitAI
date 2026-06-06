/** Contenedor base posicionado (Dialog / AlertDialog). */
export const DIALOG_CONTENT_BASE_CLASS =
  "fixed left-[50%] top-[50%] z-50 grid w-full max-h-[85dvh] translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 duration-200 overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

/** Superficie visual compartida (referencia: diálogo «Editar plan» del dashboard). */
export const DIALOG_SURFACE_CLASS =
  "rounded-none sm:max-w-md sm:rounded-3xl border-black/[0.025] bg-card text-card-foreground shadow-xs dark:border-white/[0.06]";

/** Espaciado estándar entre botones de acción dentro del cuerpo del diálogo. */
export const DIALOG_ACTIONS_CLASS = "flex flex-col gap-3";
