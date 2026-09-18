/**
 * Esquemas de entrada compartidos por las herramientas de escritura.
 *
 * Los límites no son decorativos. Un modelo confunde libras con kilos, repite
 * una llamada tras un timeout o alucina un número redondo, y aquí es donde eso
 * se para antes de llegar a la base de datos. Los mismos topes están repetidos
 * como `RAISE` en las funciones SQL: zod protege del modelo, el SQL protege de
 * un fallo del propio servidor MCP.
 */

import { z } from "zod";
import { resolveExerciseRef, type ExerciseRef, type ResolvedExercise } from "./exercises.ts";
import { fail, type ToolResult } from "../lib/respond.ts";
import type { Supabase } from "./registry.ts";

/** Una serie tal como la manda el modelo. */
export const setInputSchema = z.object({
  reps: z.number().int().min(0).max(1000).default(0),
  weight_kg: z.number().min(0).max(500).default(0),
  duration_seconds: z.number().int().min(0).max(86400).optional(),
  pace_seconds_per_km: z.number().int().min(60).max(3600).optional(),
  rir: z.number().int().min(0).max(10).optional(),
  rest_seconds: z.number().int().min(0).max(600).optional(),
  set_type: z
    .enum(["calentamiento", "efectiva", "dropset", "amrap"])
    .default("efectiva")
    .describe("calentamiento = warm-up (excluded from volume and XP)."),
  target_reps_min: z.number().int().min(1).max(100).optional(),
  target_reps_max: z.number().int().min(1).max(100).optional(),
  target_rir: z.number().int().min(0).max(10).optional(),
  target_weight_kg: z.number().min(0).max(500).optional(),
});

/** Referencia a un ejercicio: id de catálogo, id propio o nombre a resolver. */
export const exerciseRefSchema = {
  tipo_ejercicio_id: z.string().uuid().optional(),
  usuario_ejercicio_id: z.string().uuid().optional(),
  name: z
    .string()
    .min(2)
    .max(80)
    .optional()
    .describe("Only if you have no ID. Rejected when it matches several exercises."),
};

export const exerciseInputSchema = z.object({
  ...exerciseRefSchema,
  logging_mode: z.enum(["peso_reps", "solo_reps", "duracion", "duracion_ritmo"]).optional(),
  rest_seconds: z.number().int().min(0).max(600).optional(),
  rep_range: z.string().max(20).optional(),
  target_rir: z.number().int().min(0).max(10).optional(),
  superset_id: z
    .string()
    .max(64)
    .optional()
    .describe("Same value on two exercises means they were performed as a superset."),
  sets: z.array(setInputSchema).min(1).max(30),
});

export const routineExerciseInputSchema = z.object({
  ...exerciseRefSchema,
  target_sets: z.number().int().min(1).max(30).default(3),
  reps_min: z.number().int().min(1).max(100).default(8),
  reps_max: z.number().int().min(1).max(100).default(12),
  rir: z.number().int().min(0).max(10).optional(),
  rest_seconds: z.number().int().min(0).max(600).optional(),
  logging_mode: z.enum(["peso_reps", "solo_reps", "duracion", "duracion_ritmo"]).optional(),
  superset_id: z.string().max(64).optional(),
  target_duration_seconds: z.number().int().min(1).max(86400).optional(),
  target_pace_seconds_per_km: z.number().int().min(60).max(3600).optional(),
  set_plan: z
    .array(
      z.object({
        set_type: z.enum(["calentamiento", "efectiva", "dropset", "amrap"]).default("efectiva"),
        reps_min: z.number().int().min(1).max(100).optional(),
        reps_max: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Omit for an open-ended range (shown as '8+' in the app)."),
        rir: z.number().int().min(0).max(10).optional(),
        target_weight_kg: z.number().min(0).max(500).optional(),
        rest_seconds: z.number().int().min(0).max(600).optional(),
        target_duration_seconds: z.number().int().min(1).max(86400).optional(),
        target_pace_seconds_per_km: z.number().int().min(60).max(3600).optional(),
      }),
    )
    .min(1)
    .max(30)
    .optional()
    .describe(
      "Per-set plan, for pyramids or warm-up sets. When present it is the source of truth and " +
        "the exercise-level targets are derived from it.",
    ),
});

export type ExerciseInput = z.infer<typeof exerciseInputSchema>;
export type RoutineExerciseInput = z.infer<typeof routineExerciseInputSchema>;

/** Tope de series por llamada, por encima del tope por ejercicio. */
export const MAX_SETS_PER_CALL = 300;

/**
 * Resuelve los ejercicios de una lista a ids reales. Se para en el primero que
 * falle: escribir media sesión y devolver un error dejaría al modelo sin saber
 * qué se guardó.
 */
export async function resolveAll(
  supabase: Supabase,
  entradas: ReadonlyArray<ExerciseRef>,
): Promise<{ resueltos: ResolvedExercise[] } | { error: ToolResult }> {
  const resueltos: ResolvedExercise[] = [];

  for (const [i, entrada] of entradas.entries()) {
    const res = await resolveExerciseRef(supabase, {
      tipo_ejercicio_id: entrada.tipo_ejercicio_id,
      usuario_ejercicio_id: entrada.usuario_ejercicio_id,
      name: entrada.name,
    });

    if ("error" in res) {
      // Se devuelve el error tal cual (trae los candidatos) diciendo en qué
      // posición ocurrió, para que el modelo corrija solo esa.
      const original = JSON.parse(res.error.content[0].text) as {
        error: Record<string, unknown>;
      };
      return {
        error: fail(
          String(original.error.code),
          `Exercise ${i + 1} of ${entradas.length}: ${original.error.message}`,
          original.error.hint as string | undefined,
          { position: i + 1, candidates: original.error.candidates },
        ),
      };
    }
    resueltos.push(res.resolved);
  }

  return { resueltos };
}

/** Comprueba el tope global de series de una llamada. */
export function tooManySets(ejercicios: ReadonlyArray<{ sets: unknown[] }>): ToolResult | null {
  const total = ejercicios.reduce((acc, e) => acc + e.sets.length, 0);
  if (total <= MAX_SETS_PER_CALL) return null;
  return fail(
    "TOO_MANY_SETS",
    `${total} sets in one call; the maximum is ${MAX_SETS_PER_CALL}.`,
    "Split the workout into separate calls, or check the numbers are right.",
  );
}
