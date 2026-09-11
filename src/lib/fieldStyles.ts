/**
 * Halo de foco de campos. Sigue `--ring` / `data-accent`.
 * Patrón shadcn v4 (Input / Textarea): border-ring + ring-[3px] ring-ring/50.
 * Tailwind v4: `ring-ring` usa `--color-ring`; el modificador `/50` aplica opacidad.
 */
export const FIELD_FOCUS_RING =
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Anillo de error con el token destructive, no un rojo de paleta default. */
export const FIELD_INVALID_RING =
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40";
