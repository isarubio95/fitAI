-- Catálogo: datos abiertos municipales, proveedor/id externo y tipo (municipal/private/unknown).

ALTER TABLE public.gimnasio
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'unknown';

ALTER TABLE public.gimnasio
  DROP CONSTRAINT IF EXISTS gimnasio_source_check;

ALTER TABLE public.gimnasio
  ADD CONSTRAINT gimnasio_source_check
  CHECK (source IN ('osm', 'user', 'opendata'));

ALTER TABLE public.gimnasio
  DROP CONSTRAINT IF EXISTS gimnasio_osm_consistency;

ALTER TABLE public.gimnasio
  ADD CONSTRAINT gimnasio_osm_consistency CHECK (
    (source = 'osm' AND osm_id IS NOT NULL AND osm_type IS NOT NULL)
    OR (source = 'user' AND osm_id IS NULL AND osm_type IS NULL)
    OR (source = 'opendata' AND osm_id IS NULL AND osm_type IS NULL)
  );

ALTER TABLE public.gimnasio
  DROP CONSTRAINT IF EXISTS gimnasio_opendata_identity;

ALTER TABLE public.gimnasio
  ADD CONSTRAINT gimnasio_opendata_identity CHECK (
    (source = 'opendata' AND provider IS NOT NULL AND external_id IS NOT NULL)
    OR (source <> 'opendata' AND provider IS NULL AND external_id IS NULL)
  );

ALTER TABLE public.gimnasio
  DROP CONSTRAINT IF EXISTS gimnasio_tipo_check;

ALTER TABLE public.gimnasio
  ADD CONSTRAINT gimnasio_tipo_check
  CHECK (tipo IN ('municipal', 'private', 'unknown'));

ALTER TABLE public.gimnasio
  DROP CONSTRAINT IF EXISTS gimnasio_provider_len;

ALTER TABLE public.gimnasio
  ADD CONSTRAINT gimnasio_provider_len CHECK (
    provider IS NULL OR (
      char_length(btrim(provider)) >= 1 AND char_length(provider) <= 40
    )
  );

ALTER TABLE public.gimnasio
  DROP CONSTRAINT IF EXISTS gimnasio_external_id_len;

ALTER TABLE public.gimnasio
  ADD CONSTRAINT gimnasio_external_id_len CHECK (
    external_id IS NULL OR (
      char_length(btrim(external_id)) >= 1 AND char_length(external_id) <= 80
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS gimnasio_opendata_identity_unique
  ON public.gimnasio (provider, external_id)
  WHERE provider IS NOT NULL AND external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS gimnasio_tipo_idx
  ON public.gimnasio (tipo);
