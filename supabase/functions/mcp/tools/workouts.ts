/**
 * Entrenamientos de fuerza: historial, detalle, progresión y récords.
 *
 * Todo lo que sale de aquí respeta dos criterios de la app, no unos propios:
 * una sesión cuenta cuando está cerrada (`fecha_fin`), y una serie cuenta como
 * trabajo cuando no es calentamiento (`isWorkingSet`). Si divergieran, el
 * asistente y la pantalla de Evolución darían cifras distintas del mismo mes.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { isWorkingSet } from "../../_shared/domain/setTypes.ts";
import { ok, fail, failFromPostgrest, type ToolResult } from "../lib/respond.ts";
import { clamp, rangeDays, MAX_RANGE_DAYS, MAX_HISTORY_MONTHS, MAX_RAW_SETS } from "../lib/limits.ts";
import { userText } from "../lib/untrusted.ts";
import { fetchAllByIds } from "../lib/paginate.ts";
import {
  createSupersetIdMapper,
  exerciseInputSchema,
  resolveAll,
  tooManySets,
  type ExerciseInput,
} from "./shared.ts";
import type { ResolvedExercise } from "./exercises.ts";
import type { Database } from "../database.types.ts";
import type { Supabase } from "./registry.ts";

/** Traduce la lista que manda el modelo al payload jsonb que espera la RPC. */
function toRpcExercises(entradas: ExerciseInput[], resueltos: ResolvedExercise[]) {
  const supersetId = createSupersetIdMapper();

  return entradas.map((e, i) => ({
    tipo_ejercicio_id: resueltos[i].tipo_ejercicio_id,
    usuario_ejercicio_id: resueltos[i].usuario_ejercicio_id,
    // Si el modelo no lo dice, manda el modo declarado en el catálogo: así una
    // sesión de plancha no se guarda como si fuera peso por repeticiones.
    registro_series: e.logging_mode ?? resueltos[i].registro_series,
    descanso: e.rest_seconds ?? null,
    rep_range: e.rep_range ?? null,
    rir_objetivo: e.target_rir ?? null,
    superset_id: supersetId(e.superset_id),
    series: e.sets.map((s) => ({
      repeticiones: s.reps,
      peso_kg: s.weight_kg,
      duracion_seg: s.duration_seconds ?? null,
      ritmo_seg_km: s.pace_seconds_per_km ?? null,
      rir: s.rir ?? null,
      descanso: s.rest_seconds ?? null,
      tipo_serie: s.set_type,
      objetivo_repes_min: s.target_reps_min ?? null,
      objetivo_repes_max: s.target_reps_max ?? null,
      objetivo_rir: s.target_rir ?? null,
      objetivo_peso_kg: s.target_weight_kg ?? null,
    })),
  }));
}

/** Lo que se le enseña al modelo sobre qué ejercicio acabó guardándose. */
function resolvedSummary(resueltos: ResolvedExercise[]) {
  return resueltos.map((r) => ({
    name: r.name,
    ...(r.tipo_ejercicio_id ? { tipo_ejercicio_id: r.tipo_ejercicio_id } : {}),
    ...(r.usuario_ejercicio_id ? { usuario_ejercicio_id: r.usuario_ejercicio_id } : {}),
    matched_from: r.matched_from,
    ...(r.input ? { input: r.input } : {}),
  }));
}

type SerieRow = {
  id: string;
  ejercicio_id: string;
  numero_serie: number;
  peso_kg: number;
  repeticiones: number;
  duracion_seg: number | null;
  ritmo_seg_km: number | null;
  rir: number | null;
  descanso: number | null;
  completed: boolean | null;
  tipo_serie: string | null;
  objetivo_repes_min: number | null;
  objetivo_repes_max: number | null;
  objetivo_rir: number | null;
  objetivo_peso_kg: number | null;
};

const SERIE_COLUMNS =
  "id, ejercicio_id, numero_serie, peso_kg, repeticiones, duracion_seg, ritmo_seg_km, rir, descanso, completed, tipo_serie, objetivo_repes_min, objetivo_repes_max, objetivo_rir, objetivo_peso_kg";

function sessionSeconds(fecha: string, fechaFin: string | null): number | null {
  if (!fechaFin) return null;
  const ms = Date.parse(fechaFin) - Date.parse(fecha);
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 1000)) : null;
}

export function registerWorkoutTools(server: McpServer, supabase: Supabase): void {
  // -------------------------------------------------------------------------
  server.registerTool(
    "list_workouts",
    {
      description:
        "List the user's strength training sessions, newest first. Returns one summary per session " +
        "(not the individual sets): title, start time, duration, exercise and working-set counts, " +
        "total tonnage in kg and session RPE. Use status:'active' to check whether a session is " +
        "currently in progress before logging a new one — the app may have one open. " +
        "Call get_workout for the sets of a specific session.",
      inputSchema: z.object({
        from: z.string().date().optional().describe("Start date, YYYY-MM-DD, inclusive (UTC)."),
        to: z.string().date().optional().describe("End date, YYYY-MM-DD, inclusive (UTC)."),
        status: z
          .enum(["completed", "active", "any"])
          .default("completed")
          .describe("'active' means a session still open in the app (no end time)."),
        limit: z.number().int().min(1).max(50).default(15),
        offset: z.number().int().min(0).default(0),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args: {
      from?: string;
      to?: string;
      status?: "completed" | "active" | "any";
      limit?: number;
      offset?: number;
    }): Promise<ToolResult> => {
      const limit = clamp(args.limit ?? 15, 1, 50);
      const offset = Math.max(0, args.offset ?? 0);
      const status = args.status ?? "completed";

      let q = supabase
        .from("actividad")
        .select("id, titulo, fecha, fecha_fin, comentarios, rpe, icono, gimnasio_nombre")
        .order("fecha", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status === "completed") q = q.not("fecha_fin", "is", null);
      if (status === "active") q = q.is("fecha_fin", null);
      if (args.from) q = q.gte("fecha", `${args.from}T00:00:00Z`);
      if (args.to) q = q.lte("fecha", `${args.to}T23:59:59.999Z`);

      const { data, error } = await q;
      if (error) return failFromPostgrest(error);

      const sesiones = data ?? [];
      if (!sesiones.length) return ok([], { nextOffset: null });

      // Agregados para las sesiones de esta página. Se pagina y se trocea: 50
      // sesiones son cientos de ejercicios y miles de series, y tanto `max-rows`
      // como la longitud de la URL recortarían sin avisar. Un tonelaje corto no
      // se distingue de un mes flojo, así que aquí el silencio es el peligro.
      const ids = sesiones.map((s) => s.id);

      let ejercicios: { id: string; actividad_id: string }[];
      let series: Pick<SerieRow, "ejercicio_id" | "peso_kg" | "repeticiones" | "tipo_serie">[] = [];
      try {
        ejercicios = await fetchAllByIds<{ id: string; actividad_id: string }>(
          ids,
          (chunk, from, to) =>
            supabase
              .from("ejercicio")
              .select("id, actividad_id")
              .in("actividad_id", chunk)
              .order("id")
              .range(from, to),
        );

        if (ejercicios.length) {
          series = await fetchAllByIds<
            Pick<SerieRow, "ejercicio_id" | "peso_kg" | "repeticiones" | "tipo_serie">
          >(
            ejercicios.map((e) => e.id),
            (chunk, from, to) =>
              supabase
                .from("serie")
                .select("ejercicio_id, peso_kg, repeticiones, tipo_serie")
                .in("ejercicio_id", chunk)
                .order("id")
                .range(from, to),
          );
        }
      } catch (e) {
        return failFromPostgrest(e as { code?: string; message: string });
      }

      const porEjercicio = new Map<string, string>();
      for (const e of ejercicios) porEjercicio.set(e.id, e.actividad_id);

      const agregados = new Map<string, { sets: number; tonnage: number; reps: number }>();
      for (const s of series) {
        if (!isWorkingSet(s.tipo_serie)) continue;
        const actividadId = porEjercicio.get(s.ejercicio_id);
        if (!actividadId) continue;
        const acc = agregados.get(actividadId) ?? { sets: 0, tonnage: 0, reps: 0 };
        acc.sets += 1;
        acc.tonnage += (s.peso_kg ?? 0) * (s.repeticiones ?? 0);
        acc.reps += s.repeticiones ?? 0;
        agregados.set(actividadId, acc);
      }

      const ejerciciosPorSesion = new Map<string, number>();
      for (const e of ejercicios) {
        ejerciciosPorSesion.set(e.actividad_id, (ejerciciosPorSesion.get(e.actividad_id) ?? 0) + 1);
      }

      return ok(
        sesiones.map((s) => {
          const agg = agregados.get(s.id);
          return {
            workout_id: s.id,
            title: userText(s.titulo),
            date: s.fecha,
            end_date: s.fecha_fin,
            is_active: s.fecha_fin === null,
            duration_seconds: sessionSeconds(s.fecha, s.fecha_fin),
            exercises: ejerciciosPorSesion.get(s.id) ?? 0,
            working_sets: agg?.sets ?? 0,
            tonnage_kg: Math.round(agg?.tonnage ?? 0),
            reps: agg?.reps ?? 0,
            rpe: s.rpe,
            gym: userText(s.gimnasio_nombre),
            comments: userText(s.comentarios),
          };
        }),
        {
          nextOffset: sesiones.length === limit ? offset + limit : null,
          untrusted: true,
        },
      );
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "get_workout",
    {
      description:
        "Full detail of one strength session: every exercise in execution order and every set with " +
        "weight (kg), reps, RIR, set type (calentamiento = warm-up, efectiva = working, dropset, " +
        "amrap), rest in seconds and the prescribed targets, if any. Exercises sharing a superset_id " +
        "were performed as a superset.",
      inputSchema: z.object({ workout_id: z.string().uuid() }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args: { workout_id: string }): Promise<ToolResult> => {
      const { data: sesion, error } = await supabase
        .from("actividad")
        .select("id, titulo, fecha, fecha_fin, comentarios, rpe, icono, gimnasio_nombre, fc_media, fc_max")
        .eq("id", args.workout_id)
        .maybeSingle();

      if (error) return failFromPostgrest(error);
      if (!sesion) {
        return fail(
          "NOT_FOUND",
          "No session with that ID for this user.",
          "Call list_workouts and use one of the returned workout_id values.",
        );
      }

      const { data: ejercicios, error: ejError } = await supabase
        .from("ejercicio")
        .select(
          "id, created_at, registro_series, rep_range, rir_objetivo, descanso, superset_id, tipo_ejercicio(id, nombre, grupo_muscular), usuario_ejercicio(id, nombre, grupo_muscular)",
        )
        .eq("actividad_id", args.workout_id)
        // El orden de ejecución se guarda como created_at escalonado.
        .order("created_at", { ascending: true });
      if (ejError) return failFromPostgrest(ejError);

      const filas = ejercicios ?? [];
      let series: SerieRow[] = [];
      if (filas.length) {
        const { data: s, error: sError } = await supabase
          .from("serie")
          .select(SERIE_COLUMNS)
          .in("ejercicio_id", filas.map((e) => e.id))
          .order("numero_serie", { ascending: true });
        if (sError) return failFromPostgrest(sError);
        series = (s ?? []) as SerieRow[];
      }

      const porEjercicio = new Map<string, SerieRow[]>();
      for (const s of series) {
        const lista = porEjercicio.get(s.ejercicio_id) ?? [];
        lista.push(s);
        porEjercicio.set(s.ejercicio_id, lista);
      }

      return ok(
        {
          workout_id: sesion.id,
          title: userText(sesion.titulo),
          date: sesion.fecha,
          end_date: sesion.fecha_fin,
          is_active: sesion.fecha_fin === null,
          duration_seconds: sessionSeconds(sesion.fecha, sesion.fecha_fin),
          rpe: sesion.rpe,
          avg_hr: sesion.fc_media,
          max_hr: sesion.fc_max,
          gym: userText(sesion.gimnasio_nombre),
          comments: userText(sesion.comentarios),
          exercises: filas.map((e, i) => {
            const catalogo = e.tipo_ejercicio as { id: string; nombre: string; grupo_muscular: string | null } | null;
            const propio = e.usuario_ejercicio as { id: string; nombre: string; grupo_muscular: string | null } | null;
            return {
              position: i + 1,
              ...(catalogo ? { tipo_ejercicio_id: catalogo.id } : {}),
              ...(propio ? { usuario_ejercicio_id: propio.id } : {}),
              name: userText(catalogo?.nombre ?? propio?.nombre) ?? "(sin nombre)",
              muscle_group: catalogo?.grupo_muscular ?? propio?.grupo_muscular ?? null,
              logging_mode: e.registro_series,
              rep_range: e.rep_range,
              target_rir: e.rir_objetivo,
              rest_seconds: e.descanso,
              superset_id: e.superset_id,
              sets: (porEjercicio.get(e.id) ?? []).map((s) => ({
                set_number: s.numero_serie,
                set_type: s.tipo_serie,
                weight_kg: s.peso_kg,
                reps: s.repeticiones,
                duration_seconds: s.duracion_seg,
                pace_seconds_per_km: s.ritmo_seg_km,
                rir: s.rir,
                rest_seconds: s.descanso,
                completed: s.completed,
                target: {
                  reps_min: s.objetivo_repes_min,
                  reps_max: s.objetivo_repes_max,
                  rir: s.objetivo_rir,
                  weight_kg: s.objetivo_peso_kg,
                },
              })),
            };
          }),
        },
        { untrusted: true },
      );
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "get_exercise_progress",
    {
      description:
        "Strength progression for one exercise over time. detail:'daily_best' (default) returns the " +
        "best set of each day with its estimated 1RM; detail:'sets' returns the raw set history. " +
        "Warm-up sets are excluded from both. Pass an ID obtained from search_exercises.",
      inputSchema: z.object({
        tipo_ejercicio_id: z.string().uuid().optional(),
        usuario_ejercicio_id: z.string().uuid().optional(),
        months: z.number().int().min(1).max(MAX_HISTORY_MONTHS).default(6),
        detail: z.enum(["daily_best", "sets"]).default("daily_best"),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args: {
      tipo_ejercicio_id?: string;
      usuario_ejercicio_id?: string;
      months?: number;
      detail?: "daily_best" | "sets";
    }): Promise<ToolResult> => {
      const dados = [args.tipo_ejercicio_id, args.usuario_ejercicio_id].filter(Boolean);
      if (dados.length !== 1) {
        return fail(
          "INVALID_EXERCISE_REF",
          "Provide exactly one of tipo_ejercicio_id or usuario_ejercicio_id.",
          "Call search_exercises to get the right ID.",
        );
      }

      const months = clamp(args.months ?? 6, 1, MAX_HISTORY_MONTHS);
      const detail = args.detail ?? "daily_best";

      if (detail === "daily_best") {
        if (!args.tipo_ejercicio_id) {
          return fail(
            "UNSUPPORTED",
            "daily_best is only available for catalog exercises.",
            "For a custom exercise (usuario_ejercicio_id) use detail:'sets'.",
          );
        }
        const { data, error } = await supabase.rpc("get_exercise_daily_best", {
          p_tipo_ejercicio_id: args.tipo_ejercicio_id,
          p_months: months,
        });
        if (error) return failFromPostgrest(error);

        return ok(
          (data ?? []).map((d) => ({
            day: d.day,
            weight_kg: d.weight,
            reps: d.reps,
            estimated_1rm_kg: d.one_rep_max,
          })),
          { notes: ["Estimated 1RM uses the Epley formula: weight x (1 + 0.0333 x reps)."] },
        );
      }

      // Se omite el identificador que no aplica en lugar de mandarlo como null:
      // los tipos generados declaran estos parámetros opcionales, no nulables.
      const { data, error } = await supabase.rpc("get_exercise_set_history", {
        ...(args.tipo_ejercicio_id ? { p_tipo_ejercicio_id: args.tipo_ejercicio_id } : {}),
        ...(args.usuario_ejercicio_id
          ? { p_usuario_ejercicio_id: args.usuario_ejercicio_id }
          : {}),
        p_months: months,
      });
      if (error) return failFromPostgrest(error);

      const filas = (data ?? []).slice(0, MAX_RAW_SETS);
      return ok(
        filas.map((s) => ({
          day: s.day,
          workout_id: s.actividad_id,
          workout_title: userText(s.actividad_titulo),
          set_number: s.numero_serie,
          set_type: s.tipo_serie,
          weight_kg: s.peso_kg,
          reps: s.repeticiones,
          duration_seconds: s.duracion_seg,
          rir: s.rir,
        })),
        {
          untrusted: true,
          notes:
            (data ?? []).length > MAX_RAW_SETS
              ? [`Showing the ${MAX_RAW_SETS} most recent sets of ${data!.length}. Reduce months to narrow.`]
              : undefined,
        },
      );
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "get_training_summary",
    {
      description:
        "Aggregated training over a date range: sessions, working sets, tonnage in kg, reps, time " +
        "trained, average session RPE and cardio volume. Use this instead of listing raw sessions " +
        "when the question is 'how much have I trained' or 'am I doing enough chest volume'. " +
        "group_by:'muscle' groups by the exercise's declared muscle group, which can differ slightly " +
        "from the app's Evolution screen — that one splits volume across every muscle involved.",
      inputSchema: z.object({
        from: z.string().date(),
        to: z.string().date(),
        group_by: z.enum(["total", "week", "muscle"]).default("total"),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args: {
      from: string;
      to: string;
      group_by?: "total" | "week" | "muscle";
    }): Promise<ToolResult> => {
      const dias = rangeDays(args.from, args.to);
      if (!Number.isFinite(dias) || dias <= 0) {
        return fail("INVALID_RANGE", "`to` must be the same day as `from` or later.");
      }
      if (dias > MAX_RANGE_DAYS) {
        return fail(
          "RANGE_TOO_LARGE",
          `The range covers ${dias} days; the maximum is ${MAX_RANGE_DAYS}.`,
          "Split the question into shorter ranges, or use group_by:'total' over a shorter period.",
        );
      }

      const { data, error } = await supabase.rpc("get_training_summary", {
        p_from: args.from,
        p_to: args.to,
        p_group_by: args.group_by ?? "total",
      });
      if (error) return failFromPostgrest(error);

      return ok(data ?? [], {
        notes: ["Days and weeks are bucketed in UTC. Weeks start on Monday."],
      });
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "get_personal_records",
    {
      description:
        "Best lifts: the top estimated 1RM per exercise with the date and the actual set (weight x " +
        "reps) behind it. Ranked by estimated 1RM, not by raw weight, so a heavy single and a long " +
        "set compare fairly. Warm-up sets excluded; catalog exercises only.",
      inputSchema: z.object({
        months: z.number().int().min(1).max(60).default(12),
        limit: z.number().int().min(1).max(50).default(15),
        tipo_ejercicio_id: z.string().uuid().optional(),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args: {
      months?: number;
      limit?: number;
      tipo_ejercicio_id?: string;
    }): Promise<ToolResult> => {
      const { data, error } = await supabase.rpc("get_personal_records", {
        p_months: clamp(args.months ?? 12, 1, 60),
        p_limit: clamp(args.limit ?? 15, 1, 50),
        ...(args.tipo_ejercicio_id ? { p_tipo_ejercicio_id: args.tipo_ejercicio_id } : {}),
      });
      if (error) return failFromPostgrest(error);

      return ok(data ?? [], { untrusted: true });
    },
  );

  // =========================================================================
  // Escritura
  // =========================================================================

  server.registerTool(
    "log_workout",
    {
      description:
        "Record a strength session that ALREADY HAPPENED: title, date, exercises and their sets. " +
        "Creates everything atomically and awards XP. Weights are kilograms; rest and durations are " +
        "seconds. This does not start a live session in the app — check list_workouts with " +
        "status:'active' first if the user might have one open. " +
        "client_request_id is required and makes retries safe: calling twice with the same value " +
        "returns the existing session instead of duplicating it. " +
        "Identify exercises with the IDs from search_exercises; a name is accepted only when it " +
        "matches one exercise clearly. Use dry_run:true to check what would be saved first. " +
        "Achievements are not granted here — they unlock next time the user opens the app.",
      inputSchema: z.object({
        title: z.string().min(1).max(120),
        date: z.string().datetime().describe("Session start, ISO-8601 UTC."),
        end_date: z.string().datetime().optional().describe("Defaults to one hour after the start."),
        comments: z.string().max(2000).optional(),
        rpe: z.number().int().min(1).max(10).optional().describe("Overall session effort, 1-10."),
        gym_id: z.string().uuid().optional(),
        planned_routine_id: z
          .string()
          .uuid()
          .optional()
          .describe("scheduled_id from get_schedule: marks that calendar slot as completed."),
        client_request_id: z.string().uuid().describe("Fresh UUID per real workout; reuse on retry."),
        exercises: z.array(exerciseInputSchema).min(1).max(40),
        dry_run: z.boolean().default(false),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (args: {
      title: string;
      date: string;
      end_date?: string;
      comments?: string;
      rpe?: number;
      gym_id?: string;
      planned_routine_id?: string;
      client_request_id: string;
      exercises: ExerciseInput[];
      dry_run?: boolean;
    }): Promise<ToolResult> => {
      const exceso = tooManySets(args.exercises);
      if (exceso) return exceso;

      const resolucion = await resolveAll(supabase, args.exercises);
      if ("error" in resolucion) return resolucion.error;
      const { resueltos } = resolucion;

      if (args.dry_run) {
        return ok(
          { would_create: true, resolved_exercises: resolvedSummary(resueltos) },
          { notes: ["Nothing was saved. Call again with dry_run:false to record it."] },
        );
      }

      const { data, error } = await supabase.rpc("log_strength_session", {
        p_payload: {
          titulo: args.title,
          fecha: args.date,
          fecha_fin: args.end_date ?? null,
          comentarios: args.comments ?? null,
          rpe: args.rpe ?? null,
          gimnasio_id: args.gym_id ?? null,
          planned_routine_id: args.planned_routine_id ?? null,
          idempotency_key: args.client_request_id,
          ejercicios: toRpcExercises(args.exercises, resueltos),
        },
      });

      if (error) return failFromPostgrest(error);

      return ok(
        { ...(data as Record<string, unknown>), resolved_exercises: resolvedSummary(resueltos) },
        { notes: ["Achievements unlock next time the user opens the Track Gym app."] },
      );
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "update_workout",
    {
      description:
        "Change only the metadata of an existing session: title, date, comments, session RPE or gym. " +
        "It does not touch exercises or sets — use replace_workout_exercises for those.",
      inputSchema: z.object({
        workout_id: z.string().uuid(),
        title: z.string().min(1).max(120).optional(),
        date: z.string().datetime().optional(),
        end_date: z.string().datetime().optional(),
        comments: z.string().max(2000).optional(),
        rpe: z.number().int().min(1).max(10).optional(),
        gym_id: z.string().uuid().optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (args: {
      workout_id: string;
      title?: string;
      date?: string;
      end_date?: string;
      comments?: string;
      rpe?: number;
      gym_id?: string;
    }): Promise<ToolResult> => {
      const patch: Database["public"]["Tables"]["actividad"]["Update"] = {};
      if (args.title !== undefined) patch.titulo = args.title;
      if (args.date !== undefined) patch.fecha = args.date;
      if (args.end_date !== undefined) patch.fecha_fin = args.end_date;
      if (args.comments !== undefined) patch.comentarios = args.comments;
      if (args.rpe !== undefined) patch.rpe = args.rpe;
      if (args.gym_id !== undefined) patch.gimnasio_id = args.gym_id;

      if (Object.keys(patch).length === 0) {
        return fail("NOTHING_TO_UPDATE", "Provide at least one field to change.");
      }

      const { data, error } = await supabase
        .from("actividad")
        .update(patch)
        .eq("id", args.workout_id)
        .select("id, titulo, fecha, fecha_fin, rpe")
        .maybeSingle();

      if (error) return failFromPostgrest(error);
      if (!data) {
        return fail(
          "NOT_FOUND",
          "No session with that ID for this user.",
          "Call list_workouts to get a valid workout_id.",
        );
      }

      return ok(
        {
          workout_id: data.id,
          title: userText(data.titulo),
          date: data.fecha,
          end_date: data.fecha_fin,
          rpe: data.rpe,
        },
        { untrusted: true },
      );
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "replace_workout_exercises",
    {
      description:
        "Replace the ENTIRE exercise and set list of an existing session. Use it to correct a logged " +
        "workout: read it with get_workout, then send back the complete corrected list. Anything you " +
        "omit is deleted. Session XP is recomputed from the new sets. " +
        "There is no tool to edit a single set on purpose: sending the whole list avoids leaving the " +
        "session half-updated.",
      inputSchema: z.object({
        workout_id: z.string().uuid(),
        exercises: z.array(exerciseInputSchema).min(1).max(40),
        confirm: z
          .literal(true)
          .describe("Confirms the current contents of the session will be discarded."),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
    },
    async (args: {
      workout_id: string;
      exercises: ExerciseInput[];
      confirm: true;
    }): Promise<ToolResult> => {
      const exceso = tooManySets(args.exercises);
      if (exceso) return exceso;

      const resolucion = await resolveAll(supabase, args.exercises);
      if ("error" in resolucion) return resolucion.error;
      const { resueltos } = resolucion;

      const { data, error } = await supabase.rpc("replace_session_exercises", {
        p_actividad_id: args.workout_id,
        p_ejercicios: toRpcExercises(args.exercises, resueltos),
      });

      if (error) return failFromPostgrest(error);

      return ok({
        ...(data as Record<string, unknown>),
        resolved_exercises: resolvedSummary(resueltos),
      });
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "delete_session",
    {
      description:
        "Permanently delete a strength or cardio session and all of its data. This cannot be undone. " +
        "confirm_title must match the session's stored title exactly — read it first with get_workout " +
        "or get_cardio_session. Its XP is returned and the streak is recalculated. " +
        "Sessions can only be deleted one at a time, by ID: there is no bulk delete.",
      inputSchema: z.object({
        kind: z.enum(["strength", "cardio"]),
        session_id: z.string().uuid(),
        confirm_title: z.string().min(1).max(120),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    },
    async (args: {
      kind: "strength" | "cardio";
      session_id: string;
      confirm_title: string;
    }): Promise<ToolResult> => {
      const { data, error } = await supabase.rpc("delete_session_cascade", {
        p_kind: args.kind,
        p_session_id: args.session_id,
        p_confirm_title: args.confirm_title,
      });

      if (error) return failFromPostgrest(error);
      return ok(data as Record<string, unknown>);
    },
  );
}
