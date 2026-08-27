-- Plan de series por ejercicio de rutina: pirámides, calentamientos, dropsets y AMRAP.
--
-- Hasta ahora rutina_ejercicio describía el ejercicio de forma monolítica
-- (series_objetivo + repes_min/max + rir + descanso comunes a todas las series).
-- rutina_ejercicio_serie permite prescribir cada serie por separado.
--
-- Es opt-in: un ejercicio SIN filas hijas mantiene el comportamiento anterior.
-- Los escalares de rutina_ejercicio se conservan como resumen denormalizado
-- (ver summarizeSeriesPlan en src/lib/seriesPlan.ts).

-- =============================================================================
-- rutina_ejercicio_serie
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.rutina_ejercicio_serie (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rutina_ejercicio_id uuid NOT NULL
    REFERENCES public.rutina_ejercicio(id) ON DELETE CASCADE,
  orden int NOT NULL,
  tipo_serie text NOT NULL DEFAULT 'efectiva'
    CHECK (tipo_serie IN ('calentamiento', 'efectiva', 'dropset', 'amrap')),
  repes_min int,
  repes_max int,                 -- NULL en amrap = rango abierto ("8+")
  rir int,
  peso_objetivo_kg numeric,
  descanso int,                  -- segundos; NULL = hereda rutina_ejercicio.descanso
  duracion_objetivo_seg int,     -- modos duracion / duracion_ritmo
  ritmo_objetivo_seg_km int,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rutina_ejercicio_id, orden)
);

CREATE INDEX IF NOT EXISTS idx_rutina_ejercicio_serie_padre
  ON public.rutina_ejercicio_serie (rutina_ejercicio_id, orden);

ALTER TABLE public.rutina_ejercicio_serie ENABLE ROW LEVEL SECURITY;

-- Políticas espejo de rutina_ejercicio: SELECT también sobre plantillas,
-- escritura solo del dueño. (select auth.uid()) mantiene la optimización
-- de initplan introducida en 20260731125111.
DROP POLICY IF EXISTS rutina_ejercicio_serie_select_own_or_template ON public.rutina_ejercicio_serie;
CREATE POLICY rutina_ejercicio_serie_select_own_or_template
  ON public.rutina_ejercicio_serie FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.rutina_ejercicio re
      JOIN public.rutina r ON r.id = re.rutina_id
      WHERE re.id = rutina_ejercicio_serie.rutina_ejercicio_id
        AND (r.usuario_id = (select auth.uid()) OR r.es_plantilla = true)
    )
  );

DROP POLICY IF EXISTS rutina_ejercicio_serie_insert_owner ON public.rutina_ejercicio_serie;
CREATE POLICY rutina_ejercicio_serie_insert_owner
  ON public.rutina_ejercicio_serie FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.rutina_ejercicio re
      JOIN public.rutina r ON r.id = re.rutina_id
      WHERE re.id = rutina_ejercicio_serie.rutina_ejercicio_id
        AND r.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS rutina_ejercicio_serie_update_owner ON public.rutina_ejercicio_serie;
CREATE POLICY rutina_ejercicio_serie_update_owner
  ON public.rutina_ejercicio_serie FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.rutina_ejercicio re
      JOIN public.rutina r ON r.id = re.rutina_id
      WHERE re.id = rutina_ejercicio_serie.rutina_ejercicio_id
        AND r.usuario_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS rutina_ejercicio_serie_delete_owner ON public.rutina_ejercicio_serie;
CREATE POLICY rutina_ejercicio_serie_delete_owner
  ON public.rutina_ejercicio_serie FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.rutina_ejercicio re
      JOIN public.rutina r ON r.id = re.rutina_id
      WHERE re.id = rutina_ejercicio_serie.rutina_ejercicio_id
        AND r.usuario_id = (select auth.uid())
    )
  );

-- =============================================================================
-- serie: objetivos por fila
--
-- Se guardan en la sesión para que sobrevivan a la rehidratación (la sesión
-- activa se reconstruye desde BD, no desde la rutina) y para que el histórico
-- conserve lo que se prescribió, aunque la rutina cambie después.
--
-- tipo_serie DEFAULT 'efectiva' => ningún histórico cambia de valor y las
-- métricas de entrenos anteriores quedan idénticas.
-- =============================================================================
ALTER TABLE public.serie
  ADD COLUMN IF NOT EXISTS tipo_serie text NOT NULL DEFAULT 'efectiva',
  ADD COLUMN IF NOT EXISTS objetivo_repes_min int,
  ADD COLUMN IF NOT EXISTS objetivo_repes_max int,
  ADD COLUMN IF NOT EXISTS objetivo_rir int,
  ADD COLUMN IF NOT EXISTS objetivo_peso_kg numeric;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'serie_tipo_serie_check'
  ) THEN
    ALTER TABLE public.serie
      ADD CONSTRAINT serie_tipo_serie_check
      CHECK (tipo_serie IN ('calentamiento', 'efectiva', 'dropset', 'amrap'));
  END IF;
END $$;
