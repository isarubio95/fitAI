-- Registro de sesiones en una sola transacción.
--
-- Hoy el cliente crea una sesión en tres viajes sin transacción: inserta
-- `actividad`, luego `ejercicio`, luego `serie`. Si el tercero falla, queda una
-- sesión con ejercicios y sin series, que ya hubo que limpiar una vez a mano
-- (20260627140000_delete_strength_workouts_without_series.sql). Además
-- `handleCreate` empareja las filas insertadas con el payload por posición,
-- confiando en que PostgREST devuelva las filas en el mismo orden — justo lo que
-- `RoutineForm` documenta que no está garantizado.
--
-- Aquí ambas cosas desaparecen: una transacción, y `WITH ORDINALITY` para que el
-- orden venga del payload y no del motor.
--
-- SECURITY INVOKER: RLS sigue mandando y `usuario_id` sale de auth.uid().

-- ---------------------------------------------------------------------------
-- log_strength_session: registrar un entrenamiento de fuerza ya terminado.
-- ---------------------------------------------------------------------------
-- Payload:
--   {titulo, fecha, fecha_fin, comentarios, rpe, gimnasio_id, icono,
--    planned_routine_id, idempotency_key,
--    ejercicios: [{tipo_ejercicio_id | usuario_ejercicio_id, registro_series,
--                  descanso, rep_range, rir_objetivo, superset_id,
--                  series: [{repeticiones, peso_kg, duracion_seg, ritmo_seg_km,
--                            rir, descanso, tipo_serie, objetivo_*}]}]}
--
-- `idempotency_key` es obligatoria: es lo que hace que un reintento del cliente
-- MCP devuelva la sesión que ya existe en lugar de crear un duplicado.

CREATE OR REPLACE FUNCTION public.log_strength_session(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_key uuid;
  v_actividad_id uuid;
  v_existente uuid;
  v_ejercicios jsonb;
  v_ejercicio jsonb;
  v_series jsonb;
  v_e_id uuid;
  v_orden integer := 0;
  v_fecha timestamptz;
  v_fecha_fin timestamptz;
  v_total_series integer := 0;
  v_xp jsonb;
  v_planned uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No hay sesión' USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_key := nullif(p_payload->>'idempotency_key', '')::uuid;
  IF v_key IS NULL THEN
    RAISE EXCEPTION 'Falta idempotency_key' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- Reintento: se devuelve lo que ya hay, sin tocar nada.
  SELECT id INTO v_existente
  FROM public.actividad
  WHERE usuario_id = v_uid AND idempotency_key = v_key;

  IF v_existente IS NOT NULL THEN
    RETURN jsonb_build_object('workout_id', v_existente, 'idempotent', true);
  END IF;

  v_ejercicios := p_payload->'ejercicios';
  IF v_ejercicios IS NULL OR jsonb_typeof(v_ejercicios) <> 'array'
     OR jsonb_array_length(v_ejercicios) = 0 THEN
    RAISE EXCEPTION 'La sesión necesita al menos un ejercicio'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF jsonb_array_length(v_ejercicios) > 40 THEN
    RAISE EXCEPTION 'Como mucho 40 ejercicios por sesión'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  v_fecha := coalesce(nullif(p_payload->>'fecha', '')::timestamptz, now());
  v_fecha_fin := nullif(p_payload->>'fecha_fin', '')::timestamptz;

  -- Una sesión sin cierre sería una sesión "activa" creada a espaldas de la app,
  -- que compite con su estado local. El MCP solo registra entrenos terminados.
  IF v_fecha_fin IS NULL THEN
    v_fecha_fin := v_fecha + interval '1 hour';
  END IF;

  IF v_fecha_fin < v_fecha THEN
    RAISE EXCEPTION 'La hora de fin es anterior a la de inicio'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF v_fecha < now() - interval '2 years' OR v_fecha > now() + interval '1 day' THEN
    RAISE EXCEPTION 'La fecha está fuera del rango razonable (últimos 2 años)'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  INSERT INTO public.actividad (
    usuario_id, titulo, fecha, fecha_fin, comentarios, rpe, icono,
    gimnasio_id, es_publica, idempotency_key
  )
  VALUES (
    v_uid,
    coalesce(nullif(btrim(coalesce(p_payload->>'titulo', '')), ''), 'Entrenamiento'),
    v_fecha,
    v_fecha_fin,
    nullif(btrim(coalesce(p_payload->>'comentarios', '')), ''),
    nullif(p_payload->>'rpe', '')::integer,
    coalesce(nullif(p_payload->>'icono', ''), 'dumbbell'),
    nullif(p_payload->>'gimnasio_id', '')::uuid,
    -- Nunca pública: publicar en la comunidad no es algo que deba poder hacer
    -- un asistente. Se comparte desde la app, a mano.
    false,
    v_key
  )
  RETURNING id INTO v_actividad_id;

  FOR v_ejercicio IN SELECT * FROM jsonb_array_elements(v_ejercicios)
  LOOP
    IF num_nonnulls(
         nullif(v_ejercicio->>'tipo_ejercicio_id', ''),
         nullif(v_ejercicio->>'usuario_ejercicio_id', '')
       ) <> 1 THEN
      RAISE EXCEPTION 'El ejercicio en posición % debe traer tipo_ejercicio_id o usuario_ejercicio_id, no ambos ni ninguno', v_orden
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    v_series := v_ejercicio->'series';
    IF v_series IS NULL OR jsonb_typeof(v_series) <> 'array'
       OR jsonb_array_length(v_series) = 0 THEN
      RAISE EXCEPTION 'El ejercicio en posición % no tiene series', v_orden
        USING ERRCODE = 'invalid_parameter_value';
    END IF;
    IF jsonb_array_length(v_series) > 30 THEN
      RAISE EXCEPTION 'Como mucho 30 series por ejercicio'
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- El orden de ejecución se guarda como `created_at` escalonado: es lo que
    -- lee la app al reconstruir la sesión. Un milisegundo por posición basta y
    -- es determinista, a diferencia de depender del orden de inserción.
    INSERT INTO public.ejercicio (
      actividad_id, usuario_id, tipo_ejercicio_id, usuario_ejercicio_id,
      registro_series, rep_range, rir_objetivo, descanso, superset_id, created_at
    )
    VALUES (
      v_actividad_id, v_uid,
      nullif(v_ejercicio->>'tipo_ejercicio_id', '')::uuid,
      nullif(v_ejercicio->>'usuario_ejercicio_id', '')::uuid,
      coalesce(nullif(v_ejercicio->>'registro_series', ''), 'peso_reps'),
      nullif(v_ejercicio->>'rep_range', ''),
      nullif(v_ejercicio->>'rir_objetivo', '')::integer,
      nullif(v_ejercicio->>'descanso', '')::integer,
      nullif(v_ejercicio->>'superset_id', ''),
      now() + (v_orden * interval '1 millisecond')
    )
    RETURNING id INTO v_e_id;

    INSERT INTO public.serie (
      ejercicio_id, usuario_id, numero_serie, peso_kg, repeticiones,
      duracion_seg, ritmo_seg_km, rir, descanso, completed, tipo_serie,
      objetivo_repes_min, objetivo_repes_max, objetivo_rir, objetivo_peso_kg
    )
    SELECT
      v_e_id, v_uid, ord::integer,
      coalesce(nullif(linea->>'peso_kg', '')::numeric, 0),
      coalesce(nullif(linea->>'repeticiones', '')::integer, 0),
      nullif(linea->>'duracion_seg', '')::integer,
      nullif(linea->>'ritmo_seg_km', '')::integer,
      nullif(linea->>'rir', '')::integer,
      nullif(linea->>'descanso', '')::integer,
      true,
      coalesce(nullif(linea->>'tipo_serie', ''), 'efectiva'),
      nullif(linea->>'objetivo_repes_min', '')::integer,
      nullif(linea->>'objetivo_repes_max', '')::integer,
      nullif(linea->>'objetivo_rir', '')::integer,
      nullif(linea->>'objetivo_peso_kg', '')::numeric
    FROM jsonb_array_elements(v_series) WITH ORDINALITY AS t(linea, ord);

    v_total_series := v_total_series + jsonb_array_length(v_series);
    v_orden := v_orden + 1;
  END LOOP;

  -- Cerrar el hueco del calendario, si la sesión venía de uno programado.
  v_planned := nullif(p_payload->>'planned_routine_id', '')::uuid;
  IF v_planned IS NOT NULL THEN
    UPDATE public.rutina_programada
    SET actividad_id = v_actividad_id
    WHERE id = v_planned AND usuario_id = v_uid;
  END IF;

  v_xp := public.award_session_xp(p_actividad_id => v_actividad_id);

  RETURN jsonb_build_object(
    'workout_id', v_actividad_id,
    'exercises', v_orden,
    'sets', v_total_series,
    'xp', v_xp
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- replace_session_exercises: corregir el contenido de una sesión ya registrada.
-- ---------------------------------------------------------------------------
-- Reemplaza ejercicios y series enteros. Es más tosco que editar una serie
-- suelta, y ese es el punto: evita toda una familia de estados a medias (series
-- huérfanas, numeración con huecos) a cambio de que quien llame lea primero y
-- mande la lista completa corregida.

CREATE OR REPLACE FUNCTION public.replace_session_exercises(
  p_actividad_id uuid,
  p_ejercicios jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_ejercicio jsonb;
  v_series jsonb;
  v_e_id uuid;
  v_orden integer := 0;
  v_total_series integer := 0;
  v_xp jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No hay sesión' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.actividad WHERE id = p_actividad_id AND usuario_id = v_uid
  ) THEN
    RAISE EXCEPTION 'No existe esa sesión' USING ERRCODE = 'no_data_found';
  END IF;

  IF p_ejercicios IS NULL OR jsonb_typeof(p_ejercicios) <> 'array'
     OR jsonb_array_length(p_ejercicios) = 0 THEN
    RAISE EXCEPTION 'La sesión necesita al menos un ejercicio'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF jsonb_array_length(p_ejercicios) > 40 THEN
    RAISE EXCEPTION 'Como mucho 40 ejercicios por sesión'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- Las series caen por cascada (20260918100000).
  DELETE FROM public.ejercicio WHERE actividad_id = p_actividad_id;

  FOR v_ejercicio IN SELECT * FROM jsonb_array_elements(p_ejercicios)
  LOOP
    IF num_nonnulls(
         nullif(v_ejercicio->>'tipo_ejercicio_id', ''),
         nullif(v_ejercicio->>'usuario_ejercicio_id', '')
       ) <> 1 THEN
      RAISE EXCEPTION 'El ejercicio en posición % debe traer tipo_ejercicio_id o usuario_ejercicio_id, no ambos ni ninguno', v_orden
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    v_series := v_ejercicio->'series';
    IF v_series IS NULL OR jsonb_typeof(v_series) <> 'array'
       OR jsonb_array_length(v_series) = 0 THEN
      RAISE EXCEPTION 'El ejercicio en posición % no tiene series', v_orden
        USING ERRCODE = 'invalid_parameter_value';
    END IF;
    IF jsonb_array_length(v_series) > 30 THEN
      RAISE EXCEPTION 'Como mucho 30 series por ejercicio'
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    INSERT INTO public.ejercicio (
      actividad_id, usuario_id, tipo_ejercicio_id, usuario_ejercicio_id,
      registro_series, rep_range, rir_objetivo, descanso, superset_id, created_at
    )
    VALUES (
      p_actividad_id, v_uid,
      nullif(v_ejercicio->>'tipo_ejercicio_id', '')::uuid,
      nullif(v_ejercicio->>'usuario_ejercicio_id', '')::uuid,
      coalesce(nullif(v_ejercicio->>'registro_series', ''), 'peso_reps'),
      nullif(v_ejercicio->>'rep_range', ''),
      nullif(v_ejercicio->>'rir_objetivo', '')::integer,
      nullif(v_ejercicio->>'descanso', '')::integer,
      nullif(v_ejercicio->>'superset_id', ''),
      now() + (v_orden * interval '1 millisecond')
    )
    RETURNING id INTO v_e_id;

    INSERT INTO public.serie (
      ejercicio_id, usuario_id, numero_serie, peso_kg, repeticiones,
      duracion_seg, ritmo_seg_km, rir, descanso, completed, tipo_serie,
      objetivo_repes_min, objetivo_repes_max, objetivo_rir, objetivo_peso_kg
    )
    SELECT
      v_e_id, v_uid, ord::integer,
      coalesce(nullif(linea->>'peso_kg', '')::numeric, 0),
      coalesce(nullif(linea->>'repeticiones', '')::integer, 0),
      nullif(linea->>'duracion_seg', '')::integer,
      nullif(linea->>'ritmo_seg_km', '')::integer,
      nullif(linea->>'rir', '')::integer,
      nullif(linea->>'descanso', '')::integer,
      true,
      coalesce(nullif(linea->>'tipo_serie', ''), 'efectiva'),
      nullif(linea->>'objetivo_repes_min', '')::integer,
      nullif(linea->>'objetivo_repes_max', '')::integer,
      nullif(linea->>'objetivo_rir', '')::integer,
      nullif(linea->>'objetivo_peso_kg', '')::numeric
    FROM jsonb_array_elements(v_series) WITH ORDINALITY AS t(linea, ord);

    v_total_series := v_total_series + jsonb_array_length(v_series);
    v_orden := v_orden + 1;
  END LOOP;

  -- El volumen ha cambiado, así que la XP de la sesión también: se devuelve y
  -- se vuelve a conceder con las series nuevas.
  PERFORM public.revoke_session_xp(p_actividad_id => p_actividad_id);
  v_xp := public.award_session_xp(p_actividad_id => p_actividad_id);

  RETURN jsonb_build_object(
    'workout_id', p_actividad_id,
    'exercises', v_orden,
    'sets', v_total_series,
    'xp', v_xp
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- delete_session_cascade: borrar una sesión de fuerza o de cardio.
-- ---------------------------------------------------------------------------
-- Pide el título exacto como confirmación. No es burocracia: obliga a leer la
-- sesión antes de borrarla, que es precisamente el paso que un modelo se
-- saltaría si pudiera borrar solo con un id.

CREATE OR REPLACE FUNCTION public.delete_session_cascade(
  p_kind text,
  p_session_id uuid,
  p_confirm_title text
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_titulo text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No hay sesión' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF p_kind NOT IN ('strength', 'cardio') THEN
    RAISE EXCEPTION 'kind debe ser strength o cardio' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF p_kind = 'strength' THEN
    SELECT titulo INTO v_titulo FROM public.actividad
    WHERE id = p_session_id AND usuario_id = v_uid;
  ELSE
    SELECT titulo INTO v_titulo FROM public.cardio_sesion
    WHERE id = p_session_id AND usuario_id = v_uid;
  END IF;

  IF v_titulo IS NULL THEN
    RAISE EXCEPTION 'No existe esa sesión' USING ERRCODE = 'no_data_found';
  END IF;

  IF btrim(coalesce(p_confirm_title, '')) IS DISTINCT FROM btrim(v_titulo) THEN
    RAISE EXCEPTION 'El título de confirmación no coincide con «%»', v_titulo
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- Antes del DELETE: después, la cascada se lleva la fila del libro mayor y ya
  -- no se sabría cuánta XP devolver.
  IF p_kind = 'strength' THEN
    PERFORM public.revoke_session_xp(p_actividad_id => p_session_id);
    DELETE FROM public.actividad WHERE id = p_session_id;
  ELSE
    PERFORM public.revoke_session_xp(p_cardio_sesion_id => p_session_id);
    DELETE FROM public.cardio_sesion WHERE id = p_session_id;
  END IF;

  PERFORM public.recompute_profile_streak();

  RETURN jsonb_build_object('deleted', true, 'title', v_titulo);
END;
$$;

-- ---------------------------------------------------------------------------
-- log_cardio_session: registrar una sesión de cardio terminada.
-- ---------------------------------------------------------------------------
-- Sin track GPS: el MCP registra el resumen (bloques y métricas), no la
-- grabación en vivo, que es cosa de la app.

CREATE OR REPLACE FUNCTION public.log_cardio_session(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_key uuid;
  v_existente uuid;
  v_sesion_id uuid;
  v_disciplina_id uuid;
  v_codigo text;
  v_bloques jsonb;
  v_inicio timestamptz;
  v_fin timestamptz;
  v_xp jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No hay sesión' USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_key := nullif(p_payload->>'idempotency_key', '')::uuid;
  IF v_key IS NULL THEN
    RAISE EXCEPTION 'Falta idempotency_key' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  SELECT id INTO v_existente
  FROM public.cardio_sesion
  WHERE usuario_id = v_uid AND idempotency_key = v_key;

  IF v_existente IS NOT NULL THEN
    RETURN jsonb_build_object('session_id', v_existente, 'idempotent', true);
  END IF;

  v_codigo := nullif(btrim(coalesce(p_payload->>'discipline_code', '')), '');
  IF v_codigo IS NULL THEN
    RAISE EXCEPTION 'Falta discipline_code' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  SELECT id INTO v_disciplina_id FROM public.cardio_disciplina
  WHERE lower(codigo) = lower(v_codigo) AND activo IS TRUE;

  IF v_disciplina_id IS NULL THEN
    RAISE EXCEPTION 'No existe la disciplina «%»', v_codigo USING ERRCODE = 'no_data_found';
  END IF;

  v_bloques := p_payload->'bloques';
  IF v_bloques IS NULL OR jsonb_typeof(v_bloques) <> 'array'
     OR jsonb_array_length(v_bloques) = 0 THEN
    RAISE EXCEPTION 'La sesión necesita al menos un bloque'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF jsonb_array_length(v_bloques) > 50 THEN
    RAISE EXCEPTION 'Como mucho 50 bloques por sesión'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  v_inicio := coalesce(nullif(p_payload->>'fecha_inicio', '')::timestamptz, now());
  v_fin := nullif(p_payload->>'fecha_fin', '')::timestamptz;

  IF v_fin IS NULL THEN
    -- Sin hora de fin se deduce de la duración de los bloques.
    SELECT v_inicio + make_interval(secs => coalesce(sum((b->>'duracion_seg')::integer), 0))
    INTO v_fin
    FROM jsonb_array_elements(v_bloques) b;
  END IF;

  IF v_fin < v_inicio THEN
    RAISE EXCEPTION 'La hora de fin es anterior a la de inicio'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF v_inicio < now() - interval '2 years' OR v_inicio > now() + interval '1 day' THEN
    RAISE EXCEPTION 'La fecha está fuera del rango razonable (últimos 2 años)'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  INSERT INTO public.cardio_sesion (
    usuario_id, cardio_disciplina_id, titulo, fecha_inicio, fecha_fin,
    comentarios, rpe, es_publica, idempotency_key
  )
  VALUES (
    v_uid, v_disciplina_id,
    coalesce(nullif(btrim(coalesce(p_payload->>'titulo', '')), ''), initcap(v_codigo)),
    v_inicio, v_fin,
    nullif(btrim(coalesce(p_payload->>'comentarios', '')), ''),
    nullif(p_payload->>'rpe', '')::integer,
    false,
    v_key
  )
  RETURNING id INTO v_sesion_id;

  INSERT INTO public.cardio_bloque (
    cardio_sesion_id, orden, tipo_bloque, distancia_m, duracion_seg,
    elevacion_m, fc_media, fc_max, calorias
  )
  SELECT
    v_sesion_id,
    (ord - 1)::integer,
    coalesce(nullif(b->>'tipo_bloque', ''), 'work'),
    nullif(b->>'distancia_m', '')::integer,
    nullif(b->>'duracion_seg', '')::integer,
    nullif(b->>'elevacion_m', '')::integer,
    nullif(b->>'fc_media', '')::integer,
    nullif(b->>'fc_max', '')::integer,
    nullif(b->>'calorias', '')::integer
  FROM jsonb_array_elements(v_bloques) WITH ORDINALITY AS t(b, ord);

  IF p_payload ? 'running' THEN
    INSERT INTO public.cardio_sesion_running (
      cardio_sesion_id, ritmo_medio_seg_km, cadencia_media_spm,
      zancada_media_cm, desnivel_positivo_m
    )
    VALUES (
      v_sesion_id,
      nullif(p_payload->'running'->>'ritmo_medio_seg_km', '')::integer,
      nullif(p_payload->'running'->>'cadencia_media_spm', '')::integer,
      nullif(p_payload->'running'->>'zancada_media_cm', '')::integer,
      nullif(p_payload->'running'->>'desnivel_positivo_m', '')::integer
    );
  END IF;

  IF p_payload ? 'cycling' THEN
    INSERT INTO public.cardio_sesion_cycling (
      cardio_sesion_id, potencia_media_w, potencia_normalizada_w,
      cadencia_media_rpm, desnivel_positivo_m, tipo_bici
    )
    VALUES (
      v_sesion_id,
      nullif(p_payload->'cycling'->>'potencia_media_w', '')::integer,
      nullif(p_payload->'cycling'->>'potencia_normalizada_w', '')::integer,
      nullif(p_payload->'cycling'->>'cadencia_media_rpm', '')::integer,
      nullif(p_payload->'cycling'->>'desnivel_positivo_m', '')::integer,
      nullif(p_payload->'cycling'->>'tipo_bici', '')
    );
  END IF;

  v_xp := public.award_session_xp(p_cardio_sesion_id => v_sesion_id);

  RETURN jsonb_build_object(
    'session_id', v_sesion_id,
    'blocks', jsonb_array_length(v_bloques),
    'xp', v_xp
  );
END;
$$;

REVOKE ALL ON FUNCTION public.log_strength_session(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_strength_session(jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.replace_session_exercises(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_session_exercises(uuid, jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.delete_session_cascade(text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_session_cascade(text, uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.log_cardio_session(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_cardio_session(jsonb) TO authenticated;
