-- Los RPC de progreso no filtraban calentamientos.
--
-- `setTypes.ts` es explícito: "todo consumidor de métricas debe pasar por
-- `isWorkingSet`", porque un calentamiento no es trabajo efectivo. Estos dos
-- RPC nacieron antes que `tipo_serie` y se quedaron sin el filtro, así que la
-- card "Fuerza Máxima" podía dar como 1RM del día un calentamiento cargado, y
-- discrepaba del drawer de rendimiento, que sí lo filtra.
--
-- `IS DISTINCT FROM` en vez de `<>` para que un `tipo_serie` nulo cuente como
-- efectiva, que es a lo que cae `normalizeTipoSerie` en cliente. Las filas
-- históricas ya traen 'efectiva' por el DEFAULT de la columna, así que no
-- cambian de valor.

CREATE OR REPLACE FUNCTION public.list_exercises_with_history()
RETURNS TABLE (
  id uuid,
  name text,
  last_performed timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    te.id,
    te.nombre AS name,
    max(s.created_at) AS last_performed
  FROM public.serie s
  INNER JOIN public.ejercicio e
    ON e.id = s.ejercicio_id
   AND e.tipo_ejercicio_id IS NOT NULL
  INNER JOIN public.actividad a
    ON a.id = e.actividad_id
   AND a.fecha_fin IS NOT NULL
  INNER JOIN public.tipo_ejercicio te
    ON te.id = e.tipo_ejercicio_id
  WHERE s.usuario_id = (SELECT auth.uid())
    -- Un ejercicio que solo se ha calentado nunca tendría gráfico: mejor que no
    -- llegue al selector que ofrecer una card vacía.
    AND s.tipo_serie IS DISTINCT FROM 'calentamiento'
  GROUP BY te.id, te.nombre
  ORDER BY max(s.created_at) DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_exercise_daily_best(
  p_tipo_ejercicio_id uuid,
  p_months integer DEFAULT 12
)
RETURNS TABLE (
  day date,
  weight numeric,
  reps integer,
  one_rep_max numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH sets AS (
    SELECT
      (timezone('utc', a.fecha))::date AS day,
      s.peso_kg,
      s.repeticiones,
      CASE
        WHEN s.peso_kg > 0 THEN s.peso_kg * (1 + 0.0333 * s.repeticiones)
        ELSE NULL
      END AS epley
    FROM public.serie s
    INNER JOIN public.ejercicio e
      ON e.id = s.ejercicio_id
     AND e.tipo_ejercicio_id = p_tipo_ejercicio_id
    INNER JOIN public.actividad a
      ON a.id = e.actividad_id
     AND a.fecha_fin IS NOT NULL
     AND a.fecha >= (now() - make_interval(months => GREATEST(COALESCE(p_months, 12), 1)))
    WHERE s.usuario_id = (SELECT auth.uid())
      AND s.repeticiones > 0
      -- El récord del día sale del trabajo efectivo, no del calentamiento.
      AND s.tipo_serie IS DISTINCT FROM 'calentamiento'
  ),
  ranked AS (
    SELECT
      day,
      peso_kg,
      repeticiones,
      epley,
      row_number() OVER (
        PARTITION BY day
        ORDER BY
          (epley IS NOT NULL) DESC,
          COALESCE(epley, repeticiones::numeric) DESC
      ) AS rn
    FROM sets
  )
  SELECT
    day,
    peso_kg AS weight,
    repeticiones AS reps,
    COALESCE(epley, repeticiones::numeric) AS one_rep_max
  FROM ranked
  WHERE rn = 1
  ORDER BY day ASC;
$$;
