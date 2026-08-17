import { beforeEach, describe, expect, it, vi } from "vitest";
import { attachCardioRutaPreviews } from "@/hooks/useSavedCardioRoutes";
import type { CardioRutaWithPoints } from "@/types/cardio";

const mockRpc = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: (...args: unknown[]) => mockRpc(...args),
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

function routeWithoutPoints(id: string): CardioRutaWithPoints {
  return {
    id,
    usuario_id: "u1",
    nombre: "Ruta",
    descripcion: null,
    cardio_disciplina_id: null,
    distancia_total_m: 1000,
    elevacion_positiva_m: 10,
    origen_cardio_sesion_id: null,
    created_at: "2026-08-07T08:00:00.000Z",
  };
}

describe("attachCardioRutaPreviews", () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  it("no llama al RPC si no hay rutas", async () => {
    const result = await attachCardioRutaPreviews([]);
    expect(mockRpc).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("adjunta puntos muestreado", async () => {
    mockRpc.mockResolvedValue({
      data: [
        { cardio_ruta_id: "r1", orden: 0, lat: 40.4, lng: -3.7, elevacion_m: 10 },
        { cardio_ruta_id: "r1", orden: 8, lat: 40.5, lng: -3.8, elevacion_m: 12 },
      ],
      error: null,
    });

    const [hydrated] = await attachCardioRutaPreviews([routeWithoutPoints("r1")]);
    expect(mockRpc).toHaveBeenCalledWith("get_cardio_ruta_preview_points", {
      p_ruta_ids: ["r1"],
      p_max_points: 120,
    });
    expect(hydrated.cardio_ruta_punto).toHaveLength(2);
    expect(hydrated.cardio_ruta_punto?.[0]).toMatchObject({ lat: 40.4, lng: -3.7, orden: 0 });
  });
});
