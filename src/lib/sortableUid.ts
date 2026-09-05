/**
 * Identidad estable para las filas ordenables de los formularios.
 *
 * Reordenar necesita un id que viaje con la fila. El índice no vale: al mover
 * un ejercicio los índices se quedan quietos y apuntan a datos distintos, así
 * que la animación de soltar aterriza en la fila equivocada y React reutiliza
 * el estado interno de la fila anterior. Los ejercicios recién añadidos todavía
 * no tienen id de base de datos, de ahí este `uid` de cliente.
 *
 * Se conserva solo mientras vive el formulario: nunca se guarda.
 */

let sequence = 0;

export function nextSortUid(): string {
  sequence += 1;
  return `uid-${sequence}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Garantiza que cada elemento tenga un `uid` propio y único. Devuelve la misma
 * referencia de array si no hubo nada que arreglar, para poder llamarla desde
 * un efecto sin provocar un bucle de renders.
 *
 * También repara duplicados: clonar una fila con `{ ...fila }` copiaría su uid.
 */
export function ensureSortUids<T extends { uid?: string }>(list: T[]): T[] {
  const seen = new Set<string>();
  let changed = false;

  const next = list.map((item) => {
    if (item.uid && !seen.has(item.uid)) {
      seen.add(item.uid);
      return item;
    }
    const uid = nextSortUid();
    seen.add(uid);
    changed = true;
    return { ...item, uid };
  });

  return changed ? next : list;
}

/** Mueve un elemento de `from` a `to` devolviendo un array nuevo. */
export function arrayMove<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
