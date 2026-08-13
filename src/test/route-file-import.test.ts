import { describe, expect, it } from "vitest";
import {
  detectRouteFileFormat,
  parseRouteFileContent,
  routeNameFromFileName,
} from "@/lib/routeFileImport";

const GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Strava" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>Ignorado</name></metadata>
  <trk>
    <name>Vuelta al parque</name>
    <trkseg>
      <trkpt lat="40.4168" lon="-3.7038"><ele>655.2</ele></trkpt>
      <trkpt lat="40.4178" lon="-3.7048"><ele>658.0</ele></trkpt>
    </trkseg>
    <trkseg>
      <trkpt lat="40.4188" lon="-3.7058"></trkpt>
    </trkseg>
  </trk>
</gpx>`;

const GPX_WITH_PREFIX = `<?xml version="1.0"?>
<gpx:gpx xmlns:gpx="http://www.topografix.com/GPX/1/1">
  <gpx:rte>
    <gpx:name>Ruta planificada</gpx:name>
    <gpx:rtept lat="43.36" lon="-2.99"><gpx:ele>12</gpx:ele></gpx:rtept>
    <gpx:rtept lat="43.37" lon="-2.98"/>
  </gpx:rte>
</gpx:gpx>`;

const TCX = `<?xml version="1.0"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Courses><Course>
    <Name>Subida al puerto</Name>
    <Track>
      <Trackpoint>
        <Position><LatitudeDegrees>42.1</LatitudeDegrees><LongitudeDegrees>-1.5</LongitudeDegrees></Position>
        <AltitudeMeters>410.5</AltitudeMeters>
      </Trackpoint>
      <Trackpoint>
        <Position><LatitudeDegrees>42.2</LatitudeDegrees><LongitudeDegrees>-1.6</LongitudeDegrees></Position>
      </Trackpoint>
      <Trackpoint><AltitudeMeters>420</AltitudeMeters></Trackpoint>
    </Track>
  </Course></Courses>
</TrainingCenterDatabase>`;

const KML = `<?xml version="1.0"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Sendero del río</name>
    <Placemark><LineString><coordinates>
      -3.70,40.41,600
      -3.71,40.42,610
      -3.72,40.43
    </coordinates></LineString></Placemark>
  </Document>
</kml>`;

const GEOJSON = JSON.stringify({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Circular del monte" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-5.1, 41.1, 800],
          [-5.2, 41.2],
        ],
      },
    },
  ],
});

describe("detectRouteFileFormat", () => {
  it("usa la extensión del archivo", () => {
    expect(detectRouteFileFormat("cualquier cosa", "ruta.GPX")).toBe("gpx");
    expect(detectRouteFileFormat("{}", "ruta.geojson")).toBe("geojson");
  });

  it("olfatea el contenido cuando no hay extensión útil", () => {
    expect(detectRouteFileFormat(GPX)).toBe("gpx");
    expect(detectRouteFileFormat(TCX)).toBe("tcx");
    expect(detectRouteFileFormat(KML)).toBe("kml");
    expect(detectRouteFileFormat(GEOJSON, "ruta.json")).toBe("geojson");
  });

  it("null si no reconoce nada", () => {
    expect(detectRouteFileFormat("lat,lng\n40,-3", "ruta.csv")).toBeNull();
  });
});

describe("parseRouteFileContent · GPX", () => {
  it("concatena los segmentos del track y prefiere el nombre del trk", () => {
    const route = parseRouteFileContent(GPX, "export.gpx");
    expect(route.nombre).toBe("Vuelta al parque");
    expect(route.points).toEqual([
      { lat: 40.4168, lng: -3.7038, elevacion_m: 655.2 },
      { lat: 40.4178, lng: -3.7048, elevacion_m: 658 },
      { lat: 40.4188, lng: -3.7058, elevacion_m: null },
    ]);
  });

  it("cae a los puntos de ruta y tolera prefijos de namespace", () => {
    const route = parseRouteFileContent(GPX_WITH_PREFIX, "plan.gpx");
    expect(route.nombre).toBe("Ruta planificada");
    expect(route.points).toHaveLength(2);
    expect(route.points[0].elevacion_m).toBe(12);
  });
});

describe("parseRouteFileContent · TCX", () => {
  it("lee Trackpoints con posición y descarta los que no la tienen", () => {
    const route = parseRouteFileContent(TCX, "course.tcx");
    expect(route.nombre).toBe("Subida al puerto");
    expect(route.points).toEqual([
      { lat: 42.1, lng: -1.5, elevacion_m: 410.5 },
      { lat: 42.2, lng: -1.6, elevacion_m: null },
    ]);
  });
});

describe("parseRouteFileContent · KML", () => {
  it("invierte el orden lng,lat y admite tuplas sin altitud", () => {
    const route = parseRouteFileContent(KML, "sendero.kml");
    expect(route.nombre).toBe("Sendero del río");
    expect(route.points).toEqual([
      { lat: 40.41, lng: -3.7, elevacion_m: 600 },
      { lat: 40.42, lng: -3.71, elevacion_m: 610 },
      { lat: 40.43, lng: -3.72, elevacion_m: null },
    ]);
  });
});

describe("parseRouteFileContent · GeoJSON", () => {
  it("lee la LineString y su nombre", () => {
    const route = parseRouteFileContent(GEOJSON, "monte.geojson");
    expect(route.nombre).toBe("Circular del monte");
    expect(route.points).toEqual([
      { lat: 41.1, lng: -5.1, elevacion_m: 800 },
      { lat: 41.2, lng: -5.2, elevacion_m: null },
    ]);
  });

  it("acepta una geometría suelta y usa el nombre del archivo", () => {
    const content = JSON.stringify({
      type: "LineString",
      coordinates: [
        [1, 2],
        [3, 4],
      ],
    });
    const route = parseRouteFileContent(content, "mi_ruta_favorita.geojson");
    expect(route.nombre).toBe("mi ruta favorita");
    expect(route.points).toHaveLength(2);
  });
});

describe("parseRouteFileContent · errores", () => {
  it("formato desconocido", () => {
    expect(() => parseRouteFileContent("hola", "ruta.txt")).toThrow(/Formato no reconocido/);
  });

  it("XML sin coordenadas válidas", () => {
    const empty = `<gpx><trk><name>Vacío</name><trkseg></trkseg></trk></gpx>`;
    expect(() => parseRouteFileContent(empty, "vacio.gpx")).toThrow(/no contiene un recorrido/);
  });

  it("descarta coordenadas fuera de rango o en 0,0", () => {
    const invalid = `<gpx><trk><trkseg>
      <trkpt lat="0" lon="0"/>
      <trkpt lat="120" lon="-3"/>
      <trkpt lat="40.4" lon="-3.7"/>
    </trkseg></trk></gpx>`;
    expect(() => parseRouteFileContent(invalid, "malo.gpx")).toThrow(/no contiene un recorrido/);
  });

  it("JSON roto", () => {
    expect(() => parseRouteFileContent("{no es json", "ruta.geojson")).toThrow(/JSON válido/);
  });

  it("ignora altitudes imposibles", () => {
    const content = `<gpx><trk><trkseg>
      <trkpt lat="40.4" lon="-3.7"><ele>99999</ele></trkpt>
      <trkpt lat="40.5" lon="-3.8"><ele>-2000</ele></trkpt>
    </trkseg></trk></gpx>`;
    const route = parseRouteFileContent(content, "raro.gpx");
    expect(route.points.map((p) => p.elevacion_m)).toEqual([null, null]);
  });
});

describe("routeNameFromFileName", () => {
  it("quita extensión y normaliza separadores", () => {
    expect(routeNameFromFileName("ruta_del_agua-2024.gpx")).toBe("ruta del agua 2024");
    expect(routeNameFromFileName("")).toBeNull();
    expect(routeNameFromFileName(null)).toBeNull();
  });
});
