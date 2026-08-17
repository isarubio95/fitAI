/**
 * Sube public/ejercicios/*.gif al bucket público `ejercicios` de Supabase Storage.
 *
 * Uso:
 *   set SUPABASE_SERVICE_ROLE_KEY=eyJ...   (Dashboard → Project Settings → API)
 *   node scripts/upload-ejercicios-to-storage.mjs
 *
 * Requiere VITE_SUPABASE_URL en .env (o SUPABASE_URL).
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "ejercicios";
const LOCAL_DIR = path.resolve("public/ejercicios");
const CONCURRENCY = 6;

function loadEnvFile() {
  const envPath = path.resolve(".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2] ?? "";
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile();

const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!url) {
  console.error("Falta SUPABASE_URL o VITE_SUPABASE_URL");
  process.exit(1);
}
if (!serviceKey) {
  console.error(
    "Falta SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Cópiala en Dashboard → Project Settings → API → service_role (secret)\n" +
      "y ejecuta:\n" +
      "  $env:SUPABASE_SERVICE_ROLE_KEY=\"...\"\n" +
      "  node scripts/upload-ejercicios-to-storage.mjs",
  );
  process.exit(1);
}
if (!fs.existsSync(LOCAL_DIR)) {
  console.error(`No existe ${LOCAL_DIR}`);
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const files = fs
  .readdirSync(LOCAL_DIR)
  .filter((name) => /\.(gif|webp|jpe?g|png)$/i.test(name))
  .sort();

console.log(`Subiendo ${files.length} archivos a ${BUCKET} (${url})…`);

let ok = 0;
let skip = 0;
let fail = 0;
const errors = [];

async function uploadOne(name) {
  const full = path.join(LOCAL_DIR, name);
  const body = fs.readFileSync(full);
  const contentType = name.toLowerCase().endsWith(".gif")
    ? "image/gif"
    : name.toLowerCase().endsWith(".webp")
      ? "image/webp"
      : name.toLowerCase().endsWith(".png")
        ? "image/png"
        : "image/jpeg";

  const { error } = await supabase.storage.from(BUCKET).upload(name, body, {
    contentType,
    upsert: true,
    cacheControl: "31536000",
  });

  if (error) {
    fail += 1;
    errors.push(`${name}: ${error.message}`);
    return;
  }
  ok += 1;
}

async function runPool(items, limit, worker) {
  let i = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx], idx);
      if ((idx + 1) % 25 === 0 || idx + 1 === items.length) {
        console.log(`progreso ${idx + 1}/${items.length} (ok=${ok} fail=${fail})`);
      }
    }
  });
  await Promise.all(runners);
}

await runPool(files, CONCURRENCY, uploadOne);

console.log(`\nListo: ok=${ok} fail=${fail} skip=${skip}`);
if (errors.length) {
  console.log("Errores (máx 20):");
  for (const e of errors.slice(0, 20)) console.log(" -", e);
  process.exit(1);
}

const sample = files[0];
if (sample) {
  console.log(
    `Prueba: ${url}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(sample)}`,
  );
}
