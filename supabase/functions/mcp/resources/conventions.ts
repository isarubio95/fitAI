/**
 * Las dos convenciones del dominio que el modelo no puede deducir mirando una
 * respuesta: qué serie cuenta como trabajo y cómo se registra cada ejercicio.
 *
 * Las dos listas se derivan de donde ya viven —`_shared/domain/setTypes.ts` y
 * `tools/shared.ts`— en vez de repetirse aquí. Un resource que le enseña al
 * modelo cuatro valores y un `z.enum` que valida otros tres es un rechazo que
 * nadie entiende: el modelo mandaría exactamente lo que se le dijo que existía.
 */

import type { McpServer } from "@modelcontextprotocol/server";

import {
  DEFAULT_TIPO_SERIE,
  isWorkingSet,
  TIPOS_SERIE,
  tipoSerieLabel,
} from "../../_shared/domain/setTypes.ts";
import { LOGGING_MODES } from "../tools/shared.ts";
import { jsonResource, RESOURCE_SCHEME } from "./respond.ts";

/**
 * Qué campos de una serie tienen sentido en cada modo. El modelo manda siempre
 * el objeto entero, y sin esto rellena `weight_kg: 0` en una plancha o se deja
 * `duration_seconds` en una carrera, que es un payload aceptado por la BD y un
 * dato inservible en la app.
 */
const MODE_FIELDS: Record<(typeof LOGGING_MODES)[number], { use: string[]; what: string }> = {
  peso_reps: {
    use: ["weight_kg", "reps"],
    what:
      "Weight for repetitions. The default, and what estimated 1RM and tonnage are computed from.",
  },
  solo_reps: {
    use: ["reps"],
    what:
      "Bodyweight repetitions (pull-ups, push-ups). Send weight_kg only if extra load was added.",
  },
  duracion: {
    use: ["duration_seconds"],
    what: "Time under tension (planks, holds). reps and weight_kg are meaningless here.",
  },
  duracion_ritmo: {
    use: ["duration_seconds", "pace_seconds_per_km"],
    what: "Time plus pace, for exercises logged like a run (treadmill, rower).",
  },
};

export function registerConventionResources(server: McpServer): void {
  // -------------------------------------------------------------------------
  server.registerResource(
    "tipos-de-serie",
    `${RESOURCE_SCHEME}://tipos-de-serie`,
    {
      title: "Tipos de serie",
      description:
        "The set_type values and which of them count as work. Read this before computing " +
        "volume yourself from raw sets, so the number matches what the app shows.",
      mimeType: "application/json",
      cacheHint: { ttlMs: 24 * 60 * 60 * 1000, cacheScope: "public" },
    },
    (uri: URL) =>
      jsonResource(uri, {
        // `app_label` es el rótulo en español que enseña la app: el resto del
        // contenido va en inglés, pero esto es lo que el usuario ve en
        // pantalla y el modelo tiene que poder nombrarlo igual.
        set_types: TIPOS_SERIE.map((tipo) => ({
          value: tipo,
          app_label: tipoSerieLabel(tipo),
          counts_as_work: isWorkingSet(tipo),
        })),
        default: DEFAULT_TIPO_SERIE,
        notes: [
          "counts_as_work governs volume per muscle group, tonnage, local fatigue, training load " +
            "and XP. Only warm-up sets are excluded; dropset and amrap are real work.",
          "A warm-up set still takes time, so it does count towards a session's duration.",
          "Tools that aggregate (get_training_summary, get_personal_records, " +
            "get_exercise_progress) already apply this filter. Do not subtract warm-ups again.",
          "Sets logged before this field existed default to '" + DEFAULT_TIPO_SERIE + "'.",
        ],
      }),
  );

  // -------------------------------------------------------------------------
  server.registerResource(
    "modos-de-registro",
    `${RESOURCE_SCHEME}://modos-de-registro`,
    {
      title: "Modos de registro",
      description:
        "The logging_mode values an exercise can have and which set fields each one expects. " +
        "Read this before calling log_workout for anything that is not weight x reps.",
      mimeType: "application/json",
      cacheHint: { ttlMs: 24 * 60 * 60 * 1000, cacheScope: "public" },
    },
    (uri: URL) =>
      jsonResource(uri, {
        logging_modes: LOGGING_MODES.map((modo) => ({
          value: modo,
          meaningful_fields: MODE_FIELDS[modo].use,
          what: MODE_FIELDS[modo].what,
        })),
        notes: [
          "Every exercise declares its own mode: search_exercises returns it as logging_mode. " +
            "Omit logging_mode when writing and the exercise's own value is used, which is " +
            "almost always the right thing.",
          "Override it only when the user really trained the exercise another way, e.g. a plank " +
            "held with a weight plate.",
          "Units are in the key names: weight_kg in kilograms, duration_seconds and " +
            "pace_seconds_per_km in seconds. Never send a formatted string like '5:30 /km'.",
        ],
      }),
  );
}
