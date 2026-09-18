-- =============================================================================
-- seguimiento
-- =============================================================================
DROP POLICY IF EXISTS seguimiento_select_by_follower ON public.seguimiento;
CREATE POLICY seguimiento_select_by_follower
  ON public.seguimiento FOR SELECT TO public
  USING (seguidor_id = (select auth.uid()) OR seguido_id = (select auth.uid()));

DROP POLICY IF EXISTS seguimiento_insert_by_follower ON public.seguimiento;
CREATE POLICY seguimiento_insert_by_follower
  ON public.seguimiento FOR INSERT TO public
  WITH CHECK (seguidor_id = (select auth.uid()));

DROP POLICY IF EXISTS seguimiento_delete_by_follower ON public.seguimiento;
CREATE POLICY seguimiento_delete_by_follower
  ON public.seguimiento FOR DELETE TO public
  USING (seguidor_id = (select auth.uid()));

-- =============================================================================
-- usuario_ejercicio
-- =============================================================================
DROP POLICY IF EXISTS usuario_ejercicio_select_own ON public.usuario_ejercicio;
CREATE POLICY usuario_ejercicio_select_own
  ON public.usuario_ejercicio FOR SELECT TO public
  USING (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS usuario_ejercicio_insert_own ON public.usuario_ejercicio;
CREATE POLICY usuario_ejercicio_insert_own
  ON public.usuario_ejercicio FOR INSERT TO public
  WITH CHECK (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS usuario_ejercicio_update_own ON public.usuario_ejercicio;
CREATE POLICY usuario_ejercicio_update_own
  ON public.usuario_ejercicio FOR UPDATE TO public
  USING (usuario_id = (select auth.uid()))
  WITH CHECK (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS usuario_ejercicio_delete_own ON public.usuario_ejercicio;
CREATE POLICY usuario_ejercicio_delete_own
  ON public.usuario_ejercicio FOR DELETE TO public
  USING (usuario_id = (select auth.uid()));

-- =============================================================================
-- perfil / medidas / rutina_programada / plan_generado_ia / usuario_logro
-- =============================================================================
DROP POLICY IF EXISTS perfil_insert_own ON public.perfil;
CREATE POLICY perfil_insert_own
  ON public.perfil FOR INSERT TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS perfil_update_own ON public.perfil;
CREATE POLICY perfil_update_own
  ON public.perfil FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS perfil_delete_own ON public.perfil;
CREATE POLICY perfil_delete_own
  ON public.perfil FOR DELETE TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS medidas_select_owner ON public.medidas;
CREATE POLICY medidas_select_owner
  ON public.medidas FOR SELECT TO authenticated
  USING (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS medidas_insert_owner ON public.medidas;
CREATE POLICY medidas_insert_owner
  ON public.medidas FOR INSERT TO authenticated
  WITH CHECK (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS medidas_update_owner ON public.medidas;
CREATE POLICY medidas_update_owner
  ON public.medidas FOR UPDATE TO authenticated
  USING (usuario_id = (select auth.uid()))
  WITH CHECK (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS medidas_delete_owner ON public.medidas;
CREATE POLICY medidas_delete_owner
  ON public.medidas FOR DELETE TO authenticated
  USING (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS rutina_programada_select_owner ON public.rutina_programada;
CREATE POLICY rutina_programada_select_owner
  ON public.rutina_programada FOR SELECT TO authenticated
  USING (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS rutina_programada_insert_owner ON public.rutina_programada;
CREATE POLICY rutina_programada_insert_owner
  ON public.rutina_programada FOR INSERT TO authenticated
  WITH CHECK (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS rutina_programada_update_owner ON public.rutina_programada;
CREATE POLICY rutina_programada_update_owner
  ON public.rutina_programada FOR UPDATE TO authenticated
  USING (usuario_id = (select auth.uid()))
  WITH CHECK (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS rutina_programada_delete_owner ON public.rutina_programada;
CREATE POLICY rutina_programada_delete_owner
  ON public.rutina_programada FOR DELETE TO authenticated
  USING (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS plan_generado_ia_select_owner ON public.plan_generado_ia;
CREATE POLICY plan_generado_ia_select_owner
  ON public.plan_generado_ia FOR SELECT TO authenticated
  USING (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS plan_generado_ia_insert_owner ON public.plan_generado_ia;
CREATE POLICY plan_generado_ia_insert_owner
  ON public.plan_generado_ia FOR INSERT TO authenticated
  WITH CHECK (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS plan_generado_ia_update_owner ON public.plan_generado_ia;
CREATE POLICY plan_generado_ia_update_owner
  ON public.plan_generado_ia FOR UPDATE TO authenticated
  USING (usuario_id = (select auth.uid()))
  WITH CHECK (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS plan_generado_ia_delete_owner ON public.plan_generado_ia;
CREATE POLICY plan_generado_ia_delete_owner
  ON public.plan_generado_ia FOR DELETE TO authenticated
  USING (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS usuario_logro_insert_own ON public.usuario_logro;
CREATE POLICY usuario_logro_insert_own
  ON public.usuario_logro FOR INSERT TO authenticated
  WITH CHECK (usuario_id = (select auth.uid()));

