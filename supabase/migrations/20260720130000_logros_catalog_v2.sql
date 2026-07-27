-- Rediseño del catálogo de logros:
-- - Nuevas columnas: codigo (estable), categoria, nivel (bronce..diamante|reto) y orden.
-- - Reseed completo: 35 logros incrementales (7 categorías x 5 niveles) + 10 retos únicos.
-- - RLS en logro y usuario_logro.

ALTER TABLE public.logro ADD COLUMN IF NOT EXISTS codigo text;
ALTER TABLE public.logro ADD COLUMN IF NOT EXISTS categoria text;
ALTER TABLE public.logro ADD COLUMN IF NOT EXISTS nivel text;
ALTER TABLE public.logro ADD COLUMN IF NOT EXISTS orden integer NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS logro_codigo_key ON public.logro (codigo);
CREATE UNIQUE INDEX IF NOT EXISTS usuario_logro_usuario_id_logro_id_key
  ON public.usuario_logro (usuario_id, logro_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'logro_nivel_check'
  ) THEN
    ALTER TABLE public.logro
      ADD CONSTRAINT logro_nivel_check
      CHECK (nivel IN ('bronce', 'plata', 'oro', 'platino', 'diamante', 'reto'));
  END IF;
END $$;

-- Reseed limpio: el catálogo antiguo (4 logros) queda obsoleto.
DELETE FROM public.usuario_logro;
DELETE FROM public.logro;

INSERT INTO public.logro (codigo, nombre, descripcion, icono, xp_recompensa, tipo, meta, categoria, nivel, orden) VALUES
-- Entrenos de fuerza completados
('fuerza_bronce',   'Primer Paso',        'Completa tu primer entrenamiento de fuerza',   'Dumbbell', 50,   'entrenamientos_completados', 1,   'fuerza', 'bronce',   1),
('fuerza_plata',    'Constante',          'Completa 10 entrenamientos de fuerza',         'Dumbbell', 100,  'entrenamientos_completados', 10,  'fuerza', 'plata',    2),
('fuerza_oro',      'Veterano',           'Completa 50 entrenamientos de fuerza',         'Dumbbell', 250,  'entrenamientos_completados', 50,  'fuerza', 'oro',      3),
('fuerza_platino',  'Incansable',         'Completa 150 entrenamientos de fuerza',        'Dumbbell', 500,  'entrenamientos_completados', 150, 'fuerza', 'platino',  4),
('fuerza_diamante', 'Leyenda del Hierro', 'Completa 365 entrenamientos de fuerza',        'Dumbbell', 1000, 'entrenamientos_completados', 365, 'fuerza', 'diamante', 5),
-- Racha de semanas
('racha_bronce',   'En Marcha',           'Mantén una racha de 5 semanas entrenando',     'Flame', 50,   'racha_semanas', 5,   'racha', 'bronce',   1),
('racha_plata',    'En Llamas',           'Mantén una racha de 10 semanas entrenando',    'Flame', 100,  'racha_semanas', 10,  'racha', 'plata',    2),
('racha_oro',      'Imparable',           'Mantén una racha de 25 semanas entrenando',    'Flame', 250,  'racha_semanas', 25,  'racha', 'oro',      3),
('racha_platino',  'Disciplina de Acero', 'Mantén una racha de 50 semanas entrenando',    'Flame', 500,  'racha_semanas', 50,  'racha', 'platino',  4),
('racha_diamante', 'Fuego Eterno',        'Mantén una racha de 100 semanas entrenando',   'Flame', 1000, 'racha_semanas', 100, 'racha', 'diamante', 5),
-- Volumen total levantado (kg)
('volumen_bronce',   'Toneladas',       'Levanta 10.000 kg acumulados',    'Weight', 50,   'volumen_total_kg', 10000,   'volumen', 'bronce',   1),
('volumen_plata',    'Camión',          'Levanta 50.000 kg acumulados',    'Weight', 100,  'volumen_total_kg', 50000,   'volumen', 'plata',    2),
('volumen_oro',      'Grúa Humana',     'Levanta 250.000 kg acumulados',   'Weight', 250,  'volumen_total_kg', 250000,  'volumen', 'oro',      3),
('volumen_platino',  'Millón',          'Levanta 1.000.000 kg acumulados', 'Weight', 500,  'volumen_total_kg', 1000000, 'volumen', 'platino',  4),
('volumen_diamante', 'Fuerza Titánica', 'Levanta 2.500.000 kg acumulados', 'Weight', 1000, 'volumen_total_kg', 2500000, 'volumen', 'diamante', 5),
-- Series en un día
('series_bronce',   'Calentando', 'Completa 15 series en un solo día', 'Target', 50,   'series_en_un_dia', 15, 'series_dia', 'bronce',   1),
('series_plata',    'A Tope',     'Completa 25 series en un solo día', 'Target', 100,  'series_en_un_dia', 25, 'series_dia', 'plata',    2),
('series_oro',      'Máquina',    'Completa 35 series en un solo día', 'Target', 250,  'series_en_un_dia', 35, 'series_dia', 'oro',      3),
('series_platino',  'Bestia',     'Completa 50 series en un solo día', 'Target', 500,  'series_en_un_dia', 50, 'series_dia', 'platino',  4),
('series_diamante', 'Modo Dios',  'Completa 70 series en un solo día', 'Target', 1000, 'series_en_un_dia', 70, 'series_dia', 'diamante', 5),
-- Sesiones de cardio completadas
('cardio_bronce',   'Primer Latido',     'Completa tu primera sesión de cardio', 'HeartPulse', 50,   'cardio_sesiones', 1,   'cardio', 'bronce',   1),
('cardio_plata',    'Corazón Activo',    'Completa 10 sesiones de cardio',       'HeartPulse', 100,  'cardio_sesiones', 10,  'cardio', 'plata',    2),
('cardio_oro',      'Ritmo Constante',   'Completa 50 sesiones de cardio',       'HeartPulse', 250,  'cardio_sesiones', 50,  'cardio', 'oro',      3),
('cardio_platino',  'Motor Diésel',      'Completa 150 sesiones de cardio',      'HeartPulse', 500,  'cardio_sesiones', 150, 'cardio', 'platino',  4),
('cardio_diamante', 'Corazón de Hierro', 'Completa 365 sesiones de cardio',      'HeartPulse', 1000, 'cardio_sesiones', 365, 'cardio', 'diamante', 5),
-- Distancia acumulada (km)
('distancia_bronce',   'Primeros Kilómetros', 'Recorre 25 km acumulados en cardio',    'Route', 50,   'distancia_total_km', 25,   'distancia', 'bronce',   1),
('distancia_plata',    'Rodador',             'Recorre 100 km acumulados en cardio',   'Route', 100,  'distancia_total_km', 100,  'distancia', 'plata',    2),
('distancia_oro',      'Trotamundos',         'Recorre 500 km acumulados en cardio',   'Route', 250,  'distancia_total_km', 500,  'distancia', 'oro',      3),
('distancia_platino',  'Ultra',               'Recorre 1.500 km acumulados en cardio', 'Route', 500,  'distancia_total_km', 1500, 'distancia', 'platino',  4),
('distancia_diamante', 'Vuelta al Mundo',     'Recorre 5.000 km acumulados en cardio', 'Route', 1000, 'distancia_total_km', 5000, 'distancia', 'diamante', 5),
-- Nivel alcanzado
('nivel_bronce',   'Ascenso',      'Alcanza el nivel 5',  'Star', 50,   'nivel_alcanzado', 5,  'nivel', 'bronce',   1),
('nivel_plata',    'Prometedor',   'Alcanza el nivel 10', 'Star', 100,  'nivel_alcanzado', 10, 'nivel', 'plata',    2),
('nivel_oro',      'Élite',        'Alcanza el nivel 20', 'Star', 250,  'nivel_alcanzado', 20, 'nivel', 'oro',      3),
('nivel_platino',  'Maestro',      'Alcanza el nivel 35', 'Star', 500,  'nivel_alcanzado', 35, 'nivel', 'platino',  4),
('nivel_diamante', 'Gran Maestro', 'Alcanza el nivel 50', 'Star', 1000, 'nivel_alcanzado', 50, 'nivel', 'diamante', 5),
-- Retos únicos
('reto_multideporte',    'Multideporte',          'Practica 5 disciplinas distintas de cardio',          'Bike',          300, 'reto', 1, 'retos', 'reto', 1),
('reto_madrugador',      'Madrugador',            'Termina un entreno empezado antes de las 7:00',       'Sunrise',       300, 'reto', 1, 'retos', 'reto', 2),
('reto_buho',            'Búho Nocturno',         'Termina un entreno empezado después de las 22:00',    'Moon',          300, 'reto', 1, 'retos', 'reto', 3),
('reto_finde',           'Guerrero del Finde',    'Entrena sábado y domingo de la misma semana',         'CalendarDays',  300, 'reto', 1, 'retos', 'reto', 4),
('reto_doble_sesion',    'Doble Sesión',          'Completa fuerza y cardio el mismo día',               'Layers',        300, 'reto', 1, 'retos', 'reto', 5),
('reto_semana_perfecta', 'Semana Perfecta',       'Entrena 5 días distintos en una misma semana',        'CalendarCheck', 300, 'reto', 1, 'retos', 'reto', 6),
('reto_club_100',        'Club de los 100',       'Completa una serie con 100 kg o más',                 'Medal',         300, 'reto', 1, 'retos', 'reto', 7),
('reto_explorador',      'Explorador',            'Realiza 20 ejercicios distintos',                     'Compass',       300, 'reto', 1, 'retos', 'reto', 8),
('reto_resistencia',     'Resistencia',           'Completa una sesión de más de 2 horas',               'Timer',         300, 'reto', 1, 'retos', 'reto', 9),
('reto_media_maraton',   'Media Maratón',         'Recorre 21 km o más en una sola sesión de cardio',    'Footprints',    300, 'reto', 1, 'retos', 'reto', 10);

-- RLS
ALTER TABLE public.logro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_logro ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "logro_select_authenticated" ON public.logro;
CREATE POLICY "logro_select_authenticated"
  ON public.logro FOR SELECT TO authenticated
  USING (true);

-- Lectura abierta a autenticados: los perfiles de otros usuarios muestran sus logros.
DROP POLICY IF EXISTS "usuario_logro_select_authenticated" ON public.usuario_logro;
CREATE POLICY "usuario_logro_select_authenticated"
  ON public.usuario_logro FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "usuario_logro_insert_own" ON public.usuario_logro;
CREATE POLICY "usuario_logro_insert_own"
  ON public.usuario_logro FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());
