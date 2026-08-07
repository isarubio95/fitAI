-- Rutas GPS guardadas por el usuario (copia de tracks de sesiones públicas o propias).

CREATE TABLE IF NOT EXISTS public.cardio_ruta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES public.perfil (id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  cardio_disciplina_id uuid REFERENCES public.cardio_disciplina (id) ON DELETE SET NULL,
  distancia_total_m double precision,
  elevacion_positiva_m double precision,
  origen_cardio_sesion_id uuid REFERENCES public.cardio_sesion (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cardio_ruta_nombre_len CHECK (
    char_length(btrim(nombre)) >= 1 AND char_length(nombre) <= 120
  )
);

CREATE INDEX IF NOT EXISTS cardio_ruta_usuario_id_idx
  ON public.cardio_ruta (usuario_id, created_at DESC);

CREATE INDEX IF NOT EXISTS cardio_ruta_origen_sesion_idx
  ON public.cardio_ruta (origen_cardio_sesion_id)
  WHERE origen_cardio_sesion_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.cardio_ruta_punto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cardio_ruta_id uuid NOT NULL REFERENCES public.cardio_ruta (id) ON DELETE CASCADE,
  orden integer NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  elevacion_m double precision,
  CONSTRAINT cardio_ruta_punto_orden_unique UNIQUE (cardio_ruta_id, orden)
);

CREATE INDEX IF NOT EXISTS cardio_ruta_punto_ruta_id_idx
  ON public.cardio_ruta_punto (cardio_ruta_id, orden);

ALTER TABLE public.cardio_ruta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_ruta_punto ENABLE ROW LEVEL SECURITY;

CREATE POLICY cardio_ruta_select_own
  ON public.cardio_ruta FOR SELECT TO public
  USING (usuario_id = (select auth.uid()));

CREATE POLICY cardio_ruta_insert_own
  ON public.cardio_ruta FOR INSERT TO public
  WITH CHECK (usuario_id = (select auth.uid()));

CREATE POLICY cardio_ruta_update_own
  ON public.cardio_ruta FOR UPDATE TO public
  USING (usuario_id = (select auth.uid()))
  WITH CHECK (usuario_id = (select auth.uid()));

CREATE POLICY cardio_ruta_delete_own
  ON public.cardio_ruta FOR DELETE TO public
  USING (usuario_id = (select auth.uid()));

CREATE POLICY cardio_ruta_punto_select_own
  ON public.cardio_ruta_punto FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_ruta r
      WHERE r.id = cardio_ruta_id
        AND r.usuario_id = (select auth.uid())
    )
  );

CREATE POLICY cardio_ruta_punto_insert_own
  ON public.cardio_ruta_punto FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cardio_ruta r
      WHERE r.id = cardio_ruta_id
        AND r.usuario_id = (select auth.uid())
    )
  );

CREATE POLICY cardio_ruta_punto_update_own
  ON public.cardio_ruta_punto FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_ruta r
      WHERE r.id = cardio_ruta_id
        AND r.usuario_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cardio_ruta r
      WHERE r.id = cardio_ruta_id
        AND r.usuario_id = (select auth.uid())
    )
  );

CREATE POLICY cardio_ruta_punto_delete_own
  ON public.cardio_ruta_punto FOR DELETE TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.cardio_ruta r
      WHERE r.id = cardio_ruta_id
        AND r.usuario_id = (select auth.uid())
    )
  );
