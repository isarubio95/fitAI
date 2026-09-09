-- Historial de series de un ejercicio, para el drawer de rendimiento.
--
-- `get_exercise_daily_best` solo devuelve la mejor serie de cada día y solo
-- entiende de `tipo_ejercicio`. El drawer necesita dos cosas más: las series
-- reales de cada sesión (para desplegar el día) y los ejercicios propios del
-- usuario (`usuario_ejercicio`), que hasta ahora no tenían histórico.
--
-- Devuelve series en crudo en vez de agregados: 12 meses de un solo ejercicio
-- son unos cientos de filas, y así el conmutador 1RM/volumen y el filtro de
-- periodo se resuelven en cliente sin volver a la red.

CREATE OR REPLACE FUNCTION public.get_exercise_set_history(
  p_tipo_ejercicio_id uuid DEFAULT NULL,
  p_usuario_ejercicio_id uuid DEFAULT NULL,
  p_months integer DEFAULT 12
)
RETURNS TABLE (
  day date,
  actividad_id uuid,
  actividad_titulo text,
  numero_serie integer,
  peso_kg numeric,
  repeticiones integer,
  tipo_serie text,
  rir integer,
  duracion_seg integer
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    (timezone('utc', a.fecha))::date AS day,
    a.id AS actividad_id,
    a.titulo AS actividad_titulo,
    s.numero_serie,
    s.peso_kg,
    s.repeticiones,
    s.tipo_serie,
    s.rir,
    s.duracion_seg
  FROM public.serie s
  INNER JOIN public.ejercicio e
    ON e.id = s.ejercicio_id
   -- Los dos FK son excluyentes pero no hay CHECK que lo garantice, así que se
   -- comparan por separado en vez de dar por hecho que solo uno viene con valor.
   AND (
     (p_tipo_ejercicio_id IS NOT NULL AND e.tipo_ejercicio_id = p_tipo_ejercicio_id)
     OR
     (p_usuario_ejercicio_id IS NOT NULL AND e.usuario_ejercicio_id = p_usuario_ejercicio_id)
   )
  INNER JOIN public.actividad a
    ON a.id = e.actividad_id
   AND a.fecha_fin IS NOT NULL
   AND a.fecha >= (now() - make_interval(months => GREATEST(COALESCE(p_months, 12), 1)))
  -- La política RLS de `serie` deja leer series de actividades públicas de otros;
  -- este filtro es el que acota el histórico a los datos propios.
  WHERE s.usuario_id = (SELECT auth.uid())
  -- Ordenado por la expresión y con las columnas cualificadas: dentro de un
  -- `RETURNS TABLE`, `day` también nombra una columna de salida, y un
  -- `ORDER BY day` quedaría ambiguo.
  ORDER BY (timezone('utc', a.fecha))::date ASC, a.id ASC, s.numero_serie ASC;
$$;

REVOKE ALL ON FUNCTION public.get_exercise_set_history(uuid, uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_exercise_set_history(uuid, uuid, integer) TO authenticated;

-- El catálogo ya tenía su índice parcial (20260817140000); los ejercicios
-- propios no, y ahora también se filtran por aquí.
CREATE INDEX IF NOT EXISTS ejercicio_usuario_ejercicio_id_idx
  ON public.ejercicio (usuario_ejercicio_id)
  WHERE usuario_ejercicio_id IS NOT NULL;
