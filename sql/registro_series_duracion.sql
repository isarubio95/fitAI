-- Migración: series por peso/reps vs duración (segundos)
-- Ejecutar en Supabase SQL editor o psql tras respaldo.

-- Catálogo
ALTER TABLE public.tipo_ejercicio
  ADD COLUMN IF NOT EXISTS registro_series text NOT NULL DEFAULT 'peso_reps';

DO $$ BEGIN
  ALTER TABLE public.tipo_ejercicio
    ADD CONSTRAINT tipo_ejercicio_registro_series_check
    CHECK (registro_series IN ('peso_reps', 'duracion'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.usuario_ejercicio
  ADD COLUMN IF NOT EXISTS registro_series text NOT NULL DEFAULT 'peso_reps';

DO $$ BEGIN
  ALTER TABLE public.usuario_ejercicio
    ADD CONSTRAINT usuario_ejercicio_registro_series_check
    CHECK (registro_series IN ('peso_reps', 'duracion'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Plantilla de rutina
ALTER TABLE public.rutina_ejercicio
  ADD COLUMN IF NOT EXISTS registro_series text NOT NULL DEFAULT 'peso_reps';

ALTER TABLE public.rutina_ejercicio
  ADD COLUMN IF NOT EXISTS duracion_objetivo_seg integer;

DO $$ BEGIN
  ALTER TABLE public.rutina_ejercicio
    ADD CONSTRAINT rutina_ejercicio_registro_series_check
    CHECK (registro_series IN ('peso_reps', 'duracion'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.rutina_ejercicio
    ADD CONSTRAINT rutina_ejercicio_duracion_objetivo_seg_check
    CHECK (duracion_objetivo_seg IS NULL OR duracion_objetivo_seg >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Snapshot en sesión
ALTER TABLE public.ejercicio
  ADD COLUMN IF NOT EXISTS registro_series text NOT NULL DEFAULT 'peso_reps';

DO $$ BEGIN
  ALTER TABLE public.ejercicio
    ADD CONSTRAINT ejercicio_registro_series_check
    CHECK (registro_series IN ('peso_reps', 'duracion'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Dato por serie
ALTER TABLE public.serie
  ADD COLUMN IF NOT EXISTS duracion_seg integer;

DO $$ BEGIN
  ALTER TABLE public.serie
    ADD CONSTRAINT serie_duracion_seg_check
    CHECK (duracion_seg IS NULL OR duracion_seg >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
