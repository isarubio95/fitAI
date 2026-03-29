import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { MUSCLE_GROUPS, type MainMuscleGroup, type SpecificMuscle } from "@/constants/muscleGroups";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks } from "date-fns";

export type TimePeriod = "week" | "month";

/** Maps a specific muscle name back to its MainMuscleGroup */
function getMainGroup(muscle: string): MainMuscleGroup | null {
  for (const [group, muscles] of Object.entries(MUSCLE_GROUPS)) {
    if ((muscles as readonly string[]).includes(muscle)) {
      return group as MainMuscleGroup;
    }
  }
  return null;
}

export interface MuscleVolumeData {
  /** Sets per MainMuscleGroup */
  groupVolume: Record<string, number>;
  /** Sets per specific muscle */
  specificVolume: Record<string, number>;
  maxGroupVolume: number;
}

export function useMuscleVolume(period: TimePeriod = "week") {
  const { user } = useAuth();

  const { from, to } = useMemo(() => {
    const now = new Date();
    if (period === "week") {
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
        to: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      };
    }
    return {
      from: startOfMonth(now).toISOString(),
      to: endOfMonth(now).toISOString(),
    };
  }, [period]);

  return useQuery<MuscleVolumeData>({
    queryKey: ["muscleVolume", user?.id, period, from],
    enabled: !!user,
    queryFn: async () => {
      // Get all activities in the period
      const { data: actividades, error: actErr } = await supabase
        .from("actividad")
        .select("id")
        .eq("usuario_id", user!.id)
        .gte("fecha", from)
        .lte("fecha", to);

      if (actErr) throw actErr;
      if (!actividades?.length) {
        return { groupVolume: {}, specificVolume: {}, maxGroupVolume: 0 };
      }

      const actIds = actividades.map((a) => a.id);

      // Get exercises with their tipo_ejercicio (for body_part)
      const { data: ejercicios, error: ejErr } = await supabase
        .from("ejercicio")
        .select("id, tipo_ejercicio:tipo_ejercicio_id(musculos_involucrados)")
        .in("actividad_id", actIds);

      if (ejErr) throw ejErr;
      if (!ejercicios?.length) {
        return { groupVolume: {}, specificVolume: {}, maxGroupVolume: 0 };
      }

      const ejercicioIds = ejercicios.map((e) => e.id);

      // Contar series con datos (marcadas completadas O con reps/peso): así el mapa refleja lo que realmente hiciste
      const { data: series, error: sErr } = await supabase
        .from("serie")
        .select("ejercicio_id, repeticiones, peso_kg, duracion_seg, ritmo_seg_km, completed")
        .in("ejercicio_id", ejercicioIds);

      if (sErr) throw sErr;

      const setCountMap: Record<string, number> = {};
      for (const s of series || []) {
        const hasData =
          Number(s.repeticiones) > 0 ||
          Number(s.peso_kg) > 0 ||
          Number((s as { duracion_seg?: number | null }).duracion_seg ?? 0) > 0 ||
          Number((s as { ritmo_seg_km?: number | null }).ritmo_seg_km ?? 0) > 0;
        if (s.completed || hasData) {
          setCountMap[s.ejercicio_id] = (setCountMap[s.ejercicio_id] || 0) + 1;
        }
      }

      // Aggregate volume per specific muscle & group
      const specificVolume: Record<string, number> = {};
      const groupVolume: Record<string, number> = {};

      for (const ej of ejercicios) {
        const sets = setCountMap[ej.id] || 0;
        if (sets === 0) continue;

        const bodyParts: string[] = (ej.tipo_ejercicio as any)?.musculos_involucrados || [];
        for (const muscle of bodyParts) {
          specificVolume[muscle] = (specificVolume[muscle] || 0) + sets;
          const group = getMainGroup(muscle);
          if (group) {
            groupVolume[group] = (groupVolume[group] || 0) + sets;
          }
        }
      }

      const maxGroupVolume = Math.max(0, ...Object.values(groupVolume));

      return { groupVolume, specificVolume, maxGroupVolume };
    },
  });
}
