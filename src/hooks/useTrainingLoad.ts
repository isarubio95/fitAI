import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { chunkIds, fetchAllPages } from "@/lib/supabaseBatch";
import { setHasWork } from "@/types/workout";

const LOOKBACK_DAYS = 400;
const DEFAULT_BODYWEIGHT_SET_LOAD = 20;
const CARDIO_PER_MINUTE_FACTOR = 8;
const FATIGUE_DECAY_FACTOR = 0.94;
const FATIGUE_DAILY_GAIN = 16;
const FATIGUE_MAX_DAILY_RATIO = 2.5;

function alphaForDays(days: number) {
  return 2 / (days + 1);
}

function computeEma(values: number[], periodDays: number): number[] {
  if (!values.length) return [];
  const alpha = alphaForDays(periodDays);
  const out: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    out.push(alpha * values[i] + (1 - alpha) * out[i - 1]);
  }
  return out;
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const clamped = Math.max(0, Math.min(1, p));
  const idx = (sorted.length - 1) * clamped;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const weight = idx - lo;
  return sorted[lo] * (1 - weight) + sorted[hi] * weight;
}

export interface TrainingLoadPoint {
  date: string;
  load: number;
  fatigueScore: number;
  fatigueTrend: number;
}

export interface TrainingLoadData {
  points: TrainingLoadPoint[];
  totals: {
    fatigueScore: number;
    fatigueTrend: number;
  };
}

export function useTrainingLoad() {
  const { user } = useAuth();

  const bounds = useMemo(() => {
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(end, LOOKBACK_DAYS - 1));
    return { start, end };
  }, []);

  return useQuery<TrainingLoadData>({
    queryKey: ["trainingLoad", user?.id, bounds.start.toISOString(), bounds.end.toISOString()],
    enabled: !!user,
    queryFn: async () => {
      const fromIso = bounds.start.toISOString();
      const toIso = bounds.end.toISOString();

      const actividades = await fetchAllPages<{ id: string; fecha: string }>((from, to) =>
        supabase
          .from("actividad")
          .select("id, fecha")
          .eq("usuario_id", user!.id)
          .gte("fecha", fromIso)
          .lte("fecha", toIso)
          .order("fecha", { ascending: true })
          .range(from, to),
      );

      const activityIds = actividades.map((a) => a.id);
      const activityDateById = new Map(actividades.map((a) => [a.id, a.fecha]));

      const loadByDay: Record<string, number> = {};

      if (activityIds.length > 0) {
        const ejercicios: { id: string; actividad_id: string }[] = [];
        for (const chunk of chunkIds(activityIds)) {
          const { data, error: ejErr } = await supabase
            .from("ejercicio")
            .select("id, actividad_id")
            .in("actividad_id", chunk);
          if (ejErr) throw ejErr;
          if (data?.length) ejercicios.push(...data);
        }

        const exerciseIds = ejercicios.map((e) => e.id);
        const activityByExerciseId = new Map(ejercicios.map((e) => [e.id, e.actividad_id]));

        if (exerciseIds.length > 0) {
          const series: {
            ejercicio_id: string;
            repeticiones: number | null;
            peso_kg: number | null;
            duracion_seg: number | null;
            ritmo_seg_km: number | null;
            completed: boolean | null;
          }[] = [];
          for (const chunk of chunkIds(exerciseIds)) {
            const chunkSeries = await fetchAllPages<{
              ejercicio_id: string;
              repeticiones: number | null;
              peso_kg: number | null;
              duracion_seg: number | null;
              ritmo_seg_km: number | null;
              completed: boolean | null;
            }>((from, to) =>
              supabase
                .from("serie")
                .select("ejercicio_id, repeticiones, peso_kg, duracion_seg, ritmo_seg_km, completed")
                .in("ejercicio_id", chunk)
                .range(from, to),
            );
            series.push(...chunkSeries);
          }

          for (const s of series) {
            const exerciseId = s.ejercicio_id;
            const activityId = activityByExerciseId.get(exerciseId);
            const activityDate = activityId ? activityDateById.get(activityId) : null;
            if (!activityDate) continue;
            if (!setHasWork(s)) continue;

            const dateKey = format(new Date(activityDate), "yyyy-MM-dd");
            const reps = Number(s.repeticiones ?? 0);
            const weight = Number(s.peso_kg ?? 0);
            const hasWeightReps = reps > 0 && weight > 0;
            const setLoad = hasWeightReps ? reps * weight : DEFAULT_BODYWEIGHT_SET_LOAD;
            loadByDay[dateKey] = (loadByDay[dateKey] ?? 0) + setLoad;
          }
        }
      }

      const sessions = await fetchAllPages<{ id: string; fecha_inicio: string }>((from, to) =>
        supabase
          .from("cardio_sesion")
          .select("id, fecha_inicio")
          .eq("usuario_id", user!.id)
          .not("fecha_fin", "is", null)
          .gte("fecha_inicio", fromIso)
          .lte("fecha_inicio", toIso)
          .order("fecha_inicio", { ascending: true })
          .range(from, to),
      );

      const sessionIds = sessions.map((s) => s.id);
      if (sessionIds.length > 0) {
        const sessionDateById = new Map(sessions.map((s) => [s.id, s.fecha_inicio]));
        const blocks: { cardio_sesion_id: string; duracion_seg: number | null }[] = [];
        for (const chunk of chunkIds(sessionIds)) {
          const { data, error: blkErr } = await supabase
            .from("cardio_bloque")
            .select("cardio_sesion_id, duracion_seg")
            .in("cardio_sesion_id", chunk);
          if (blkErr) throw blkErr;
          if (data?.length) blocks.push(...data);
        }

        for (const b of blocks) {
          const sessionDate = sessionDateById.get(b.cardio_sesion_id);
          if (!sessionDate) continue;
          const minutes = Number(b.duracion_seg ?? 0) / 60;
          if (minutes <= 0) continue;
          const cardioLoad = minutes * CARDIO_PER_MINUTE_FACTOR;
          const dateKey = format(new Date(sessionDate), "yyyy-MM-dd");
          loadByDay[dateKey] = (loadByDay[dateKey] ?? 0) + cardioLoad;
        }
      }

      const dayKeys = eachDayOfInterval({ start: bounds.start, end: bounds.end }).map((d) =>
        format(d, "yyyy-MM-dd")
      );
      const loads = dayKeys.map((k) => loadByDay[k] ?? 0);
      const activeLoads = loads.filter((value) => value > 0);
      const normalizationLoad = Math.max(percentile(activeLoads, 0.6), 1);

      const fatigueRaw: number[] = [];
      for (let i = 0; i < loads.length; i++) {
        const normalized = Math.min(loads[i] / normalizationLoad, FATIGUE_MAX_DAILY_RATIO);
        const dailyImpulse = normalized * FATIGUE_DAILY_GAIN;
        const prev = i === 0 ? 0 : fatigueRaw[i - 1];
        fatigueRaw.push(Math.max(0, prev * FATIGUE_DECAY_FACTOR + dailyImpulse));
      }
      const fatigueTrend = computeEma(fatigueRaw, 5);

      const points: TrainingLoadPoint[] = dayKeys.map((date, idx) => {
        const load = loads[idx];
        return {
          date,
          load,
          fatigueScore: fatigueRaw[idx] ?? 0,
          fatigueTrend: fatigueTrend[idx] ?? 0,
        };
      });

      const lastPoint = points[points.length - 1];
      const fatigueScore = lastPoint?.fatigueScore ?? 0;
      const fatigueTrendValue = lastPoint?.fatigueTrend ?? 0;

      return {
        points,
        totals: {
          fatigueScore,
          fatigueTrend: fatigueTrendValue,
        },
      };
    },
  });
}
