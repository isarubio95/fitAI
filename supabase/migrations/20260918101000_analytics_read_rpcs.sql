-- Agregados para el servidor MCP: resumen de entrenamiento y récords.
--
-- Estas dos cuentas hoy se hacen en el cliente (`useMuscleVolume` y compañía
-- traen las filas crudas y agregan en JS). Eso vale para pintar una gráfica,
-- pero devolverle a un modelo todas las series de seis meses para que sume
-- gasta el contexto entero en aritmética. Se agrega en SQL y viaja el resultado.
--
-- SECURITY INVOKER a propósito, igual que el resto de RPCs del proyecto
-- (20260812143000_exercise_progress_rpcs.sql): las políticas RLS siguen siendo
-- el filtro, así que estas funciones no pueden devolver datos de otro usuario ni
-- aunque se las llame con parámetros inventados.
--
-- Criterios compartidos con la app, no reinventados aquí:
--   · solo series efectivas: `tipo_serie IS DISTINCT FROM 'calentamiento'`
--     (mismo `IS DISTINCT FROM` que 20260909130000, para que un NULL cuente como
--     efectiva igual que hace `normalizeTipoSerie` en cliente);
--   · solo sesiones cerradas: `fecha_fin IS NOT NULL`;
--   · días y semanas en UTC, como `get_exercise_set_history`;
--   · 1RM por Epley `peso * (1 + 0.0333 * reps)`, la misma de
--     `get_exercise_daily_best`.

-- ---------------------------------------------------------------------------
-- get_training_summary: cuánto se ha entrenado en un rango.
-- ---------------------------------------------------------------------------
-- `p_group_by`:
--   'total'  → una fila con todo el rango.
--   'week'   → una fila por semana natural (`date_trunc('week')` empieza en
--              lunes, igual que `weekStartKeyFromDayStr` en streakWeeks.ts).
--   'muscle' → una fila por grupo muscular. Aquí no hay columnas de tiempo ni
--              de cardio: repartir la duración de una sesión entre los músculos
--              que tocó sería inventarse un dato.
--
-- Aviso honesto sobre 'muscle': agrupa por el `grupo_muscular` declarado en el
-- catálogo, mientras que la pantalla de Evolución reparte el volumen entre los
-- músculos implicados con `resolveMainMuscleGroup` (src/lib/muscleMapping.ts).
-- Los totales por músculo pueden no cuadrar al dígito con esa pantalla; la
-- descripción de la herramienta MCP lo dice para que el modelo no lo presente
-- como si fuera la misma cifra.

CREATE OR REPLACE FUNCTION public.get_training_summary(
  p_from date,
  p_to date,
  p_group_by text DEFAULT 'total'
)
RETURNS TABLE (
  bucket text,
  sessions bigint,
  working_sets bigint,
  tonnage_kg numeric,
  reps bigint,
  training_seconds bigint,
  avg_rpe numeric,
  cardio_sessions bigint,
  cardio_seconds bigint,
  cardio_distance_m bigint
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_modo text := lower(coalesce(p_group_by, 'total'));
  v_uid uuid := (SELECT auth.uid());
BEGIN
  IF v_modo NOT IN ('total', 'week', 'muscle') THEN
    v_modo := 'total';
  END IF;

  IF p_from IS NULL OR p_to IS NULL OR p_to < p_from THEN
    RAISE EXCEPTION 'Rango de fechas inválido: % .. %', p_from, p_to
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF v_modo = 'muscle' THEN
    RETURN QUERY
    SELECT
      coalesce(te.grupo_muscular, ue.grupo_muscular, 'sin_grupo')::text AS bucket,
      count(DISTINCT a.id) AS sessions,
      count(s.id) AS working_sets,
      coalesce(sum(s.peso_kg * s.repeticiones), 0)::numeric AS tonnage_kg,
      coalesce(sum(s.repeticiones), 0)::bigint AS reps,
      NULL::bigint AS training_seconds,
      NULL::numeric AS avg_rpe,
      NULL::bigint AS cardio_sessions,
      NULL::bigint AS cardio_seconds,
      NULL::bigint AS cardio_distance_m
    FROM public.serie s
    INNER JOIN public.ejercicio e ON e.id = s.ejercicio_id
    INNER JOIN public.actividad a
      ON a.id = e.actividad_id
     AND a.fecha_fin IS NOT NULL
     AND (timezone('utc', a.fecha))::date BETWEEN p_from AND p_to
    LEFT JOIN public.tipo_ejercicio te ON te.id = e.tipo_ejercicio_id
    LEFT JOIN public.usuario_ejercicio ue ON ue.id = e.usuario_ejercicio_id
    WHERE s.usuario_id = v_uid
      AND s.tipo_serie IS DISTINCT FROM 'calentamiento'
    GROUP BY 1
    ORDER BY tonnage_kg DESC, bucket;
    RETURN;
  END IF;

  RETURN QUERY
  WITH sesiones AS (
    SELECT
      a.id,
      CASE
        WHEN v_modo = 'week'
          THEN to_char(date_trunc('week', timezone('utc', a.fecha)), 'YYYY-MM-DD')
        ELSE 'total'
      END AS bucket,
      a.rpe,
      GREATEST(EXTRACT(EPOCH FROM (a.fecha_fin - a.fecha)), 0)::bigint AS segundos
    FROM public.actividad a
    WHERE a.usuario_id = v_uid
      AND a.fecha_fin IS NOT NULL
      AND (timezone('utc', a.fecha))::date BETWEEN p_from AND p_to
  ),
  series AS (
    SELECT
      ses.bucket,
      count(s.id) AS working_sets,
      coalesce(sum(s.peso_kg * s.repeticiones), 0)::numeric AS tonnage_kg,
      coalesce(sum(s.repeticiones), 0)::bigint AS reps
    FROM public.serie s
    INNER JOIN public.ejercicio e ON e.id = s.ejercicio_id
    INNER JOIN sesiones ses ON ses.id = e.actividad_id
    WHERE s.usuario_id = v_uid
      AND s.tipo_serie IS DISTINCT FROM 'calentamiento'
    GROUP BY ses.bucket
  ),
  fuerza AS (
    SELECT
      ses.bucket,
      count(*)::bigint AS sessions,
      sum(ses.segundos)::bigint AS training_seconds,
      round(avg(ses.rpe)::numeric, 1) AS avg_rpe
    FROM sesiones ses
    GROUP BY ses.bucket
  ),
  cardio AS (
    SELECT
      CASE
        WHEN v_modo = 'week'
          THEN to_char(date_trunc('week', timezone('utc', cs.fecha_inicio)), 'YYYY-MM-DD')
        ELSE 'total'
      END AS bucket,
      count(*)::bigint AS cardio_sessions,
      -- La duración fiable es la suma de bloques; si la sesión no tiene bloques
      -- con duración, se cae a la diferencia de marcas de tiempo.
      coalesce(
        sum(coalesce(bl.duracion_seg, GREATEST(EXTRACT(EPOCH FROM (cs.fecha_fin - cs.fecha_inicio)), 0))),
        0
      )::bigint AS cardio_seconds,
      coalesce(sum(bl.distancia_m), 0)::bigint AS cardio_distance_m
    FROM public.cardio_sesion cs
    LEFT JOIN LATERAL (
      SELECT
        sum(cb.duracion_seg) AS duracion_seg,
        sum(cb.distancia_m) AS distancia_m
      FROM public.cardio_bloque cb
      WHERE cb.cardio_sesion_id = cs.id
    ) bl ON true
    WHERE cs.usuario_id = v_uid
      AND cs.fecha_fin IS NOT NULL
      AND (timezone('utc', cs.fecha_inicio))::date BETWEEN p_from AND p_to
    GROUP BY 1
  )
  SELECT
    coalesce(f.bucket, c.bucket)::text AS bucket,
    coalesce(f.sessions, 0) AS sessions,
    coalesce(se.working_sets, 0) AS working_sets,
    coalesce(se.tonnage_kg, 0)::numeric AS tonnage_kg,
    coalesce(se.reps, 0) AS reps,
    coalesce(f.training_seconds, 0) AS training_seconds,
    f.avg_rpe,
    coalesce(c.cardio_sessions, 0) AS cardio_sessions,
    coalesce(c.cardio_seconds, 0) AS cardio_seconds,
    coalesce(c.cardio_distance_m, 0) AS cardio_distance_m
  FROM fuerza f
  FULL OUTER JOIN cardio c ON c.bucket = f.bucket
  LEFT JOIN series se ON se.bucket = coalesce(f.bucket, c.bucket)
  ORDER BY 1;
END;
$$;

COMMENT ON FUNCTION public.get_training_summary(date, date, text) IS
  'Resumen agregado de entrenamiento para el servidor MCP. Solo series efectivas y sesiones cerradas; días y semanas en UTC.';

-- ---------------------------------------------------------------------------
-- get_personal_records: mejor levantamiento por ejercicio.
-- ---------------------------------------------------------------------------
-- Un récord es la serie con mayor 1RM estimado, no el mayor peso suelto: 100x1
-- y 85x8 no se ordenan bien por peso. Se devuelve además la serie real que lo
-- produjo (peso y repeticiones) para que el modelo pueda enseñarla tal cual en
-- lugar de solo el número estimado.
--
-- Solo ejercicios del catálogo: los propios del usuario no tienen histórico
-- comparable entre sesiones con la misma garantía de identidad.

CREATE OR REPLACE FUNCTION public.get_personal_records(
  p_months integer DEFAULT 12,
  p_limit integer DEFAULT 15,
  p_tipo_ejercicio_id uuid DEFAULT NULL
)
RETURNS TABLE (
  tipo_ejercicio_id uuid,
  name text,
  day date,
  weight_kg numeric,
  reps integer,
  one_rep_max numeric,
  actividad_id uuid
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH sets AS (
    SELECT
      e.tipo_ejercicio_id,
      te.nombre AS name,
      (timezone('utc', a.fecha))::date AS day,
      a.id AS actividad_id,
      s.peso_kg,
      s.repeticiones,
      s.peso_kg * (1 + 0.0333 * s.repeticiones) AS epley
    FROM public.serie s
    INNER JOIN public.ejercicio e
      ON e.id = s.ejercicio_id
     AND e.tipo_ejercicio_id IS NOT NULL
     AND (p_tipo_ejercicio_id IS NULL OR e.tipo_ejercicio_id = p_tipo_ejercicio_id)
    INNER JOIN public.actividad a
      ON a.id = e.actividad_id
     AND a.fecha_fin IS NOT NULL
     AND a.fecha >= (now() - make_interval(months => GREATEST(COALESCE(p_months, 12), 1)))
    INNER JOIN public.tipo_ejercicio te
      ON te.id = e.tipo_ejercicio_id
    WHERE s.usuario_id = (SELECT auth.uid())
      AND s.tipo_serie IS DISTINCT FROM 'calentamiento'
      AND s.repeticiones > 0
      AND s.peso_kg > 0
  ),
  ranked AS (
    SELECT
      sets.*,
      row_number() OVER (
        PARTITION BY sets.tipo_ejercicio_id
        ORDER BY sets.epley DESC, sets.day DESC
      ) AS rn
    FROM sets
  )
  SELECT
    r.tipo_ejercicio_id,
    r.name,
    r.day,
    r.peso_kg AS weight_kg,
    r.repeticiones AS reps,
    round(r.epley::numeric, 1) AS one_rep_max,
    r.actividad_id
  FROM ranked r
  WHERE r.rn = 1
  ORDER BY r.epley DESC
  LIMIT GREATEST(COALESCE(p_limit, 15), 1);
$$;

COMMENT ON FUNCTION public.get_personal_records(integer, integer, uuid) IS
  'Mejor serie por ejercicio según 1RM estimado (Epley), para el servidor MCP.';

REVOKE ALL ON FUNCTION public.get_training_summary(date, date, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_training_summary(date, date, text) TO authenticated;

REVOKE ALL ON FUNCTION public.get_personal_records(integer, integer, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_personal_records(integer, integer, uuid) TO authenticated;
