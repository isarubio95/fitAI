/**
 * Genera la migración de taxonomía a partir de `src/constants/exerciseTaxonomy.ts`.
 *
 * Los CHECK de BD y los vocabularios de TypeScript tienen que decir lo mismo.
 * Escribirlos dos veces a mano garantiza que acaben divergiendo, así que el SQL
 * se deriva del fichero TS, que es la fuente única de verdad.
 *
 *   node scripts/gen-taxonomy-migration.mjs > supabase/migrations/<ts>_exercise_taxonomy.sql
 */
import fs from "node:fs";

const src = fs.readFileSync("src/constants/exerciseTaxonomy.ts", "utf8");

function readList(name) {
  const anchor = `export const ${name} = [`;
  const at = src.indexOf(anchor);
  if (at < 0) throw new Error(`No encuentro ${name} en exerciseTaxonomy.ts`);
  const open = at + anchor.length - 1;
  const close = src.indexOf("] as const;", open);
  if (close < 0) throw new Error(`${name} sin cierre "] as const;"`);
  const values = [...src.slice(open, close).matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  if (values.length === 0) throw new Error(`${name} está vacío`);
  return values;
}

const PATRONES = readList("PATRONES_MOVIMIENTO");
const CUALIDADES = readList("CUALIDADES");
const PLANOS = readList("PLANOS");
const DEPORTES = readList("DEPORTES");
const ORIGENES = readList("ORIGENES");

const lit = (values, indent = "    ") =>
  values.map((v) => `${indent}'${v}'`).join(",\n");

const arrayLit = (values) => `array[\n${lit(values, "      ")}\n    ]::text[]`;

/** Columnas compartidas por tipo_ejercicio y usuario_ejercicio. */
const SHARED_COLUMNS = `  add column if not exists video_url text,
  add column if not exists patron_movimiento text[] not null default '{}',
  add column if not exists cualidad text[] not null default '{}',
  add column if not exists plano text,
  add column if not exists unilateral boolean,
  add column if not exists deportes text[] not null default '{}',
  add column if not exists equipment_list text[] not null default '{}'`;

function checks(table) {
  return `alter table public.${table}
  drop constraint if exists ${table}_patron_movimiento_check,
  drop constraint if exists ${table}_cualidad_check,
  drop constraint if exists ${table}_plano_check,
  drop constraint if exists ${table}_deportes_check;

alter table public.${table}
  add constraint ${table}_patron_movimiento_check check (
    patron_movimiento <@ ${arrayLit(PATRONES)}
  ),
  add constraint ${table}_cualidad_check check (
    cualidad <@ ${arrayLit(CUALIDADES)}
  ),
  add constraint ${table}_plano_check check (
    plano is null or plano in (
${lit(PLANOS)}
    )
  ),
  add constraint ${table}_deportes_check check (
    deportes <@ ${arrayLit(DEPORTES)}
  );`;
}

function comments(table) {
  return `comment on column public.${table}.video_url is 'URL de YouTube con la demostración. Se usa cuando no hay animación propia.';
comment on column public.${table}.patron_movimiento is 'Patrones mecánicos del ejercicio. Vocabulario en src/constants/exerciseTaxonomy.ts.';
comment on column public.${table}.cualidad is 'Cualidades físicas que entrena. Vocabulario en src/constants/exerciseTaxonomy.ts.';
comment on column public.${table}.plano is 'Plano de movimiento dominante.';
comment on column public.${table}.unilateral is 'true si se ejecuta a una pierna/brazo. Los deportes premian el trabajo unilateral.';
comment on column public.${table}.deportes is 'Override explícito: deportes a los que sirve. El encaje normal se infiere del patrón y la cualidad (src/constants/sportProfiles.ts).';
comment on column public.${table}.equipment_list is 'equipment partido en átomos. equipment es un string con comas y no se puede filtrar en servidor.';`;
}

function indexes(table) {
  return `create index if not exists ${table}_deportes_gin
  on public.${table} using gin (deportes);
create index if not exists ${table}_cualidad_gin
  on public.${table} using gin (cualidad);
create index if not exists ${table}_patron_movimiento_gin
  on public.${table} using gin (patron_movimiento);
create index if not exists ${table}_equipment_list_gin
  on public.${table} using gin (equipment_list);`;
}

const out = `-- Taxonomía de ejercicios: patrón de movimiento, cualidad física, plano y deporte.
--
-- GENERADO por scripts/gen-taxonomy-migration.mjs desde
-- src/constants/exerciseTaxonomy.ts. No editar a mano: regenerar.
--
-- Habilita el catálogo deportivo. El encaje ejercicio↔deporte NO se guarda
-- fila a fila: se infiere puntuando patrón/cualidad/plano contra el perfil del
-- deporte (src/constants/sportProfiles.ts, src/lib/sportExerciseScore.ts).
-- La columna \`deportes\` es solo el override para lo verdaderamente específico.

-- ── Catálogo del sistema ──────────────────────────────────────────────────
alter table public.tipo_ejercicio
${SHARED_COLUMNS},
  add column if not exists origen text,
  add column if not exists origen_externo_id text;

${checks("tipo_ejercicio")}

alter table public.tipo_ejercicio
  drop constraint if exists tipo_ejercicio_origen_check;

alter table public.tipo_ejercicio
  add constraint tipo_ejercicio_origen_check check (
    origen is null or origen in (
${lit(ORIGENES)}
    )
  );

${comments("tipo_ejercicio")}
comment on column public.tipo_ejercicio.origen is 'Fuente de la fila. Determina la licencia del medio asociado.';
comment on column public.tipo_ejercicio.origen_externo_id is 'Id en la fuente externa. Junto con origen hace la importación idempotente.';

${indexes("tipo_ejercicio")}

-- Reimportar no debe duplicar. Parcial: las filas nativas siguen con origen null.
create unique index if not exists tipo_ejercicio_origen_externo_uidx
  on public.tipo_ejercicio (origen, origen_externo_id)
  where origen is not null and origen_externo_id is not null;

-- ── Ejercicios creados por el usuario ─────────────────────────────────────
-- Mismas etiquetas para que un ejercicio propio también entre en rutinas
-- deportivas. Sin origen/origen_externo_id: no se importan de ninguna fuente.
alter table public.usuario_ejercicio
${SHARED_COLUMNS};

${checks("usuario_ejercicio")}

${comments("usuario_ejercicio")}

${indexes("usuario_ejercicio")}
`;

process.stdout.write(out);
