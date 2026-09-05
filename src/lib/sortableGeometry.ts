/**
 * Geometría del reordenado por arrastre.
 *
 * Se apoya en los rects reales medidos al levantar la fila, no en la suposición
 * de que todas midan lo mismo: las fichas de ejercicio van de 120 px a más de
 * 600 px según las series. Todas las medidas están en el espacio de contenido
 * del contenedor de scroll, así que el autoscroll no las invalida.
 *
 * Se congelan al empezar el gesto y no se vuelven a medir. Eso es lo que evita
 * el temblor clásico de estas listas: si el destino se calculara sobre las
 * posiciones ya desplazadas, mover una fila alta sobre una baja realimentaría
 * el cálculo y las dos se intercambiarían sin parar.
 */
export type SortableMetrics = {
  /** Top de cada fila, en orden de lista. */
  tops: number[];
  heights: number[];
  /** Separación de flujo entre filas contiguas. */
  gap: number;
};

/**
 * Separación real entre filas: la mínima entre contiguas. Las distancias
 * mayores incluyen bloques que no se mueven (la cabecera de una superserie),
 * y esos no se colapsan al sacar una fila del flujo.
 */
export function measureGap(tops: number[], heights: number[]): number {
  let gap = Number.POSITIVE_INFINITY;
  for (let i = 0; i < tops.length - 1; i++) {
    gap = Math.min(gap, tops[i + 1] - (tops[i] + heights[i]));
  }
  return Number.isFinite(gap) && gap > 0 ? gap : 0;
}

/**
 * Desplazamiento vertical de la fila `index` cuando `from` se mueve a `to`.
 *
 * El hueco original no se cierra: se queda ocupando su sitio y son las demás
 * filas las que se desplazan, de modo que la altura total no cambia y no hay
 * reflow. Sacar una fila del flujo libera su altura más una separación (el
 * `gap` de un lado se funde con el del otro).
 */
export function offsetForIndex(
  metrics: SortableMetrics,
  from: number,
  to: number,
  index: number,
): number {
  if (index === from) return 0;
  const shift = metrics.heights[from] + metrics.gap;
  if (to > from && index > from && index <= to) return -shift;
  if (to < from && index >= to && index < from) return shift;
  return 0;
}

/**
 * Top final de la fila arrastrada. Bajando queda alineada por su base con la
 * última fila que ha rebasado; subiendo, por su borde superior.
 */
export function restingTop(metrics: SortableMetrics, from: number, to: number): number {
  if (to === from) return metrics.tops[from];
  if (to > from) return metrics.tops[to] + metrics.heights[to] - metrics.heights[from];
  return metrics.tops[to];
}

/**
 * Posición de destino a partir de dónde está la fila levantada.
 *
 * La regla es "el borde de ataque cruza el centro de la fila vecina": bajando
 * manda el borde inferior y subiendo el superior. Comparar centro contra centro
 * fallaría con alturas dispares — una ficha alta ya empezaría rebasada en
 * reposo — mientras que esta es monótona respecto al desplazamiento y en reposo
 * devuelve siempre `from`.
 */
export function resolveDropIndex(
  metrics: SortableMetrics,
  from: number,
  projectedTop: number,
): number {
  const { tops, heights } = metrics;
  let target = from;

  if (projectedTop > tops[from]) {
    const projectedBottom = projectedTop + heights[from];
    for (let j = from + 1; j < tops.length; j++) {
      if (projectedBottom > tops[j] + heights[j] / 2) target = j;
      else break;
    }
  } else if (projectedTop < tops[from]) {
    for (let j = from - 1; j >= 0; j--) {
      if (projectedTop < tops[j] + heights[j] / 2) target = j;
      else break;
    }
  }

  return target;
}
