import { describe, expect, it } from "vitest";
import {
  inferGymTipo,
  shouldImportOsmTags,
  sportsCentreNameMatches,
  sportsHallNameMatches,
} from "../../../scripts/lib/gymOsm.mjs";
import { rowFromOsmElement } from "../../../scripts/lib/gymOsmMap.mjs";
import {
  addressPatchFromIncoming,
  findNearbyDuplicate,
  namesLookSimilar,
} from "../../../scripts/lib/gymDedup.mjs";
import {
  barcelonaGymsFromRecords,
  isBarcelonaMunicipalFacility,
  madridGymsFromGraph,
} from "../../../scripts/lib/gymOpendata.mjs";

describe("filtros OSM", () => {
  it("importa fitness_centre y amenity=gym", () => {
    expect(shouldImportOsmTags({ leisure: "fitness_centre", name: "McFit" })).toBe(true);
    expect(shouldImportOsmTags({ amenity: "gym", name: "Box" })).toBe(true);
  });

  it("importa sports_centre con nombre de polideportivo o sport de fitness", () => {
    expect(sportsCentreNameMatches("Polideportivo Municipal Sur")).toBe(true);
    expect(sportsCentreNameMatches("Centre Esportiu Les Corts")).toBe(true);
    expect(
      shouldImportOsmTags({ leisure: "sports_centre", name: "Polideportivo El Soto" }),
    ).toBe(true);
    expect(
      shouldImportOsmTags({ leisure: "sports_centre", name: "Club de Tenis", sport: "tennis" }),
    ).toBe(false);
    expect(
      shouldImportOsmTags({
        leisure: "sports_centre",
        name: "Complejo Norte",
        sport: "fitness;swimming",
      }),
    ).toBe(true);
  });

  it("importa sports_hall solo con nombre de gimnasio/polideportivo", () => {
    expect(sportsHallNameMatches("Pabellón de baloncesto")).toBe(false);
    expect(
      shouldImportOsmTags({ leisure: "sports_hall", name: "Pabellón Municipal de Baloncesto" }),
    ).toBe(false);
    expect(shouldImportOsmTags({ leisure: "sports_hall", name: "Gimnasio del Pabellón" })).toBe(
      true,
    );
  });

  it("no importa fitness_station ni POIs sin tags útiles", () => {
    expect(shouldImportOsmTags({ leisure: "fitness_station", name: "Parque" })).toBe(false);
    expect(shouldImportOsmTags({})).toBe(false);
    expect(shouldImportOsmTags(null)).toBe(false);
  });

  it("infiere tipo municipal, private o unknown", () => {
    expect(
      inferGymTipo({ name: "Polideportivo Municipal Centro", brand: null, operatorType: null }),
    ).toBe("municipal");
    expect(inferGymTipo({ name: "McFit", brand: "McFit", operatorType: null })).toBe("private");
    expect(
      inferGymTipo({ name: "Sala de pesas", brand: null, operatorType: "government" }),
    ).toBe("municipal");
    expect(inferGymTipo({ name: "Box Independiente", brand: null, operatorType: null })).toBe(
      "unknown",
    );
  });

  it("mapea un elemento Overpass a fila de catálogo", () => {
    const row = rowFromOsmElement({
      type: "node",
      id: 123,
      lat: 40.42,
      lon: -3.7,
      tags: {
        leisure: "sports_centre",
        name: "Polideportivo Municipal Aluche",
        "addr:city": "Madrid",
        "operator:type": "government",
      },
    });
    expect(row).toMatchObject({
      osm_id: 123,
      osm_type: "node",
      nombre: "Polideportivo Municipal Aluche",
      ciudad: "Madrid",
      source: "osm",
      tipo: "municipal",
    });
    expect(
      rowFromOsmElement({
        type: "node",
        id: 1,
        lat: 40,
        lon: -3,
        tags: { leisure: "sports_centre", name: "Club de Tenis", sport: "tennis" },
      }),
    ).toBeNull();
  });
});

describe("deduplicación espacial", () => {
  it("considera similares CDM y polideportivo con el mismo nombre propio", () => {
    expect(namesLookSimilar("Centro Deportivo Municipal Alcántara", "CDM Alcántara")).toBe(
      true,
    );
    expect(namesLookSimilar("Polideportivo El Soto", "Basic-Fit Chamberí")).toBe(false);
  });

  it("omite un opendata si hay OSM cerca con nombre parecido", () => {
    const existing = [
      {
        id: "osm-1",
        nombre: "Polideportivo Municipal Alcántara",
        lat: 40.4281,
        lng: -3.6737,
        direccion: null,
        ciudad: null,
      },
    ];
    const duplicate = findNearbyDuplicate(
      {
        nombre: "Centro Deportivo Municipal Alcántara",
        lat: 40.42815,
        lng: -3.67375,
        direccion: "Calle Alcántara 26",
        ciudad: "Madrid",
      },
      existing,
      { maxMeters: 80 },
    );
    expect(duplicate?.id).toBe("osm-1");
    expect(addressPatchFromIncoming(duplicate!, {
      nombre: "Centro Deportivo Municipal Alcántara",
      lat: 40.42815,
      lng: -3.67375,
      direccion: "Calle Alcántara 26",
      ciudad: "Madrid",
    })).toEqual({ direccion: "Calle Alcántara 26", ciudad: "Madrid" });
  });

  it("no fusiona gimnasios cercanos con nombres distintos", () => {
    const duplicate = findNearbyDuplicate(
      { nombre: "McFit Sol", lat: 40.4168, lng: -3.7038 },
      [{ id: "a", nombre: "Basic-Fit Sol", lat: 40.41685, lng: -3.70385 }],
      { maxMeters: 80 },
    );
    expect(duplicate).toBeNull();
  });

  it("no fusiona el mismo nombre si está lejos", () => {
    const duplicate = findNearbyDuplicate(
      { nombre: "Basic-Fit", lat: 41.39, lng: 2.17 },
      [{ id: "mad", nombre: "Basic-Fit", lat: 40.42, lng: -3.7 }],
      { maxMeters: 80 },
    );
    expect(duplicate).toBeNull();
  });
});

describe("datos abiertos municipales", () => {
  it("deduplica el grafo de Madrid por id y exige coordenadas", () => {
    const rows = madridGymsFromGraph([
      {
        id: "101",
        title: "Centro Deportivo Municipal Alcántara",
        location: { latitude: 40.4281, longitude: -3.6737 },
        address: { "street-address": "CALLE ALCANTARA 26", locality: "MADRID" },
      },
      {
        id: "101",
        title: "Centro Deportivo Municipal Alcántara",
        location: { latitude: 40.4281, longitude: -3.6737 },
      },
      {
        id: "102",
        title: "Sin coords",
        location: {},
      },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      provider: "madrid",
      external_id: "101",
      source: "opendata",
      tipo: "municipal",
      direccion: "CALLE ALCANTARA 26",
    });
  });

  it("filtra CEM municipales de Barcelona y agrupa por institución", () => {
    expect(
      isBarcelonaMunicipalFacility({
        institutionName: "Centre Esportiu Municipal Can Dragó",
        name: "Pistes Poliesportives",
      }),
    ).toBe(true);
    expect(
      isBarcelonaMunicipalFacility({
        institutionName: "Club Natació Montjuïc",
        name: "Sala Especialitzada",
      }),
    ).toBe(false);

    const rows = barcelonaGymsFromRecords([
      {
        institution_id: "92086032989",
        institution_name: "Centre Esportiu Municipal Can Dragó",
        name: "Pistes Poliesportives",
        geo_epgs_4326_lat: "41.4353",
        geo_epgs_4326_lon: "2.1827",
        addresses_road_name: "C Rosselló i Porcel",
        addresses_start_street_number: "7",
        addresses_town: "BARCELONA",
      },
      {
        institution_id: "92086032989",
        institution_name: "Centre Esportiu Municipal Can Dragó",
        name: "Pista d'Atletisme",
        geo_epgs_4326_lat: "41.4382",
        geo_epgs_4326_lon: "2.1838",
        addresses_town: "BARCELONA",
      },
      {
        institution_id: "92168152921",
        institution_name: "Club Natació Montjuïc",
        name: "Sala Especialitzada",
        geo_epgs_4326_lat: "41.36",
        geo_epgs_4326_lon: "2.14",
        addresses_town: "BARCELONA",
      },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      provider: "barcelona",
      external_id: "92086032989",
      nombre: "Centre Esportiu Municipal Can Dragó",
      tipo: "municipal",
    });
  });
});
