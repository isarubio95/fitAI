-- RLS para dominio cardio (sesiones + bloques + rutinas)

ALTER TABLE public.cardio_sesion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_bloque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_rutina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_rutina_bloque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_rutina_programada ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_disciplina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_sesion_running ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_sesion_cycling ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_track ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_track_point ENABLE ROW LEVEL SECURITY;

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

-- cardio_disciplina (catálogo público de lectura)
DROP POLICY IF EXISTS cardio_disciplina_select_all ON public.cardio_disciplina;
CREATE POLICY cardio_disciplina_select_all
ON public.cardio_disciplina
FOR SELECT
USING (true);

-- cardio_sesion_running
DROP POLICY IF EXISTS cardio_sesion_running_select_visible_session ON public.cardio_sesion_running;
CREATE POLICY cardio_sesion_running_select_visible_session
ON public.cardio_sesion_running
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_sesion_running.cardio_sesion_id
      AND (s.usuario_id = auth.uid() OR s.es_publica = true)
  )
);

DROP POLICY IF EXISTS cardio_sesion_running_insert_owner_session ON public.cardio_sesion_running;
CREATE POLICY cardio_sesion_running_insert_owner_session
ON public.cardio_sesion_running
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_sesion_running.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS cardio_sesion_running_update_owner_session ON public.cardio_sesion_running;
CREATE POLICY cardio_sesion_running_update_owner_session
ON public.cardio_sesion_running
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_sesion_running.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_sesion_running.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS cardio_sesion_running_delete_owner_session ON public.cardio_sesion_running;
CREATE POLICY cardio_sesion_running_delete_owner_session
ON public.cardio_sesion_running
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_sesion_running.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
);

-- cardio_sesion_cycling
DROP POLICY IF EXISTS cardio_sesion_cycling_select_visible_session ON public.cardio_sesion_cycling;
CREATE POLICY cardio_sesion_cycling_select_visible_session
ON public.cardio_sesion_cycling
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_sesion_cycling.cardio_sesion_id
      AND (s.usuario_id = auth.uid() OR s.es_publica = true)
  )
);

DROP POLICY IF EXISTS cardio_sesion_cycling_insert_owner_session ON public.cardio_sesion_cycling;
CREATE POLICY cardio_sesion_cycling_insert_owner_session
ON public.cardio_sesion_cycling
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_sesion_cycling.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS cardio_sesion_cycling_update_owner_session ON public.cardio_sesion_cycling;
CREATE POLICY cardio_sesion_cycling_update_owner_session
ON public.cardio_sesion_cycling
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_sesion_cycling.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_sesion_cycling.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS cardio_sesion_cycling_delete_owner_session ON public.cardio_sesion_cycling;
CREATE POLICY cardio_sesion_cycling_delete_owner_session
ON public.cardio_sesion_cycling
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_sesion_cycling.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
);

-- cardio_track
DROP POLICY IF EXISTS cardio_track_select_visible_session ON public.cardio_track;
CREATE POLICY cardio_track_select_visible_session
ON public.cardio_track
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_track.cardio_sesion_id
      AND (s.usuario_id = auth.uid() OR s.es_publica = true)
  )
);

DROP POLICY IF EXISTS cardio_track_insert_owner_session ON public.cardio_track;
CREATE POLICY cardio_track_insert_owner_session
ON public.cardio_track
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_track.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS cardio_track_update_owner_session ON public.cardio_track;
CREATE POLICY cardio_track_update_owner_session
ON public.cardio_track
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_track.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_track.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS cardio_track_delete_owner_session ON public.cardio_track;
CREATE POLICY cardio_track_delete_owner_session
ON public.cardio_track
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_sesion s
    WHERE s.id = cardio_track.cardio_sesion_id
      AND s.usuario_id = auth.uid()
  )
);

-- cardio_track_point
DROP POLICY IF EXISTS cardio_track_point_select_visible_session ON public.cardio_track_point;
CREATE POLICY cardio_track_point_select_visible_session
ON public.cardio_track_point
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_track t
    JOIN public.cardio_sesion s ON s.id = t.cardio_sesion_id
    WHERE t.id = cardio_track_point.cardio_track_id
      AND (s.usuario_id = auth.uid() OR s.es_publica = true)
  )
);

DROP POLICY IF EXISTS cardio_track_point_insert_owner_session ON public.cardio_track_point;
CREATE POLICY cardio_track_point_insert_owner_session
ON public.cardio_track_point
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cardio_track t
    JOIN public.cardio_sesion s ON s.id = t.cardio_sesion_id
    WHERE t.id = cardio_track_point.cardio_track_id
      AND s.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS cardio_track_point_update_owner_session ON public.cardio_track_point;
CREATE POLICY cardio_track_point_update_owner_session
ON public.cardio_track_point
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_track t
    JOIN public.cardio_sesion s ON s.id = t.cardio_sesion_id
    WHERE t.id = cardio_track_point.cardio_track_id
      AND s.usuario_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cardio_track t
    JOIN public.cardio_sesion s ON s.id = t.cardio_sesion_id
    WHERE t.id = cardio_track_point.cardio_track_id
      AND s.usuario_id = auth.uid()
  )
);

DROP POLICY IF EXISTS cardio_track_point_delete_owner_session ON public.cardio_track_point;
CREATE POLICY cardio_track_point_delete_owner_session
ON public.cardio_track_point
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.cardio_track t
    JOIN public.cardio_sesion s ON s.id = t.cardio_sesion_id
    WHERE t.id = cardio_track_point.cardio_track_id
      AND s.usuario_id = auth.uid()
  )
);

