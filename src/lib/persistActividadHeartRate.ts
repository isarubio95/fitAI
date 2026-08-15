import {
  sampleHeartRateSeries,
  summarizeHeartRate,
  type HeartRateSample,
} from "@/lib/heartRateMetrics";
import { supabase } from "@/integrations/supabase/client";

const SAMPLE_INSERT_CHUNK = 200;

async function insertActividadFcSamples(
  actividadId: string,
  samples: HeartRateSample[],
): Promise<void> {
  if (!samples.length) return;
  for (let i = 0; i < samples.length; i += SAMPLE_INSERT_CHUNK) {
    const slice = samples.slice(i, i + SAMPLE_INSERT_CHUNK).map((s) => ({
      actividad_id: actividadId,
      t_epoch_ms: s.t,
      bpm: Math.round(s.bpm),
    }));
    const { error } = await supabase.from("actividad_fc_sample").insert(slice);
    if (error) throw error;
  }
}

/**
 * Persiste FC de sensor BLE abierto: actualiza fc_media/fc_max en actividad
 * y guarda samples. Sin samples BLE no escribe nada.
 */
export async function persistActividadHeartRate(opts: {
  actividadId: string;
  bleSamples: HeartRateSample[];
  startIso: string;
  endIso: string;
}): Promise<{ saved: boolean }> {
  const startMs = Date.parse(opts.startIso);
  const endMs = Date.parse(opts.endIso);
  const samples = opts.bleSamples.slice();

  if (samples.length === 0) {
    return { saved: false };
  }

  const forStore =
    samples.length < 10 && Number.isFinite(startMs) && Number.isFinite(endMs)
      ? sampleHeartRateSeries(samples, startMs, endMs, 5000)
      : samples;
  const finalSamples = forStore.length ? forStore : samples;
  const { fcMedia, fcMax } = summarizeHeartRate(finalSamples);

  const { error: updErr } = await supabase
    .from("actividad")
    .update({
      fc_media: fcMedia,
      fc_max: fcMax,
    })
    .eq("id", opts.actividadId);
  if (updErr) throw updErr;

  await supabase.from("actividad_fc_sample").delete().eq("actividad_id", opts.actividadId);
  await insertActividadFcSamples(opts.actividadId, finalSamples);

  return { saved: true };
}
