import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function splitCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out;
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headers = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = splitCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j += 1) row[headers[j]] = values[j] ?? "";
    rows.push(row);
  }
  return rows;
}

function uniqBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

async function mapPool(items, concurrency, mapper) {
  const results = new Array(items.length);
  let idx = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const i = idx++;
      if (i >= items.length) break;
      results[i] = await mapper(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

async function downloadToFile(url, absPath, { retries = 2 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const buf = Buffer.from(await res.arrayBuffer());
      // Heurística rápida: un GIF debería empezar por "GIF87a" o "GIF89a"
      const header = buf.subarray(0, 6).toString("ascii");
      if (header !== "GIF87a" && header !== "GIF89a") {
        throw new Error(`Contenido no parece GIF (header=${JSON.stringify(header)})`);
      }
      await writeFile(absPath, buf);
      return { ok: true };
    } catch (e) {
      if (attempt >= retries) return { ok: false, error: String(e?.message ?? e) };
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  return { ok: false, error: "unknown" };
}

function safeFilenameFromUrl(url) {
  const u = new URL(url);
  const base = path.posix.basename(u.pathname);
  // FitCron suele dar .gif. Aun así, sanitizamos.
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned || `gif_${Math.random().toString(16).slice(2)}.gif`;
}

async function main() {
  const CSV_PATH = "sql/ejercicios.csv";
  const OUT_DIR = path.join("public", "ejercicios");
  const OUT_SQL = path.join("sql", "update_gif_url_local.sql");
  const PUBLIC_PREFIX = "/ejercicios/";

  const csv = await readFile(CSV_PATH, "utf8");
  const rows = parseCsv(csv);

  const pairs = uniqBy(
    rows
      .map((r) => ({
        nombre: r.nombre,
        remote: String(r.gif_url ?? "").trim(),
      }))
      .filter((x) => x.remote.startsWith("http")),
    (x) => x.remote,
  );

  await mkdir(OUT_DIR, { recursive: true });

  const tasks = pairs.map((p) => {
    const filename = safeFilenameFromUrl(p.remote);
    const absPath = path.join(OUT_DIR, filename);
    const localUrl = `${PUBLIC_PREFIX}${filename}`;
    return { ...p, filename, absPath, localUrl };
  });

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  await mapPool(tasks, 6, async (t) => {
    // Si existe pero está vacío (corrupción previa), lo re-descargamos.
    if (existsSync(t.absPath)) {
      try {
        const { stat } = await import("node:fs/promises");
        const st = await stat(t.absPath);
        if (st.size > 0) {
          skipped += 1;
          return { ...t, status: "skipped" };
        }
      } catch {
        // si stat falla, intentamos descargar
      }
    }
    const res = await downloadToFile(t.remote, t.absPath, { retries: 2 });
    if (res.ok) {
      downloaded += 1;
      return { ...t, status: "downloaded" };
    }
    failed += 1;
    return { ...t, status: "failed", error: res.error };
  });

  const sqlLines = [];
  sqlLines.push("-- Actualiza gif_url remoto -> ruta local en public/");
  sqlLines.push("-- IMPORTANTE: ejecuta esto cuando ya hayas desplegado los ficheros en producción.");
  sqlLines.push("begin;");
  for (const t of tasks) {
    // Actualizamos por gif_url remoto existente en BD.
    sqlLines.push(
      `update public.tipo_ejercicio set gif_url = '${t.localUrl.replace(/'/g, "''")}' where gif_url = '${t.remote.replace(/'/g, "''")}';`,
    );
  }
  sqlLines.push("commit;");

  await mkdir("sql", { recursive: true });
  await writeFile(OUT_SQL, sqlLines.join("\n") + "\n", "utf8");

  console.log(
    JSON.stringify(
      {
        totalEnCsv: rows.length,
        gifsUnicos: tasks.length,
        downloaded,
        skipped,
        failed,
        outDir: OUT_DIR,
        outSql: OUT_SQL,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

