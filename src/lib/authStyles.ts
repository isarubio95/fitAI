import { cn } from "@/lib/utils";

/**
 * Vocabulario visual del onboarding (`/auth`).
 *
 * La pantalla se pinta SIEMPRE en oscuro (ver `AuthShell`), así que estas clases
 * asumen tokens oscuros y derivan el color del acento activo (`--primary`), sin
 * hardcodear ningún tono: los 5 acentos funcionan con el mismo código.
 */

/**
 * Campo relleno, sin borde, con hueco a la izquierda para el icono.
 * Neutraliza el halo esmeralda fijo de `Input` y lo sustituye por un anillo
 * de acento, para que el foco siga el `data-accent` del usuario.
 */
export const AUTH_FIELD_CLASS = cn(
  "h-14 rounded-2xl border-0 bg-secondary/60 pl-12 text-base text-foreground placeholder:text-muted-foreground/70",
  "focus-visible:border-0 focus-visible:bg-secondary/80 focus-visible:shadow-none",
  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/45",
);

/** Icono decorativo del campo (lucide), pegado al borde izquierdo. */
export const AUTH_FIELD_ICON_CLASS =
  "pointer-events-none absolute left-4 top-1/2 h-[1.15rem] w-[1.15rem] -translate-y-1/2 text-primary";

/** Botón de mostrar/ocultar contraseña, pegado al borde derecho. */
export const AUTH_FIELD_TOGGLE_CLASS =
  "absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground";

/**
 * CTA principal: acento aclarado sobre texto casi negro.
 * Mismo patrón `color-mix` que `accentSurfaceBg` en `filter-pill-styles.ts`,
 * pero mezclando con blanco para subir la luminosidad y ganar contraste.
 */
export const AUTH_CTA_CLASS = cn(
  "h-14 w-full rounded-2xl px-5 text-base font-semibold ring-0",
  "bg-[color-mix(in_srgb,hsl(var(--primary))_70%,white)] text-[hsl(60_3%_6%)]",
  "[@media(hover:hover)]:hover:bg-[color-mix(in_srgb,hsl(var(--primary))_82%,white)]",
);

/**
 * Botón secundario con el mismo relleno que los campos (social login).
 * El `hover:` va sin `@media` explícita para que tailwind-merge lo dedupe
 * contra el `hover:bg-accent/55` de la variante `ghost` de `Button`.
 */
export const AUTH_SOFT_BUTTON_CLASS =
  "h-14 w-full gap-3 rounded-2xl bg-secondary/60 text-base font-medium text-foreground ring-0 hover:bg-secondary/80 hover:text-foreground";

/** Enlaces y toggles de pie: la palabra de acción va en acento subrayado. */
export const AUTH_LINK_CLASS =
  "font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/85";
