import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { chunkIds, fetchAllPages } from "@/lib/supabaseBatch";
import { setHasWork } from "@/types/workout";
import { isWorkingSet } from "@/lib/setTypes";
import {
  banisterSeries,
  cardioBlockImpulse,
  combineStrengthSessionLoad,
  DEFAULT_CARDIO_SESSION_RPE,
  DEFAULT_STRENGTH_SESSION_RPE,
  edwardsTrimpFromAvgHr,
  edwardsTrimpFromSamples,
  estimatedStrengthDurationSec,
  MAX_CARDIO_CLOCK_SEC,
  MAX_STRENGTH_CLOCK_SEC,
  resolveMaxHeartRate,
  resolveRestingHeartRate,
  resolveSessionDurationSec,
  resolveSessionRpe,
  strengthSetMechanicalImpulse,
  unifiedSessionLoad,
  type PhysioProfile,
} from "@/lib/trainingLoad";
import { summarizeHeartRate, type HeartRateSample } from "@/lib/heartRateMetrics";

const LOOKBACK_DAYS = 400;

export interface TrainingLoadPoint {
  date: string;
  load: number;
  loadStrength: number;
  loadCardio: number;
  fitness: number;
  fatigue: number;
  form: number;
}

export interface TrainingLoadData {
  points: TrainingLoadPoint[];
  totals: {
    fitness: number;
    fatigue: number;
    form: number;
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

      const [perfilRes, medidasRes] = await Promise.all([
        supabase
          .from("perfil")
          .select("fecha_nacimiento, fc_max, fc_reposo, ftp_w")
          .eq("id", user!.id)
          .maybeSingle(),
        supabase
          .from("medidas")
          .select("peso")
          .eq("usuario_id", user!.id)
          .not("peso", "is", null)
          .order("fecha", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (perfilRes.error) throw perfilRes.error;
      if (medidasRes.error) throw medidasRes.error;

      const profile = (perfilRes.data ?? null) as PhysioProfile | null;
      const maxHr = resolveMaxHeartRate(profile);
      const restingHr = resolveRestingHeartRate(profile);
      const ftpW = profile?.ftp_w ?? null;
      const bodyWeightKg = medidasRes.data?.peso != null ? Number(medidasRes.data.peso) : null;

      const loadStrengthByDay: Record<string, number> = {};
      const loadCardioByDay: Record<string, number> = {};

      const actividades = await fetchAllPages<{
        id: string;
        fecha: string;
        fecha_fin: string | null;
        fc_media: number | null;
        fc_max: number | null;
        rpe: number | null;
      }>((from, to) =>
        supabase
          .from("actividad")
          .select("id, fecha, fecha_fin, fc_media, fc_max, rpe")
          .eq("usuario_id", user!.id)
          .not("fecha_fin", "is", null)
          .gte("fecha", fromIso)
          .lte("fecha", toIso)
          .order("fecha", { ascending: true })
          .range(from, to),
      );

      const activityIds = actividades.map((a) => a.id);

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
        const mechanicalByActivity = new Map<string, number>();
        const rirsByActivity = new Map<string, Array<number | null>>();
        const setCountByActivity = new Map<string, number>();

        if (exerciseIds.length > 0) {
          const series: {
            ejercicio_id: string;
            repeticiones: number | null;
            peso_kg: number | null;
            duracion_seg: number | null;
            ritmo_seg_km: number | null;
            rir: number | null;
            completed: boolean | null;
            tipo_serie: string | null;
          }[] = [];
          for (const chunk of chunkIds(exerciseIds)) {
            const chunkSeries = await fetchAllPages<{
              ejercicio_id: string;
              repeticiones: number | null;
              peso_kg: number | null;
              duracion_seg: number | null;
              ritmo_seg_km: number | null;
              rir: number | null;
              completed: boolean | null;
              tipo_serie: string | null;
            }>((from, to) =>
              supabase
                .from("serie")
                .select("ejercicio_id, repeticiones, peso_kg, duracion_seg, ritmo_seg_km, rir, completed, tipo_serie")
                .in("ejercicio_id", chunk)
                .range(from, to),
            );
            series.push(...chunkSeries);
          }

          for (const s of series) {
            if (!setHasWork(s)) continue;
            const activityId = activityByExerciseId.get(s.ejercicio_id);
            if (!activityId) continue;

            // El calentamiento SÍ ocupa tiempo, así que cuenta para la duración
            // estimada de la sesión (setCountByActivity → estimatedStrengthDurationSec),
            // pero no aporta impulso mecánico ni define el RPE de la sesión.
            setCountByActivity.set(activityId, (setCountByActivity.get(activityId) ?? 0) + 1);
            if (!isWorkingSet(s.tipo_serie)) continue;

            const impulse = strengthSetMechanicalImpulse(
              {
                repeticiones: s.repeticiones,
                peso_kg: s.peso_kg,
                duracion_seg: s.duracion_seg,
                rir: s.rir,
              },
              bodyWeightKg,
            );
            mechanicalByActivity.set(activityId, (mechanicalByActivity.get(activityId) ?? 0) + impulse);
            const rirs = rirsByActivity.get(activityId) ?? [];
            rirs.push(s.rir);
            rirsByActivity.set(activityId, rirs);
          }
        }

        const hrSamplesByActivity = new Map<string, HeartRateSample[]>();
        const activitiesWithHr = actividades.filter((a) => a.fc_media != null || a.fc_max != null);
        if (activitiesWithHr.length > 0) {
          for (const chunk of chunkIds(activitiesWithHr.map((a) => a.id))) {
            const { data, error } = await supabase
              .from("actividad_fc_sample")
              .select("actividad_id, t_epoch_ms, bpm")
              .in("actividad_id", chunk);
            if (error) throw error;
            for (const row of data ?? []) {
              const list = hrSamplesByActivity.get(row.actividad_id) ?? [];
              list.push({ t: Number(row.t_epoch_ms), bpm: row.bpm });
              hrSamplesByActivity.set(row.actividad_id, list);
            }
          }
        }

        for (const activity of actividades) {
          const mechanical = mechanicalByActivity.get(activity.id) ?? 0;
          const dateKey = format(new Date(activity.fecha), "yyyy-MM-dd");
          let hrTrimp = 0;
          const samples = hrSamplesByActivity.get(activity.id) ?? [];
          const startMs = Date.parse(activity.fecha);
          const endMs = activity.fecha_fin ? Date.parse(activity.fecha_fin) : NaN;
          const clockSec =
            Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs
              ? (endMs - startMs) / 1000
              : 0;
          const durationSec = resolveSessionDurationSec({
            clockSec,
            estimatedSec: estimatedStrengthDurationSec(setCountByActivity.get(activity.id) ?? 0),
            maxClockSec: MAX_STRENGTH_CLOCK_SEC,
          });

          if (samples.length > 0) {
            hrTrimp = edwardsTrimpFromSamples(samples, maxHr, durationSec || undefined);
          } else if (activity.fc_media != null && activity.fc_media > 0 && durationSec > 0) {
            hrTrimp = edwardsTrimpFromAvgHr(durationSec, activity.fc_media, maxHr);
          }

          const sampleHr = summarizeHeartRate(samples).fcMedia;
          const rpe = resolveSessionRpe({
            sessionRpe: activity.rpe,
            fcMedia: sampleHr ?? activity.fc_media,
            maxHr,
            restingHr,
            setRirs: rirsByActivity.get(activity.id) ?? [],
            fallbackRpe: DEFAULT_STRENGTH_SESSION_RPE,
          });
          const sessionLoad = unifiedSessionLoad({
            durationSec,
            rpe,
            fallbackLoad: combineStrengthSessionLoad(mechanical, hrTrimp),
          });
          if (sessionLoad <= 0) continue;
          loadStrengthByDay[dateKey] = (loadStrengthByDay[dateKey] ?? 0) + sessionLoad;
        }
      }

      const sessions = await fetchAllPages<{
        id: string;
        fecha_inicio: string;
        fecha_fin: string | null;
        rpe: number | null;
      }>((from, to) =>
        supabase
          .from("cardio_sesion")
          .select("id, fecha_inicio, fecha_fin, rpe")
          .eq("usuario_id", user!.id)
          .not("fecha_fin", "is", null)
          .gte("fecha_inicio", fromIso)
          .lte("fecha_inicio", toIso)
          .order("fecha_inicio", { ascending: true })
          .range(from, to),
      );

      const sessionIds = sessions.map((s) => s.id);
      if (sessionIds.length > 0) {
        const blocks: {
          cardio_sesion_id: string;
          duracion_seg: number | null;
          fc_media: number | null;
          fc_max: number | null;
        }[] = [];
        for (const chunk of chunkIds(sessionIds)) {
          const { data, error: blkErr } = await supabase
            .from("cardio_bloque")
            .select("cardio_sesion_id, duracion_seg, fc_media, fc_max")
            .in("cardio_sesion_id", chunk);
          if (blkErr) throw blkErr;
          if (data?.length) blocks.push(...data);
        }

        const cyclingBySession = new Map<
          string,
          { potencia_media_w: number | null; potencia_normalizada_w: number | null }
        >();
        for (const chunk of chunkIds(sessionIds)) {
          const { data, error } = await supabase
            .from("cardio_sesion_cycling")
            .select("cardio_sesion_id, potencia_media_w, potencia_normalizada_w")
            .in("cardio_sesion_id", chunk);
          if (error) throw error;
          for (const row of data ?? []) {
            cyclingBySession.set(row.cardio_sesion_id, {
              potencia_media_w: row.potencia_media_w,
              potencia_normalizada_w: row.potencia_normalizada_w,
            });
          }
        }

        const trackFcBySession = new Map<string, HeartRateSample[]>();
        const tracks: { id: string; cardio_sesion_id: string }[] = [];
        for (const chunk of chunkIds(sessionIds)) {
          const { data, error } = await supabase
            .from("cardio_track")
            .select("id, cardio_sesion_id")
            .in("cardio_sesion_id", chunk);
          if (error) throw error;
          if (data?.length) tracks.push(...data);
        }

        if (tracks.length > 0) {
          const trackSession = new Map(tracks.map((t) => [t.id, t.cardio_sesion_id]));
          for (const chunk of chunkIds(tracks.map((t) => t.id))) {
            const { data, error } = await supabase
              .from("cardio_track_point")
              .select("cardio_track_id, timestamp_utc, fc")
              .in("cardio_track_id", chunk)
              .not("fc", "is", null);
            if (error) throw error;
            for (const row of data ?? []) {
              if (row.fc == null) continue;
              const sessionId = trackSession.get(row.cardio_track_id);
              if (!sessionId) continue;
              const t = row.timestamp_utc ? Date.parse(row.timestamp_utc) : NaN;
              if (!Number.isFinite(t)) continue;
              const list = trackFcBySession.get(sessionId) ?? [];
              list.push({ t, bpm: row.fc });
              trackFcBySession.set(sessionId, list);
            }
          }
        }

        const durationBySession = new Map<string, number>();
        const fcMediaBySession = new Map<string, number>();
        const blocksBySession = new Map<string, typeof blocks>();
        for (const b of blocks) {
          durationBySession.set(
            b.cardio_sesion_id,
            (durationBySession.get(b.cardio_sesion_id) ?? 0) + Number(b.duracion_seg ?? 0),
          );
          if (b.fc_media != null && b.fc_media > 0 && !fcMediaBySession.has(b.cardio_sesion_id)) {
            fcMediaBySession.set(b.cardio_sesion_id, b.fc_media);
          }
          const list = blocksBySession.get(b.cardio_sesion_id) ?? [];
          list.push(b);
          blocksBySession.set(b.cardio_sesion_id, list);
        }

        for (const session of sessions) {
          const dateKey = format(new Date(session.fecha_inicio), "yyyy-MM-dd");
          const samples = trackFcBySession.get(session.id) ?? [];
          const cycling = cyclingBySession.get(session.id);
          let sessionDuration = durationBySession.get(session.id) ?? 0;
          if (sessionDuration <= 0 && session.fecha_fin) {
            const startMs = Date.parse(session.fecha_inicio);
            const endMs = Date.parse(session.fecha_fin);
            if (Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs) {
              sessionDuration = (endMs - startMs) / 1000;
            }
          }
          sessionDuration = resolveSessionDurationSec({
            clockSec: sessionDuration,
            maxClockSec: MAX_CARDIO_CLOCK_SEC,
          });

          const sessionBlocks = blocksBySession.get(session.id) ?? [];
          let fallback = 0;
          if (samples.length > 0) {
            fallback = cardioBlockImpulse(
              { duracion_seg: sessionDuration, fc_media: fcMediaBySession.get(session.id) ?? null },
              {
                maxHr,
                restingHr,
                ftpW,
                samples,
                cycling: cycling ? { ...cycling, duracion_seg: sessionDuration } : null,
              },
            );
          } else {
            for (const b of sessionBlocks) {
              fallback += cardioBlockImpulse(
                {
                  duracion_seg: b.duracion_seg,
                  fc_media: b.fc_media,
                  fc_max: b.fc_max,
                },
                {
                  maxHr,
                  restingHr,
                  ftpW,
                  cycling: cycling
                    ? { ...cycling, duracion_seg: Number(b.duracion_seg ?? 0) }
                    : null,
                },
              );
            }
          }

          const power = Number(cycling?.potencia_normalizada_w ?? cycling?.potencia_media_w ?? 0);
          const intensityFactor = ftpW != null && ftpW > 0 && power > 0 ? power / ftpW : null;
          const sampleHr = summarizeHeartRate(samples).fcMedia;
          const rpe = resolveSessionRpe({
            sessionRpe: session.rpe,
            fcMedia: sampleHr ?? fcMediaBySession.get(session.id) ?? null,
            maxHr,
            restingHr,
            intensityFactor,
            fallbackRpe: DEFAULT_CARDIO_SESSION_RPE,
          });
          const sessionLoad = unifiedSessionLoad({
            durationSec: sessionDuration,
            rpe,
            fallbackLoad: fallback,
          });
          if (sessionLoad <= 0) continue;
          loadCardioByDay[dateKey] = (loadCardioByDay[dateKey] ?? 0) + sessionLoad;
        }
      }

      const dayKeys = eachDayOfInterval({ start: bounds.start, end: bounds.end }).map((d) =>
        format(d, "yyyy-MM-dd"),
      );
      const loads = dayKeys.map((k) => (loadStrengthByDay[k] ?? 0) + (loadCardioByDay[k] ?? 0));
      const series = banisterSeries(loads);

      const points: TrainingLoadPoint[] = dayKeys.map((date, idx) => ({
        date,
        load: loads[idx] ?? 0,
        loadStrength: loadStrengthByDay[date] ?? 0,
        loadCardio: loadCardioByDay[date] ?? 0,
        fitness: series[idx]?.fitness ?? 0,
        fatigue: series[idx]?.fatigue ?? 0,
        form: series[idx]?.form ?? 0,
      }));

      const lastPoint = points[points.length - 1];

      return {
        points,
        totals: {
          fitness: lastPoint?.fitness ?? 0,
          fatigue: lastPoint?.fatigue ?? 0,
          form: lastPoint?.form ?? 0,
        },
      };
    },
  });
}
