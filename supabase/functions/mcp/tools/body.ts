/**
 * Medidas corporales y registro diario de salud.
 *
 * Dos tablas con propósitos distintos: `medidas` son circunferencias y peso, que
 * se toman de vez en cuando; `salud_diaria` es el parte del día (sueño, pulso en
 * reposo, calorías). Se exponen juntas porque las preguntas que las usan también
 * van juntas: «¿he bajado de peso este mes y cómo he dormido?».
 *
 * Las fotos de progreso (`foto_frontal`, `foto_espalda`) no salen de aquí: son
 * rutas a un bucket privado y no hay ninguna pregunta razonable que las
 * necesite en una conversación de texto.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { ok, fail, failFromPostgrest, type ToolResult } from "../lib/respond.ts";
import { clamp, rangeDays } from "../lib/limits.ts";
import { userText } from "../lib/untrusted.ts";
import type { Database } from "../database.types.ts";
import type { Supabase } from "./registry.ts";

/** Más ancho que el resto: son una fila por día y se leen como serie temporal. */
const MAX_RANGE_DAYS_HEALTH = 400;

export function registerBodyTools(server: McpServer, supabase: Supabase): void {
  server.registerTool(
    "get_health_log",
    {
      description:
        "Body measurements and daily health entries over a date range, oldest first, so trends read " +
        "directly. Measurements: weight in kg, body fat percentage and chest/waist/arm/leg in cm. " +
        "Daily entries: sleep in minutes, sleep quality 1-5, resting heart rate in bpm and calories. " +
        "Days with no entry are simply absent.",
      inputSchema: z.object({
        from: z.string().date(),
        to: z.string().date(),
        include: z.enum(["measurements", "daily", "both"]).default("both"),
        limit: z.number().int().min(1).max(200).default(60),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args: {
      from: string;
      to: string;
      include?: "measurements" | "daily" | "both";
      limit?: number;
    }): Promise<ToolResult> => {
      const dias = rangeDays(args.from, args.to);
      if (!Number.isFinite(dias) || dias <= 0) {
        return fail("INVALID_RANGE", "`to` must be the same day as `from` or later.");
      }
      if (dias > MAX_RANGE_DAYS_HEALTH) {
        return fail(
          "RANGE_TOO_LARGE",
          `The range covers ${dias} days; the maximum is ${MAX_RANGE_DAYS_HEALTH}.`,
          "Ask for a shorter range.",
        );
      }

      const include = args.include ?? "both";
      const limit = clamp(args.limit ?? 60, 1, 200);

      const quiereMedidas = include === "measurements" || include === "both";
      const quiereDiario = include === "daily" || include === "both";

      const [medidas, diario] = await Promise.all([
        quiereMedidas
          ? supabase
              .from("medidas")
              .select("fecha, peso, grasa, pecho, cintura, brazo, pierna, notas")
              .gte("fecha", args.from)
              .lte("fecha", args.to)
              .order("fecha", { ascending: true })
              .limit(limit)
          : Promise.resolve({ data: null, error: null }),
        quiereDiario
          ? supabase
              .from("salud_diaria")
              .select("fecha, sueno_min, calidad_sueno, fc_reposo, calorias, notas")
              .gte("fecha", args.from)
              .lte("fecha", args.to)
              .order("fecha", { ascending: true })
              .limit(limit)
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (medidas.error) return failFromPostgrest(medidas.error);
      if (diario.error) return failFromPostgrest(diario.error);

      return ok(
        {
          ...(quiereMedidas
            ? {
                measurements: (medidas.data ?? []).map((m) => ({
                  date: m.fecha,
                  weight_kg: m.peso,
                  body_fat_pct: m.grasa,
                  chest_cm: m.pecho,
                  waist_cm: m.cintura,
                  arm_cm: m.brazo,
                  leg_cm: m.pierna,
                  notes: userText(m.notas),
                })),
              }
            : {}),
          ...(quiereDiario
            ? {
                daily: (diario.data ?? []).map((d) => ({
                  date: d.fecha,
                  sleep_minutes: d.sueno_min,
                  sleep_quality: d.calidad_sueno,
                  resting_hr: d.fc_reposo,
                  calories: d.calorias,
                  notes: userText(d.notas),
                })),
              }
            : {}),
        },
        { untrusted: true },
      );
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "log_measurement",
    {
      description:
        "Record body measurements for a date: weight in kg, body fat percentage and chest/waist/arm/" +
        "leg circumference in cm. One entry per date: sending a date that already exists updates it " +
        "instead of duplicating, so this is safe to retry. Only the fields you send are written.",
      inputSchema: z.object({
        date: z.string().date(),
        weight_kg: z.number().min(20).max(400).optional(),
        body_fat_pct: z.number().min(1).max(70).optional(),
        chest_cm: z.number().min(1).max(300).optional(),
        waist_cm: z.number().min(1).max(300).optional(),
        arm_cm: z.number().min(1).max(300).optional(),
        leg_cm: z.number().min(1).max(300).optional(),
        notes: z.string().max(1000).optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (args: {
      date: string;
      weight_kg?: number;
      body_fat_pct?: number;
      chest_cm?: number;
      waist_cm?: number;
      arm_cm?: number;
      leg_cm?: number;
      notes?: string;
    }): Promise<ToolResult> => {
      const { data: usuario } = await supabase.auth.getUser();
      const usuarioId = usuario?.user?.id;
      if (!usuarioId) return fail("UNAUTHENTICATED", "No user session.");

      const fila: Database["public"]["Tables"]["medidas"]["Insert"] = {
        usuario_id: usuarioId,
        fecha: args.date,
      };
      if (args.weight_kg !== undefined) fila.peso = args.weight_kg;
      if (args.body_fat_pct !== undefined) fila.grasa = args.body_fat_pct;
      if (args.chest_cm !== undefined) fila.pecho = args.chest_cm;
      if (args.waist_cm !== undefined) fila.cintura = args.waist_cm;
      if (args.arm_cm !== undefined) fila.brazo = args.arm_cm;
      if (args.leg_cm !== undefined) fila.pierna = args.leg_cm;
      if (args.notes !== undefined) fila.notas = args.notes;

      if (Object.keys(fila).length === 2) {
        return fail("NOTHING_TO_LOG", "Provide at least one measurement besides the date.");
      }

      // El índice único (usuario_id, fecha) lo añade la migración 20260918100000;
      // sin él este upsert insertaría duplicados en vez de actualizar.
      const { data, error } = await supabase
        .from("medidas")
        .upsert(fila, { onConflict: "usuario_id,fecha" })
        .select("fecha, peso, grasa, pecho, cintura, brazo, pierna")
        .maybeSingle();

      if (error) return failFromPostgrest(error);

      return ok({
        date: data?.fecha,
        weight_kg: data?.peso,
        body_fat_pct: data?.grasa,
        chest_cm: data?.pecho,
        waist_cm: data?.cintura,
        arm_cm: data?.brazo,
        leg_cm: data?.pierna,
      });
    },
  );

  // -------------------------------------------------------------------------
  server.registerTool(
    "log_daily_health",
    {
      description:
        "Record the daily health entry: sleep in minutes, sleep quality 1-5, resting heart rate in " +
        "bpm, calories and notes. One row per day — sending a date that already exists overwrites the " +
        "fields you provide, so this is safe to retry.",
      inputSchema: z.object({
        date: z.string().date(),
        sleep_minutes: z.number().int().min(0).max(1440).optional(),
        sleep_quality: z.number().int().min(1).max(5).optional(),
        resting_hr: z.number().int().min(25).max(150).optional(),
        calories: z.number().int().min(0).max(15000).optional(),
        notes: z.string().max(1000).optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (args: {
      date: string;
      sleep_minutes?: number;
      sleep_quality?: number;
      resting_hr?: number;
      calories?: number;
      notes?: string;
    }): Promise<ToolResult> => {
      const { data: usuario } = await supabase.auth.getUser();
      const usuarioId = usuario?.user?.id;
      if (!usuarioId) return fail("UNAUTHENTICATED", "No user session.");

      const fila: Database["public"]["Tables"]["salud_diaria"]["Insert"] = {
        usuario_id: usuarioId,
        fecha: args.date,
      };
      if (args.sleep_minutes !== undefined) fila.sueno_min = args.sleep_minutes;
      if (args.sleep_quality !== undefined) fila.calidad_sueno = args.sleep_quality;
      if (args.resting_hr !== undefined) fila.fc_reposo = args.resting_hr;
      if (args.calories !== undefined) fila.calorias = args.calories;
      if (args.notes !== undefined) fila.notas = args.notes;

      if (Object.keys(fila).length === 2) {
        return fail("NOTHING_TO_LOG", "Provide at least one value besides the date.");
      }

      const { data, error } = await supabase
        .from("salud_diaria")
        .upsert(fila, { onConflict: "usuario_id,fecha" })
        .select("fecha, sueno_min, calidad_sueno, fc_reposo, calorias")
        .maybeSingle();

      if (error) return failFromPostgrest(error);

      return ok({
        date: data?.fecha,
        sleep_minutes: data?.sueno_min,
        sleep_quality: data?.calidad_sueno,
        resting_hr: data?.fc_reposo,
        calories: data?.calorias,
      });
    },
  );
}
