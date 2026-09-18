-- Arregla el INSERT de `superset_id` en los RPC de escritura.
--
-- `v_ejercicio->>'superset_id'` es de tipo text y la columna es uuid. Postgres
-- admite el cast de asignación *hacia* tipos string, pero no *desde* text hacia
-- otro tipo, así que el INSERT se rechazaba al planificarse con
-- «column "superset_id" is of type uuid but expression is of type text» (42804).
--
-- Al ser un error de plan y no de valor, fallaba en TODAS las llamadas, aunque no
-- se mandara ninguna superserie: create_routine y log_workout estaban rotos por
-- completo desde el MCP. El resto de campos del mismo INSERT ya llevaban su cast
-- explícito (::uuid, ::integer, ::numeric); a este se le había olvidado.
--
-- Las funciones se redeclaran enteras porque PL/pgSQL no permite parchear una
-- línea. Lo único que cambia respecto a 20260918102000 y 20260918104000 es el
-- `::uuid` de esa expresión. CREATE OR REPLACE conserva permisos y propietario;
-- los GRANT se repiten por si la migración se reprodujera desde cero.


CREATE OR REPLACE FUNCTION public.upsert_routine(
  p_rutina_id uuid DEFAULT NULL,
  p_nombre text DEFAULT NULL,
  p_descripcion text DEFAULT NULL,
  p_icono text DEFAULT NULL,
  p_ejercicios jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_rutina_id uuid;
  v_ejercicio jsonb;
  v_orden integer;
  v_re_id uuid;
  v_resumen jsonb;
  v_plan jsonb;
  v_insertados integer := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No hay sesión' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF p_nombre IS NULL OR btrim(p_nombre) = '' THEN
    RAISE EXCEPTION 'La rutina necesita un nombre' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF p_ejercicios IS NOT NULL AND jsonb_array_length(p_ejercicios) > 40 THEN
    RAISE EXCEPTION 'Una rutina admite como mucho 40 ejercicios'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF p_rutina_id IS NULL THEN
    INSERT INTO public.rutina (usuario_id, nombre, descripcion, icono, es_plantilla)
    VALUES (v_uid, btrim(p_nombre), nullif(btrim(coalesce(p_descripcion, '')), ''),
            coalesce(nullif(btrim(coalesce(p_icono, '')), ''), 'dumbbell'), false)
    RETURNING id INTO v_rutina_id;
  ELSE
    -- Las plantillas del catálogo son compartidas: editarlas afectaría a todo el
    -- mundo. RLS ya lo impide, pero un mensaje claro ahorra el 403 opaco.
    IF EXISTS (
      SELECT 1 FROM public.rutina
      WHERE id = p_rutina_id AND (es_plantilla IS TRUE OR usuario_id IS NULL)
    ) THEN
      RAISE EXCEPTION 'Las rutinas predefinidas no se pueden editar; duplícala primero'
        USING ERRCODE = 'insufficient_privilege';
    END IF;

    UPDATE public.rutina
    SET nombre = btrim(p_nombre),
        descripcion = coalesce(nullif(btrim(coalesce(p_descripcion, '')), ''), descripcion),
        icono = coalesce(nullif(btrim(coalesce(p_icono, '')), ''), icono)
    WHERE id = p_rutina_id
    RETURNING id INTO v_rutina_id;

    IF v_rutina_id IS NULL THEN
      RAISE EXCEPTION 'No existe esa rutina' USING ERRCODE = 'no_data_found';
    END IF;
  END IF;

  IF p_ejercicios IS NULL THEN
    RETURN jsonb_build_object('routine_id', v_rutina_id, 'exercises_written', NULL);
  END IF;

  -- Reemplazo completo. `rutina_ejercicio_serie` cae por su cascada propia.
  DELETE FROM public.rutina_ejercicio WHERE rutina_id = v_rutina_id;

  v_orden := 0;
  FOR v_ejercicio IN SELECT * FROM jsonb_array_elements(p_ejercicios)
  LOOP
    IF num_nonnulls(
         nullif(v_ejercicio->>'tipo_ejercicio_id', ''),
         nullif(v_ejercicio->>'usuario_ejercicio_id', '')
       ) <> 1 THEN
      RAISE EXCEPTION 'El ejercicio en posición % debe traer tipo_ejercicio_id o usuario_ejercicio_id, no ambos ni ninguno', v_orden
        USING ERRCODE = 'invalid_parameter_value';
    END IF;

    v_plan := v_ejercicio->'set_plan';
    IF v_plan IS NOT NULL AND jsonb_typeof(v_plan) = 'array' AND jsonb_array_length(v_plan) > 0 THEN
      IF jsonb_array_length(v_plan) > 30 THEN
        RAISE EXCEPTION 'Un ejercicio admite como mucho 30 series'
          USING ERRCODE = 'invalid_parameter_value';
      END IF;
      v_resumen := public.summarize_series_plan(v_plan, v_ejercicio);
    ELSE
      v_plan := NULL;
      v_resumen := v_ejercicio;
    END IF;

    INSERT INTO public.rutina_ejercicio (
      rutina_id, tipo_ejercicio_id, usuario_ejercicio_id, orden,
      series_objetivo, repes_min, repes_max, rir, descanso,
      registro_series, superset_id, duracion_objetivo_seg, ritmo_objetivo_seg_km
    )
    VALUES (
      v_rutina_id,
      nullif(v_ejercicio->>'tipo_ejercicio_id', '')::uuid,
      nullif(v_ejercicio->>'usuario_ejercicio_id', '')::uuid,
      v_orden,
      coalesce(nullif(v_resumen->>'series_objetivo', '')::integer, 3),
      coalesce(nullif(v_resumen->>'repes_min', '')::integer, 8),
      coalesce(nullif(v_resumen->>'repes_max', '')::integer, 12),
      nullif(v_resumen->>'rir', '')::integer,
      nullif(v_resumen->>'descanso', '')::integer,
      coalesce(nullif(v_ejercicio->>'registro_series', ''), 'peso_reps'),
      nullif(v_ejercicio->>'superset_id', '')::uuid,
      nullif(v_resumen->>'duracion_objetivo_seg', '')::integer,
      nullif(v_resumen->>'ritmo_objetivo_seg_km', '')::integer
    )
    RETURNING id INTO v_re_id;

    IF v_plan IS NOT NULL THEN
      INSERT INTO public.rutina_ejercicio_serie (
        rutina_ejercicio_id, orden, tipo_serie, repes_min, repes_max, rir,
        peso_objetivo_kg, descanso, duracion_objetivo_seg, ritmo_objetivo_seg_km
      )
      SELECT
        v_re_id,
        (ord - 1)::integer,
        coalesce(nullif(linea->>'tipo_serie', ''), 'efectiva'),
        nullif(linea->>'repes_min', '')::integer,
        nullif(linea->>'repes_max', '')::integer,
        nullif(linea->>'rir', '')::integer,
        nullif(linea->>'peso_objetivo_kg', '')::numeric,
        nullif(linea->>'descanso', '')::integer,
        nullif(linea->>'duracion_objetivo_seg', '')::integer,
        nullif(linea->>'ritmo_objetivo_seg_km', '')::integer
      FROM jsonb_array_elements(v_plan) WITH ORDINALITY AS t(linea, ord);
    END IF;

    v_orden := v_orden + 1;
    v_insertados := v_insertados + 1;
  END LOOP;

  RETURN jsonb_build_object('routine_id', v_rutina_id, 'exercises_written', v_insertados);
END;
$$;

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
      nullif(v_ejercicio->>'superset_id', '')::uuid,
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
      nullif(v_ejercicio->>'superset_id', '')::uuid,
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

REVOKE ALL ON FUNCTION public.upsert_routine(uuid, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_routine(uuid, text, text, text, jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.log_strength_session(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_strength_session(jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.replace_session_exercises(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.replace_session_exercises(uuid, jsonb) TO authenticated;
