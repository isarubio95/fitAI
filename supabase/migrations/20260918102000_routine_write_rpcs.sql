-- Escrituras compuestas de rutinas y calendario, en una transacción.
--
-- Por qué RPC y no inserts sueltos desde el servidor MCP: `RoutineForm.handleSave`
-- hace hoy un delete + insert en varios viajes y luego mapea las series hijas
-- por `orden`, precisamente porque —lo dice su propio comentario— el orden de
-- las filas que devuelve PostgREST no está garantizado. Reimplementar eso en
-- Deno sería una tercera copia de la misma lógica delicada. Aquí es una función
-- sola, atómica, que el cliente podrá adoptar después sin cambiar de semántica.
--
-- SECURITY INVOKER en todas: RLS sigue siendo el control de acceso. El
-- `usuario_id` se toma siempre de auth.uid() y nunca del payload, así que un
-- modelo no puede escribir en la cuenta de otra persona ni pidiéndolo.

-- ---------------------------------------------------------------------------
-- summarize_series_plan: resumen denormalizado de un plan por series.
-- ---------------------------------------------------------------------------
-- Puerto exacto de `summarizeSeriesPlan` (src/lib/seriesPlan.ts). Los escalares
-- de `rutina_ejercicio` son un resumen del plan hijo, y si se desincronizan, las
-- tarjetas de rutina y la estimación de duración mienten.
--
-- Tres detalles del original que es fácil perder al portarlo y que aquí se
-- respetan:
--   · el RIR resumen es el MÍNIMO (la serie más exigente define el carácter);
--   · el descanso promedia sobre TODAS las series, calentamientos incluidos,
--     mientras que el resto de campos solo miran las efectivas;
--   · si ninguna serie tiene techo de repeticiones, `repes_max` cae al mínimo
--     en vez de inventarse un tope.
--
-- El plan llega como jsonb: `[{tipo_serie, repes_min, repes_max, rir, descanso,
-- duracion_objetivo_seg, ritmo_objetivo_seg_km}, …]`.

CREATE OR REPLACE FUNCTION public.summarize_series_plan(
  p_plan jsonb,
  p_fallback jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_total integer;
  v_efectivas jsonb;
  v_relevantes jsonb;
  v_repes_min integer;
  v_repes_max integer;
  /**
   * Si el PLAN traía mínimos, distinto de si `v_repes_min` acabó con valor: al
   * caer al fallback, `v_repes_min` deja de ser NULL y la rama de abajo elegiría
   * mal. El original decide sobre `mins.length`, no sobre el valor resuelto.
   */
  v_tenia_mins boolean;
  v_rir integer;
  v_descanso integer;
  v_duracion integer;
  v_ritmo integer;
BEGIN
  IF p_plan IS NULL OR jsonb_typeof(p_plan) <> 'array' OR jsonb_array_length(p_plan) = 0 THEN
    RETURN coalesce(p_fallback, '{}'::jsonb);
  END IF;

  v_total := jsonb_array_length(p_plan);

  SELECT coalesce(jsonb_agg(s), '[]'::jsonb) INTO v_efectivas
  FROM jsonb_array_elements(p_plan) s
  WHERE coalesce(s->>'tipo_serie', 'efectiva') <> 'calentamiento';

  -- Si el plan es todo calentamiento, se resume sobre el plan entero: es lo que
  -- hace el original y evita devolver un resumen vacío.
  v_relevantes := CASE WHEN jsonb_array_length(v_efectivas) > 0 THEN v_efectivas ELSE p_plan END;

  SELECT min((s->>'repes_min')::integer), count(*) > 0
  INTO v_repes_min, v_tenia_mins
  FROM jsonb_array_elements(v_relevantes) s
  WHERE (s->>'repes_min') IS NOT NULL AND (s->>'repes_min')::integer > 0;

  SELECT max((s->>'repes_max')::integer) INTO v_repes_max
  FROM jsonb_array_elements(v_relevantes) s
  WHERE (s->>'repes_max') IS NOT NULL AND (s->>'repes_max')::integer > 0;

  SELECT min((s->>'rir')::integer) INTO v_rir
  FROM jsonb_array_elements(v_relevantes) s
  WHERE (s->>'rir') IS NOT NULL;

  -- Descanso: sobre el plan completo, no solo las efectivas.
  SELECT round(avg((s->>'descanso')::integer))::integer INTO v_descanso
  FROM jsonb_array_elements(p_plan) s
  WHERE (s->>'descanso') IS NOT NULL AND (s->>'descanso')::integer >= 0;

  SELECT round(avg((s->>'duracion_objetivo_seg')::integer))::integer INTO v_duracion
  FROM jsonb_array_elements(v_relevantes) s
  WHERE (s->>'duracion_objetivo_seg') IS NOT NULL AND (s->>'duracion_objetivo_seg')::integer > 0;

  SELECT round(avg((s->>'ritmo_objetivo_seg_km')::integer))::integer INTO v_ritmo
  FROM jsonb_array_elements(v_relevantes) s
  WHERE (s->>'ritmo_objetivo_seg_km') IS NOT NULL AND (s->>'ritmo_objetivo_seg_km')::integer > 0;

  IF v_repes_min IS NULL THEN
    v_repes_min := nullif(p_fallback->>'repes_min', '')::integer;
  END IF;

  IF v_repes_max IS NOT NULL THEN
    v_repes_max := GREATEST(v_repes_max, coalesce(v_repes_min, v_repes_max));
  ELSIF v_tenia_mins THEN
    -- Rango abierto ("8+"): sin techo, el resumen se queda en el mínimo.
    v_repes_max := v_repes_min;
  ELSE
    -- El plan no habla de repeticiones (ejercicio por duración): manda el fallback.
    v_repes_max := nullif(p_fallback->>'repes_max', '')::integer;
  END IF;

  RETURN jsonb_strip_nulls(jsonb_build_object(
    'series_objetivo', v_total,
    'repes_min', v_repes_min,
    'repes_max', v_repes_max,
    'rir', coalesce(v_rir, nullif(p_fallback->>'rir', '')::integer),
    'descanso', coalesce(v_descanso, nullif(p_fallback->>'descanso', '')::integer),
    'duracion_objetivo_seg',
      coalesce(v_duracion, nullif(p_fallback->>'duracion_objetivo_seg', '')::integer),
    'ritmo_objetivo_seg_km',
      coalesce(v_ritmo, nullif(p_fallback->>'ritmo_objetivo_seg_km', '')::integer)
  ));
END;
$$;

COMMENT ON FUNCTION public.summarize_series_plan(jsonb, jsonb) IS
  'Puerto SQL de summarizeSeriesPlan (src/lib/seriesPlan.ts). Mantener ambas en paridad: hay test que lo comprueba.';

-- ---------------------------------------------------------------------------
-- upsert_routine: crear o reemplazar una rutina completa.
-- ---------------------------------------------------------------------------
-- La lista de ejercicios REEMPLAZA a la anterior, igual que hace el formulario
-- de la app. Pasar `p_ejercicios = NULL` renombra sin tocarlos.
--
-- Cada elemento de `p_ejercicios`:
--   {tipo_ejercicio_id | usuario_ejercicio_id, series_objetivo, repes_min,
--    repes_max, rir, descanso, registro_series, superset_id,
--    duracion_objetivo_seg, ritmo_objetivo_seg_km, set_plan: [...]}

-- Todos los parámetros con DEFAULT a propósito: así quien llama omite lo que no
-- aplica en vez de mandar NULL explícito. Sin `p_rutina_id` se crea una rutina
-- nueva; sin `p_ejercicios` no se tocan los que ya tiene. El nombre se valida
-- dentro, que es donde se puede dar un error entendible.
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
      nullif(v_ejercicio->>'superset_id', ''),
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

-- ---------------------------------------------------------------------------
-- delete_routine_cascade
-- ---------------------------------------------------------------------------
-- El nombre exacto hace de confirmación: obliga a leer la rutina antes de
-- borrarla, que es justo lo que no queremos que un modelo se salte. Las sesiones
-- ya entrenadas a partir de ella no se tocan.

CREATE OR REPLACE FUNCTION public.delete_routine_cascade(
  p_rutina_id uuid,
  p_confirm_name text
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_nombre text;
  v_es_plantilla boolean;
BEGIN
  SELECT nombre, coalesce(es_plantilla, false) INTO v_nombre, v_es_plantilla
  FROM public.rutina WHERE id = p_rutina_id;

  IF v_nombre IS NULL THEN
    RAISE EXCEPTION 'No existe esa rutina' USING ERRCODE = 'no_data_found';
  END IF;

  IF v_es_plantilla THEN
    RAISE EXCEPTION 'Las rutinas predefinidas no se pueden borrar'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF btrim(coalesce(p_confirm_name, '')) IS DISTINCT FROM btrim(v_nombre) THEN
    RAISE EXCEPTION 'El nombre de confirmación no coincide con «%»', v_nombre
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  DELETE FROM public.rutina WHERE id = p_rutina_id;

  RETURN jsonb_build_object('deleted', true, 'name', v_nombre);
END;
$$;

-- ---------------------------------------------------------------------------
-- schedule_routine_dates: programar una rutina en varias fechas.
-- ---------------------------------------------------------------------------
-- Idempotente gracias al índice único de 20260918100000: repetir la llamada no
-- duplica huecos, solo informa de cuántos ya existían. Que se pueda reintentar
-- sin miedo importa especialmente aquí, donde quien llama puede ser un agente
-- que reintenta por su cuenta.

CREATE OR REPLACE FUNCTION public.schedule_routine_dates(
  p_rutina_id uuid,
  p_fechas date[]
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_insertados integer;
  v_pedidas integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No hay sesión' USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_pedidas := coalesce(array_length(p_fechas, 1), 0);
  IF v_pedidas = 0 THEN
    RAISE EXCEPTION 'Hay que indicar al menos una fecha' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF v_pedidas > 60 THEN
    RAISE EXCEPTION 'Como mucho 60 fechas por llamada' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.rutina WHERE id = p_rutina_id) THEN
    RAISE EXCEPTION 'No existe esa rutina' USING ERRCODE = 'no_data_found';
  END IF;

  WITH nuevas AS (
    INSERT INTO public.rutina_programada (usuario_id, rutina_id, fecha_programada)
    SELECT v_uid, p_rutina_id, fecha
    FROM unnest(p_fechas) AS fecha
    ON CONFLICT (usuario_id, rutina_id, fecha_programada) DO NOTHING
    RETURNING id
  )
  SELECT count(*)::integer INTO v_insertados FROM nuevas;

  RETURN jsonb_build_object(
    'scheduled', v_insertados,
    'already_scheduled', v_pedidas - v_insertados
  );
END;
$$;

REVOKE ALL ON FUNCTION public.summarize_series_plan(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.summarize_series_plan(jsonb, jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.upsert_routine(uuid, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_routine(uuid, text, text, text, jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.delete_routine_cascade(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_routine_cascade(uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.schedule_routine_dates(uuid, date[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.schedule_routine_dates(uuid, date[]) TO authenticated;
