-- FKs calientes de cardio + tipo_ejercicio (Index Advisor / nested PostgREST).
-- Preview GPS muestreado para listados: no embeber cardio_track_point(*) en feeds.

CREATE INDEX IF NOT EXISTS cardio_bloque_sesion_id_orden_idx
  ON public.cardio_bloque (cardio_sesion_id, orden);

CREATE INDEX IF NOT EXISTS cardio_track_point_track_id_orden_idx
  ON public.cardio_track_point (cardio_track_id, orden);

CREATE INDEX IF NOT EXISTS ejercicio_tipo_ejercicio_id_idx
  ON public.ejercicio (tipo_ejercicio_id)
  WHERE tipo_ejercicio_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS cardio_sesion_usuario_fecha_inicio_completada_idx
  ON public.cardio_sesion (usuario_id, fecha_inicio DESC)
  WHERE fecha_fin IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_cardio_track_preview_points(
  p_track_ids uuid[],
  p_max_points integer DEFAULT 200
)
RETURNS TABLE (
  cardio_track_id uuid,
  orden integer,
  lat double precision,
  lng double precision,
  elevacion_m double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH numbered AS (
    SELECT
      p.cardio_track_id,
      p.orden,
      p.lat,
      p.lng,
      p.elevacion_m,
      row_number() OVER (PARTITION BY p.cardio_track_id ORDER BY p.orden) AS rn,
      count(*) OVER (PARTITION BY p.cardio_track_id) AS n
    FROM public.cardio_track_point p
    WHERE cardinality(p_track_ids) > 0
      AND p.cardio_track_id = ANY (p_track_ids)
  )
  SELECT
    numbered.cardio_track_id,
    numbered.orden,
    numbered.lat,
    numbered.lng,
    numbered.elevacion_m
  FROM numbered
  WHERE numbered.n <= GREATEST(COALESCE(p_max_points, 200), 2)
     OR numbered.rn = 1
     OR numbered.rn = numbered.n
     OR ((numbered.rn - 1) % GREATEST(
           1,
           (numbered.n - 1) / GREATEST(GREATEST(COALESCE(p_max_points, 200), 2) - 1, 1)
         )) = 0
  ORDER BY numbered.cardio_track_id, numbered.orden;
$$;

REVOKE ALL ON FUNCTION public.get_cardio_track_preview_points(uuid[], integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cardio_track_preview_points(uuid[], integer) TO authenticated;
