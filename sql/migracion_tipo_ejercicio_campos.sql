-- Migracion: separar tipo/grupo/dificultad desde descripcion a columnas reales
-- Archivo: sql/migracion_tipo_ejercicio_campos.sql
--
-- Objetivo:
-- 1) Añadir columnas public.tipo_ejercicio.tipo, grupo_muscular, dificultad
-- 2) Rellenarlas extrayendo:
--    - "Tipo: X."
--    - "Grupo muscular: Y."
--    - "Dificultad: A/B."
--    desde public.tipo_ejercicio.descripcion
--
-- Nota:
-- - No toca public.tipo_ejercicio.descripcion (solo crea y rellena columnas).
-- - Si descripcion no sigue el patron, quedaran NULL en esas columnas.

begin;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tipo_ejercicio'
      and column_name = 'tipo'
  ) then
    alter table public.tipo_ejercicio add column tipo text;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tipo_ejercicio'
      and column_name = 'grupo_muscular'
  ) then
    alter table public.tipo_ejercicio add column grupo_muscular text;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tipo_ejercicio'
      and column_name = 'dificultad'
  ) then
    alter table public.tipo_ejercicio add column dificultad text;
  end if;
end $$;

-- Rellenar usando regex simple sobre el patron generado por buildDescripcion():
-- "Tipo: {tipo}. Grupo muscular: {grupo}. ... Dificultad: {da}/{dm}. ..."
update public.tipo_ejercicio
set
  tipo = nullif(trim(substring(descripcion from 'Tipo:[[:space:]]*([^.]+)[.][[:space:]]*')), ''),
  grupo_muscular = nullif(trim(substring(descripcion from 'Grupo muscular:[[:space:]]*([^.]+)[.][[:space:]]*')), ''),
  dificultad = nullif(trim(substring(descripcion from 'Dificultad:[[:space:]]*([^.]+)[.][[:space:]]*')), '')
where descripcion is not null;

commit;

-- Verificacion rapida (cuantos quedaron con valor):
-- select
--   count(*) filter (where tipo is not null) as con_tipo,
--   count(*) filter (where grupo_muscular is not null) as con_grupo,
--   count(*) filter (where dificultad is not null) as con_dificultad
-- from public.tipo_ejercicio;

