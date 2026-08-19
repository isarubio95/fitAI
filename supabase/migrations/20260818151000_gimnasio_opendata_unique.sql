-- UNIQUE completo para upsert PostgREST (provider, external_id).
-- Los (NULL, NULL) de OSM/user siguen permitidos en PostgreSQL.

DROP INDEX IF EXISTS public.gimnasio_opendata_identity_unique;

ALTER TABLE public.gimnasio
  DROP CONSTRAINT IF EXISTS gimnasio_opendata_identity_unique;

ALTER TABLE public.gimnasio
  ADD CONSTRAINT gimnasio_opendata_identity_unique UNIQUE (provider, external_id);
