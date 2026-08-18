import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("data/lyfta-library.json");
const UA = "TrackGym-map-verify/1.0 (local catalog comparison)";
const PAGE_SIZE_HINT = 20;
const CONCURRENCY = 4;

function extractNextData(html) {
  const start = html.indexOf('<script id="__NEXT_DATA__" type="application/json">');
  if (start < 0) return null;
  const jsonStart = html.indexOf(">", start) + 1;
  const jsonEnd = html.indexOf("</script>", jsonStart);
  return JSON.parse(html.slice(jsonStart, jsonEnd));
}

async function fetchPage(page) {
  const url = `https://www.lyfta.app/exercises?page=${page}`;
  const res = await fetch(url, {
    headers: { Accept: "text/html", "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} page ${page}`);
  const html = await res.text();
  const next = extractNextData(html);
  const rows = next?.props?.pageProps?.firstData;
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name ?? "").trim(),
    url: r.url ?? null,
    image_url: r.image_url ?? null,
    body_part: Array.isArray(r.body_part) ? r.body_part : [],
    equipment: Array.isArray(r.equipment) ? r.equipment : [],
  }));
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

function englishFromSitemap() {
  const file = path.resolve("sm1.xml");
  if (!fs.existsSync(file)) return [];
  const t = fs.readFileSync(file, "utf8");
  return [...t.matchAll(/<loc>(https:\/\/www\.lyfta\.app\/exercise\/[^/<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  console.log("Probing page 1…");
  const first = await fetchPage(1);
  if (!first.length) throw new Error("Empty page 1");
  const sitemapUrls = englishFromSitemap();
  const estimatedPages = sitemapUrls.length
    ? Math.ceil(sitemapUrls.length / Math.max(first.length, PAGE_SIZE_HINT))
    : 250;
  console.log("page1", first.length, "sitemap en", sitemapUrls.length, "est pages", estimatedPages);

  const pages = Array.from({ length: estimatedPages + 5 }, (_, i) => i + 1);
  const byId = new Map();
  for (const row of first) byId.set(row.id, row);

  const rest = pages.slice(1);
  let emptyStreak = 0;
  const batches = [];
  for (let i = 0; i < rest.length; i += CONCURRENCY) batches.push(rest.slice(i, i + CONCURRENCY));

  for (const batch of batches) {
    const results = await mapPool(batch, CONCURRENCY, async (page) => {
      try {
        return { page, rows: await fetchPage(page) };
      } catch (err) {
        return { page, rows: [], error: String(err) };
      }
    });
    let any = false;
    for (const r of results) {
      if (r.error) console.warn("page", r.page, r.error);
      if (!r.rows.length) {
        emptyStreak += 1;
        continue;
      }
      emptyStreak = 0;
      any = true;
      for (const row of r.rows) byId.set(row.id, row);
    }
    const last = results.at(-1)?.page;
    console.log("scraped through page", last, "unique", byId.size);
    if (!any && emptyStreak >= CONCURRENCY) break;
    await new Promise((res) => setTimeout(res, 150));
  }

  const exercises = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        scrapedAt: new Date().toISOString(),
        source: "https://www.lyfta.app/exercises",
        count: exercises.length,
        sitemapEnglishUrls: sitemapUrls.length,
        exercises,
      },
      null,
      2,
    ),
  );
  console.log("wrote", OUT, exercises.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
