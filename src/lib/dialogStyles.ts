/** Contenedor base posicionado (Dialog / AlertDialog). En móvil, inset px-4 respecto al viewport. */
export const DIALOG_CONTENT_BASE_CLASS =
  "fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-h-[85dvh] translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 duration-200 overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

/** Superficie visual compartida (referencia: diálogo «Editar plan» del dashboard). */
export const DIALOG_SURFACE_CLASS =
  "surface-card rounded-3xl sm:max-w-md bg-card text-card-foreground shadow-[var(--shadow-float)]";

/** Espaciado estándar entre botones de acción dentro del cuerpo del diálogo. */
export const DIALOG_ACTIONS_CLASS = "flex flex-col gap-3";
