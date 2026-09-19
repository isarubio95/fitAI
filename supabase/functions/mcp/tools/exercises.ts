/**
 * Catálogo de ejercicios y resolución de nombres.
 *
 * Es la puerta de entrada del resto de herramientas: el modelo dirá «press
 * banca», no un uuid. El ranking es el mismo módulo que usa el buscador de la
 * app (`_shared/domain/exerciseSearch.ts`), así que la misma consulta devuelve
 * el mismo ejercicio se pregunte por la app o por el asistente.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { rankExercises } from "../../_shared/domain/exerciseSearch.ts";
import { ok, fail, failFromPostgrest, type ToolResult } from "../lib/respond.ts";
import { clamp } from "../lib/limits.ts";
import { fetchAllRows } from "../lib/paginate.ts";
import { userText } from "../lib/untrusted.ts";
import type { Supabase } from "./registry.ts";

/** Columnas mínimas para rankear y para que el modelo elija con criterio. */
const CATALOG_COLUMNS =
  "id, nombre, nombre_en, grupo_muscular, equipment, equipment_list, musculos_involucrados, registro_series, tipo";
const USER_COLUMNS =
  "id, nombre, grupo_muscular, equipment, equipment_list, musculos_involucrados, registro_series, tipo";

/**
 * El catálogo global son ~2.300 filas idénticas para todos y que casi nunca
 * cambian: se cachea en el isolate. Mismo TTL que `CATALOG_STALE_MS` en la app.
 * Los ejercicios propios NO se cachean nunca: son de un usuario concreto y
 * mezclarlos entre peticiones sería una fuga de datos.
 */
const CATALOG_TTL_MS = 30 * 60 * 1000;

export type CatalogRow = {
  id: string;
  nombre: string;
  nombre_en?: string | null;
  grupo_muscular: string | null;
  equipment: string | null;
  equipment_list: string[] | null;
  musculos_involucrados: string[] | null;
  registro_series: string;
  tipo: string | null;
};

type Candidate = CatalogRow & { source: "catalog" | "user" };

/**
 * Normalizado de los filtros de texto de `search_exercises`: sin acentos y en
 * minúsculas, para comparar por subcadena. Se exporta porque el resource
 * `taxonomia-muscular` publica el valor ya normalizado de cada grupo muscular,
 * y ese valor solo sirve si es exactamente el que aplica el filtro.
 */
export function normalizeFilter(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

let catalogCache: { rows: CatalogRow[]; at: number } | null = null;

/**
 * Se exporta porque el resource `taxonomia-muscular` enumera los grupos y
 * músculos que trae el catálogo real en vez de llevar su propia lista: una
 * taxonomía escrita a mano se queda desfasada en cuanto se importan ejercicios
 * nuevos, y el modelo la creería igual. Comparte la caché de isolate con
 * `search_exercises`, así que leer el resource no cuesta una consulta extra.
 */
export async function loadCatalog(supabase: Supabase): Promise<CatalogRow[]> {
  if (catalogCache && Date.now() - catalogCache.at < CATALOG_TTL_MS) {
    return catalogCache.rows;
  }
  const rows = await fetchAllRows<CatalogRow>((from, to) =>
    supabase.from("tipo_ejercicio").select(CATALOG_COLUMNS).order("id").range(from, to),
  );

  catalogCache = { rows, at: Date.now() };
  return rows;
}

async function loadCandidates(supabase: Supabase): Promise<Candidate[]> {
  const [catalogo, propios] = await Promise.all([
    loadCatalog(supabase),
    fetchAllRows<CatalogRow>((from, to) =>
      supabase.from("usuario_ejercicio").select(USER_COLUMNS).order("id").range(from, to),
    ),
  ]);

  return [
    ...catalogo.map((row) => ({ ...row, source: "catalog" as const })),
    ...propios.map((row) => ({ ...row, source: "user" as const })),
  ];
}

function toOutput(candidate: Candidate, score?: number) {
  return {
    ...(candidate.source === "catalog"
      ? { tipo_ejercicio_id: candidate.id }
      : { usuario_ejercicio_id: candidate.id }),
    name: candidate.nombre,
    name_en: candidate.nombre_en ?? undefined,
    muscle_group: candidate.grupo_muscular,
    equipment: candidate.equipment_list?.length ? candidate.equipment_list : candidate.equipment,
    logging_mode: candidate.registro_series,
    source: candidate.source,
    ...(score != null ? { score: Math.round(score * 100) / 100 } : {}),
  };
}

// ---------------------------------------------------------------------------
// Resolución de un ejercicio a partir de lo que mande el modelo.
// ---------------------------------------------------------------------------

export type ExerciseRef = {
  tipo_ejercicio_id?: string;
  usuario_ejercicio_id?: string;
  name?: string;
};

export type ResolvedExercise = {
  tipo_ejercicio_id: string | null;
  usuario_ejercicio_id: string | null;
  name: string;
  registro_series: string;
  /** Cómo se llegó hasta aquí, para que el modelo pueda enseñarlo al usuario. */
  matched_from: "id" | "name";
  input?: string;
};

/**
 * Umbrales de aceptación cuando el modelo manda `name` en vez de un id. Un match
 * silencioso y flojo es peor que un error: escribiría el ejercicio equivocado en
 * el historial y nadie lo notaría hasta ver la gráfica de progreso.
 */
const MIN_SCORE = 0.45;
const MIN_LEAD_OVER_RUNNER_UP = 1.5;

export async function resolveExerciseRef(
  supabase: Supabase,
  ref: ExerciseRef,
): Promise<{ resolved: ResolvedExercise } | { error: ToolResult }> {
  const dados = [ref.tipo_ejercicio_id, ref.usuario_ejercicio_id, ref.name].filter(Boolean);
  if (dados.length !== 1) {
    return {
      error: fail(
        "INVALID_EXERCISE_REF",
        "Provide exactly one of tipo_ejercicio_id, usuario_ejercicio_id or name.",
        "Call search_exercises first and pass the ID it returns.",
      ),
    };
  }

  const candidatos = await loadCandidates(supabase);

  if (ref.tipo_ejercicio_id || ref.usuario_ejercicio_id) {
    const id = ref.tipo_ejercicio_id ?? ref.usuario_ejercicio_id;
    const esperado = ref.tipo_ejercicio_id ? "catalog" : "user";
    const hit = candidatos.find((c) => c.id === id && c.source === esperado);

    if (!hit) {
      return {
        error: fail(
          "EXERCISE_NOT_FOUND",
          `No exercise with that ID (${id}).`,
          "IDs cannot be guessed. Call search_exercises and use one of its results.",
        ),
      };
    }
    return { resolved: toResolved(hit, "id") };
  }

  const ranked = rankExercises(candidatos, ref.name!);
  const [mejor, segundo] = ranked;

  if (!mejor || mejor.score < MIN_SCORE) {
    return {
      error: fail(
        "EXERCISE_NOT_FOUND",
        `No exercise matches "${ref.name}".`,
        "Call search_exercises with a shorter or more common term to see what exists.",
        { candidates: ranked.slice(0, 5).map((r) => toOutput(r.item, r.score)) },
      ),
    };
  }

  if (segundo && mejor.score < segundo.score * MIN_LEAD_OVER_RUNNER_UP) {
    return {
      error: fail(
        "AMBIGUOUS_EXERCISE",
        `"${ref.name}" matches several exercises and none is a clear winner.`,
        "Pick one from candidates and pass its ID instead of a name.",
        { candidates: ranked.slice(0, 5).map((r) => toOutput(r.item, r.score)) },
      ),
    };
  }

  return { resolved: toResolved(mejor.item, "name", ref.name) };
}

function toResolved(c: Candidate, from: "id" | "name", input?: string): ResolvedExercise {
  return {
    tipo_ejercicio_id: c.source === "catalog" ? c.id : null,
    usuario_ejercicio_id: c.source === "user" ? c.id : null,
    name: c.nombre,
    registro_series: c.registro_series,
    matched_from: from,
    ...(input ? { input } : {}),
  };
}

// ---------------------------------------------------------------------------
// Herramienta
// ---------------------------------------------------------------------------

export function registerExerciseTools(server: McpServer, supabase: Supabase): void {
  server.registerTool(
    "search_exercises",
    {
      description:
        "Search the exercise catalog by name, in Spanish or English, tolerating typos and synonyms " +
        '("press banca", "bench press", "dominadas", "pull up"). Returns the exercise IDs that every ' +
        "other tool needs: results from the shared catalog carry tipo_ejercicio_id, the user's own " +
        "custom exercises carry usuario_ejercicio_id, and exactly one of the two is present. " +
        "ALWAYS call this before logging a workout or building a routine — never invent IDs. " +
        "logging_mode says how the exercise is recorded: peso_reps (weight x reps), solo_reps, " +
        "duracion (time) or duracion_ritmo (time and pace).",
      inputSchema: z.object({
        query: z.string().min(2).max(80).describe("Exercise name or part of it."),
        muscle_group: z
          .string()
          .optional()
          .describe('Filter by muscle group as stored, e.g. "pecho", "espalda", "pierna".'),
        equipment: z
          .string()
          .optional()
          .describe('Filter by equipment, e.g. "barra", "mancuerna", "maquina".'),
        limit: z.number().int().min(1).max(25).default(8),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args: {
      query: string;
      muscle_group?: string;
      equipment?: string;
      limit?: number;
    }): Promise<ToolResult> => {
      const limit = clamp(args.limit ?? 8, 1, 25);

      let candidatos: Candidate[];
      try {
        candidatos = await loadCandidates(supabase);
      } catch (e) {
        return failFromPostgrest(e as { code?: string; message: string });
      }

      if (args.muscle_group) {
        const buscado = normalizeFilter(args.muscle_group);
        candidatos = candidatos.filter((c) => normalizeFilter(c.grupo_muscular).includes(buscado));
      }
      if (args.equipment) {
        const buscado = normalizeFilter(args.equipment);
        candidatos = candidatos.filter(
          (c) =>
            normalizeFilter(c.equipment).includes(buscado) ||
            (c.equipment_list ?? []).some((e) => normalizeFilter(e).includes(buscado)),
        );
      }

      const ranked = rankExercises(candidatos, args.query);

      return ok(
        ranked.slice(0, limit).map((r) => toOutput(r.item, r.score)),
        {
          nextOffset: null,
          // Los ejercicios propios llevan nombre escrito por el usuario.
          untrusted: ranked.slice(0, limit).some((r) => r.item.source === "user"),
          notes: ranked.length > limit
            ? [`${ranked.length} exercises matched; showing the ${limit} most relevant.`]
            : undefined,
        },
      );
    },
  );

  server.registerTool(
    "get_profile_stats",
    {
      description:
        "The user's profile and gamification state: level, total XP, current and longest streak in " +
        "weeks, last training date, physiological settings (max HR, resting HR, FTP in watts) and " +
        "how many achievements are unlocked. Use it to answer 'how am I doing' questions without " +
        "pulling the whole history.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (): Promise<ToolResult> => {
      // `perfil` y `usuario_logro` tienen SELECT abierto a autenticados (el feed
      // muestra perfiles y logros ajenos), así que RLS no acota estas consultas
      // al usuario: sin el filtro explícito el `maybeSingle` recibe todas las
      // filas y falla con PGRST116, y el contador sumaría los logros de todos.
      const { data: usuario } = await supabase.auth.getUser();
      const usuarioId = usuario?.user?.id;
      if (!usuarioId) return fail("UNAUTHENTICATED", "No user session.");

      const [perfil, logros] = await Promise.all([
        supabase
          .from("perfil")
          .select(
            "username, nivel, xp_total, racha_actual, racha_maxima, ultima_actividad_fecha, fc_max, fc_reposo, ftp_w, fecha_nacimiento",
          )
          .eq("id", usuarioId)
          .maybeSingle(),
        supabase
          .from("usuario_logro")
          .select("id", { count: "exact", head: true })
          .eq("usuario_id", usuarioId),
      ]);

      if (perfil.error) return failFromPostgrest(perfil.error);
      if (!perfil.data) {
        return fail("NOT_FOUND", "No profile row for the authenticated user.");
      }

      const p = perfil.data;
      return ok(
        {
          username: userText(p.username),
          level: p.nivel,
          xp_total: p.xp_total,
          streak_weeks_current: p.racha_actual,
          streak_weeks_best: p.racha_maxima,
          last_training_date: p.ultima_actividad_fecha,
          achievements_unlocked: logros.count ?? 0,
          physiology: {
            max_hr: p.fc_max,
            resting_hr: p.fc_reposo,
            ftp_w: p.ftp_w,
            birth_date: p.fecha_nacimiento,
          },
        },
        { untrusted: true },
      );
    },
  );
}
