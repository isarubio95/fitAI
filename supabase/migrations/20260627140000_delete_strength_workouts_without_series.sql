-- Elimina entrenamientos de fuerza (actividad) sin ninguna serie con datos registrados.
-- Criterio alineado con serieCountsAsRecorded en la app: completed o reps/peso/duración/ritmo > 0.

WITH empty_workouts AS (
  SELECT a.id
  FROM actividad a
  WHERE NOT EXISTS (
    SELECT 1
    FROM ejercicio e
    INNER JOIN serie s ON s.ejercicio_id = e.id
    WHERE e.actividad_id = a.id
      AND (
        COALESCE(s.completed, false)
        OR COALESCE(s.repeticiones, 0) > 0
        OR COALESCE(s.peso_kg, 0) > 0
        OR COALESCE(s.duracion_seg, 0) > 0
        OR COALESCE(s.ritmo_seg_km, 0) > 0
      )
  )
)
UPDATE rutina_programada rp
SET actividad_id = NULL
FROM empty_workouts ew
WHERE rp.actividad_id = ew.id;

WITH empty_workouts AS (
  SELECT a.id
  FROM actividad a
  WHERE NOT EXISTS (
    SELECT 1
    FROM ejercicio e
    INNER JOIN serie s ON s.ejercicio_id = e.id
    WHERE e.actividad_id = a.id
      AND (
        COALESCE(s.completed, false)
        OR COALESCE(s.repeticiones, 0) > 0
        OR COALESCE(s.peso_kg, 0) > 0
        OR COALESCE(s.duracion_seg, 0) > 0
        OR COALESCE(s.ritmo_seg_km, 0) > 0
      )
  )
)
DELETE FROM serie s
USING ejercicio e, empty_workouts ew
WHERE s.ejercicio_id = e.id
  AND e.actividad_id = ew.id;

WITH empty_workouts AS (
  SELECT a.id
  FROM actividad a
  WHERE NOT EXISTS (
    SELECT 1
    FROM ejercicio e
    INNER JOIN serie s ON s.ejercicio_id = e.id
    WHERE e.actividad_id = a.id
      AND (
        COALESCE(s.completed, false)
        OR COALESCE(s.repeticiones, 0) > 0
        OR COALESCE(s.peso_kg, 0) > 0
        OR COALESCE(s.duracion_seg, 0) > 0
        OR COALESCE(s.ritmo_seg_km, 0) > 0
      )
  )
)
DELETE FROM ejercicio e
USING empty_workouts ew
WHERE e.actividad_id = ew.id;

WITH empty_workouts AS (
  SELECT a.id
  FROM actividad a
  WHERE NOT EXISTS (
    SELECT 1
    FROM ejercicio e
    INNER JOIN serie s ON s.ejercicio_id = e.id
    WHERE e.actividad_id = a.id
      AND (
        COALESCE(s.completed, false)
        OR COALESCE(s.repeticiones, 0) > 0
        OR COALESCE(s.peso_kg, 0) > 0
        OR COALESCE(s.duracion_seg, 0) > 0
        OR COALESCE(s.ritmo_seg_km, 0) > 0
      )
  )
)
DELETE FROM actividad a
USING empty_workouts ew
WHERE a.id = ew.id;
