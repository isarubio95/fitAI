-- Opcional: eliminar columna descripcion del catálogo
-- Ejecuta esto SOLO cuando confirmes que ya no la usas en ningún sitio.

begin;

alter table public.tipo_ejercicio
  drop column if exists descripcion;

commit;

