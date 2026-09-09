-- Búsqueda de gimnasios en servidor: deja de paginar las 11k filas en el cliente.
-- Texto (pg_trgm sobre search_norm), bbox (lat/lng) y orden por distancia.

CREATE OR REPLACE FUNCTION public.gimnasio_normalize_search(p_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT trim(
    regexp_replace(
      regexp_replace(
        translate(
          lower(coalesce(p_value, '')),
          'áàäâãåāăąçćčđéèëêēėęěíìïîįīıñńóòöôõøōőúùüûūůýÿ',
          'aaaaaaaaacccdeeeeeeeeiiiiiiinnoooooooouuuuuuyy'
        ),
        '[^a-z0-9\s]',
        ' ',
        'g'
      ),
      '\s+',
      ' ',
      'g'
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.gimnasio_haversine_km(
  p_lat1 double precision,
  p_lng1 double precision,
  p_lat2 double precision,
  p_lng2 double precision
)
RETURNS double precision
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT 2 * 6371 * asin(
    least(
      1.0,
      sqrt(
        sin(radians(p_lat2 - p_lat1) / 2) ^ 2
        + cos(radians(p_lat1)) * cos(radians(p_lat2))
          * sin(radians(p_lng2 - p_lng1) / 2) ^ 2
      )
    )
  );
$$;

ALTER TABLE public.gimnasio
  ADD COLUMN IF NOT EXISTS search_norm text;

CREATE OR REPLACE FUNCTION public.gimnasio_touch_search_norm()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_norm := public.gimnasio_normalize_search(
    concat_ws(
      ' ',
      NEW.nombre,
      coalesce(NEW.ciudad, ''),
      coalesce(NEW.brand, ''),
      coalesce(NEW.direccion, '')
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gimnasio_search_norm_trg ON public.gimnasio;
CREATE TRIGGER gimnasio_search_norm_trg
  BEFORE INSERT OR UPDATE OF nombre, ciudad, brand, direccion
  ON public.gimnasio
  FOR EACH ROW
  EXECUTE FUNCTION public.gimnasio_touch_search_norm();

UPDATE public.gimnasio
SET search_norm = public.gimnasio_normalize_search(
  concat_ws(
    ' ',
    nombre,
    coalesce(ciudad, ''),
    coalesce(brand, ''),
    coalesce(direccion, '')
  )
)
WHERE search_norm IS NULL;

ALTER TABLE public.gimnasio
  ALTER COLUMN search_norm SET NOT NULL;

CREATE INDEX IF NOT EXISTS gimnasio_search_norm_trgm_idx
  ON public.gimnasio USING gin (search_norm gin_trgm_ops);

CREATE INDEX IF NOT EXISTS gimnasio_nombre_idx
  ON public.gimnasio (nombre);

CREATE OR REPLACE FUNCTION public.search_gimnasios(
  p_query text DEFAULT '',
  p_lat double precision DEFAULT NULL,
  p_lng double precision DEFAULT NULL,
  p_min_lat double precision DEFAULT NULL,
  p_max_lat double precision DEFAULT NULL,
  p_min_lng double precision DEFAULT NULL,
  p_max_lng double precision DEFAULT NULL,
  p_pinned_ids uuid[] DEFAULT '{}'::uuid[],
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  nombre text,
  lat double precision,
  lng double precision,
  direccion text,
  ciudad text,
  brand text,
  source text,
  tipo text,
  distance_km double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH params AS (
    SELECT
      public.gimnasio_normalize_search(btrim(coalesce(p_query, ''))) AS q,
      GREATEST(1, LEAST(coalesce(p_limit, 50), 2500)) AS lim,
      coalesce(p_pinned_ids, '{}'::uuid[]) AS pinned,
      p_lat AS origin_lat,
      p_lng AS origin_lng,
      p_min_lat AS min_lat,
      p_max_lat AS max_lat,
      p_min_lng AS min_lng,
      p_max_lng AS max_lng,
      CASE
        WHEN p_lat IS NULL OR p_lng IS NULL THEN NULL::double precision
        WHEN p_min_lat IS NOT NULL THEN NULL::double precision
        WHEN public.gimnasio_normalize_search(btrim(coalesce(p_query, ''))) <> '' THEN NULL::double precision
        ELSE 1.2
      END AS radius_deg
  ),
  candidates AS (
    SELECT
      g.id,
      g.nombre,
      g.lat,
      g.lng,
      g.direccion,
      g.ciudad,
      g.brand,
      g.source,
      g.tipo,
      COALESCE(array_position(params.pinned, g.id), 2147483647) AS pin_rank,
      CASE
        WHEN params.origin_lat IS NULL OR params.origin_lng IS NULL THEN NULL::double precision
        ELSE
          ((g.lat - params.origin_lat) ^ 2)
          + (
              ((g.lng - params.origin_lng) * cos(radians(params.origin_lat))) ^ 2
            )
      END AS dist2
    FROM public.gimnasio g
    CROSS JOIN params
    WHERE
      (params.q = '' OR g.search_norm LIKE '%' || params.q || '%')
      AND (
        g.id = ANY (params.pinned)
        OR (
          (params.min_lat IS NULL OR g.lat >= params.min_lat)
          AND (params.max_lat IS NULL OR g.lat <= params.max_lat)
          AND (params.min_lng IS NULL OR g.lng >= params.min_lng)
          AND (params.max_lng IS NULL OR g.lng <= params.max_lng)
          AND (
            params.radius_deg IS NULL
            OR (
              g.lat BETWEEN params.origin_lat - params.radius_deg
                         AND params.origin_lat + params.radius_deg
              AND g.lng BETWEEN params.origin_lng - params.radius_deg
                            AND params.origin_lng + params.radius_deg
            )
          )
        )
      )
    ORDER BY pin_rank, dist2 NULLS LAST, g.nombre
    LIMIT (SELECT lim FROM params)
  )
  SELECT
    c.id,
    c.nombre,
    c.lat,
    c.lng,
    c.direccion,
    c.ciudad,
    c.brand,
    c.source,
    c.tipo,
    CASE
      WHEN p_lat IS NULL OR p_lng IS NULL THEN NULL::double precision
      ELSE public.gimnasio_haversine_km(p_lat, p_lng, c.lat, c.lng)
    END AS distance_km
  FROM candidates c
  ORDER BY c.pin_rank, c.dist2 NULLS LAST, c.nombre;
$$;

REVOKE ALL ON FUNCTION public.gimnasio_normalize_search(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gimnasio_normalize_search(text) TO authenticated;

REVOKE ALL ON FUNCTION public.gimnasio_haversine_km(double precision, double precision, double precision, double precision) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gimnasio_haversine_km(double precision, double precision, double precision, double precision) TO authenticated;

REVOKE ALL ON FUNCTION public.gimnasio_touch_search_norm() FROM PUBLIC;

REVOKE ALL ON FUNCTION public.search_gimnasios(text, double precision, double precision, double precision, double precision, double precision, double precision, uuid[], integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_gimnasios(text, double precision, double precision, double precision, double precision, double precision, double precision, uuid[], integer) TO authenticated;
