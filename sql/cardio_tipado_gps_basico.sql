-- Cardio tipado por deporte + soporte GPS básico
-- Fase compatible: mantiene columna legacy `deporte` mientras migra a `cardio_disciplina_id`.

BEGIN;

CREATE TABLE IF NOT EXISTS public.cardio_disciplina (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nombre text NOT NULL,
  icono text,
  orden integer NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

INSERT INTO public.cardio_disciplina (codigo, nombre, icono, orden)
VALUES
  ('running', 'Carrera', 'running', 10),
  ('cycling', 'Ciclismo', 'bike', 20),
  ('walking', 'Caminata', 'walking', 30),
  ('rowing', 'Remo', 'rowing', 40),
  ('swimming', 'Natación', 'swimming', 50),
  ('other', 'Otro', 'activity', 999)
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre,
    icono = EXCLUDED.icono,
    orden = EXCLUDED.orden,
    activo = true;

ALTER TABLE public.cardio_sesion
  ADD COLUMN IF NOT EXISTS cardio_disciplina_id uuid REFERENCES public.cardio_disciplina(id);

ALTER TABLE public.cardio_rutina
  ADD COLUMN IF NOT EXISTS cardio_disciplina_id uuid REFERENCES public.cardio_disciplina(id);

-- Backfill de deporte libre hacia disciplina tipada (sesiones existentes)
UPDATE public.cardio_sesion s
SET cardio_disciplina_id = d.id
FROM public.cardio_disciplina d
WHERE s.cardio_disciplina_id IS NULL
  AND (
    (d.codigo = 'running' AND lower(coalesce(s.deporte, '')) IN ('running', 'correr', 'carrera', 'run', 'trote'))
    OR (d.codigo = 'cycling' AND lower(coalesce(s.deporte, '')) IN ('cycling', 'ciclismo', 'bike', 'bici', 'bicicleta', 'mtb', 'spinning'))
    OR (d.codigo = 'walking' AND lower(coalesce(s.deporte, '')) IN ('walking', 'caminar', 'caminata', 'andar'))
    OR (d.codigo = 'rowing' AND lower(coalesce(s.deporte, '')) IN ('rowing', 'remo'))
    OR (d.codigo = 'swimming' AND lower(coalesce(s.deporte, '')) IN ('swimming', 'natacion', 'natación', 'nadar'))
  );

-- Todo registro sin match queda como "other"
UPDATE public.cardio_sesion s
SET cardio_disciplina_id = d.id
FROM public.cardio_disciplina d
WHERE s.cardio_disciplina_id IS NULL
  AND d.codigo = 'other';

CREATE TABLE IF NOT EXISTS public.cardio_sesion_running (
  cardio_sesion_id uuid PRIMARY KEY REFERENCES public.cardio_sesion(id) ON DELETE CASCADE,
  ritmo_medio_seg_km integer,
  cadencia_media_spm integer,
  desnivel_positivo_m numeric,
  zancada_media_cm numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cardio_sesion_running_ritmo_chk CHECK (ritmo_medio_seg_km IS NULL OR ritmo_medio_seg_km >= 0),
  CONSTRAINT cardio_sesion_running_cadencia_chk CHECK (cadencia_media_spm IS NULL OR cadencia_media_spm >= 0),
  CONSTRAINT cardio_sesion_running_desnivel_chk CHECK (desnivel_positivo_m IS NULL OR desnivel_positivo_m >= 0),
  CONSTRAINT cardio_sesion_running_zancada_chk CHECK (zancada_media_cm IS NULL OR zancada_media_cm >= 0)
);

CREATE TABLE IF NOT EXISTS public.cardio_sesion_cycling (
  cardio_sesion_id uuid PRIMARY KEY REFERENCES public.cardio_sesion(id) ON DELETE CASCADE,
  potencia_media_w integer,
  potencia_normalizada_w integer,
  cadencia_media_rpm integer,
  desnivel_positivo_m numeric,
  tipo_bici text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cardio_sesion_cycling_pot_media_chk CHECK (potencia_media_w IS NULL OR potencia_media_w >= 0),
  CONSTRAINT cardio_sesion_cycling_pot_np_chk CHECK (potencia_normalizada_w IS NULL OR potencia_normalizada_w >= 0),
  CONSTRAINT cardio_sesion_cycling_cadencia_chk CHECK (cadencia_media_rpm IS NULL OR cadencia_media_rpm >= 0),
  CONSTRAINT cardio_sesion_cycling_desnivel_chk CHECK (desnivel_positivo_m IS NULL OR desnivel_positivo_m >= 0)
);

CREATE TABLE IF NOT EXISTS public.cardio_track (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cardio_sesion_id uuid NOT NULL UNIQUE REFERENCES public.cardio_sesion(id) ON DELETE CASCADE,
  fuente text,
  distancia_total_m numeric,
  duracion_total_seg integer,
  elevacion_positiva_m numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cardio_track_distancia_chk CHECK (distancia_total_m IS NULL OR distancia_total_m >= 0),
  CONSTRAINT cardio_track_duracion_chk CHECK (duracion_total_seg IS NULL OR duracion_total_seg >= 0),
  CONSTRAINT cardio_track_elevacion_chk CHECK (elevacion_positiva_m IS NULL OR elevacion_positiva_m >= 0)
);

CREATE TABLE IF NOT EXISTS public.cardio_track_point (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cardio_track_id uuid NOT NULL REFERENCES public.cardio_track(id) ON DELETE CASCADE,
  orden integer NOT NULL,
  lat numeric(9,6) NOT NULL,
  lng numeric(9,6) NOT NULL,
  elevacion_m numeric,
  timestamp_utc timestamp with time zone,
  velocidad_m_s numeric,
  fc integer,
  cadencia integer,
  potencia_w integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cardio_track_point_orden_unique UNIQUE (cardio_track_id, orden),
  CONSTRAINT cardio_track_point_velocidad_chk CHECK (velocidad_m_s IS NULL OR velocidad_m_s >= 0),
  CONSTRAINT cardio_track_point_fc_chk CHECK (fc IS NULL OR fc >= 0),
  CONSTRAINT cardio_track_point_cadencia_chk CHECK (cadencia IS NULL OR cadencia >= 0),
  CONSTRAINT cardio_track_point_potencia_chk CHECK (potencia_w IS NULL OR potencia_w >= 0)
);

CREATE INDEX IF NOT EXISTS cardio_sesion_usuario_disciplina_fecha_idx
  ON public.cardio_sesion USING btree (usuario_id, cardio_disciplina_id, fecha_inicio DESC);

CREATE INDEX IF NOT EXISTS cardio_rutina_usuario_disciplina_created_idx
  ON public.cardio_rutina USING btree (usuario_id, cardio_disciplina_id, created_at DESC);

CREATE INDEX IF NOT EXISTS cardio_track_sesion_idx
  ON public.cardio_track USING btree (cardio_sesion_id);

CREATE INDEX IF NOT EXISTS cardio_track_point_track_orden_idx
  ON public.cardio_track_point USING btree (cardio_track_id, orden);

COMMIT;
