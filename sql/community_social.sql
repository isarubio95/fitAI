-- Comunidad: privacidad + seguimiento + índices para feed
-- Ejecutar en la base de datos (Postgres/Supabase)

-- 1) Privacidad de publicaciones (feed)
ALTER TABLE public.actividad
  ADD COLUMN IF NOT EXISTS es_publica boolean NOT NULL DEFAULT false;

-- 2) Preferencia del usuario (si publica o no)
ALTER TABLE public.perfil
  ADD COLUMN IF NOT EXISTS comunidad_publica_actividad boolean NOT NULL DEFAULT false;

-- 3) Seguimiento (seguir/desseguir)
CREATE TABLE IF NOT EXISTS public.seguimiento (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seguidor_id uuid NOT NULL REFERENCES public.perfil(id) ON DELETE CASCADE,
  seguido_id uuid NOT NULL REFERENCES public.perfil(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seguimiento_distinto CHECK (seguidor_id <> seguido_id),
  CONSTRAINT seguimiento_unique UNIQUE (seguidor_id, seguido_id)
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS seguimiento_seguidor_id_idx ON public.seguimiento (seguidor_id);
CREATE INDEX IF NOT EXISTS seguimiento_seguido_id_idx ON public.seguimiento (seguido_id);

-- Índice para el feed cronológico
CREATE INDEX IF NOT EXISTS actividad_es_publica_fecha_idx ON public.actividad (es_publica, fecha DESC);

-- Índice simple para búsqueda por username (puede que no optimice ILlKE con leading wildcards).
CREATE INDEX IF NOT EXISTS perfil_username_idx ON public.perfil (username);

