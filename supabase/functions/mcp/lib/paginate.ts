/**
 * Paginación de PostgREST. El equivalente de `src/lib/supabaseBatch.ts` en la
 * app, y existe por el mismo motivo: dos topes del servidor que no dan error,
 * solo devuelven menos filas de las que hay.
 *
 * - `max-rows` (1000 por defecto en Supabase) corta cualquier select sin rango.
 *   El catálogo de ejercicios pasa de 2.000 filas y `serie` es la tabla más
 *   grande del proyecto, así que ambos caen dentro.
 * - La longitud de la URL limita cuántos ids caben en un `.in(...)`: 400 uuids
 *   son ~15 KB de query string, por encima de lo que acepta el proxy.
 *
 * Los dos fallan en silencio. Un total que sale bajo no se distingue de un mes
 * flojo, y un id ausente del catálogo se rechaza como si no existiera.
 */

/** Filas por página. Debe coincidir con `max-rows` del servidor. */
export const PAGE_SIZE = 1000;

/** Ids por `.in(...)`. Mismo valor que `SUPABASE_IN_CHUNK_SIZE` en la app. */
export const IN_CHUNK_SIZE = 200;

/**
 * Encadena rangos hasta agotar la consulta.
 *
 * `page` debe llevar un `.order(...)` por una columna única: sin orden estable
 * PostgREST puede repetir u omitir filas entre páginas.
 */
export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const chunk = (data ?? []) as T[];
    rows.push(...chunk);
    if (chunk.length < PAGE_SIZE) return rows;
  }
}

/** Parte una lista de ids en trozos que quepan en una query string. */
export function chunkIds(ids: string[], size = IN_CHUNK_SIZE): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size));
  }
  return chunks;
}

/** `fetchAllRows` sobre cada trozo de `ids`, concatenado. */
export async function fetchAllByIds<T>(
  ids: string[],
  page: (chunk: string[], from: number, to: number) => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (const chunk of chunkIds(ids)) {
    rows.push(...(await fetchAllRows<T>((from, to) => page(chunk, from, to))));
  }
  return rows;
}
