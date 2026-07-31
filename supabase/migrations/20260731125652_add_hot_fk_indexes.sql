-- Índices en FKs calientes de workouts (joins y deletes del padre).
CREATE INDEX IF NOT EXISTS serie_ejercicio_id_idx
  ON public.serie (ejercicio_id);

CREATE INDEX IF NOT EXISTS ejercicio_actividad_id_idx
  ON public.ejercicio (actividad_id);

CREATE INDEX IF NOT EXISTS rutina_ejercicio_rutina_id_idx
  ON public.rutina_ejercicio (rutina_id);
