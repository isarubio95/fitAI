-- Completa las 2 celdas vacías de la parrilla 9 × 3 × 3 (5 variantes por celda):
-- Brazos Baja 45 min (IDs 47000001-05, hueco entre Baja 30 y Baja 60)
-- Piernas Baja 60 min (IDs 21000001-05, hueco entre Baja 45 y Media 30)
-- Idempotente: no duplica si los UUID ya existen.

INSERT INTO public.rutina (
  id, usuario_id, nombre, descripcion,
  es_plantilla, nivel, duracion_minutos, grupo_muscular, icono, orden
)
VALUES
  (
    '47000001-0000-0000-0000-000000000000',
    NULL,
    'Brazos en Polea 45',
    'Tensión constante en barra y polea para aprender a aislar bíceps y tríceps sin balancear el cuerpo. Cerramos con fondos y una plancha suave.',
    TRUE, 'Baja', 45, 'Brazos', 'arm', 0
  ),
  (
    '47000002-0000-0000-0000-000000000000',
    NULL,
    'Fundamentos con Mancuernas 45',
    'Primer contacto extendido con peso libre. Mantén los codos pegados al torso para que el hombro no robe el trabajo.',
    TRUE, 'Baja', 45, 'Brazos', 'arm', 0
  ),
  (
    '47000003-0000-0000-0000-000000000000',
    NULL,
    'Énfasis Tríceps Suave 45',
    'El tríceps es casi el 70% del brazo. Lo trabajamos en polea, francés y fondos, y rematamos con un bíceps ligero.',
    TRUE, 'Baja', 45, 'Brazos', 'arm', 0
  ),
  (
    '47000004-0000-0000-0000-000000000000',
    NULL,
    'Superseries Suaves Brazos 45',
    'Introducción al antagonista. Un ejercicio de bíceps y uno de tríceps seguidos, descansando solo al terminar la pareja.',
    TRUE, 'Baja', 45, 'Brazos', 'arm', 0
  ),
  (
    '47000005-0000-0000-0000-000000000000',
    NULL,
    'Brazos Completos y Core 45',
    'Recorrido equilibrado de flexores y extensores. Terminamos con una plancha para asentar el core sin fatigar los brazos.',
    TRUE, 'Baja', 45, 'Brazos', 'arm', 0
  ),
  (
    '21000001-0000-0000-0000-000000000000',
    NULL,
    'Piernas Máquinas 60',
    'Una hora guiada en máquinas. Cero impacto en la espalda baja y tiempo de sobra para aprender a sentir cuádriceps, isquios, glúteo y gemelo.',
    TRUE, 'Baja', 60, 'Piernas', 'leg', 0
  ),
  (
    '21000002-0000-0000-0000-000000000000',
    NULL,
    'Iniciación Glúteo e Isquios 60',
    'Cadena posterior con pesos ligeros. Prioriza la bisagra de cadera antes de sumar kilos: la técnica manda.',
    TRUE, 'Baja', 60, 'Piernas', 'leg', 0
  ),
  (
    '21000003-0000-0000-0000-000000000000',
    NULL,
    'Patrones Básicos Tren Inferior 60',
    'Sentadilla goblet más prensa para asentar el patrón de empuje, y máquinas para cerrar cuádriceps, isquios y gemelo con control.',
    TRUE, 'Baja', 60, 'Piernas', 'leg', 0
  ),
  (
    '21000004-0000-0000-0000-000000000000',
    NULL,
    'Equilibrio y Base 60',
    'Trabajo unilateral suave para detectar descompensaciones, más sentadilla y peso muerto rumano. Cargas bajas, repeticiones limpias.',
    TRUE, 'Baja', 60, 'Piernas', 'leg', 0
  ),
  (
    '21000005-0000-0000-0000-000000000000',
    NULL,
    'Piernas Completas Suave 60',
    'Recorrido completo del tren inferior: empuje, bisagra, glúteo y aislamiento. Ritmo tranquilo, RIR holgado.',
    TRUE, 'Baja', 60, 'Piernas', 'leg', 0
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rutina_ejercicio (
  rutina_id, tipo_ejercicio_id, series_objetivo, repes_min, repes_max,
  orden, rir, descanso, superset_id, registro_series
)
SELECT
  v.rutina_id, v.tipo_ejercicio_id, v.series_objetivo, v.repes_min, v.repes_max,
  v.orden, v.rir, v.descanso, v.superset_id, v.registro_series
FROM (
  VALUES
    -- Brazos en Polea 45
    ('47000001-0000-0000-0000-000000000000'::uuid, '10b8ebaa-6e2c-434d-9b73-47236e2e888f'::uuid, 3, 12, 15, 1, 3, 90, NULL::uuid, 'peso_reps'),
    ('47000001-0000-0000-0000-000000000000', '601ec6e9-86fe-407b-990f-efdb38563b18', 3, 12, 15, 2, 3, 90, NULL, 'peso_reps'),
    ('47000001-0000-0000-0000-000000000000', '23ae5b03-03df-42fb-858f-63179032613b', 3, 10, 12, 3, 2, 60, NULL, 'peso_reps'),
    ('47000001-0000-0000-0000-000000000000', 'e842fea7-9c4a-40e9-aaa3-5af1c42f4c81', 3, 10, 15, 4, 2, 60, NULL, 'peso_reps'),
    ('47000001-0000-0000-0000-000000000000', '653649c6-1d0f-4555-a72c-c9a0eacc63ec', 3, 1, 1, 5, 2, 60, NULL, 'peso_reps'),

    -- Fundamentos con Mancuernas 45
    ('47000002-0000-0000-0000-000000000000', '2db35072-604a-4460-a897-5daea114762a', 4, 10, 12, 1, 3, 90, NULL, 'peso_reps'),
    ('47000002-0000-0000-0000-000000000000', '6c65da7e-5663-410c-bda3-2b73af3b557c', 3, 10, 12, 2, 3, 90, NULL, 'peso_reps'),
    ('47000002-0000-0000-0000-000000000000', '23ae5b03-03df-42fb-858f-63179032613b', 3, 12, 15, 3, 2, 60, NULL, 'peso_reps'),
    ('47000002-0000-0000-0000-000000000000', 'e842fea7-9c4a-40e9-aaa3-5af1c42f4c81', 3, 10, 15, 4, 2, 60, NULL, 'peso_reps'),
    ('47000002-0000-0000-0000-000000000000', '55b5e593-ff46-4fdd-b9c9-a995ed77f096', 3, 15, 20, 5, 2, 60, NULL, 'peso_reps'),

    -- Énfasis Tríceps Suave 45
    ('47000003-0000-0000-0000-000000000000', '601ec6e9-86fe-407b-990f-efdb38563b18', 3, 10, 12, 1, 3, 90, NULL, 'peso_reps'),
    ('47000003-0000-0000-0000-000000000000', '6c65da7e-5663-410c-bda3-2b73af3b557c', 4, 10, 12, 2, 3, 90, NULL, 'peso_reps'),
    ('47000003-0000-0000-0000-000000000000', 'e842fea7-9c4a-40e9-aaa3-5af1c42f4c81', 3, 10, 15, 3, 2, 60, NULL, 'peso_reps'),
    ('47000003-0000-0000-0000-000000000000', '10b8ebaa-6e2c-434d-9b73-47236e2e888f', 3, 12, 15, 4, 2, 60, NULL, 'peso_reps'),
    ('47000003-0000-0000-0000-000000000000', '23ae5b03-03df-42fb-858f-63179032613b', 3, 10, 12, 5, 2, 60, NULL, 'peso_reps'),

    -- Superseries Suaves Brazos 45
    ('47000004-0000-0000-0000-000000000000', '2db35072-604a-4460-a897-5daea114762a', 3, 10, 12, 1, 3, 0, '47000004-0000-4000-8000-000000000001'::uuid, 'peso_reps'),
    ('47000004-0000-0000-0000-000000000000', '601ec6e9-86fe-407b-990f-efdb38563b18', 3, 10, 12, 2, 3, 90, '47000004-0000-4000-8000-000000000001', 'peso_reps'),
    ('47000004-0000-0000-0000-000000000000', '23ae5b03-03df-42fb-858f-63179032613b', 3, 10, 12, 3, 2, 0, '47000004-0000-4000-8000-000000000002', 'peso_reps'),
    ('47000004-0000-0000-0000-000000000000', 'e842fea7-9c4a-40e9-aaa3-5af1c42f4c81', 3, 10, 15, 4, 2, 90, '47000004-0000-4000-8000-000000000002', 'peso_reps'),
    ('47000004-0000-0000-0000-000000000000', '653649c6-1d0f-4555-a72c-c9a0eacc63ec', 3, 1, 1, 5, 2, 60, NULL, 'peso_reps'),

    -- Brazos Completos y Core 45
    ('47000005-0000-0000-0000-000000000000', '10b8ebaa-6e2c-434d-9b73-47236e2e888f', 3, 10, 12, 1, 3, 90, NULL, 'peso_reps'),
    ('47000005-0000-0000-0000-000000000000', '6c65da7e-5663-410c-bda3-2b73af3b557c', 3, 10, 12, 2, 3, 90, NULL, 'peso_reps'),
    ('47000005-0000-0000-0000-000000000000', '23ae5b03-03df-42fb-858f-63179032613b', 3, 12, 15, 3, 2, 60, NULL, 'peso_reps'),
    ('47000005-0000-0000-0000-000000000000', '601ec6e9-86fe-407b-990f-efdb38563b18', 3, 12, 15, 4, 2, 60, NULL, 'peso_reps'),
    ('47000005-0000-0000-0000-000000000000', '653649c6-1d0f-4555-a72c-c9a0eacc63ec', 3, 1, 1, 5, 2, 60, NULL, 'peso_reps'),

    -- Piernas Máquinas 60
    ('21000001-0000-0000-0000-000000000000', 'c2c74ef0-db31-44b9-87ed-ac5cc6c916da', 4, 10, 15, 1, 3, 90, NULL, 'peso_reps'),
    ('21000001-0000-0000-0000-000000000000', '0b41030a-bfd2-455f-bd90-20785a13eb7e', 3, 12, 15, 2, 2, 60, NULL, 'peso_reps'),
    ('21000001-0000-0000-0000-000000000000', 'ed4b45b5-db3b-46f9-bdf5-d83f768c8130', 3, 12, 15, 3, 2, 60, NULL, 'peso_reps'),
    ('21000001-0000-0000-0000-000000000000', 'b75c1c10-19b7-496c-bec8-4dd3bdc317ba', 3, 15, 20, 4, 2, 60, NULL, 'peso_reps'),
    ('21000001-0000-0000-0000-000000000000', '1ee56ec0-3801-4bed-84d0-40f248d8061c', 3, 15, 20, 5, 2, 60, NULL, 'peso_reps'),
    ('21000001-0000-0000-0000-000000000000', '653649c6-1d0f-4555-a72c-c9a0eacc63ec', 3, 1, 1, 6, 2, 60, NULL, 'peso_reps'),

    -- Iniciación Glúteo e Isquios 60
    ('21000002-0000-0000-0000-000000000000', 'cb6a0f24-92ef-4f86-a7fe-8dde45184ca0', 4, 10, 12, 1, 3, 90, NULL, 'peso_reps'),
    ('21000002-0000-0000-0000-000000000000', '502ee112-94b5-4279-b04d-dc92667fc4ab', 3, 10, 15, 2, 3, 90, NULL, 'peso_reps'),
    ('21000002-0000-0000-0000-000000000000', 'ed4b45b5-db3b-46f9-bdf5-d83f768c8130', 3, 12, 15, 3, 2, 60, NULL, 'peso_reps'),
    ('21000002-0000-0000-0000-000000000000', '08c505d5-f012-4b63-982f-2043b689b8c6', 3, 10, 12, 4, 3, 90, NULL, 'peso_reps'),
    ('21000002-0000-0000-0000-000000000000', '1ee56ec0-3801-4bed-84d0-40f248d8061c', 3, 15, 20, 5, 2, 60, NULL, 'peso_reps'),
    ('21000002-0000-0000-0000-000000000000', '55b5e593-ff46-4fdd-b9c9-a995ed77f096', 3, 15, 20, 6, 2, 60, NULL, 'peso_reps'),

    -- Patrones Básicos Tren Inferior 60
    ('21000003-0000-0000-0000-000000000000', '21c2b024-500f-452c-a972-d9a87e0868b7', 3, 10, 12, 1, 3, 90, NULL, 'peso_reps'),
    ('21000003-0000-0000-0000-000000000000', 'c2c74ef0-db31-44b9-87ed-ac5cc6c916da', 4, 10, 15, 2, 3, 90, NULL, 'peso_reps'),
    ('21000003-0000-0000-0000-000000000000', 'ed4b45b5-db3b-46f9-bdf5-d83f768c8130', 3, 12, 15, 3, 2, 60, NULL, 'peso_reps'),
    ('21000003-0000-0000-0000-000000000000', '0b41030a-bfd2-455f-bd90-20785a13eb7e', 3, 12, 15, 4, 2, 60, NULL, 'peso_reps'),
    ('21000003-0000-0000-0000-000000000000', '1ee56ec0-3801-4bed-84d0-40f248d8061c', 3, 15, 20, 5, 2, 60, NULL, 'peso_reps'),
    ('21000003-0000-0000-0000-000000000000', '4d6b1c7a-f945-47e6-9644-1643649146c4', 3, 12, 15, 6, 2, 60, NULL, 'peso_reps'),

    -- Equilibrio y Base 60
    ('21000004-0000-0000-0000-000000000000', '08c505d5-f012-4b63-982f-2043b689b8c6', 3, 10, 12, 1, 3, 90, NULL, 'peso_reps'),
    ('21000004-0000-0000-0000-000000000000', '21c2b024-500f-452c-a972-d9a87e0868b7', 3, 10, 12, 2, 3, 90, NULL, 'peso_reps'),
    ('21000004-0000-0000-0000-000000000000', 'cb6a0f24-92ef-4f86-a7fe-8dde45184ca0', 4, 10, 12, 3, 3, 90, NULL, 'peso_reps'),
    ('21000004-0000-0000-0000-000000000000', '0b41030a-bfd2-455f-bd90-20785a13eb7e', 3, 12, 15, 4, 2, 60, NULL, 'peso_reps'),
    ('21000004-0000-0000-0000-000000000000', '1ee56ec0-3801-4bed-84d0-40f248d8061c', 3, 15, 20, 5, 2, 60, NULL, 'peso_reps'),
    ('21000004-0000-0000-0000-000000000000', '653649c6-1d0f-4555-a72c-c9a0eacc63ec', 3, 1, 1, 6, 2, 60, NULL, 'peso_reps'),

    -- Piernas Completas Suave 60
    ('21000005-0000-0000-0000-000000000000', 'c2c74ef0-db31-44b9-87ed-ac5cc6c916da', 3, 10, 15, 1, 3, 90, NULL, 'peso_reps'),
    ('21000005-0000-0000-0000-000000000000', 'cb6a0f24-92ef-4f86-a7fe-8dde45184ca0', 3, 10, 12, 2, 3, 90, NULL, 'peso_reps'),
    ('21000005-0000-0000-0000-000000000000', '502ee112-94b5-4279-b04d-dc92667fc4ab', 3, 12, 15, 3, 3, 90, NULL, 'peso_reps'),
    ('21000005-0000-0000-0000-000000000000', '0b41030a-bfd2-455f-bd90-20785a13eb7e', 3, 12, 15, 4, 2, 60, NULL, 'peso_reps'),
    ('21000005-0000-0000-0000-000000000000', 'ed4b45b5-db3b-46f9-bdf5-d83f768c8130', 3, 12, 15, 5, 2, 60, NULL, 'peso_reps'),
    ('21000005-0000-0000-0000-000000000000', '1ee56ec0-3801-4bed-84d0-40f248d8061c', 4, 15, 20, 6, 2, 60, NULL, 'peso_reps')
) AS v(
  rutina_id, tipo_ejercicio_id, series_objetivo, repes_min, repes_max,
  orden, rir, descanso, superset_id, registro_series
)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.rutina_ejercicio re
  WHERE re.rutina_id = v.rutina_id
);
