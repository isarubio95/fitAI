/**
 * Auditoría del catálogo de ejercicios. SOLO LECTURA: no escribe en la BD.
 *
 *   node scripts/audit-catalog.mjs
 *
 * Comprueba que las 750 filas nativas y las 1.533 importadas comparten de
 * verdad el vocabulario canónico de `src/constants/exerciseEquipment.ts` y
 * `exerciseTaxonomy.ts`, y localiza los huecos. El desglose es por origen
 * porque las dos poblaciones entraron por caminos distintos y fallan distinto.
 *
 * Lo que salga de aquí se arregla con los scripts que ya existen:
 *   normalize-catalog-fields.mjs --apply   equipment / equipment_list / dificultad
 *   tag-native-catalog.mjs --apply         patrón / cualidad / plano de las nativas
 *   backfill-nombre-en.mjs --apply         nombre_en
 *
 * Escribe el informe en data/catalog-audit.md.
 *
 * Requiere VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */

import fs from "node:fs";
import { cargarEnv, credencialesSupabase, leerTabla } from "./lib/mediaUtils.mjs";
import { EQUIPOS, toCanonicalEquipo } from "./lib/equipmentVocab.mjs";
import { PATRONES_MOVIMIENTO_SQL, CUALIDADES_SQL, PLANOS_SQL } from "./lib/taxonomyVocab.mjs";

const REPORT_PATH = "data/catalog-audit.md";

const COLUMNAS =
  "id, nombre, nombre_en, tipo, grupo_muscular, musculos_involucrados, equipment, equipment_list, " +
  "dificultad, registro_series, instructions, patron_movimiento, cualidad, plano, gif_url, imagen, origen";

/** Comprobaciones. Cada una devuelve true si la fila ESTÁ MAL. */
const CHECKS = [
  {
    clave: "equipment_list vacío",
    mal: (f) => !(f.equipment_list ?? []).length,
    porque: "sin equipo canónico la fila es invisible al filtro de material",
  },
  {
    clave: "equipment_list con término no canónico",
    mal: (f) => (f.equipment_list ?? []).some((e) => toCanonicalEquipo(e) === null),
    porque: "rompe los chips del filtro: sale un duplicado por cada variante",
  },
  {
    clave: "equipment no derivado de equipment_list",
    mal: (f) => (f.equipment ?? "") !== (f.equipment_list ?? []).join(", "),
    porque: "las dos columnas han divergido; `equipment` debe derivarse de la lista",
  },
  {
    clave: "dificultad fuera de 1/2/3",
    mal: (f) => f.dificultad != null && !["1", "2", "3"].includes(String(f.dificultad)),
    porque: "impide filtrar por dificultad en servidor",
  },
  {
    clave: "patron_movimiento vacío",
    mal: (f) => !(f.patron_movimiento ?? []).length,
    porque: "invisible a los filtros por patrón y al encaje por deporte",
  },
  {
    clave: "cualidad vacía",
    mal: (f) => !(f.cualidad ?? []).length,
    porque: "invisible al filtro por cualidad (fuerza, hipertrofia…)",
  },
  {
    clave: "plano nulo",
    mal: (f) => !f.plano,
    porque: "resta puntos en el encaje por deporte de sportExerciseScore",
  },
  {
    clave: "taxonomía fuera de vocabulario",
    mal: (f) =>
      (f.patron_movimiento ?? []).some((p) => !PATRONES_MOVIMIENTO_SQL.includes(p)) ||
      (f.cualidad ?? []).some((c) => !CUALIDADES_SQL.includes(c)) ||
      (f.plano != null && !PLANOS_SQL.includes(f.plano)),
    porque: "debería ser imposible: hay un CHECK en la tabla",
  },
  {
    clave: "instructions vacías",
    mal: (f) => !(f.instructions ?? []).length,
    porque: "la ficha de detalle sale sin explicación",
  },
  {
    clave: "sin medio (gif_url e imagen nulos)",
    mal: (f) => !f.gif_url && !f.imagen,
    porque: "la tarjeta sale sin demo",
  },
  {
    clave: "nombre_en nulo",
    mal: (f) => !f.nombre_en,
    porque: "no se puede buscar en inglés",
  },
  {
    clave: "musculos_involucrados vacío",
    mal: (f) => !(f.musculos_involucrados ?? []).length,
    porque: "no aparece al buscar por músculo",
  },
  {
    clave: "grupo_muscular nulo",
    mal: (f) => !f.grupo_muscular,
    porque: "no encaja en ningún grupo del filtro principal",
  },
];

function tabla(filas, columnas) {
  const cab = `| ${columnas.join(" | ")} |`;
  const sep = `|${columnas.map(() => "---").join("|")}|`;
  return [cab, sep, ...filas.map((f) => `| ${f.join(" | ")} |`)].join("\n");
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

  let filas;
  let hayNombreEn = true;
  try {
    filas = await leerTabla(supabase, "tipo_ejercicio", COLUMNAS);
  } catch (e) {
    // `nombre_en` no existe hasta aplicar 20260904090000_exercise_nombre_en.sql.
    if (/nombre_en/.test(String(e.message))) {
      console.warn("Aviso: falta la columna `nombre_en`; esa comprobación se omite.");
      console.warn("       Aplica supabase/migrations/20260904090000_exercise_nombre_en.sql.\n");
      hayNombreEn = false;
      filas = await leerTabla(supabase, "tipo_ejercicio", COLUMNAS.replace("nombre_en, ", ""));
    } else {
      throw e;
    }
  }

  // Sin columna, la comprobación daría 2.283 falsos positivos.
  const checks = hayNombreEn ? CHECKS : CHECKS.filter((c) => c.clave !== "nombre_en nulo");

  const grupos = [
    ["nativo", filas.filter((f) => !f.origen)],
    ["fdb", filas.filter((f) => f.origen === "fdb")],
    ["lyfta", filas.filter((f) => f.origen === "lyfta")],
  ].filter(([, rows]) => rows.length);

  // ── Consola ───────────────────────────────────────────────────────────────
  console.log("=== AUDITORÍA DEL CATÁLOGO (solo lectura) ===");
  console.log(`filas: ${filas.length} · ${grupos.map(([n, r]) => `${n} ${r.length}`).join(" · ")}\n`);

  const filasTabla = [];
  for (const check of checks) {
    const cuentas = grupos.map(([, rows]) => rows.filter(check.mal).length);
    const total = cuentas.reduce((a, b) => a + b, 0);
    filasTabla.push([check.clave, String(total), ...cuentas.map(String), check.porque]);
    const marca = total === 0 ? "ok " : "   ";
    console.log(
      `${marca}${check.clave.padEnd(42)} ${String(total).padStart(5)}  ` +
        grupos.map(([n, ], i) => `${n} ${cuentas[i]}`).join(" · "),
    );
  }

  // ── Vocabulario de equipo realmente presente ──────────────────────────────
  const usados = new Map();
  for (const f of filas) {
    for (const e of f.equipment_list ?? []) usados.set(e, (usados.get(e) ?? 0) + 1);
  }
  const noCanonicos = [...usados.keys()].filter((e) => toCanonicalEquipo(e) === null);
  const sinUsar = EQUIPOS.filter((e) => !usados.has(e));

  console.log(`\nvocabulario de equipo en uso: ${usados.size} de los ${EQUIPOS.length} canónicos`);
  if (noCanonicos.length) console.log(`  fuera de vocabulario: ${noCanonicos.join(" · ")}`);
  if (sinUsar.length) console.log(`  canónicos sin usar:   ${sinUsar.join(" · ")}`);

  // ── Informe ───────────────────────────────────────────────────────────────
  const md = [
    "# Auditoría del catálogo de ejercicios",
    "",
    "> Generado por `node scripts/audit-catalog.mjs`. Solo lectura.",
    "",
    `- **Filas:** ${filas.length}`,
    ...grupos.map(([n, r]) => `- **${n}:** ${r.length}`),
    "",
    "## Huecos por origen",
    "",
    tabla(filasTabla, ["Comprobación", "Total", ...grupos.map(([n]) => n), "Por qué importa"]),
    "",
    "## Vocabulario de equipo",
    "",
    `En uso: **${usados.size}** de los ${EQUIPOS.length} términos canónicos.`,
    "",
    noCanonicos.length
      ? `**Fuera de vocabulario:** ${noCanonicos.map((e) => `\`${e}\``).join(", ")}`
      : "Ningún término fuera del vocabulario canónico.",
    "",
    sinUsar.length ? `**Canónicos sin ninguna fila:** ${sinUsar.join(", ")}` : "",
    "",
    tabla(
      [...usados.entries()].sort((a, b) => b[1] - a[1]).map(([e, n]) => [e, String(n)]),
      ["Equipo", "Filas"],
    ),
    "",
  ];

  // Muestras concretas de lo que esté mal, para poder ir a arreglarlo.
  const conFallos = checks.filter((c) => filas.some(c.mal));
  if (conFallos.length) {
    md.push("## Ejemplos", "");
    for (const check of conFallos) {
      const ejemplos = filas.filter(check.mal).slice(0, 10);
      md.push(`### ${check.clave} (${filas.filter(check.mal).length})`, "");
      md.push(
        tabla(
          ejemplos.map((f) => [f.nombre, f.origen ?? "nativo", `\`${f.id}\``]),
          ["Ejercicio", "Origen", "id"],
        ),
        "",
      );
    }
  }

  fs.writeFileSync(REPORT_PATH, md.filter((l) => l !== null).join("\n"));
  console.log(`\nescrito ${REPORT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
