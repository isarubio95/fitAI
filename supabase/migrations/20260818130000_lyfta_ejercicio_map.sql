-- Mapa global Lyfta exercise_id → tipo_ejercicio (catálogo Track Gym).
-- tipo_ejercicio_id NULL = aún sin par (revisión manual o auto-match pendiente).

CREATE TABLE IF NOT EXISTS public.lyfta_ejercicio_map (
  lyfta_id text PRIMARY KEY,
  lyfta_nombre text NOT NULL,
  tipo_ejercicio_id uuid REFERENCES public.tipo_ejercicio (id) ON DELETE SET NULL,
  auto_matched boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lyfta_ejercicio_map_tipo_idx
  ON public.lyfta_ejercicio_map (tipo_ejercicio_id)
  WHERE tipo_ejercicio_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS lyfta_ejercicio_map_unmapped_idx
  ON public.lyfta_ejercicio_map (lyfta_id)
  WHERE tipo_ejercicio_id IS NULL;

ALTER TABLE public.lyfta_ejercicio_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY lyfta_ejercicio_map_select_auth
  ON public.lyfta_ejercicio_map FOR SELECT TO public
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY lyfta_ejercicio_map_insert_auth
  ON public.lyfta_ejercicio_map FOR INSERT TO public
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY lyfta_ejercicio_map_update_auth
  ON public.lyfta_ejercicio_map FOR UPDATE TO public
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);
