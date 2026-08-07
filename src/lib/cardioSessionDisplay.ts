import { firstNested } from "@/lib/firstNested";
import {
  avgPaceSecPerKm,
  avgPaceSecPer500m,
  avgSpeedMps,
} from "@/lib/cardioFormat";
import { limitTrackPoints } from "@/lib/cardioTrackPoints";
import type {
  CardioBloque,
  CardioDisciplina,
  CardioSesion,
  CardioSesionCycling,
  CardioSesionRunning,
  CardioTrack,
  CardioTrackPoint,
} from "@/types/cardio";

/** Tope de puntos en preview de feed (MapLibre en listas). */
export const CARDIO_FEED_MAP_MAX_POINTS = 200;

export type CardioSesionWithDetails = CardioSesion & {
  cardio_disciplina?: CardioDisciplina | CardioDisciplina[] | null;
  cardio_bloque?: CardioBloque[] | null;
  cardio_sesion_running?: CardioSesionRunning | CardioSesionRunning[] | null;
  cardio_sesion_cycling?: CardioSesionCycling | CardioSesionCycling[] | null;
  cardio_track?:
    | (CardioTrack & { cardio_track_point?: CardioTrackPoint[] | null })
    | (CardioTrack & { cardio_track_point?: CardioTrackPoint[] | null })[]
    | null;
};

export type CardioMapPoint = { lat: number; lng: number; elevacion_m?: number | null };

export type CardioSessionMetrics = {
  distanceM: number;
  durationSec: number;
  elevationM: number;
  fcMedia: number | null;
  fcMax: number | null;
  calorias: number | null;
  /** Ritmo s/km (running/walking) o s/500m (rowing). */
  paceSec: number | null;
  paceKind: "km" | "500m" | null;
  /** Velocidad media m/s (cycling u otros con distancia). */
  speedMps: number | null;
  disciplinaCodigo: string | null;
  disciplinaNombre: string | null;
};

export function getCardioDiscipline(session: CardioSesionWithDetails): CardioDisciplina | null {
  return firstNested(session.cardio_disciplina);
}

export function getCardioTrack(
  session: CardioSesionWithDetails,
): (CardioTrack & { cardio_track_point?: CardioTrackPoint[] | null }) | null {
  return firstNested(session.cardio_track);
}

export function extractCardioTrackPoints(session: CardioSesionWithDetails): CardioMapPoint[] {
  const track = getCardioTrack(session);
  const raw = track?.cardio_track_point ?? [];
  return [...raw]
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
    .map((p) => ({ lat: p.lat, lng: p.lng, elevacion_m: p.elevacion_m }));
}

export function sessionHasRoute(session: CardioSesionWithDetails): boolean {
  return extractCardioTrackPoints(session).length > 0;
}

/** Puntos adelgazados para preview en cards del feed. */
export function extractCardioTrackPointsForFeed(
  session: CardioSesionWithDetails,
  maxPoints = CARDIO_FEED_MAP_MAX_POINTS,
): CardioMapPoint[] {
  return limitTrackPoints(extractCardioTrackPoints(session), maxPoints);
}

function sumBlocks(bloques: CardioBloque[] | null | undefined) {
  let distanceM = 0;
  let durationSec = 0;
  let elevationM = 0;
  let calorias = 0;
  let fcMediaSum = 0;
  let fcMediaN = 0;
  let fcMax = 0;

  for (const b of bloques ?? []) {
    if (b.distancia_m != null && Number.isFinite(b.distancia_m)) distanceM += b.distancia_m;
    if (b.duracion_seg != null && Number.isFinite(b.duracion_seg)) durationSec += b.duracion_seg;
    if (b.elevacion_m != null && Number.isFinite(b.elevacion_m)) elevationM += b.elevacion_m;
    if (b.calorias != null && Number.isFinite(b.calorias)) calorias += b.calorias;
    if (b.fc_media != null && Number.isFinite(b.fc_media) && b.fc_media > 0) {
      fcMediaSum += b.fc_media;
      fcMediaN += 1;
    }
    if (b.fc_max != null && Number.isFinite(b.fc_max) && b.fc_max > fcMax) fcMax = b.fc_max;
  }

  return {
    distanceM,
    durationSec,
    elevationM,
    calorias: calorias > 0 ? calorias : null,
    fcMedia: fcMediaN > 0 ? Math.round(fcMediaSum / fcMediaN) : null,
    fcMax: fcMax > 0 ? fcMax : null,
  };
}

export function computeCardioSessionMetrics(session: CardioSesionWithDetails): CardioSessionMetrics {
  const disciplina = getCardioDiscipline(session);
  const codigo = disciplina?.codigo ?? null;
  const track = getCardioTrack(session);
  const fromBlocks = sumBlocks(session.cardio_bloque);
  const running = firstNested(session.cardio_sesion_running);
  const cycling = firstNested(session.cardio_sesion_cycling);

  const distanceM =
    fromBlocks.distanceM > 0
      ? fromBlocks.distanceM
      : track?.distancia_total_m != null && Number.isFinite(track.distancia_total_m)
        ? track.distancia_total_m
        : 0;

  let durationSec = fromBlocks.durationSec;
  if (!(durationSec > 0) && session.fecha_inicio && session.fecha_fin) {
    const ms = new Date(session.fecha_fin).getTime() - new Date(session.fecha_inicio).getTime();
    if (Number.isFinite(ms) && ms > 0) durationSec = Math.round(ms / 1000);
  }
  if (!(durationSec > 0) && track?.duracion_total_seg != null && Number.isFinite(track.duracion_total_seg)) {
    durationSec = track.duracion_total_seg;
  }

  let elevationM = fromBlocks.elevationM;
  if (!(elevationM > 0)) {
    if (running?.desnivel_positivo_m != null && Number.isFinite(running.desnivel_positivo_m)) {
      elevationM = running.desnivel_positivo_m;
    } else if (cycling?.desnivel_positivo_m != null && Number.isFinite(cycling.desnivel_positivo_m)) {
      elevationM = cycling.desnivel_positivo_m;
    } else if (track?.elevacion_positiva_m != null && Number.isFinite(track.elevacion_positiva_m)) {
      elevationM = track.elevacion_positiva_m;
    }
  }

  let paceSec: number | null = null;
  let paceKind: "km" | "500m" | null = null;
  let speedMps: number | null = null;

  if (codigo === "cycling") {
    speedMps = avgSpeedMps(durationSec, distanceM);
  } else if (codigo === "rowing") {
    paceSec =
      running?.ritmo_medio_seg_km != null && Number.isFinite(running.ritmo_medio_seg_km)
        ? null
        : avgPaceSecPer500m(durationSec, distanceM);
    paceKind = paceSec != null ? "500m" : null;
    if (paceSec == null) speedMps = avgSpeedMps(durationSec, distanceM);
  } else if (codigo === "running" || codigo === "walking") {
    paceSec =
      running?.ritmo_medio_seg_km != null && Number.isFinite(running.ritmo_medio_seg_km)
        ? running.ritmo_medio_seg_km
        : avgPaceSecPerKm(durationSec, distanceM);
    paceKind = paceSec != null ? "km" : null;
  } else {
    paceSec = avgPaceSecPerKm(durationSec, distanceM);
    if (paceSec != null) paceKind = "km";
    else speedMps = avgSpeedMps(durationSec, distanceM);
  }

  return {
    distanceM,
    durationSec,
    elevationM,
    fcMedia: fromBlocks.fcMedia,
    fcMax: fromBlocks.fcMax,
    calorias: fromBlocks.calorias,
    paceSec,
    paceKind,
    speedMps,
    disciplinaCodigo: codigo,
    disciplinaNombre: disciplina?.nombre ?? null,
  };
}
