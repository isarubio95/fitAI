-- Catálogo de gimnasios (OSM + aportaciones de usuario) y vínculo en actividad.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS public.gimnasio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  osm_id bigint,
  osm_type text,
  nombre text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  direccion text,
  ciudad text,
  brand text,
  source text NOT NULL DEFAULT 'osm',
  created_by uuid REFERENCES public.perfil (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gimnasio_nombre_len CHECK (
    char_length(btrim(nombre)) >= 1 AND char_length(nombre) <= 120
  ),
  CONSTRAINT gimnasio_lat_check CHECK (lat >= -90 AND lat <= 90),
  CONSTRAINT gimnasio_lng_check CHECK (lng >= -180 AND lng <= 180),
  CONSTRAINT gimnasio_source_check CHECK (source IN ('osm', 'user')),
  CONSTRAINT gimnasio_osm_type_check CHECK (
    osm_type IS NULL OR osm_type IN ('node', 'way', 'relation')
  ),
  CONSTRAINT gimnasio_osm_consistency CHECK (
    (source = 'osm' AND osm_id IS NOT NULL AND osm_type IS NOT NULL)
    OR (source = 'user' AND osm_id IS NULL AND osm_type IS NULL)
  ),
  CONSTRAINT gimnasio_osm_identity_unique UNIQUE (osm_type, osm_id)
);

CREATE INDEX IF NOT EXISTS gimnasio_nombre_trgm_idx
  ON public.gimnasio USING gin (nombre gin_trgm_ops);

CREATE INDEX IF NOT EXISTS gimnasio_ciudad_trgm_idx
  ON public.gimnasio USING gin (ciudad gin_trgm_ops);

CREATE INDEX IF NOT EXISTS gimnasio_lat_lng_idx
  ON public.gimnasio (lat, lng);

CREATE INDEX IF NOT EXISTS gimnasio_source_idx
  ON public.gimnasio (source);

ALTER TABLE public.actividad
  ADD COLUMN IF NOT EXISTS gimnasio_id uuid REFERENCES public.gimnasio (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gimnasio_nombre text;

CREATE INDEX IF NOT EXISTS actividad_gimnasio_id_idx
  ON public.actividad (gimnasio_id)
  WHERE gimnasio_id IS NOT NULL;

ALTER TABLE public.gimnasio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gimnasio_select_authenticated ON public.gimnasio;
CREATE POLICY gimnasio_select_authenticated
  ON public.gimnasio FOR SELECT TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS gimnasio_insert_user ON public.gimnasio;
CREATE POLICY gimnasio_insert_user
  ON public.gimnasio FOR INSERT TO authenticated
  WITH CHECK (
    source = 'user'
    AND osm_id IS NULL
    AND osm_type IS NULL
    AND created_by = (select auth.uid())
  );

GRANT SELECT, INSERT ON public.gimnasio TO authenticated;
REVOKE ALL ON public.gimnasio FROM anon;
