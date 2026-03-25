-- =============================================================================
-- Verificación de integridad (gym-log)
-- Alineado con sql/database.sql: tipo_ejercicio NO tiene usuario_id (catálogo);
-- ejercicios de usuario viven en public.usuario_ejercicio.
-- Ejecutar en Supabase → SQL Editor (rol service/postgres) o psql.
-- Resultado esperado: cada SELECT debe devolver 0 filas (o conteos coherentes).
-- Si alguna consulta devuelve filas, hay datos inconsistentes o huérfanos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) rutina_ejercicio: exactamente uno de tipo_ejercicio_id / usuario_ejercicio_id
--    (regla del modelo: catálogo O ejercicio de usuario, no ambos ni ninguno)
-- -----------------------------------------------------------------------------
select id, rutina_id, tipo_ejercicio_id, usuario_ejercicio_id
from public.rutina_ejercicio
where
  (tipo_ejercicio_id is null and usuario_ejercicio_id is null)
  or (tipo_ejercicio_id is not null and usuario_ejercicio_id is not null);

-- -----------------------------------------------------------------------------
-- 2) ejercicio: misma regla (sesiones / actividades)
-- -----------------------------------------------------------------------------
select id, actividad_id, tipo_ejercicio_id, usuario_ejercicio_id
from public.ejercicio
where
  (tipo_ejercicio_id is null and usuario_ejercicio_id is null)
  or (tipo_ejercicio_id is not null and usuario_ejercicio_id is not null);

-- -----------------------------------------------------------------------------
-- 3) Huérfanos: FK lógicos (no deberían existir si las FK están activas en BD)
-- -----------------------------------------------------------------------------

-- rutina_ejercicio → rutina
select re.id as rutina_ejercicio_id, re.rutina_id
from public.rutina_ejercicio re
left join public.rutina r on r.id = re.rutina_id
where r.id is null;

-- rutina_ejercicio → tipo_ejercicio (si apunta a catálogo)
select re.id, re.tipo_ejercicio_id
from public.rutina_ejercicio re
left join public.tipo_ejercicio te on te.id = re.tipo_ejercicio_id
where re.tipo_ejercicio_id is not null and te.id is null;

-- rutina_ejercicio → usuario_ejercicio
select re.id, re.usuario_ejercicio_id
from public.rutina_ejercicio re
left join public.usuario_ejercicio ue on ue.id = re.usuario_ejercicio_id
where re.usuario_ejercicio_id is not null and ue.id is null;

-- ejercicio → actividad
select e.id, e.actividad_id
from public.ejercicio e
left join public.actividad a on a.id = e.actividad_id
where a.id is null;

-- ejercicio → tipo_ejercicio
select e.id, e.tipo_ejercicio_id
from public.ejercicio e
left join public.tipo_ejercicio te on te.id = e.tipo_ejercicio_id
where e.tipo_ejercicio_id is not null and te.id is null;

-- ejercicio → usuario_ejercicio
select e.id, e.usuario_ejercicio_id
from public.ejercicio e
left join public.usuario_ejercicio ue on ue.id = e.usuario_ejercicio_id
where e.usuario_ejercicio_id is not null and ue.id is null;

-- serie → ejercicio
select s.id, s.ejercicio_id
from public.serie s
left join public.ejercicio e on e.id = s.ejercicio_id
where e.id is null;

-- -----------------------------------------------------------------------------
-- 4) ¿Existe el CHECK "exactamente uno"? (si no, Postgres no lo impediría en inserciones raras)
-- -----------------------------------------------------------------------------
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.rutina_ejercicio'::regclass
  and contype = 'c'
  and conname ilike '%exactly_one%';

select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.ejercicio'::regclass
  and contype = 'c'
  and conname ilike '%exactly_one%';

-- -----------------------------------------------------------------------------
-- 5) (Reservado) En database.sql actual no hay usuario_id en tipo_ejercicio.
--     Si tu BD añadió columnas extra, comprueba aparte con information_schema.
-- -----------------------------------------------------------------------------
-- select column_name from information_schema.columns
-- where table_schema = 'public' and table_name = 'tipo_ejercicio' order by ordinal_position;

-- -----------------------------------------------------------------------------
-- 6) Calidad de datos catálogo: nombres vacíos o duplicados
-- -----------------------------------------------------------------------------
select id, nombre
from public.tipo_ejercicio
where nombre is null or btrim(nombre) = '';

select nombre, count(*) as veces
from public.tipo_ejercicio
group by nombre
having count(*) > 1;

-- -----------------------------------------------------------------------------
-- 7) Resumen rápido (una fila de conteos; revisar que "malos" = 0)
-- -----------------------------------------------------------------------------
select
  (select count(*) from public.rutina_ejercicio re where re.tipo_ejercicio_id is null
     and re.usuario_ejercicio_id is null) as re_sin_referencia,
  (select count(*) from public.rutina_ejercicio re where re.tipo_ejercicio_id is not null
     and re.usuario_ejercicio_id is not null) as re_doble_referencia,
  (select count(*) from public.ejercicio e where e.tipo_ejercicio_id is null
     and e.usuario_ejercicio_id is null) as ej_sin_referencia,
  (select count(*) from public.ejercicio e where e.tipo_ejercicio_id is not null
     and e.usuario_ejercicio_id is not null) as ej_doble_referencia;
