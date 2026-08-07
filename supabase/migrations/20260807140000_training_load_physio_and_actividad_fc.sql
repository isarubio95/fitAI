-- Perfil fisiológico para TRIMP / Banister + FC en sesiones de fuerza.

ALTER TABLE public.perfil
  ADD COLUMN IF NOT EXISTS fecha_nacimiento date,
  ADD COLUMN IF NOT EXISTS fc_max integer,
  ADD COLUMN IF NOT EXISTS fc_reposo integer,
  ADD COLUMN IF NOT EXISTS ftp_w integer;

ALTER TABLE public.perfil
  DROP CONSTRAINT IF EXISTS perfil_fc_max_check;
ALTER TABLE public.perfil
  ADD CONSTRAINT perfil_fc_max_check
  CHECK (fc_max IS NULL OR (fc_max >= 100 AND fc_max <= 230));

ALTER TABLE public.perfil
  DROP CONSTRAINT IF EXISTS perfil_fc_reposo_check;
ALTER TABLE public.perfil
  ADD CONSTRAINT perfil_fc_reposo_check
  CHECK (fc_reposo IS NULL OR (fc_reposo >= 30 AND fc_reposo <= 120));

ALTER TABLE public.perfil
  DROP CONSTRAINT IF EXISTS perfil_ftp_w_check;
ALTER TABLE public.perfil
  ADD CONSTRAINT perfil_ftp_w_check
  CHECK (ftp_w IS NULL OR (ftp_w >= 50 AND ftp_w <= 600));

ALTER TABLE public.actividad
  ADD COLUMN IF NOT EXISTS fc_media integer,
  ADD COLUMN IF NOT EXISTS fc_max integer;

CREATE TABLE IF NOT EXISTS public.actividad_fc_sample (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actividad_id uuid NOT NULL REFERENCES public.actividad (id) ON DELETE CASCADE,
  t_epoch_ms bigint NOT NULL,
  bpm integer NOT NULL CHECK (bpm >= 30 AND bpm <= 250),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS actividad_fc_sample_actividad_id_t_idx
  ON public.actividad_fc_sample (actividad_id, t_epoch_ms);

ALTER TABLE public.actividad_fc_sample ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS actividad_fc_sample_select_owner ON public.actividad_fc_sample;
CREATE POLICY actividad_fc_sample_select_owner
  ON public.actividad_fc_sample FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.actividad a
      WHERE a.id = actividad_fc_sample.actividad_id
        AND a.usuario_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS actividad_fc_sample_insert_owner ON public.actividad_fc_sample;
CREATE POLICY actividad_fc_sample_insert_owner
  ON public.actividad_fc_sample FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.actividad a
      WHERE a.id = actividad_fc_sample.actividad_id
        AND a.usuario_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS actividad_fc_sample_delete_owner ON public.actividad_fc_sample;
CREATE POLICY actividad_fc_sample_delete_owner
  ON public.actividad_fc_sample FOR DELETE TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.actividad a
      WHERE a.id = actividad_fc_sample.actividad_id
        AND a.usuario_id = (SELECT auth.uid())
    )
  );

-- Borrado de cuenta: samples de FC de fuerza (CASCADE también cubre, por claridad).
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

  DELETE FROM usuario_ejercicio WHERE usuario_id = p_user_id;
  DELETE FROM medidas WHERE usuario_id = p_user_id;

  DELETE FROM usuario_logro WHERE usuario_id = p_user_id;
  DELETE FROM seguimiento WHERE seguidor_id = p_user_id OR seguido_id = p_user_id;

  DELETE FROM perfil WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_data(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_data(uuid) TO service_role;