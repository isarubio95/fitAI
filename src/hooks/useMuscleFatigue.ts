import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { chunkIds, fetchAllPages } from "@/lib/supabaseBatch";
import { setHasWork } from "@/types/workout";
import type { MainMuscleGroup } from "@/constants/muscleGroups";
import {
  estimatedDaysToBaseline,
  localImpulseFromSet,
  localMuscleFatigueSeries,
} from "@/lib/trainingLoad";

export type MuscleFatiguePeriod = "week" | "month";

export interface MuscleFatigueData {
  /** Fatiga actual por grupo (último día de la serie). */
  groupFatigue: Record<string, number>;
  /** Días estimados a baseline por grupo. */
  daysToBaseline: Record<string, number>;
  maxGroupFatigue: number;
  /** Serie de fatiga por grupo: un valor por cada día de `dayKeys`. */
  fatigueSeries: Record<string, number[]>;
  /** Último día con impulso (`yyyy-MM-dd`) por grupo. */
  lastTrainedAt: Record<string, string | null>;
  /** Eje temporal compartido por todas las series. */
  dayKeys: string[];
}

function normalizeExerciseType(value: unknown): {
  musculos_involucrados: string[];
  grupo_muscular: string | null;
} {
  if (!value || typeof value !== "object") {
    return { musculos_involucrados: [], grupo_muscular: null };
  }
  const candidate = value as {
    musculos_involucrados?: unknown;
    grupo_muscular?: unknown;
  };
  return {
    musculos_involucrados: Array.isArray(candidate.musculos_involucrados)
      ? candidate.musculos_involucrados.filter((m): m is string => typeof m === "string")
      : [],
    grupo_muscular: typeof candidate.grupo_muscular === "string" ? candidate.grupo_muscular : null,
  };
}

export function useMuscleFatigue(period: MuscleFatiguePeriod = "week") {
  const { user } = useAuth();

  const bounds = useMemo(() => {
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(end, 28));
    return { start, end };
  }, []);

  return useQuery<MuscleFatigueData>({
    queryKey: ["muscleFatigue", user?.id, period, bounds.start.toISOString()],
    enabled: !!user,
    queryFn: async () => {
      const fromIso = bounds.start.toISOString();
      const toIso = bounds.end.toISOString();

      const { data: medida } = await supabase
        .from("medidas")
        .select("peso")
        .eq("usuario_id", user!.id)
        .not("peso", "is", null)
        .order("fecha", { ascending: false })
        .limit(1)
        .maybeSingle();
      const bodyWeightKg = medida?.peso != null ? Number(medida.peso) : null;

      const actividades = await fetchAllPages<{ id: string; fecha: string }>((from, to) =>
        supabase
          .from("actividad")
          .select("id, fecha")
          .eq("usuario_id", user!.id)
          .not("fecha_fin", "is", null)
          .gte("fecha", fromIso)
          .lte("fecha", toIso)
          .order("fecha", { ascending: true })
          .range(from, to),
      );

      const dayKeys = eachDayOfInterval({ start: bounds.start, end: bounds.end }).map((d) =>
        format(d, "yyyy-MM-dd"),
      );
      const impulseByDayGroup: Record<string, Partial<Record<MainMuscleGroup, number>>> = {};
      for (const key of dayKeys) impulseByDayGroup[key] = {};

      if (actividades.length > 0) {
        const activityDateById = new Map(actividades.map((a) => [a.id, a.fecha]));
        const ejercicios: {
          id: string;
          actividad_id: string;
          tipo_ejercicio: unknown;
        }[] = [];

        for (const chunk of chunkIds(actividades.map((a) => a.id))) {
          const { data, error } = await supabase
            .from("ejercicio")
            .select("id, actividad_id, tipo_ejercicio:tipo_ejercicio_id(musculos_involucrados, grupo_muscular)")
            .in("actividad_id", chunk);
          if (error) throw error;
          if (data?.length) ejercicios.push(...data);
        }

        const exerciseMeta = new Map(
          ejercicios.map((e) => [
            e.id,
            {
              actividad_id: e.actividad_id,
              involvement: normalizeExerciseType(e.tipo_ejercicio),
            },
          ]),
        );

        if (ejercicios.length > 0) {
          const series: {
            ejercicio_id: string;
            repeticiones: number | null;
            peso_kg: number | null;
            duracion_seg: number | null;
            ritmo_seg_km: number | null;
            rir: number | null;
          }[] = [];

          for (const chunk of chunkIds(ejercicios.map((e) => e.id))) {
            const chunkSeries = await fetchAllPages<{
              ejercicio_id: string;
              repeticiones: number | null;
              peso_kg: number | null;
              duracion_seg: number | null;
              ritmo_seg_km: number | null;
              rir: number | null;
            }>((from, to) =>
              supabase
                .from("serie")
                .select("ejercicio_id, repeticiones, peso_kg, duracion_seg, ritmo_seg_km, rir")
                .in("ejercicio_id", chunk)
                .range(from, to),
            );
            series.push(...chunkSeries);
          }

          for (const s of series) {
            if (!setHasWork(s)) continue;
            const meta = exerciseMeta.get(s.ejercicio_id);
            if (!meta) continue;
            const activityDate = activityDateById.get(meta.actividad_id);
            if (!activityDate) continue;
            const dateKey = format(new Date(activityDate), "yyyy-MM-dd");
            const dist = localImpulseFromSet(
              {
                repeticiones: s.repeticiones,
                peso_kg: s.peso_kg,
                duracion_seg: s.duracion_seg,
                rir: s.rir,
              },
              meta.involvement,
              bodyWeightKg,
            );
            const dayBucket = impulseByDayGroup[dateKey] ?? (impulseByDayGroup[dateKey] = {});
            for (const [group, value] of Object.entries(dist) as [MainMuscleGroup, number][]) {
              dayBucket[group] = (dayBucket[group] ?? 0) + value;
            }
          }
        }
      }

      const groups = new Set<MainMuscleGroup>();
      for (const day of Object.values(impulseByDayGroup)) {
        for (const g of Object.keys(day) as MainMuscleGroup[]) groups.add(g);
      }

      const groupFatigue: Record<string, number> = {};
      const daysToBaseline: Record<string, number> = {};
      const fatigueSeries: Record<string, number[]> = {};
      const lastTrainedAt: Record<string, string | null> = {};
      let maxGroupFatigue = 0;

      for (const group of groups) {
        const impulses = dayKeys.map((k) => impulseByDayGroup[k]?.[group] ?? 0);
        const series = localMuscleFatigueSeries(impulses);
        const current = series[series.length - 1] ?? 0;
        groupFatigue[group] = current;
        daysToBaseline[group] = estimatedDaysToBaseline(current);
        fatigueSeries[group] = series;
        // Último día con trabajo real: recorre hacia atrás y se queda con el primero que encuentra.
        let last: string | null = null;
        for (let i = impulses.length - 1; i >= 0; i -= 1) {
          if (impulses[i] > 0) {
            last = dayKeys[i];
            break;
          }
        }
        lastTrainedAt[group] = last;
        if (current > maxGroupFatigue) maxGroupFatigue = current;
      }

      return { groupFatigue, daysToBaseline, maxGroupFatigue, fatigueSeries, lastTrainedAt, dayKeys };
    },
  });
}
