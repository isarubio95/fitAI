/** Disciplinas donde mostramos mapa + GPS al aire libre (configurable). */
const MAP_DISCIPLINE_CODES = new Set(["running", "cycling", "walking", "rowing"]);

export function cardioDisciplineUsesGpsMap(codigo: string | null | undefined): boolean {
  if (!codigo) return false;
  return MAP_DISCIPLINE_CODES.has(codigo);
}
