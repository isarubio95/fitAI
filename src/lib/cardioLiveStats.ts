import {
  avgPaceSecPer500m,
  avgPaceSecPerKm,
  avgSpeedMps,
  formatCardioBpm,
  formatCardioDistanceM,
  formatCardioDuration,
  formatCardioElevationM,
  formatPaceSec500m,
  formatPaceSecKm,
  formatSpeedKmh,
  paceSecPer500mFromSpeed,
  paceSecPerKmFromSpeed,
} from "@/lib/cardioFormat";
import { cardioDisciplineUsesGpsMap } from "@/lib/cardioLiveMap";
import type { CardioDisciplineCode } from "@/types/cardio";

export type LiveStatItem = {
  key: string;
  label: string;
  value: string;
};

export type LiveStatMetrics = {
  elapsedSec: number;
  distanceM: number;
  elevationM: number;
  speedMps: number | null;
  bpm: number | null;
  fcMedia: number | null;
  fcMax: number | null;
};

function timeDistanceBase(m: LiveStatMetrics): LiveStatItem[] {
  return [
    { key: "time", label: "Tiempo", value: formatCardioDuration(m.elapsedSec) },
    { key: "distance", label: "Distancia", value: formatCardioDistanceM(m.distanceM) },
  ];
}

function hrCurrentAvg(m: LiveStatMetrics): LiveStatItem[] {
  return [
    { key: "hr", label: "FC", value: formatCardioBpm(m.bpm) },
    { key: "hrAvg", label: "FC media", value: formatCardioBpm(m.fcMedia) },
  ];
}

/** Items de la pantalla full-screen de stats live según disciplina. */
export function buildLiveStatItems(
  code: string | null | undefined,
  metrics: LiveStatMetrics,
): LiveStatItem[] {
  const disciplina = (code ?? "other") as CardioDisciplineCode;

  if (disciplina === "running" || disciplina === "walking") {
    return [
      ...timeDistanceBase(metrics),
      {
        key: "elevation",
        label: "Elevación",
        value: formatCardioElevationM(metrics.elevationM),
      },
      {
        key: "paceAvg",
        label: "Ritmo medio",
        value: formatPaceSecKm(avgPaceSecPerKm(metrics.elapsedSec, metrics.distanceM)),
      },
      {
        key: "paceNow",
        label: "Ritmo actual",
        value: formatPaceSecKm(paceSecPerKmFromSpeed(metrics.speedMps)),
      },
      ...hrCurrentAvg(metrics),
    ];
  }

  if (disciplina === "cycling") {
    return [
      ...timeDistanceBase(metrics),
      {
        key: "elevation",
        label: "Elevación",
        value: formatCardioElevationM(metrics.elevationM),
      },
      {
        key: "speedAvg",
        label: "Vel. media",
        value: formatSpeedKmh(avgSpeedMps(metrics.elapsedSec, metrics.distanceM)),
      },
      {
        key: "speedNow",
        label: "Vel. actual",
        value: formatSpeedKmh(metrics.speedMps),
      },
      ...hrCurrentAvg(metrics),
    ];
  }

  if (disciplina === "rowing") {
    return [
      ...timeDistanceBase(metrics),
      {
        key: "elevation",
        label: "Elevación",
        value: formatCardioElevationM(metrics.elevationM),
      },
      {
        key: "paceAvg500",
        label: "Ritmo medio",
        value: formatPaceSec500m(avgPaceSecPer500m(metrics.elapsedSec, metrics.distanceM)),
      },
      {
        key: "paceNow500",
        label: "Ritmo actual",
        value: formatPaceSec500m(paceSecPer500mFromSpeed(metrics.speedMps)),
      },
      ...hrCurrentAvg(metrics),
    ];
  }

  // Sin GPS / indoor: tiempo + FC (sin ritmo/velocidad).
  if (!cardioDisciplineUsesGpsMap(disciplina)) {
    return [
      { key: "time", label: "Tiempo", value: formatCardioDuration(metrics.elapsedSec) },
      { key: "hr", label: "FC", value: formatCardioBpm(metrics.bpm) },
      { key: "hrAvg", label: "FC media", value: formatCardioBpm(metrics.fcMedia) },
      { key: "hrMax", label: "FC máx", value: formatCardioBpm(metrics.fcMax) },
    ];
  }

  // Fallback genérico con GPS.
  return [
    ...timeDistanceBase(metrics),
    {
      key: "elevation",
      label: "Elevación",
      value: formatCardioElevationM(metrics.elevationM),
    },
    ...hrCurrentAvg(metrics),
  ];
}
