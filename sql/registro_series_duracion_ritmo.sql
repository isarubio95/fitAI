-- Añade modo duracion_ritmo (tiempo + ritmo en s/km) para series tipo cinta / running.
-- Ejecutar tras registro_series_duracion.sql

ALTER TABLE public.rutina_ejercicio
  ADD COLUMN IF NOT EXISTS ritmo_objetivo_seg_km integer;

DO $$ BEGIN
  ALTER TABLE public.rutina_ejercicio
    ADD CONSTRAINT rutina_ejercicio_ritmo_objetivo_seg_km_check
    CHECK (ritmo_objetivo_seg_km IS NULL OR ritmo_objetivo_seg_km > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.serie
  ADD COLUMN IF NOT EXISTS ritmo_seg_km integer;

DO $$ BEGIN
  ALTER TABLE public.serie
    ADD CONSTRAINT serie_ritmo_seg_km_check
    CHECK (ritmo_seg_km IS NULL OR ritmo_seg_km > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.tipo_ejercicio DROP CONSTRAINT IF EXISTS tipo_ejercicio_registro_series_check;
ALTER TABLE public.tipo_ejercicio ADD CONSTRAINT tipo_ejercicio_registro_series_check
  CHECK (registro_series IN ('peso_reps', 'duracion', 'duracion_ritmo'));

ALTER TABLE public.usuario_ejercicio DROP CONSTRAINT IF EXISTS usuario_ejercicio_registro_series_check;
ALTER TABLE public.usuario_ejercicio ADD CONSTRAINT usuario_ejercicio_registro_series_check
  CHECK (registro_series IN ('peso_reps', 'duracion', 'duracion_ritmo'));

ALTER TABLE public.rutina_ejercicio DROP CONSTRAINT IF EXISTS rutina_ejercicio_registro_series_check;
ALTER TABLE public.rutina_ejercicio ADD CONSTRAINT rutina_ejercicio_registro_series_check
  CHECK (registro_series IN ('peso_reps', 'duracion', 'duracion_ritmo'));

ALTER TABLE public.ejercicio DROP CONSTRAINT IF EXISTS ejercicio_registro_series_check;
ALTER TABLE public.ejercicio ADD CONSTRAINT ejercicio_registro_series_check
  CHECK (registro_series IN ('peso_reps', 'duracion', 'duracion_ritmo'));
