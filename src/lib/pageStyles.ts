/** Espaciado entre cards en páginas (no drawers): móvil 3px, escritorio 11px. */
export const PAGE_CARD_STACK_GAP = "gap-[3px] md:gap-[11px]";

/** Cards pegadas en móvil; en escritorio misma separación que PAGE_CARD_STACK_GAP. */
export const PAGE_CARD_STACK_GAP_FLUSH_MOBILE = "gap-0 md:gap-[11px]";

/** Cabecera de cards en Progreso (sin pt-8 extra). */
export const PROGRESS_CARD_HEADER = "px-6 pb-4";
export const PROGRESS_CARD_HEADER_SKELETON = "px-6 pb-2";

/** Fila de pills de sección encima del contenido (solo escritorio). */
export const SECTION_PILLS_ROW =
  "hidden md:flex md:max-w-2xl md:mx-auto md:w-full md:items-center md:justify-between md:gap-3 md:px-8";

/** Pestañas de sección a ancho completo con subrayado (Biblioteca). */
export const SECTION_UNDERLINE_TABS_ROW =
  "hidden md:flex md:max-w-2xl md:mx-auto md:w-full md:flex-col md:px-8";

export const SECTION_UNDERLINE_TABS_LIST =
  "flex h-auto w-full min-w-0 items-stretch justify-stretch gap-0 rounded-none bg-transparent p-0 shadow-none border-b border-border";

export const SECTION_UNDERLINE_TABS_TRIGGER =
  "section-tab-trigger touch-pill inline-flex h-auto min-h-0 flex-1 items-center justify-center rounded-none border-0 border-b-2 border-transparent bg-transparent px-1 pb-2.5 pt-1 text-sm font-medium text-muted-foreground shadow-none outline-none -mb-px transition-[color] active:!bg-transparent focus:!bg-transparent focus-visible:!bg-transparent data-[state=active]:!bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=inactive]:text-muted-foreground";

/** Botón de pestaña subrayada fuera de TabsTrigger (cabecera móvil). */
export function sectionUnderlineTabClass(active: boolean) {
  return [
    "section-tab-trigger touch-pill inline-flex h-auto min-h-0 flex-1 items-center justify-center rounded-none border-0 border-b-2 border-transparent bg-transparent px-1 pb-2.5 pt-1 text-sm font-medium shadow-none outline-none -mb-px transition-[color] active:bg-transparent focus:bg-transparent focus-visible:bg-transparent",
    active ? "text-foreground" : "text-muted-foreground",
  ].join(" ");
}

/** Slot flotante del botón Crear: tablet (768–1199px) abajo a la derecha y opaco; escritorio (≥1200px) arriba a la derecha. */
export const FLOATING_CREATE_SLOT =
  "pointer-events-none fixed z-40 hidden items-center gap-2 md:flex min-[1200px]:right-8 min-[1200px]:top-8 md:max-[1199px]:right-8 md:max-[1199px]:bottom-[calc(2rem+env(safe-area-inset-bottom,0px))] [&>*]:pointer-events-auto md:max-[1199px]:[&>*]:border-primary md:max-[1199px]:[&>*]:bg-primary md:max-[1199px]:[&>*]:text-primary-foreground md:max-[1199px]:[&>*]:shadow-lg md:max-[1199px]:[&>*]:hover:border-primary md:max-[1199px]:[&>*]:hover:bg-primary/92 md:max-[1199px]:[&>*]:hover:text-primary-foreground dark:md:max-[1199px]:[&>*]:border-primary dark:md:max-[1199px]:[&>*]:bg-primary-solid dark:md:max-[1199px]:[&>*]:text-primary-foreground dark:md:max-[1199px]:[&>*]:hover:border-primary dark:md:max-[1199px]:[&>*]:hover:bg-primary-solid/90 dark:md:max-[1199px]:[&>*]:hover:text-primary-foreground";

export const SECTION_PILLS_LIST =
  "h-auto min-w-0 flex-1 justify-start gap-2 bg-transparent p-0 shadow-none";
