import { describe, expect, it } from "vitest";
import {
  inferGymTipo,
  shouldImportOsmTags,
  sportsCentreNameMatches,
  sportsHallNameMatches,
  SPAIN_PROVINCIAL_CAPITALS,
  capitalOverpassQuery,
} from "../../../scripts/lib/gymOsm.mjs";
import { rowFromOsmElement, catalogRowForUpsert } from "../../../scripts/lib/gymOsmMap.mjs";
import {
  addressPatchFromIncoming,
  findNearbyDuplicate,
  namesLookSimilar,
} from "../../../scripts/lib/gymDedup.mjs";
import {
  barcelonaGymsFromRecords,
  cordobaGymsFromGeoJson,
  donostiaGymsFromGeoJson,
  euskadiGymsFromJson,
  isBarcelonaMunicipalFacility,
  isGymLikeFacilityName,
  madridGymsFromGraph,
  malagaGymsFromGeoJson,
  riojaGymsFromGml,
  santaCruzGymsFromGeoJson,
  utmZone30ToWgs84,
  valenciaGymsFromArcGis,
  vigoGymsFromGeoJson,
  zaragozaGymsFromCategory,
} from "../../../scripts/lib/gymOpendata.mjs";

describe("filtros OSM", () => {
  it("cubre las 50 capitales de provincia más Ceuta y Melilla", () => {
    expect(SPAIN_PROVINCIAL_CAPITALS).toHaveLength(52);
    expect(new Set(SPAIN_PROVINCIAL_CAPITALS.map((c) => c.id)).size).toBe(52);
    expect(SPAIN_PROVINCIAL_CAPITALS.every((c) => /^\d{5}$/.test(c.ine))).toBe(true);
    expect(capitalOverpassQuery({ ine: "41091", wikidata: "Q8717" })).toContain(
      'rel["ine:municipio"="41091"]',
    );
  });
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
    expect(rowFromOsmElement({
        type: "node",
        id: 1,
        lat: 40,
        lon: -3,
        tags: { leisure: "sports_centre", name: "Club de Tenis", sport: "tennis" },
      }),
    ).toBeNull();
  });

  it("rellena la ciudad de la capital si OSM no trae addr:city", () => {
    const row = rowFromOsmElement(
      {
        type: "node",
        id: 9,
        lat: 37.39,
        lon: -5.99,
        tags: { leisure: "fitness_centre", name: "Basic-Fit Nervión" },
      },
      { ciudad: "Sevilla" },
    );
    expect(row?.ciudad).toBe("Sevilla");
  });

  it("omite direccion nula en el upsert para no borrar calles ya enriquecidas", () => {
    expect(
      catalogRowForUpsert({
        nombre: "Basic-Fit",
        direccion: null,
        ciudad: "Logroño",
        brand: "Basic-Fit",
      }),
    ).toEqual({
      nombre: "Basic-Fit",
      ciudad: "Logroño",
      brand: "Basic-Fit",
    });
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

  it("filtra el censo de Euskadi a kiroldegi/gimnasio y usa X/Y como lat/lng", () => {
    expect(isGymLikeFacilityName("Kiroldegia Municipal")).toBe(true);
    expect(isGymLikeFacilityName("FRONTÓN MUNICIPAL MENDIBARREN")).toBe(false);
    const rows = euskadiGymsFromJson([
      {
        Codigo: 1,
        Nombre: "KIROLDEGIA MUNICIPAL",
        Municipio: "Berriatua",
        Direccion: "ZEHARBIDE 10",
        Geoposición_XY: { X: "43.3079", Y: "-2.4671" },
      },
      {
        Codigo: 2,
        Nombre: "FRONTÓN MUNICIPAL MENDIBARREN",
        Municipio: "Berriatua",
        Geoposición_XY: { X: "43.30", Y: "-2.46" },
      },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      provider: "euskadi",
      ciudad: "Berriatua",
      lat: 43.3079,
      lng: -2.4671,
    });
  });

  it("mapea GeoJSON de Málaga, Vigo, Donostia y ArcGIS de Valencia", () => {
    expect(
      malagaGymsFromGeoJson({
        features: [
          {
            geometry: { type: "Point", coordinates: [-4.42, 36.75] },
            properties: { ID: 249, NOMBRE: "PISCINA MUNICIPAL", DIRECCION: "AVENIDA 16" },
          },
        ],
      })[0],
    ).toMatchObject({ provider: "malaga", ciudad: "Málaga", nombre: "PISCINA MUNICIPAL" });

    expect(
      vigoGymsFromGeoJson({
        features: [
          {
            geometry: { type: "Point", coordinates: [-8.73, 42.23] },
            properties: { id: 784, nombre: "Ximnasio Municipal do Berbés", calle: "RUA 1", lat: 42.23, lon: -8.73 },
          },
        ],
      }),
    ).toHaveLength(1);

    expect(
      donostiaGymsFromGeoJson({
        features: [
          {
            geometry: { type: "Point", coordinates: [-1.97, 43.3] },
            properties: { NomEdifici: "KIROLDEGIA", Subtipo: "POLIDEPORTIVO", Indizea: "1", NomCalle: "Paseo" },
          },
          {
            geometry: { type: "Point", coordinates: [-1.97, 43.3] },
            properties: { NomEdifici: "ANOETAKO UDAL ESTADIOA", Subtipo: "CAMPO FUTBOL", Indizea: "2" },
          },
        ],
      }).map((r) => r.nombre),
    ).toEqual(["KIROLDEGIA"]);

    expect(
      valenciaGymsFromArcGis({
        features: [
          {
            attributes: { identifica: "3171", equipamien: "COMPLEX ESPORTIU PATRAIX", clase: "Instalaciones deportivas" },
            geometry: { x: -0.39, y: 39.46 },
          },
        ],
      })[0],
    ).toMatchObject({ provider: "valencia", ciudad: "Valencia" });
  });

  it("convierte UTM de Zaragoza y mapea Córdoba y Santa Cruz", () => {
    const wgs = utmZone30ToWgs84(675333.06, 4611793.81);
    expect(wgs.lat).toBeGreaterThan(41.6);
    expect(wgs.lat).toBeLessThan(41.7);
    expect(wgs.lng).toBeGreaterThan(-1.0);
    expect(wgs.lng).toBeLessThan(-0.8);

    const zgz = zaragozaGymsFromCategory({
      equipamiento: [
        {
          id: 101,
          title: "Centro Deportivo Municipal Delicias",
          calle: "C/ Moreno Alcañiz, 2",
          geometry: { type: "Point", coordinates: [675333.06, 4611793.81] },
        },
        {
          id: 102,
          title: "Oficinas administrativas",
          geometry: { type: "Point", coordinates: [675333.06, 4611793.81] },
        },
      ],
    });
    expect(zgz).toHaveLength(1);
    expect(zgz[0]).toMatchObject({ provider: "zaragoza", ciudad: "Zaragoza", external_id: "101" });

    expect(
      cordobaGymsFromGeoJson({
        features: [
          {
            geometry: { type: "Point", coordinates: [-4.76, 37.88] },
            properties: { ID: "IMD010", name: "CD El Arcángel", Dirección: "Avda. 1" },
          },
          {
            geometry: { type: "Point", coordinates: [-4.76, 37.88] },
            properties: { ID: "IMD001", name: "Oficinas Centrales IMDECO" },
          },
        ],
      }).map((r) => r.nombre),
    ).toEqual(["CD El Arcángel"]);

    expect(
      santaCruzGymsFromGeoJson({
        features: [
          {
            geometry: { type: "Point", coordinates: [-16.25, 28.46] },
            properties: { GEOCODIGO: "DEP_010", NOMBRE: "POLIDEPORTIVO MUNICIPAL SALUD ALTA" },
          },
          {
            geometry: { type: "Point", coordinates: [-16.19, 28.51] },
            properties: { GEOCODIGO: "DEP_003", NOMBRE: "CAMPO DE FUTBOL SAN ANDRES" },
          },
        ],
      }).map((r) => r.nombre),
    ).toEqual(["POLIDEPORTIVO MUNICIPAL SALUD ALTA"]);
  });

  it("parsea GML de IDErioja (EPSG:25830) y crea filas para La Rioja", () => {
    const xml = `
      <wfs:FeatureCollection>
        <gml:featureMember>
          <ms:instalaciones_deportivas gml:id="inst1">
            <ms:msGeometry>
              <gml:Point srsName="EPSG:25830">
                <gml:pos>582113.420000 4658025.790000</gml:pos>
              </gml:Point>
            </ms:msGeometry>
            <ms:T175_ID>1159264</ms:T175_ID>
            <ms:T175_NOMBRE>Pista Municipal de Deportes</ms:T175_NOMBRE>
            <ms:T175_000_INEMUNICIPIO_DENO>Igea</ms:T175_000_INEMUNICIPIO_DENO>
          </ms:instalaciones_deportivas>
        </gml:featureMember>
      </wfs:FeatureCollection>
    `;

    const rows = riojaGymsFromGml(xml);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      provider: "rioja",
      external_id: "1159264",
      nombre: "Pista Municipal de Deportes",
      ciudad: "Igea",
      source: "opendata",
      tipo: "unknown",
      direccion: null,
    });
    expect(rows[0].lat).toBeGreaterThan(41);
    expect(rows[0].lat).toBeLessThan(43);
    expect(rows[0].lng).toBeGreaterThan(-3);
    expect(rows[0].lng).toBeLessThan(-1);
  });
});
