-- RLS para Comunidad (privacidad + seguir)

-- ACTIVIDAD: ver solo lo público salvo el dueño
ALTER TABLE public.actividad ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS actividad_select_owner_or_public ON public.actividad;
CREATE POLICY actividad_select_owner_or_public
ON public.actividad
FOR SELECT
USING (usuario_id = auth.uid() OR es_publica = true);

DROP POLICY IF EXISTS actividad_insert_owner ON public.actividad;
CREATE POLICY actividad_insert_owner
ON public.actividad
FOR INSERT
WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS actividad_update_owner ON public.actividad;
CREATE POLICY actividad_update_owner
ON public.actividad
FOR UPDATE
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS actividad_delete_owner ON public.actividad;
CREATE POLICY actividad_delete_owner
ON public.actividad
FOR DELETE
USING (usuario_id = auth.uid());

-- SEGUIMIENTO: solo el seguidor autenticado puede gestionar sus filas
ALTER TABLE public.seguimiento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS seguimiento_select_by_follower ON public.seguimiento;
CREATE POLICY seguimiento_select_by_follower
ON public.seguimiento
FOR SELECT
USING (seguidor_id = auth.uid());

DROP POLICY IF EXISTS seguimiento_insert_by_follower ON public.seguimiento;
CREATE POLICY seguimiento_insert_by_follower
ON public.seguimiento
FOR INSERT
WITH CHECK (seguidor_id = auth.uid());

DROP POLICY IF EXISTS seguimiento_delete_by_follower ON public.seguimiento;
CREATE POLICY seguimiento_delete_by_follower
ON public.seguimiento
FOR DELETE
USING (seguidor_id = auth.uid());

