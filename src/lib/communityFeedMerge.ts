/** Ítem genérico con fecha para merge del feed comunidad / historial de perfil. */

export type DatedFeedEntry<T> = {
  fecha: string;
  id: string;
  payload: T;
};

/**
 * Mezcla dos listas ordenadas por fecha desc y devuelve hasta `pageSize` ítems.
 * Empate: id desc para orden estable.
 */
export function mergeDatedFeedEntries<A, B>(
  a: DatedFeedEntry<A>[],
  b: DatedFeedEntry<B>[],
  pageSize: number,
): {
  items: Array<{ source: "a"; entry: DatedFeedEntry<A> } | { source: "b"; entry: DatedFeedEntry<B> }>;
  hasMoreFromMerge: boolean;
} {
  const left = [...a].sort(compareDatedDesc);
  const right = [...b].sort(compareDatedDesc);
  const items: Array<
    { source: "a"; entry: DatedFeedEntry<A> } | { source: "b"; entry: DatedFeedEntry<B> }
  > = [];
  let i = 0;
  let j = 0;

  while (items.length < pageSize && (i < left.length || j < right.length)) {
    const nextA = left[i];
    const nextB = right[j];
    if (!nextA) {
      items.push({ source: "b", entry: nextB });
      j += 1;
      continue;
    }
    if (!nextB) {
      items.push({ source: "a", entry: nextA });
      i += 1;
      continue;
    }
    if (compareDatedDesc(nextA, nextB) <= 0) {
      items.push({ source: "a", entry: nextA });
      i += 1;
    } else {
      items.push({ source: "b", entry: nextB });
      j += 1;
    }
  }

  const hasMoreFromMerge = i < left.length || j < right.length;
  return { items, hasMoreFromMerge };
}

function compareDatedDesc(x: { fecha: string; id: string }, y: { fecha: string; id: string }): number {
  const tx = new Date(x.fecha).getTime();
  const ty = new Date(y.fecha).getTime();
  if (ty !== tx) return ty - tx;
  return y.id.localeCompare(x.id);
}

/** Fecha del ítem más antiguo (último de la página) → cursor para la siguiente. */
export function nextFeedCursorFromItems(items: { fecha: string }[]): string | null {
  if (items.length === 0) return null;
  return items[items.length - 1].fecha;
}
