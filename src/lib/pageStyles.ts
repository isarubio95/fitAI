/** Espaciado entre cards en páginas (no drawers): móvil gap-1, escritorio 3× (gap-3). */
export const PAGE_CARD_STACK_GAP = "gap-1 md:gap-3";

/** Cards pegadas en móvil; en escritorio misma separación 3× que PAGE_CARD_STACK_GAP. */
export const PAGE_CARD_STACK_GAP_FLUSH_MOBILE = "gap-0 md:gap-3";

/** Fila de pills de sección encima del contenido (solo escritorio). */
export const SECTION_PILLS_ROW =
  "hidden md:flex md:max-w-2xl md:mx-auto md:w-full md:items-center md:justify-between md:gap-3 md:px-8";

/** Slot flotante del botón Crear: tablet (768–1199px) abajo a la derecha y opaco; escritorio (≥1200px) arriba a la derecha. */
export const FLOATING_CREATE_SLOT =
  "pointer-events-none fixed z-40 hidden items-center gap-2 md:flex min-[1200px]:right-8 min-[1200px]:top-8 md:max-[1199px]:right-8 md:max-[1199px]:bottom-[calc(2rem+env(safe-area-inset-bottom,0px))] [&>*]:pointer-events-auto md:max-[1199px]:[&>*]:border-primary md:max-[1199px]:[&>*]:bg-primary md:max-[1199px]:[&>*]:text-primary-foreground md:max-[1199px]:[&>*]:shadow-lg md:max-[1199px]:[&>*]:hover:border-primary md:max-[1199px]:[&>*]:hover:bg-primary/92 md:max-[1199px]:[&>*]:hover:text-primary-foreground dark:md:max-[1199px]:[&>*]:border-primary dark:md:max-[1199px]:[&>*]:bg-primary dark:md:max-[1199px]:[&>*]:text-primary-foreground dark:md:max-[1199px]:[&>*]:hover:border-primary dark:md:max-[1199px]:[&>*]:hover:bg-primary/90 dark:md:max-[1199px]:[&>*]:hover:text-primary-foreground";

export const SECTION_PILLS_LIST =
  "h-auto min-w-0 flex-1 justify-start gap-2 bg-transparent p-0 shadow-none";
