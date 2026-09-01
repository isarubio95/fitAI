-- Las plantillas ya codificaban superseries/circuitos con descanso = 0
-- entre ejercicios del bloque, pero nunca rellenaron superset_id.
-- El logger y el formulario solo agrupan cuando el id es compartido.

WITH numbered AS (
  SELECT
    re.id,
    re.rutina_id,
    re.orden,
    re.descanso,
    lag(re.descanso) OVER (
      PARTITION BY re.rutina_id
      ORDER BY re.orden, re.id
    ) AS prev_descanso
  FROM public.rutina_ejercicio re
  INNER JOIN public.rutina r ON r.id = re.rutina_id
  WHERE r.es_plantilla IS TRUE
    AND re.superset_id IS NULL
),
flagged AS (
  SELECT
    id,
    rutina_id,
    orden,
    (COALESCE(prev_descanso, -1) = 0 OR descanso = 0) AS in_chain,
    CASE
      WHEN descanso = 0 AND COALESCE(prev_descanso, -1) <> 0 THEN 1
      ELSE 0
    END AS is_start
  FROM numbered
),
chained AS (
  SELECT
    id,
    rutina_id,
    SUM(is_start) OVER (
      PARTITION BY rutina_id
      ORDER BY orden, id
    ) AS grp
  FROM flagged
  WHERE in_chain
),
block_ids AS (
  SELECT
    rutina_id,
    grp,
    gen_random_uuid() AS sid
  FROM chained
  GROUP BY rutina_id, grp
  HAVING COUNT(*) >= 2
)
UPDATE public.rutina_ejercicio re
SET superset_id = b.sid
FROM chained c
INNER JOIN block_ids b
  ON b.rutina_id = c.rutina_id
 AND b.grp = c.grp
WHERE re.id = c.id
  AND re.superset_id IS NULL;

-- Último ejercicio de una plantilla de 5, con descanso 0 y sin pareja.
UPDATE public.rutina_ejercicio re
SET descanso = 60
FROM public.rutina r
WHERE re.rutina_id = r.id
  AND r.es_plantilla IS TRUE
  AND r.nombre = 'Superseries Antagonistas Pesadas 45'
  AND r.grupo_muscular = 'Brazos'
  AND r.nivel = 'Alta'
  AND r.duracion_minutos = 45
  AND re.orden = 5
  AND re.descanso = 0
  AND re.superset_id IS NULL;
