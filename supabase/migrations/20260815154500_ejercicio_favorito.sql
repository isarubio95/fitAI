-- Favoritos de ejercicios del catálogo (tipo_ejercicio) y de usuario (usuario_ejercicio).

CREATE TABLE IF NOT EXISTS public.ejercicio_favorito (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.perfil (id) ON DELETE CASCADE,
  tipo_ejercicio_id uuid REFERENCES public.tipo_ejercicio (id) ON DELETE CASCADE,
  usuario_ejercicio_id uuid REFERENCES public.usuario_ejercicio (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ejercicio_favorito_exactly_one_source CHECK (
    (tipo_ejercicio_id IS NOT NULL AND usuario_ejercicio_id IS NULL)
    OR (tipo_ejercicio_id IS NULL AND usuario_ejercicio_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS ejercicio_favorito_usuario_tipo_uidx
  ON public.ejercicio_favorito (usuario_id, tipo_ejercicio_id)
  WHERE tipo_ejercicio_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ejercicio_favorito_usuario_usuario_ejercicio_uidx
  ON public.ejercicio_favorito (usuario_id, usuario_ejercicio_id)
  WHERE usuario_ejercicio_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ejercicio_favorito_usuario_id_idx
  ON public.ejercicio_favorito (usuario_id);

ALTER TABLE public.ejercicio_favorito ENABLE ROW LEVEL SECURITY;

CREATE POLICY ejercicio_favorito_select_own
  ON public.ejercicio_favorito FOR SELECT TO public
  USING (usuario_id = (select auth.uid()));

CREATE POLICY ejercicio_favorito_insert_own
  ON public.ejercicio_favorito FOR INSERT TO public
  WITH CHECK (usuario_id = (select auth.uid()));

CREATE POLICY ejercicio_favorito_delete_own
  ON public.ejercicio_favorito FOR DELETE TO public
  USING (usuario_id = (select auth.uid()));

-- Actualiza borrado de cuenta: favoritos antes de usuario_ejercicio.
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

  DELETE FROM cardio_ruta_punto
  WHERE cardio_ruta_id IN (
    SELECT id FROM cardio_ruta WHERE usuario_id = p_user_id
  );

  DELETE FROM cardio_ruta WHERE usuario_id = p_user_id;

  DELETE FROM cardio_rutina_programada WHERE usuario_id = p_user_id;

  DELETE FROM cardio_sesion WHERE usuario_id = p_user_id;

  DELETE FROM cardio_rutina_bloque
  WHERE cardio_rutina_id IN (
    SELECT id FROM cardio_rutina WHERE usuario_id = p_user_id
  );

  DELETE FROM cardio_rutina WHERE usuario_id = p_user_id;

  DELETE FROM actividad_fc_sample
  WHERE actividad_id IN (
    SELECT id FROM actividad WHERE usuario_id = p_user_id
  );

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

  DELETE FROM ejercicio_favorito WHERE usuario_id = p_user_id;
  DELETE FROM usuario_ejercicio WHERE usuario_id = p_user_id;
  DELETE FROM medidas WHERE usuario_id = p_user_id;

  DELETE FROM usuario_logro WHERE usuario_id = p_user_id;
  DELETE FROM seguimiento WHERE seguidor_id = p_user_id OR seguido_id = p_user_id;

  DELETE FROM perfil WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_data(uuid) FROM PUBLIC;
