import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG_NAME_TO_TIPO_ID } from "@/lib/lyfta/catalogNameToTipoId";
import { matchLyftaToCatalog, pretokenizeCatalog } from "@/lib/lyfta/matchLyftaCatalog";
import { normalizeExerciseName } from "@/lib/matchExerciseByName";

const LIBRARY_PATH = path.resolve("data/lyfta-library.json");
const REPORT_PATH = path.resolve("data/lyfta-verify-report.json");

const EQUIP_PREFIX: Record<string, string> = {
  barbell: "barbell",
  dumbbell: "dumbbell",
  cable: "cable",
  "leverage machine": "lever",
  "ez barbell": "ez barbell",
  kettlebell: "kettlebell",
  band: "band",
  bands: "band",
  smith: "smith",
  "smith machine": "smith",
  "body weight": "bodyweight",
};

function looksSpanish(key: string): boolean {
  return /\b(con|de|en|barra|mancuerna|polea|sentadilla|jalon|remo|peso|apertura|zancada|fondos|plancha|prensa|maquina|banda)\b/.test(
    key,
  );
}

function spanishCatalog() {
  const byId = new Map<string, { id: string; nombre: string }>();
  for (const [key, id] of Object.entries(CATALOG_NAME_TO_TIPO_ID)) {
    const existing = byId.get(id);
    if (!existing || (looksSpanish(key) && !looksSpanish(existing.nombre))) {
      byId.set(id, { id, nombre: key });
    }
  }
  return [...byId.values()];
}

type Scraped = {
  id: string;
  name: string;
  url: string | null;
  body_part: string[];
  equipment: string[];
};

type Hit = {
  lyftaId: string;
  lyftaName: string;
  equipment: string;
  bodyPart: string;
  via: "exact" | "equipment_prefix" | "token";
  query: string;
  tipoId: string;
  tipoNombre: string;
};

describe("cobertura mapa vs library pública de Lyfta", () => {
  it.skipIf(process.env.VERIFY_LYFTA !== "1")("clasifica los nombres scrapeados", () => {
    expect(fs.existsSync(LIBRARY_PATH)).toBe(true);

    const dump = JSON.parse(fs.readFileSync(LIBRARY_PATH, "utf8")) as {
      scrapedAt: string;
      count: number;
      exercises: Scraped[];
    };

    const catalog = spanishCatalog();
    const nombreById = new Map(catalog.map((c) => [c.id, c.nombre]));
    const tokenized = pretokenizeCatalog(catalog);

    const exact: Hit[] = [];
    const prefix: Hit[] = [];
    const token: Hit[] = [];
    const unmatched: Array<{
      lyftaId: string;
      lyftaName: string;
      equipment: string;
      bodyPart: string;
    }> = [];

    const lookup = (q: string) => CATALOG_NAME_TO_TIPO_ID[normalizeExerciseName(q)] ?? null;

    for (const ex of dump.exercises) {
      const equipment = (ex.equipment ?? []).join(", ");
      const bodyPart = (ex.body_part ?? []).join(", ");
      const exactId = lookup(ex.name);
      if (exactId) {
        exact.push({
          lyftaId: ex.id,
          lyftaName: ex.name,
          equipment,
          bodyPart,
          via: "exact",
          query: ex.name,
          tipoId: exactId,
          tipoNombre: nombreById.get(exactId) ?? exactId,
        });
        continue;
      }

      let prefixHit: Hit | null = null;
      for (const rawEq of ex.equipment ?? []) {
        const pref = EQUIP_PREFIX[rawEq.toLowerCase()];
        if (!pref) continue;
        const q = `${pref} ${ex.name}`;
        if (normalizeExerciseName(q) === normalizeExerciseName(ex.name)) continue;
        const tipoId = lookup(q);
        if (tipoId) {
          prefixHit = {
            lyftaId: ex.id,
            lyftaName: ex.name,
            equipment,
            bodyPart,
            via: "equipment_prefix",
            query: q,
            tipoId,
            tipoNombre: nombreById.get(tipoId) ?? tipoId,
          };
          break;
        }
      }
      if (prefixHit) {
        prefix.push(prefixHit);
        continue;
      }

      const tokenMatch =
        matchLyftaToCatalog(ex.name, tokenized) ??
        (ex.equipment ?? [])
          .map((eq) => EQUIP_PREFIX[eq.toLowerCase()])
          .filter(Boolean)
          .map((pref) => matchLyftaToCatalog(`${pref} ${ex.name}`, tokenized))
          .find((m) => m != null) ??
        null;

      if (tokenMatch) {
        token.push({
          lyftaId: ex.id,
          lyftaName: ex.name,
          equipment,
          bodyPart,
          via: "token",
          query: ex.name,
          tipoId: tokenMatch.id,
          tipoNombre: tokenMatch.nombre,
        });
        continue;
      }

      unmatched.push({
        lyftaId: ex.id,
        lyftaName: ex.name,
        equipment,
        bodyPart,
      });
    }

    const byBody: Record<string, { total: number; mapped: number }> = {};
    for (const ex of dump.exercises) {
      const key = ex.body_part?.[0] || "Sin grupo";
      byBody[key] ??= { total: 0, mapped: 0 };
      byBody[key].total += 1;
    }
    const mappedIds = new Set([...exact, ...prefix, ...token].map((h) => h.lyftaId));
    for (const ex of dump.exercises) {
      if (mappedIds.has(ex.id)) {
        const key = ex.body_part?.[0] || "Sin grupo";
        byBody[key].mapped += 1;
      }
    }

    const mapped = exact.length + prefix.length + token.length;
    const report = {
      scrapedAt: dump.scrapedAt,
      verifiedAt: new Date().toISOString(),
      source: "https://www.lyfta.app/exercises",
      lyftaTotal: dump.exercises.length,
      trackGymTipos: catalog.length,
      mapAliases: Object.keys(CATALOG_NAME_TO_TIPO_ID).length,
      mapped,
      coveragePct: Number(((mapped / dump.exercises.length) * 100).toFixed(1)),
      exact: exact.length,
      equipmentPrefix: prefix.length,
      token: token.length,
      unmatched: unmatched.length,
      byBodyPart: Object.entries(byBody)
        .map(([grupo, v]) => ({
          grupo,
          total: v.total,
          mapped: v.mapped,
          unmatched: v.total - v.mapped,
          pct: Number(((v.mapped / v.total) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.total - a.total),
      notables: [
        "Bench Press",
        "Full Squat",
        "Deadlift",
        "Incline Bench Press",
        "Dumbbell Bench Press",
        "Barbell Curl",
        "Push-up",
        "Lateral Raise",
        "Triceps Pushdown",
        "Bent Over Row",
      ].map((name) => {
        const hit =
          exact.find((h) => h.lyftaName === name) ??
          prefix.find((h) => h.lyftaName === name) ??
          token.find((h) => h.lyftaName === name);
        const miss = unmatched.find((h) => h.lyftaName === name);
        return hit
          ? { name, status: hit.via, par: hit.tipoNombre, query: hit.query }
          : { name, status: miss ? "unmatched" : "not_in_scrape", par: null, query: null };
      }),
      sampleExact: exact.slice(0, 25).map((h) => ({ lyfta: h.lyftaName, par: h.tipoNombre })),
      sampleEquipmentPrefix: prefix.slice(0, 25).map((h) => ({
        lyfta: h.lyftaName,
        query: h.query,
        par: h.tipoNombre,
      })),
      sampleToken: token.slice(0, 25).map((h) => ({ lyfta: h.lyftaName, par: h.tipoNombre })),
      sampleUnmatched: unmatched.slice(0, 40).map((h) => ({
        lyfta: h.lyftaName,
        equipment: h.equipment,
        bodyPart: h.bodyPart,
      })),
    };

    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    expect(mapped + unmatched.length).toBe(dump.exercises.length);
  });
});
