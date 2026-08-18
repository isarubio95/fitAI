/**
 * Margen tras el último `onDrag` de Vaul dentro del cual un cierre se considera
 * provocado por el swipe hacia abajo (el `pointerup` llega inmediatamente después).
 */
export const SWIPE_DISMISS_WINDOW_MS = 250;

import { floatingGlassSurface } from "@/lib/surface-styles";

/** Cápsula opaca del logger de entrenamiento activo. */
export const ACTIVE_WORKOUT_FLOATING_SHELL = `rounded-[28px] p-1.5 ${floatingGlassSurface}`;
