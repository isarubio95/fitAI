/**
 * Sesiones de cardio.
 *
 * Deliberadamente sin puntos GPS: un track son miles de coordenadas que no
 * caben en el contexto de un modelo y que además no responden a ninguna
 * pregunta que se le vaya a hacer en lenguaje natural. Lo que sí viaja son los
 * bloques (calentamiento, trabajo, recuperación) con distancia, duración,
 * desnivel y frecuencia cardiaca, más las métricas propias de carrera o ciclismo.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { ok, fail, failFromPostgrest, type ToolResult } from "../lib/respond.ts";
import { clamp } from "../lib/limits.ts";
import { userText } from "../lib/untrusted.ts";
import type { Supabase } from "./registry.ts";

type BloqueRow = {
  cardio_sesion_id: string;
  orden: number;
  tipo_bloque: string;
  distancia_m: number | null;
  duracion_seg: number | null;
  elevacion_m: number | null;
  fc_media: number | null;
  fc_max: number | null;
  calorias: number | null;
};

const BLOQUE_COLUMNS =
  "cardio_sesion_id, orden, tipo_bloque, distancia_m, duracion_seg, elevacion_m, fc_media, fc_max, calorias";

type BlockInput = {
  block_type?: "warmup" | "work" | "recovery" | "cooldown";
  distance_m?: number;
  duration_seconds?: number;
  elevation_m?: number;
  avg_hr?: number;
  max_hr?: number;
  calories?: number;
};

type RunningInput = {
  avg_pace_seconds_per_km?: number;
  avg_cadence_spm?: number;
  avg_stride_cm?: number;
  elevation_gain_m?: number;
};

type CyclingInput = {
  avg_power_w?: number;
  normalized_power_w?: number;
  avg_cadence_rpm?: number;
  elevation_gain_m?: number;
  bike_type?: string;
};

function sessionSeconds(inicio: string, fin: string | null): number | null {
  if (!fin) return null;
  const ms = Date.parse(fin) - Date.parse(inicio);
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 1000)) : null;
}

export function registerCardioTools(server: McpServer, supabase: Supabase): void {
  // -------------------------------------------------------------------------
  server.registerTool(
    "list_cardio_sessions",
    {
      description:
        "List cardio sessions (running, cycling, rowing…) newest first, with discipline, duration in " +
        "seconds, distance in meters, average pace in seconds per kilometer and heart rate. " +
        "GPS tracks are never returned.",
      inputSchema: z.object({
        from: z.string().date().optional(),
        to: z.string().date().optional(),
        discipline: z
          .string()
          .max(40)
          .optional()
          .describe('Discipline code, e.g. "running", "cycling".'),
        limit: z.number().int().min(1).max(50).default(15),
        offset: z.number().int().min(0).default(0),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args: {
      from?: string;
      to?: string;
      discipline?: string;
      limit?: number;
      offset?: number;
    }): Promise<ToolResult> => {
      const limit = clamp(args.limit ?? 15, 1, 50);
      const offset = Math.max(0, args.offset ?? 0);

      let q = supabase
        .from("cardio_sesion")
        .select(
          "id, titulo, fecha_inicio, fecha_fin, rpe, comentarios, cardio_disciplina(codigo, nombre)",
        )
        .not("fecha_fin", "is", null)
        .order("fecha_inicio", { ascending: false })
        .range(offset, offset + limit - 1);

      if (args.from) q = q.gte("fecha_inicio", `${args.from}T00:00:00Z`);
      if (args.to) q = q.lte("fecha_inicio", `${args.to}T23:59:59.999Z`);

      const { data, error } = await q;
      if (error) return failFromPostgrest(error);

      let sesiones = data ?? [];

      // El filtro por disciplina se aplica aquí y no en la consulta: PostgREST no
      // filtra por columnas de una tabla embebida sin convertir el join en inner,
      // y eso escondería las sesiones sin disciplina asignada.
      if (args.discipline) {
        const buscado = args.discipline.toLowerCase();
        sesiones = sesiones.filter((s) => {
          const d = s.cardio_disciplina as unknown as { codigo: string } | null;
          return d?.codigo?.toLowerCase() === buscado;
        });
      }

      if (!sesiones.length) return ok([], { nextOffset: null });

      const { data: bloques, error: bError } = await supabase
        .from("cardio_bloque")
        .select(BLOQUE_COLUMNS)
        .in("cardio_sesion_id", sesiones.map((s) => s.id));
      if (bError) return failFromPostgrest(bError);

      const porSesion = new Map<string, BloqueRow[]>();
      for (const b of (bloques ?? []) as BloqueRow[]) {
        const lista = porSesion.get(b.cardio_sesion_id) ?? [];
        lista.push(b);
        porSesion.set(b.cardio_sesion_id, lista);
      }

      return ok(
        sesiones.map((s) => {
          const propios = porSesion.get(s.id) ?? [];
          const distancia = propios.reduce((acc, b) => acc + (b.distancia_m ?? 0), 0);
          const duracionBloques = propios.reduce((acc, b) => acc + (b.duracion_seg ?? 0), 0);
          const duracion = duracionBloques || sessionSeconds(s.fecha_inicio, s.fecha_fin) || 0;
          const disciplina = s.cardio_disciplina as unknown as {
            codigo: string;
            nombre: string;
          } | null;

          const fcs = propios.map((b) => b.fc_media).filter((v): v is number => v != null);

          return {
            session_id: s.id,
            title: userText(s.titulo),
            discipline: disciplina?.codigo ?? null,
            start: s.fecha_inicio,
            end: s.fecha_fin,
            duration_seconds: duracion,
            distance_m: distancia,
            avg_pace_seconds_per_km:
              distancia > 0 && duracion > 0 ? Math.round(duracion / (distancia / 1000)) : null,
            avg_hr: fcs.length ? Math.round(fcs.reduce((a, b) => a + b, 0) / fcs.length) : null,
            rpe: s.rpe,
          };
        }),
        { nextOffset: sesiones.length === limit ? offset + limit : null, untrusted: true },
      );
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "get_cardio_session",
    {
      description:
        "Full detail of one cardio session: its blocks in order (warm-up / work / recovery) with " +
        "distance in meters, duration in seconds, elevation and heart rate, plus running specifics " +
        "(average pace in seconds per km, cadence in steps per minute, stride in cm) or cycling " +
        "specifics (average and normalized power in watts, cadence in rpm). No GPS points.",
      inputSchema: z.object({ session_id: z.string().uuid() }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args: { session_id: string }): Promise<ToolResult> => {
      const { data: sesion, error } = await supabase
        .from("cardio_sesion")
        .select(
          "id, titulo, fecha_inicio, fecha_fin, rpe, comentarios, cardio_disciplina(codigo, nombre)",
        )
        .eq("id", args.session_id)
        .maybeSingle();

      if (error) return failFromPostgrest(error);
      if (!sesion) {
        return fail(
          "NOT_FOUND",
          "No cardio session with that ID for this user.",
          "Call list_cardio_sessions and use one of the returned session_id values.",
        );
      }

      const [bloques, running, cycling] = await Promise.all([
        supabase
          .from("cardio_bloque")
          .select(BLOQUE_COLUMNS)
          .eq("cardio_sesion_id", args.session_id)
          .order("orden", { ascending: true }),
        supabase
          .from("cardio_sesion_running")
          .select("ritmo_medio_seg_km, cadencia_media_spm, zancada_media_cm, desnivel_positivo_m")
          .eq("cardio_sesion_id", args.session_id)
          .maybeSingle(),
        supabase
          .from("cardio_sesion_cycling")
          .select(
            "potencia_media_w, potencia_normalizada_w, cadencia_media_rpm, desnivel_positivo_m, tipo_bici",
          )
          .eq("cardio_sesion_id", args.session_id)
          .maybeSingle(),
      ]);

      if (bloques.error) return failFromPostgrest(bloques.error);

      const disciplina = sesion.cardio_disciplina as unknown as {
        codigo: string;
        nombre: string;
      } | null;

      return ok(
        {
          session_id: sesion.id,
          title: userText(sesion.titulo),
          discipline: disciplina?.codigo ?? null,
          start: sesion.fecha_inicio,
          end: sesion.fecha_fin,
          duration_seconds: sessionSeconds(sesion.fecha_inicio, sesion.fecha_fin),
          rpe: sesion.rpe,
          comments: userText(sesion.comentarios),
          blocks: ((bloques.data ?? []) as BloqueRow[]).map((b) => ({
            position: b.orden,
            block_type: b.tipo_bloque,
            distance_m: b.distancia_m,
            duration_seconds: b.duracion_seg,
            elevation_m: b.elevacion_m,
            avg_hr: b.fc_media,
            max_hr: b.fc_max,
            calories: b.calorias,
          })),
          ...(running.data
            ? {
                running: {
                  avg_pace_seconds_per_km: running.data.ritmo_medio_seg_km,
                  avg_cadence_spm: running.data.cadencia_media_spm,
                  avg_stride_cm: running.data.zancada_media_cm,
                  elevation_gain_m: running.data.desnivel_positivo_m,
                },
              }
            : {}),
          ...(cycling.data
            ? {
                cycling: {
                  avg_power_w: cycling.data.potencia_media_w,
                  normalized_power_w: cycling.data.potencia_normalizada_w,
                  avg_cadence_rpm: cycling.data.cadencia_media_rpm,
                  elevation_gain_m: cycling.data.desnivel_positivo_m,
                  bike_type: cycling.data.tipo_bici,
                },
              }
            : {}),
        },
        { untrusted: true },
      );
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "log_cardio_session",
    {
      description:
        "Record a cardio session that already happened: discipline, start time and one or more blocks " +
        "with distance in meters, duration in seconds, elevation and heart rate. Optionally add " +
        "running or cycling specifics. Does not create GPS tracks — those come from recording in the " +
        "app. client_request_id makes retries safe: calling twice with the same value returns the " +
        "existing session. Cardio under 8 minutes counts for the streak but awards no XP. " +
        "Use list_cardio_sessions to see which discipline codes this user already uses.",
      inputSchema: z.object({
        discipline_code: z
          .string()
          .min(2)
          .max(40)
          .describe('Discipline code, e.g. "running", "cycling".'),
        title: z.string().min(1).max(120).optional(),
        start: z.string().datetime().describe("ISO-8601 UTC."),
        end: z.string().datetime().optional().describe("Defaults to start plus total block duration."),
        comments: z.string().max(2000).optional(),
        rpe: z.number().int().min(1).max(10).optional(),
        client_request_id: z.string().uuid(),
        blocks: z
          .array(
            z.object({
              block_type: z.enum(["warmup", "work", "recovery", "cooldown"]).default("work"),
              distance_m: z.number().int().min(0).max(500000).optional(),
              duration_seconds: z.number().int().min(0).max(86400).optional(),
              elevation_m: z.number().int().min(-1000).max(10000).optional(),
              avg_hr: z.number().int().min(30).max(230).optional(),
              max_hr: z.number().int().min(30).max(230).optional(),
              calories: z.number().int().min(0).max(20000).optional(),
            }),
          )
          .min(1)
          .max(50),
        running: z
          .object({
            avg_pace_seconds_per_km: z.number().int().min(60).max(3600).optional(),
            avg_cadence_spm: z.number().int().min(30).max(300).optional(),
            avg_stride_cm: z.number().int().min(20).max(300).optional(),
            elevation_gain_m: z.number().int().min(0).max(10000).optional(),
          })
          .optional(),
        cycling: z
          .object({
            avg_power_w: z.number().int().min(0).max(2000).optional(),
            normalized_power_w: z.number().int().min(0).max(2000).optional(),
            avg_cadence_rpm: z.number().int().min(10).max(250).optional(),
            elevation_gain_m: z.number().int().min(0).max(10000).optional(),
            bike_type: z.string().max(40).optional(),
          })
          .optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (args: {
      discipline_code: string;
      title?: string;
      start: string;
      end?: string;
      comments?: string;
      rpe?: number;
      client_request_id: string;
      blocks: BlockInput[];
      running?: RunningInput;
      cycling?: CyclingInput;
    }): Promise<ToolResult> => {
      const { data, error } = await supabase.rpc("log_cardio_session", {
        p_payload: {
          discipline_code: args.discipline_code,
          titulo: args.title ?? null,
          fecha_inicio: args.start,
          fecha_fin: args.end ?? null,
          comentarios: args.comments ?? null,
          rpe: args.rpe ?? null,
          idempotency_key: args.client_request_id,
          bloques: args.blocks.map((b) => ({
            tipo_bloque: b.block_type ?? "work",
            distancia_m: b.distance_m ?? null,
            duracion_seg: b.duration_seconds ?? null,
            elevacion_m: b.elevation_m ?? null,
            fc_media: b.avg_hr ?? null,
            fc_max: b.max_hr ?? null,
            calorias: b.calories ?? null,
          })),
          ...(args.running
            ? {
                running: {
                  ritmo_medio_seg_km: args.running.avg_pace_seconds_per_km ?? null,
                  cadencia_media_spm: args.running.avg_cadence_spm ?? null,
                  zancada_media_cm: args.running.avg_stride_cm ?? null,
                  desnivel_positivo_m: args.running.elevation_gain_m ?? null,
                },
              }
            : {}),
          ...(args.cycling
            ? {
                cycling: {
                  potencia_media_w: args.cycling.avg_power_w ?? null,
                  potencia_normalizada_w: args.cycling.normalized_power_w ?? null,
                  cadencia_media_rpm: args.cycling.avg_cadence_rpm ?? null,
                  desnivel_positivo_m: args.cycling.elevation_gain_m ?? null,
                  tipo_bici: args.cycling.bike_type ?? null,
                },
              }
            : {}),
        },
      });

      if (error) return failFromPostgrest(error);
      return ok(data as Record<string, unknown>, {
        notes: ["Achievements unlock next time the user opens the Track Gym app."],
      });
    },
  );
}
