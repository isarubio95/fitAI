import type { Modifier } from "@dnd-kit/core";

/** Las listas ordenables de la app son columnas: ignoramos el eje horizontal. */
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });
