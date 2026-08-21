-- Registro diario de salud (calorías ingeridas, sueño, FC en reposo).
-- Una fila por usuario y día. El peso/circunferencias siguen en medidas.

CREATE TABLE IF NOT EXISTS public.salud_diaria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.perfil (id) ON DELETE CASCADE,
  fecha date NOT NULL,
  calorias integer,
  sueno_min integer,
  calidad_sueno smallint,
  fc_reposo integer,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT salud_diaria_usuario_fecha_key UNIQUE (usuario_id, fecha),
  CONSTRAINT salud_diaria_calorias_check CHECK (calorias IS NULL OR calorias >= 0),
  CONSTRAINT salud_diaria_sueno_min_check CHECK (
    sueno_min IS NULL OR (sueno_min >= 0 AND sueno_min <= 1440)
  ),
  CONSTRAINT salud_diaria_calidad_sueno_check CHECK (
    calidad_sueno IS NULL OR (calidad_sueno >= 1 AND calidad_sueno <= 5)
  ),
  CONSTRAINT salud_diaria_fc_reposo_check CHECK (
    fc_reposo IS NULL OR (fc_reposo >= 30 AND fc_reposo <= 120)
  )
);

CREATE INDEX IF NOT EXISTS salud_diaria_usuario_fecha_idx
  ON public.salud_diaria (usuario_id, fecha DESC);

ALTER TABLE public.salud_diaria ENABLE ROW LEVEL SECURITY;

CREATE POLICY salud_diaria_select_owner
  ON public.salud_diaria FOR SELECT TO authenticated
  USING (usuario_id = (select auth.uid()));

CREATE POLICY salud_diaria_insert_owner
  ON public.salud_diaria FOR INSERT TO authenticated
  WITH CHECK (usuario_id = (select auth.uid()));

CREATE POLICY salud_diaria_update_owner
  ON public.salud_diaria FOR UPDATE TO authenticated
  USING (usuario_id = (select auth.uid()))
  WITH CHECK (usuario_id = (select auth.uid()));

CREATE POLICY salud_diaria_delete_owner
  ON public.salud_diaria FOR DELETE TO authenticated
  USING (usuario_id = (select auth.uid()));

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
  DELETE FROM salud_diaria WHERE usuario_id = p_user_id;
  DELETE FROM medidas WHERE usuario_id = p_user_id;

  DELETE FROM usuario_logro WHERE usuario_id = p_user_id;
  DELETE FROM seguimiento WHERE seguidor_id = p_user_id OR seguido_id = p_user_id;

  DELETE FROM perfil WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_data(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_user_data(uuid) TO service_role;
