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
            tipo_ejercicio_id,
            tipo_ejercicio!inner ( id, nombre )
          )
        `)
          .eq("usuario_id", user!.id)
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

export interface LastRecord {
  weight: number;
  reps: number;
  oneRepMax: number;
  date: string;
}

export interface ExerciseHistoryResult {
  history: ExerciseHistoryPoint[];
  lastRecord: LastRecord | null;
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
         actividad:actividad_id ( fecha )
      )
    `)
      .eq("usuario_id", userId)
      .eq("ejercicio.tipo_ejercicio_id", exerciseId)
      .order("created_at", { ascending: true })
      .range(from, to),
  );

  const sessionsMap = new Map<string, ExerciseHistoryPoint>();

  data.forEach((item) => {
    const dateStr = item.ejercicio?.actividad?.fecha || item.created_at;
    const dateKey = new Date(dateStr).toISOString().split("T")[0];

    const peso = Number(item.peso_kg);
    const repes = Number(item.repeticiones);
    const estimated1RM = peso * (1 + 0.0333 * repes);

    if (!sessionsMap.has(dateKey)) {
      sessionsMap.set(dateKey, {
        date: dateKey,
        oneRepMax: estimated1RM,
        weight: peso,
        reps: repes,
      });
    } else {
      const current = sessionsMap.get(dateKey)!;
      if (estimated1RM > current.oneRepMax) {
        current.oneRepMax = estimated1RM;
        current.weight = peso;
        current.reps = repes;
      }
    }
  });

  const history = Array.from(sessionsMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return {
    history,
    lastRecord: history.length > 0 ? history[history.length - 1] : null,
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
