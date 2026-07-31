import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchAllPages } from "@/lib/supabaseBatch";

interface ExerciseWithHistory {
  id: string;
  name: string;
  lastPerformed: string;
}

interface ExerciseHistoryPoint {
  date: string;
  oneRepMax: number;
  weight: number;
  reps: number;
}

interface ExerciseTypeReference {
  id: string;
  nombre: string;
}

interface ExerciseJoinRow {
  tipo_ejercicio: ExerciseTypeReference | null;
}

interface ExerciseWithHistoryQueryRow {
  created_at: string;
  ejercicio: ExerciseJoinRow | null;
}

function parseExerciseTypeReference(row: ExerciseWithHistoryQueryRow): ExerciseTypeReference | null {
  const tipo = row.ejercicio?.tipo_ejercicio;
  if (!tipo) return null;
  if (typeof tipo.id !== "string" || typeof tipo.nombre !== "string") {
    return null;
  }
  return { id: tipo.id, nombre: tipo.nombre };
}

// Returns exercises the user has performed at least once, ordered by most recent
export function useExerciseWithHistory() {
  const { user } = useAuth();

  return useQuery<ExerciseWithHistory[]>({
    queryKey: ["exercise-with-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get all series with exercise + tipo_ejercicio info
      const data = await fetchAllPages<ExerciseWithHistoryQueryRow>((from, to) =>
        supabase
          .from("serie")
          .select(`
          created_at,
          ejercicio!inner (
            actividad!inner ( fecha_fin ),
            tipo_ejercicio_id,
            tipo_ejercicio!inner ( id, nombre )
          )
        `)
          .eq("usuario_id", user!.id)
          .not("ejercicio.actividad.fecha_fin", "is", null)
          .order("created_at", { ascending: false })
          .range(from, to),
      );

      if (!data.length) return [];

      // Group by tipo_ejercicio_id, keep most recent date
      const map = new Map<string, ExerciseWithHistory>();
      for (const row of data as ExerciseWithHistoryQueryRow[]) {
        const tipo = parseExerciseTypeReference(row);
        if (!tipo) continue;
        if (!map.has(tipo.id)) {
          map.set(tipo.id, {
            id: tipo.id,
            name: tipo.nombre,
            lastPerformed: row.created_at,
          });
        }
      }

      return Array.from(map.values());
    },
  });
}

export type ExerciseProgressMetric = "1rm" | "reps";

export interface LastRecord {
  weight: number;
  reps: number;
  oneRepMax: number;
  date: string;
}

export interface ExerciseHistoryResult {
  history: ExerciseHistoryPoint[];
  lastRecord: LastRecord | null;
  /** "reps" si todo el historial ganador es a peso corporal (0 kg); si no, "1rm". */
  metric: ExerciseProgressMetric;
}

/** Progreso de una serie: 1RM Epley con carga, o max reps a peso corporal. */
export function estimateSetProgress(
  peso: number,
  reps: number,
): { value: number; metric: ExerciseProgressMetric } | null {
  const w = Number(peso);
  const r = Number(reps);
  if (!Number.isFinite(w) || !Number.isFinite(r) || r <= 0) return null;
  if (w > 0) {
    return { value: w * (1 + 0.0333 * r), metric: "1rm" };
  }
  return { value: r, metric: "reps" };
}

/**
 * Elige la mejor serie del día.
 * Si hay alguna con carga externa, gana el mayor 1RM; si no, el máximo de reps.
 */
export function pickBestSetOfDay(
  sets: { weight: number; reps: number }[],
): ExerciseHistoryPoint | null {
  let bestWeighted: { value: number; weight: number; reps: number } | null = null;
  let bestBodyweight: { value: number; weight: number; reps: number } | null = null;

  for (const set of sets) {
    const progress = estimateSetProgress(set.weight, set.reps);
    if (!progress) continue;
    if (progress.metric === "1rm") {
      if (!bestWeighted || progress.value > bestWeighted.value) {
        bestWeighted = { value: progress.value, weight: set.weight, reps: set.reps };
      }
    } else if (!bestBodyweight || progress.value > bestBodyweight.value) {
      bestBodyweight = { value: progress.value, weight: set.weight, reps: set.reps };
    }
  }

  const winner = bestWeighted ?? bestBodyweight;
  if (!winner) return null;
  return {
    date: "",
    oneRepMax: winner.value,
    weight: winner.weight,
    reps: winner.reps,
  };
}

export function deriveExerciseMetric(history: { weight: number }[]): ExerciseProgressMetric {
  if (!history.length) return "1rm";
  return history.every((p) => Number(p.weight) <= 0) ? "reps" : "1rm";
}

export const exerciseHistoryQueryKey = (exerciseId: string) => ["exercise-history", exerciseId] as const;

const EXERCISE_HISTORY_STALE_MS = 10 * 60 * 1000;

export async function fetchExerciseHistory(
  userId: string,
  exerciseId: string,
): Promise<ExerciseHistoryResult> {
  const data = await fetchAllPages<{
    ejercicio?: { actividad?: { fecha?: string } };
    created_at: string;
    peso_kg: number;
    repeticiones: number;
  }>((from, to) =>
    supabase
      .from("serie")
      .select(`
      peso_kg,
      repeticiones,
      created_at,
      ejercicio:ejercicio_id!inner (
         actividad:actividad_id!inner ( fecha, fecha_fin )
      )
    `)
      .eq("usuario_id", userId)
      .eq("ejercicio.tipo_ejercicio_id", exerciseId)
      .not("ejercicio.actividad.fecha_fin", "is", null)
      .order("created_at", { ascending: true })
      .range(from, to),
  );

  const setsByDay = new Map<string, { weight: number; reps: number }[]>();

  data.forEach((item) => {
    const dateStr = item.ejercicio?.actividad?.fecha || item.created_at;
    const dateKey = new Date(dateStr).toISOString().split("T")[0];
    const peso = Number(item.peso_kg);
    const repes = Number(item.repeticiones);
    const list = setsByDay.get(dateKey) ?? [];
    list.push({ weight: peso, reps: repes });
    setsByDay.set(dateKey, list);
  });

  const history: ExerciseHistoryPoint[] = [];
  for (const [dateKey, sets] of setsByDay) {
    const best = pickBestSetOfDay(sets);
    if (!best) continue;
    history.push({ ...best, date: dateKey });
  }

  history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    history,
    lastRecord: history.length > 0 ? history[history.length - 1] : null,
    metric: deriveExerciseMetric(history),
  };
}

export function exerciseHistoryQueryOptions(userId: string, exerciseId: string) {
  return {
    queryKey: exerciseHistoryQueryKey(exerciseId),
    queryFn: () => fetchExerciseHistory(userId, exerciseId),
    staleTime: EXERCISE_HISTORY_STALE_MS,
  } as const;
}

// Returns daily best estimated 1RM for a specific exercise type
export function useExerciseHistory(exerciseId: string | null) {
  const { user } = useAuth();

  return useQuery({
    ...exerciseHistoryQueryOptions(user!.id, exerciseId!),
    enabled: !!user && !!exerciseId,
  });
}
