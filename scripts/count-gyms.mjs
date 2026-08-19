import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function loadEnv() {
  const envPath = path.resolve(".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    let val = m[2] ?? "";
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}
loadEnv();

const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const data = [];
let offset = 0;
while (true) {
  const res = await fetch(`${url}/rest/v1/gimnasio?select=source,provider,ciudad&limit=1000&offset=${offset}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
  });
  const chunk = await res.json();
  if (!Array.isArray(chunk) || chunk.length === 0) break;
  data.push(...chunk);
  if (chunk.length < 1000) break;
  offset += 1000;
}
if (!Array.isArray(data)) { console.error(data); process.exit(1); }

const bySource = {};
const byProvider = {};
for (const g of data) {
  bySource[g.source] = (bySource[g.source] || 0) + 1;
  const p = g.provider || "(sin provider)";
  byProvider[p] = (byProvider[p] || 0) + 1;
}

console.log("\n=== Por fuente (source) ===");
for (const [k, v] of Object.entries(bySource).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
console.log("\n=== Por proveedor open data (provider) ===");
for (const [k, v] of Object.entries(byProvider).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
console.log(`\nTOTAL: ${data.length} gimnasios`);
