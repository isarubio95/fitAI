-- La función solo debe usarse como trigger, no como RPC público.
REVOKE ALL ON FUNCTION public.perfil_guard_es_premium() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.perfil_guard_es_premium() FROM anon;
REVOKE ALL ON FUNCTION public.perfil_guard_es_premium() FROM authenticated;
