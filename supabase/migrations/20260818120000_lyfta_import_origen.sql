-- Origen de importación (Lyfta, etc.) para deduplicar reimports.
-- Unique parcial: varias filas nativas pueden seguir con origen NULL.

ALTER TABLE public.actividad
  ADD COLUMN IF NOT EXISTS origen text,
  ADD COLUMN IF NOT EXISTS origen_externo_id text;

ALTER TABLE public.rutina
  ADD COLUMN IF NOT EXISTS origen text,
  ADD COLUMN IF NOT EXISTS origen_externo_id text;

CREATE UNIQUE INDEX IF NOT EXISTS actividad_origen_externo_uidx
  ON public.actividad (usuario_id, origen, origen_externo_id)
  WHERE origen IS NOT NULL AND origen_externo_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS rutina_origen_externo_uidx
  ON public.rutina (usuario_id, origen, origen_externo_id)
  WHERE usuario_id IS NOT NULL AND origen IS NOT NULL AND origen_externo_id IS NOT NULL;
