/** Normaliza relaciones Supabase one-or-many a un único valor. */
export function firstNested<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}
