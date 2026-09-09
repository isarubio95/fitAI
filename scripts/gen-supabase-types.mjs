/**
 * Regenera src/integrations/supabase/types.ts desde el proyecto de Supabase.
 *
 *   npm run supabase:types
 *
 * Existe porque la forma obvia —`supabase gen types ... > types.ts`— destruye
 * el fichero cuando el comando falla: la redirección del shell lo trunca antes
 * de saber si hubo error, así que un 403 de la CLI deja el JSON del error como
 * único contenido de types.ts. Pasó de verdad (2026-09-03) con una cuenta sin
 * privilegios sobre el proyecto.
 *
 * Aquí la salida se captura en memoria, se valida, y solo entonces se escribe.
 * Si algo falla, el fichero anterior queda intacto.
 *
 * Orden de fuentes:
 *   1. SUPABASE_DB_URL (o DATABASE_URL) — no pasa por la Management API.
 *   2. --project-id — exige que `npx supabase login` sea una cuenta con rol
 *      Developer+ en este proyecto. Una cuenta de otra org (p. ej. solo
 *      "ShennaBrows") devuelve 403 access-control.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PROJECT_ID = "ugbhwarfkaeobaycxlwp";
const DESTINO = path.join("src", "integrations", "supabase", "types.ts");
/** Por debajo de esto la salida no puede ser un esquema real: son ~1.800 líneas. */
const MINIMO_LINEAS = 200;
const CLI_JS = path.join("node_modules", "supabase", "dist", "supabase.js");

loadDotEnv(path.join(process.cwd(), ".env"));

const dbUrl = firstEnv("SUPABASE_DB_URL", "DATABASE_URL");
const intentos = dbUrl
  ? [{ label: "--db-url", args: ["--db-url", dbUrl] }]
  : [];
intentos.push({ label: `--project-id ${PROJECT_ID}`, args: ["--project-id", PROJECT_ID] });

let res = null;
let ultimoLabel = "";
for (const intento of intentos) {
  ultimoLabel = intento.label;
  res = runCli(["gen", "types", "--lang=typescript", "--schema", "public", ...intento.args]);
  if (res.error) {
    console.error(`No se pudo ejecutar la CLI de Supabase: ${res.error.message}`);
    process.exitCode = 1;
    process.exit(1);
  }
  if (res.status === 0 && !pareceJsonDeError(res.stdout)) break;
  // Si hay URL de Postgres, el project-id es el plan B (o al revés).
}

if (!res || res.status !== 0 || pareceJsonDeError(res.stdout)) {
  console.error(`La CLI de Supabase falló (${ultimoLabel}). types.ts NO se ha tocado.`);
  const detalle = textoCli(res).trim();
  if (detalle) console.error(detalle.slice(0, 800));
  if (esErrorDePrivilegios(detalle)) {
    explicarPrivilegios();
  } else if (!dbUrl) {
    console.error(
      "\nSi la Management API no te deja, pon en .env la URI de Postgres:\n" +
        "  SUPABASE_DB_URL=postgresql://postgres.<ref>:<password>@...pooler.supabase.com:5432/postgres",
    );
  }
  process.exitCode = 1;
} else {
  escribirSiValida(res.stdout ?? "");
}

function runCli(args) {
  return spawnSync(process.execPath, [CLI_JS, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: process.env,
  });
}

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    if (process.env[key]) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function firstEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

function textoCli(result) {
  if (!result) return "";
  return `${result.stderr ?? ""}\n${result.stdout ?? ""}`;
}

function pareceJsonDeError(stdout) {
  const t = (stdout ?? "").trimStart();
  return t.startsWith("{") && /privileges|access-control|message/i.test(t);
}

function esErrorDePrivilegios(texto) {
  return /necessary privileges|access-control/i.test(texto);
}

function explicarPrivilegios() {
  const list = runCli(["projects", "list", "--output-format", "json"]);
  let proyectos = [];
  try {
    const raw = (list.stdout ?? "").trim();
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const parsed = JSON.parse(start >= 0 ? raw.slice(start, end + 1) : "{}");
    const lista = parsed.projects ?? parsed;
    proyectos = Array.isArray(lista) ? lista : [];
  } catch {
    proyectos = [];
  }
  const refs = proyectos
    .map((p) => `${p.name ?? "?"} (${p.ref ?? p.id ?? "?"})`)
    .filter(Boolean);
  console.error(`
Esta cuenta de la CLI no tiene acceso al proyecto ${PROJECT_ID} (Track Gym).
Proyectos visibles ahora: ${refs.length ? refs.join(", ") : "(ninguno)"}.

Opciones:
  1. npx supabase logout  &&  npx supabase login
     con la cuenta que es dueña de Track Gym (no la de otro proyecto).
  2. Database Settings → URI de conexión, en .env:
     SUPABASE_DB_URL=postgresql://postgres.${PROJECT_ID}:<password>@<host>:5432/postgres
     y vuelve a ejecutar npm run supabase:types
`);
}

function escribirSiValida(salida) {
  const lineas = salida.split("\n").length;
  const problemas = [];
  if (salida.trimStart().startsWith("{")) problemas.push("la salida es JSON, no TypeScript");
  if (!salida.includes("export type Json")) problemas.push("falta `export type Json`");
  if (!salida.includes("Tables:")) problemas.push("falta el bloque `Tables:`");
  if (lineas < MINIMO_LINEAS) problemas.push(`solo ${lineas} líneas (mínimo ${MINIMO_LINEAS})`);

  if (problemas.length) {
    console.error("La salida no parece un esquema válido. types.ts NO se ha tocado.");
    for (const p of problemas) console.error(`  - ${p}`);
    console.error(`\nPrimeros 300 caracteres:\n${salida.slice(0, 300)}`);
    process.exitCode = 1;
    return;
  }

  const previo = fs.existsSync(DESTINO) ? fs.readFileSync(DESTINO, "utf8") : null;
  if (previo !== null && previo.replace(/\r\n/g, "\n") === salida.replace(/\r\n/g, "\n")) {
    console.log(`${DESTINO} ya estaba al día (${lineas} líneas).`);
  } else {
    fs.writeFileSync(DESTINO, salida, "utf8");
    console.log(`Escrito ${DESTINO} (${lineas} líneas).`);
  }
}
