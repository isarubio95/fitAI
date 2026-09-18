/**
 * Rutinas (plantillas de entrenamiento) y calendario semanal.
 *
 * Dos conceptos que conviene no confundir y que las descripciones dejan claros
 * al modelo: una `rutina` es la plantilla (qué ejercicios y con qué objetivos) y
 * una `rutina_programada` es un hueco en el calendario (esa plantilla, ese día).
 * El hueco queda cumplido cuando se enlaza con la sesión que se entrenó.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { ok, fail, failFromPostgrest, type ToolResult } from "../lib/respond.ts";
import { clamp, rangeDays, MAX_RANGE_DAYS } from "../lib/limits.ts";
import { userText } from "../lib/untrusted.ts";
import { resolveAll, routineExerciseInputSchema, type RoutineExerciseInput } from "./shared.ts";
import type { ResolvedExercise } from "./exercises.ts";
import type { Supabase } from "./registry.ts";

/** Traduce los ejercicios de rutina al payload jsonb de `upsert_routine`. */
function toRpcRoutineExercises(
  entradas: RoutineExerciseInput[],
  resueltos: ResolvedExercise[],
) {
  return entradas.map((e, i) => ({
    tipo_ejercicio_id: resueltos[i].tipo_ejercicio_id,
    usuario_ejercicio_id: resueltos[i].usuario_ejercicio_id,
    registro_series: e.logging_mode ?? resueltos[i].registro_series,
    series_objetivo: e.target_sets,
    repes_min: e.reps_min,
    repes_max: e.reps_max,
    rir: e.rir ?? null,
    descanso: e.rest_seconds ?? null,
    superset_id: e.superset_id ?? null,
    duracion_objetivo_seg: e.target_duration_seconds ?? null,
    ritmo_objetivo_seg_km: e.target_pace_seconds_per_km ?? null,
    set_plan: e.set_plan?.map((s) => ({
      tipo_serie: s.set_type,
      repes_min: s.reps_min ?? null,
      repes_max: s.reps_max ?? null,
      rir: s.rir ?? null,
      peso_objetivo_kg: s.target_weight_kg ?? null,
      descanso: s.rest_seconds ?? null,
      duracion_objetivo_seg: s.target_duration_seconds ?? null,
      ritmo_objetivo_seg_km: s.target_pace_seconds_per_km ?? null,
    })),
  }));
}

type EjercicioRutinaRow = {
  id: string;
  orden: number;
  series_objetivo: number | null;
  repes_min: number | null;
  repes_max: number | null;
  rir: number | null;
  descanso: number | null;
  registro_series: string;
  superset_id: string | null;
  duracion_objetivo_seg: number | null;
  ritmo_objetivo_seg_km: number | null;
  tipo_ejercicio: { id: string; nombre: string; grupo_muscular: string | null } | null;
  usuario_ejercicio: { id: string; nombre: string; grupo_muscular: string | null } | null;
};

const ROUTINE_EXERCISE_COLUMNS =
  "id, orden, series_objetivo, repes_min, repes_max, rir, descanso, registro_series, superset_id, duracion_objetivo_seg, ritmo_objetivo_seg_km, tipo_ejercicio(id, nombre, grupo_muscular), usuario_ejercicio(id, nombre, grupo_muscular)";

export function registerRoutineTools(server: McpServer, supabase: Supabase): void {
  // -------------------------------------------------------------------------
  server.registerTool(
    "list_routines",
    {
      description:
        "List routines: the user's own (scope:'mine', the default), the app's built-in templates " +
        "(scope:'templates') or both. Returns name, description, exercise count and level. " +
        "Templates are read-only: they can be inspected and scheduled but not edited.",
      inputSchema: z.object({
        scope: z.enum(["mine", "templates", "all"]).default("mine"),
        query: z.string().max(80).optional().describe("Filter by name, case-insensitive."),
        limit: z.number().int().min(1).max(50).default(20),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args: {
      scope?: "mine" | "templates" | "all";
      query?: string;
      limit?: number;
    }): Promise<ToolResult> => {
      const scope = args.scope ?? "mine";
      const limit = clamp(args.limit ?? 20, 1, 50);

      let q = supabase
        .from("rutina")
        .select(
          "id, nombre, descripcion, icono, orden, es_plantilla, nivel, duracion_minutos, grupo_muscular, rutina_ejercicio(count)",
        )
        .order("orden", { ascending: true, nullsFirst: false })
        .limit(limit);

      // Las plantillas tienen usuario_id nulo; las propias, el del usuario. RLS
      // ya deja ver ambas, así que el filtro aquí es de intención, no de permiso.
      if (scope === "mine") q = q.eq("es_plantilla", false);
      if (scope === "templates") q = q.eq("es_plantilla", true);
      if (args.query) q = q.ilike("nombre", `%${args.query}%`);

      const { data, error } = await q;
      if (error) return failFromPostgrest(error);

      return ok(
        (data ?? []).map((r) => ({
          routine_id: r.id,
          name: userText(r.nombre),
          description: userText(r.descripcion),
          is_template: r.es_plantilla === true,
          level: r.nivel,
          estimated_minutes: r.duracion_minutos,
          muscle_group: r.grupo_muscular,
          exercises: (r.rutina_ejercicio as unknown as Array<{ count: number }>)?.[0]?.count ?? 0,
        })),
        { untrusted: true },
      );
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "get_routine",
    {
      description:
        "Full detail of a routine: exercises in order with their targets (sets, rep range, RIR, rest " +
        "in seconds) and, when the routine defines one, the per-set plan — used for pyramids, " +
        "warm-up sets or ascending RIR. Exercises sharing a superset_id are performed as a superset. " +
        "When a per-set plan exists it is the source of truth; the exercise-level numbers are a " +
        "summary derived from it.",
      inputSchema: z.object({ routine_id: z.string().uuid() }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args: { routine_id: string }): Promise<ToolResult> => {
      const { data: rutina, error } = await supabase
        .from("rutina")
        .select("id, nombre, descripcion, icono, es_plantilla, nivel, duracion_minutos, grupo_muscular")
        .eq("id", args.routine_id)
        .maybeSingle();

      if (error) return failFromPostgrest(error);
      if (!rutina) {
        return fail(
          "NOT_FOUND",
          "No routine with that ID is visible to this user.",
          "Call list_routines and use one of the returned routine_id values.",
        );
      }

      const { data: ejercicios, error: ejError } = await supabase
        .from("rutina_ejercicio")
        .select(ROUTINE_EXERCISE_COLUMNS)
        .eq("rutina_id", args.routine_id)
        .order("orden", { ascending: true });
      if (ejError) return failFromPostgrest(ejError);

      const filas = (ejercicios ?? []) as unknown as EjercicioRutinaRow[];

      let planes: Array<{
        rutina_ejercicio_id: string;
        orden: number;
        tipo_serie: string;
        repes_min: number | null;
        repes_max: number | null;
        rir: number | null;
        peso_objetivo_kg: number | null;
        descanso: number | null;
        duracion_objetivo_seg: number | null;
        ritmo_objetivo_seg_km: number | null;
      }> = [];

      if (filas.length) {
        const { data: p, error: pError } = await supabase
          .from("rutina_ejercicio_serie")
          .select(
            "rutina_ejercicio_id, orden, tipo_serie, repes_min, repes_max, rir, peso_objetivo_kg, descanso, duracion_objetivo_seg, ritmo_objetivo_seg_km",
          )
          .in("rutina_ejercicio_id", filas.map((e) => e.id))
          .order("orden", { ascending: true });
        if (pError) return failFromPostgrest(pError);
        planes = p ?? [];
      }

      const planPorEjercicio = new Map<string, typeof planes>();
      for (const linea of planes) {
        const lista = planPorEjercicio.get(linea.rutina_ejercicio_id) ?? [];
        lista.push(linea);
        planPorEjercicio.set(linea.rutina_ejercicio_id, lista);
      }

      return ok(
        {
          routine_id: rutina.id,
          name: userText(rutina.nombre),
          description: userText(rutina.descripcion),
          is_template: rutina.es_plantilla === true,
          level: rutina.nivel,
          estimated_minutes: rutina.duracion_minutos,
          muscle_group: rutina.grupo_muscular,
          exercises: filas.map((e) => {
            const plan = planPorEjercicio.get(e.id) ?? [];
            return {
              position: e.orden,
              ...(e.tipo_ejercicio ? { tipo_ejercicio_id: e.tipo_ejercicio.id } : {}),
              ...(e.usuario_ejercicio ? { usuario_ejercicio_id: e.usuario_ejercicio.id } : {}),
              name: userText(e.tipo_ejercicio?.nombre ?? e.usuario_ejercicio?.nombre) ?? "(sin nombre)",
              muscle_group: e.tipo_ejercicio?.grupo_muscular ?? e.usuario_ejercicio?.grupo_muscular ?? null,
              logging_mode: e.registro_series,
              target_sets: e.series_objetivo,
              reps_min: e.repes_min,
              reps_max: e.repes_max,
              rir: e.rir,
              rest_seconds: e.descanso,
              target_duration_seconds: e.duracion_objetivo_seg,
              target_pace_seconds_per_km: e.ritmo_objetivo_seg_km,
              superset_id: e.superset_id,
              ...(plan.length
                ? {
                    set_plan: plan.map((linea) => ({
                      set_number: linea.orden + 1,
                      set_type: linea.tipo_serie,
                      reps_min: linea.repes_min,
                      // null significa "sin techo" (se muestra como "8+" en la app).
                      reps_max: linea.repes_max,
                      rir: linea.rir,
                      target_weight_kg: linea.peso_objetivo_kg,
                      rest_seconds: linea.descanso,
                      target_duration_seconds: linea.duracion_objetivo_seg,
                      target_pace_seconds_per_km: linea.ritmo_objetivo_seg_km,
                    })),
                  }
                : {}),
            };
          }),
        },
        { untrusted: true },
      );
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "get_schedule",
    {
      description:
        "The user's training calendar for a date range: which routines are scheduled on which days " +
        "and whether each slot was completed (linked to a trained session) or is still pending. " +
        "Dates are calendar days, YYYY-MM-DD. Use it before scheduling anything, to see what is " +
        "already planned.",
      inputSchema: z.object({
        from: z.string().date(),
        to: z.string().date(),
        include_completed: z.boolean().default(true),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args: {
      from: string;
      to: string;
      include_completed?: boolean;
    }): Promise<ToolResult> => {
      const dias = rangeDays(args.from, args.to);
      if (!Number.isFinite(dias) || dias <= 0) {
        return fail("INVALID_RANGE", "`to` must be the same day as `from` or later.");
      }
      if (dias > MAX_RANGE_DAYS) {
        return fail(
          "RANGE_TOO_LARGE",
          `The range covers ${dias} days; the maximum is ${MAX_RANGE_DAYS}.`,
          "Ask for a shorter range.",
        );
      }

      let q = supabase
        .from("rutina_programada")
        .select("id, fecha_programada, actividad_id, rutina(id, nombre, icono, duracion_minutos)")
        .gte("fecha_programada", args.from)
        .lte("fecha_programada", args.to)
        .order("fecha_programada", { ascending: true });

      if (args.include_completed === false) q = q.is("actividad_id", null);

      const { data, error } = await q;
      if (error) return failFromPostgrest(error);

      return ok(
        (data ?? []).map((p) => {
          const rutina = p.rutina as unknown as {
            id: string;
            nombre: string;
            icono: string;
            duracion_minutos: number | null;
          } | null;
          return {
            scheduled_id: p.id,
            date: p.fecha_programada,
            routine_id: rutina?.id ?? null,
            routine_name: userText(rutina?.nombre),
            estimated_minutes: rutina?.duracion_minutos ?? null,
            completed: p.actividad_id !== null,
            workout_id: p.actividad_id,
          };
        }),
        { untrusted: true },
      );
    },
  );

  // =========================================================================
  // Escritura
  // =========================================================================

  server.registerTool(
    "create_routine",
    {
      description:
        "Create a training routine from a list of exercises with their targets (sets, rep range, RIR, " +
        "rest in seconds). Optionally give an exercise a per-set plan, for pyramids, warm-up sets or " +
        "ascending RIR; when you do, the exercise-level targets are derived from it automatically. " +
        "Identify exercises with IDs from search_exercises.",
      inputSchema: z.object({
        name: z.string().min(1).max(80),
        description: z.string().max(1000).optional(),
        icon: z.string().max(40).optional(),
        exercises: z.array(routineExerciseInputSchema).min(1).max(40),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (args: {
      name: string;
      description?: string;
      icon?: string;
      exercises: RoutineExerciseInput[];
    }): Promise<ToolResult> => {
      const resolucion = await resolveAll(supabase, args.exercises);
      if ("error" in resolucion) return resolucion.error;

      // Sin `p_rutina_id` la función crea una rutina nueva; los opcionales se
      // omiten en lugar de mandarse como null.
      const { data, error } = await supabase.rpc("upsert_routine", {
        p_nombre: args.name,
        ...(args.description !== undefined ? { p_descripcion: args.description } : {}),
        ...(args.icon !== undefined ? { p_icono: args.icon } : {}),
        p_ejercicios: toRpcRoutineExercises(args.exercises, resolucion.resueltos),
      });

      if (error) return failFromPostgrest(error);
      return ok(data as Record<string, unknown>);
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "update_routine",
    {
      description:
        "Update a routine. If you send `exercises`, the list REPLACES the existing one entirely — read " +
        "it with get_routine first and send the complete list back. Omit `exercises` to rename or " +
        "re-describe without touching them. Built-in templates cannot be edited.",
      inputSchema: z.object({
        routine_id: z.string().uuid(),
        name: z.string().min(1).max(80).optional(),
        description: z.string().max(1000).optional(),
        icon: z.string().max(40).optional(),
        exercises: z.array(routineExerciseInputSchema).min(1).max(40).optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    },
    async (args: {
      routine_id: string;
      name?: string;
      description?: string;
      icon?: string;
      exercises?: RoutineExerciseInput[];
    }): Promise<ToolResult> => {
      let ejercicios: ReturnType<typeof toRpcRoutineExercises> | null = null;

      if (args.exercises) {
        const resolucion = await resolveAll(supabase, args.exercises);
        if ("error" in resolucion) return resolucion.error;
        ejercicios = toRpcRoutineExercises(args.exercises, resolucion.resueltos);
      }

      // El nombre es obligatorio en la RPC; si no se cambia, se reenvía el actual.
      let nombre = args.name;
      if (!nombre) {
        const { data: actual, error: errorLectura } = await supabase
          .from("rutina")
          .select("nombre")
          .eq("id", args.routine_id)
          .maybeSingle();
        if (errorLectura) return failFromPostgrest(errorLectura);
        if (!actual) {
          return fail(
            "NOT_FOUND",
            "No routine with that ID is visible to this user.",
            "Call list_routines to get a valid routine_id.",
          );
        }
        nombre = actual.nombre;
      }

      const { data, error } = await supabase.rpc("upsert_routine", {
        p_rutina_id: args.routine_id,
        p_nombre: nombre,
        ...(args.description !== undefined ? { p_descripcion: args.description } : {}),
        ...(args.icon !== undefined ? { p_icono: args.icon } : {}),
        // Omitirlo deja los ejercicios como están; enviarlo los reemplaza.
        ...(ejercicios ? { p_ejercicios: ejercicios } : {}),
      });

      if (error) return failFromPostgrest(error);
      return ok(data as Record<string, unknown>);
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "delete_routine",
    {
      description:
        "Permanently delete a routine and its exercises. Sessions already trained from it are NOT " +
        "affected. confirm_name must match the routine's stored name exactly — read it with " +
        "get_routine or list_routines first. Built-in templates cannot be deleted.",
      inputSchema: z.object({
        routine_id: z.string().uuid(),
        confirm_name: z.string().min(1).max(80),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    },
    async (args: { routine_id: string; confirm_name: string }): Promise<ToolResult> => {
      const { data, error } = await supabase.rpc("delete_routine_cascade", {
        p_rutina_id: args.routine_id,
        p_confirm_name: args.confirm_name,
      });
      if (error) return failFromPostgrest(error);
      return ok(data as Record<string, unknown>);
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "schedule_routine",
    {
      description:
        "Schedule a routine on one or more calendar days (YYYY-MM-DD). Days that already have that " +
        "routine scheduled are skipped, so running this again is safe. Maximum 60 dates per call. " +
        "Check get_schedule first to see what is already planned.",
      inputSchema: z.object({
        routine_id: z.string().uuid(),
        dates: z.array(z.string().date()).min(1).max(60),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (args: { routine_id: string; dates: string[] }): Promise<ToolResult> => {
      const { data, error } = await supabase.rpc("schedule_routine_dates", {
        p_rutina_id: args.routine_id,
        p_fechas: args.dates,
      });
      if (error) return failFromPostgrest(error);
      return ok(data as Record<string, unknown>);
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "unschedule_routine",
    {
      description:
        "Remove scheduled slots from the calendar, by their scheduled_id from get_schedule. This only " +
        "removes planning entries and never deletes a trained session. Slots already linked to a " +
        "completed workout are left alone unless force:true.",
      inputSchema: z.object({
        scheduled_ids: z.array(z.string().uuid()).min(1).max(60),
        force: z
          .boolean()
          .default(false)
          .describe("Also remove slots already marked as completed."),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    },
    async (args: { scheduled_ids: string[]; force?: boolean }): Promise<ToolResult> => {
      let q = supabase.from("rutina_programada").delete().in("id", args.scheduled_ids);
      if (!args.force) q = q.is("actividad_id", null);

      const { data, error } = await q.select("id, fecha_programada");
      if (error) return failFromPostgrest(error);

      const borrados = data ?? [];
      const omitidos = args.scheduled_ids.length - borrados.length;

      return ok(
        { removed: borrados.length, skipped: omitidos, dates: borrados.map((d) => d.fecha_programada) },
        {
          notes:
            omitidos > 0 && !args.force
              ? [`${omitidos} slot(s) were kept: they are already linked to a trained session. Pass force:true to remove them anyway.`]
              : undefined,
        },
      );
    },
  );
}
