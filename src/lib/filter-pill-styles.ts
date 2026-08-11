import { cn } from "@/lib/utils";

/**
 * Superficie de acento compartida: pills de sección activas y CTAs (Seguir, Ir al Dashboard, etc.).
 * Un solo sitio para el color-mix sobre `--primary`.
 */
export const accentSurfaceBg =
  "bg-[color-mix(in_srgb,hsl(var(--primary))_86%,black)]";

export const accentSurfaceBgHover =
  "[@media(hover:hover)]:hover:bg-[color-mix(in_srgb,hsl(var(--primary))_78%,black)]";

export const accentSurfaceFg = "text-primary-foreground";

export const accentSurfaceBorder = "border-primary/45";

export const accentSurfaceRing = "ring-primary/70";

/** Clases de relleno + texto para botones y superficies sólidas de acento. */
export const accentSurfaceFill = cn(accentSurfaceBg, accentSurfaceFg);

/** Pills redondeadas de navegación / sección (Evolution, Library, header móvil). */
export const filterPillBase =
  "touch-pill rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus:outline-none focus-visible:outline-none";

export const filterPillInactive =
  "border-border/20 bg-muted/40 text-foreground [@media(hover:hover)]:hover:border-border/35 [@media(hover:hover)]:hover:bg-muted/55";

/**
 * Pill activa del sistema de diseño: fondo muy oscuro teñido de acento y
 * texto en una versión clara del mismo acento (en vez de blanco puro).
 */
export const pillActiveBg = "bg-[color-mix(in_srgb,hsl(var(--primary))_22%,black)]";

export const pillActiveFg = "text-[color-mix(in_srgb,hsl(var(--primary))_55%,white)]";

export const pillActiveBorder = "border-[color-mix(in_srgb,hsl(var(--primary))_22%,black)]";

export const filterPillActive = cn(
  pillActiveBorder,
  pillActiveBg,
  pillActiveFg,
  "shadow-sm",
);

export const filterPillTabsTrigger = cn(
  filterPillBase,
  "border-border/20 bg-muted/40 text-foreground",
  "data-[state=inactive]:[@media(hover:hover)]:hover:border-border/35 data-[state=inactive]:[@media(hover:hover)]:hover:bg-muted/55",
  // Literales completos (Tailwind JIT): mismos valores que pillActive*.
  "data-[state=active]:border-[color-mix(in_srgb,hsl(var(--primary))_22%,black)] data-[state=active]:bg-[color-mix(in_srgb,hsl(var(--primary))_22%,black)] data-[state=active]:text-[color-mix(in_srgb,hsl(var(--primary))_55%,white)] data-[state=active]:shadow-sm",
  "data-[state=active]:[@media(hover:hover)]:hover:border-[color-mix(in_srgb,hsl(var(--primary))_22%,black)] data-[state=active]:[@media(hover:hover)]:hover:bg-[color-mix(in_srgb,hsl(var(--primary))_28%,black)]",
);

/** Botones de filtro (outline / toggle). */
export const filterButtonInactive = "border-border/20 hover:border-border/35";

export const filterButtonActive =
  "border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/45";

export const filterChipActive =
  "touch-pill border border-primary/35 bg-secondary text-secondary-foreground outline-none focus:outline-none focus-visible:outline-none";

export const filterChipInactive =
  "touch-pill border border-transparent text-muted-foreground outline-none focus:outline-none focus-visible:outline-none [@media(hover:hover)]:hover:bg-secondary/50";
