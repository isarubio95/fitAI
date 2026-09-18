/**
 * Registro de herramientas. Añadir una es crear (o ampliar) un módulo de este
 * directorio y listarlo aquí: `index.ts` no se toca.
 *
 * Presupuesto de contexto: cada herramienta cuesta ~120-200 tokens de esquema en
 * CADA turno del modelo, así que el catálogo se mantiene deliberadamente corto.
 * Antes de añadir una, mirar si encaja como parámetro de una existente.
 */

import type { McpServer } from "@modelcontextprotocol/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types.ts";

import { registerExerciseTools } from "./exercises.ts";
import { registerWorkoutTools } from "./workouts.ts";
import { registerRoutineTools } from "./routines.ts";
import { registerCardioTools } from "./cardio.ts";
import { registerBodyTools } from "./body.ts";

export type Supabase = SupabaseClient<Database>;

export type ToolModule = (server: McpServer, supabase: Supabase) => void;

const MODULES: ToolModule[] = [
  registerExerciseTools,
  registerWorkoutTools,
  registerRoutineTools,
  registerCardioTools,
  registerBodyTools,
];

export function registerAllTools(server: McpServer, supabase: Supabase): void {
  for (const registrar of MODULES) registrar(server, supabase);
}
