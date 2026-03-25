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
  tipo_ejercicio_id uuid NOT NULL,
  usuario_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  superset_id uuid,
  descanso integer DEFAULT 120,
  rir_objetivo integer,
  rep_range text,
  CONSTRAINT ejercicio_pkey PRIMARY KEY (id),
  CONSTRAINT ejercicio_actividad_id_fkey FOREIGN KEY (actividad_id) REFERENCES public.actividad(id),
  CONSTRAINT ejercicio_tipo_ejercicio_id_fkey FOREIGN KEY (tipo_ejercicio_id) REFERENCES public.tipo_ejercicio(id)
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
  tipo_ejercicio_id uuid NOT NULL,
  series_objetivo integer NOT NULL DEFAULT 3,
  repes_min integer NOT NULL DEFAULT 8,
  repes_max integer NOT NULL DEFAULT 12,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  rir integer DEFAULT 1 CHECK (rir >= 0 AND rir <= 3),
  superset_id uuid,
  descanso integer DEFAULT 120,
  CONSTRAINT rutina_ejercicio_pkey PRIMARY KEY (id),
  CONSTRAINT rutina_ejercicio_rutina_id_fkey FOREIGN KEY (rutina_id) REFERENCES public.rutina(id),
  CONSTRAINT rutina_ejercicio_tipo_ejercicio_id_fkey FOREIGN KEY (tipo_ejercicio_id) REFERENCES public.tipo_ejercicio(id)
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
  usuario_id uuid,
  gif_url text,
  musculos_involucrados ARRAY DEFAULT '{}'::text[],
  equipment text,
  instructions ARRAY,
  tipo text,
  grupo_muscular text,
  dificultad text,
  CONSTRAINT tipo_ejercicio_pkey PRIMARY KEY (id),
  CONSTRAINT tipo_ejercicio_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id)
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