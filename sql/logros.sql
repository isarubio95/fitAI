-- Inserta los logros por defecto en public.logro
-- tipo + meta definen la condición: el frontend compara con las stats del usuario
-- Ejecutar una sola vez (si ya existen, omitir o usar INSERT solo donde no existan).

INSERT INTO public.logro (nombre, descripcion, icono, xp_recompensa, tipo, meta)
VALUES
  ('Primera Sangre', 'Termina tu primer entrenamiento', 'Swords', 50, 'entrenamientos_completados', 1),
  ('Guerrero', 'Completa 10 entrenamientos', 'Shield', 200, 'entrenamientos_completados', 10),
  ('En Llamas', 'Racha de 7 días', 'Flame', 300, 'racha_dias', 7),
  ('Francotirador', 'Completa 50 series en un día', 'Target', 150, 'series_en_un_dia', 50);
