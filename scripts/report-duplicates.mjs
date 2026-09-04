/**
 * Localiza posibles duplicados en el catálogo. SOLO LECTURA: no escribe en la BD
 * y no fusiona nada. La decisión es fila a fila y es humana.
 *
 *   node scripts/report-duplicates.mjs                 # umbral 0.6
 *   node scripts/report-duplicates.mjs --umbral 0.75   # más estricto
 *
 * Existen porque el catálogo creció por dos vías: 750 filas curadas a mano y
 * 1.533 importadas de free-exercise-db y Lyfta. Las dos fuentes describen a
 * veces el mismo ejercicio, y el catálogo nativo es además más granular que
 * ellas (cinco variantes de cruce de poleas donde fdb tiene un "Cable
 * Crossover"), así que la similitud alta NO implica que sean lo mismo.
 *
 * Por eso aquí solo se informa. Un fusionado automático colapsaría variantes
 * legítimas: `Aperturas Declinadas` y `Aperturas Inclinadas` puntúan altísimo
 * y son ejercicios contrarios.
 *
 * Escribe data/duplicados-review.md, lo más sospechoso primero.
 *
 * Requiere VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */

import fs from "node:fs";
import { cargarEnv, credencialesSupabase, leerTabla } from "./lib/mediaUtils.mjs";

const REPORT_PATH = "data/duplicados-review.md";

const args = process.argv.slice(2);
const idx = args.indexOf("--umbral");
const UMBRAL = idx >= 0 && args[idx + 1] ? Number(args[idx + 1]) : 0.6;

/** Nexos que no aportan al parecido de dos nombres. */
const NEXOS = new Set([
  "a", "al", "con", "de", "del", "e", "el", "en", "la", "las", "lo", "los",
  "para", "por", "sin", "sobre", "un", "una", "y",
]);

/**
 * Mismo plegado que `normalizeSearchText` de src/lib/exerciseSearch.ts:
 * minúsculas, sin diacríticos, cualquier signo como separador.
 */
function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenizar(valor) {
  const t = normalizar(valor).split(" ").filter((w) => w && !NEXOS.has(w));
  return t.length ? t : normalizar(valor).split(" ").filter(Boolean);
}

/** Jaccard entre dos conjuntos de términos. */
function similitud(a, b) {
  let comunes = 0;
  for (const x of a) if (b.has(x)) comunes += 1;
  return comunes / (a.size + b.size - comunes);
}

async function main() {
  cargarEnv();

  const cred = credencialesSupabase();
  if (!cred) {
    process.exitCode = 1;
    return;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(cred.url, cred.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const filas = await leerTabla(
    supabase,
    "tipo_ejercicio",
    "id, nombre, grupo_muscular, equipment_list, tipo, registro_series, gif_url, origen",
  );

  const indexadas = filas.map((f) => ({
    fila: f,
    normal: normalizar(f.nombre),
    tokens: new Set(tokenizar(f.nombre)),
    equipo: [...(f.equipment_list ?? [])].sort().join(", "),
  }));

  // ── Pares por encima del umbral ───────────────────────────────────────────
  const pares = [];
  for (let i = 0; i < indexadas.length; i += 1) {
    for (let j = i + 1; j < indexadas.length; j += 1) {
      const a = indexadas[i];
      const b = indexadas[j];
      // Poda barata: sin ningún término en común no hay nada que calcular.
      if (Math.abs(a.tokens.size - b.tokens.size) / Math.max(a.tokens.size, b.tokens.size) > 1 - UMBRAL) {
        continue;
      }
      const s = similitud(a.tokens, b.tokens);
      if (s < UMBRAL) continue;
      pares.push({
        a,
        b,
        similitud: s,
        // Mismos términos exactos. Los nexos no cuentan, así que
        // "Jab de Boxeo" y "Jab (Boxeo)" caen aquí, que es lo que interesa.
        mismosTerminos: s >= 0.999,
        mismoGrupo: a.fila.grupo_muscular === b.fila.grupo_muscular,
        mismoEquipo: a.equipo === b.equipo,
        mismoRegistro: a.fila.registro_series === b.fila.registro_series,
      });
    }
  }

  // Lo más sospechoso primero: mismos términos, luego similitud, y a igualdad
  // los que además coinciden en grupo y equipo.
  const peso = (p) =>
    (p.mismosTerminos ? 100 : 0) + p.similitud * 10 + (p.mismoGrupo ? 1 : 0) + (p.mismoEquipo ? 1 : 0);
  pares.sort((x, y) => peso(y) - peso(x));

  const idénticos = pares.filter((p) => p.mismosTerminos);
  const fuertes = pares.filter((p) => !p.mismosTerminos && p.mismoGrupo && p.mismoEquipo);
  const resto = pares.filter((p) => !p.mismosTerminos && !(p.mismoGrupo && p.mismoEquipo));

  const cruces = pares.filter((p) => (p.a.fila.origen ?? null) !== (p.b.fila.origen ?? null)).length;

  console.log("=== POSIBLES DUPLICADOS (solo lectura) ===");
  console.log(`filas comparadas:        ${filas.length}`);
  console.log(`umbral de similitud:     ${UMBRAL}`);
  console.log(`pares por encima:        ${pares.length}`);
  console.log(`  mismos términos:       ${idénticos.length}`);
  console.log(`  mismo grupo y equipo:  ${fuertes.length}`);
  console.log(`  el resto:              ${resto.length}`);
  console.log(`pares entre orígenes distintos: ${cruces}`);

  if (idénticos.length) {
    console.log("\nmismos términos en el nombre:");
    for (const p of idénticos.slice(0, 15)) {
      console.log(
        `  "${p.a.fila.nombre}" [${p.a.fila.origen ?? "nativo"}] ` +
          `== "${p.b.fila.nombre}" [${p.b.fila.origen ?? "nativo"}]`,
      );
    }
  }

  const fila = (p) => [
    p.similitud.toFixed(2),
    `${p.a.fila.nombre}<br>\`${p.a.fila.origen ?? "nativo"}\` · \`${p.a.fila.id}\``,
    `${p.b.fila.nombre}<br>\`${p.b.fila.origen ?? "nativo"}\` · \`${p.b.fila.id}\``,
    p.mismoGrupo ? `sí (${p.a.fila.grupo_muscular ?? "—"})` : `no (${p.a.fila.grupo_muscular} / ${p.b.fila.grupo_muscular})`,
    p.mismoEquipo ? `sí (${p.a.equipo || "—"})` : `no (${p.a.equipo || "—"} / ${p.b.equipo || "—"})`,
    p.a.fila.gif_url && p.b.fila.gif_url ? "ambos" : p.a.fila.gif_url || p.b.fila.gif_url ? "uno" : "ninguno",
  ];

  const tabla = (ps) =>
    [
      "| Sim. | A | B | ¿Mismo grupo? | ¿Mismo equipo? | Demo |",
      "|---|---|---|---|---|---|",
      ...ps.map((p) => `| ${fila(p).join(" | ")} |`),
    ].join("\n");

  const md = [
    "# Posibles duplicados del catálogo",
    "",
    "> Generado por `node scripts/report-duplicates.mjs`. **Solo lectura: no se ha",
    "> fusionado ni modificado nada.** Similitud = Jaccard de términos del nombre,",
    "> con el mismo plegado que el buscador (sin tildes, sin nexos).",
    "",
    "**Ojo con el falso positivo estructural:** el catálogo nativo es más granular",
    "que las fuentes externas, así que una similitud alta no implica duplicado.",
    "`Aperturas Declinadas` y `Aperturas Inclinadas` puntúan 0.75 y son ejercicios",
    "contrarios; los cinco cruces de poleas nativos (alto-bajo, bajo-alto, superior,",
    "inferior, completo) se parecen mucho entre sí y son cinco ejercicios distintos.",
    "Fusionar por parecido destruye variantes legítimas.",
    "",
    `- **Filas comparadas:** ${filas.length}`,
    `- **Umbral:** ${UMBRAL}`,
    `- **Pares encontrados:** ${pares.length}`,
    `- **Entre orígenes distintos:** ${cruces} (los candidatos más probables a duplicado real)`,
    "",
    "## 1. Mismos términos en el nombre",
    "",
    idénticos.length
      ? `${idénticos.length} pares: los nombres solo difieren en nexos o puntuación ` +
        `("Jab de Boxeo" / "Jab (Boxeo)"). Es donde el duplicado es más probable, ` +
        `pero repasa igualmente: dos variantes opuestas pueden compartir todos los ` +
        `términos y ordenarlos al revés ("Alto a Bajo" / "Bajo a Alto").\n\n${tabla(idénticos)}`
      : "Ninguno.",
    "",
    "## 2. Muy parecidos, mismo grupo muscular y mismo equipo",
    "",
    fuertes.length
      ? `${fuertes.length} pares. Requieren mirar la demo para decidir.\n\n${tabla(fuertes.slice(0, 200))}` +
        (fuertes.length > 200 ? `\n\n_(mostrados los 200 primeros de ${fuertes.length})_` : "")
      : "Ninguno.",
    "",
    "## 3. Parecidos pero difieren en grupo o equipo",
    "",
    resto.length
      ? `${resto.length} pares. Casi todos son variantes legítimas.\n\n${tabla(resto.slice(0, 150))}` +
        (resto.length > 150 ? `\n\n_(mostrados los 150 primeros de ${resto.length})_` : "")
      : "Ninguno.",
    "",
  ];

  fs.writeFileSync(REPORT_PATH, md.join("\n"));
  console.log(`\nescrito ${REPORT_PATH}`);
  if (fuertes.length > 200 || resto.length > 150) {
    console.log("Nota: el informe recorta las tablas 2 y 3; los totales de arriba son los reales.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
