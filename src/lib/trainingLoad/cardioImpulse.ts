import { heartRateZone, type HeartRateSample } from "@/lib/heartRateMetrics";
import {
  CARDIO_PER_MINUTE_FACTOR,
  DEFAULT_RESTING_HR,
  EDWARDS_ZONE_WEIGHTS,
} from "./constants";

export type CardioBlockInput = {
  duracion_seg?: number | null;
  fc_media?: number | null;
  fc_max?: number | null;
};

export type CyclingPowerInput = {
  potencia_media_w?: number | null;
  potencia_normalizada_w?: number | null;
  duracion_seg?: number | null;
};

/**
 * Edwards TRIMP: suma (minutos_en_zona × peso_zona) con pesos 1..5.
 * Samples con timestamps → tiempo real entre puntos.
 * Si no hay timestamps útiles, asume 1 sample = 1 s (o usa duración total).
 */
export function edwardsTrimpFromSamples(
  samples: HeartRateSample[],
  maxHr: number,
  totalDurationSec?: number | null,
): number {
  if (!samples.length || !Number.isFinite(maxHr) || maxHr <= 0) return 0;

  const zoneSeconds = [0, 0, 0, 0, 0];
  const sorted = [...samples].sort((a, b) => a.t - b.t);

  if (sorted.length === 1) {
    const zone = heartRateZone(sorted[0].bpm, maxHr);
    const sec = Math.max(0, Number(totalDurationSec ?? 0));
    if (zone != null && sec > 0) zoneSeconds[zone - 1] = sec;
  } else {
    for (let i = 0; i < sorted.length; i++) {
      const zone = heartRateZone(sorted[i].bpm, maxHr);
      if (zone == null) continue;
      const nextT = i + 1 < sorted.length ? sorted[i + 1].t : sorted[i].t;
      let dt = Math.max(0, (nextT - sorted[i].t) / 1000);
      if (dt <= 0 || dt > 120) dt = 1;
      zoneSeconds[zone - 1] += dt;
    }
    const summed = zoneSeconds.reduce((a, b) => a + b, 0);
    const target = Number(totalDurationSec ?? 0);
    if (target > 0 && summed > 0 && Math.abs(summed - target) / target > 0.25) {
      const scale = target / summed;
      for (let z = 0; z < 5; z++) zoneSeconds[z] *= scale;
    }
  }

  let trimp = 0;
  for (let z = 0; z < 5; z++) {
    trimp += (zoneSeconds[z] / 60) * EDWARDS_ZONE_WEIGHTS[z];
  }
  return trimp;
}

/** Proxy Edwards: toda la duración en la zona de fc_media. */
export function edwardsTrimpFromAvgHr(
  durationSec: number,
  fcMedia: number,
  maxHr: number,
): number {
  if (durationSec <= 0 || fcMedia <= 0 || maxHr <= 0) return 0;
  const zone = heartRateZone(fcMedia, maxHr);
  if (zone == null) return 0;
  return (durationSec / 60) * EDWARDS_ZONE_WEIGHTS[zone - 1];
}

/**
 * Banister TRIMP clásico (exponencial) como respaldo suave.
 * ΔHR = (FC − FCreposo) / (FCmáx − FCreposo).
 */
export function banisterTrimp(
  durationSec: number,
  fcMedia: number,
  maxHr: number,
  restingHr = DEFAULT_RESTING_HR,
): number {
  if (durationSec <= 0 || fcMedia <= 0 || maxHr <= restingHr) return 0;
  const hrRatio = Math.max(0, Math.min(1, (fcMedia - restingHr) / (maxHr - restingHr)));
  const minutes = durationSec / 60;
  return minutes * hrRatio * 0.64 * Math.exp(1.92 * hrRatio);
}

/** TSS aproximado con potencia normalizada (o media) y FTP. */
export function cyclingTss(
  durationSec: number,
  normalizedOrAvgPowerW: number,
  ftpW: number,
): number {
  if (durationSec <= 0 || normalizedOrAvgPowerW <= 0 || ftpW <= 0) return 0;
  const intensityFactor = normalizedOrAvgPowerW / ftpW;
  const hours = durationSec / 3600;
  return hours * intensityFactor * intensityFactor * 100;
}

export type CardioImpulseOptions = {
  maxHr: number;
  restingHr?: number;
  ftpW?: number | null;
  samples?: HeartRateSample[];
  cycling?: CyclingPowerInput | null;
};

/**
 * Impulso de un bloque cardio (prioridad: samples FC → fc_media → potencia/FTP → duración).
 */
export function cardioBlockImpulse(block: CardioBlockInput, opts: CardioImpulseOptions): number {
  const durationSec = Math.max(0, Number(block.duracion_seg ?? 0));
  if (durationSec <= 0) return 0;

  const samples = opts.samples ?? [];
  if (samples.length > 0) {
    return edwardsTrimpFromSamples(samples, opts.maxHr, durationSec);
  }

  const fcMedia = Number(block.fc_media ?? 0);
  if (fcMedia > 0) {
    const edwards = edwardsTrimpFromAvgHr(durationSec, fcMedia, opts.maxHr);
    if (edwards > 0) return edwards;
    return banisterTrimp(durationSec, fcMedia, opts.maxHr, opts.restingHr ?? DEFAULT_RESTING_HR);
  }

  const cycling = opts.cycling;
  const ftp = opts.ftpW;
  if (cycling && ftp != null && ftp > 0) {
    const power = Number(cycling.potencia_normalizada_w ?? cycling.potencia_media_w ?? 0);
    const dur = Number(cycling.duracion_seg ?? durationSec);
    const tss = cyclingTss(dur, power, ftp);
    if (tss > 0) return tss;
  }

  return (durationSec / 60) * CARDIO_PER_MINUTE_FACTOR;
}
