import { cn } from "@/lib/utils";

/** Pills redondeadas de navegación / sección (Evolution, Library, header móvil). */
export const filterPillBase =
  "touch-pill rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus:outline-none focus-visible:outline-none";

export const filterPillInactive =
  "border-border/20 bg-muted/40 text-foreground [@media(hover:hover)]:hover:border-border/35 [@media(hover:hover)]:hover:bg-muted/55";

/** Fondo activo un poco más oscuro que `--primary` para mejorar contraste con texto claro. */
export const filterPillActive =
  "border-primary/45 bg-[color-mix(in_srgb,hsl(var(--primary))_86%,black)] text-primary-foreground shadow-sm";

export const filterPillTabsTrigger = cn(
  filterPillBase,
  "border-border/20 bg-muted/40 text-foreground",
  "data-[state=inactive]:[@media(hover:hover)]:hover:border-border/35 data-[state=inactive]:[@media(hover:hover)]:hover:bg-muted/55",
  "data-[state=active]:border-primary/45 data-[state=active]:bg-[color-mix(in_srgb,hsl(var(--primary))_86%,black)] data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
  "data-[state=active]:[@media(hover:hover)]:hover:border-primary/45 data-[state=active]:[@media(hover:hover)]:hover:bg-[color-mix(in_srgb,hsl(var(--primary))_86%,black)]",
);

/** Botones de filtro (outline / toggle). */
export const filterButtonInactive = "border-border/20 hover:border-border/35";

export const filterButtonActive =
  "border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/45";

export const filterChipActive =
  "touch-pill border border-primary/35 bg-secondary text-secondary-foreground outline-none focus:outline-none focus-visible:outline-none";

export const filterChipInactive =
  "touch-pill border border-transparent text-muted-foreground outline-none focus:outline-none focus-visible:outline-none [@media(hover:hover)]:hover:bg-secondary/50";
