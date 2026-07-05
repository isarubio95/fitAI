-- Agrupa ejercicios consecutivos de una rutina como superserie (mismo id en el bloque).
alter table public.rutina_ejercicio
  add column if not exists superset_id uuid;

comment on column public.rutina_ejercicio.superset_id is
  'Identificador compartido por ejercicios enlazados en superserie dentro de la rutina.';
