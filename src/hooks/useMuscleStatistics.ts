import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { MUSCLE_GROUPS, type MainMuscleGroup } from "@/constants/muscleGroups";

function getMainGroup(muscle: string): MainMuscleGroup | null {
  for (const [group, muscles] of Object.entries(MUSCLE_GROUPS)) {
    if ((muscles as readonly string[]).includes(muscle)) {
      return group as MainMuscleGroup;
    }
  }
  return null;
}

export interface MuscleStatistics {
  mainGroupCounts: Record<MainMuscleGroup, number>;
  subGroupCounts: Record<MainMuscleGroup, Record<string, number>>;
  topGroups: { group: MainMuscleGroup; count: number }[];
  bottomGroups: { group: MainMuscleGroup; count: number }[];
}

export function useMuscleStatistics() {
  const { user } = useAuth();

  return useQuery<MuscleStatistics>({
    queryKey: ["muscleStatistics", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Initialize all groups to 0
      const mainGroupCounts = {} as Record<MainMuscleGroup, number>;
      const subGroupCounts = {} as Record<MainMuscleGroup, Record<string, number>>;

      for (const [group, muscles] of Object.entries(MUSCLE_GROUPS)) {
        const g = group as MainMuscleGroup;
        mainGroupCounts[g] = 0;
        subGroupCounts[g] = {};
        for (const m of muscles) {
          subGroupCounts[g][m] = 0;
        }
      }

      // Fetch all exercises with body_part
      const { data: ejercicios, error: ejErr } = await supabase
        .from("ejercicio")
        .select("id, tipo_ejercicio:tipo_ejercicio_id(body_part)")
        .eq("usuario_id", user!.id);

      if (ejErr) throw ejErr;
      if (!ejercicios?.length) {
        return buildResult(mainGroupCounts, subGroupCounts);
      }

      const ejercicioIds = ejercicios.map((e) => e.id);

      // Fetch completed sets — batch in chunks of 200 to avoid URI limits
      const allSeries: { ejercicio_id: string }[] = [];
      for (let i = 0; i < ejercicioIds.length; i += 200) {
        const chunk = ejercicioIds.slice(i, i + 200);
        const { data, error } = await supabase
          .from("serie")
          .select("ejercicio_id")
          .in("ejercicio_id", chunk)
          .eq("completed", true);
        if (error) throw error;
        if (data) allSeries.push(...data);
      }

      // Count sets per exercise
      const setCountMap: Record<string, number> = {};
      for (const s of allSeries) {
        setCountMap[s.ejercicio_id] = (setCountMap[s.ejercicio_id] || 0) + 1;
      }

      // Aggregate
      for (const ej of ejercicios) {
        const sets = setCountMap[ej.id] || 0;
        if (sets === 0) continue;
        const bodyParts: string[] = (ej.tipo_ejercicio as any)?.body_part || [];
        for (const muscle of bodyParts) {
          const group = getMainGroup(muscle);
          if (group) {
            mainGroupCounts[group] += sets;
            if (subGroupCounts[group][muscle] !== undefined) {
              subGroupCounts[group][muscle] += sets;
            }
          }
        }
      }

      return buildResult(mainGroupCounts, subGroupCounts);
    },
  });
}

function buildResult(
  mainGroupCounts: Record<MainMuscleGroup, number>,
  subGroupCounts: Record<MainMuscleGroup, Record<string, number>>
): MuscleStatistics {
  const sorted = Object.entries(mainGroupCounts)
    .map(([group, count]) => ({ group: group as MainMuscleGroup, count }))
    .sort((a, b) => b.count - a.count);

  return {
    mainGroupCounts,
    subGroupCounts,
    topGroups: sorted.slice(0, 5),
    bottomGroups: [...sorted].reverse().slice(0, 5),
  };
}
