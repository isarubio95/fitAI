import { describe, expect, it } from "vitest";
import {
  duplicateGymNames,
  formatGimnasioListTitle,
  formatGymDistance,
  gymMatchesQuery,
  haversineKm,
  rankGimnasios,
} from "@/lib/gimnasioSearch";
import type { GimnasioCatalogItem } from "@/types/gimnasio";

function gym(partial: Partial<GimnasioCatalogItem> & Pick<GimnasioCatalogItem, "id" | "nombre" | "lat" | "lng">): GimnasioCatalogItem {
  return {
    direccion: null,
    ciudad: null,
    brand: null,
    source: "osm",
    ...partial,
  };
}

describe("gimnasioSearch", () => {
  it("calcula distancia Haversine entre Madrid y Valencia", () => {
    const km = haversineKm(
      { lat: 40.4168, lng: -3.7038 },
      { lat: 39.4699, lng: -0.3763 },
    );
    expect(km).toBeGreaterThan(280);
    expect(km).toBeLessThan(320);
  });

  it("formatea metros y kilómetros", () => {
    expect(formatGymDistance(0.35)).toBe("350 m");
    expect(formatGymDistance(2.34)).toBe("2.3 km");
    expect(formatGymDistance(18.6)).toBe("19 km");
  });

  it("filtra por nombre ignorando acentos", () => {
    const basic = gym({
      id: "1",
      nombre: "Básico Fit Chamberí",
      lat: 40.43,
      lng: -3.7,
      ciudad: "Madrid",
    });
    expect(gymMatchesQuery(basic, "basico")).toBe(true);
    expect(gymMatchesQuery(basic, "chamberi")).toBe(true);
    expect(gymMatchesQuery(basic, "valencia")).toBe(false);
  });

  it("ordena por cercanía y pone el reciente primero", () => {
    const origin = { lat: 40.42, lng: -3.7 };
    const ranked = rankGimnasios(
      [
        gym({ id: "far", nombre: "Lejos", lat: 41.4, lng: 2.17, ciudad: "Barcelona" }),
        gym({ id: "near", nombre: "Cerca", lat: 40.421, lng: -3.701, ciudad: "Madrid" }),
        gym({ id: "recent", nombre: "Reciente", lat: 40.5, lng: -3.7, ciudad: "Madrid" }),
      ],
      { origin, recentId: "recent", limit: 10 },
    );
    expect(ranked.map((g) => g.id)).toEqual(["recent", "near", "far"]);
    expect(ranked[1].distanceKm).toBeLessThan(ranked[2].distanceKm!);
  });

  it("distingue franquicias con calle y número entre paréntesis", () => {
    expect(
      formatGimnasioListTitle({
        nombre: "Basic-Fit",
        direccion: "Calle Mayor 12",
        ciudad: "Madrid",
        brand: "Basic-Fit",
      }),
    ).toBe("Basic-Fit (Calle Mayor 12)");
  });

  it("usa la ciudad si el nombre se repite y no hay calle", () => {
    const duplicates = duplicateGymNames([
      { nombre: "Basic-Fit" },
      { nombre: "Basic-Fit" },
      { nombre: "Box Independiente" },
    ]);
    expect(
      formatGimnasioListTitle(
        { nombre: "Basic-Fit", direccion: null, ciudad: "Valencia", brand: null },
        duplicates,
      ),
    ).toBe("Basic-Fit (Valencia)");
    expect(
      formatGimnasioListTitle(
        { nombre: "Box Independiente", direccion: null, ciudad: "Valencia", brand: null },
        duplicates,
      ),
    ).toBe("Box Independiente");
  });

  it("no duplica la calle si ya va en el nombre", () => {
    expect(
      formatGimnasioListTitle({
        nombre: "Basic-Fit Calle Mayor",
        direccion: "Calle Mayor",
        ciudad: "Madrid",
        brand: "Basic-Fit",
      }),
    ).toBe("Basic-Fit Calle Mayor");
  });
});
