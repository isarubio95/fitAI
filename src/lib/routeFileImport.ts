/** Importación de recorridos desde archivos de GPS (GPX / TCX / KML / GeoJSON). */

export type ImportedRoutePoint = {
  lat: number;
  lng: number;
  elevacion_m?: number | null;
};

export type ImportedRoute = {
  /** Nombre declarado en el archivo (o null si no trae ninguno). */
  nombre: string | null;
  points: ImportedRoutePoint[];
};

export type RouteFileFormat = "gpx" | "tcx" | "kml" | "geojson";

export const ROUTE_FILE_ACCEPT = ".gpx,.tcx,.kml,.geojson,.json";

/** Tamaño máximo aceptado; un GPX de varias horas ronda 1–2 MB. */
export const MAX_ROUTE_FILE_BYTES = 12 * 1024 * 1024;

const MIN_ROUTE_POINTS = 2;

function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    // 0,0 en medio del Atlántico es el resultado típico de un campo vacío.
    !(lat === 0 && lng === 0)
  );
}

function toElevation(raw: string | number | null | undefined): number | null {
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return null;
  // Fuera de este rango es basura (o unidades equivocadas), no altitud.
  if (n < -500 || n > 9000) return null;
  return n;
}

function cleanName(raw: string | null | undefined): string | null {
  const name = raw?.trim().replace(/\s+/g, " ");
  if (!name) return null;
  return name.slice(0, 120);
}

/** Nombre a partir del archivo, sin extensión, para cuando el contenido no trae ninguno. */
export function routeNameFromFileName(fileName: string | null | undefined): string | null {
  if (!fileName) return null;
  return cleanName(fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
}

export function detectRouteFileFormat(
  content: string,
  fileName?: string | null,
): RouteFileFormat | null {
  const ext = fileName?.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (ext === "gpx") return "gpx";
  if (ext === "tcx") return "tcx";
  if (ext === "kml") return "kml";
  if (ext === "geojson") return "geojson";

  const head = content.slice(0, 2048).toLowerCase();
  if (head.includes("<gpx")) return "gpx";
  if (head.includes("<trainingcenterdatabase")) return "tcx";
  if (head.includes("<kml") || head.includes("<coordinates")) return "kml";
  // `.json` sin pista de formato: solo tiene sentido como GeoJSON.
  if (head.trimStart().startsWith("{") || head.trimStart().startsWith("[")) return "geojson";
  return null;
}

/* -------------------------------------------------------------------------- */
/* XML                                                                        */
/* -------------------------------------------------------------------------- */

function parseXmlDocument(content: string): Document {
  if (typeof DOMParser === "undefined") {
    throw new Error("Este navegador no puede leer el archivo");
  }
  const doc = new DOMParser().parseFromString(content, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("El archivo está dañado o no es XML válido");
  }
  return doc;
}

/**
 * Busca por nombre local, ignorando prefijos de namespace: los exportadores usan
 * `trkpt`, `gpx:trkpt`, `ns3:Trackpoint`… y `getElementsByTagName` distingue el prefijo.
 */
function elementsByLocalName(root: Document | Element, localName: string): Element[] {
  const target = localName.toLowerCase();
  const out: Element[] = [];
  const all = root.getElementsByTagName("*");
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    if ((el.localName || el.nodeName).toLowerCase() === target) out.push(el);
  }
  return out;
}

function firstChildValueByLocalName(parent: Element, localName: string): string | null {
  const target = localName.toLowerCase();
  for (const child of Array.from(parent.children)) {
    if ((child.localName || child.nodeName).toLowerCase() === target) {
      return child.textContent;
    }
  }
  return null;
}

function firstDescendantByLocalName(root: Document | Element, localName: string): Element | null {
  return elementsByLocalName(root, localName)[0] ?? null;
}

/* -------------------------------------------------------------------------- */
/* GPX                                                                        */
/* -------------------------------------------------------------------------- */

function pointsFromGpxNodes(nodes: Element[]): ImportedRoutePoint[] {
  const out: ImportedRoutePoint[] = [];
  for (const node of nodes) {
    const lat = Number(node.getAttribute("lat"));
    const lng = Number(node.getAttribute("lon"));
    if (!isValidLatLng(lat, lng)) continue;
    out.push({ lat, lng, elevacion_m: toElevation(firstChildValueByLocalName(node, "ele")) });
  }
  return out;
}

function parseGpx(content: string): ImportedRoute {
  const doc = parseXmlDocument(content);

  // Prioridad: track grabado > ruta planificada > waypoints suelos.
  let points = pointsFromGpxNodes(elementsByLocalName(doc, "trkpt"));
  let source: Element | null = firstDescendantByLocalName(doc, "trk");

  if (points.length < MIN_ROUTE_POINTS) {
    points = pointsFromGpxNodes(elementsByLocalName(doc, "rtept"));
    source = firstDescendantByLocalName(doc, "rte");
  }
  if (points.length < MIN_ROUTE_POINTS) {
    points = pointsFromGpxNodes(elementsByLocalName(doc, "wpt"));
    source = null;
  }

  const nombre =
    (source ? cleanName(firstChildValueByLocalName(source, "name")) : null) ??
    cleanName(
      firstDescendantByLocalName(doc, "metadata")
        ? firstChildValueByLocalName(firstDescendantByLocalName(doc, "metadata")!, "name")
        : null,
    ) ??
    cleanName(firstDescendantByLocalName(doc, "name")?.textContent);

  return { nombre, points };
}

/* -------------------------------------------------------------------------- */
/* TCX                                                                        */
/* -------------------------------------------------------------------------- */

function parseTcx(content: string): ImportedRoute {
  const doc = parseXmlDocument(content);
  const out: ImportedRoutePoint[] = [];

  for (const tp of elementsByLocalName(doc, "Trackpoint")) {
    const position = firstDescendantByLocalName(tp, "Position");
    if (!position) continue;
    const lat = Number(firstChildValueByLocalName(position, "LatitudeDegrees"));
    const lng = Number(firstChildValueByLocalName(position, "LongitudeDegrees"));
    if (!isValidLatLng(lat, lng)) continue;
    out.push({
      lat,
      lng,
      elevacion_m: toElevation(firstChildValueByLocalName(tp, "AltitudeMeters")),
    });
  }

  const course = firstDescendantByLocalName(doc, "Course");
  const nombre =
    (course ? cleanName(firstChildValueByLocalName(course, "Name")) : null) ??
    cleanName(firstDescendantByLocalName(doc, "Name")?.textContent);

  return { nombre, points: out };
}

/* -------------------------------------------------------------------------- */
/* KML                                                                        */
/* -------------------------------------------------------------------------- */

/** `lng,lat[,ele]` separados por espacios o saltos de línea. */
function parseKmlCoordinates(raw: string | null | undefined): ImportedRoutePoint[] {
  if (!raw) return [];
  const out: ImportedRoutePoint[] = [];
  for (const chunk of raw.trim().split(/\s+/)) {
    const parts = chunk.split(",");
    if (parts.length < 2) continue;
    const lng = Number(parts[0]);
    const lat = Number(parts[1]);
    if (!isValidLatLng(lat, lng)) continue;
    out.push({ lat, lng, elevacion_m: toElevation(parts[2]) });
  }
  return out;
}

function parseKml(content: string): ImportedRoute {
  const doc = parseXmlDocument(content);
  const out: ImportedRoutePoint[] = [];

  for (const line of elementsByLocalName(doc, "LineString")) {
    out.push(...parseKmlCoordinates(firstDescendantByLocalName(line, "coordinates")?.textContent));
  }

  // Tracks extendidos de Google Earth: `<gx:Track><gx:coord>lng lat ele</gx:coord>`.
  if (out.length < MIN_ROUTE_POINTS) {
    for (const coord of elementsByLocalName(doc, "coord")) {
      const parts = coord.textContent?.trim().split(/\s+/) ?? [];
      if (parts.length < 2) continue;
      const lng = Number(parts[0]);
      const lat = Number(parts[1]);
      if (!isValidLatLng(lat, lng)) continue;
      out.push({ lat, lng, elevacion_m: toElevation(parts[2]) });
    }
  }

  // Último recurso: una sucesión de Placemarks con Point.
  if (out.length < MIN_ROUTE_POINTS) {
    for (const point of elementsByLocalName(doc, "Point")) {
      out.push(
        ...parseKmlCoordinates(firstDescendantByLocalName(point, "coordinates")?.textContent),
      );
    }
  }

  const nombre = cleanName(firstDescendantByLocalName(doc, "name")?.textContent);
  return { nombre, points: out };
}

/* -------------------------------------------------------------------------- */
/* GeoJSON                                                                    */
/* -------------------------------------------------------------------------- */

type GeoJsonPosition = [number, number, ...number[]];

type GeoJsonGeometry =
  | { type: "Point"; coordinates: GeoJsonPosition }
  | { type: "MultiPoint" | "LineString"; coordinates: GeoJsonPosition[] }
  | { type: "MultiLineString" | "Polygon"; coordinates: GeoJsonPosition[][] }
  | { type: "GeometryCollection"; geometries: GeoJsonGeometry[] };

type GeoJsonFeature = { type: "Feature"; geometry?: GeoJsonGeometry | null; properties?: unknown };

type GeoJsonRoot =
  | GeoJsonGeometry
  | GeoJsonFeature
  | { type: "FeatureCollection"; features?: GeoJsonFeature[] };

function pointFromPosition(position: unknown): ImportedRoutePoint | null {
  if (!Array.isArray(position) || position.length < 2) return null;
  const lng = Number(position[0]);
  const lat = Number(position[1]);
  if (!isValidLatLng(lat, lng)) return null;
  return { lat, lng, elevacion_m: toElevation(position[2] as number | undefined) };
}

function pointsFromGeometry(geometry: GeoJsonGeometry | null | undefined): ImportedRoutePoint[] {
  if (!geometry || typeof geometry !== "object") return [];

  switch (geometry.type) {
    case "Point": {
      const point = pointFromPosition(geometry.coordinates);
      return point ? [point] : [];
    }
    case "MultiPoint":
    case "LineString":
      return (geometry.coordinates ?? [])
        .map(pointFromPosition)
        .filter((p): p is ImportedRoutePoint => p != null);
    case "MultiLineString":
    case "Polygon":
      return (geometry.coordinates ?? []).flatMap((line) =>
        (line ?? []).map(pointFromPosition).filter((p): p is ImportedRoutePoint => p != null),
      );
    case "GeometryCollection":
      return (geometry.geometries ?? []).flatMap(pointsFromGeometry);
    default:
      return [];
  }
}

function nameFromProperties(properties: unknown): string | null {
  if (!properties || typeof properties !== "object") return null;
  const record = properties as Record<string, unknown>;
  for (const key of ["name", "nombre", "title"]) {
    const value = record[key];
    if (typeof value === "string") return cleanName(value);
  }
  return null;
}

function parseGeoJson(content: string): ImportedRoute {
  let root: GeoJsonRoot;
  try {
    root = JSON.parse(content) as GeoJsonRoot;
  } catch {
    throw new Error("El archivo no es un JSON válido");
  }

  if (!root || typeof root !== "object") {
    return { nombre: null, points: [] };
  }

  if (root.type === "FeatureCollection") {
    const features = root.features ?? [];
    const points = features.flatMap((feature) => pointsFromGeometry(feature?.geometry));
    const named =
      features.find((f) => f?.geometry?.type === "LineString") ?? features[0] ?? null;
    return {
      nombre:
        nameFromProperties(named?.properties) ??
        nameFromProperties((root as { properties?: unknown }).properties),
      points,
    };
  }

  if (root.type === "Feature") {
    return {
      nombre: nameFromProperties(root.properties),
      points: pointsFromGeometry(root.geometry),
    };
  }

  return { nombre: null, points: pointsFromGeometry(root) };
}

/* -------------------------------------------------------------------------- */
/* API pública                                                                */
/* -------------------------------------------------------------------------- */

const PARSERS: Record<RouteFileFormat, (content: string) => ImportedRoute> = {
  gpx: parseGpx,
  tcx: parseTcx,
  kml: parseKml,
  geojson: parseGeoJson,
};

/**
 * Extrae el recorrido de un archivo ya leído como texto.
 * Lanza `Error` con mensaje para el usuario si el formato no se reconoce o no hay puntos.
 */
export function parseRouteFileContent(content: string, fileName?: string | null): ImportedRoute {
  const format = detectRouteFileFormat(content, fileName);
  if (!format) {
    throw new Error("Formato no reconocido. Usa un archivo GPX, TCX, KML o GeoJSON");
  }

  const parsed = PARSERS[format](content);
  if (parsed.points.length < MIN_ROUTE_POINTS) {
    throw new Error("El archivo no contiene un recorrido con coordenadas");
  }

  return { nombre: parsed.nombre ?? routeNameFromFileName(fileName), points: parsed.points };
}

export async function parseRouteFile(file: File): Promise<ImportedRoute> {
  if (file.size > MAX_ROUTE_FILE_BYTES) {
    throw new Error("El archivo es demasiado grande (máx. 12 MB)");
  }
  const content = await file.text();
  return parseRouteFileContent(content, file.name);
}
