import { beforeEach, describe, expect, it, vi } from "vitest";
import { attachCardioTrackPreviews } from "@/lib/attachCardioTrackPreviews";
import { extractCardioTrackPoints, type CardioSesionWithDetails } from "@/lib/cardioSessionDisplay";

const mockRpc = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

function sessionWithoutPoints(id: string, trackId: string): CardioSesionWithDetails {
  return {
    id,
    usuario_id: "u1",
    titulo: "Run",
    fecha_inicio: "2026-08-07T08:00:00.000Z",
    fecha_fin: "2026-08-07T09:00:00.000Z",
    comentarios: null,
    es_publica: true,
    cardio_disciplina_id: null,
    created_at: "2026-08-07T08:00:00.000Z",
    cardio_track: {
      id: trackId,
      cardio_sesion_id: id,
      fuente: "gps-web",
      distancia_total_m: 1000,
      duracion_total_seg: 600,
      elevacion_positiva_m: 10,
      created_at: "2026-08-07T08:00:00.000Z",
    },
  } as CardioSesionWithDetails;
}

describe("attachCardioTrackPreviews", () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  it("no llama al RPC si no hay tracks", async () => {
    const session = { ...sessionWithoutPoints("s1", "t1"), cardio_track: null };
    const result = await attachCardioTrackPreviews([session]);
    expect(mockRpc).not.toHaveBeenCalled();
    expect(result).toEqual([session]);
  });

  it("adjunta puntos muestreado al track", async () => {
    mockRpc.mockResolvedValue({
      data: [
        { cardio_track_id: "t1", orden: 0, lat: 40.4, lng: -3.7, elevacion_m: 10 },
        { cardio_track_id: "t1", orden: 9, lat: 40.5, lng: -3.8, elevacion_m: 20 },
      ],
      error: null,
    });

    const [hydrated] = await attachCardioTrackPreviews([sessionWithoutPoints("s1", "t1")]);
    expect(mockRpc).toHaveBeenCalledWith("get_cardio_track_preview_points", {
      p_track_ids: ["t1"],
      p_max_points: 200,
    });
    expect(extractCardioTrackPoints(hydrated)).toEqual([
      { lat: 40.4, lng: -3.7, elevacion_m: 10 },
      { lat: 40.5, lng: -3.8, elevacion_m: 20 },
    ]);
  });
});
