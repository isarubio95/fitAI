-- Elimina monetización premium: trigger, función y columna.
DROP TRIGGER IF EXISTS trg_perfil_guard_es_premium ON public.perfil;
DROP FUNCTION IF EXISTS public.perfil_guard_es_premium();
ALTER TABLE public.perfil DROP COLUMN IF EXISTS es_premium;
