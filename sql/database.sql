-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.actividad (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  titulo text NOT NULL,
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  comentarios text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  fecha_fin timestamp with time zone,
  es_publica boolean NOT NULL DEFAULT false,
  CONSTRAINT actividad_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ejercicio (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actividad_id uuid NOT NULL,
  tipo_ejercicio_id uuid,
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  superset_id uuid,
  descanso integer DEFAULT 120,
  rir_objetivo integer,
  rep_range text,
  usuario_ejercicio_id uuid,
  CONSTRAINT ejercicio_pkey PRIMARY KEY (id),
  CONSTRAINT ejercicio_actividad_id_fkey FOREIGN KEY (actividad_id) REFERENCES public.actividad(id),
  CONSTRAINT ejercicio_tipo_ejercicio_id_fkey FOREIGN KEY (tipo_ejercicio_id) REFERENCES public.tipo_ejercicio(id),
  CONSTRAINT ejercicio_usuario_ejercicio_id_fkey FOREIGN KEY (usuario_ejercicio_id) REFERENCES public.usuario_ejercicio(id)
);
CREATE TABLE public.logro (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text NOT NULL,
  icono text NOT NULL,
  xp_recompensa integer NOT NULL DEFAULT 0,
  tipo text NOT NULL,
  meta numeric NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT logro_pkey PRIMARY KEY (id)
);
CREATE TABLE public.medidas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  peso numeric,
  grasa numeric,
  cintura numeric,
  pecho numeric,
  brazo numeric,
  pierna numeric,
  notas text,
  foto_frontal text,
  foto_espalda text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT medidas_pkey PRIMARY KEY (id),
  CONSTRAINT medidas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id)
);
CREATE TABLE public.perfil (
  id uuid NOT NULL DEFAULT auth.uid(),
  username text,
  avatar_url text,
  nivel integer NOT NULL DEFAULT 1,
  xp_total integer NOT NULL DEFAULT 0,
  racha_actual integer NOT NULL DEFAULT 0,
  racha_maxima integer NOT NULL DEFAULT 0,
  ultima_actividad_fecha timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  comunidad_publica_actividad boolean NOT NULL DEFAULT false,
  CONSTRAINT perfil_pkey PRIMARY KEY (id),
  CONSTRAINT perfil_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.rutina (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid DEFAULT auth.uid(),
  nombre text NOT NULL,
  descripcion text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  orden integer DEFAULT 0,
  es_plantilla boolean DEFAULT false,
  nivel text,
  duracion_minutos integer,
  grupo_muscular text,
  CONSTRAINT rutina_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rutina_ejercicio (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  rutina_id uuid NOT NULL,
  tipo_ejercicio_id uuid,
  series_objetivo integer NOT NULL DEFAULT 3,
  repes_min integer NOT NULL DEFAULT 8,
  repes_max integer NOT NULL DEFAULT 12,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  rir integer DEFAULT 1 CHECK (rir >= 0 AND rir <= 3),
  superset_id uuid,
  descanso integer DEFAULT 120,
  usuario_ejercicio_id uuid,
  CONSTRAINT rutina_ejercicio_pkey PRIMARY KEY (id),
  CONSTRAINT rutina_ejercicio_rutina_id_fkey FOREIGN KEY (rutina_id) REFERENCES public.rutina(id),
  CONSTRAINT rutina_ejercicio_tipo_ejercicio_id_fkey FOREIGN KEY (tipo_ejercicio_id) REFERENCES public.tipo_ejercicio(id),
  CONSTRAINT rutina_ejercicio_usuario_ejercicio_id_fkey FOREIGN KEY (usuario_ejercicio_id) REFERENCES public.usuario_ejercicio(id)
);
CREATE TABLE public.rutina_programada (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  rutina_id uuid NOT NULL,
  fecha_programada date NOT NULL,
  actividad_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rutina_programada_pkey PRIMARY KEY (id),
  CONSTRAINT rutina_programada_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id),
  CONSTRAINT rutina_programada_rutina_id_fkey FOREIGN KEY (rutina_id) REFERENCES public.rutina(id),
  CONSTRAINT rutina_programada_actividad_id_fkey FOREIGN KEY (actividad_id) REFERENCES public.actividad(id)
);
CREATE TABLE public.seguimiento (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  seguidor_id uuid NOT NULL,
  seguido_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT seguimiento_seguidor_id_fkey FOREIGN KEY (seguidor_id) REFERENCES public.perfil(id),
  CONSTRAINT seguimiento_seguido_id_fkey FOREIGN KEY (seguido_id) REFERENCES public.perfil(id)
);
CREATE TABLE public.cardio_sesion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  titulo text NOT NULL,
  fecha_inicio timestamp with time zone NOT NULL,
  fecha_fin timestamp with time zone,
  comentarios text,
  es_publica boolean NOT NULL DEFAULT false,
  deporte text,
  cardio_disciplina_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cardio_sesion_pkey PRIMARY KEY (id),
  CONSTRAINT cardio_sesion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id),
  CONSTRAINT cardio_sesion_cardio_disciplina_id_fkey FOREIGN KEY (cardio_disciplina_id) REFERENCES public.cardio_disciplina(id)
);
CREATE TABLE public.cardio_bloque (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cardio_sesion_id uuid NOT NULL,
  orden integer NOT NULL DEFAULT 0,
  tipo_bloque text NOT NULL DEFAULT 'work'::text,
  distancia_m numeric,
  duracion_seg integer,
  elevacion_m numeric,
  fc_media integer,
  fc_max integer,
  calorias numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cardio_bloque_pkey PRIMARY KEY (id),
  CONSTRAINT cardio_bloque_cardio_sesion_id_fkey FOREIGN KEY (cardio_sesion_id) REFERENCES public.cardio_sesion(id),
  CONSTRAINT cardio_bloque_distancia_chk CHECK (distancia_m IS NULL OR distancia_m >= 0::numeric),
  CONSTRAINT cardio_bloque_duracion_chk CHECK (duracion_seg IS NULL OR duracion_seg >= 0),
  CONSTRAINT cardio_bloque_elevacion_chk CHECK (elevacion_m IS NULL OR elevacion_m >= 0::numeric),
  CONSTRAINT cardio_bloque_fc_media_chk CHECK (fc_media IS NULL OR fc_media >= 0),
  CONSTRAINT cardio_bloque_fc_max_chk CHECK (fc_max IS NULL OR fc_max >= 0),
  CONSTRAINT cardio_bloque_calorias_chk CHECK (calorias IS NULL OR calorias >= 0::numeric)
);
CREATE TABLE public.cardio_rutina (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  nombre text NOT NULL,
  descripcion text,
  orden integer DEFAULT 0,
  cardio_disciplina_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cardio_rutina_pkey PRIMARY KEY (id),
  CONSTRAINT cardio_rutina_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id),
  CONSTRAINT cardio_rutina_cardio_disciplina_id_fkey FOREIGN KEY (cardio_disciplina_id) REFERENCES public.cardio_disciplina(id)
);
CREATE TABLE public.cardio_disciplina (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  icono text,
  orden integer NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cardio_disciplina_pkey PRIMARY KEY (id),
  CONSTRAINT cardio_disciplina_codigo_key UNIQUE (codigo)
);
CREATE TABLE public.cardio_sesion_running (
  cardio_sesion_id uuid NOT NULL,
  ritmo_medio_seg_km integer,
  cadencia_media_spm integer,
  desnivel_positivo_m numeric,
  zancada_media_cm numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cardio_sesion_running_pkey PRIMARY KEY (cardio_sesion_id),
  CONSTRAINT cardio_sesion_running_cardio_sesion_id_fkey FOREIGN KEY (cardio_sesion_id) REFERENCES public.cardio_sesion(id),
  CONSTRAINT cardio_sesion_running_ritmo_chk CHECK (ritmo_medio_seg_km IS NULL OR ritmo_medio_seg_km >= 0),
  CONSTRAINT cardio_sesion_running_cadencia_chk CHECK (cadencia_media_spm IS NULL OR cadencia_media_spm >= 0),
  CONSTRAINT cardio_sesion_running_desnivel_chk CHECK (desnivel_positivo_m IS NULL OR desnivel_positivo_m >= 0::numeric),
  CONSTRAINT cardio_sesion_running_zancada_chk CHECK (zancada_media_cm IS NULL OR zancada_media_cm >= 0::numeric)
);
CREATE TABLE public.cardio_sesion_cycling (
  cardio_sesion_id uuid NOT NULL,
  potencia_media_w integer,
  potencia_normalizada_w integer,
  cadencia_media_rpm integer,
  desnivel_positivo_m numeric,
  tipo_bici text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cardio_sesion_cycling_pkey PRIMARY KEY (cardio_sesion_id),
  CONSTRAINT cardio_sesion_cycling_cardio_sesion_id_fkey FOREIGN KEY (cardio_sesion_id) REFERENCES public.cardio_sesion(id),
  CONSTRAINT cardio_sesion_cycling_pot_media_chk CHECK (potencia_media_w IS NULL OR potencia_media_w >= 0),
  CONSTRAINT cardio_sesion_cycling_pot_np_chk CHECK (potencia_normalizada_w IS NULL OR potencia_normalizada_w >= 0),
  CONSTRAINT cardio_sesion_cycling_cadencia_chk CHECK (cadencia_media_rpm IS NULL OR cadencia_media_rpm >= 0),
  CONSTRAINT cardio_sesion_cycling_desnivel_chk CHECK (desnivel_positivo_m IS NULL OR desnivel_positivo_m >= 0::numeric)
);
CREATE TABLE public.cardio_track (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cardio_sesion_id uuid NOT NULL,
  fuente text,
  distancia_total_m numeric,
  duracion_total_seg integer,
  elevacion_positiva_m numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cardio_track_pkey PRIMARY KEY (id),
  CONSTRAINT cardio_track_cardio_sesion_id_key UNIQUE (cardio_sesion_id),
  CONSTRAINT cardio_track_cardio_sesion_id_fkey FOREIGN KEY (cardio_sesion_id) REFERENCES public.cardio_sesion(id),
  CONSTRAINT cardio_track_distancia_chk CHECK (distancia_total_m IS NULL OR distancia_total_m >= 0::numeric),
  CONSTRAINT cardio_track_duracion_chk CHECK (duracion_total_seg IS NULL OR duracion_total_seg >= 0),
  CONSTRAINT cardio_track_elevacion_chk CHECK (elevacion_positiva_m IS NULL OR elevacion_positiva_m >= 0::numeric)
);
CREATE TABLE public.cardio_track_point (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cardio_track_id uuid NOT NULL,
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
  CONSTRAINT cardio_track_point_pkey PRIMARY KEY (id),
  CONSTRAINT cardio_track_point_orden_unique UNIQUE (cardio_track_id, orden),
  CONSTRAINT cardio_track_point_cardio_track_id_fkey FOREIGN KEY (cardio_track_id) REFERENCES public.cardio_track(id),
  CONSTRAINT cardio_track_point_velocidad_chk CHECK (velocidad_m_s IS NULL OR velocidad_m_s >= 0::numeric),
  CONSTRAINT cardio_track_point_fc_chk CHECK (fc IS NULL OR fc >= 0),
  CONSTRAINT cardio_track_point_cadencia_chk CHECK (cadencia IS NULL OR cadencia >= 0),
  CONSTRAINT cardio_track_point_potencia_chk CHECK (potencia_w IS NULL OR potencia_w >= 0)
);
CREATE TABLE public.cardio_rutina_bloque (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cardio_rutina_id uuid NOT NULL,
  orden integer NOT NULL DEFAULT 0,
  tipo_bloque text NOT NULL DEFAULT 'work'::text,
  distancia_objetivo_m numeric,
  duracion_objetivo_seg integer,
  ritmo_objetivo_seg_km integer,
  fc_objetivo integer,
  CONSTRAINT cardio_rutina_bloque_pkey PRIMARY KEY (id),
  CONSTRAINT cardio_rutina_bloque_cardio_rutina_id_fkey FOREIGN KEY (cardio_rutina_id) REFERENCES public.cardio_rutina(id),
  CONSTRAINT cardio_rutina_bloque_dist_chk CHECK (distancia_objetivo_m IS NULL OR distancia_objetivo_m >= 0::numeric),
  CONSTRAINT cardio_rutina_bloque_dur_chk CHECK (duracion_objetivo_seg IS NULL OR duracion_objetivo_seg >= 0),
  CONSTRAINT cardio_rutina_bloque_ritmo_chk CHECK (ritmo_objetivo_seg_km IS NULL OR ritmo_objetivo_seg_km >= 0),
  CONSTRAINT cardio_rutina_bloque_fc_chk CHECK (fc_objetivo IS NULL OR fc_objetivo >= 0)
);
CREATE TABLE public.cardio_rutina_programada (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  cardio_rutina_id uuid NOT NULL,
  fecha_programada date NOT NULL,
  cardio_sesion_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cardio_rutina_programada_pkey PRIMARY KEY (id),
  CONSTRAINT cardio_rutina_programada_unique UNIQUE (usuario_id, cardio_rutina_id, fecha_programada),
  CONSTRAINT cardio_rutina_programada_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id),
  CONSTRAINT cardio_rutina_programada_cardio_rutina_id_fkey FOREIGN KEY (cardio_rutina_id) REFERENCES public.cardio_rutina(id),
  CONSTRAINT cardio_rutina_programada_cardio_sesion_id_fkey FOREIGN KEY (cardio_sesion_id) REFERENCES public.cardio_sesion(id)
);
CREATE INDEX cardio_sesion_usuario_fecha_idx ON public.cardio_sesion USING btree (usuario_id, fecha_inicio DESC);
CREATE INDEX cardio_sesion_usuario_disciplina_fecha_idx ON public.cardio_sesion USING btree (usuario_id, cardio_disciplina_id, fecha_inicio DESC);
CREATE INDEX cardio_bloque_sesion_orden_idx ON public.cardio_bloque USING btree (cardio_sesion_id, orden);
CREATE INDEX cardio_rutina_usuario_created_idx ON public.cardio_rutina USING btree (usuario_id, created_at DESC);
CREATE INDEX cardio_rutina_usuario_disciplina_created_idx ON public.cardio_rutina USING btree (usuario_id, cardio_disciplina_id, created_at DESC);
CREATE INDEX cardio_rutina_bloque_rutina_orden_idx ON public.cardio_rutina_bloque USING btree (cardio_rutina_id, orden);
CREATE INDEX cardio_rutina_programada_usuario_fecha_idx ON public.cardio_rutina_programada USING btree (usuario_id, fecha_programada);
CREATE INDEX cardio_track_sesion_idx ON public.cardio_track USING btree (cardio_sesion_id);
CREATE INDEX cardio_track_point_track_orden_idx ON public.cardio_track_point USING btree (cardio_track_id, orden);
CREATE TABLE public.serie (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ejercicio_id uuid NOT NULL,
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  numero_serie integer NOT NULL DEFAULT 1,
  repeticiones integer NOT NULL DEFAULT 0,
  peso_kg numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  rir integer,
  descanso integer DEFAULT 120,
  completed boolean DEFAULT false,
  CONSTRAINT serie_pkey PRIMARY KEY (id),
  CONSTRAINT serie_ejercicio_id_fkey FOREIGN KEY (ejercicio_id) REFERENCES public.ejercicio(id)
);
CREATE TABLE public.tipo_ejercicio (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  imagen text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  gif_url text,
  musculos_involucrados ARRAY DEFAULT '{}'::text[],
  equipment text,
  instructions ARRAY,
  tipo text,
  grupo_muscular text,
  dificultad text,
  CONSTRAINT tipo_ejercicio_pkey PRIMARY KEY (id)
);
CREATE TABLE public.usuario_ejercicio (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  nombre text NOT NULL,
  descripcion text,
  imagen text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  gif_url text,
  musculos_involucrados ARRAY DEFAULT '{}'::text[],
  equipment text,
  instructions ARRAY,
  tipo text,
  grupo_muscular text,
  dificultad text,
  CONSTRAINT usuario_ejercicio_pkey PRIMARY KEY (id),
  CONSTRAINT usuario_ejercicio_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id)
);
CREATE TABLE public.usuario_logro (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  logro_id uuid NOT NULL,
  fecha_desbloqueo timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT usuario_logro_pkey PRIMARY KEY (id),
  CONSTRAINT usuario_logro_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfil(id),
  CONSTRAINT usuario_logro_logro_id_fkey FOREIGN KEY (logro_id) REFERENCES public.logro(id)
);