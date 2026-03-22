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
USING (seguidor_id = auth.uid() OR seguido_id = auth.uid());

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

-- EJERCICIO + SERIE: lectura alineada con actividad (dueño ve todo; otros solo si es_publica).
-- Sin esto, RLS en actividad permite ver la fila pública pero los SELECT a ejercicio/serie
-- devuelven vacío y el perfil / feed de otros no muestra el entrenamiento completo.

ALTER TABLE public.ejercicio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ejercicio_select_visible_actividad ON public.ejercicio;
CREATE POLICY ejercicio_select_visible_actividad
ON public.ejercicio
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.actividad a
    WHERE a.id = ejercicio.actividad_id
      AND (a.usuario_id = auth.uid() OR a.es_publica = true)
  )
);

DROP POLICY IF EXISTS ejercicio_insert_owner_actividad ON public.ejercicio;
CREATE POLICY ejercicio_insert_owner_actividad
ON public.ejercicio
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.actividad a
    WHERE a.id = ejercicio.actividad_id
      AND a.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS ejercicio_update_owner_actividad ON public.ejercicio;
CREATE POLICY ejercicio_update_owner_actividad
ON public.ejercicio
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.actividad a
    WHERE a.id = ejercicio.actividad_id
      AND a.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.actividad a
    WHERE a.id = ejercicio.actividad_id
      AND a.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS ejercicio_delete_owner_actividad ON public.ejercicio;
CREATE POLICY ejercicio_delete_owner_actividad
ON public.ejercicio
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.actividad a
    WHERE a.id = ejercicio.actividad_id
      AND a.usuario_id = auth.uid()
  )
);

ALTER TABLE public.serie ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS serie_select_visible_actividad ON public.serie;
CREATE POLICY serie_select_visible_actividad
ON public.serie
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.ejercicio e
    JOIN public.actividad a ON a.id = e.actividad_id
    WHERE e.id = serie.ejercicio_id
      AND (a.usuario_id = auth.uid() OR a.es_publica = true)
  )
);

DROP POLICY IF EXISTS serie_insert_owner_actividad ON public.serie;
CREATE POLICY serie_insert_owner_actividad
ON public.serie
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.ejercicio e
    JOIN public.actividad a ON a.id = e.actividad_id
    WHERE e.id = serie.ejercicio_id
      AND a.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS serie_update_owner_actividad ON public.serie;
CREATE POLICY serie_update_owner_actividad
ON public.serie
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.ejercicio e
    JOIN public.actividad a ON a.id = e.actividad_id
    WHERE e.id = serie.ejercicio_id
      AND a.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.ejercicio e
    JOIN public.actividad a ON a.id = e.actividad_id
    WHERE e.id = serie.ejercicio_id
      AND a.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS serie_delete_owner_actividad ON public.serie;
CREATE POLICY serie_delete_owner_actividad
ON public.serie
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.ejercicio e
    JOIN public.actividad a ON a.id = e.actividad_id
    WHERE e.id = serie.ejercicio_id
      AND a.usuario_id = auth.uid()
  )
);
