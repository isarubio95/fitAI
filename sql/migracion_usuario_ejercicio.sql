-- Migración: separar ejercicios de usuario en public.usuario_ejercicio
-- Objetivo:
-- - Mantener FitCron/catálogo en public.tipo_ejercicio
-- - Guardar ejercicios creados por usuario en public.usuario_ejercicio
-- - Permitir que public.ejercicio y public.rutina_ejercicio apunten a:
--   - tipo_ejercicio (catálogo) O usuario_ejercicio (usuario), pero no a ambos

begin;

-- 1) Crear tabla
create table if not exists public.usuario_ejercicio (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  nombre text not null,
  descripcion text,
  imagen text,
  created_at timestamptz not null default now(),

  gif_url text,
  musculos_involucrados text[] default '{}'::text[],
  equipment text,
  instructions text[],
  tipo text,
  grupo_muscular text,
  dificultad text
);

create index if not exists usuario_ejercicio_usuario_id_idx on public.usuario_ejercicio (usuario_id);
create index if not exists usuario_ejercicio_nombre_idx on public.usuario_ejercicio (nombre);

-- 2) Migrar datos existentes (si los había en tipo_ejercicio.usuario_id)
-- Copiamos manteniendo el mismo id para poder repuntar FKs sin romper referencias históricas.
insert into public.usuario_ejercicio (
  id,
  usuario_id,
  nombre,
  descripcion,
  imagen,
  created_at,
  gif_url,
  musculos_involucrados,
  equipment,
  instructions,
  tipo,
  grupo_muscular,
  dificultad
)
select
  te.id,
  te.usuario_id,
  te.nombre,
  te.descripcion,
  te.imagen,
  te.created_at,
  te.gif_url,
  coalesce(te.musculos_involucrados, '{}'::text[]),
  te.equipment,
  te.instructions,
  te.tipo,
  te.grupo_muscular,
  te.dificultad
from public.tipo_ejercicio te
where te.usuario_id is not null
on conflict (id) do nothing;

-- 3) Añadir nuevas columnas en tablas que referencian "tipo de ejercicio"
alter table public.ejercicio add column if not exists usuario_ejercicio_id uuid;
alter table public.rutina_ejercicio add column if not exists usuario_ejercicio_id uuid;

-- 4) Repuntar referencias existentes que apuntaban a ejercicios "de usuario" en tipo_ejercicio
update public.ejercicio e
set usuario_ejercicio_id = e.tipo_ejercicio_id,
    tipo_ejercicio_id = null
where e.tipo_ejercicio_id in (select id from public.tipo_ejercicio where usuario_id is not null);

update public.rutina_ejercicio re
set usuario_ejercicio_id = re.tipo_ejercicio_id,
    tipo_ejercicio_id = null
where re.tipo_ejercicio_id in (select id from public.tipo_ejercicio where usuario_id is not null);

-- 5) Ajustar FKs: permitir NULL en tipo_ejercicio_id y añadir FK a usuario_ejercicio
-- ejercicio
do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'ejercicio'
      and constraint_name = 'ejercicio_tipo_ejercicio_id_fkey'
  ) then
    alter table public.ejercicio drop constraint ejercicio_tipo_ejercicio_id_fkey;
  end if;
exception when undefined_object then
  null;
end $$;

alter table public.ejercicio
  alter column tipo_ejercicio_id drop not null;

alter table public.ejercicio
  add constraint ejercicio_tipo_ejercicio_id_fkey
  foreign key (tipo_ejercicio_id) references public.tipo_ejercicio(id);

alter table public.ejercicio
  add constraint ejercicio_usuario_ejercicio_id_fkey
  foreign key (usuario_ejercicio_id) references public.usuario_ejercicio(id);

-- rutina_ejercicio
do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'rutina_ejercicio'
      and constraint_name = 'rutina_ejercicio_tipo_ejercicio_id_fkey'
  ) then
    alter table public.rutina_ejercicio drop constraint rutina_ejercicio_tipo_ejercicio_id_fkey;
  end if;
exception when undefined_object then
  null;
end $$;

alter table public.rutina_ejercicio
  alter column tipo_ejercicio_id drop not null;

alter table public.rutina_ejercicio
  add constraint rutina_ejercicio_tipo_ejercicio_id_fkey
  foreign key (tipo_ejercicio_id) references public.tipo_ejercicio(id);

alter table public.rutina_ejercicio
  add constraint rutina_ejercicio_usuario_ejercicio_id_fkey
  foreign key (usuario_ejercicio_id) references public.usuario_ejercicio(id);

-- 6) Constraint de integridad: exactamente uno de los dos
alter table public.ejercicio
  drop constraint if exists ejercicio_exactly_one_catalog_ref_ck;
alter table public.ejercicio
  add constraint ejercicio_exactly_one_catalog_ref_ck
  check (
    (tipo_ejercicio_id is not null and usuario_ejercicio_id is null)
    or
    (tipo_ejercicio_id is null and usuario_ejercicio_id is not null)
  );

alter table public.rutina_ejercicio
  drop constraint if exists rutina_ejercicio_exactly_one_catalog_ref_ck;
alter table public.rutina_ejercicio
  add constraint rutina_ejercicio_exactly_one_catalog_ref_ck
  check (
    (tipo_ejercicio_id is not null and usuario_ejercicio_id is null)
    or
    (tipo_ejercicio_id is null and usuario_ejercicio_id is not null)
  );

-- 7) (Opcional pero recomendado) borrar de tipo_ejercicio los ejercicios que eran del usuario
--     (ya fueron copiados a usuario_ejercicio y se repuntaron las referencias)
delete from public.tipo_ejercicio where usuario_id is not null;

-- 8) RLS para usuario_ejercicio
alter table public.usuario_ejercicio enable row level security;

drop policy if exists "usuario_ejercicio_select_own" on public.usuario_ejercicio;
create policy "usuario_ejercicio_select_own"
on public.usuario_ejercicio
for select
using (usuario_id = auth.uid());

drop policy if exists "usuario_ejercicio_insert_own" on public.usuario_ejercicio;
create policy "usuario_ejercicio_insert_own"
on public.usuario_ejercicio
for insert
with check (usuario_id = auth.uid());

drop policy if exists "usuario_ejercicio_update_own" on public.usuario_ejercicio;
create policy "usuario_ejercicio_update_own"
on public.usuario_ejercicio
for update
using (usuario_id = auth.uid())
with check (usuario_id = auth.uid());

drop policy if exists "usuario_ejercicio_delete_own" on public.usuario_ejercicio;
create policy "usuario_ejercicio_delete_own"
on public.usuario_ejercicio
for delete
using (usuario_id = auth.uid());

commit;

