
-- Exercise catalog (shared, read-only for authenticated users)
CREATE TABLE public.tipo_ejercicio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  imagen TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tipo_ejercicio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read exercise catalog"
  ON public.tipo_ejercicio FOR SELECT
  TO authenticated
  USING (true);

-- Workout sessions
CREATE TABLE public.actividad (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  comentarios TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.actividad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workouts"
  ON public.actividad FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can create own workouts"
  ON public.actividad FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update own workouts"
  ON public.actividad FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Users can delete own workouts"
  ON public.actividad FOR DELETE USING (auth.uid() = usuario_id);

-- Exercises within a workout
CREATE TABLE public.ejercicio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actividad_id UUID NOT NULL REFERENCES public.actividad(id) ON DELETE CASCADE,
  tipo_ejercicio_id UUID NOT NULL REFERENCES public.tipo_ejercicio(id),
  usuario_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ejercicio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercises"
  ON public.ejercicio FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can create own exercises"
  ON public.ejercicio FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update own exercises"
  ON public.ejercicio FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Users can delete own exercises"
  ON public.ejercicio FOR DELETE USING (auth.uid() = usuario_id);

-- Sets within an exercise
CREATE TABLE public.serie (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ejercicio_id UUID NOT NULL REFERENCES public.ejercicio(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  numero_serie INTEGER NOT NULL DEFAULT 1,
  repeticiones INTEGER NOT NULL DEFAULT 0,
  peso_kg DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.serie ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sets"
  ON public.serie FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can create own sets"
  ON public.serie FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Users can update own sets"
  ON public.serie FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Users can delete own sets"
  ON public.serie FOR DELETE USING (auth.uid() = usuario_id);

-- Seed exercise catalog
INSERT INTO public.tipo_ejercicio (nombre, descripcion) VALUES
  ('Press de Banca', 'Ejercicio compuesto para pecho, hombros y tríceps. Acostado en banco plano, empujar barra hacia arriba.'),
  ('Sentadilla', 'Ejercicio compuesto para piernas y glúteos. Con barra en espalda, flexionar rodillas hasta posición paralela.'),
  ('Peso Muerto', 'Ejercicio compuesto para espalda baja, glúteos y piernas. Levantar barra del suelo con espalda recta.'),
  ('Dominadas', 'Ejercicio de tracción para espalda y bíceps. Colgarse de barra y elevar el cuerpo.'),
  ('Press Militar', 'Ejercicio compuesto para hombros y tríceps. De pie, empujar barra sobre la cabeza.');
