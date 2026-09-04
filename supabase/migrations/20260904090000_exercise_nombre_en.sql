-- Nombre en inglés del ejercicio de catálogo.
--
-- El dato ya existía pero se estaba descartando dos veces:
--
--   * Las 1.533 filas importadas: `build-exercise-import.mjs` genera
--     `nombre_en` en data/exercise-import.json, pero `filaParaBd()` de
--     `import-exercise-catalog.mjs` no lo pasaba porque no había columna.
--   * Las 750 filas nativas: lo llevan dentro del nombre del fichero de la
--     demo, `/ejercicios/06071301-Lever-Triceps-Extension_Upper-Arms_720.gif`,
--     del que `nombreDesdeGif()` lo sabe extraer (747 de 750).
--
-- Sirve para que el buscador encuentre en inglés lo que está guardado en
-- español ("bench press" → "Press de Banca"), sin llevar al cliente una tabla
-- de 1.133 traducciones.
--
-- Solo en `tipo_ejercicio`: `usuario_ejercicio` son ejercicios que teclea el
-- usuario y no tienen nombre original en inglés.
--
-- Se rellena con: node scripts/backfill-nombre-en.mjs --apply

alter table public.tipo_ejercicio add column if not exists nombre_en text;

comment on column public.tipo_ejercicio.nombre_en is
  'Nombre original en inglés (fuente externa o nombre del asset). Nullable: hay filas sin equivalente conocido.';
