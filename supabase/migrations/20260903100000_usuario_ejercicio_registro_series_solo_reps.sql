-- Mismo defecto que 20260903093000: el CHECK de usuario_ejercicio.registro_series
-- se creó fuera de las migraciones versionadas y solo admitía
-- 'peso_reps' | 'duracion' | 'duracion_ritmo'. Confirmado con una prueba de
-- inserción real (usuario_id inexistente, aborta antes de tocar ningún dato):
-- "violates check constraint usuario_ejercicio_registro_series_check".
--
-- Sin este arreglo, un usuario no puede guardar un ejercicio propio (salto,
-- lanzamiento) en modo solo_reps.

alter table public.usuario_ejercicio
  drop constraint if exists usuario_ejercicio_registro_series_check;

alter table public.usuario_ejercicio
  add constraint usuario_ejercicio_registro_series_check check (
    registro_series in ('peso_reps', 'solo_reps', 'duracion', 'duracion_ritmo')
  );
