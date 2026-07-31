-- Optimiza RLS:
-- 1) auth.uid() -> (select auth.uid()) para initplan (lint 0003)
-- 2) elimina políticas duplicadas en actividad/ejercicio/serie (lint 0006)
-- 3) fusiona SELECT de plantillas en rutina / rutina_ejercicio (lint 0006)

-- =============================================================================
-- Duplicados: las políticas "Users can ..." son redundantes frente a las *_owner*
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own workouts" ON public.actividad;
DROP POLICY IF EXISTS "Users can create own workouts" ON public.actividad;
DROP POLICY IF EXISTS "Users can update own workouts" ON public.actividad;
DROP POLICY IF EXISTS "Users can delete own workouts" ON public.actividad;

DROP POLICY IF EXISTS "Users can view own exercises" ON public.ejercicio;
DROP POLICY IF EXISTS "Users can create own exercises" ON public.ejercicio;
DROP POLICY IF EXISTS "Users can update own exercises" ON public.ejercicio;
DROP POLICY IF EXISTS "Users can delete own exercises" ON public.ejercicio;

DROP POLICY IF EXISTS "Users can view own sets" ON public.serie;
DROP POLICY IF EXISTS "Users can create own sets" ON public.serie;
DROP POLICY IF EXISTS "Users can update own sets" ON public.serie;
DROP POLICY IF EXISTS "Users can delete own sets" ON public.serie;

-- =============================================================================
-- actividad
-- =============================================================================
DROP POLICY IF EXISTS actividad_select_owner_or_public ON public.actividad;
CREATE POLICY actividad_select_owner_or_public
  ON public.actividad FOR SELECT TO public
  USING (usuario_id = (select auth.uid()) OR es_publica = true);

DROP POLICY IF EXISTS actividad_insert_owner ON public.actividad;
CREATE POLICY actividad_insert_owner
  ON public.actividad FOR INSERT TO public
  WITH CHECK (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS actividad_update_owner ON public.actividad;
CREATE POLICY actividad_update_owner
  ON public.actividad FOR UPDATE TO public
  USING (usuario_id = (select auth.uid()))
  WITH CHECK (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS actividad_delete_owner ON public.actividad;
CREATE POLICY actividad_delete_owner
  ON public.actividad FOR DELETE TO public
  USING (usuario_id = (select auth.uid()));

-- =============================================================================
-- ejercicio
-- =============================================================================
DROP POLICY IF EXISTS ejercicio_select_visible_actividad ON public.ejercicio;
CREATE POLICY ejercicio_select_visible_actividad
  ON public.ejercicio FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.actividad a
      WHERE a.id = ejercicio.actividad_id
        AND (a.usuario_id = (select auth.uid()) OR a.es_publica = true)
    )
  );

DROP POLICY IF EXISTS ejercicio_insert_owner_actividad ON public.ejercicio;
CREATE POLICY ejercicio_insert_owner_actividad
  ON public.ejercicio FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.actividad a
      WHERE a.id = ejercicio.actividad_id
        AND a.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS ejercicio_update_owner_actividad ON public.ejercicio;
CREATE POLICY ejercicio_update_owner_actividad
  ON public.ejercicio FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.actividad a
      WHERE a.id = ejercicio.actividad_id
        AND a.usuario_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.actividad a
      WHERE a.id = ejercicio.actividad_id
        AND a.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS ejercicio_delete_owner_actividad ON public.ejercicio;
CREATE POLICY ejercicio_delete_owner_actividad
  ON public.ejercicio FOR DELETE TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.actividad a
      WHERE a.id = ejercicio.actividad_id
        AND a.usuario_id = (select auth.uid())
    )
  );

-- =============================================================================
-- serie
-- =============================================================================
DROP POLICY IF EXISTS serie_select_visible_actividad ON public.serie;
CREATE POLICY serie_select_visible_actividad
  ON public.serie FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.ejercicio e
      JOIN public.actividad a ON a.id = e.actividad_id
      WHERE e.id = serie.ejercicio_id
        AND (a.usuario_id = (select auth.uid()) OR a.es_publica = true)
    )
  );

DROP POLICY IF EXISTS serie_insert_owner_actividad ON public.serie;
CREATE POLICY serie_insert_owner_actividad
  ON public.serie FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.ejercicio e
      JOIN public.actividad a ON a.id = e.actividad_id
      WHERE e.id = serie.ejercicio_id
        AND a.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS serie_update_owner_actividad ON public.serie;
CREATE POLICY serie_update_owner_actividad
  ON public.serie FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.ejercicio e
      JOIN public.actividad a ON a.id = e.actividad_id
      WHERE e.id = serie.ejercicio_id
        AND a.usuario_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.ejercicio e
      JOIN public.actividad a ON a.id = e.actividad_id
      WHERE e.id = serie.ejercicio_id
        AND a.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS serie_delete_owner_actividad ON public.serie;
CREATE POLICY serie_delete_owner_actividad
  ON public.serie FOR DELETE TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.ejercicio e
      JOIN public.actividad a ON a.id = e.actividad_id
      WHERE e.id = serie.ejercicio_id
        AND a.usuario_id = (select auth.uid())
    )
  );

-- =============================================================================
-- rutina: fusionar SELECT propias + plantillas
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own routines" ON public.rutina;
DROP POLICY IF EXISTS "Todos pueden ver las plantillas" ON public.rutina;
DROP POLICY IF EXISTS rutina_select_own_or_template ON public.rutina;
CREATE POLICY rutina_select_own_or_template
  ON public.rutina FOR SELECT TO public
  USING (usuario_id = (select auth.uid()) OR es_plantilla = true);

DROP POLICY IF EXISTS "Users can create own routines" ON public.rutina;
CREATE POLICY "Users can create own routines"
  ON public.rutina FOR INSERT TO authenticated
  WITH CHECK (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own routines" ON public.rutina;
CREATE POLICY "Users can update own routines"
  ON public.rutina FOR UPDATE TO authenticated
  USING (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own routines" ON public.rutina;
CREATE POLICY "Users can delete own routines"
  ON public.rutina FOR DELETE TO authenticated
  USING (usuario_id = (select auth.uid()));

-- =============================================================================
-- rutina_ejercicio: fusionar SELECT propias + plantillas
-- =============================================================================
DROP POLICY IF EXISTS "Users can view own routine exercises" ON public.rutina_ejercicio;
DROP POLICY IF EXISTS "Ver ejercicios de plantillas" ON public.rutina_ejercicio;
DROP POLICY IF EXISTS rutina_ejercicio_select_own_or_template ON public.rutina_ejercicio;
CREATE POLICY rutina_ejercicio_select_own_or_template
  ON public.rutina_ejercicio FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.rutina r
      WHERE r.id = rutina_ejercicio.rutina_id
        AND (r.usuario_id = (select auth.uid()) OR r.es_plantilla = true)
    )
  );

DROP POLICY IF EXISTS "Users can create own routine exercises" ON public.rutina_ejercicio;
CREATE POLICY "Users can create own routine exercises"
  ON public.rutina_ejercicio FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rutina r
      WHERE r.id = rutina_ejercicio.rutina_id
        AND r.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own routine exercises" ON public.rutina_ejercicio;
CREATE POLICY "Users can update own routine exercises"
  ON public.rutina_ejercicio FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rutina r
      WHERE r.id = rutina_ejercicio.rutina_id
        AND r.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own routine exercises" ON public.rutina_ejercicio;
CREATE POLICY "Users can delete own routine exercises"
  ON public.rutina_ejercicio FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rutina r
      WHERE r.id = rutina_ejercicio.rutina_id
        AND r.usuario_id = (select auth.uid())
    )
  );

