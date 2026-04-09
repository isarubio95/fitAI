begin;

-- 1) Normaliza variantes de core/abdomen a una sola etiqueta canónica.
update public.tipo_ejercicio
set grupo_muscular = 'Core'
where lower(trim(coalesce(grupo_muscular, ''))) in ('abdomen', 'core');

-- 2) Normaliza variantes de pierna a una sola etiqueta.
update public.tipo_ejercicio
set grupo_muscular = 'Pierna'
where lower(trim(coalesce(grupo_muscular, ''))) in ('pierna', 'piernas');

-- 3) Evita "Todos" para cardio: usa categoría explícita.
update public.tipo_ejercicio
set grupo_muscular = 'Cardio'
where lower(trim(coalesce(grupo_muscular, ''))) = 'todos'
  and lower(trim(coalesce(tipo, ''))) = 'cardio';

-- 4) Evita "Todos" para estiramientos: usa Movilidad.
update public.tipo_ejercicio
set grupo_muscular = 'Movilidad'
where lower(trim(coalesce(grupo_muscular, ''))) = 'todos'
  and lower(trim(coalesce(tipo, ''))) = 'estiramiento';

-- 5) Si quedase algún "Todos" residual (tipos no esperados), déjalo explícito.
update public.tipo_ejercicio
set grupo_muscular = 'Full Body'
where lower(trim(coalesce(grupo_muscular, ''))) = 'todos';

commit;

-- =============================
-- Validación recomendada
-- =============================
-- select grupo_muscular, count(*) as total
-- from public.tipo_ejercicio
-- group by grupo_muscular
-- order by total desc, grupo_muscular asc;
--
-- select count(*) as total_todos
-- from public.tipo_ejercicio
-- where lower(trim(coalesce(grupo_muscular, ''))) = 'todos';
