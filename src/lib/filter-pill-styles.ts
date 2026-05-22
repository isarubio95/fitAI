import { cn } from "@/lib/utils";

/** Pills redondeadas de navegación / sección (Evolution, Library, header móvil). */
export const filterPillBase =
  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors";

export const filterPillInactive =
  "border-border/20 bg-muted/40 text-foreground hover:border-border/35 hover:bg-muted/55";

export const filterPillActive =
  "border-primary/45 bg-primary text-primary-foreground shadow-sm";

export const filterPillTabsTrigger = cn(
  filterPillBase,
  filterPillInactive,
  "data-[state=active]:border-primary/45 data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-sm",
);

/** Botones de filtro (outline / toggle). */
export const filterButtonInactive = "border-border/20 hover:border-border/35";

export const filterButtonActive =
  "border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/45";

export const filterChipActive =
  "border border-primary/35 bg-secondary text-secondary-foreground";

export const filterChipInactive =
  "border border-transparent text-muted-foreground hover:bg-secondary/50";
