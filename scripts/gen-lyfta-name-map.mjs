import fs from "node:fs";

const raw = fs.readFileSync(
  "C:/Users/PANOi/.cursor/projects/c-Users-PANOi-Desktop-fitAI/agent-tools/c83ff66b-ef45-42f7-8d8f-30b3d61c60b0.txt",
  "utf8",
);
const wrapped = JSON.parse(raw);
const text = wrapped.result;
const start = text.indexOf("[{");
const end = text.lastIndexOf("}]");
if (start < 0 || end < 0) {
  console.error("Could not find JSON array in SQL result");
  process.exit(1);
}
const rows = JSON.parse(text.slice(start, end + 2));
console.log("rows", rows.length);

function englishFromGif(gif) {
  if (!gif || typeof gif !== "string") return null;
  const base = gif.split("/").pop().replace(/\.(gif|webp|png|jpg|jpeg)$/i, "");
  const noId = base.replace(/^\d+-/, "");
  const noSuffix = noId.replace(/_[^_]+_720$/i, "").replace(/_720$/i, "");
  const name = noSuffix.replace(/-/g, " ").replace(/\s+/g, " ").trim();
  return name || null;
}

function normalize(value) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

const aliases = new Map();
const collisions = [];
let withEn = 0;

function setAlias(key, id, nombre, en) {
  const existing = aliases.get(key);
  if (existing && existing.id !== id) {
    collisions.push({ key, a: existing.nombre, b: nombre });
    aliases.delete(key);
    return;
  }
  if (!existing) aliases.set(key, { id, nombre, en: en ?? null });
}

for (const row of rows) {
  const es = normalize(row.nombre);
  if (es) setAlias(es, row.id, row.nombre, null);
  const enName = englishFromGif(row.gif_url);
  if (enName) {
    withEn += 1;
    setAlias(normalize(enName), row.id, row.nombre, enName);
  }
}

console.log("alias keys", aliases.size, "withEn", withEn, "collisions", collisions.length);
if (collisions.length) console.log(collisions.slice(0, 15));

const outRows = [...aliases.entries()]
  .map(([key, v]) => ({ key, id: v.id }))
  .sort((a, b) => a.key.localeCompare(b.key));

const file = `/** Nombres canónicos (ES del catálogo + EN extraído del gif) → tipo_ejercicio.id */
export const CATALOG_NAME_TO_TIPO_ID: Record<string, string> = {
${outRows.map((r) => `  ${JSON.stringify(r.key)}: ${JSON.stringify(r.id)},`).join("\n")}
};
`;

fs.writeFileSync("c:/Users/PANOi/Desktop/fitAI/src/lib/lyfta/catalogNameToTipoId.ts", file);
console.log("wrote", outRows.length, "entries");
