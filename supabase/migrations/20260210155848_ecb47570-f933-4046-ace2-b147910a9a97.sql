
-- Create rutina table
CREATE TABLE public.rutina (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rutina ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routines" ON public.rutina FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can create own routines" ON public.rutina FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update own routines" ON public.rutina FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Users can delete own routines" ON public.rutina FOR DELETE USING (auth.uid() = usuario_id);

-- Create rutina_ejercicio table
CREATE TABLE public.rutina_ejercicio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rutina_id UUID NOT NULL REFERENCES public.rutina(id) ON DELETE CASCADE,
  tipo_ejercicio_id UUID NOT NULL REFERENCES public.tipo_ejercicio(id),
  series_objetivo INTEGER NOT NULL DEFAULT 3,
  repes_min INTEGER NOT NULL DEFAULT 8,
  repes_max INTEGER NOT NULL DEFAULT 12,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rutina_ejercicio ENABLE ROW LEVEL SECURITY;

-- RLS via join to rutina.usuario_id
CREATE POLICY "Users can view own routine exercises" ON public.rutina_ejercicio FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.rutina WHERE id = rutina_id AND usuario_id = auth.uid()));
CREATE POLICY "Users can create own routine exercises" ON public.rutina_ejercicio FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.rutina WHERE id = rutina_id AND usuario_id = auth.uid()));
CREATE POLICY "Users can update own routine exercises" ON public.rutina_ejercicio FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.rutina WHERE id = rutina_id AND usuario_id = auth.uid()));
CREATE POLICY "Users can delete own routine exercises" ON public.rutina_ejercicio FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.rutina WHERE id = rutina_id AND usuario_id = auth.uid()));
