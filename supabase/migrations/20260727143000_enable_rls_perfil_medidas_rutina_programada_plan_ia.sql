-- Habilita RLS en tablas expuestas que estaban sin políticas.
-- Políticas alineadas con el uso real del cliente (comunidad, plan, medidas, gamificación)
-- y con Edge Functions que usan service_role (bypass RLS).

-- ---------------------------------------------------------------------------
-- perfil
-- SELECT: usuarios autenticados pueden leer perfiles ajenos (feed, búsqueda,
--         drawer, username único, stats/logros de otros).
-- INSERT/UPDATE/DELETE: solo el propio id = auth.uid().
-- ---------------------------------------------------------------------------
ALTER TABLE public.perfil ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS perfil_select_authenticated ON public.perfil;
CREATE POLICY perfil_select_authenticated
  ON public.perfil
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS perfil_insert_own ON public.perfil;
CREATE POLICY perfil_insert_own
  ON public.perfil
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS perfil_update_own ON public.perfil;
CREATE POLICY perfil_update_own
  ON public.perfil
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS perfil_delete_own ON public.perfil;
CREATE POLICY perfil_delete_own
  ON public.perfil
  FOR DELETE
  TO authenticated
  USING (id = auth.uid());

-- Impide que el cliente se auto-asigne es_premium.
-- service_role (Edge Functions / admin) sí puede cambiarlo.
CREATE OR REPLACE FUNCTION public.perfil_guard_es_premium()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.es_premium IS TRUE
       AND coalesce(auth.jwt() ->> 'role', '') IS DISTINCT FROM 'service_role' THEN
      NEW.es_premium := false;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.es_premium IS DISTINCT FROM OLD.es_premium
       AND coalesce(auth.jwt() ->> 'role', '') IS DISTINCT FROM 'service_role' THEN
      NEW.es_premium := OLD.es_premium;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_perfil_guard_es_premium ON public.perfil;
CREATE TRIGGER trg_perfil_guard_es_premium
  BEFORE INSERT OR UPDATE ON public.perfil
  FOR EACH ROW
  EXECUTE FUNCTION public.perfil_guard_es_premium();

-- Solo trigger interno: no exponer como RPC.
REVOKE ALL ON FUNCTION public.perfil_guard_es_premium() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.perfil_guard_es_premium() FROM anon;
REVOKE ALL ON FUNCTION public.perfil_guard_es_premium() FROM authenticated;

-- ---------------------------------------------------------------------------
-- medidas: datos sensibles, solo el dueño
-- ---------------------------------------------------------------------------
ALTER TABLE public.medidas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medidas_select_owner ON public.medidas;
CREATE POLICY medidas_select_owner
  ON public.medidas
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS medidas_insert_owner ON public.medidas;
CREATE POLICY medidas_insert_owner
  ON public.medidas
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS medidas_update_owner ON public.medidas;
CREATE POLICY medidas_update_owner
  ON public.medidas
  FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS medidas_delete_owner ON public.medidas;
CREATE POLICY medidas_delete_owner
  ON public.medidas
  FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- ---------------------------------------------------------------------------
-- rutina_programada: plan de entrenamiento, solo el dueño
-- (mismo modelo que cardio_rutina_programada)
-- ---------------------------------------------------------------------------
ALTER TABLE public.rutina_programada ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rutina_programada_select_owner ON public.rutina_programada;
CREATE POLICY rutina_programada_select_owner
  ON public.rutina_programada
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS rutina_programada_insert_owner ON public.rutina_programada;
CREATE POLICY rutina_programada_insert_owner
  ON public.rutina_programada
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS rutina_programada_update_owner ON public.rutina_programada;
CREATE POLICY rutina_programada_update_owner
  ON public.rutina_programada
  FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS rutina_programada_delete_owner ON public.rutina_programada;
CREATE POLICY rutina_programada_delete_owner
  ON public.rutina_programada
  FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());

-- ---------------------------------------------------------------------------
-- plan_generado_ia: historial de prompts IA; escritura habitual vía service_role.
-- Políticas de dueño por si el cliente lee/borra en el futuro.
-- ---------------------------------------------------------------------------
ALTER TABLE public.plan_generado_ia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plan_generado_ia_select_owner ON public.plan_generado_ia;
CREATE POLICY plan_generado_ia_select_owner
  ON public.plan_generado_ia
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS plan_generado_ia_insert_owner ON public.plan_generado_ia;
CREATE POLICY plan_generado_ia_insert_owner
  ON public.plan_generado_ia
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS plan_generado_ia_update_owner ON public.plan_generado_ia;
CREATE POLICY plan_generado_ia_update_owner
  ON public.plan_generado_ia
  FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS plan_generado_ia_delete_owner ON public.plan_generado_ia;
CREATE POLICY plan_generado_ia_delete_owner
  ON public.plan_generado_ia
  FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid());
