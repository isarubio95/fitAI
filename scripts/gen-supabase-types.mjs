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
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PROJECT_ID = "ugbhwarfkaeobaycxlwp";
const DESTINO = path.join("src", "integrations", "supabase", "types.ts");
/** Por debajo de esto la salida no puede ser un esquema real: son ~1.800 líneas. */
const MINIMO_LINEAS = 200;

// `shell: true` es obligatorio en Windows: npx es un .cmd y spawnSync falla
// con EINVAL si se invoca directamente. Va como comando único en lugar de
// nombre + array porque Node deprecó (DEP0190) combinar las dos cosas: con
// shell los argumentos se concatenan sin escapar. Aquí no hay riesgo, todos
// son constantes de este fichero, pero el aviso ensuciaba la salida.
const comando =
  `npx supabase gen types --lang=typescript --project-id ${PROJECT_ID} --schema public`;
const res = spawnSync(comando, {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
  shell: true,
});

if (res.error) {
  console.error(`No se pudo ejecutar la CLI de Supabase: ${res.error.message}`);
  process.exitCode = 1;
} else if (res.status !== 0) {
  console.error(`La CLI de Supabase salió con código ${res.status}. types.ts NO se ha tocado.`);
  if (res.stderr?.trim()) console.error(res.stderr.trim());
  if (res.stdout?.trim()) console.error(res.stdout.trim().slice(0, 500));
  process.exitCode = 1;
} else {
  const salida = res.stdout ?? "";
  const lineas = salida.split("\n").length;
  const problemas = [];

  // La CLI puede salir con código 0 y escribir un JSON de error en stdout.
  if (salida.trimStart().startsWith("{")) problemas.push("la salida es JSON, no TypeScript");
  if (!salida.includes("export type Json")) problemas.push("falta `export type Json`");
  if (!salida.includes("Tables:")) problemas.push("falta el bloque `Tables:`");
  if (lineas < MINIMO_LINEAS) problemas.push(`solo ${lineas} líneas (mínimo ${MINIMO_LINEAS})`);

  if (problemas.length) {
    console.error("La salida no parece un esquema válido. types.ts NO se ha tocado.");
    for (const p of problemas) console.error(`  - ${p}`);
    console.error(`\nPrimeros 300 caracteres:\n${salida.slice(0, 300)}`);
    process.exitCode = 1;
  } else {
    const previo = fs.existsSync(DESTINO) ? fs.readFileSync(DESTINO, "utf8") : null;
    if (previo !== null && previo.replace(/\r\n/g, "\n") === salida.replace(/\r\n/g, "\n")) {
      console.log(`${DESTINO} ya estaba al día (${lineas} líneas).`);
    } else {
      fs.writeFileSync(DESTINO, salida, "utf8");
      console.log(`Escrito ${DESTINO} (${lineas} líneas).`);
    }
  }
}
