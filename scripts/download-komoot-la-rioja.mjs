/**
 * Descarga las rutas públicas más populares de Komoot en La Rioja → GPX + index.json
 *
 * Por defecto: top 50 por deporte (visitors → rating). API interna v007 (no oficial).
 *
 * Uso:
 *   node scripts/download-komoot-la-rioja.mjs
 *   node scripts/download-komoot-la-rioja.mjs --per-sport 50 --sports hike,mtb
 *   node scripts/download-komoot-la-rioja.mjs --discover-only
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const API = "https://api.komoot.de/v007";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/** Bbox aprox. de la provincia de La Rioja (WGS84). */
const LA_RIOJA = {
  minLat: 41.95,
  maxLat: 42.64,
  minLng: -3.05,
  maxLng: -1.74,
};

const DEFAULT_SPORTS = ["hike", "mtb", "touringbicycle", "racebike", "jogging"];
const PAGE_SIZE = 12;

function parseArgs(argv) {
  const args = {
    out: path.resolve("public/predefined-routes/la-rioja"),
    sports: DEFAULT_SPORTS,
    perSport: 50,
    delayMs: 600,
    radiusM: 20_000,
    discoverOnly: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--out") args.out = path.resolve(next());
    else if (a === "--sports")
      args.sports = next()
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    else if (a === "--per-sport" || a === "--max") args.perSport = Number(next());
    else if (a === "--delay") args.delayMs = Number(next());
    else if (a === "--radius") args.radiusM = Number(next());
    else if (a === "--discover-only") args.discoverOnly = true;
    else throw new Error(`Argumento desconocido: ${a}`);
  }
  return args;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function inBbox(lat, lng, bbox = LA_RIOJA, margin = 0.01) {
  return (
    lat >= bbox.minLat - margin &&
    lat <= bbox.maxLat + margin &&
    lng >= bbox.minLng - margin &&
    lng <= bbox.maxLng + margin
  );
}

function numericTourId(id) {
  return String(id).replace(/^e/i, "");
}

function popularityScore(tour) {
  const visitors = Number(tour.visitors) || 0;
  const ratingScore = Number(tour.ratingScore) || 0;
  const ratingCount = Number(tour.ratingCount) || 0;
  return visitors * 1000 + ratingScore * 100 + ratingCount;
}

function sanitizeFileName(name, id) {
  const base = String(name || "ruta")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);
  return `${base || "ruta"}-${id}.gpx`;
}

function escapeXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function coordsToGpx({ name, description, sport, url, points }) {
  const trkpts = points
    .map((p) => {
      const ele = Number.isFinite(p.alt) ? `\n      <ele>${p.alt}</ele>` : "";
      return `    <trkpt lat="${p.lat}" lon="${p.lng}">${ele}\n    </trkpt>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="fitAI Komoot downloader" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(name)}</name>
    ${description ? `<desc>${escapeXml(description)}</desc>` : ""}
    ${url ? `<link href="${escapeXml(url)}"><text>Komoot</text></link>` : ""}
  </metadata>
  <trk>
    <name>${escapeXml(name)}</name>
    ${sport ? `<type>${escapeXml(sport)}</type>` : ""}
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>
`;
}

async function komootFetch(url, { delayMs }) {
  await sleep(delayMs);
  const res = await fetch(url, {
    headers: {
      Accept: "application/hal+json, application/json",
      "Accept-Language": "es",
      "User-Agent": UA,
      Referer: "https://www.komoot.com/",
      Origin: "https://www.komoot.com",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${url}\n${body.slice(0, 300)}`);
  }
  return res.json();
}

async function discoverPage(lat, lng, radiusM, sport, delayMs) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    max_distance: String(Math.round(radiusM)),
    sport: sport.toUpperCase(),
    page: "0",
    limit: String(PAGE_SIZE),
    hl: "es",
    public_transport: "false",
    shuffle: "false",
  });
  const json = await komootFetch(`${API}/discover_tours/?${params}`, { delayMs });
  return json._embedded?.items ?? [];
}

function gridCenters(bbox, stepDeg) {
  const centers = [];
  for (let lat = bbox.minLat; lat <= bbox.maxLat; lat += stepDeg) {
    for (let lng = bbox.minLng; lng <= bbox.maxLng; lng += stepDeg) {
      centers.push([Math.round(lat * 1e5) / 1e5, Math.round(lng * 1e5) / 1e5]);
    }
  }
  return centers;
}

function summarizeTour(item) {
  const discoverId = String(item.id);
  const id = numericTourId(discoverId);
  const name =
    item.name_translation_metadata?.original_text || item.name || `tour-${id}`;
  const sourceType = (() => {
    try {
      return JSON.parse(item.source || "{}").type ?? null;
    } catch {
      return null;
    }
  })();
  return {
    id,
    discoverId,
    sourceType,
    name,
    sport: item.sport,
    status: item.status,
    distanceM: item.distance ?? null,
    elevationUpM: item.elevation_up ?? null,
    elevationDownM: item.elevation_down ?? null,
    durationS: item.duration ?? null,
    difficulty: item.difficulty?.grade ?? null,
    visitors: item.visitors ?? 0,
    ratingScore: item.rating_score ?? null,
    ratingCount: item.rating_count ?? 0,
    startPoint: item.start_point
      ? { lat: item.start_point.lat, lng: item.start_point.lng, alt: item.start_point.alt }
      : null,
    url: `https://www.komoot.com/smarttour/${discoverId.startsWith("e") ? discoverId : `e${id}`}`,
  };
}

async function fetchTourCoordinates(tour, delayMs) {
  const params = new URLSearchParams({
    _embedded: "coordinates",
    format: "coordinate_array",
    hl: "es",
  });
  const qs = params.toString();
  const candidates = [
    `${API}/discover_tours/${tour.discoverId}?${qs}`,
    `${API}/tours/${tour.id}?${qs}`,
  ];

  let lastErr;
  for (const url of candidates) {
    try {
      const json = await komootFetch(url, { delayMs });
      const points = json._embedded?.coordinates?.items ?? [];
      if (points.length) return { tour: json, points };
      lastErr = new Error(`sin coordenadas en ${url}`);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error(`sin coordenadas para ${tour.id}`);
}

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function discoverSport(sport, args) {
  const byId = new Map();
  let calls = 0;
  // Rejilla media sin subdivisión: discover prioriza rutas “buenas”;
  // luego nos quedamos con el top por visitas.
  const stepDeg = Math.max(0.12, (args.radiusM * 0.85) / 111_320);
  const centers = gridCenters(LA_RIOJA, stepDeg);

  for (const [lat, lng] of centers) {
    let items;
    try {
      items = await discoverPage(lat, lng, args.radiusM, sport, args.delayMs);
      calls += 1;
    } catch (err) {
      console.warn(`  aviso ${sport} @ ${lat},${lng}: ${err.message}`);
      continue;
    }

    for (const item of items) {
      if (item.status && item.status !== "public") continue;
      const sp = item.start_point;
      if (!sp || !inBbox(sp.lat, sp.lng)) continue;
      const summary = summarizeTour(item);
      const prev = byId.get(summary.id);
      if (!prev || popularityScore(summary) > popularityScore(prev)) {
        byId.set(summary.id, { ...summary, gpx: null });
      }
    }
  }

  const ranked = [...byId.values()].sort((a, b) => popularityScore(b) - popularityScore(a));
  const top = ranked.slice(0, args.perSport).map((t, i) => ({
    ...t,
    popularityRank: i + 1,
  }));

  return { candidates: ranked.length, top, calls, cells: centers.length };
}

function printHelp() {
  console.log(`Descarga las rutas Komoot más populares de La Rioja (GPX).

Opciones:
  --out <dir>           Destino (default: public/predefined-routes/la-rioja)
  --sports a,b,c        Deportes (default: ${DEFAULT_SPORTS.join(",")})
  --per-sport <n>       Top N por deporte (default: 50). Alias: --max
  --delay <ms>          Pausa entre requests (default: 600)
  --radius <m>          Radio por celda (default: 20000)
  --discover-only       Solo índice, sin GPX
  --help                Esta ayuda
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const gpxDir = path.join(args.out, "gpx");
  const indexPath = path.join(args.out, "index.json");
  await mkdir(gpxDir, { recursive: true });

  console.log(
    `La Rioja · top ${args.perSport}/deporte · ${args.sports.join(", ")} · radio ${args.radiusM} m`,
  );

  const selected = [];
  let discoverCalls = 0;

  for (const sport of args.sports) {
    console.log(`\n→ ${sport}…`);
    const { candidates, top, calls, cells } = await discoverSport(sport, args);
    discoverCalls += calls;
    selected.push(...top);
    const preview = top
      .slice(0, 3)
      .map((t) => `${t.visitors} visitas · ${t.name.slice(0, 40)}`)
      .join("\n     ");
    console.log(`  ${cells} celdas · candidatas: ${candidates} → top ${top.length}`);
    if (preview) console.log(`     ${preview}`);
  }

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  const tours = selected.sort((a, b) => {
    if (a.sport !== b.sport) return a.sport.localeCompare(b.sport);
    return (a.popularityRank ?? 0) - (b.popularityRank ?? 0);
  });

  if (!args.discoverOnly) {
    console.log(`\nDescargando GPX (${tours.length})…`);
    for (const tour of tours) {
      const fileName = sanitizeFileName(tour.name, tour.id);
      const filePath = path.join(gpxDir, fileName);
      tour.gpx = `gpx/${fileName}`;

      if (await fileExists(filePath)) {
        skipped += 1;
        continue;
      }

      try {
        const { tour: detail, points } = await fetchTourCoordinates(tour, args.delayMs);
        if (!points.length) {
          console.warn(`  sin puntos: ${tour.id} ${tour.name}`);
          failed += 1;
          tour.gpx = null;
          continue;
        }
        const name =
          detail.name_translation_metadata?.original_text || detail.name || tour.name;
        const gpx = coordsToGpx({
          name,
          description: [
            tour.visitors != null ? `${tour.visitors} visitas` : null,
            tour.difficulty ? `Dificultad: ${tour.difficulty}` : null,
            tour.distanceM != null ? `Distancia: ${(tour.distanceM / 1000).toFixed(1)} km` : null,
            tour.elevationUpM != null ? `Desnivel +: ${Math.round(tour.elevationUpM)} m` : null,
          ]
            .filter(Boolean)
            .join(" · "),
          sport: detail.sport || tour.sport,
          url: tour.url,
          points,
        });
        await writeFile(filePath, gpx, "utf8");
        tour.name = name;
        tour.sport = detail.sport || tour.sport;
        downloaded += 1;
        if (downloaded % 10 === 0) console.log(`  … ${downloaded} nuevos GPX`);
      } catch (err) {
        console.warn(`  fallo ${tour.id}: ${err.message}`);
        failed += 1;
        tour.gpx = null;
      }
    }
  }

  const index = {
    generatedAt: new Date().toISOString(),
    region: "La Rioja",
    bbox: LA_RIOJA,
    selection: {
      mode: "top_per_sport",
      perSport: args.perSport,
      ranking: "visitors, then rating_score, then rating_count",
    },
    source: "komoot discover_tours (v007, no oficial)",
    sports: args.sports,
    stats: {
      tours: tours.length,
      downloaded,
      skippedExisting: skipped,
      failed,
      discoverCalls,
    },
    tours,
  };

  await writeFile(indexPath, JSON.stringify(index, null, 2), "utf8");

  console.log(`\nListo.`);
  console.log(`  Índice: ${indexPath}`);
  console.log(`  Rutas:  ${tours.length} (≤ ${args.perSport} × ${args.sports.length} deportes)`);
  if (!args.discoverOnly) {
    console.log(`  GPX nuevos: ${downloaded} · ya existían: ${skipped} · fallos: ${failed}`);
    console.log(`  Carpeta: ${gpxDir}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
