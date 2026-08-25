/** Espaciado entre cards en páginas (no drawers): las cards flotan, no se pegan. */
export const PAGE_CARD_STACK_GAP = "gap-2.5 md:gap-3";

/** Cards pegadas en móvil; en escritorio misma separación que PAGE_CARD_STACK_GAP. */
export const PAGE_CARD_STACK_GAP_FLUSH_MOBILE = "gap-0 md:gap-3";

/**
 * Márgenes laterales del stack de cards en móvil.
 *
 * Antes las cards iban a sangre y compartían color con la página, lo que las
 * fundía en un único bloque plano; con margen lateral cada una se lee como una
 * superficie propia. En escritorio el ancho ya lo limita el contenedor.
 */
export const PAGE_STACK_INSET = "max-md:px-3";

/**
 * Card de contenido a ancho de página. Sustituye a la cadena que se repetía en
 * cada widget (`rounded-none border-0 shadow-none…`): ahora hereda el volumen
 * del primitivo `Card` y solo ajusta el radio por breakpoint.
 */
export const PAGE_CARD = "w-full overflow-hidden rounded-2xl md:rounded-3xl";

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

/*
 * Panel de una pestaña de sección a pantalla completa (Tú, Biblioteca).
 *
 * `.section-panel` (index.css) anula el fundido de entrada que `TabsContent`
 * trae por defecto: en un panel de pantalla completa ese fundido arranca en
 * `opacity: 0` y, como el fondo del tema oscuro es negro puro, se percibe como
 * un parpadeo negro al cambiar de pestaña.
 *
 * `data-[state=inactive]:hidden` gana a `flex` por especificidad, de modo que
 * el panel inactivo quede oculto también si algún día se monta con `forceMount`.
 */
export const SECTION_TAB_PANEL =
  "section-panel mt-0 flex flex-1 flex-col data-[state=inactive]:hidden";
