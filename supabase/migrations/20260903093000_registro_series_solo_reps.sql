-- El CHECK de tipo_ejercicio.registro_series se creó fuera de las
-- migraciones versionadas (no aparece en ningún fichero de este directorio)
-- y sólo admitía 'peso_reps' | 'duracion' | 'duracion_ritmo'. La Fase 2 del
-- plan de ampliación del catálogo añadió 'solo_reps' en el código
-- (src/types/workout.ts) asumiendo que la columna era texto libre sin CHECK,
-- pero sí lo tenía: la importación real lo destapó al rechazar 59 filas
-- (saltos y lanzamientos sin carga) con
-- "violates check constraint tipo_ejercicio_registro_series_check".

alter table public.tipo_ejercicio
  drop constraint if exists tipo_ejercicio_registro_series_check;

alter table public.tipo_ejercicio
  add constraint tipo_ejercicio_registro_series_check check (
    registro_series in ('peso_reps', 'solo_reps', 'duracion', 'duracion_ritmo')
  );
