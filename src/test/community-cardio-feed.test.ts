import { describe, expect, it } from "vitest";
import {
  mergeDatedFeedEntries,
  nextFeedCursorFromItems,
} from "@/lib/communityFeedMerge";
import {
  extractCardioTrackPoints,
  sessionHasRoute,
  type CardioSesionWithDetails,
} from "@/lib/cardioSessionDisplay";

describe("mergeDatedFeedEntries", () => {
  it("mezcla gym y cardio por fecha desc y respeta pageSize", () => {
    const gym = [
      { id: "g1", fecha: "2026-08-07T10:00:00.000Z", payload: "gym-new" },
      { id: "g2", fecha: "2026-08-05T10:00:00.000Z", payload: "gym-old" },
    ];
    const cardio = [
      { id: "c1", fecha: "2026-08-06T12:00:00.000Z", payload: "cardio-mid" },
      { id: "c2", fecha: "2026-08-04T08:00:00.000Z", payload: "cardio-older" },
    ];

    const { items, hasMoreFromMerge } = mergeDatedFeedEntries(gym, cardio, 3);

    expect(items.map((i) => i.entry.payload)).toEqual(["gym-new", "cardio-mid", "gym-old"]);
    expect(hasMoreFromMerge).toBe(true);
    expect(nextFeedCursorFromItems(items.map((i) => i.entry))).toBe("2026-08-05T10:00:00.000Z");
  });

  it("hasMoreFromMerge false cuando cabe todo", () => {
    const gym = [{ id: "g1", fecha: "2026-08-07T10:00:00.000Z", payload: 1 }];
    const cardio = [{ id: "c1", fecha: "2026-08-06T10:00:00.000Z", payload: 2 }];
    const { items, hasMoreFromMerge } = mergeDatedFeedEntries(gym, cardio, 10);
    expect(items).toHaveLength(2);
    expect(hasMoreFromMerge).toBe(false);
  });

  it("desempata por id desc", () => {
    const a = [
      { id: "b", fecha: "2026-08-07T10:00:00.000Z", payload: "a-b" },
      { id: "a", fecha: "2026-08-07T10:00:00.000Z", payload: "a-a" },
    ];
    const { items } = mergeDatedFeedEntries(a, [], 2);
    expect(items.map((i) => i.entry.id)).toEqual(["b", "a"]);
  });
});

describe("sessionHasRoute", () => {
  function sessionWithPoints(points: { lat: number; lng: number; orden: number }[]): CardioSesionWithDetails {
    return {
      id: "s1",
      usuario_id: "u1",
      titulo: "Run",
      fecha_inicio: "2026-08-07T08:00:00.000Z",
      fecha_fin: "2026-08-07T09:00:00.000Z",
      comentarios: null,
      es_publica: true,
      cardio_disciplina_id: null,
      created_at: "2026-08-07T08:00:00.000Z",
      cardio_track: {
        id: "t1",
        cardio_sesion_id: "s1",
        fuente: "gps-web",
        distancia_total_m: 1000,
        duracion_total_seg: 600,
        elevacion_positiva_m: 10,
        created_at: "2026-08-07T08:00:00.000Z",
        cardio_track_point: points.map((p) => ({
          id: `p-${p.orden}`,
          cardio_track_id: "t1",
          orden: p.orden,
          lat: p.lat,
          lng: p.lng,
          elevacion_m: null,
          timestamp_utc: null,
          velocidad_m_s: null,
          fc: null,
          cadencia: null,
          potencia_w: null,
          created_at: "2026-08-07T08:00:00.000Z",
        })),
      },
    } as CardioSesionWithDetails;
  }

  it("true cuando hay puntos GPS", () => {
    const session = sessionWithPoints([
      { lat: 40.4, lng: -3.7, orden: 0 },
      { lat: 40.41, lng: -3.71, orden: 1 },
    ]);
    expect(sessionHasRoute(session)).toBe(true);
    expect(extractCardioTrackPoints(session)).toHaveLength(2);
  });

  it("false sin track o sin puntos", () => {
    const empty = sessionWithPoints([]);
    expect(sessionHasRoute(empty)).toBe(false);

    const noTrack = {
      ...empty,
      cardio_track: null,
    } as CardioSesionWithDetails;
    expect(sessionHasRoute(noTrack)).toBe(false);
  });
});
