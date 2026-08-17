-- Preview GPS de rutas guardadas para thumbs del picker (no traer todos los puntos).

CREATE OR REPLACE FUNCTION public.get_cardio_ruta_preview_points(
  p_ruta_ids uuid[],
  p_max_points integer DEFAULT 120
)
RETURNS TABLE (
  cardio_ruta_id uuid,
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
      p.cardio_ruta_id,
      p.orden,
      p.lat,
      p.lng,
      p.elevacion_m,
      row_number() OVER (PARTITION BY p.cardio_ruta_id ORDER BY p.orden) AS rn,
      count(*) OVER (PARTITION BY p.cardio_ruta_id) AS n
    FROM public.cardio_ruta_punto p
    WHERE cardinality(p_ruta_ids) > 0
      AND p.cardio_ruta_id = ANY (p_ruta_ids)
  )
  SELECT
    numbered.cardio_ruta_id,
    numbered.orden,
    numbered.lat,
    numbered.lng,
    numbered.elevacion_m
  FROM numbered
  WHERE numbered.n <= GREATEST(COALESCE(p_max_points, 120), 2)
     OR numbered.rn = 1
     OR numbered.rn = numbered.n
     OR ((numbered.rn - 1) % GREATEST(
           1,
           (numbered.n - 1) / GREATEST(GREATEST(COALESCE(p_max_points, 120), 2) - 1, 1)
         )) = 0
  ORDER BY numbered.cardio_ruta_id, numbered.orden;
$$;

REVOKE ALL ON FUNCTION public.get_cardio_ruta_preview_points(uuid[], integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cardio_ruta_preview_points(uuid[], integer) TO authenticated;
