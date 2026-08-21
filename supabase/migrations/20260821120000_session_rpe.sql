-- Session-RPE (Foster): esfuerzo percibido 1–10 al terminar gym o cardio.

ALTER TABLE public.actividad
  ADD COLUMN IF NOT EXISTS rpe smallint;

ALTER TABLE public.actividad
  DROP CONSTRAINT IF EXISTS actividad_rpe_check;
ALTER TABLE public.actividad
  ADD CONSTRAINT actividad_rpe_check
  CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10));

ALTER TABLE public.cardio_sesion
  ADD COLUMN IF NOT EXISTS rpe smallint;

ALTER TABLE public.cardio_sesion
  DROP CONSTRAINT IF EXISTS cardio_sesion_rpe_check;
ALTER TABLE public.cardio_sesion
  ADD CONSTRAINT cardio_sesion_rpe_check
  CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10));
