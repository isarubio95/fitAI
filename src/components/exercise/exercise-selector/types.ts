import type { ExerciseFavoriteSource } from "@/hooks/useExerciseFavorites";

/** Fila del catálogo (sistema + ejercicios del usuario) tal como la usa el selector. */
export type SelectorExercise = {
  id: string;
  nombre: string;
  usuario_id?: string | null;
  registro_series?: string | null;
  __source?: "catalogo" | "usuario";
  imagen?: string | null;
  gif_url?: string | null;
  body_part?: string | string[] | null;
  equipment?: string | null;
  instructions?: string[] | null;
  tipo?: string | null;
  grupo_muscular?: string | null;
  dificultad?: string | null;
  musculos_involucrados?: string[] | null;
};

export type ExerciseSortMode = "usados" | "recientes" | "az";

/** Texto que acompaña a "Ordenado por:". */
export const EXERCISE_SORT_LABELS: Record<ExerciseSortMode, string> = {
  usados: "más usados",
  recientes: "más recientes",
  az: "nombre (A-Z)",
};

export function exerciseSource(ex: SelectorExercise): ExerciseFavoriteSource {
  if (ex.__source === "usuario" || ex.__source === "catalogo") return ex.__source;
  return ex.usuario_id ? "usuario" : "catalogo";
}

/** Clave estable `catalogo:id` / `usuario:id`, compartida con favoritos y uso. */
export function exerciseKey(ex: SelectorExercise): string {
  return `${exerciseSource(ex)}:${ex.id}`;
}
