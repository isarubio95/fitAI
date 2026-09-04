-- Corrige tipo_ejercicio_origen_externo_uidx: era un índice único PARCIAL
-- (where origen is not null and origen_externo_id is not null), y Postgres
-- no puede usar un índice parcial como destino de inferencia de
-- ON CONFLICT (origen, origen_externo_id) sin repetir el WHERE, que es lo
-- que hace scripts/import-exercise-catalog.mjs al hacer upsert.
--
-- Un índice único sin WHERE se comporta igual para nuestros datos: Postgres
-- trata cada NULL como distinto en un índice único, así que las filas
-- nativas (origen y origen_externo_id ambos null) siguen sin chocar entre
-- sí. Ver scripts/gen-taxonomy-migration.mjs, ya corregido para futuras
-- regeneraciones.

drop index if exists public.tipo_ejercicio_origen_externo_uidx;

create unique index if not exists tipo_ejercicio_origen_externo_uidx
  on public.tipo_ejercicio (origen, origen_externo_id);
