-- XP y racha calculadas en la base de datos, con registro de lo ya concedido.
--
-- El problema que resuelve: `awardSessionXp` (src/hooks/useGamification.ts) es
-- un acumulador —`xp_total += total`— que solo es correcto si se llama
-- exactamente una vez por sesión. Eso vale cuando el único escritor es el
-- formulario de la app, pero no cuando quien escribe es un agente que reintenta
-- por su cuenta tras un timeout: cada reintento regalaría XP.
--
-- La solución es un libro mayor. `xp_evento` tiene una fila por sesión, con
-- índice único: conceder XP dos veces por el mismo entrenamiento no suma dos
-- veces, no hace nada. Y como la fila cae con la sesión (ON DELETE CASCADE),
-- borrar un entrenamiento devuelve su XP sin cuentas manuales.
--
-- La racha va aparte y no necesita libro mayor: se recalcula entera desde el
-- historial, igual que hace hoy `computeStreakStats`. Al ser función pura de
-- los datos, llamarla de más es inofensivo.
--
-- Los LOGROS quedan fuera a propósito. `checkAndAwardLogros` son 451 líneas con
-- cinco pasadas de estabilización y ya es autocurativa: `useLogrosSync` la corre
-- al abrir la app y concede retroactivamente lo que falte. Portarla a SQL sería
-- el mayor foco de divergencia del proyecto a cambio de que un logro aparezca
-- unos minutos antes.

-- ---------------------------------------------------------------------------
-- Libro mayor de XP.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.xp_evento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.perfil (id) ON DELETE CASCADE,
  actividad_id uuid REFERENCES public.actividad (id) ON DELETE CASCADE,
  cardio_sesion_id uuid REFERENCES public.cardio_sesion (id) ON DELETE CASCADE,
  xp integer NOT NULL,
  detalle jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT xp_evento_exactly_one_source CHECK (
    num_nonnulls(actividad_id, cardio_sesion_id) = 1
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS xp_evento_actividad_uidx
  ON public.xp_evento (actividad_id) WHERE actividad_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS xp_evento_cardio_uidx
  ON public.xp_evento (cardio_sesion_id) WHERE cardio_sesion_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS xp_evento_usuario_idx ON public.xp_evento (usuario_id);

ALTER TABLE public.xp_evento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS xp_evento_select_own ON public.xp_evento;
CREATE POLICY xp_evento_select_own
  ON public.xp_evento FOR SELECT TO authenticated
  USING (usuario_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS xp_evento_insert_own ON public.xp_evento;
CREATE POLICY xp_evento_insert_own
  ON public.xp_evento FOR INSERT TO authenticated
  WITH CHECK (usuario_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS xp_evento_delete_own ON public.xp_evento;
CREATE POLICY xp_evento_delete_own
  ON public.xp_evento FOR DELETE TO authenticated
  USING (usuario_id = (SELECT auth.uid()));

COMMENT ON TABLE public.xp_evento IS
  'Una fila por sesión con XP concedida. El índice único es lo que hace idempotente award_session_xp.';

-- ---------------------------------------------------------------------------
-- recompute_profile_streak: racha de semanas, recalculada desde cero.
-- ---------------------------------------------------------------------------
-- Puerto de `computeStreakStats` (src/lib/streakWeeks.ts): semanas ISO de lunes
-- a domingo en UTC, con al menos un entrenamiento de fuerza o cardio cerrado.
-- `racha_actual` cuenta hacia atrás desde la última semana con actividad, y
-- `racha_maxima` es la racha más larga que haya existido.
--
-- Las rachas consecutivas se detectan con la técnica de islas: dentro de una
-- serie de semanas seguidas, `semana - (fila * 7 días)` es constante.

CREATE OR REPLACE FUNCTION public.recompute_profile_streak()
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_actual integer := 0;
  v_maxima integer := 0;
  v_ultimo_dia date;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No hay sesión' USING ERRCODE = 'insufficient_privilege';
  END IF;

  WITH dias AS (
    SELECT DISTINCT (timezone('utc', a.fecha))::date AS dia
    FROM public.actividad a
    WHERE a.usuario_id = v_uid AND a.fecha_fin IS NOT NULL
    UNION
    SELECT DISTINCT (timezone('utc', cs.fecha_inicio))::date
    FROM public.cardio_sesion cs
    WHERE cs.usuario_id = v_uid AND cs.fecha_fin IS NOT NULL
  ),
  semanas AS (
    SELECT DISTINCT date_trunc('week', dia)::date AS semana FROM dias
  ),
  islas AS (
    SELECT
      semana,
      -- El cast a integer es obligatorio: `row_number()` devuelve bigint y
      -- Postgres no define `date - bigint`. Sin él la función compila y falla
      -- al ejecutarse, porque plpgsql no valida tipos hasta entonces.
      semana - (row_number() OVER (ORDER BY semana) * 7)::integer AS grupo
    FROM semanas
  ),
  rachas AS (
    SELECT grupo, count(*)::integer AS longitud, max(semana) AS ultima_semana
    FROM islas
    GROUP BY grupo
  )
  SELECT
    coalesce((
      SELECT r.longitud FROM rachas r
      ORDER BY r.ultima_semana DESC
      LIMIT 1
    ), 0),
    coalesce((SELECT max(r.longitud) FROM rachas r), 0),
    (SELECT max(dia) FROM dias)
  INTO v_actual, v_maxima, v_ultimo_dia;

  UPDATE public.perfil
  SET racha_actual = v_actual,
      racha_maxima = GREATEST(v_maxima, 0),
      -- Mismo valor que `dayKeyToUltimaFechaIso`: final del día en UTC.
      ultima_actividad_fecha = CASE
        WHEN v_ultimo_dia IS NULL THEN NULL
        ELSE (v_ultimo_dia + time '23:59:59.999') AT TIME ZONE 'utc'
      END
  WHERE id = v_uid;

  RETURN jsonb_build_object(
    'streak_weeks_current', v_actual,
    'streak_weeks_best', v_maxima,
    'last_training_day', v_ultimo_dia
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- award_session_xp: concede la XP de una sesión, una sola vez.
-- ---------------------------------------------------------------------------
-- Puerto de src/lib/sessionXp.ts: 100 de base, 5 por serie efectiva registrada
-- (cardio: 2 por minuto, y nada por debajo de 8 minutos), base + volumen topados
-- en 250, más 20 por cada semana de racha a partir de la segunda.
--
-- «Serie efectiva registrada» es el mismo criterio que el cliente
-- (`isWorkingSet` + `serieCountsAsRecorded`): no es calentamiento y tiene
-- trabajo real o está marcada como completada.

CREATE OR REPLACE FUNCTION public.award_session_xp(
  p_actividad_id uuid DEFAULT NULL,
  p_cardio_sesion_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_racha jsonb;
  v_semanas integer;
  v_base integer := 100;
  v_volumen integer := 0;
  v_bonus integer;
  v_total integer;
  v_series integer;
  v_segundos integer;
  v_insertado uuid;
  v_xp_previa integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No hay sesión' USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF num_nonnulls(p_actividad_id, p_cardio_sesion_id) <> 1 THEN
    RAISE EXCEPTION 'Indica una sesión de fuerza o una de cardio, no ambas'
      USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- La racha se recalcula ANTES: el bonus depende de la sesión recién creada.
  v_racha := public.recompute_profile_streak();
  v_semanas := coalesce((v_racha->>'streak_weeks_current')::integer, 0);

  IF p_actividad_id IS NOT NULL THEN
    SELECT count(*)::integer INTO v_series
    FROM public.serie s
    INNER JOIN public.ejercicio e ON e.id = s.ejercicio_id
    WHERE e.actividad_id = p_actividad_id
      AND s.usuario_id = v_uid
      AND s.tipo_serie IS DISTINCT FROM 'calentamiento'
      AND (
        s.completed IS TRUE
        OR s.repeticiones > 0
        OR s.peso_kg > 0
        OR coalesce(s.duracion_seg, 0) > 0
        OR coalesce(s.ritmo_seg_km, 0) > 0
      );

    v_volumen := coalesce(v_series, 0) * 5;
  ELSE
    -- Duración con la misma precedencia que `resolveCardioDurationSec`: primero
    -- la suma de bloques, y si no hay, la diferencia entre marcas de tiempo.
    SELECT coalesce(
      nullif((SELECT sum(cb.duracion_seg)::integer
              FROM public.cardio_bloque cb
              WHERE cb.cardio_sesion_id = cs.id), 0),
      GREATEST(EXTRACT(EPOCH FROM (cs.fecha_fin - cs.fecha_inicio)), 0)::integer,
      0
    )
    INTO v_segundos
    FROM public.cardio_sesion cs
    WHERE cs.id = p_cardio_sesion_id AND cs.usuario_id = v_uid;

    IF v_segundos IS NULL THEN
      RAISE EXCEPTION 'No existe esa sesión de cardio' USING ERRCODE = 'no_data_found';
    END IF;

    IF v_segundos < 480 THEN
      -- Cuenta para la racha, pero no da XP.
      RETURN jsonb_build_object('xp_awarded', 0, 'reason', 'cardio_too_short',
                                'streak_weeks', v_semanas);
    END IF;

    v_volumen := (v_segundos / 60) * 2;
  END IF;

  -- Tope de 250 sobre base + volumen; el bonus de racha va por encima.
  IF v_base + v_volumen > 250 THEN
    v_volumen := GREATEST(0, 250 - v_base);
  END IF;

  v_bonus := GREATEST(0, (v_semanas - 1) * 20);
  v_total := v_base + v_volumen + v_bonus;

  INSERT INTO public.xp_evento (usuario_id, actividad_id, cardio_sesion_id, xp, detalle)
  VALUES (
    v_uid, p_actividad_id, p_cardio_sesion_id, v_total,
    jsonb_build_object('base', v_base, 'volumen', v_volumen, 'racha', v_bonus,
                       'semanas', v_semanas)
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_insertado;

  -- Sin fila nueva, la XP ya estaba concedida: no se toca el perfil. Esta es la
  -- línea que hace que un reintento sea inofensivo.
  IF v_insertado IS NULL THEN
    RETURN jsonb_build_object('xp_awarded', 0, 'already_awarded', true,
                              'streak_weeks', v_semanas);
  END IF;

  SELECT xp_total INTO v_xp_previa FROM public.perfil WHERE id = v_uid;

  UPDATE public.perfil
  SET xp_total = coalesce(xp_total, 0) + v_total,
      nivel = floor((coalesce(xp_total, 0) + v_total) / 1000) + 1
  WHERE id = v_uid;

  RETURN jsonb_build_object(
    'xp_awarded', v_total,
    'base', v_base,
    'volume', v_volumen,
    'streak_bonus', v_bonus,
    'streak_weeks', v_semanas,
    'leveled_up', floor((coalesce(v_xp_previa, 0) + v_total) / 1000)
                  > floor(coalesce(v_xp_previa, 0) / 1000)
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- revoke_session_xp: devuelve la XP de una sesión antes de borrarla.
-- ---------------------------------------------------------------------------
-- Hay que llamarla ANTES del DELETE: después, la cascada ya se ha llevado la
-- fila del libro mayor y no quedaría constancia de cuánto restar.

CREATE OR REPLACE FUNCTION public.revoke_session_xp(
  p_actividad_id uuid DEFAULT NULL,
  p_cardio_sesion_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := (SELECT auth.uid());
  v_xp integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No hay sesión' USING ERRCODE = 'insufficient_privilege';
  END IF;

  DELETE FROM public.xp_evento
  WHERE usuario_id = v_uid
    AND ((p_actividad_id IS NOT NULL AND actividad_id = p_actividad_id)
      OR (p_cardio_sesion_id IS NOT NULL AND cardio_sesion_id = p_cardio_sesion_id))
  RETURNING xp INTO v_xp;

  IF v_xp IS NULL THEN
    RETURN jsonb_build_object('xp_removed', 0);
  END IF;

  UPDATE public.perfil
  SET xp_total = GREATEST(0, coalesce(xp_total, 0) - v_xp),
      nivel = floor(GREATEST(0, coalesce(xp_total, 0) - v_xp) / 1000) + 1
  WHERE id = v_uid;

  RETURN jsonb_build_object('xp_removed', v_xp);
END;
$$;

REVOKE ALL ON FUNCTION public.recompute_profile_streak() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recompute_profile_streak() TO authenticated;

REVOKE ALL ON FUNCTION public.award_session_xp(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_session_xp(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.revoke_session_xp(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_session_xp(uuid, uuid) TO authenticated;
