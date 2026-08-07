-- Likes y comentarios sociales sobre sesiones de cardio públicas.

CREATE TABLE IF NOT EXISTS public.cardio_sesion_like (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cardio_sesion_id uuid NOT NULL REFERENCES public.cardio_sesion (id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES public.perfil (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cardio_sesion_like_sesion_usuario_unique UNIQUE (cardio_sesion_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS cardio_sesion_like_sesion_id_idx
  ON public.cardio_sesion_like (cardio_sesion_id);

CREATE INDEX IF NOT EXISTS cardio_sesion_like_usuario_id_idx
  ON public.cardio_sesion_like (usuario_id);

CREATE TABLE IF NOT EXISTS public.cardio_sesion_comentario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cardio_sesion_id uuid NOT NULL REFERENCES public.cardio_sesion (id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES public.perfil (id) ON DELETE CASCADE,
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cardio_sesion_comentario_texto_len CHECK (
    char_length(btrim(texto)) >= 1 AND char_length(texto) <= 500
  )
);

CREATE INDEX IF NOT EXISTS cardio_sesion_comentario_sesion_id_idx
  ON public.cardio_sesion_comentario (cardio_sesion_id, created_at);

CREATE INDEX IF NOT EXISTS cardio_sesion_comentario_usuario_id_idx
  ON public.cardio_sesion_comentario (usuario_id);

ALTER TABLE public.cardio_sesion_like ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_sesion_comentario ENABLE ROW LEVEL SECURITY;

CREATE POLICY cardio_sesion_like_select_visible
  ON public.cardio_sesion_like FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion cs
      WHERE cs.id = cardio_sesion_id
        AND (cs.usuario_id = (select auth.uid()) OR cs.es_publica = true)
    )
  );

CREATE POLICY cardio_sesion_like_insert_own_on_visible
  ON public.cardio_sesion_like FOR INSERT TO public
  WITH CHECK (
    usuario_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.cardio_sesion cs
      WHERE cs.id = cardio_sesion_id
        AND (cs.usuario_id = (select auth.uid()) OR cs.es_publica = true)
    )
  );

CREATE POLICY cardio_sesion_like_delete_own
  ON public.cardio_sesion_like FOR DELETE TO public
  USING (usuario_id = (select auth.uid()));

CREATE POLICY cardio_sesion_comentario_select_visible
  ON public.cardio_sesion_comentario FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_sesion cs
      WHERE cs.id = cardio_sesion_id
        AND (cs.usuario_id = (select auth.uid()) OR cs.es_publica = true)
    )
  );

CREATE POLICY cardio_sesion_comentario_insert_own_on_visible
  ON public.cardio_sesion_comentario FOR INSERT TO public
  WITH CHECK (
    usuario_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.cardio_sesion cs
      WHERE cs.id = cardio_sesion_id
        AND (cs.usuario_id = (select auth.uid()) OR cs.es_publica = true)
    )
  );

CREATE POLICY cardio_sesion_comentario_delete_own_or_owner
  ON public.cardio_sesion_comentario FOR DELETE TO public
  USING (
    usuario_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.cardio_sesion cs
      WHERE cs.id = cardio_sesion_id
        AND cs.usuario_id = (select auth.uid())
    )
  );

-- Borrado de cuenta: limpiar likes/comentarios del usuario en cardio ajenos
-- (los de sus sesiones caen por CASCADE al borrar cardio_sesion).
CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id requerido';
  END IF;

  DELETE FROM cardio_sesion_like WHERE usuario_id = p_user_id;
  DELETE FROM cardio_sesion_comentario WHERE usuario_id = p_user_id;

  DELETE FROM cardio_track_point
  WHERE cardio_track_id IN (
    SELECT ct.id
    FROM cardio_track ct
    INNER JOIN cardio_sesion cs ON cs.id = ct.cardio_sesion_id
    WHERE cs.usuario_id = p_user_id
  );

  DELETE FROM cardio_track
  WHERE cardio_sesion_id IN (
    SELECT id FROM cardio_sesion WHERE usuario_id = p_user_id
  );

  DELETE FROM cardio_sesion_running
  WHERE cardio_sesion_id IN (
    SELECT id FROM cardio_sesion WHERE usuario_id = p_user_id
  );

  DELETE FROM cardio_sesion_cycling
  WHERE cardio_sesion_id IN (
    SELECT id FROM cardio_sesion WHERE usuario_id = p_user_id
  );

  DELETE FROM cardio_bloque
  WHERE cardio_sesion_id IN (
    SELECT id FROM cardio_sesion WHERE usuario_id = p_user_id
  );

  DELETE FROM cardio_rutina_programada WHERE usuario_id = p_user_id;

  DELETE FROM cardio_sesion WHERE usuario_id = p_user_id;

  DELETE FROM cardio_rutina_bloque
  WHERE cardio_rutina_id IN (
    SELECT id FROM cardio_rutina WHERE usuario_id = p_user_id
  );

  DELETE FROM cardio_rutina WHERE usuario_id = p_user_id;

  DELETE FROM serie
  WHERE ejercicio_id IN (
    SELECT e.id
    FROM ejercicio e
    INNER JOIN actividad a ON a.id = e.actividad_id
    WHERE a.usuario_id = p_user_id
  );

  DELETE FROM ejercicio
  WHERE actividad_id IN (
    SELECT id FROM actividad WHERE usuario_id = p_user_id
  );

  DELETE FROM actividad_like WHERE usuario_id = p_user_id;
  DELETE FROM actividad_comentario WHERE usuario_id = p_user_id;

  DELETE FROM actividad WHERE usuario_id = p_user_id;

  DELETE FROM rutina_ejercicio
  WHERE rutina_id IN (
    SELECT id FROM rutina WHERE usuario_id = p_user_id
  );

  DELETE FROM rutina_programada WHERE usuario_id = p_user_id;
  DELETE FROM rutina WHERE usuario_id = p_user_id;

  DELETE FROM usuario_ejercicio WHERE usuario_id = p_user_id;
  DELETE FROM medidas WHERE usuario_id = p_user_id;

  DELETE FROM usuario_logro WHERE usuario_id = p_user_id;
  DELETE FROM seguimiento WHERE seguidor_id = p_user_id OR seguido_id = p_user_id;

  DELETE FROM perfil WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_data(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_data(uuid) TO service_role;
