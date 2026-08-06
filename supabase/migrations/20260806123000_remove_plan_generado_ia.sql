-- Elimina generación de rutinas con IA: tabla y referencias en borrado de cuenta.
DROP TABLE IF EXISTS public.plan_generado_ia CASCADE;

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
