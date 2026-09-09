import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc,
  },
}));

import { fetchGimnasiosSearch, gimnasiosSearchQueryKey } from "@/hooks/useGimnasios";

describe("fetchGimnasiosSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rpc.mockResolvedValue({
      data: [
        {
          id: "g1",
          nombre: "Basic-Fit",
          lat: 40.42,
          lng: -3.7,
          direccion: "Calle Mayor 12",
          ciudad: "Madrid",
          brand: "Basic-Fit",
          source: "osm",
          tipo: "private",
          distance_km: 0.4,
        },
      ],
      error: null,
    });
  });

  it("llama a search_gimnasios con bbox, texto y pines", async () => {
    const rows = await fetchGimnasiosSearch({
      query: "basic",
      origin: { lat: 40.42, lng: -3.7 },
      bbox: { minLat: 40.3, maxLat: 40.5, minLng: -3.8, maxLng: -3.6 },
      pinnedIds: ["pin-1", "pin-1", null],
      limit: 50,
    });

    expect(rpc).toHaveBeenCalledWith("search_gimnasios", {
      p_query: "basic",
      p_lat: 40.42,
      p_lng: -3.7,
      p_min_lat: 40.3,
      p_max_lat: 40.5,
      p_min_lng: -3.8,
      p_max_lng: -3.6,
      p_pinned_ids: ["pin-1"],
      p_limit: 50,
    });
    expect(rows).toEqual([
      {
        id: "g1",
        nombre: "Basic-Fit",
        lat: 40.42,
        lng: -3.7,
        direccion: "Calle Mayor 12",
        ciudad: "Madrid",
        brand: "Basic-Fit",
        source: "osm",
        tipo: "private",
        distanceKm: 0.4,
      },
    ]);
  });

  it("estabiliza la query key redondeando coordenadas", () => {
    const a = gimnasiosSearchQueryKey({
      origin: { lat: 40.4204, lng: -3.7038 },
      query: "  Basic ",
    });
    const b = gimnasiosSearchQueryKey({
      origin: { lat: 40.4201, lng: -3.7039 },
      query: "Basic",
    });
    expect(a).toEqual(b);
  });
});
