import { supabase } from "@/integrations/supabase/client";
import {
  CARDIO_FEED_MAP_MAX_POINTS,
  getCardioTrack,
  type CardioSesionWithDetails,
} from "@/lib/cardioSessionDisplay";
import type { CardioTrackPoint } from "@/types/cardio";

type PreviewPoint = {
  cardio_track_id: string;
  orden: number;
  lat: number;
  lng: number;
  elevacion_m: number | null;
};

function toTrackPoint(row: PreviewPoint): CardioTrackPoint {
  return {
    id: `${row.cardio_track_id}:${row.orden}`,
    cardio_track_id: row.cardio_track_id,
    orden: row.orden,
    lat: row.lat,
    lng: row.lng,
    elevacion_m: row.elevacion_m,
    timestamp_utc: null,
    velocidad_m_s: null,
    fc: null,
    cadencia: null,
    potencia_w: null,
    created_at: "",
  };
}

function withTrackPoints(
  session: CardioSesionWithDetails,
  points: CardioTrackPoint[],
): CardioSesionWithDetails {
  const track = session.cardio_track;
  if (!track) return session;
  if (Array.isArray(track)) {
    const first = track[0];
    if (!first) return session;
    return {
      ...session,
      cardio_track: [{ ...first, cardio_track_point: points }, ...track.slice(1)],
    };
  }
  return { ...session, cardio_track: { ...track, cardio_track_point: points } };
}

/** Adjunta un muestreo de puntos GPS (máx. ~200) para thumbs de mapa en listas. */
export async function attachCardioTrackPreviews(
  sessions: CardioSesionWithDetails[],
  maxPoints = CARDIO_FEED_MAP_MAX_POINTS,
): Promise<CardioSesionWithDetails[]> {
  const trackIds = [
    ...new Set(
      sessions
        .map((s) => getCardioTrack(s)?.id)
        .filter((id): id is string => !!id),
    ),
  ];
  if (trackIds.length === 0) return sessions;

  const { data, error } = await supabase.rpc("get_cardio_track_preview_points", {
    p_track_ids: trackIds,
    p_max_points: maxPoints,
  });
  if (error) throw error;

  const byTrack = new Map<string, CardioTrackPoint[]>();
  for (const row of data ?? []) {
    const list = byTrack.get(row.cardio_track_id) ?? [];
    list.push(toTrackPoint(row));
    byTrack.set(row.cardio_track_id, list);
  }

  return sessions.map((session) => {
    const trackId = getCardioTrack(session)?.id;
    if (!trackId) return session;
    const points = byTrack.get(trackId);
    if (!points?.length) return session;
    return withTrackPoints(session, points);
  });
}
