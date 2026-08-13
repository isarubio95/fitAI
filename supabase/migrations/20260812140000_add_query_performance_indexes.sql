-- Índices alineados con las queries PostgREST más costosas (usuario + orden).
-- Evita el índice suelto en serie(created_at) del Index Advisor: el filtro real es usuario_id.

CREATE INDEX IF NOT EXISTS serie_usuario_id_created_at_idx
  ON public.serie (usuario_id, created_at);

CREATE INDEX IF NOT EXISTS rutina_ejercicio_rutina_id_orden_idx
  ON public.rutina_ejercicio (rutina_id, orden);

CREATE INDEX IF NOT EXISTS rutina_usuario_id_orden_created_at_idx
  ON public.rutina (usuario_id, orden ASC NULLS LAST, created_at DESC);

CREATE INDEX IF NOT EXISTS rutina_programada_usuario_fecha_idx
  ON public.rutina_programada (usuario_id, fecha_programada);

CREATE INDEX IF NOT EXISTS tipo_ejercicio_nombre_idx
  ON public.tipo_ejercicio (nombre);
