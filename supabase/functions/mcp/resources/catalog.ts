/**
 * Taxonomía muscular, sacada del catálogo real.
 *
 * `search_exercises` filtra por `muscle_group` con una comparación por
 * subcadena sin acentos, pero en ningún sitio se le dice al modelo qué valores
 * existen. Sin esta lista, tantea: prueba «piernas», recibe cero resultados,
 * prueba «pierna», prueba «cuádriceps». Tres llamadas y dos respuestas vacías
 * que parecen decir que el usuario no entrena pierna.
 *
 * Se construye leyendo el catálogo en vez de escribirla a mano, porque una
 * lista copiada se queda desfasada en cuanto se importan ejercicios nuevos y el
 * modelo la creería igual. Solo entra el catálogo compartido: los ejercicios
 * propios llevan grupo muscular escrito por el usuario, y este resource se lee
 * sin la nota de `lib/untrusted.ts` que acompaña a las respuestas de las tools.
 */

import type { McpServer } from "@modelcontextprotocol/server";

import { loadCatalog, normalizeFilter } from "../tools/exercises.ts";
import type { Supabase } from "../tools/registry.ts";
import { jsonResource, RESOURCE_SCHEME } from "./respond.ts";

export function registerCatalogResources(server: McpServer, supabase: Supabase): void {
  server.registerResource(
    "taxonomia-muscular",
    `${RESOURCE_SCHEME}://taxonomia-muscular`,
    {
      title: "Taxonomía muscular",
      description:
        "Every muscle_group value that exists in the shared exercise catalog, how many exercises " +
        "each one has and which specific muscles they involve. Read this before filtering " +
        "search_exercises by muscle_group instead of guessing the wording.",
      mimeType: "application/json",
      // El catálogo son ~2.300 filas que casi nunca cambian y son iguales para
      // todos: mismo TTL que la caché de isolate de `loadCatalog`.
      cacheHint: { ttlMs: 30 * 60 * 1000, cacheScope: "public" },
    },
    async (uri: URL) => {
      // Si el catálogo no se puede leer, se deja subir el error: un resource a
      // medias es peor que ninguno, porque el modelo lo leería como la lista
      // completa y descartaría los grupos que faltan.
      const filas = await loadCatalog(supabase);

      const grupos = new Map<string, { exercises: number; muscles: Set<string> }>();
      for (const fila of filas) {
        const grupo = fila.grupo_muscular?.trim();
        if (!grupo) continue;
        let entrada = grupos.get(grupo);
        if (!entrada) {
          entrada = { exercises: 0, muscles: new Set() };
          grupos.set(grupo, entrada);
        }
        entrada.exercises += 1;
        for (const musculo of fila.musculos_involucrados ?? []) {
          if (musculo?.trim()) entrada.muscles.add(musculo.trim());
        }
      }

      return jsonResource(uri, {
        muscle_groups: [...grupos.entries()]
          .sort((a, b) => b[1].exercises - a[1].exercises)
          .map(([value, { exercises, muscles }]) => ({
            value,
            filter_value: normalizeFilter(value),
            exercises,
            involves: [...muscles].sort(),
          })),
        notes: [
          "These are the only values search_exercises.muscle_group matches. It compares as a " +
            "substring, lowercase and accent-insensitive, so 'cuadriceps' matches 'Cuádriceps'.",
          "get_training_summary with group_by:'muscle' buckets by these same values, plus " +
            "'sin_grupo' for sets whose exercise declares none.",
          "involves lists the specific muscles the exercises of that group declare. They are NOT " +
            "valid muscle_group filters: they are the finer split the app's Evolution screen " +
            "uses, which is why its chart can differ slightly from group_by:'muscle'.",
          "Catalog exercises only. The user's own custom exercises can carry any wording and are " +
            "not listed here.",
        ],
      });
    },
  );
}
