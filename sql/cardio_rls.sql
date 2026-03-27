-- RLS para dominio cardio (sesiones + bloques + rutinas)

ALTER TABLE public.cardio_sesion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_bloque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_rutina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_rutina_bloque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_rutina_programada ENABLE ROW LEVEL SECURITY;

-- cardio_sesion
DROP POLICY IF EXISTS cardio_sesion_select_owner_or_public ON public.cardio_sesion;
CREATE POLICY cardio_sesion_select_owner_or_public
ON public.cardio_sesion
FOR SELECT
USING (usuario_id = auth.uid() OR es_publica = true);

DROP POLICY IF EXISTS cardio_sesion_insert_owner ON public.cardio_sesion;
CREATE POLICY cardio_sesion_insert_owner
ON public.cardio_sesion
FOR INSERT
WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS cardio_sesion_update_owner ON public.cardio_sesion;
CREATE POLICY cardio_sesion_update_owner
ON public.cardio_sesion
FOR UPDATE
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS cardio_sesion_delete_owner ON public.cardio_sesion;
CREATE POLICY cardio_sesion_delete_owner
ON public.cardio_sesion
FOR DELETE
USING (usuario_id = auth.uid());

-- cardio_bloque
DROP POLICY IF EXISTS cardio_bloque_select_visible_session ON public.cardio_bloque;
CREATE POLICY cardio_bloque_select_visible_session
ON public.cardio_bloque
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_bloque.cardio_sesion_id
      AND (s.usuario_id = auth.uid() OR s.es_publica = true)
  )
);

DROP POLICY IF EXISTS cardio_bloque_insert_owner_session ON public.cardio_bloque;
CREATE POLICY cardio_bloque_insert_owner_session
ON public.cardio_bloque
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_bloque.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS cardio_bloque_update_owner_session ON public.cardio_bloque;
CREATE POLICY cardio_bloque_update_owner_session
ON public.cardio_bloque
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_bloque.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_bloque.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS cardio_bloque_delete_owner_session ON public.cardio_bloque;
CREATE POLICY cardio_bloque_delete_owner_session
ON public.cardio_bloque
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_bloque.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
);

-- cardio_rutina
DROP POLICY IF EXISTS cardio_rutina_select_owner ON public.cardio_rutina;
CREATE POLICY cardio_rutina_select_owner
ON public.cardio_rutina
FOR SELECT
USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS cardio_rutina_insert_owner ON public.cardio_rutina;
CREATE POLICY cardio_rutina_insert_owner
ON public.cardio_rutina
FOR INSERT
WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS cardio_rutina_update_owner ON public.cardio_rutina;
CREATE POLICY cardio_rutina_update_owner
ON public.cardio_rutina
FOR UPDATE
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS cardio_rutina_delete_owner ON public.cardio_rutina;
CREATE POLICY cardio_rutina_delete_owner
ON public.cardio_rutina
FOR DELETE
USING (usuario_id = auth.uid());

-- cardio_rutina_bloque
DROP POLICY IF EXISTS cardio_rutina_bloque_select_owner_routine ON public.cardio_rutina_bloque;
CREATE POLICY cardio_rutina_bloque_select_owner_routine
ON public.cardio_rutina_bloque
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_rutina r
    WHERE r.id = cardio_rutina_bloque.cardio_rutina_id
      AND r.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS cardio_rutina_bloque_insert_owner_routine ON public.cardio_rutina_bloque;
CREATE POLICY cardio_rutina_bloque_insert_owner_routine
ON public.cardio_rutina_bloque
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cardio_rutina r
    WHERE r.id = cardio_rutina_bloque.cardio_rutina_id
      AND r.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS cardio_rutina_bloque_update_owner_routine ON public.cardio_rutina_bloque;
CREATE POLICY cardio_rutina_bloque_update_owner_routine
ON public.cardio_rutina_bloque
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_rutina r
    WHERE r.id = cardio_rutina_bloque.cardio_rutina_id
      AND r.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cardio_rutina r
    WHERE r.id = cardio_rutina_bloque.cardio_rutina_id
      AND r.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS cardio_rutina_bloque_delete_owner_routine ON public.cardio_rutina_bloque;
CREATE POLICY cardio_rutina_bloque_delete_owner_routine
ON public.cardio_rutina_bloque
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_rutina r
    WHERE r.id = cardio_rutina_bloque.cardio_rutina_id
      AND r.usuario_id = auth.uid()
  )
);

-- cardio_rutina_programada
DROP POLICY IF EXISTS cardio_rutina_programada_select_owner ON public.cardio_rutina_programada;
CREATE POLICY cardio_rutina_programada_select_owner
ON public.cardio_rutina_programada
FOR SELECT
USING (usuario_id = auth.uid());

DROP POLICY IF EXISTS cardio_rutina_programada_insert_owner ON public.cardio_rutina_programada;
CREATE POLICY cardio_rutina_programada_insert_owner
ON public.cardio_rutina_programada
FOR INSERT
WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS cardio_rutina_programada_update_owner ON public.cardio_rutina_programada;
CREATE POLICY cardio_rutina_programada_update_owner
ON public.cardio_rutina_programada
FOR UPDATE
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());

DROP POLICY IF EXISTS cardio_rutina_programada_delete_owner ON public.cardio_rutina_programada;
CREATE POLICY cardio_rutina_programada_delete_owner
ON public.cardio_rutina_programada
FOR DELETE
USING (usuario_id = auth.uid());

