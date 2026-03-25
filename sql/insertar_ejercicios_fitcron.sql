-- insertar_ejercicios_fitcron.sql
-- Generado por scripts/generar-sql-insert-fitcron.mjs desde sql/ejercicios.csv
--
-- Orden recomendado respecto al resto de migración FitCron:
--   0) sql/gym_normalize_tipo_nombre.sql  (función; una vez por BD)
--   1) sql/renombrar_ejercicios_fitcron.sql
--   2) sql/borrar_tipos_ejercicio_fitcron.sql
--   3) este archivo
--
-- Solo inserta si gym_normalize_tipo_nombre(nombre) no coincide con ningún
-- tipo_ejercicio existente (misma normalización que comparar-ejercicios.mjs).
-- usuario_id NULL = ejercicio de catálogo (como en tipos_ejercicios export).

begin;

-- Abdominales en V con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Abdominales en V con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33361301-Dumbbell-V-up_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Tumbado en el suelo (o colchoneta de ejercicios) sobre la espalda con los brazos estirados hacia atrás detrás de la cabeza y con las piernas extendidas.', 'Al exhalar, flexiona la cintura al mismo tiempo que elevas las piernas y los brazos para que se junten.', 'Las piernas deben estar estiradas y levantadas a un ángulo aproximado de 35-45 grados del suelo, y los brazos deben estar totalmente extendidos y paralelos a las piernas.', 'La parte superior del torso debe estar levantada.', 'Mientras inhalas, baja los brazos y las piernas de nuevo a la posición inicial.', 'Sostén una mancuerna entre las manos para mayor dificultad.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Abdominales en V con Mancuerna')
);

-- Aductor Externo Aislado en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aductor Externo Aislado en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10341301-Lever-Side-Hip-Abduction_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['De pie en la máquina con la espalda recta, ponte el rodillo en el lateral exterior de una pierna y crúzala por delante de la de apoyo.', 'Abre la pierna hacia fuera lateralmente empujando el peso.', 'Después regresa lentamente a la posición inicial, sin dejar caer el peso bruscamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aductor Externo Aislado en Máquina')
);

-- Aductor Externo en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aductor Externo en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/05971301-Lever-Seated-Hip-Abduction_Hips-FIX_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina con la espalda recta, las piernas abiertas y el exterior de los muslos en los soportes.', 'Realiza la apertura de las piernas todo lo que puedas.', 'Después regresa lentamente a la posición inicial, sin dejar caer el peso bruscamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aductor Externo en Máquina')
);

-- Aductor Externo en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aductor Externo en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/30481301-Cable-hip-abduction-version-2-male_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Ponte de pie al lado de una máquina de polea.', 'Sujeta la polea al tobillo de la pierna más alejada a la polea.', 'Apóyate con las manos para conservar el equilibrio y desde allí comienza el movimiento.', 'Sin movilizar el torso, despega la pierna que sujeta el peso del suelo y llévala desde la máquina hacia el lado opuesto, por delante de la otra pierna que está apoyada en el suelo.', 'Después regresa lentamente a la posición inicial, sin dejar caer el peso bruscamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aductor Externo en Polea')
);

-- Aductor Interno Aislado en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aductor Interno Aislado en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10351301-Lever-Side-Hip-Adduction_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['De pie en la máquina con la espalda recta, ponte el rodillo en el lateral interior de una pierna con ella abierta hacia fuera.', 'Cierra la pierna hacia dentro lateralmente empujando el peso y crúzala por delante de la de apoyo.', 'Después regresa lentamente a la posición inicial, sin dejar caer el peso bruscamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aductor Interno Aislado en Máquina')
);

-- Aductor Interno en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aductor Interno en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/05981301-Lever-Seated-Hip-Adduction_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina con la espalda recta, las piernas abiertas y el interior de los muslos en los soportes.', 'Realiza el cierre de las piernas llegando a juntar los soportes.', 'Después regresa lentamente a la posición inicial, sin dejar caer el peso bruscamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aductor Interno en Máquina')
);

-- Aductor Interno en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aductor Interno en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01681301-Cable-Hip-Adduction_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Ponte de pie al lado de una máquina de polea.', 'Sujeta la polea al tobillo de la pierna cercana a la polea.', 'Apóyate con las manos para conservar el equilibrio y desde allí comienza el movimiento.', 'Sin movilizar el torso, despega la pierna que sujeta el peso del suelo y llévala desde la máquina hacia el lado opuesto, por delante de la otra pierna que está apoyada en el suelo.', 'Después regresa lentamente a la posición inicial, sin dejar caer el peso bruscamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aductor Interno en Polea Baja')
);

-- Air Bike
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Air Bike'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/38931301-Assault-Bike-Run_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Una bicicleta de resistencia de aire es una bicicleta estacionaria con manillas donde también se aplica fuerza.', 'La resistencia es aplicada por una turbina de viento; esto causa que a mayor velocidad, mayor resistencia de la máquina.', 'Por esta razón se suele decir que un Airbike ofrece resistencia infinita.', 'Ajusta toda la bicicleta para sentarte sobre ella con una postura cómoda manteniendo la espalda recta en todo momento.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Air Bike')
);

-- Apertura Aislada Declinada con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Apertura Aislada Declinada con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12621301-Cable-One-Arm-Decline-Chest-Fly_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Polea'::text as equipment,
  ARRAY['Tumbado sobre un banco declinado cercano a una polea baja, el brazo estirado horizontalmente, agarramos la empuñadura de forma natural (palma de la mano hacia arriba).', 'El movimiento consiste en realizar el cierre con el brazo estirado hacia el centro del pecho.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.', 'La otra mano la podemos colocar bajo el banco o agarrando un lateral del mismo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Apertura Aislada Declinada con Polea')
);

-- Apertura Aislada en Punta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Apertura Aislada en Punta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/39231301-Landmine-Floor-One-Arm-Chest-Fly_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Tumbado hacia arriba en el suelo, el brazo estirado horizontalmente, agarramos el extremo de la barra en punta de forma natural (palma de la mano hacia arriba).', 'El movimiento consiste en realizar el cierre con el brazo hacia el centro del pecho, ligeramente flexionado (casi estirado).', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.', 'La otra mano la podemos colocar al otro lado del cuerpo o como nos resulte más cómodo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Apertura Aislada en Punta')
);

-- Aperturas con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aperturas con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/37571301-Band-high-fly-male_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Asegura la banda elástica a una altura elevada detrás de ti y sujeta una agarradera con tu mano cerca de tu hombro, con la palma apuntando hacia abajo.', 'Empuja la agarradera en forma recta hacia adelante y hacia abajo, hasta que tu brazo esté extendido, y regresa lentamente luego de una breve pausa.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aperturas con Bandas')
);

-- Aperturas con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aperturas con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/03081301-Dumbbell-Fly_Chest-FIX_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Túmbate boca arriba sobre el banco.', 'Coge las mancuernas con las dos manos, teniendo en cuenta que las palmas deben mirar hacia el centro del cuerpo y manteniendo los brazos un poco flexionados en vertical al cuerpo.', 'Desciende los brazos a los lados hasta bajar con las manos a la altura de los hombros.', 'Los codos tienen que estar alineados entre sí, perpendiculares al cuerpo y paralelos al suelo.', 'En el momento que espiras, regresa al centro del cuerpo sin extender los brazos ni flexionar los codos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aperturas con Mancuernas')
);

-- Aperturas Declinadas con giro con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aperturas Declinadas con giro con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/03071301-Dumbbell-Decline-Twist-Fly_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Túmbate boca arriba sobre el banco declinado.', 'Coge las mancuernas con las dos manos, teniendo en cuenta que las palmas deben mirar hacia la cabeza (supinación) y manteniendo los brazos un poco flexionados en vertical al cuerpo.', 'Desciende los brazos a los lados hasta bajar con las manos a la altura de los hombros, girando las mismas de forma que queden con las palmas hacia el cuerpo.', 'Los codos tienen que estar alineados entre sí, perpendiculares al cuerpo y paralelos al suelo.', 'En el momento que espiras, regresa al centro del cuerpo sin extender los brazos ni flexionar los codos, girando de nuevo a supinación.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aperturas Declinadas con giro con Mancuernas')
);

-- Aperturas Declinadas con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aperturas Declinadas con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/03021301-Dumbbell-Decline-Fly_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate boca arriba sobre el banco declinado.', 'Coge las mancuernas con las dos manos, teniendo en cuenta que las palmas deben mirar hacia el centro del cuerpo y manteniendo los brazos un poco flexionados en vertical al cuerpo.', 'Desciende los brazos a los lados hasta bajar con las manos a la altura de los hombros.', 'Los codos tienen que estar alineados entre sí, perpendiculares al cuerpo y paralelos al suelo.', 'En el momento que espiras, regresa al centro del cuerpo sin extender los brazos ni flexionar los codos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aperturas Declinadas con Mancuernas')
);

-- Aperturas en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aperturas en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/10301301-Lever-Pec-Deck-Fly_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentados con la espalda bien apoyada y recta, abrimos los brazos a los lados, flexionados 90° hacia arriba y agarramos las barras de la máquina con las palmas hacia delante.', 'A continuación realizamos el cierre efectuando la fuerza desde los codos, hasta llegar al centro del pecho.', 'Después retrocedemos de forma controlada sin llegar a perder la tensión (no llegar al final para descansar).']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aperturas en Máquina')
);

-- Aperturas Extendidas en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aperturas Extendidas en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/05961301-Lever-Seated-Fly_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentados con la espalda bien apoyada y recta, extendemos bien los brazos a los lados y agarramos las barras de la máquina con agarre neutro (palmas mirándose entre sí).', 'A continuación realizamos el cierre manteniendo los brazos extendidos hasta llegar a tocarse ambas manos.', 'Después retrocedemos de forma controlada sin llegar a perder la tensión (no llegar al final para descansar).']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aperturas Extendidas en Máquina')
);

-- Aperturas Inclinadas con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aperturas Inclinadas con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/03191301-Dumbbell-Incline-Fly_Chest-FIX_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate boca arriba sobre el banco inclinado (no demasiado inclinado, si no tiraremos más de hombro).', 'Coge las mancuernas con las dos manos, teniendo en cuenta que las palmas deben mirar hacia el centro del cuerpo y manteniendo los brazos un poco flexionados en vertical al cuerpo.', 'Desciende los brazos a los lados hasta bajar con las manos a la altura de los hombros.', 'Los codos tienen que estar alineados entre sí, perpendiculares al cuerpo y paralelos al suelo.', 'En el momento que espiras, regresa al centro del cuerpo sin extender los brazos ni flexionar los codos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aperturas Inclinadas con Mancuernas')
);

-- Aperturas Traseras en Pronación en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aperturas Traseras en Pronación en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/06021301-Lever-Seated-Reverse-Fly_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Con la espalda recta coge un agarre con cada mano en pronación y sin balanceo ni impulso, lleva los soportes hacia los lados con los brazos rectos.', 'Aprieta los hombros y aguanta durante uno o dos segundos.', 'Retrocede de forma controlada a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aperturas Traseras en Pronación en Máquina')
);

-- Aperturas Traseras Neutras en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Aperturas Traseras Neutras en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/06011301-Lever-Seated-Reverse-Fly-parallel-grip_shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Con la espalda recta coge un agarre con cada mano neutro (palmas hacia el interior) y sin balanceo ni impulso, lleva los soportes hacia los lados con los brazos rectos.', 'Aprieta los hombros y aguanta durante uno o dos segundos.', 'Retrocede de forma controlada a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Aperturas Traseras Neutras en Máquina')
);

-- Bicicleta Estática Deportiva
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Bicicleta Estática Deportiva'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/21381301-Stationary-Bike-Run-version-3_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['La espalda inclinada en posición deportiva permite liberar un máximo de potencia para el pedaleo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Bicicleta Estática Deportiva')
);

-- Bicicleta Estática Normal
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Bicicleta Estática Normal'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/22791301-Stationary-Bike-Run-version-4_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['-Espalda recta para un confort máximo (especialmente aconsejado en caso de dolores lumbares) -Espalda ligeramente inclinada, para una buena relación confort / potencia de pedaleo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Bicicleta Estática Normal')
);

-- Bicicleta Estática Reclinada
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Bicicleta Estática Reclinada'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/21931301-Bicycle-Recline-Walk_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['En una bicicleta reclinada u horizontal el cuerpo se encuentra más cerca del suelo.', 'Esta clase de bicicletas cuentan con un asiento que envuelve la zona lumbar del usuario y unos pedales situados enfrente del mismo, lo que conlleva que la acción de pedalear se realice en círculos más abiertos y hacia afuera.', 'Las bicicletas reclinadas son perfectas para personas de edad avanzada o con problemas de espalda, ya que el asiento permite descansar la espalda y no ejercer presión sobre esta zona.', 'Por otra parte, no son recomendables para personas con lesiones en la rodilla al estar la fuerza más concentrada en las piernas.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Bicicleta Estática Reclinada')
);

-- Brazada en Fitball
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Brazada en Fitball'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Oblicuos, Tríceps, Dorsal, Lumbar. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13321301-Exercise-Ball-Alternating-Arm-Ups_Back_720.gif'::text as gif_url,
  ARRAY['Oblicuos', 'Tríceps', 'Dorsal', 'Lumbar']::text[] as musculos_involucrados,
  'Fitball'::text as equipment,
  ARRAY['Trabajarás las lumbares y los músculos de la espalda simplemente realizando el gesto de la brazada con el abdomen situado en el fitball y los pies en el suelo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Brazada en Fitball')
);

-- Buenos días con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Buenos días con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00441301-Barbell-Good-Morning_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['Colócate de pie con las piernas separadas a la anchura algo menor a la de los hombros.', 'Así, coge una barra tras la cabeza, exactamente bajo la zona de los trapecios.', 'Baja el tronco hacia adelante, siempre manteniendo la espalda en una posición erecta.', 'Al llegar al punto máximo, tu torso debe encontrarse casi paralelo al piso, todo ello sin que la espalda pierda su posición inicial y, eso sí, doblando ligeramente las rodillas y sacando los glúteos.', 'Puedes mantener la posición final por uno o dos segundos, en donde sentirás cómo se tensa tu abdomen.', 'Una vez hecho esto, regresa a la posición de inicio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Buenos días con Barra')
);

-- Burpee
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Burpee'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/11601301-Burpee_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Para realizar el ejercicio de se parte de una posición inicial en cuclillas (o sentadillas), se colocan las manos en el suelo y se mantiene la cabeza erguida.', 'Después se desplazan las piernas hacia atrás con los pies juntos.', 'A continuación se recogen las piernas para volver y se da un salto vertical con los brazos en alto (se puede dar una palmada por encima de la cabeza).', 'Después vuelve a la posición de cuclillas para repetir el ejercicio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Burpee')
);

-- Burpee con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Burpee con Mancuernas'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12011301-Dumbbell-burpee_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sostén una mancuerna en cada mano, ponte de pie con los pies separados a la anchura de los hombros.', 'Agáchate y coloca las mancuernas sobre el piso antes de patear con fuerza hacia atrás y ponerte en la posición de flexión o lagartija.', 'Rápidamente empuja las piernas con fuerza para regresar a la posición más baja de sentadilla y con impulso salta levantando las mancuernas tan alto como pueda antes de regresar a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Burpee con Mancuernas')
);

-- Burpee Jack
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Burpee Jack'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/05011301-Jack-Burpee_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Para empezar, nos colocaremos de pie, con las piernas a la anchura de los hombros.', 'Sin mover los pies, colocaremos las manos en el suelo delante de nuestra cabeza.', 'De un salto, deberemos extender las piernas para quedar en una posición de plancha.', 'En esta posición, tendremos que dar otro salto para separar las piernas, y de nuevo otro salto con el fin de volver a juntarlas.', 'Posteriormente, volviendo a saltar, tendremos que flexionar las piernas hasta la posición inicial.', 'Nos levantaremos por completo y deberemos aprovechar el impulso para dar un salto que nos haga despegar del suelo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Burpee Jack')
);

-- Butt Kicks
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Butt Kicks'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/30371301-Butt-Kicks-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Se trata de correr sin moverte del sitio donde te encuentres, flexionando las rodillas hacia atrás lo máximo posible tratando de tocar el glúteo con el talón.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Butt Kicks')
);

-- Caminar
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Caminar'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/22581301-Walking_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Andar con normalidad.', 'Puede ser un paseo por el exterior o caminar tranquilamente sobre una cinta.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Caminar')
);

-- Caminar a paso ligero
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Caminar a paso ligero'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/30041301-Briskly-Walking_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['El paso ligero es aquel que cubre aproximadamente 4,3 kilómetros por hora.', 'Dicho de otra manera, unas 100 zancadas por minuto (es decir, casi dos por segundo).']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Caminar a paso ligero')
);

-- Caminar con peso
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Caminar con peso'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/21331301-Farmers-walk_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Andar con normalidad mientras sostenemos una mancuerna a cada mano (puede ser otro tipo de material que pese).', 'Puede ser un paseo libre o caminar sobre una cinta.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Caminar con peso')
);

-- Caminar con rodilla arriba
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Caminar con rodilla arriba'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36551301-Walking-High-Knees-Lunge_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['De pie, con una rodilla arriba flexionada a 90º y el brazo opuesto del mismo modo, da un paso hacia delante manteniendo el ángulo de la rodilla flexionada descendiendo con la otra pierna a modo de zancada.', 'Impúlsate con la pierna adelantada y sigue caminando alternando la pierna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Caminar con rodilla arriba')
);

-- Caminar en cuclillas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Caminar en cuclillas'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/38671301-Duck-Walk-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Ponerse en cuclillas puede aliviar el dolor persistente, prevenir lesiones y ayudar a lograr metas de tu estado físico.', 'Separa tus pies a la altura de la cadera con los dedos de los pies hacia adelante.', 'Ahora, en cuclillas, baja lo más que puedas y comienza a andar sin levantarte.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Caminar en cuclillas')
);

-- Carrera con salto
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Carrera con salto'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36371301-Wheel-Run_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Consiste en correr realizando saltos longitudinales alargando la zancada lo máximo posible.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Carrera con salto')
);

-- Carrera continua
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Carrera continua'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/06851301-Run_Cardio-FIX_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Se trata de correr al libremente de forma natural, a un ritmo adecuado, con intervalos de alta y baja intensidad o a un ritmo constante si se prefiere.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Carrera continua')
);

-- Carrera de pasos cortos
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Carrera de pasos cortos'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36561301-Short-Stride-Run_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Carrera continua con pasos cortos y flexión mínima de rodillas.', 'Adelanta ligeramente el brazo inverso a cada rodilla.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Carrera de pasos cortos')
);

-- Carrera de skater
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Carrera de skater'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/31091301-Skater-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Con una pierna hacia delante y otra hacia atrás, flexionadas a modo de zancada, inclina el cuerpo hacia delante con ambos codos flexionados y con el torso girado hacia el lado de la pierna adelantada.', 'Comienza a caminar adelantando la otra pierna e invirtiendo la posición.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Carrera de skater')
);

-- Carrera en Cinta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Carrera en Cinta'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/06841301-Run-equipment_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Una cinta de correr, cinta ergométrica, caminadora de banda o máquina de caminar es una máquina para entrenamiento físico que puede funcionar mediante propulsión eléctrica o manual, y que sirve para correr o andar sin moverse de un mismo sitio.', 'Colócate sobre la cinta y realiza algún programa de la misma o regula la intensidad ajustándola a tus necesidades.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Carrera en Cinta')
);

-- Carrera en Cinta Inclinada
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Carrera en Cinta Inclinada'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36661301-Walking-on-Incline-Treadmill_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Una cinta de correr, cinta ergométrica, caminadora de banda o máquina de caminar es una máquina para entrenamiento físico que puede funcionar mediante propulsión eléctrica o manual, y que sirve para correr o andar sin moverse de un mismo sitio.', 'Ajusta la inclinación de la cinta, colócate sobre ella y realiza algún programa de la misma o regula la intensidad ajustándola a tus necesidades.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Carrera en Cinta Inclinada')
);

-- Carrera en zigzag
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Carrera en zigzag'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/31981301-ZigZag-Hopes_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Seguir un patrón de zigzag imaginario (se pueden colocar conos u otros objetos) y ejecutar una zancada larga hacia afuera con el pie derecho, luego seguir inmediatamente con una zancada larga al lado contrario con el pie izquierdo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Carrera en zigzag')
);

-- Carrera hacia atrás
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Carrera hacia atrás'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/42581301-Backwards-Run_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Correr hacia atrás ofrece al atleta un entrenamiento cardiovascular intenso, reduce el riesgo de lesiones en la espalda y en las piernas, ayuda a conseguir un tren inferior más fuerte y equilibrado, y se trata de una alternativa perfecta para perder peso de forma más rápida.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Carrera hacia atrás')
);

-- Carrera rápida en el sitio
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Carrera rápida en el sitio'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/35891301-Quickly-Trot-in-place_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['De pie, con los codos flexionados en un ángulo de 90 grados y los pies separados a la anchura de las caderas.', 'Mueve el codo derecho hacia delante al mismo tiempo que subes la rodilla izquierda.', 'Repite en el lado opuesto y mantén los lados alternados.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Carrera rápida en el sitio')
);

-- Cocoons
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Cocoons'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/02601301-Cocoons_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba con los brazos extendidos a lo largo del cuerpo y las palmas hacia abajo.', 'Levanta las piernas y el torso del suelo al mismo tiempo, manteniendo los brazos rectos y extendidos hacia adelante.', 'A continuación, lleva las rodillas hacia el pecho mientras te enrollas hacia adelante, tocando tus rodillas con la barbilla y adoptando una postura como si te sujetases las piernas por las tibias.', 'Mantén la contracción en los músculos abdominales y luego extiende lentamente las piernas y el torso de nuevo hacia la posición inicial.', 'Este ejercicio trabaja los músculos abdominales superiores e inferiores, así como los flexores de la cadera, ayudando a fortalecer y tonificar el área del núcleo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Cocoons')
);

-- Cruce completo de Poleas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Cruce completo de Poleas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/02271301-Cable-Standing-Fly_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con una polea a cada lado del cuerpo, por encima de la cabeza, cogemos las empuñaduras con la palma hacia el frente, con las piernas separadas.', 'Realiza el cierre de ambos brazos, de arriba a abajo sin flexionarlos, de forma que queden delante del cuerpo por debajo de la cadera, sin necesidad de tocar ambas manos, y regresa lentamente luego de una breve pausa.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Cruce completo de Poleas')
);

-- Cruce de Poleas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Cruce de Poleas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/01881301-Cable-Middle-Fly_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con una polea a cada lado del cuerpo, a la altura del pecho, cogemos las empuñaduras con la palma hacia el frente, con un pie delante del otro para tener estabilidad.', 'Realiza el cierre de ambos brazos sin flexionarlos de forma que queden delante del pecho, llegando a tocarse las manos, y regresa lentamente luego de una breve pausa.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Cruce de Poleas')
);

-- Cruce inferior de Poleas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Cruce inferior de Poleas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12691301-Cable-Standing-Up-Straight-Crossovers_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con una polea a cada lado del cuerpo, a la altura del pecho, cogemos las empuñaduras con la palma hacia el frente, con un pie delante del otro para tener estabilidad.', 'Realiza el cierre de ambos brazos sin flexionarlos de forma que queden delante del pecho a la altura de la cadera, llegando a tocarse las manos, y regresa lentamente luego de una breve pausa.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Cruce inferior de Poleas')
);

-- Cruce superior de Poleas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Cruce superior de Poleas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12701301-Cable-Upper-Chest-Crossovers_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con una polea a cada lado del cuerpo, a la altura del pecho, cogemos las empuñaduras con la palma hacia el frente, con un pie delante del otro para tener estabilidad.', 'Realiza el cierre de ambos brazos sin flexionarlos de forma que queden delante del pecho sobre la cabeza, llegando a tocarse las manos, y regresa lentamente luego de una breve pausa.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Cruce superior de Poleas')
);

-- Cruces en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Cruces en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/33441301-Lever-Crossovers_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentados en la máquina con la espalda recta, ponemos las manos en pronación (palmas hacia el suelo) y los codos bien arriba, a la altura de los hombros.', 'Empujamos hacia abajo para cerrar los brazos (sin bajar los codos por debajo de las manos) hasta prácticamente juntar las manos y volvemos a la posición inicial con un movimiento controlado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Cruces en Máquina')
);

-- Crunch Cruzado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Cruzado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/02621301-Cross-Body-Crunch_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba con las rodillas dobladas y los pies apoyados en el suelo.', 'Coloca las manos detrás de la cabeza, sin entrelazar los dedos.', 'Levanta los hombros del suelo mientras contraes los abdominales.', 'A medida que subes, gira el torso y lleva el codo derecho hacia la rodilla izquierda, levantando también esa pierna del suelo para acortar el recorrido.', 'Intenta tocar la rodilla con el codo mientras mantienes la parte baja de la espalda en contacto con el suelo.', 'Regresa a la posición inicial y repite del otro lado, llevando el codo izquierdo hacia la rodilla derecha.', 'Alterna los lados en cada repetición.', 'Este ejercicio trabaja los músculos oblicuos y abdominales']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Cruzado')
);

-- Crunch Cruzado con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Cruzado con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09721301-Band-bicycle-crunch_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Agarra una banda a cada pie y a su vez a algún soporte a la misma altura.', 'Túmbate en el suelo boca arriba.', 'Coloca las manos tras la nuca, levanta una pierna del suelo y estírala, después levanta la otra pierna y dobla la rodilla hacia el pecho.', 'Toca con el codo la rodilla contraria y asegúrate de que giras el torso con los abdominales.', 'Cambia de lado y cuenta una repetición cuando la rodilla y el codo se toquen.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Cruzado con Bandas')
);

-- Crunch Cruzado con piernas elevadas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Cruzado con piernas elevadas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/00031301-air-bike-m_waist_FIX_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba con las rodillas dobladas y los cuádriceps a 90 grados del torso, manteniendo los pies en el aire y las manos detrás de la cabeza.', 'Levanta los hombros del suelo mientras contraes los abdominales.', 'A medida que subes, gira el torso y lleva el codo derecho hacia la rodilla izquierda, acercando esa rodilla pero manteniendo la otra pierna también elevada.', 'Intenta tocar la rodilla con el codo mientras mantienes la parte baja de la espalda en contacto con el suelo.', 'Regresa a la posición inicial y repite del otro lado, llevando el codo izquierdo hacia la rodilla derecha.', 'Alterna los lados en cada repetición.', 'Este ejercicio trabaja intensamente los músculos oblicuos y abdominales al desafiar la estabilidad y fuerza del núcleo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Cruzado con piernas elevadas')
);

-- Crunch Cruzado estirado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Cruzado estirado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Cuádriceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/43311301-Crunch-Single-Leg-Lift_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Cuádriceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba con las piernas rectas y los pies apoyados en el suelo.', 'Coloca las manos detrás de la cabeza.', 'Levanta los hombros del suelo mientras contraes los abdominales.', 'Al mismo tiempo, levanta ligeramente una pierna mientras mantienes la parte baja de la espalda en contacto con el suelo.', 'Regresa a la posición inicial y repite, alternando la pierna en cada repetición.', 'Este ejercicio trabaja los músculos oblicuos y abdominales']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Cruzado estirado')
);

-- Crunch Diagonal de pie con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Diagonal de pie con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10071301-Band-standing-twisting-crunch_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Agarra las bandas de un soporte alto.', 'Ponte de pie de espaldas a ellas.', 'Agarra un extremo con cada mano a los lados de la cabeza, con los brazos por delante flexionados hacia arriba.', 'Inclina el torso ligeramente hacia delante con la espalda recta.', 'Realiza el encogimiento hacia un lado, apretando el abdomen sin mover las piernas.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Diagonal de pie con Bandas')
);

-- Crunch Diagonal de rodillas con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Diagonal de rodillas con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09851301-Band-Kneeling-Twisting-Crunch_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Agarra las bandas de un soporte alto.', 'Ponte de rodillas de espaldas a ellas.', 'Agarra un extremo con cada mano a los lados de la cabeza, con los brazos por delante flexionados hacia arriba.', 'Inclina el torso ligeramente hacia delante con la espalda recta.', 'Realiza el encogimiento hacia un lado, apretando el abdomen.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Diagonal de rodillas con Bandas')
);

-- Crunch Diagonal en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Diagonal en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01741301-Cable-Judo-Flip_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas a la anchura aproximada de la cadera, ponte delante de la polea alta.', 'Coge la cuerda con las dos manos a un lado de la cabeza, con los brazos flexionados hacia arriba.', 'Flexiona el tronco lateralmente hacia abajo del lado contrario al de las manos, girando el torso y sin mover los brazos, apretando el abdomen.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Diagonal en Polea')
);

-- Crunch Doble Vertical en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Doble Vertical en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/18571301-Lever-Total-Abdominal-Crunch_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina con las manos en el soporte superior y los pies tras el soporte inferior, encoge la parte alta del torso a la vez que la parte baja, mediante la contracción de los abdominales, sin tirar del cuello, brazos ni piernas.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Doble Vertical en Máquina')
);

-- Crunch en Decúbito Lateral con curl de bíceps
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch en Decúbito Lateral con curl de bíceps'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/17691301-Bodyweight-Side-Lying-Biceps-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Bíceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate de lado en el suelo con las piernas flexionadas y el cuerpo alineado en línea recta.', 'Coloca ambos brazos por fuera de las rodillas.', 'Contrae los músculos abdominales y de los oblicuos mientras levantas las piernas del suelo con ayuda del bíceps del brazo apoyado, al mismo tiempo que realizas una flexión lateral del torso hacia las piernas.', 'Mantén la posición superior durante un momento y luego baja el torso y las piernas de forma controlada hasta volver a la posición inicial.', 'Este ejercicio trabaja los músculos del bíceps y los oblicuos, proporcionando un entrenamiento efectivo para los brazos y el core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch en Decúbito Lateral con curl de bíceps')
);

-- Crunch en Plancha Lateral
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch en Plancha Lateral'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/35031301-Elbow-to-Knee-Side-Plank-Crunch-male_Wiast_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Túmbate de lado en el suelo.', 'Apoya un antebrazo con el codo bajo el hombro y la otra mano tras la cabeza, pon los pies juntos y luego eleva la cadera apoyando sólo el pie de abajo y el antebrazo, con las piernas rectas en línea con el torso.', 'Manteniendo esa posición, eleva la rodilla mientras desciendes el codo de la mano tras la cabeza, intentando tocarse entre ambos.', 'Vuelve a la posición inicial y repite.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch en Plancha Lateral')
);

-- Crunch Frog
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Frog'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Cuádriceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/35101301-Crunchy-Frog-on-Floor_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Cuádriceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Sentado en el suelo con las rodillas dobladas y los pies apoyados en el suelo, mantén los talones juntos y cerca de los glúteos.', 'Mantén los brazos extendidos hacia delante, con las manos justo por delante de las rodillas.', 'Inclínate ligeramente hacia atrás para activar los abdominales y levanta los pies del suelo, manteniendo las rodillas dobladas.', 'A continuación, estira las piernas hacia adelante, separándolas y llevando los brazos hacia los lados del cuerpo.', 'Vuelve a la posición inicial, llevando las rodillas hacia el pecho y los brazos hacia adelante, justo por delante de las rodillas.', 'Repite el movimiento de forma fluida y controlada, manteniendo la tensión en los abdominales en todo momento.', 'Este ejercicio trabaja los músculos abdominales y puede ayudar a mejorar la fuerza y resistencia del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Frog')
);

-- Crunch Horizontal en Silla Romana
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Horizontal en Silla Romana'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/33291301-Roman-Chair-Sit-Up_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colócate en la silla romana con los pies asegurados y las piernas estiradas.', 'Cruza los brazos sobre el pecho o colócalos detrás de la cabeza para mayor resistencia.', 'Desciende lentamente hacia atrás hasta que tu torso esté casi paralelo al suelo, y luego utiliza los músculos abdominales para levantar el torso hacia adelante hasta una posición vertical.', 'Mantén el control del movimiento y evita balancearte hacia adelante y hacia atrás.', 'Repite el movimiento durante el número deseado de repeticiones.', 'Este ejercicio fortalece los músculos abdominales superiores y puede aumentar la fuerza y resistencia del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Horizontal en Silla Romana')
);

-- Crunch Inferior con flexión y extensión
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Inferior con flexión y extensión'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Cuádriceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/43301301-Reverse-Crunch-Kick_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Cuádriceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Siéntate con las palmas apoyadas en el suelo a ambos lados del cuerpo.', 'Mantén las piernas estiradas y los pies juntos, echando el cuerpo ligeramente hacia atrás.', 'Contrae los músculos abdominales y glúteos mientras flexionas las rodillas hasta que tus muslos estén cerca de tu abdomen.', 'A continuación estira las piernas hacia arriba, formando una V con tu cuerpo.', 'Baja las piernas de nuevo a la posición inicial y repite el movimiento.', 'Este ejercicio es excelente para fortalecer los músculos abdominales inferiores y mejorar la estabilidad del núcleo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Inferior con flexión y extensión')
);

-- Crunch Inferior con Rodillas Flexionadas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Inferior con Rodillas Flexionadas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/01381301-Bottoms-Up-m_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba con los brazos extendidos a los lados del cuerpo y las palmas hacia abajo.', 'Mantén las piernas estiradas y los pies juntos.', 'Contrae los músculos abdominales y glúteos mientras levantas lentamente las piernas hacia arriba, flexionando las rodillas hasta que tus muslos estén a 90 grados del torso.', 'Asegúrate de mantener la parte baja de la espalda en contacto con el suelo en todo momento para evitar arquearla.', 'Este ejercicio es excelente para fortalecer los músculos abdominales inferiores y mejorar la estabilidad del núcleo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Inferior con Rodillas Flexionadas')
);

-- Crunch Inferior Cruzado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Inferior Cruzado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/41561301-Lying-Leg-Hip-Side-Raise-on-Floor_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate en el suelo con las piernas extendidas y las manos bajo los glúteos para mayor estabilidad.', 'Contrae los músculos abdominales y flexiona lentamente las piernas mientras las elevas del suelo.', 'Según vayas subiendo, gira el abdomen hacia un lado mientras levantas la cadera.', 'Mantén la posición durante un momento y luego baja las piernas y las caderas de manera controlada hacia el suelo.', 'Repite el movimiento durante el número deseado de repeticiones cambiando de lado en cada subida.', 'Este ejercicio fortalece los músculos abductores de la cadera y puede ayudar a mejorar la estabilidad y el equilibrio del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Inferior Cruzado')
);

-- Crunch Inferior Cruzado Alterno
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Inferior Cruzado Alterno'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/04431301-Elbow-to-Knee_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno, Banco Plano'::text as equipment,
  ARRAY['Acuéstate boca arriba con las piernas estiradas, manteniendo las manos detrás de la cabeza.', 'Levanta una pierna flexionándola hasta llevar la rodilla casi a la altura del pecho, intentando tocar el codo opuesto mientras levantas los hombros girando el torso.', 'Mantén la parte baja de la espalda en contacto con el suelo en todo momento.', 'Regresa a la posición inicial y repite del otro lado, llevando la otra rodilla flexionada hacia el codo opuesto.', 'Alterna los lados en cada repetición.', 'Este ejercicio se centra en los músculos abdominales inferiores y oblicuos, mejorando la fuerza y la estabilidad del núcleo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Inferior Cruzado Alterno')
);

-- Crunch Inferior en círculos
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Inferior en círculos'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Cuádriceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/43331301-Bench-Reverse-Crunch-Circle_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Cuádriceps']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Desde una posición sentada en un banco con el cuerpo perpendicular al asiento y las piernas extendidas frente a ti, apoya las manos en el banco a los lados de tus caderas.', 'Levanta las piernas rectas mientras las abres al ponerlas paralelas al suelo.', 'Contrae los abdominales y eleva las piernas todo lo que puedas mientras las cierras de nuevo.', 'Mantén la posición y desciende invirtiendo el movimiento, con el descenso controlado.', 'Este ejercicio fortalece los músculos abdominales inferiores y contribuye a mejorar la estabilidad del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Inferior en círculos')
);

-- Crunch Inferior en Máquina Smith
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Inferior en Máquina Smith'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/07561301-Smith-Hip-Raise_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Túmbate hacia arriba en el suelo bajo una máquina Smith.', 'Estira las piernas hacia arriba y pon el centro de los pies en la barra, ligeramente separados.', 'Eleva la cadera mediante la contracción abdominal inferior, levantando la barra.', 'Baja lentamente y sube de nuevo sin flexionar las piernas.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Inferior en Máquina Smith')
);

-- Crunch Inferior en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Inferior en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/08731301-Cable-Reverse-Crunch_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Tumbado hacia arriba en el suelo, con la espalda recta y brazos apoyados, agarra las correas de la polea baja en los pies.', 'A continuación levanta las piernas totalmente rectas hacia arriba y flexiona las rodillas 90º.', 'Esa es la posición inicial.', 'Desde ahí y con las rodillas flexionadas, realiza el encogimiento del abdomen inferior, apretando y levantando los glúteos del suelo.', 'Desciende lentamente y vuelve a subir.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Inferior en Polea')
);

-- Crunch Inferior Horizontal en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Inferior Horizontal en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/18561301-Lever-Lying-Leg-Raise-Bent-Knee_Hips_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Tumbado hacia arriba en el banco de la máquina con el soporte sobre los cuádriceps y con las piernas ligeramente flexionadas, encoge la parte baja del torso levantando las piernas mediante la contracción de los abdominales inferiores.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Inferior Horizontal en Máquina')
);

-- Crunch Inferior Inclinado con piernas estiradas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Inferior Inclinado con piernas estiradas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/04911301-Incline-Leg-Hip-Raise-leg-straight_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Banco Inclinable'::text as equipment,
  ARRAY['Siéntate en un banco inclinado con la parte superior de la espalda apoyada en el banco y las manos sujetas en los bordes para estabilizarte.', 'Extiende las piernas hacia adelante y colócalas juntas, manteniendo los pies apoyados en el suelo o colgando del banco.', 'Desde esta posición, contrae los músculos de los abdominales inferiores, glúteos y los isquiotibiales para levantar las caderas hacia arriba, manteniendo las piernas rectas.', 'Alcanza la posición más alta posible y luego baja las caderas de manera controlada hasta que vuelvan a tocar ligeramente el banco/suelo.', 'Este ejercicio se enfoca en los músculos abdominales, ayudando a fortalecer el core inferior y mejorar la estabilidad de la cadera.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Inferior Inclinado con piernas estiradas')
);

-- Crunch Inferior sentado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Inferior sentado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Cuádriceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/35091301-Seated-In-Out-Leg-Raise-on-Floor_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Cuádriceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Siéntate en el suelo con las piernas extendidas frente a ti y las manos a ambos lados de las caderas.', 'Inclina el torso hacia atrás y contrae los abdominales.', 'Encoge las piernas mientras inclinas un poco el tronco hacia delante.', 'Mantén la posición por un momento y luego baja las piernas de manera controlada.', 'Repite el movimiento durante el número deseado de repeticiones.', 'Este ejercicio trabaja los músculos abdominales inferiores y ayuda a fortalecer el core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Inferior sentado')
);

-- Crunch Inferior sentado en banco
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Inferior sentado en banco'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/06891301-Seated-Leg-Raise_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Siéntate en el borde de un banco, con las piernas extendidas frente a ti y las manos agarrando el banco, a ambos lados de las caderas.', 'Inclina el torso hacia atrás y contrae los abdominales.', 'Levanta lentamente las piernas, con una ligera flexión, lo más alto que puedas sin arquear la espalda mientras inclinas un poco el tronco hacia delante.', 'Mantén la posición por un momento y luego baja las piernas de manera controlada.', 'Repite el movimiento durante el número deseado de repeticiones.', 'Este ejercicio trabaja los músculos abdominales inferiores y ayuda a fortalecer el core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Inferior sentado en banco')
);

-- Crunch Lateral con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Lateral con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00961301-Barbell-Side-Bent-II_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas a la anchura aproximada de la cadera, sujeta una barra sobre el trapecio.', 'Flexiona el tronco lateralmente, sin inclinarte hacia delante ni hacia atrás.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Lateral con Barra')
);

-- Crunch Lateral con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Lateral con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04071301-Dumbbell-Side-Bend_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas a la anchura aproximada de la cadera, sujeta la mancuerna con una mano.', 'Flexiona el tronco lateralmente, sin inclinarte hacia delante ni hacia atrás.', 'Baja la mancuerna, sin hacer fuerza con el brazo, deja el peso "muerto".', 'Vuelve a la posición inicial sin movimientos bruscos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Lateral con Mancuerna')
);

-- Crunch Lateral de pie con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Lateral de pie con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/38411301-Band-side-bend-male_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie situado al lado de una banda en algún soporte a la altura de los pies, coge el agarre con una mano con el brazo extendido al lado del cuerpo.', 'Encoge el torso lateralmente hacia el lado de la banda.', 'A continuación inclínate hacia el lado opuesto mediante la contracción de los abdominales oblicuos, sin tirar del brazo.', 'Al terminar la serie cambia de lado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Lateral de pie con Banda')
);

-- Crunch Lateral de pie en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Lateral de pie en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02231301-Cable-Side-Crunch_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie situado al lado de la polea alta, coge el agarre con una mano y ponla a la altura de la cabeza, con el brazo flexionado hacia arriba al lado del cuerpo.', 'Encoge el torso lateralmente hacia el lado de la polea mediante la contracción de los abdominales oblicuos, sin tirar del brazo.', 'Al terminar la serie cambia de lado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Lateral de pie en Polea Alta')
);

-- Crunch Lateral de pie en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Lateral de pie en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02221301-Cable-Side-Bend_Waist-FIX_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie situado al lado de la polea baja, coge el agarre con una mano con el brazo extendido al lado del cuerpo.', 'Encoge el torso lateralmente hacia el lado de la polea.', 'A continuación inclínate hacia el lado opuesto mediante la contracción de los abdominales oblicuos, sin tirar del brazo.', 'Al terminar la serie cambia de lado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Lateral de pie en Polea Baja')
);

-- Crunch Lateral en soporte
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Lateral en soporte'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/07091301-Side-Hip-on-parallel-bars_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Apoya la espalda y los antebrazos en el soporte, con las manos agarradas.', 'Flexiona las rodillas 90º con las piernas hacia delante.', 'Encoge la cadera lateralmente hacia un lado mediante la contracción de los abdominales oblicuos.', 'A continuación procede hacia el otro lado, y así hasta completar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Lateral en soporte')
);

-- Crunch Lateral Horizontal Alterno
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Lateral Horizontal Alterno'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/00061301-Alternate-Heel-Touchers_waist-FIX_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba con las rodillas dobladas y los pies apoyados en el suelo.', 'Mantén los brazos extendidos a los lados del cuerpo con las palmas hacia abajo.', 'Levanta ligeramente la cabeza, los hombros y la parte superior de la espalda del suelo.', 'Desde esta posición, lleva una mano hacia el talón del mismo lado, tocándolo ligeramente, mientras contraes los músculos abdominales.', 'Alterna los lados, llevando la mano izquierda hacia el talón derecho y luego la mano derecha hacia el talón derecho.', 'Mantén el movimiento controlado y continúa alternando los toques de talón durante el número deseado de repeticiones.', 'Este ejercicio trabaja los músculos oblicuos y abdominales, ayudando a fortalecer el núcleo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Lateral Horizontal Alterno')
);

-- Crunch Lateral Horizontal Concentrado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Lateral Horizontal Concentrado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/06351301-Oblique-Crunches-Floor_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate de lado en el suelo con las piernas juntas y ligeramente flexionadas.', 'Coloca la mano del brazo superior detrás de la cabeza o en el suelo frente a ti.', 'Contrae los abdominales y levanta el torso hacia el lado, llevando el codo hacia la cadera en un movimiento de crunch lateral.', 'Baja el torso de forma controlada hacia el suelo.', 'Completa el número deseado de repeticiones en un lado y luego cambia de lado para trabajar el otro lado de los oblicuos.', 'Este ejercicio se enfoca en los músculos oblicuos y ayuda a tonificar y fortalecer los músculos de la cintura.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Lateral Horizontal Concentrado')
);

-- Crunch Lateral Inclinado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Lateral Inclinado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/00021301-45°-Side-Bend_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['En un banco de lumbares, colócate de lado apoyando la cadera en el respaldo y con los pies bloqueados en los topes.', 'Pon las manos detrás de la cabeza.', 'Encoge el torso lateralmente de lado a lado, mediante la contracción de los abdominales oblicuos.', 'Al terminar la serie cambia de lado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Lateral Inclinado')
);

-- Crunch Superior
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/36791301-Sit-up-with-Arms-on-Chest_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Siéntate en el suelo con las piernas ligeramente flexionadas, las manos entrelazadas en el pecho.', 'Deslízate hacia atrás manteniendo el control, luego utiliza los músculos abdominales para levantar el torso de nuevo.', 'Concéntrate en activar los abdominales, evita el impulso y repite el movimiento.', 'Este ejercicio fortalece el core y las caderas.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior')
);

-- Crunch Superior Concentrado Elevado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior Concentrado Elevado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/43321301-Crunch-Hold_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Túmbate en el suelo con las piernas flexionadas 90º y los pies apoyados sobre un banco, silla o algo elevado.', 'Coloca las manos detrás de la cabeza.', 'Realiza una flexión de tronco, manteniendo la parte baja de la espalda en contacto con el suelo.', 'Mantén la posición unos instantes y regresa a la posición inicial.', 'Repite el movimiento las veces necesarias sin descansar abajo.', 'Este ejercicio fortalece los músculos abdominales y oblicuos, mejorando la fuerza y estabilidad del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior Concentrado Elevado')
);

-- Crunch Superior Cruzado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior Cruzado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/34841301-Elbow-to-Knee-Sit-up_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba con las rodillas dobladas y los pies apoyados en el suelo.', 'Coloca las manos delante del pecho sin apoyar, con los dedos entrelazados.', 'Levanta los hombros del suelo mientras contraes los abdominales.', 'A medida que subes, gira el torso y lleva el codo derecho hacia la rodilla izquierda.', 'Regresa a la posición inicial y repite del otro lado, llevando el codo izquierdo a la rodilla derecha.', 'Alterna los lados en cada repetición.', 'Este ejercicio trabaja los músculos oblicuos y abdominales']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior Cruzado')
);

-- Crunch Superior Cruzado Concentrado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior Cruzado Concentrado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/23121301-Lying-Elbow-to-Knee_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Túmbate en el suelo con las piernas flexionadas.', 'Pon un pie sobre el muslo contrario, de forma que la rodilla salga lateralmente.', 'Coloca la mano de ese lado ligeramente sobre el abdomen y la otra detrás de la cabeza.', 'Realiza una flexión de tronco, llevando el codo libre hacia la rodilla opuesta mientras giras el torso hacia ese lado.', 'Regresa a la posición inicial y repite el movimiento al mismo lado.', 'Al terminar la serie hazlo con el otro lado.', 'Este ejercicio fortalece los músculos abdominales y oblicuos, mejorando la fuerza y estabilidad del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior Cruzado Concentrado')
);

-- Crunch Superior Cruzado Concentrado Elevado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior Cruzado Concentrado Elevado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/14951301-Oblique-Crunch-Version-2_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Túmbate en el suelo con las piernas flexionadas 90º y los pies apoyados sobre un banco, silla o algo elevado.', 'Coloca un brazo extendido con la mano apoyada en el suelo al lado de la cadera.', 'La otra mano detrás de la cabeza.', 'Realiza una flexión de tronco, llevando el codo libre hacia la rodilla opuesta mientras giras el torso hacia ese lado.', 'Regresa a la posición inicial y repite el movimiento al mismo lado.', 'Al terminar la serie hazlo con el otro lado.', 'Este ejercicio fortalece los músculos abdominales y oblicuos, mejorando la fuerza y estabilidad del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior Cruzado Concentrado Elevado')
);

-- Crunch Superior Cruzado Declinado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior Cruzado Declinado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/11901301-Incline-Twisting-Sit-up-version-2_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Banco Inclinable'::text as equipment,
  ARRAY['Siéntate en un banco declinado con los pies asegurados y las manos detrás de la cabeza.', 'Realiza una flexión de tronco, llevando los codos hacia las rodillas mientras giras el torso hacia un lado, tratando de tocar con él la rodilla opuesta.', 'Regresa a la posición inicial y repite el movimiento hacia el otro lado.', 'Este ejercicio fortalece los músculos abdominales y oblicuos, mejorando la fuerza y estabilidad del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior Cruzado Declinado')
);

-- Crunch Superior de pie con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior de pie con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10051301-Band-standing-crunch_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Agarra las bandas de un soporte alto.', 'Ponte de rodillas de espaldas a ellas.', 'Agarra un extremo con cada mano a los lados de la cabeza, con los brazos por delante flexionados hacia arriba, con la espalda recta.', 'Realiza el encogimiento hacia delante, apretando el abdomen superior.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior de pie con Bandas')
);

-- Crunch Superior de pie con Polea delante
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior de pie con Polea delante'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02261301-Cable-Standing-Crunch_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie de cara a la polea alta, coge la barra con las manos en supinación (palmas hacia arriba) y ponla frente tu cabeza, con los brazos flexionados 90º.', 'Encoge el torso mediante la contracción de los abdominales superiores, sin tirar del cuello ni los brazos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior de pie con Polea delante')
);

-- Crunch Superior de rodillas con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior de rodillas con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01751301-Cable-Kneeling-Crunch_Waist-FIX_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De rodillas de cara a la polea alta, coge la cuerda con las dos manos y ponla sobre tu cabeza, con los brazos ligeramente flexionados.', 'Encoge y baja el torso mediante la contracción de los abdominales superiores, sin tirar del cuello ni los brazos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior de rodillas con Polea')
);

-- Crunch Superior Declinado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior Declinado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/18641301-Extra-Decline-Sit-up_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Banco Inclinable'::text as equipment,
  ARRAY['Siéntate en un banco declinado con los pies asegurados.', 'Cruza los brazos sobre el pecho o colócalos detrás de la cabeza.', 'Desciende lentamente hacia atrás hasta que tu espalda esté casi paralela al suelo, y luego utiliza los músculos abdominales para levantar el torso hacia adelante hasta una posición vertical.', 'Mantén el control del movimiento y evita balancearte hacia adelante y hacia atrás.', 'Repite el movimiento durante el número deseado de repeticiones.', 'Este ejercicio trabaja los músculos abdominales superiores y puede aumentar la fuerza y resistencia del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior Declinado')
);

-- Crunch Superior en Fitball
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior en Fitball'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02711301-Crunch-on-stability-ball_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Fitball'::text as equipment,
  ARRAY['Apoya la espalda sobre el fitball, con los pies apoyados en el suelo, las rodillas flexionadas a 90° y las manos delante del pecho.', 'Desde atrás, con la espalda casi en su totalidad apoyada sobre el fitball excepto la cabeza y columna dorsal que deben estar levemente despegadas del objeto, inspira y mientras exhalas el aire inicia el encogimiento abdominal para elevar el torso mediante la contracción de los músculos abdominales superiores...', 'Regresa lentamente a la posición inicial y repite tantas veces como necesites para completar la serie de ejercicios.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior en Fitball')
);

-- Crunch Superior Horizontal en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior Horizontal en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/22761301-Lever-Lying-Crunch_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Tumbado hacia arriba con las manos en el soporte, encoge la parte alta del torso hacia delante mediante la contracción de los abdominales superiores, sin tirar del cuello ni los brazos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior Horizontal en Máquina')
);

-- Crunch Superior sentado con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior sentado con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02121301-Cable-Seated-Crunch_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado en un banco o similar, de espaldas a la polea alta, coge la cuerda y ponla tras tu cabeza, con una mano agarrando cada extremo.', 'Encoge el torso mediante la contracción de los abdominales superiores, sin tirar del cuello ni los brazos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior sentado con Polea')
);

-- Crunch Superior Vertical Amplio en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior Vertical Amplio en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14521301-Lever-Seated-Crunch_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina con las manos en el soporte, encoge el torso hacia delante todo lo que puedas, mediante la contracción de los abdominales, sin tirar del cuello ni los brazos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior Vertical Amplio en Máquina')
);

-- Crunch Superior Vertical en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Crunch Superior Vertical en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/05951301-Lever-Seated-Crunch-chest-pad_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina con las manos en el soporte, encoge la parte alta del torso hacia delante mediante la contracción de los abdominales superiores, sin tirar del cuello ni los brazos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Crunch Superior Vertical en Máquina')
);

-- Cuarto de Sentadilla con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Cuarto de Sentadilla con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15141301-Barbell-Quarter-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas separadas a la anchura de los hombros y una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Desciende flexionando las rodillas ligeramente, aproximadamente a 45º.', 'Sube de nuevo estirando bien arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Cuarto de Sentadilla con Barra')
);

-- Cuarto de Sentadilla con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Cuarto de Sentadilla con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04131301-Dumbbell-Squat_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y con las piernas separadas a la anchura de los hombros, coge una mancuerna con cada mano.', 'Desciende flexionando las rodillas ligeramente, aproximadamente a 45º.', 'Sube de nuevo estirando bien arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Cuarto de Sentadilla con Mancuernas')
);

-- Curl a una mano en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl a una mano en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/41631301-Cable-One-Arm-Wrist-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De rodillas o de pie, con la palma de la mano mirando hacia abajo y el codo flexionado a 90 grados, sujetar firmemente la barra de la polea y realizar el movimiento de subida y bajada de la muñeca, manteniendo inmóvil el brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl a una mano en Polea Alta')
);

-- Curl Aislado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Aislado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00231301-Barbell-Alternate-Biceps-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra por el centro con una mano, con la palma hacia arriba (supinación).', 'Sube la barra flexionando el codo y desciende de forma controlada, manteniendo el equilibrio con la barra recta.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Aislado con Barra')
);

-- Curl Aislado en Pronación con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Aislado en Pronación con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04251301-Dumbbell-Standing-One-Arm-Reverse-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge una mancuerna con una mano y con la palma hacia atrás (pronación).', 'Flexiona el codo llevando la mancuerna a la altura del pecho y desciende nuevamente de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Aislado en Pronación con Mancuerna')
);

-- Curl Aislado en Pronación en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Aislado en Pronación en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14131301-Cable-Reverse-One-Arm-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con la espalda recta, coge la polea baja con una mano y la palma hacia atrás (pronación).', 'Ponte de cara a la polea con las piernas ligeramente separadas.', 'Flexiona el codo subiendo la mano hasta el pecho, sin mover el brazo.', 'Desciende de forma controlada.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Aislado en Pronación en Polea Baja')
);

-- Curl Aislado en Supinación con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Aislado en Supinación con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16701301-Dumbbell-One-Arm-Standing-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge una mancuerna con una mano y con la palma hacia delante (supinación).', 'Flexiona el codo llevando la mancuerna a la altura del pecho y desciende nuevamente de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Aislado en Supinación con Mancuerna')
);

-- Curl Aislado en Supinación en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Aislado en Supinación en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01901301-Cable-One-Arm-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con la espalda recta, coge la polea baja con una mano y la palma hacia delante (supinación).', 'Ponte de cara a la polea con las piernas ligeramente separadas.', 'Flexiona el codo subiendo la mano hasta el pecho, sin mover el brazo.', 'Desciende de forma controlada.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Aislado en Supinación en Polea Baja')
);

-- Curl Aislado hacia abajo con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Aislado hacia abajo con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04181301-Dumbbell-Standing-Concentration-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con las piernas separadas, inclínate hacia delante con la espalda paralela al suelo.', 'Coge una mancuerna con una mano y con la palma hacia el interior.', 'Flexiona el codo llevando la mancuerna frente al pectoral opuesto y desciende nuevamente de forma controlada.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Aislado hacia abajo con Mancuerna')
);

-- Curl Aislado Largo en Supinación en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Aislado Largo en Supinación en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/26561301-Cable-One-Arm-Biceps-Curl-VERSION-2_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con la espalda recta, coge la polea baja con una mano y la palma hacia delante (supinación).', 'Da un paso hacia delante para que el brazo quede ligeramente por detrás.', 'Flexiona el codo subiendo la mano hasta el pecho, sin mover el brazo.', 'Desciende de forma controlada.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Aislado Largo en Supinación en Polea Baja')
);

-- Curl Aislado Neutro con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Aislado Neutro con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16711301-Dumbbell-One-Arm-Standing-Hammer-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge una mancuerna con una mano y con la palma hacia el cuerpo (agarre neutro).', 'Flexiona el codo llevando la mancuerna a la altura del pecho y desciende nuevamente de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Aislado Neutro con Mancuerna')
);

-- Curl Alterno en Supinación en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Alterno en Supinación en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10321301-Lever-Alternate-Biceps-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina, coge los agarres con las palmas de las manos hacia arriba (supinación).', 'Sube una mano flexionando el codo hasta llegar a la altura del pecho, y desciende de forma controlada mientras subes el otro brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Alterno en Supinación en Máquina')
);

-- Curl con giro Alterno con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl con giro Alterno con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02851301-Dumbbell-Alternate-Biceps-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge una mancuerna con cada mano y con la palma hacia el cuerpo (agarre neutro).', 'Flexiona un codo subiendo la mancuerna a la altura del pecho mientras giras la muñeca con la palma hacia dentro.', 'Mientras desciendes, sube el otro brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl con giro Alterno con Mancuernas')
);

-- Curl con peso libre
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl con peso libre'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01391301-Brachialis-Narrow-Pull-ups_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Túmbate hacia arriba en el suelo y agarra una barra con las manos a la anchura de los hombros.', 'Una vez colgado de ella, realiza el ascenso flexionando los codos.', 'Desciende lentamente y procede de nuevo.', 'Se puede hacer con agarre en supinación y en pronación.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl con peso libre')
);

-- Curl Concentrado Cerrado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado Cerrado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00891301-Barbell-Seated-Close-grip-Concentration-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['Sentado en un banco, coge la barra con las manos en supinación (palmas hacia arriba) a una anchura inferior a la de los hombros.', 'Inclina el cuerpo hacia delante y abre las piernas, apoyando los codos en el borde del banco.', 'Flexiona los codos y sube la barra hasta llegar casi a la cabeza.', 'Desciende lentamente sin despegar los codos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado Cerrado con Barra')
);

-- Curl Concentrado Cerrado con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado Cerrado con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16821301-EZ-Bar-Seated-Close-Grip-Concentration-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Z'::text as equipment,
  ARRAY['Sentado en un banco o similar, coge la barra con las manos en supinación (palmas hacia arriba) a una anchura inferior a la de los hombros.', 'Inclina el cuerpo hacia delante y abre las piernas, apoyando los codos en el borde del banco o en los muslos.', 'Flexiona los codos y sube la barra hasta llegar casi a la cabeza.', 'Desciende lentamente sin despegar los codos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado Cerrado con Barra Z')
);

-- Curl Concentrado Cerrado en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado Cerrado en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16311301-Cable-Concentration-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado en un banco o similar, coge la barra con las manos en supinación (palmas hacia arriba) a una anchura inferior a la de los hombros.', 'Inclina el cuerpo hacia delante y abre las piernas, apoyando los codos en el borde del banco o en los muslos.', 'Flexiona los codos y sube la barra hasta llegar casi a la cabeza.', 'Desciende lentamente sin despegar los codos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado Cerrado en Polea Baja')
);

-- Curl Concentrado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/24141301-Barbell-Standing-Concentration-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie, coge la barra con las manos en supinación (palmas hacia arriba) a la anchura de los hombros.', 'Flexiona ligeramente las piernas e inclina el cuerpo hacia delante, apoyando los codos en los muslos.', 'Flexiona los codos y sube la barra hasta llegar casi a la cabeza.', 'Desciende lentamente sin despegar los codos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado con Barra')
);

-- Curl Concentrado de Dedos con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado de Dedos con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/04551301-Finger-Curls_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['Sentado, con los antebrazos apoyados sobre las rodillas o el banco y las palmas de las manos mirando hacia arriba, sujetar la barra con las manos a la anchura de los hombros y descenderla suavemente sobre las manos estirando los dedos, sin despegar los antebrazos del apoyo.', 'Estirar lo máximo posible y realizar la contracción de los dedos ascendiendo la barra de nuevo hasta cerrar los puños.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado de Dedos con Barra')
);

-- Curl Concentrado en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/05751301-Lever-Bicep-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina, coge los agarres con las palmas de las manos hacia arriba (supinación).', 'Sube las manos flexionando los codos hasta llegar cerca de la cabeza, y desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado en Máquina')
);

-- Curl Concentrado en Pronación con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado en Pronación con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/09941301-Band-reverse-wrist-curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Sentado, con el antebrazo apoyado sobre la rodilla o el banco y la palma de la mano mirando hacia abajo, sujetar firmemente la banda y realizar el movimiento de subida y bajada de la muñeca, sin despegar el antebrazo del apoyo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado en Pronación con Banda')
);

-- Curl Concentrado en Pronación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado en Pronación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/00791301-Barbell-Revers-Wrist-Curl-II_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['Sentado, con los antebrazos apoyados sobre las rodillas o el banco y las palmas de las manos mirando hacia abajo, sujetar firmemente la barra con las manos a la anchura de los hombros y realizar el movimiento de subida y bajada de las muñecas, sin despegar los antebrazos del apoyo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado en Pronación con Barra')
);

-- Curl Concentrado en Pronación con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado en Pronación con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04031301-Dumbbell-Seated-Revers-grip-Concentration-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentado en un banco o similar, abre las piernas e inclina el cuerpo un poco hacia delante.', 'Coge una mancuerna con la palma hacia abajo (pronación) y apoya la parte de atrás del codo en el interior del muslo.', 'Flexiona el codo hasta llevar la mancuerna a la altura del pecho y desciende nuevamente de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado en Pronación con Mancuerna')
);

-- Curl Concentrado en Pronación con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado en Pronación con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/03581301-Dumbbell-One-arm-Revers-Wrist-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentado, con el antebrazo apoyado sobre la rodilla o el banco y la palma de la mano mirando hacia abajo, sujetar firmemente la mancuerna y realizar el movimiento de subida y bajada de la muñeca, sin despegar el antebrazo del apoyo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado en Pronación con Mancuerna')
);

-- Curl Concentrado en Pronación con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado en Pronación con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/02101301-Cable-Reverse-Wrist-Curl_Forearm_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado, con los antebrazos apoyados sobre las rodillas o el banco y las palmas de las manos mirando hacia abajo, sujetar firmemente la barra de la polea y realizar el movimiento de subida y bajada de las muñecas, sin despegar los antebrazos del apoyo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado en Pronación con Polea')
);

-- Curl Concentrado en Supinación con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado en Supinación con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/10161301-Band-wrist-curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Sentado, con el antebrazo apoyado sobre la rodilla o el banco y la palma de la mano mirando hacia arriba, sujetar firmemente la banda y realizar el movimiento de subida y bajada de la muñeca, sin despegar el antebrazo del apoyo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado en Supinación con Banda')
);

-- Curl Concentrado en Supinación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado en Supinación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/01251301-Barbell-Wrist-Curl-II_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['Sentado, con los antebrazos apoyados sobre las rodillas o el banco y las palmas de las manos mirando hacia arriba, sujetar firmemente la barra con las manos a la anchura de los hombros y realizar el movimiento de subida y bajada de las muñecas, sin despegar los antebrazos del apoyo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado en Supinación con Barra')
);

-- Curl Concentrado en Supinación con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado en Supinación con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02971301-Dumbbell-Concentration-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentado en un banco o similar, abre las piernas e inclina el cuerpo un poco hacia delante.', 'Coge una mancuerna con la palma hacia arriba (supinación) y apoya la parte de atrás del codo en el interior del muslo.', 'Flexiona el codo hasta llevar la mancuerna a la altura del pecho y desciende nuevamente de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado en Supinación con Mancuerna')
);

-- Curl Concentrado en Supinación con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado en Supinación con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/03641301-Dumbbell-One-arm-Wrist-Curl_Forearm-SFIX_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentado, con el antebrazo apoyado sobre la rodilla o el banco y la palma de la mano mirando hacia arriba, sujetar firmemente la mancuerna y realizar el movimiento de subida y bajada de la muñeca, sin despegar el antebrazo del apoyo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado en Supinación con Mancuerna')
);

-- Curl Concentrado en Supinación con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado en Supinación con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/02471301-Cable-Wrist-Curl_Forearm_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado, con los antebrazos apoyados sobre las rodillas o el banco y las palmas de las manos mirando hacia arriba, sujetar firmemente la barra de la polea y realizar el movimiento de subida y bajada de las muñecas, sin despegar los antebrazos del apoyo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado en Supinación con Polea')
);

-- Curl Concentrado en Supinación en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado en Supinación en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16441301-Cable-Squatting-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Agachado con las piernas abiertas, inclina el cuerpo hacia delante y coge la barra corta de la polea con las manos hacia arriba (supinación).', 'Apoya la parte de atrás de los codos en el interior de los muslos.', 'Flexiona los codos subiendo la barra hasta la cara.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado en Supinación en Polea Baja')
);

-- Curl Concentrado Frontal Aislado en Supinación en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado Frontal Aislado en Supinación en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/39251301-Cable-Seated-Floor-One-Arm-Concentration-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado en el suelo, flexiona una pierna con el pie apoyado en el suelo y estira la otra, abiertas.', 'Coge la polea baja con la palma hacia arriba (supinación) y apoya la parte de atrás del codo en la rodilla.', 'Flexiona el codo acercando la mano a la cabeza y desciende nuevamente de forma controlada, sin estirar del todo para no relajar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado Frontal Aislado en Supinación en Polea Baja')
);

-- Curl Concentrado Lateral Aislado en Supinación en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado Lateral Aislado en Supinación en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16421301-Cable-Seated-One-Arm-Concentration-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado en un banco o similar, abre las piernas e inclina el cuerpo hacia delante.', 'Coge la polea baja con la palma hacia arriba (supinación) y apoya la parte de atrás del codo en el interior del muslo.', 'Flexiona el codo acercando la mano a la cabeza y desciende nuevamente de forma controlada, sin estirar del todo para no relajar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado Lateral Aislado en Supinación en Polea Baja')
);

-- Curl Concentrado Neutral con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Concentrado Neutral con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/14151301-Dumbbell-One-Arm-Seated-Neutral-Wrist-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentado, con el antebrazo apoyado sobre la rodilla o el banco y la palma de la mano mirando hacia la otra mano (agarre en martillo), sujetar firmemente la mancuerna y realizar el movimiento de subida y bajada de la muñeca (en este caso es un movimiento lateral), sin despegar el antebrazo del apoyo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Concentrado Neutral con Mancuerna')
);

-- Curl en Banco Scott en Pronación Aislado con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Banco Scott en Pronación Aislado con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16351301-Cable-One-Arm-Reverse-Preacher-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Polea'::text as equipment,
  ARRAY['Sentado en el banco con el pecho apoyado, coge la polea con agarre en pronación (palma hacia abajo).', 'Apoya bien la parte trasera superior del brazo en el banco scott y flexiona el codo subiendo la polea.', 'Desciende lentamente sin llegar a estirar del todo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Banco Scott en Pronación Aislado con Polea')
);

-- Curl en Banco Scott en Pronación con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Banco Scott en Pronación con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14141301-Dumbbell-One-Arm-Reverse-Preacher-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Mancuernas'::text as equipment,
  ARRAY['Sentado en el banco con el pecho apoyado, coge una mancuerna con agarre en pronación (palma hacia abajo).', 'Apoya bien la parte trasera superior del brazo en el banco scott y flexiona el codo subiendo la mancuerna.', 'Desciende lentamente sin llegar a estirar del todo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Banco Scott en Pronación con Mancuerna')
);

-- Curl en Banco Scott en Pronación con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Banco Scott en Pronación con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02091301-Cable-Reverse-Preacher-Curl_Forearm_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Polea'::text as equipment,
  ARRAY['Sentado en el banco con el pecho apoyado, coge la polea con agarre en pronación (palmas hacia abajo).', 'Apoya bien la parte trasera superior de los brazos en el banco scott y flexiona los codos subiendo la barra.', 'Desciende lentamente sin llegar a estirar del todo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Banco Scott en Pronación con Polea')
);

-- Curl en Banco Scott en Supinación Aislado con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Banco Scott en Supinación Aislado con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16331301-Cable-One-Arm-Preacher-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Polea'::text as equipment,
  ARRAY['Sentado en el banco con el pecho apoyado, coge la polea con agarre en supinación (palma hacia arriba).', 'Apoya bien la parte trasera superior del brazo en el banco scott y flexiona el codo subiendo la polea.', 'Desciende lentamente sin llegar a estirar del todo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Banco Scott en Supinación Aislado con Polea')
);

-- Curl en Banco Scott en Supinación con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Banco Scott en Supinación con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03721301-Dumbbell-Preacher-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Mancuernas'::text as equipment,
  ARRAY['Sentado en el banco con el pecho apoyado, coge una mancuerna con agarre en supinación (palma hacia arriba).', 'Apoya bien la parte trasera superior del brazo en el banco scott y flexiona el codo subiendo la mancuerna.', 'Desciende lentamente sin llegar a estirar del todo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Banco Scott en Supinación con Mancuerna')
);

-- Curl en Banco Scott en Supinación con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Banco Scott en Supinación con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01951301-Cable-Preacher-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Polea'::text as equipment,
  ARRAY['Sentado en el banco con el pecho apoyado, coge la polea con agarre en supinación (palmas hacia arriba).', 'Apoya bien la parte trasera superior de los brazos en el banco scott y flexiona los codos subiendo la barra.', 'Desciende lentamente sin llegar a estirar del todo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Banco Scott en Supinación con Polea')
);

-- Curl en Banco Scott Neutro Aislado con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Banco Scott Neutro Aislado con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16401301-Cable-Rope-One-Arm-Hammer-Preacher-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Polea'::text as equipment,
  ARRAY['Sentado en el banco con el pecho apoyado, coge la polea con agarre neutro o martillo (palma hacia el interior).', 'Apoya bien la parte trasera superior del brazo en el banco scott y flexiona el codo subiendo la polea.', 'Desciende lentamente sin llegar a estirar del todo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Banco Scott Neutro Aislado con Polea')
);

-- Curl en Banco Scott Neutro con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Banco Scott Neutro con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16631301-Dumbbell-One-Arm-Hammer-Preacher-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Mancuernas'::text as equipment,
  ARRAY['Sentado en el banco con el pecho apoyado, coge una mancuerna con agarre neutro o martillo (palma hacia el interior).', 'Apoya bien la parte trasera superior del brazo en el banco scott y flexiona el codo subiendo la mancuerna.', 'Desciende lentamente sin llegar a estirar del todo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Banco Scott Neutro con Mancuerna')
);

-- Curl en Banco Scott Neutro con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Banco Scott Neutro con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16391301-Cable-Rope-Hammer-Preacher-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Polea'::text as equipment,
  ARRAY['Sentado en el banco con el pecho apoyado, coge la polea con agarre neutro o martillo (palmas hacia el interior).', 'Apoya bien la parte trasera superior de los brazos en el banco scott y flexiona los codos subiendo la polea.', 'Desciende lentamente sin llegar a estirar del todo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Banco Scott Neutro con Polea')
);

-- Curl en caída con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en caída con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/37481301-Biceps-Curl-with-Bed-Sheet_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie, engancha las bandas en algún lugar alto.', 'Coge un extremo con cada mano, con los codos flexionados y las palmas hacia el cuerpo.', 'Déjate caer suavemente estirando los brazos.', 'Flexiona de nuevo tirando de los bíceps para volver arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en caída con Bandas')
);

-- Curl en Martillo Alterno con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Martillo Alterno con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02981301-Dumbbell-Cross-Body-Hammer-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge una mancuerna con cada mano y con la palma hacia el cuerpo (agarre neutro).', 'Flexiona un codo llevando la mancuerna a la altura del pecho.', 'Mientras desciende, sube la otra mancuerna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Martillo Alterno con Mancuernas')
);

-- Curl en Martillo con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Martillo con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/06361301-Olympic-Barbell-Hammer-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge la barra con agarre neutro o en martillo (barra con agarres especiales), por delante del cuerpo.', 'Flexiona los codos hasta subir la barra hasta la altura del pecho y baja de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Martillo con Barra')
);

-- Curl en Martillo Cruzado con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Martillo Cruzado con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16571301-Dumbbell-Cross-Body-Hammer-Curl-Version-2_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge una mancuerna con cada mano y con la palma hacia el cuerpo (agarre neutro).', 'Flexiona un codo llevando la mancuerna al pectoral opuesto.', 'Mientras desciende, sube la otra mancuerna al pectoral contrario.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Martillo Cruzado con Mancuernas')
);

-- Curl en Martillo en Máquina Scott
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Martillo en Máquina Scott'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16151301-Lever-Hammer-Grip-Preacher-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina Scott con el pecho apoyado, coge los agarres con las palmas de las manos enfrentadas (agarre neutro o martillo).', 'Sube las manos flexionando los codos hasta llegar cerca de la cabeza, y desciende de forma controlada, con la parte superior de los brazos siempre bien apoyada en el banco.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Martillo en Máquina Scott')
);

-- Curl en Martillo en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Martillo en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02321301-Cable-Standing-Pulldown-with-rope_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con la espalda recta, coge los extremos de la cuerda con las manos a la anchura de los hombros y estira los brazos hacia delante.', 'Flexiona los codos llevando la cuerda a la cabeza.', 'Vuelve a la posición inicial de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Martillo en Polea Alta')
);

-- Curl en Martillo en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Martillo en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01651301-Cable-Hammer-Curl-with-rope-m_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge la cuerda con las manos a la anchura de los hombros, flexiona los codos subiendo la cuerda hasta el pecho, con los codos pegados al cuerpo.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Martillo en Polea Baja')
);

-- Curl en Pronación Abierto con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Pronación Abierto con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00801301-Barbell-Reverse-Curl_Forearm_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos a una anchura superior a la de los hombros, con las palmas hacia abajo (pronación).', 'Sube la barra flexionando los codos y desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Pronación Abierto con Barra')
);

-- Curl en Pronación con agarre Z en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Pronación con agarre Z en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16081301-Cable-Reverse-Grip-Biceps-Curl-SZ-bar_Upper-arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge la barra con las manos a la anchura de los hombros y con las palmas hacia abajo, flexiona los codos subiendo la barra hasta el pecho, con los codos pegados al cuerpo.', 'Al llegar a arriba, echa los codos un poco hacia delante para lograr una mayor contracción.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Pronación con agarre Z en Polea Baja')
);

-- Curl en Pronación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Pronación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01101301-Barbell-Standing-Reverse-Grip-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos a la anchura de los hombros, con las palmas hacia abajo (pronación).', 'Sube la barra flexionando los codos y desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Pronación con Barra')
);

-- Curl en Pronación con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Pronación con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04511301-EZ-Barbell-Reverse-Grip-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Z'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra z con las manos a la anchura de los hombros, con las palmas hacia abajo (pronación).', 'Sube la barra flexionando los codos y desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Pronación con Barra Z')
);

-- Curl en Pronación en banco Scott con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Pronación en banco Scott con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00811301-Barbell-Reverse-Preacher-Curl_Forearm_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Barra Larga'::text as equipment,
  ARRAY['Sentado en el banco Scott con el pecho apoyado, coge la barra con las manos a la anchura de los hombros, con las palmas hacia abajo (pronación).', 'Sube la barra flexionando los codos y desciende de forma controlada, con la parte superior de los brazos siempre bien apoyada en el banco.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Pronación en banco Scott con Barra')
);

-- Curl en Pronación en banco Scott con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Pronación en banco Scott con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04521301-EZ-Barbell-Reverse-grip-Preacher-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Barra Z'::text as equipment,
  ARRAY['Sentado en el banco Scott con el pecho apoyado, coge la barra con las manos a la anchura de los hombros, con las palmas hacia abajo (pronación).', 'Sube la barra flexionando los codos y desciende de forma controlada, con la parte superior de los brazos siempre bien apoyada en el banco.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Pronación en banco Scott con Barra Z')
);

-- Curl en Pronación en Máquina Scott
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Pronación en Máquina Scott'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16161301-Lever-Reverse-Grip-Preacher-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina Scott con el pecho apoyado, coge los agarres con las palmas de las manos hacia abajo (pronación).', 'Sube las manos flexionando los codos hasta llegar cerca de la cabeza, y desciende de forma controlada, con la parte superior de los brazos siempre bien apoyada en el banco.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Pronación en Máquina Scott')
);

-- Curl en Supinación Abierto Con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación Abierto Con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16291301-Barbell-Standing-Wide-Grip-Biceps-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos a una anchura superior a la de los hombros, con las palmas hacia arriba (supinación).', 'Sube la barra flexionando los codos y desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación Abierto Con Barra')
);

-- Curl en Supinación Abierto Con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación Abierto Con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/27411301-EZ-Barbell-Standing-Wide-Grip-Biceps-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Z'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos a la anchura máxima de la barra, con las palmas hacia arriba (supinación).', 'Sube la barra flexionando los codos y desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación Abierto Con Barra Z')
);

-- Curl en Supinación Abierto en banco Scott con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación Abierto en banco Scott con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04541301-EZ-Barbell-Spider-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Barra Z'::text as equipment,
  ARRAY['Sentado en el banco Scott con el pecho apoyado, coge la barra con las manos por el lado más ancho de la barra z, con las palmas hacia arriba (supinación).', 'Sube la barra flexionando los codos y desciende de forma controlada, con la parte superior de los brazos siempre bien apoyada en el banco.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación Abierto en banco Scott con Barra Z')
);

-- Curl en Supinación Aislado con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación Aislado con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09861301-Band-one-arm-overhead-biceps-curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Coloca la banda a la altura del pecho.', 'Estira el brazo lateralmente y agarra el extremo de la banda con la palma de la mano hacia arriba.', 'Flexiona el codo acercando la mano a la cabeza y vuelve a estirar lentamente.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación Aislado con Banda')
);

-- Curl en Supinación Alterno con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación Alterno con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09681301-Band-alternating-biceps-curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, pisa la banda y coge un extremo con cada mano, con ellas a ambos lados del cuerpo en supinación (palmas hacia delante).', 'Flexiona un codo hasta llegar con la mano aproximadamente a la altura de los hombros.', 'Desciende de nuevo de forma controlada y procede con el otro brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación Alterno con Bandas')
);

-- Curl en Supinación Cerrado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación Cerrado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01061301-Barbell-Standing-Close-Grip-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos a una anchura inferior a la de los hombros, con las palmas hacia arriba (supinación).', 'Sube la barra flexionando los codos y desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación Cerrado con Barra')
);

-- Curl en Supinación Cerrado Con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación Cerrado Con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04461301-EZ-Barbell-Close-grip-Curl_Upper-Arms_720-1.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Z'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos a la anchura mínima de la barra, con las palmas hacia arriba (supinación).', 'Sube la barra flexionando los codos y desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación Cerrado Con Barra Z')
);

-- Curl en Supinación Cerrado en banco Scott con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación Cerrado en banco Scott con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16271301-EZ-Barbell-Close-Grip-Preacher-Curl_Upper-Arms-FIX_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Barra Z'::text as equipment,
  ARRAY['Sentado en el banco Scott con el pecho apoyado, coge la barra con las manos por el lado más estrecho de la barra z, con las palmas hacia arriba (supinación).', 'Sube la barra flexionando los codos y desciende de forma controlada, con la parte superior de los brazos siempre bien apoyada en el banco.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación Cerrado en banco Scott con Barra Z')
);

-- Curl en Supinación Cerrado en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación Cerrado en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16301301-Cable-Close-Grip-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge la barra con las manos a una anchura inferior a la de los hombros y con las palmas hacia arriba, flexiona los codos subiendo la barra hasta el pecho, con los codos pegados al cuerpo.', 'Al llegar a arriba, echa los codos un poco hacia delante para lograr una mayor contracción.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación Cerrado en Polea Baja')
);

-- Curl en Supinación con agarre Z en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación con agarre Z en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16071301-Cable-Biceps-Curl-SZ-bar_Upper-arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge la barra con las manos a la anchura de los hombros y con las palmas hacia arriba, flexiona los codos subiendo la barra hasta el pecho, con los codos pegados al cuerpo.', 'Al llegar a arriba, echa los codos un poco hacia delante para lograr una mayor contracción.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación con agarre Z en Polea Baja')
);

-- Curl en Supinación con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/40631301-Band-Biceps-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, pisa la banda y coge un extremo con cada mano, con ellas a ambos lados del cuerpo en supinación (palmas hacia delante).', 'Flexiona los codos hasta llegar con las manos aproximadamente a la altura de los hombros.', 'Desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación con Bandas')
);

-- Curl en Supinación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00311301-Barbell-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos a la anchura de los hombros, con las palmas hacia arriba (supinación).', 'Sube la barra flexionando los codos y desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación con Barra')
);

-- Curl en Supinación con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04471301-EZ-Barbell-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Z'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra z con las manos a la anchura de los hombros, con las palmas hacia arriba (supinación).', 'Sube la barra flexionando los codos y desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación con Barra Z')
);

-- Curl en Supinación Concentrado con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación Concentrado con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09761301-Band-concentration-curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Sentado con las piernas bien separadas y el cuerpo ligeramente inclinado hacia delante, pisa la banda cerca del extremo y agárralo con una mano, con la palma hacia la pierna contraria.', 'Apoya el codo en el muslo y flexiona hasta llegar con la mano cerca de la cabeza.', 'Desciende lentamente sin llegar a estirar del todo para no relajar el músculo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación Concentrado con Banda')
);

-- Curl en Supinación Corto con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación Corto con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14581301-EZ-Barbell-Seated-Curls_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Z'::text as equipment,
  ARRAY['Sentado con la espalda recta, coge la barra con las manos a la anchura de los hombros, con las palmas hacia arriba (supinación).', 'Sube la barra flexionando los codos y desciende de forma controlada sin llegar a tocar las piernas, haciendo el recorrido más corto de lo normal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación Corto con Barra Z')
);

-- Curl en Supinación en banco Scott con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación en banco Scott con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00701301-Barbell-Preacher-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Barra Larga'::text as equipment,
  ARRAY['Sentado en el banco Scott con el pecho apoyado, coge la barra con las manos a la anchura de los hombros, con las palmas hacia arriba (supinación).', 'Sube la barra flexionando los codos y desciende de forma controlada, con la parte superior de los brazos siempre bien apoyada en el banco.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación en banco Scott con Barra')
);

-- Curl en Supinación en Máquina Scott
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación en Máquina Scott'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16141301-Lever-Preacher-Curl-version-2_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina Scott con el pecho apoyado, coge los agarres con las palmas de las manos hacia arriba (supinación).', 'Sube las manos flexionando los codos hasta llegar cerca de la cabeza, y desciende de forma controlada, con la parte superior de los brazos siempre bien apoyada en el banco.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación en Máquina Scott')
);

-- Curl en Supinación en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16381301-Cable-Pulldown-Bicep-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado en un banco o similar, con la espalda recta, coge la barra con las manos a la anchura de los hombros en supinación (palmas hacia arriba) y estira los brazos hacia arriba.', 'Flexiona los codos llevando la barra tras la cabeza.', 'Desciende ligeramente los codos para realizar bien la contracción.', 'Vuelve a la posición inicial de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación en Polea Alta')
);

-- Curl en Supinación en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/08681301-Cable-Curl-m_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge la barra con las manos a la anchura de los hombros y con las palmas hacia arriba, flexiona los codos subiendo la barra hasta el pecho, con los codos pegados al cuerpo.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación en Polea Baja')
);

-- Curl en Supinación hacia abajo con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación hacia abajo con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00591301-Barbell-Lying-Preacher-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Boca abajo con el pecho apoyado en el respaldo del banco y con los brazos sueltos hacia delante, con los pies en el suelo.', 'Agarra la barra con las palmas hacia delante (supinación) a la anchura de los hombros.', 'Flexiona los codos hasta llegar a arriba y desciende lentamente, todo sin mover la parte superior de los brazos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación hacia abajo con Barra')
);

-- Curl en Supinación hacia abajo con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación hacia abajo con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/29001301-EZ-Barbell-Standing-Preacher-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Scott, Barra Z'::text as equipment,
  ARRAY['Apoyando la parte trasera de los brazos en un banco (por ejemplo Scott, pero al revés, aunque sirve un banco plano tumbado boca abajo) y con los brazos sueltos hacia delante, con los pies en el suelo.', 'Agarra la barra con las palmas hacia delante (supinación) a la anchura máxima de la barra z.', 'Flexiona los codos hasta llegar a arriba y desciende lentamente, todo sin mover la parte superior de los brazos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación hacia abajo con Barra Z')
);

-- Curl en Supinación Retraído con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación Retraído con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00381301-Barbell-Drag-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos a la anchura de los hombros, con las palmas hacia arriba (supinación).', 'Sube la barra flexionando los codos y echándoles hacia atrás, luego desciende de forma controlada a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación Retraído con Barra')
);

-- Curl en Supinación Retraído en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en Supinación Retraído en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16321301-Cable-Drag-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge la barra con las manos a una anchura inferior a la de los hombros y con las palmas hacia arriba.', 'Sube la barra flexionando los codos y echándoles hacia atrás, luego desciende de forma controlada a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en Supinación Retraído en Polea Baja')
);

-- Curl en V en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl en V en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/18611301-Cable-Curl-with-Multipurpose-V-bar_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge la barra en V con ambas manos y flexiona los codos subiendo la barra hasta el pecho, con los codos pegados al cuerpo.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl en V en Polea Baja')
);

-- Curl Femoral Aislado en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Femoral Aislado en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/05821301-Lever-Kneeling-Leg-Curl-plate-loaded_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Con el muslo apoyado, la rodillas libre y la parte trasera del tobillo en el rodillo.', 'Flexiona la rodilla hacia atrás 90°, manteniendo inmóvil la parte alta de la pierna.', 'Vuelve de forma controlada sin relajar el músculo.', 'Al terminar la serie cambia de pierna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Femoral Aislado en Máquina')
);

-- Curl Femoral Horizontal en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Femoral Horizontal en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/05861301-Lever-Lying-Leg-Curl_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Tumbado hacia abajo en el banco de la máquina, con las rodillas libres y la parte trasera de los tobillos en el rodillo.', 'Flexiona las rodillas hacia atrás 90°, manteniendo inmóvil la parte alta de la pierna, sin levantar los glúteos.', 'Vuelve de forma controlada sin relajar el músculo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Femoral Horizontal en Máquina')
);

-- Curl Femoral Libre
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Femoral Libre'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/35071301-Self-Assisted-Inverse-Leg-Curl-VERSION-2_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['De rodillas en el suelo con los tobillos sujetos por alguna plataforma, banco o step.', 'Trata de estirar las piernas llevando el cuerpo hacia delante hasta tumbarte en el suelo.', 'Vuelve a la posicion inicial flexionando las piernas y dejando el cuerpo en vertical.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Femoral Libre')
);

-- Curl Femoral Libre Asistido con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Femoral Libre Asistido con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/32351301-Cable-Assisted-Inverse-Leg-Curl_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['De rodillas sobre el banco con los tobillos agarrados y de espaldas a la polea, coge la barra por detrás de la cabeza con agarre ancho y las manos hacia delante.', 'Trata de estirar las piernas llevando el cuerpo hacia delante hasta estar en paralelo al suelo.', 'Vuelve a la posición inicial flexionando las piernas y dejando el cuerpo vertical.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Femoral Libre Asistido con Polea')
);

-- Curl Femoral Vertical en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Femoral Vertical en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/05991301-Lever-Seated-Leg-Curl_Thighs-FIX_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado con el respaldo algo inclinado y la espalda bien apoyada, con las rodillas libres y la parte trasera de los tobillos en el rodillo.', 'Flexiona las rodillas hacia atrás 90°, manteniendo inmóvil la parte alta de la pierna.', 'Vuelve de forma controlada sin relajar el músculo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Femoral Vertical en Máquina')
);

-- Curl Femoral Vertical en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Femoral Vertical en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15471301-Cable-Standing-Leg-Curl_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie de cara a la polea baja con las piernas casi juntas, ponte la correa en un tobillo.', 'Flexiona la rodilla hacia atrás 90°, manteniendo inmóvil la parte alta de la pierna.', 'Vuelve de forma controlada sin relajar el músculo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Femoral Vertical en Polea')
);

-- Curl Horizontal Cerrado en Supinación con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Horizontal Cerrado en Supinación con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16341301-Cable-Lying-Bicep-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco plano, coge la barra de la polea con las manos a una anchura inferior a la de los hombros y las palmas hacia arriba (supinación).', 'Flexiona los codos y elévalos, de forma que llegues con la barra hasta la cara.', 'Luego desciende de nuevo lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Horizontal Cerrado en Supinación con Polea')
);

-- Curl Horizontal con giro con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Horizontal con giro con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03501301-Dumbbell-Lying-Supine-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco plano, coge una mancuerna con cada mano con las palmas hacia el cuerpo (agarre neutro) y extiende los brazos a los lados, a 45º del cuerpo.', 'Flexiona los codos manteniendo los brazos inmovilizados, hasta llegar con las mancuernas frente al pecho, mientras giras las muñecas hacia adentro (palmas hacia arriba).', 'Al llegar a arriba sube un poco los brazos para una mayor contracción.', 'Desciende de forma controlada a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Horizontal con giro con Mancuernas')
);

-- Curl Horizontal con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Horizontal con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16621301-Dumbbell-Lying-Wide-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco plano, coge una mancuerna con cada mano con las palmas hacia arriba (supinación) y extiende los brazos a los lados, perpendiculares al cuerpo (como si fuese una apertura de pecho).', 'Flexiona los codos manteniendo los brazos inmovilizados, hasta llegar con las mancuernas frente al pecho.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Horizontal con Mancuernas')
);

-- Curl Horizontal en Supinación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Horizontal en Supinación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16611301-Dumbbell-Lying-Supine-Biceps-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco plano, coge una mancuerna con cada mano con las palmas hacia arriba (supinación) y extiende los brazos a los lados, a 45º del cuerpo.', 'Flexiona los codos manteniendo los brazos inmovilizados, hasta llegar con las mancuernas frente al pecho.', 'Al llegar a arriba sube un poco los brazos intentando girar las muñecas hacia afuera para una mayor contracción.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Horizontal en Supinación con Mancuernas')
);

-- Curl Horizontal en Supinación con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Horizontal en Supinación con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/23961301-Cable-Lying-Biceps-Curl-VERSION-2_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco plano, coge la barra de la polea con las manos a la anchura de los hombros y las palmas hacia arriba (supinación).', 'Flexiona los codos llevando la barra frente al pecho y desciende de nuevo lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Horizontal en Supinación con Polea')
);

-- Curl Horizontal Inclinado con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Horizontal Inclinado con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16451301-Cable-Two-Arm-Curl-on-Incline-Bench_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Polea'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco inclinado, coge un agarre con cada mano con las palmas hacia arriba (supinación) y extiende los brazos a los lados, perpendiculares al cuerpo (como si fuese una apertura de pecho).', 'Flexiona los codos manteniendo los brazos inmovilizados, hasta llegar con las manos frente a los hombros.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Horizontal Inclinado con Polea')
);

-- Curl Inclinado Alterno en Supinación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Inclinado Alterno en Supinación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/36821301-Dumbbell-Incline-Alternate-Bicep-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco inclinado, coge una mancuerna con cada mano con las palmas hacia delante (supinación).', 'Deja caer los brazos a ambos lados del cuerpo.', 'Sube una mancuerna flexionando el codo hasta llegar a la altura del pecho.', 'Desciende completamente y al llegar a abajo, sube el otro brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Inclinado Alterno en Supinación con Mancuernas')
);

-- Curl Inclinado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Inclinado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/39871301-Barbell-Incline-Wrist-Curl-with-Chest-Support_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['De pie, con el pecho apoyado sobre un banco con el respaldo inclinado y los brazos colgando hacia abajo, sujetar firmemente la barra con las manos a la anchura de los hombros y las palmas mirando hacia atrás y realizar el movimiento de subida y bajada de las muñecas en su máximo recorrido.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Inclinado con Barra')
);

-- Curl Inclinado con giro Alterno con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Inclinado con giro Alterno con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03181301-Dumbbell-Incline-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Sentado en un banco inclinado, coge una mancuerna con cada mano con las palmas hacia el interior (agarre neutro o martillo) y deja caer los brazos a ambos lados del cuerpo.', 'Flexiona un codo subiendo la mancuerna a la altura del pecho mientras giras la muñeca con la palma hacia arriba.', 'Mientras desciendes, sube el otro brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Inclinado con giro Alterno con Mancuernas')
);

-- Curl Inclinado Lateral con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Inclinado Lateral con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03221301-Dumbbell-Incline-Inner-Biceps-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Sentado en un banco inclinado, coge una mancuerna con cada mano con las palmas hacia arriba (supinación) y deja caer los brazos a ambos lados del cuerpo, separándolos formando un ángulo de 45º con el mismo.', 'Flexiona los codos subiendo las mancuernas a la altura de los hombros.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Inclinado Lateral con Mancuernas')
);

-- Curl Inclinado Neutro Alterno con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Inclinado Neutro Alterno con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/12331301-Dumbbell-Incline-Alternate-Hammer-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Sentado en un banco inclinado, coge una mancuerna con cada mano con las palmas hacia el interior (agarre neutro o martillo) y deja caer los brazos a ambos lados del cuerpo.', 'Flexiona un codo subiendo la mancuerna a la altura del pecho.', 'Mientras desciende, sube el otro brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Inclinado Neutro Alterno con Mancuernas')
);

-- Curl Lateral con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Lateral con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16641301-Dumbbell-High-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge una mancuerna con cada mano y estira los brazos lateralmente a ambos lados del cuerpo, con las palmas de las manos hacia arriba.', 'Flexiona los codos hasta llevar las mancuernas cerca de la cabeza, sin mover la parte superior de los brazos.', 'Estira de nuevo de forma controlada sin estirar del todo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Lateral con Mancuernas')
);

-- Curl Lateral en Supinación Aislado con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Lateral en Supinación Aislado con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/12031301-Cable-one-arm-inner-biceps-curl_upper-arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie ponte en perpendicular a la polea con las piernas ligeramente separadas.', 'Con la polea a la altura del hombro, estira un brazo y agarra con la mano en supinación (palma hacia arriba).', 'Flexiona el codo llevando la mano cerca de la cabeza, sin mover el brazo.', 'Desciende lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Lateral en Supinación Aislado con Polea')
);

-- Curl Lateral en Supinación con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Lateral en Supinación con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02291301-Cable-Standing-Inner-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie ponte entre dos poleas con las piernas ligeramente separadas.', 'Con las poleas a la altura de los hombros, estira los brazo a los lados y agarra con las manos en supinación (palmas hacia arriba).', 'Flexiona los codos llevando las manos cerca de la cabeza, sin mover los brazos.', 'Desciende lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Lateral en Supinación con Polea')
);

-- Curl Spider Aislado en Pronación con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Spider Aislado en Pronación con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16671301-Dumbbell-One-Arm-Reverse-Spider-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Boca abajo con el pecho apoyado en el respaldo del banco inclinado y con los brazos sueltos hacia delante.', 'Puedes poner las rodillas sobre el banco o directamente estirar las piernas con los pies en el suelo.', 'Agarra una mancuerna con una mano, con la palma hacia atrás (pronación).', 'Flexiona el codo hasta llegar a arriba y desciende lentamente, todo sin mover la parte superior del brazo.', 'Con la otra mano puedes agarrarte al banco para tener estabilidad.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Spider Aislado en Pronación con Mancuerna')
);

-- Curl Spider Aislado en Supinación con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Spider Aislado en Supinación con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16651301-Dumbbell-One-Arm-Prone-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Boca abajo con el pecho apoyado en el respaldo del banco inclinado y con los brazos sueltos hacia delante.', 'Puedes poner las rodillas sobre el banco o directamente estirar las piernas con los pies en el suelo.', 'Agarra una mancuerna con una mano, con la palma hacia delante (supinación).', 'Flexiona el codo hasta llegar a arriba y desciende lentamente, todo sin mover la parte superior del brazo.', 'Con la otra mano puedes agarrarte al banco para tener estabilidad.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Spider Aislado en Supinación con Mancuerna')
);

-- Curl Spider Aislado Neutro con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Spider Aislado Neutro con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16661301-Dumbbell-One-Arm-Prone-Hammer-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Boca abajo con el pecho apoyado en el respaldo del banco inclinado y con los brazos sueltos hacia delante.', 'Puedes poner las rodillas sobre el banco o directamente estirar las piernas con los pies en el suelo.', 'Agarra una mancuerna con una mano, con la palma hacia el cuerpo (agarre neutro).', 'Flexiona el codo hasta llegar a arriba y desciende lentamente, todo sin mover la parte superior del brazo.', 'Con la otra mano puedes agarrarte al banco para tener estabilidad.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Spider Aislado Neutro con Mancuerna')
);

-- Curl Spider en Pronación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Spider en Pronación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/39881301-Barbell-Incline-Reverse-grip-Spider-Curl-with-Chest-Support_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Boca abajo con el pecho apoyado en el respaldo del banco inclinado y con los brazos sueltos hacia delante.', 'Puedes poner las rodillas sobre el banco o directamente estirar las piernas con los pies en el suelo.', 'Agarra la barra con las palmas hacia el cuerpo (pronación) a la anchura de los hombros.', 'Flexiona los codos hasta llegar a arriba y desciende lentamente, todo sin mover la parte superior de los brazos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Spider en Pronación con Barra')
);

-- Curl Spider en Supinación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Spider en Supinación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00721301-Barbell-Prone-Incline-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Boca abajo con el pecho apoyado en el respaldo del banco inclinado y con los brazos sueltos hacia delante.', 'Puedes poner las rodillas sobre el banco o directamente estirar las piernas con los pies en el suelo.', 'Agarra la barra con las palmas hacia delante (supinación) a la anchura de los hombros.', 'Flexiona los codos hasta llegar a arriba y desciende lentamente, todo sin mover la parte superior de los brazos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Spider en Supinación con Barra')
);

-- Curl Spider en Supinación con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Spider en Supinación con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16281301-EZ-Barbell-Spider-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Z'::text as equipment,
  ARRAY['Boca abajo con el pecho apoyado en el respaldo del banco inclinado y con los brazos sueltos hacia delante.', 'Puedes poner las rodillas sobre el banco o directamente estirar las piernas con los pies en el suelo.', 'Agarra la barra z con las palmas hacia delante (supinación) a la anchura de los hombros.', 'Flexiona los codos hasta llegar a arriba y desciende lentamente, todo sin mover la parte superior de los brazos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Spider en Supinación con Barra Z')
);

-- Curl Spider Neutro con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Spider Neutro con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/39631301-Dumbbell-Single-Spider-Curl-with-Chest-Support_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Boca abajo con el pecho apoyado en el respaldo del banco inclinado y con los brazos sueltos hacia delante.', 'Puedes poner las rodillas sobre el banco o directamente estirar las piernas con los pies en el suelo.', 'Agarra una mancuerna con ambas manos, con los dedos entrelazados.', 'Flexiona los codos hasta llegar a arriba y desciende lentamente, todo sin mover la parte superior de los brazos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Spider Neutro con Mancuerna')
);

-- Curl Vertical de Dedos con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Vertical de Dedos con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/16101301-Barbell-Behind-Back-Finger-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las palmas de las manos mirando hacia atrás, sujetar la barra por detrás del cuerpo con las manos a la anchura de los hombros y descenderla suavemente sobre las manos estirando los dedos lo máximo posible.', 'Después volver a cerrar los puños.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Vertical de Dedos con Barra')
);

-- Curl Vertical en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Vertical en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/02241301-Cable-Standing-Back-Wrist-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las palmas de las manos mirando hacia atrás, sujetar firmemente la barra de la polea por detrás del cuerpo con las manos a la anchura de los hombros y realizar el movimiento de subida y bajada de las muñecas en su máximo recorrido.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Vertical en Polea Baja')
);

-- Curl Vertical en Supinación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Vertical en Supinación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/01041301-Barbell-Standing-Back-Wrist-Curl_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las palmas de las manos mirando hacia atrás, sujetar firmemente la barra por detrás del cuerpo con las manos a la anchura de los hombros y realizar el movimiento de subida y bajada de las muñecas en su máximo recorrido.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Vertical en Supinación con Barra')
);

-- Curl Vertical en Supinación con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Curl Vertical en Supinación con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Bíceps. Músculos: Antebrazo, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Bíceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01821301-Cable-Lying-Close-rip-Curl_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco plano, coge la barra de la polea con las manos a la anchura de los hombros y las palmas hacia arriba (supinación).', 'Flexiona los codos llevando la barra tras la cabeza, subiendo los codos un poco al final del movimiento.', 'Desciende de nuevo lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Curl Vertical en Supinación con Polea')
);

-- Desplazamientos de Boxeo
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Desplazamientos de Boxeo'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/35321301-Boxer-Shuffle_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Se trata de mover las piernas hacia delante y hacia atrás, como si corriéramos en el sitio, sin necesitar metros para desplazarnos.', 'También podemos desplazarnos ligeramente hacia los lados.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Desplazamientos de Boxeo')
);

-- Dominada
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Dominada'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14291301-Wide-Grip-Pull-Up_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con las manos a una anchura algo mayor que la de los hombros y las palmas hacia delante, sube el cuerpo mediante la flexión de los brazos hasta pasar la cabeza sobre la barra.', 'Desciende lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Dominada')
);

-- Dominada a una mano
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Dominada a una mano'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/32901301-Weighted-One-Hand-Pull-up_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con una mano en agarre neutro (palma hacia el interior), sube el cuerpo mediante la flexión del brazo hasta llegar con la cabeza a la barra, inclinando hacia el lado contrario del brazo para compensar el peso.', 'Desciende lentamente.', 'Con la otra mano puedes coger peso para añadir dificultad.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Dominada a una mano')
);

-- Dominada a una mano asistida
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Dominada a una mano asistida'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/06381301-One-Arm-Chin-Up_back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con una mano en agarre supino (palma hacia atrás) y otra mano en una cuerda o toalla más abajo y enganchada al otro lado de la barra, sube el cuerpo mediante la flexión del brazo hasta llegar con la cabeza a la barra.', 'Desciende lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Dominada a una mano asistida')
);

-- Dominada Abierta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Dominada Abierta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/18661301-Wide-Grip-Pull-Up-on-Dip-Cage_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con las manos a una anchura mayor que la de los hombros y las palmas hacia delante, sube el cuerpo mediante la flexión de los brazos hasta pasar la cabeza sobre la barra.', 'Desciende lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Dominada Abierta')
);

-- Dominada Cerrada
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Dominada Cerrada'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17631301-Shoulder-Grip-Pull-up_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con las manos a la anchura de los hombros y las palmas hacia delante, sube el cuerpo mediante la flexión de los brazos hasta pasar la cabeza sobre la barra.', 'Desciende lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Dominada Cerrada')
);

-- Dominada Cerrada Corta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Dominada Cerrada Corta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01401301-Brachialis-Pull-up_Forearms_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con las manos a la anchura de los hombros y las palmas hacia delante, sube el cuerpo mediante media flexión de los brazos abriendo los codos hacia los lados.', 'Desciende lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Dominada Cerrada Corta')
);

-- Dominada Cerrada en Martillo
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Dominada Cerrada en Martillo'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/18651301-Hammer-Grip-Pull-up-on-Dip-Cage_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con las manos en posición neutra o de martillo, sube el cuerpo mediante la flexión de los brazos hasta pasar la cabeza sobre la barra.', 'Desciende lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Dominada Cerrada en Martillo')
);

-- Dominada Circular en Supinación
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Dominada Circular en Supinación'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/42071301-Chin-Up-Around-the-Bar_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con las manos a la anchura de los hombros y las palmas hacia atrás, sube lateralmente mediante la flexión de un brazo, luego iguala el otro brazo y relaja el primero, haciendo círculos en el ascenso.', 'Cambia el sentido de los círculos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Dominada Circular en Supinación')
);

-- Dominada en Supinación
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Dominada en Supinación'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13261301-Chin-Up_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con las manos a la anchura de los hombros y las palmas hacia atrás, sube el cuerpo mediante la flexión de los brazos hasta pasar la cabeza sobre la barra.', 'Desciende lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Dominada en Supinación')
);

-- Dominada Invertida
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Dominada Invertida'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04971301-Inverted-Row-II_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con las manos a una anchura algo mayor que la de los hombros y las palmas hacia delante, da la vuelta al cuerpo pasando las piernas flexionadas por delante de la barra de dominadas y quedando boca abajo.', 'Sube el cuerpo mediante la flexión de los brazos hasta tocar con las piernas en la barra.', 'Desciende lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Dominada Invertida')
);

-- Dominada Lateral
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Dominada Lateral'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/32931301-Archer-Pull-up_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con las manos a una anchura mayor que la de los hombros y las palmas hacia delante, sube lateralmente mediante la flexión de un brazo hasta pasar la cabeza sobre la barra.', 'Desciende lentamente.', 'Cambia de brazo al terminar la serie o alterna a un lado cada vez.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Dominada Lateral')
);

-- Dominada Mixta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Dominada Mixta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/06271301-Mixed-Grip-Chin-up_back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con las manos a una anchura algo mayor que la de los hombros y una palma hacia cada lado, sube el cuerpo mediante la flexión de los brazos hasta pasar la cabeza sobre la barra.', 'Desciende lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Dominada Mixta')
);

-- Dominada Trasera
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Dominada Trasera'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13671301-Wide-Grip-Rear-Pull-Up_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con las manos a una anchura algo mayor que la de los hombros y las palmas hacia delante, sube el cuerpo mediante la flexión de los brazos hasta dejar la barra tras la cabeza.', 'Desciende lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Dominada Trasera')
);

-- Elevación Completa con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Completa con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01071301-Barbell-Standing-Front-Raise-Over-Head_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos en pronación (palmas hacia abajo) a la anchura de los hombros.', 'Con los brazos estirados, eleva la barra frontalmente hasta tenerla sobre la cabeza.', 'Desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Completa con Barra')
);

-- Elevación de Cadera con flexión de rodillas v1
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de Cadera con flexión de rodillas v1'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/05701301-Leg-Pull-In-Flat-Bench_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba con las piernas rectas y los pies apoyados en el suelo, manteniendo las manos a los lados del cuerpo con las palmas hacia abajo.', 'Levanta lentamente las caderas del suelo, flexionando ligeramente las rodillas y llevando los muslos contra el abdomen.', 'Alcanza la posición más alta posible y luego baja las caderas de manera controlada hasta que vuelvan a tocar ligeramente el suelo, estirando de nuevo las piernas pero sin llegar a apoyar los pies.', 'Este ejercicio trabaja principalmente los músculos de los abdominales inferiores, fortaleciendo el núcleo y mejorando la estabilidad de la cadera.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de Cadera con flexión de rodillas v1')
);

-- Elevación de Cadera con flexión de rodillas v2
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de Cadera con flexión de rodillas v2'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/08651301-Lying-leg-hip-raise_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Acuéstate boca arriba sobre un banco con las piernas rectas, manteniendo las manos a los lados de la cabeza agarrando el propio banco.', 'Levanta lentamente las caderas del suelo, flexionando ligeramente las rodillas y llevando los muslos contra el abdomen.', 'Alcanza la posición más alta posible y luego baja las caderas de manera controlada estirando de nuevo las piernas pero sin llegar a descansar.', 'Este ejercicio trabaja principalmente los músculos de los abdominales inferiores, fortaleciendo el núcleo y mejorando la estabilidad de la cadera.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de Cadera con flexión de rodillas v2')
);

-- Elevación de Cadera con piernas estiradas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de Cadera con piernas estiradas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/11631301-Lying-Leg-Raise_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba con las piernas rectas y los pies apoyados en el suelo, manteniendo las manos a los lados del cuerpo con las palmas hacia abajo.', 'Levanta lentamente las caderas del suelo, manteniendo las rodillas estiradas.', 'Alcanza la posición más alta posible y luego baja las caderas de manera controlada hasta que vuelvan a tocar ligeramente el suelo, llevando las piernas a la posición inicial sin llegar a descansar.', 'Este ejercicio trabaja principalmente los músculos de los abdominales inferiores, fortaleciendo el núcleo y mejorando la estabilidad de la cadera.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de Cadera con piernas estiradas')
);

-- Elevación de Cadera con piernas estiradas v2
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de Cadera con piernas estiradas v2'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Glúteo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/40581301-Leg-Raise-Dragon-Flag_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Glúteo']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Acuéstate boca arriba sobre un banco con las piernas rectas y las manos agarrando el banco por encima de la cabeza.', 'Levanta las caderas.', 'Luego levanta lentamente las piernas, manteniendo las rodillas estiradas.', 'Alcanza la posición más alta posible y luego baja las caderas de manera controlada a la vez que las piernas, llevando las piernas a la posición inicial sin llegar a descansar.', 'Este ejercicio trabaja principalmente los músculos de los abdominales inferiores, fortaleciendo el núcleo y mejorando la estabilidad de la cadera.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de Cadera con piernas estiradas v2')
);

-- Elevación de Cadera con piernas flexionadas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de Cadera con piernas flexionadas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/04841301-Hip-Raise-bent-knee_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba con las rodillas dobladas y los pies apoyados en el suelo, manteniendo las manos a los lados del cuerpo con las palmas hacia abajo.', 'Levanta lentamente las caderas del suelo, manteniendo las rodillas dobladas en un ángulo de aproximadamente 90 grados.', 'Alcanza la posición más alta posible y luego baja las caderas de manera controlada hasta que vuelvan a tocar ligeramente el suelo.', 'Este ejercicio trabaja principalmente los músculos de los abdominales inferiores, fortaleciendo el núcleo y mejorando la estabilidad de la cadera.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de Cadera con piernas flexionadas')
);

-- Elevación de piernas alternas Colgado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de piernas alternas Colgado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/08581301-Wind-Sprints_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Cuélgate de una barra de dominadas con las manos hacia delante a una anchura algo superior a la de los hombros.', 'Flexiona las rodillas a 90º y eleva una hacia delante, mediante la contracción del abdomen hasta tener la rodilla a la altura de la cadera.', 'Desciende de forma controlada mientras subes la otra pierna.', 'Evita balanceos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de piernas alternas Colgado')
);

-- Elevación de piernas colgado con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de piernas colgado con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/28871301-Cable-Hanging-Leg-Raise_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Agarra una correa a los pies y ésta a una polea baja (o dos, una a cada lado).', 'Colgado de una barra de dominadas con los brazos extendidos y las manos a una anchura superior a la de los hombros, levanta las piernas con ellas extendidas hacia el frente, formando un ángulo de 90º con el cuerpo (sin balanceos).']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de piernas colgado con Polea')
);

-- Elevación de piernas con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de piernas con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10021301-Band-Lying-Straight-Leg-Raise_Hips_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Túmbate hacia arriba en el suelo, con las piernas estiradas y una banda en cada pie, conectadas previamente a algún soporte a la misma altura.', 'Pon las manos tras la cabeza.', 'Levanta las piernas completamente estiradas, tirando de la parte baja del abdomen, hasta ponerlas perpendiculares al suelo.', 'Desciende lentamente y repite.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de piernas con Bandas')
);

-- Elevación de Piernas con torsión en soporte
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de Piernas con torsión en soporte'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/28021301-Twisted-Leg-Raise_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Apoya la espalda y los antebrazos en el soporte, con las manos agarradas.', 'Eleva las piernas con ellas totalmente estiradas mediante la contracción del abdomen hasta tener los pies frente a la cadera (piernas a 90º del torso).', 'Desciende de forma controlada hacia un lado.', 'Vuelve a subir y desciende hacia el otro lado.', 'Evita balanceos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de Piernas con torsión en soporte')
);

-- Elevación de piernas en Fitball
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de piernas en Fitball'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/06501301-Pull-In-on-stability-ball_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Fitball'::text as equipment,
  ARRAY['Túmbate hacia abajo sobre el fitball.', 'Apoya las manos en el suelo y deslízate hacia delante hasta lograr apoyar los pies sobre el fitball y las manos justo debajo de los hombros.', 'Procura apretar el abdomen para que la lumbar no se vaya hacia el suelo y quede protegida.', 'Comienza a realizar los encogimientos llevando las rodillas hacia el pecho manteniendo todo el cuerpo por encima de la pelota y las manos siempre debajo de los hombros.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de piernas en Fitball')
);

-- Elevación de piernas estiradas Colgado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de piernas estiradas Colgado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04751301-Hanging-Straight-Leg-Raise_Hips_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Cuélgate de una barra de dominadas con las manos hacia delante a la anchura de los hombros.', 'Eleva las piernas con ellas totalmente estiradas mediante la contracción del abdomen hasta tener los pies frente a la cadera (piernas a 90º del torso).', 'Desciende de forma controlada y vuelve a subir evitando balanceos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de piernas estiradas Colgado')
);

-- Elevación de piernas estiradas en soporte
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de piernas estiradas en soporte'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/29631301-Captains-Chair-Straight-Leg-Raise_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Apoya la espalda y los antebrazos en el soporte, con las manos agarradas.', 'Eleva las piernas con ellas totalmente estiradas mediante la contracción del abdomen hasta tener los pies frente a la cadera (piernas a 90º del torso).', 'Desciende de forma controlada y vuelve a subir evitando balanceos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de piernas estiradas en soporte')
);

-- Elevación de piernas flexionadas Colgado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de piernas flexionadas Colgado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17641301-Hanging-Leg-Hip-Raise_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Cuélgate de una barra de dominadas con las manos hacia delante a una anchura algo superior a la de los hombros.', 'Eleva las piernas con ellas flexionadas mediante la contracción del abdomen hasta tener las rodillas delante del pecho.', 'Desciende de forma controlada y vuelve a subir evitando balanceos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de piernas flexionadas Colgado')
);

-- Elevación de piernas flexionadas en soporte
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de piernas flexionadas en soporte'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/08261301-Vertical-Leg-Raise-on-parallel-bars_Hips_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Apoya la espalda y los antebrazos en el soporte, con las manos agarradas.', 'Eleva las piernas con ellas flexionadas mediante la contracción del abdomen hasta tener las rodillas delante del pecho.', 'Desciende de forma controlada y vuelve a subir evitando balanceos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de piernas flexionadas en soporte')
);

-- Elevación de piernas laterales Colgado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de piernas laterales Colgado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17611301-Hanging-Oblique-Knee-Raise_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Cuélgate de una barra de dominadas con las manos hacia delante a una anchura algo superior a la de los hombros.', 'Eleva las piernas con ellas juntas y flexionadas hacia un lado, mediante la contracción del abdomen hasta tener las rodillas a la altura del pecho (hacia un lado).', 'Desciende de forma controlada y vuelve a subir hacia el otro lado evitando balanceos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de piernas laterales Colgado')
);

-- Elevación de rodillas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de rodillas'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/35561301-High-Knee-Run_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['La forma eficiente de hacer este ejercicio es elevando las rodillas constantemente a la altura de la cadera, manteniendo la espalda recta, el pecho erguido, los abdominales contraídos y las rodillas suaves al impacto.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de rodillas')
);

-- Elevación de rodillas con apoyo
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación de rodillas con apoyo'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36361301-High-Knee-against-wall_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['La forma eficiente de hacer este ejercicio es elevando las rodillas constantemente sobre la altura de la cadera, manteniendo el torso recto con los brazos apoyados en una pared.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación de rodillas con apoyo')
);

-- Elevación Frontal Aislada en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Frontal Aislada en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01611301-Cable-Forward-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie de espaldas a la polea, con la espalda recta y las piernas ligeramente separadas, coge la barra con la mano en pronación (palma hacia abajo).', 'Con el brazo rectos, eleva la barra hasta subir la mano a la altura de los hombros y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Frontal Aislada en Polea')
);

-- Elevación Frontal Cerrada en Pronación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Frontal Cerrada en Pronación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01191301-Barbell-Upright-Row-II_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos en pronación (palmas hacia abajo) a una anchura muy inferior a la de los hombros.', 'Con los brazos algo flexionados, eleva la barra hasta subir las manos a la altura de los hombros y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Frontal Cerrada en Pronación con Barra')
);

-- Elevación Frontal con giros con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Frontal con giros con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/39861301-EZ-bar-Front-Twist-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Z'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos en pronación (palmas hacia abajo) a la anchura de los hombros.', 'Con los brazos rectos, eleva la barra hasta subir las manos un poco por encima de la altura de los hombros.', 'Una vez subida, gira hacia un lado y hacia el otro, inclinando la barra 45° a cada lado y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Frontal con giros con Barra Z')
);

-- Elevación Frontal con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Frontal con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03091301-Dumbbell-Front-Raise-II_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la mancuerna por delante del cuerpo con las dos manos y los dedos entrelazados.', 'Con los brazos rectos, eleva las mancuernas frontalmente hasta ponerlas a la altura de la cabeza y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Frontal con Mancuerna')
);

-- Elevación Frontal Declinada Abierta con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Frontal Declinada Abierta con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04451301-EZ-Barbell-Anti-Gravity-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Z'::text as equipment,
  ARRAY['Túmbate hacia abajo en un banco declinado, apoyando el pecho en el respaldo y con los pies en el suelo.', 'Coge la barra con las manos en pronación (palmas hacia abajo) a la anchura máxima posible.', 'Con los codos ligeramente flexionados, eleva la barra hasta tener los brazos perpendiculares al cuerpo y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Frontal Declinada Abierta con Barra Z')
);

-- Elevación Frontal Declinada con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Frontal Declinada con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/39801301-Dumbbell-Incline-Front-Raise-with-Chest-Support_Shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate hacia abajo en un banco declinado, apoyando el pecho en el respaldo y con los pies en el suelo.', 'Coge una mancuerna con ambas manos y los dedos entrelazados.', 'Con los codos ligeramente flexionados, eleva la mancuerna hasta ponerla a la altura de la cabeza y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Frontal Declinada con Mancuerna')
);

-- Elevación Frontal Declinada en Pronación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Frontal Declinada en Pronación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/37221301-Barbell-Incline-Lying-Rear-Delt-Raise_Shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Túmbate hacia abajo en un banco declinado, apoyando el pecho en el respaldo y con los pies en el suelo.', 'Coge la barra con las manos en pronación (palmas hacia abajo) a la anchura de los hombros.', 'Con los codos ligeramente flexionados, eleva la barra hasta poner la barra a la altura de la cabeza y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Frontal Declinada en Pronación con Barra')
);

-- Elevación Frontal en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Frontal en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01621301-Cable-Front-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie de espaldas a la polea, con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos en pronación (palmas hacia abajo) a la anchura de los hombros.', 'Con los brazos rectos, eleva la barra hasta subir las manos un poco por encima de la altura de los hombros y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Frontal en Polea')
);

-- Elevación Frontal en Pronación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Frontal en Pronación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00411301-Barbell-Front-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos en pronación (palmas hacia abajo) a la anchura de los hombros.', 'Con los brazos rectos, eleva la barra hasta subir las manos un poco por encima de la altura de los hombros y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Frontal en Pronación con Barra')
);

-- Elevación Frontal Horizontal en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Frontal Horizontal en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/42271301-Cable-Lying-Front-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Tumbado hacia arriba en el suelo con los pies cerca de la polea, coge la barra en pronación (palmas hacia abajo) a la anchura de los hombros.', 'Con los brazos estirados, sube la barra hasta tenerlos verticales.', 'Desciende de forma controlada sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Frontal Horizontal en Polea')
);

-- Elevación Frontal Inclinada en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Frontal Inclinada en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/40141301-Cable-Standing-Front-Raise-Variation_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge la barra con las manos en pronación (palmas hacia abajo) a la anchura de los hombros.', 'Con los brazos rectos, eleva la barra hasta subir las manos un poco por encima de la altura de los hombros, inclinando hacia un lado 45° de forma que una mano quede por encima de la otra y desciende de nuevo de forma controlada.', 'Cambia de lado en cada repetición o al terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Frontal Inclinada en Polea')
);

-- Elevación Frontal Inclinada en Supinación con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Frontal Inclinada en Supinación con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/39891301-EZ-bar-Incline-Front-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Z'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco inclinado, coge la barra con las manos en supinación a la anchura de los hombros.', 'Con los codos ligeramente flexionados, eleva la barra hasta poner los brazos perpendiculares al cuerpo y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Frontal Inclinada en Supinación con Barra Z')
);

-- Elevación Lateral Aislada con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Lateral Aislada con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09771301-Band-front-lateral-raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, agarra la banda por delante del cuerpo, con el brazo contrario a donde esté enganchada y la palma hacia el cuerpo.', 'Sin balanceo ni impulso, eleva la mano hacia el lateral en diagonal con la mano mirando hacia abajo.', 'Desciende de forma controlada sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Lateral Aislada con Banda')
);

-- Elevación Lateral Aislada en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Lateral Aislada en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01921301-Cable-One-Arm-Lateral-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie al lado de la polea con las piernas separadas, agarra la polea con el brazo más alejado y la palma hacia el cuerpo.', 'Sin balanceo ni impulso, eleva la mano hacia el lateral con la mano mirando hacia abajo.', 'Desciende de forma controlada sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Lateral Aislada en Polea')
);

-- Elevación Lateral Concentrada en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Lateral Concentrada en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/38801301-Cable-Leaning-Lateral-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie al lado de la polea con los pies juntos justo en el mástil, agarra la polea con el brazo más alejado y la palma hacia el cuerpo.', 'Con la otra mano agarra el mástil a la altura del hombro y deja caer el cuerpo al lado contrario formando una V.', 'Sin balanceo ni impulso, eleva la mano hacia el lateral con la mano mirando hacia abajo.', 'Desciende de forma controlada sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Lateral Concentrada en Polea')
);

-- Elevación Lateral en Punta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Lateral en Punta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/32371301-Landmine-Lateral-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['De pie lateralmente en el extremo de la barra, con las piernas separadas y la espalda recta, coge el extremo de la barra con la mano más cercana a ella y llévala a la altura de la cadera a la pierna contraria.', 'Desde ahí realiza la subida en diagonal, con el brazo completamente estirado.', 'Luego desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Lateral en Punta')
);

-- Elevación Lateral Horizontal Aislada con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Lateral Horizontal Aislada con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03411301-Dumbbell-Lying-One-Arm-Deltoid-Rear_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado de lado sobre un banco plano, coge una mancuerna con el brazo superior, con el brazo paralelo al suelo y el codo flexionado de forma que la mancuerna esté hacia abajo.', 'Eleva el brazo hasta ponerlo vertical manteniendo la flexión del codo.', 'Con la otra mano puedes agarrar el banco.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Lateral Horizontal Aislada con Mancuerna')
);

-- Elevación Lateral Horizontal en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Lateral Horizontal en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/29241301-Cable-Side-Lying-Lateral-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Tumbado de lado en el suelo con los pies cerca de la polea, coge el agarre con el brazo superior y la palma de la mano hacia el suelo.', 'Con el brazo estirado, eleva la mano hasta tener el brazo vertical.', 'Aguanta un poco y desciende de forma controlada sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Lateral Horizontal en Polea')
);

-- Elevación Lateral Inclinada Aislada con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Lateral Inclinada Aislada con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03231301-Dumbbell-Incline-One-Arm-Lateral-Raise_shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Tumbado de lado sobre un banco inclinado, coge una mancuerna con el brazo superior, con el brazo estirado y paralelo al cuerpo.', 'Eleva el brazo hasta ponerlo en vertical y desciende de forma controlada.', 'Con la otra mano puedes agarrar el banco.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Lateral Inclinada Aislada con Mancuerna')
);

-- Elevación Total Colgado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Total Colgado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04731301-Hanging-Pike_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Cuélgate de una barra de dominadas con las manos hacia delante a una anchura algo superior a la de los hombros.', 'Flexiona las piernas hacia delante, con los muslos a 90° del torso y también de los gemelos.', 'Manteniendo esa posición de las piernas, eleva todo el cuerpo mediante la contracción del abdomen hasta tener los pies sobre la altura de la barra.', 'Desciende de forma controlada y vuelve a subir evitando balanceos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Total Colgado')
);

-- Elevación Trasera con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevación Trasera con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00751301-Barbell-Rear-Delt-Raise_shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie coge la barra tras el cuerpo con las manos en pronación, con agarre algo más ancho de los hombros.', 'Eleva la barra por detrás flexionando los brazos, aguanta un segundo y vuelve a bajar de forma controlada.', 'La espalda siempre recta y sin ningún tipo de balanceo corporal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevación Trasera con Barra')
);

-- Elevaciones Circulares con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Circulares con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/21431301-Dumbbell-Standing-Around-World_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta, agarra una mancuerna en cada mano por delante del cuerpo con las palmas hacia el frente (supinación).', 'Sin balanceo ni impulso, eleva las pesas hacia el lateral hasta que los brazos queden paralelos al suelo y las manos mirando hacia delante.', 'A continuación lleva las manos a arriba por encima de la cabeza quedando los brazos extendidos y las palmas también hacia delante.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Circulares con Mancuernas')
);

-- Elevaciones Completas con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Completas con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10171301-Band-Y-raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge las bandas con las manos en pronación (palmas hacia abajo) por delante del cuerpo.', 'Con los brazos estirados, eleva las mancuernas frontalmente hasta tenerlas sobre la cabeza, a los lados.', 'Desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Completas con Bandas')
);

-- Elevaciones Completas con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Completas con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04191301-Dumbbell-Standing-Front-Raise-Above-Head_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge las mancuernas con las manos en pronación (palmas hacia abajo) a la anchura de los hombros.', 'Con los brazos estirados, eleva las mancuernas frontalmente hasta tenerlas sobre la cabeza.', 'Desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Completas con Mancuernas')
);

-- Elevaciones Frontales con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Frontales con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09781301-Band-front-raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge los extremos de la banda con las manos en pronación (palmas hacia atrás) y ponlas delante del cuerpo.', 'Con los brazos rectos, eleva las manos frontalmente hasta ponerlas a la altura de la cabeza y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Frontales con Banda')
);

-- Elevaciones Frontales Declinadas en Pronación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Frontales Declinadas en Pronación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/35411301-Dumbbell-Incline-Y-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate hacia abajo en un banco declinado, apoyando el pecho en el respaldo y con los pies en el suelo.', 'Coge las mancuernas con las manos en pronación (palmas hacia atrás) a la anchura de los hombros.', 'Con los codos ligeramente flexionados, eleva las mancuernas hasta ponerlas a la altura de la cabeza y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Frontales Declinadas en Pronación con Mancuernas')
);

-- Elevaciones Frontales Declinadas Neutras con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Frontales Declinadas Neutras con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/42361301-Dumbbell-Incline-Two-Front-Raise-with-Chest-Support_Shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate hacia abajo en un banco declinado, apoyando el pecho en el respaldo y con los pies en el suelo.', 'Coge las mancuernas con las manos en martillo o agarre neutro (palmas hacia el interior) a la anchura de los hombros.', 'Con los codos ligeramente flexionados, eleva las mancuernas hasta ponerlas a la altura de la cabeza y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Frontales Declinadas Neutras con Mancuernas')
);

-- Elevaciones Frontales en Pronación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Frontales en Pronación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03101301-Dumbbell-Front-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge las mancuernas con las manos en pronación (palmas hacia atrás) y ponlas delante del cuerpo.', 'Con los brazos rectos, eleva las mancuernas frontalmente hasta ponerlas a la altura de la cabeza y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Frontales en Pronación con Mancuernas')
);

-- Elevaciones Frontales en Supinación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Frontales en Supinación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/39111301-Dumbbell-Low-Fly_Chest_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge las mancuernas con las manos en supinación (palmas hacia delante) y ponlas delante del cuerpo.', 'Con los brazos rectos, eleva las mancuernas frontalmente hasta ponerlas a la altura de la cabeza y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Frontales en Supinación con Mancuernas')
);

-- Elevaciones Frontales Inclinadas con giro con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Frontales Inclinadas con giro con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03251301-Dumbbell-Incline-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco inclinado, deja caer los brazos a los lados y coge las mancuernas con las manos en agarre neutro (palmas hacia dentro).', 'Con los brazos estirados, eleva las mancuernas frontalmente hasta tenerlas a la altura de los hombros, girando las muñecas de forma que queden en pronación (palmas hacia abajo) y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Frontales Inclinadas con giro con Mancuernas')
);

-- Elevaciones Frontales Inclinadas en Pronación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Frontales Inclinadas en Pronación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/11761301-Dumbbell-Incline-Front-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco inclinado, coge las mancuernas con las manos en pronación (palmas hacia abajo) a la anchura de los hombros.', 'Con los codos ligeramente flexionados, eleva las mancuernas hasta poner los brazos perpendiculares al cuerpo y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Frontales Inclinadas en Pronación con Mancuernas')
);

-- Elevaciones Lateral - Frontal Alto con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Lateral - Frontal Alto con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/42381301-Dumbbell-Seated-Lateral-to-Front-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentado con la espalda recta, agarra una mancuerna en cada mano con las palmas hacia el cuerpo.', 'Sin balanceo ni impulso, eleva las pesas hacia el lateral hasta que los brazos queden paralelos al suelo y las manos mirando hacia abajo.', 'A continuación lleva las manos al frente por encima de la cabeza y con una pequeña rotación de los hombros hacia el interior.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Lateral - Frontal Alto con Mancuernas')
);

-- Elevaciones Lateral - Frontal con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Lateral - Frontal con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03351301-Dumbbell-Lateral-to-Front-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta, agarra una mancuerna en cada mano con las palmas hacia el cuerpo.', 'Sin balanceo ni impulso, eleva las pesas hacia el lateral hasta que los brazos queden paralelos al suelo y las manos mirando hacia abajo.', 'A continuación lleva las manos al frente del pecho y con una pequeña rotación de los hombros hacia el interior.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Lateral - Frontal con Mancuernas')
);

-- Elevaciones Laterales con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Laterales con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15081301-Band-Lateral-Raise-Version-2_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, agarra un extremo de la banda con cada mano con las palmas hacia el cuerpo.', 'Sin balanceo ni impulso, eleva las manos hacia el lateral con los brazos estirados, hasta que los brazos queden paralelos al suelo y las manos mirando hacia abajo.', 'Aprieta los hombros y aguanta durante uno o dos segundos.', 'Desciende de forma controlada sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Laterales con Banda')
);

-- Elevaciones Laterales Declinadas con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Laterales Declinadas con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03261301-Dumbbell-Incline-Rear-Lateral-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate hacia abajo en un banco declinado, apoyando el pecho en el respaldo y con los pies en el suelo.', 'Coge las mancuernas con las manos en martillo o agarre neutro (palmas hacia el interior) por delante del cuerpo dejando los brazos hacia abajo.', 'Con los codos ligeramente flexionados, eleva las mancuernas lateralmente hasta ponerlas a la altura de los hombros y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Laterales Declinadas con Mancuernas')
);

-- Elevaciones Laterales Declinadas en Pronación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Laterales Declinadas en Pronación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03861301-Dumbbell-Rotation-Reverse-Fly_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate hacia abajo en un banco declinado, apoyando el pecho en el respaldo y con los pies en el suelo.', 'Coge las mancuernas con las manos en pronación (palmas hacia el suelo) por delante del cuerpo creando un ángulo de 90º entre torso y brazos.', 'Con los codos ligeramente flexionados, eleva las mancuernas lateralmente hasta ponerlas a la altura de los hombros y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Laterales Declinadas en Pronación con Mancuernas')
);

-- Elevaciones Laterales Declinadas en Supinación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Laterales Declinadas en Supinación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/35421301-Dumbbell-Incline-T-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate hacia abajo en un banco declinado, apoyando el pecho en el respaldo y con los pies en el suelo.', 'Coge las mancuernas con las manos en supinación (palmas hacia delante) a la anchura de los hombros.', 'Con los codos ligeramente flexionados, eleva las mancuernas lateralmente hasta ponerlas a la altura de la cabeza y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Laterales Declinadas en Supinación con Mancuernas')
);

-- Elevaciones Laterales Declinadas Neutras con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Laterales Declinadas Neutras con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03831301-Dumbbell-Reverse-Fly_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate hacia abajo en un banco declinado, apoyando el pecho en el respaldo y con los pies en el suelo.', 'Coge las mancuernas con las manos en martillo o agarre neutro (palmas hacia el interior) por delante del cuerpo creando un ángulo de 90º entre torso y brazos.', 'Con los codos ligeramente flexionados, eleva las mancuernas lateralmente hasta ponerlas a la altura de los hombros y desciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Laterales Declinadas Neutras con Mancuernas')
);

-- Elevaciones Laterales Delanteras con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Laterales Delanteras con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/24701301-Dumbbell-Lying-on-Floor-Rear-Delt-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Tumbado de lado con las piernas juntas y flexionadas, pon la mano de abajo sujetando la cabeza (o en alguna postura cómoda) y agarra una mancuerna con la otra, con el brazo estirado hacia delante y la palma hacia el suelo.', 'Sin balanceo ni impulso, eleva la pesa hacia el lateral con el brazo estirado hasta que quede perpendicular al suelo.', 'Aprieta los hombros y aguanta durante uno o dos segundos.', 'Desciende de forma controlada sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Laterales Delanteras con Mancuernas')
);

-- Elevaciones Laterales en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Laterales en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33431301-Lever-Lateral-Raise-VERSION-2_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Con la espalda recta coge un agarre con cada mano y sin balanceo ni impulso, eleva los soportes hacia el lateral y flexiona ligeramente los codos, hasta que los brazos queden paralelos al suelo y las manos mirando hacia abajo.', 'Aprieta los hombros y aguanta durante uno o dos segundos.', 'Desciende de forma controlada sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Laterales en Máquina')
);

-- Elevaciones Laterales en Supinación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Laterales en Supinación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03111301-Dumbbell-Full-Can-Lateral-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, agarra una mancuerna en cada mano con las palmas hacia delante.', 'Sin balanceo ni impulso, eleva las pesas hacia el lateral, hasta que los brazos queden paralelos al suelo.', 'Aprieta los hombros y aguanta durante uno o dos segundos.', 'Desciende de forma controlada sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Laterales en Supinación con Mancuernas')
);

-- Elevaciones Laterales Horizontales con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Laterales Horizontales con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04081301-Dumbbell-Side-Lying-One-Hand-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Tumbado de lado en un banco o el suelo, pon la mano de abajo sujetando la cabeza (o en alguna postura cómoda) y agarra una mancuerna con la otra, con el brazo estirado sobre la pierna y la palma hacia el suelo.', 'Sin balanceo ni impulso, eleva la pesa hacia arriba con el brazo estirado hasta alcanzar un ángulo aproximado de 90º con el torso.', 'Aprieta los hombros y aguanta durante uno o dos segundos.', 'Desciende de forma controlada sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Laterales Horizontales con Mancuernas')
);

-- Elevaciones Laterales Neutras con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Elevaciones Laterales Neutras con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03341301-Dumbbell-Lateral-Raise_shoulder-AFIX_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, agarra una mancuerna en cada mano con las palmas hacia el cuerpo.', 'Sin balanceo ni impulso, eleva las pesas hacia el lateral y flexiona ligeramente los codos, hasta que los brazos queden paralelos al suelo y las manos mirando hacia abajo.', 'Aprieta los hombros y aguanta durante uno o dos segundos.', 'Desciende de forma controlada sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Elevaciones Laterales Neutras con Mancuernas')
);

-- Encogimiento Aislado con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimiento Aislado con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/40531301-Dumbbell-Seated-Gittleson-Shrug_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentado con la espalda recta, coge una mancuerna con una mano con agarre neutro o martillo (palma hacia el interior) al lado del cuerpo.', 'Encoge el hombro sin flexionar los brazos, subiendo y bajando el peso exclusivamente con el trapecio e inclinando el cuello para mayor congestión.', 'Termina la serie y cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimiento Aislado con Mancuerna')
);

-- Encogimientos con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10181301-Band-shrug_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge un extremo de la banda con cada mano a los lados del cuerpo y las palmas hacia dentro.', 'Encoge los hombros sin flexionar los brazos, subiendo y bajando el peso exclusivamente con el trapecio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos con Banda')
);

-- Encogimientos con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04061301-Dumbbell-Shrug_Back-FIX_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge una mancuerna con cada mano a los lados del cuerpo y las palmas hacia dentro.', 'Encoge los hombros sin flexionar los brazos, subiendo y bajando el peso exclusivamente con el trapecio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos con Mancuernas')
);

-- Encogimientos Concentrados en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos Concentrados en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14391301-Lever-Gripless-Shrug-VERSION-2_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, pon los hombros bajo los soportes acolchados.', 'Encoge los hombros subiendo y bajando el peso exclusivamente con el trapecio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos Concentrados en Máquina')
);

-- Encogimientos Declinados con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos Declinados con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03041301-Dumbbell-Decline-Shrug-II_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Tumbado en un banco inclinado con el pecho apoyado en el respaldo y los pies en el suelo, coge una mancuerna con cada mano a los lados del cuerpo y las palmas hacia dentro.', 'Encoge los hombros sin flexionar los brazos, subiendo y bajando el peso exclusivamente con el trapecio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos Declinados con Mancuernas')
);

-- Encogimientos Delanteros con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos Delanteros con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00951301-Barbell-Shrug_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge una barra por delante del cuerpo con las manos en pronación (palmas hacia atrás) a una anchura algo superior a la de los hombros.', 'Encoge los hombros sin flexionar los brazos, subiendo y bajando el peso exclusivamente con el trapecio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos Delanteros con Barra')
);

-- Encogimientos en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/06041301-Lever-Shrug-plate-loaded_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, agarra los soportes con los brazos extendidos.', 'Encoge los hombros subiendo y bajando el peso exclusivamente con el trapecio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos en Máquina')
);

-- Encogimientos en Paralelas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos en Paralelas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/41761301-Shrug-on-parallel-bars_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Estira los brazos sobre las barras paralelas y flexiona las piernas.', 'Con los brazos bien estirados, encoge los hombros y deja caer el cuerpo, subiendo y bajando el peso con el trapecio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos en Paralelas')
);

-- Encogimientos en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02201301-Cable-Shrug_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge la barra por delante del cuerpo con las manos en pronación (palmas hacia atrás) a una anchura algo inferior a la de los hombros.', 'Encoge los hombros sin flexionar los brazos, subiendo y bajando el peso exclusivamente con el trapecio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos en Polea')
);

-- Encogimientos en Press Militar con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos en Press Militar con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/29281301-Barbell-Overhead-Shrug_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge una barra con las manos en pronación (palmas hacia atrás) a una anchura superior a la de los hombros y súbela sobre la cabeza volteando los brazos (palmas que queden hacia delante) y estirando bien.', 'Encoge los hombros sin flexionar los brazos, subiendo y bajando el peso exclusivamente con el trapecio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos en Press Militar con Barra')
);

-- Encogimientos Horizontales en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos Horizontales en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/42261301-Cable-Lying-Shrug_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Tumbado hacia arriba con los pies hacia la polea, coge la barra con las manos en pronación a la anchura de los hombros.', 'Encoge los hombros y vuelve a bajar, todo con los brazos estirados moviendo el peso con el trapecio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos Horizontales en Polea')
);

-- Encogimientos Inclinados con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos Inclinados con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03291301-Dumbbell-Incline-Shrug_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Sentado en un banco inclinado, coge una mancuerna con cada mano a los lados del cuerpo y las palmas hacia dentro.', 'Encoge los hombros sin flexionar los brazos, subiendo y bajando el peso exclusivamente con el trapecio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos Inclinados con Mancuernas')
);

-- Encogimientos Laterales con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos Laterales con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03761301-Dumbbell-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge una con cada mano a los lados del cuerpo y las palmas hacia dentro.', 'Flexiona los codos hacia fuera subiendo las mancuernas a los costados del pecho, y baja de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos Laterales con Mancuernas')
);

-- Encogimientos Libres en Banco
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos Libres en Banco'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/30121301-Scapula-Dips_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Ponte en el lateral de un banco y apoya las manos en él a la anchura de los hombros, de espaldas (como si fueses a hacer fondos entre bancos).', 'Apoya los pies en el suelo con las rodillas flexionadas a 90°.', 'Con la espalda y los brazos rectos, deja caer el peso cargándolo en el trapecio y encoge los hombros todo lo que puedas.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos Libres en Banco')
);

-- Encogimientos Sentado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos Sentado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/40161301-Barbell-Seated-Shrug_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['Sentado en un banco o similar, con las piernas juntas y el cuerpo ligeramente inclinado hacia delante, coge una barra por detrás de las piernas con las manos en pronación (palmas hacia atrás) a una anchura algo superior a la de los hombros.', 'Encoge los hombros sin flexionar los brazos, subiendo y bajando el peso exclusivamente con el trapecio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos Sentado con Barra')
);

-- Encogimientos Traseros con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Encogimientos Traseros con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/37301301-Barbell-Behind-The-Back-Shrug_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta, coge una barra por detrás del cuerpo con las manos en pronación (palmas hacia atrás) a una anchura algo superior a la de los hombros.', 'Encoge los hombros sin flexionar los brazos, subiendo y bajando el peso exclusivamente con el trapecio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Encogimientos Traseros con Barra')
);

-- Extensión Concentrada en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Concentrada en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01521301-Cable-Concentration-Extension-on-knee_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Coge la barra de la polea con una mano en supinación (palma hacia arriba).', 'Pon una rodilla en el suelo y la otra hacia delante flexionada 90º.', 'Apoya la parte trasera del codo en el interior del muslo y estira el brazo hacia abajo.', 'Flexiona el codo de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Concentrada en Polea Alta')
);

-- Extensión Concentrada en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Concentrada en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01491301-Cable-Alternate-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie y de espaldas a la polea, coge la barra de la polea con una mano en supinación (palma hacia arriba).', 'Estira el brazo hacia arriba y con la otra mano agarra la parte trasera del codo para inmovilizar la parte superior del brazo.', 'Flexiona el codo hacia atrás y vuelve a estirar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Concentrada en Polea Baja')
);

-- Extensión de Cuádriceps Aislada con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Cuádriceps Aislada con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/35181301-Band-Seated-Leg-Extension-male_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Banco Plano, Bandas'::text as equipment,
  ARRAY['Sentado en un banco plano, agarra la banda en alguna parte baja y en tu tobillo.', 'Extiende la pierna hacia delante estirando la rodilla completamente.', 'Desciende sin relajar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Cuádriceps Aislada con Banda')
);

-- Extensión de Cuádriceps con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Cuádriceps con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01021301-Barbell-Squat-on-knees_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De rodillas en el suelo, coge una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Echa los glúteos hacia atrás casi apoyando sobre los talones.', 'A continuación ve hacia delante dejando las rodillas flexionadas a 90º y contrayendo los cuádriceps.', 'Aguante y retrocede lentamente sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Cuádriceps con Barra')
);

-- Extensión de Cuádriceps en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Cuádriceps en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/05851301-Lever-Leg-Extension_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina con los tobillos tras el rodillo, extiende las piernas hacia delante estirando las rodillas completamente.', 'Desciende sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Cuádriceps en Máquina')
);

-- Extensión de Gemelo Aislado con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelo Aislado con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09991301-Band-single-leg-calf-raise_Calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Pon la parte delantera de un pie sobre una plataforma como puede ser un step o un disco.', 'Pilla la banda con la plataforma y cogela con la mano del lado del pie apoyado.', 'La otra pierna ponla hacia atrás sin apoyar.', 'Ponte de puntillas estirando bien el gemelo y desciende, repetidamente hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelo Aislado con Banda')
);

-- Extensión de Gemelo Aislado Delantero con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelo Aislado Delantero con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10001301-Band-single-leg-reverse-calf-raise_Calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Pon la parte trasera de un pie sobre una plataforma como puede ser un step o un disco.', 'Pilla la banda con la plataforma y coge la con la mano del lado del pie apoyado.', 'La otra pierna ponla hacia atrás sin apoyar.', 'Sube y baja el tobillo todo lo que puedas, repetidamente hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelo Aislado Delantero con Banda')
);

-- Extensión de Gemelo Aislado en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelo Aislado en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13761301-Cable-Standing-One-Leg-Calf-Raise_Calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Agárrate la polea baja a la cintura, con una correa o cinturón.', 'Súbete en una plataforma, step o un disco alto apoyando solo la parte delantera del pie.', 'Desciende todo lo que puedas y sube estirando bien para la pie y el gemelo.', 'Aguanta arriba y desciende de nuevo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelo Aislado en Polea')
);

-- Extensión de Gemelo Aislado sentado con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelo Aislado sentado con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04001301-Dumbbell-Seated-One-Leg-Calf-Raise_calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas, Otro'::text as equipment,
  ARRAY['Sentado en un banco o similar, pon la parte delantera de un pie sobre una plataforma como puede ser un step o un disco.', 'La otra pierna ponla hacia atrás y coge una mancuerna sobre el muslo de la pierna a trabajar.', 'Ponte de puntillas estirando bien el gemelo y desciende, repetidamente hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelo Aislado sentado con Mancuerna')
);

-- Extensión de Gemelos con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15051301-Band-Calf-Raise-Version-3_Calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con los pies juntos, pisa el centro de la banda y coge cada extremo con una mano.', 'Flexiona los brazos hacia arriba poniendo las manos a los lados de los hombros con las palmas hacia delante.', 'Ponte de puntillas estirando bien los gemelos y desciende, repetidamente hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos con Banda')
);

-- Extensión de Gemelos Concentrada en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos Concentrada en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/12531301-Lever-Donkey-Calf-Raise_Calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Pon la parte delantera de los pies al borde de la plataforma.', 'Inclínate hacia delante poniendo la parte baja de la espalda bajo el soporte acolchado.', 'Ponte de puntillas estirando bien los gemelos y desciende, repetidamente hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos Concentrada en Máquina')
);

-- Extensión de Gemelos de pie
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos de pie'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02841301-Donkey-Calf-Raise_Calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Pon la parte delantera de los pies al borde de un step o plataforma.', 'Puedes ponerte de pie con las manos en algún soporte o pared o inclinarte hacia delante con las manos en un banco o similar.', 'Ponte de puntillas estirando bien los gemelos y desciende, repetidamente hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos de pie')
);

-- Extensión de Gemelos de pie con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos de pie con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01081301-Barbell-Standing-Leg-Calf-Raise_Calf_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga, Otro'::text as equipment,
  ARRAY['De pie con las piernas separadas a la anchura de los hombros coge una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Pon la parte delantera de los pies al borde de un step o plataforma.', 'Ponte de puntillas estirando bien los gemelos y desciende, repetidamente hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos de pie con Barra')
);

-- Extensión de Gemelos de pie con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos de pie con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04171301-Dumbbell-Standing-Calf-Raise_Calf_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas, Otro'::text as equipment,
  ARRAY['De pie con los pies casi juntos, coge una mancuerna con cada mano.', 'Pon la parte delantera de los pies al borde de un step o plataforma.', 'Ponte de puntillas estirando bien los gemelos y desciende, repetidamente hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos de pie con Mancuernas')
);

-- Extensión de Gemelos Declinada en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos Declinada en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/07421301-Sled-Forward-Angled-Calf-Raise_Calf_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Pon la parte delantera de los pies al borde de la plataforma, con los hombros bajo los soportes acolchados y el cuerpo apoyado hacia abajo en el respaldo Ponte de puntillas estirando bien los gemelos y desciende, repetidamente hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos Declinada en Máquina')
);

-- Extensión de Gemelos en Máquina con carga Inferior
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos en Máquina con carga Inferior'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/12201301-Lever-Calf-Raise-bench-press-machine_Calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Pon la parte delantera de los pies al borde de la plataforma y coge un agarre con cada mano con las palmas hacia atrás.', 'Ponte de puntillas estirando bien los gemelos y desciende, repetidamente hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos en Máquina con carga Inferior')
);

-- Extensión de Gemelos en Máquina con carga Superior
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos en Máquina con carga Superior'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/06051301-Lever-Standing-Calf-Raise_Calf_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Pon la parte delantera de los pies al borde de la plataforma, con los hombros bajo los soportes acolchados.', 'Ponte de puntillas estirando bien los gemelos y desciende, repetidamente hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos en Máquina con carga Superior')
);

-- Extensión de Gemelos en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13751301-Cable-Standing-Calf-Raise_Calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Pon un banco plano perpendicular a la polea.', 'Agárrate la polea baja a la cintura, con una correa o cinturón.', 'Súbete en el banco apoyando solo la parte delantera de los pies con ellos juntos.', 'Desciende todo lo que puedas y sube estirando bien los pies y los gemelos.', 'Aguanta arriba y desciende de nuevo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos en Polea')
);

-- Extensión de Gemelos en Prensa
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos en Prensa'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13911301-Sled-Calf-Press-On-Leg-Press_Calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Colócate con la espalda bien apoyada en el respaldo de la máquina inclinada a 45 grados y los pies al borde de la plataforma, apoyando solo la parte delantera y con escasa separación.', 'Ponte de puntillas estirando bien los gemelos y desciende, repetidamente hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos en Prensa')
);

-- Extensión de Gemelos Inclinada en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos Inclinada en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13831301-Hack-Calf-Raise_Calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Pon la parte delantera de los pies al borde de la plataforma, con los hombros bajo los soportes acolchados y el cuerpo apoyado hacia arriba en el respaldo Ponte de puntillas estirando bien los gemelos y desciende, repetidamente hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos Inclinada en Máquina')
);

-- Extensión de Gemelos sentado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos sentado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00881301-Barbell-Seated-Calf-Raise_Calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['Sentado en un banco o similar, con las piernas juntas, ponte una barra sobre las rodillas ayudando a mantenerla con las manos.', 'Ponte de puntillas estirando bien los gemelos y desciende, repetidamente hasta terminar la serie.', 'Puedes poner la parte delantera de los pies al borde de un step o plataforma para mayor recorrido.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos sentado con Barra')
);

-- Extensión de Gemelos sentado con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos sentado con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/41551301-Weighted-Seated-Calf-Raise_Calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas, Otro'::text as equipment,
  ARRAY['Siéntate en un banco o silla y pon la parte delantera de los pies al borde de un step o plataforma. ​Ponte de puntillas estirando bien los gemelos y desciende, repetidamente hasta terminar la serie.', 'Pon una mancuerna sobre los muslos para incrementar la dificultad.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos sentado con Mancuerna')
);

-- Extensión de Gemelos sentado en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Gemelos sentado en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/26661301-Lever-Seated-Calf-Raise-plate-loaded-VERSION-2_Calves_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado, pon la parte delantera de los pies al borde de la plataforma y con los muslos bajo los soportes acolchados.', 'Ponte de puntillas estirando bien los gemelos y desciende, repetidamente hasta terminar la serie.', 'Carga el peso que consideres.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Gemelos sentado en Máquina')
);

-- Extensión de Glúteos en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión de Glúteos en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33521301-Cable-Kneeling-Pull-Through_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De rodillas de espaldas a la polea, coge el agarre entre las piernas con las dos manos entrelazadas.', 'Con las piernas lo más flexionadas posibles (prácticamente sentado sobre tus gemelos), inclina el cuerpo hacia delante.', 'A continuación pon las rodillas a 90° poniendo el torso en vertical y apretando bien los glúteos.', 'Vuelve a la posición inicial y repite con movimientos controlados.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión de Glúteos en Polea')
);

-- Extensión Declinada con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Declinada con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03061301-Dumbbell-Decline-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco declinado, coge las mancuernas con agarre neutro (palmas hacia el interior), frente al pecho y estira los brazos.', 'Flexiona los codos ligeramente mientras desciendes las mancuernas hasta llegar detrás de la cabeza.', 'Vuelve a la posición inicial con el movimiento controlado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Declinada con Mancuernas')
);

-- Extensión Delante-Detrás con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Delante-Detrás con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/41571301-Dumbbell-Seated-Front-and-Back-Tate-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentados en un banco o similar, cogemos una mancuerna con cada mano y estiramos los brazos hacia arriba, con las manos en pronación (palmas hacia delante).', 'Flexionamos los codos 90º por delante de la cabeza, sin bajar los brazos.', 'Volvemos a estirar bien arriba y repetimos la flexión por detrás de la cabeza.', 'Estiramos de nuevo y repetimos los pasos hasta completar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Delante-Detrás con Mancuernas')
);

-- Extensión Diagonal en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Diagonal en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02301301-Cable-Standing-Lift_waist_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie al lado de una polea con las piernas ligeramente separadas y la espalda recta, coge el agarre con las dos manos entrelazadas y ponlo frente al lado de la cadera más cercano a la polea.', 'Realiza una extensión elevando los brazos semiflexionados en diagonal hacia arriba, haciendo un giro del torso para mayor congestión dorsal.', 'Desciende de nuevo lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Diagonal en Polea Baja')
);

-- Extensión en caída con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión en caída con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/37451301-Overhead-Triceps-Extension-with-Bed-Sheet_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie, engancha las bandas en algún lugar alto.', 'De espaldas, coge un extremo con cada mano, con los codos flexionados y las palmas hacia el cuerpo.', 'Déjate caer suavemente flexionando los brazos.', 'Estira de nuevo tirando de los tríceps para volver arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión en caída con Bandas')
);

-- Extensión Frontal Aislada con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Frontal Aislada con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15071301-Band-Hip-Flexion_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con las piernas juntas, pon la banda en algún lugar bajo y enrollada a tu tobillo.', 'Levanta la pierna hacia delante flexionando la rodilla a 90°.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Frontal Aislada con Banda')
);

-- Extensión Frontal Aislada en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Frontal Aislada en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33531301-Cable-One-Arm-High-Pulley-Overhead-Tricep-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con una pierna delante de otra y el cuerpo inclinado hacia delante de espaldas a la polea, coge la polea alta con la palma hacia delante y estira el brazo sobre la cabeza.', 'Desciende la polea por detrás de la cabeza flexionando el codo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Frontal Aislada en Polea Alta')
);

-- Extensión Frontal con Arnés
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Frontal con Arnés'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Cuello. Músculos: Cuello. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Cuello'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/08481301-Weighted-Seated-Neck-Extension-with-head-harness_Neck_720.gif'::text as gif_url,
  ARRAY['Cuello']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Sentado con el cuerpo inclinado hacia delante, colocar el arnés en la cabeza y engancharlo a un disco.', 'Tirar hacia atrás con el cuello y volver a la posición inicial de nuevo, todo con un movimiento lento y controlado y con el resto del cuerpo inmovilizado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Frontal con Arnés')
);

-- Extensión Frontal con Disco
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Frontal con Disco'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Cuello. Músculos: Cuello. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Cuello'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/10421301-Weighted-Lying-Neck-Extension_neck_720.gif'::text as gif_url,
  ARRAY['Cuello']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Tumbado hacia abajo en un banco, coger un disco y sostenerlo por detrás de la cabeza con ambas manos.', 'Tirar hacia atrás con el cuello y volver a la posición inicial de nuevo, todo con un movimiento lento y controlado y con el resto del cuerpo inmovilizado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Frontal con Disco')
);

-- Extensión Frontal en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Frontal en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10361301-Lever-Standing-Leg-Raise_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['De pie en la máquina con la espalda recta, ponte el rodillo en la parte baja del muslo, por delante.', 'Lleva la pierna hacia atrás ligeramente flexionada.', 'Comienza el movimiento llevando la pierna hacia delante hasta tener la rodilla a la altura de la cadera.', 'Después regresa lentamente a la posición inicial, sin dejar caer el peso bruscamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Frontal en Máquina')
);

-- Extensión Frontal en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Frontal en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Cuello. Músculos: Cuello. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Cuello'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/22821301-Lever-Neck-Extension-plate-loaded_Neck_720.gif'::text as gif_url,
  ARRAY['Cuello']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Apoyar la parte trasera de la cabeza sobre la almohadilla móvil de la máquina, empujar hacia atrás con el cuello y volver a la posición inicial de nuevo, todo con un movimiento lento y controlado y con el resto del cuerpo inmovilizado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Frontal en Máquina')
);

-- Extensión Frontal en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Frontal en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Cuello. Músculos: Cuello. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Cuello'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/24111301-Cable-Seated-Neck-Extension-with-head-harness_Neck_720.gif'::text as gif_url,
  ARRAY['Cuello']::text[] as musculos_involucrados,
  'Polea, Otro'::text as equipment,
  ARRAY['Sentado mirando hacia la polea, colocar el arnés en la cabeza y engancharlo a la polea baja.', 'Tirar hacia atrás con el cuello y volver a la posición inicial de nuevo, todo con un movimiento lento y controlado y con el resto del cuerpo inmovilizado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Frontal en Polea')
);

-- Extensión hacia abajo con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión hacia abajo con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15021301-Band-Pushdown-Male_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Coloca las bandas en un lugar alto sobre la cabeza.', 'De pie con la espalda recta, coge un extremo con cada mano y estira los brazos hacia abajo.', 'Aguanta y flexiona los codos de nuevo, llegando lo más arriba posible sin llegar a relajar el músculo ni descansar.', 'Estira de nuevo con movimientos controlados.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión hacia abajo con Bandas')
);

-- Extensión Horizontal con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Horizontal con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/17201301-Barbell-Lying-Back-of-the-Head-Tricep-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco, coge la barra a una anchura algo inferior de los hombros con las palmas hacia arriba, frente al pecho y estira los brazos.', 'Flexiona los codos y desciende la barra hasta llegar detrás de la cabeza.', 'Vuelve a la posición inicial con el movimiento controlado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Horizontal con Barra')
);

-- Extensión Horizontal con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Horizontal con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/17481301-EZ-Bar-Lying-Close-Grip-Triceps-Extension-Behind-Head_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Barra Z'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco, coge la barra z por el interior con las palmas hacia arriba, frente al pecho y estira los brazos.', 'Flexiona los codos y desciende la barra hasta llegar detrás de la cabeza.', 'Vuelve a la posición inicial con el movimiento controlado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Horizontal con Barra Z')
);

-- Extensión Horizontal Concentrada Interna con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Horizontal Concentrada Interna con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03441301-Dumbbell-Lying-One-Arm-Pronated-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado en un banco plano, coge la mancuerna con agarre en pronación (palma hacia los pies) y estira el brazo sobre le pecho.', 'Utiliza la otra mano para ejercer de apoyo o tope, colocándola detrás del codo y ejerciendo presión para mantener el otro brazo completamente recto.', 'Desciende la mancuerna hacia el interior del pecho, flexionando el codo 90º, de forma controlada.', 'Estira volviendo a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Horizontal Concentrada Interna con Mancuerna')
);

-- Extensión Horizontal Concentrada Superior con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Horizontal Concentrada Superior con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03461301-Dumbbell-Lying-One-Arm-Supinated-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado en un banco plano, coge la mancuerna con agarre neutro (palma hacia el interior) y estira el brazo sobre le pecho.', 'Utiliza la otra mano para ejercer de apoyo o tope, colocándola detrás del codo y ejerciendo presión para mantener el otro brazo completamente recto.', 'Desciende la mancuerna flexionando el codo 90º, de forma controlada.', 'Estira volviendo a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Horizontal Concentrada Superior con Mancuerna')
);

-- Extensión Horizontal en Martillo en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Horizontal en Martillo en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17241301-Cable-Rope-High-Pulley-Overhead-Tricep-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie y de espaldas a la polea con el cuerpo inclinado y una pierna delante de otra, coge la cuerda de la polea alta con las dos manos y estira los brazos hacia delante.', 'Desciende la polea por detrás de la cabeza flexionando los codos de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Horizontal en Martillo en Polea Alta')
);

-- Extensión Inclinada con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Inclinada con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/04491301-EZ-Barbell-Incline-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Z'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco inclinado, coge la barra z por el interior con las palmas hacia arriba, frente al pecho y estira los brazos.', 'Flexiona los codos y desciende la barra hasta llegar con ella sobre la cabeza, sin mover los brazos.', 'Vuelve a subir la barra estirando bien los codos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Inclinada con Barra Z')
);

-- Extensión Lateral Aislada con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Lateral Aislada con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09981301-Band-side-triceps-extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie, pon la banda en algún soporte a la altura de tu cabeza y coge un extremo con una mano por detrás de la cabeza.', 'Estira el brazo con la palma de la mano hacia arriba.', 'Flexiona el codo de forma que la mano quede detrás de la cabeza.', 'Vuelve a estirar el brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Lateral Aislada con Banda')
);

-- Extensión Lateral Aislada en Supinación en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Lateral Aislada en Supinación en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16091301-Cable-One-Arm-Side-Triceps-Pushdown_Upper-arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta de lado a la polea, coge la polea alta con la palma hacia arriba y estira el brazo hacia abajo.', 'Sube flexionando el codo de forma controlada sin llegar a relajar y vuelve a estirar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Lateral Aislada en Supinación en Polea Alta')
);

-- Extensión Lateral con Arnés
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Lateral con Arnés'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Cuello. Músculos: Cuello. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Cuello'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/08381301-Weighted-Lying-Side-Lifting-Head-with-head-harness_Neck_720.gif'::text as gif_url,
  ARRAY['Cuello']::text[] as musculos_involucrados,
  'Banco Plano, Otro'::text as equipment,
  ARRAY['Tumbado de lado en el banco, colocar el arnés en la cabeza y engancharlo a un disco.', 'Tirar de lado con el cuello y volver a la posición inicial de nuevo, todo con un movimiento lento y controlado y con el resto del cuerpo inmovilizado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Lateral con Arnés')
);

-- Extensión Lateral en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Lateral en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Cuello. Músculos: Cuello. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Cuello'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/22841301-Lever-Neck-Right-Side-Flexion-plate-loaded_Neck_720.gif'::text as gif_url,
  ARRAY['Cuello']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Apoyar una parte lateral de la cabeza sobre la almohadilla móvil de la máquina, empujar hacia ella con el cuello y volver a la posición inicial de nuevo, todo con un movimiento lento y controlado y con el resto del cuerpo inmovilizado.', 'Luego realizar el ejercicio desde el otro lado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Lateral en Máquina')
);

-- Extensión Trasera Aislada en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Trasera Aislada en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02041301-Cable-Rear-Drive_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta de lado a la polea, coge la polea alta con la palma hacia abajo delante del pecho y estira el brazo hacia fuera lateralmente.', 'Retrocede de forma controlada flexionando de nuevo el codo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Trasera Aislada en Polea Alta')
);

-- Extensión Trasera Aislada en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Trasera Aislada en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02281301-Cable-Standing-Hip-Extension_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con los pies casi juntos y la espalda recta, ponte la correa en un tobillo enganchada a la polea baja, de cara a ella.', 'Apóyate con las manos en el mástil de la polea para mantener el equilibrio y lleva la pierna hacia atrás todo lo que puedas con ella estirada, contrayendo el glúteo al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Trasera Aislada en Polea Baja')
);

-- Extensión Trasera con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Trasera con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01001301-Barbell-Skier_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas separadas, inclina el cuerpo hacia delante y coge una barra por detrás con las manos en pronación (palmas hacia atrás) a una anchura algo mayor a la de los hombros.', 'Levanta la barra hacia atrás con los brazos rectos todo lo que puedas y desciende controlando el movimiento.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Trasera con Barra')
);

-- Extensión Trasera en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Trasera en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10371301-Lever-Standing-Rear-Kick_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['De pie en la máquina con la espalda recta, ponte el rodillo en la parte baja del muslo, por detrás.', 'Lleva la pierna hacia delante ligeramente flexionada.', 'Comienza el movimiento llevando la pierna hacia atrás todo lo que puedas.', 'Después regresa lentamente a la posición inicial, sin dejar caer el peso bruscamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Trasera en Máquina')
);

-- Extensión Vertical Aislada con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Vertical Aislada con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03621301-Dumbbell-One-Arm-Triceps-Extension-on-bench_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentado con la espalda recta, coge la mancuerna con agarre neutro (palma hacia el interior) y estira el brazo sobre la cabeza.', 'Desciende la mancuerna por detrás de la cabeza flexionando el codo 90º, de forma controlada.', 'Estira volviendo a la posición inicial.', 'Puedes utilizar la otra mano para ejercer de apoyo o tope, colocándola detrás del codo y ejerciendo presión para mantener el otro brazo completamente recto.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Vertical Aislada con Mancuerna')
);

-- Extensión Vertical Aislada en Pronación en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Vertical Aislada en Pronación en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17231301-Cable-One-Arm-Tricep-Pushdown_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta de cara a la polea, coge la polea alta con la palma hacia abajo y estira el brazo hacia abajo.', 'Sube flexionando el codo de forma controlada sin llegar a relajar y vuelve a estirar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Vertical Aislada en Pronación en Polea Alta')
);

-- Extensión Vertical Aislada en Pronación en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Vertical Aislada en Pronación en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17271301-Cable-Standing-Reverse-Grip-One-Arm-Overhead-Tricep-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con una pierna delante de otra y el cuerpo inclinado hacia delante de espaldas a la polea, coge la polea baja con la palma hacia abajo y estira el brazo sobre la cabeza.', 'Desciende la polea por detrás de la cabeza flexionando el codo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Vertical Aislada en Pronación en Polea Baja')
);

-- Extensión Vertical Aislada en Supinación en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Vertical Aislada en Supinación en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02311301-Cable-Standing-One-Arm-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta de cara a la polea, coge la polea alta con una mano y la palma hacia arriba y estira el brazo hacia abajo.', 'Sube flexionando el codo de forma controlada sin llegar a relajar y vuelve a estirar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Vertical Aislada en Supinación en Polea Alta')
);

-- Extensión Vertical con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Vertical con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/39391301-Band-overhead-triceps-extension-male_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie, coloca las bandas a una altura baja y de espaldas, coge un extremo con cada mano.', 'Estira los brazos hacia arriba, con las palmas de las manos hacia delante.', 'Desciende las manos por detrás de la cabeza flexionando los codos de forma controlada.', 'Estira volviendo a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Vertical con Bandas')
);

-- Extensión Vertical con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Vertical con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/04531301-EZ-Barbell-Seated-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Barra Z'::text as equipment,
  ARRAY['Sentado en un banco o similar, coge la barra z con las manos a la anchura de los hombros y las palmas hacia arriba, y estira los brazos.', 'Flexiona los codos y desciende la barra hasta llegar con ella por detrás del cuello, sin mover los brazos ni separarlos.', 'Vuelve a subir la barra estirando bien los codos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Vertical con Barra Z')
);

-- Extensión Vertical con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Vertical con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/21881301-Dumbbell-Seated-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentados en un banco o similar, cogemos una mancuerna con ambas manos y estiramos los brazos hacia arriba.', 'Flexionamos los codos hacia atrás de forma que la mancuerna quede por detrás de la cabeza, sin dejar caer el peso.', 'Estiramos de nuevo con un movimiento controlado.', 'Debemos intentar mantener los codos cerrados, como si quisiéramos que se tocasen entre ellos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Vertical con Mancuerna')
);

-- Extensión Vertical en Pronación en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Vertical en Pronación en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02411301-Cable-Triceps-Pushdown-V-bar-attachment_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta de cara a la polea, coge la barra en pronación (palmas hacia abajo) y estira los brazos hacia abajo.', 'Sube flexionando los codos de forma controlada sin llegar a relajar y vuelve a estirar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Vertical en Pronación en Polea Alta')
);

-- Extensión Vertical en Pronación en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Vertical en Pronación en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/18591301-Cable-Kneeling-Triceps-Extension-VERSION-2_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De rodillas y de espaldas a la polea, coge la polea baja con las palmas hacia arriba y estira los brazos sobre la cabeza.', 'Desciende la polea por detrás de la cabeza flexionando los codos de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Vertical en Pronación en Polea Baja')
);

-- Extensión Vertical en Supinación en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Vertical en Supinación en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16061301-Cable-Reverse-Grip-Triceps-Pushdown-SZ-bar_Upper-arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta de cara a la polea, coge la polea alta con las palmas hacia arriba y estira los brazos hacia abajo.', 'Sube flexionando los codos de forma controlada sin llegar a relajar y vuelve a estirar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Vertical en Supinación en Polea Alta')
);

-- Extensión Vertical Neutra en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Vertical Neutra en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/12271301-Cable-Standing-One-Arm-Tricep-Pushdown-Overhand-Grip_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y la espalda recta de cara a la polea, coge la cuerda de la polea alta y estira los brazos hacia abajo.', 'Sube flexionando los codos de forma controlada sin llegar a relajar y vuelve a estirar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Vertical Neutra en Polea Alta')
);

-- Extensión Vertical Neutra en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensión Vertical Neutra en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01941301-Cable-Overhead-Triceps-Extension-rope-attachment_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie y de espaldas a la polea, coge la cuerda de la polea baja y estira los brazos sobre la cabeza.', 'Desciende la polea por detrás de la cabeza flexionando los codos de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensión Vertical Neutra en Polea Baja')
);

-- Extensiones Concentradas en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensiones Concentradas en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01761301-Cable-Kneeling-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['De rodillas y de espaldas a la polea alta, coge la barra con ambas manos hacia delante (pronación) a la anchura de los hombros.', 'Inclina el cuerpo hacia delante y apoya la parte trasera de los codos en un banco, con ellos flexionados 90º.', 'Estira hacia delante y retrocede de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensiones Concentradas en Polea Alta')
);

-- Extensiones Cruzadas en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensiones Cruzadas en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/37191301-Cable-Standing-High-Cross-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie entre dos poleas altas, con la espalda recta y las piernas ligeramente separadas.', 'Coge cada extremo con la mano inversa y flexiona los codos, dejando las manos frente al pecho con las poleas ya cruzadas.', 'Estira los codos hacia abajo tensando bien los tríceps y retrocede de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensiones Cruzadas en Polea')
);

-- Extensiones Cruzadas en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensiones Cruzadas en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/23301301-Cable-Lat-Pulldown-Full-Range-Of-Motion_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie entre dos poleas altas, con la espalda recta y las piernas ligeramente separadas, coge el agarre del lado opuesto con cada mano, con las palmas hacia delante, estirando los brazos hacia arriba de forma que queden cruzadas delante de la cabeza.', 'Tira de ambas manos hacia abajo en diagonal, abriendo los brazos a los costados y manteniendo la contracción dorsal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensiones Cruzadas en Polea Alta')
);

-- Extensiones en caída libre
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensiones en caída libre'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/08161301-Triceps-Press_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colocamos una barra a una altura algo inferior a la de la cadera.', 'Vamos hacia atrás con los pies, los juntamos y nos colgamos de la barra con los brazos hacia arriba, flexionados y con las manos a la anchura de los hombros.', 'Estiramos los brazos subiendo el torso por encima de la barra.', 'Bajamos de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensiones en caída libre')
);

-- Extensiones en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensiones en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/10331301-Lever-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentados en la máquina, cogemos los agarres con las manos en posición neutra (palmas hacia nuestro cuerpo) y estiramos los brazos hacia abajo, sin mover el cuerpo ni abrir los codos.', 'Estiramos bien y volvemos a la posición inicial sin llegar a reposar el peso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensiones en Máquina')
);

-- Extensiones en Pronación en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensiones en Pronación en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/06071301-Lever-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentados en la máquina, cogemos los agarres con las manos en pronación (palmas hacia abajo) y estiramos los brazos hacia abajo, sin mover el cuerpo ni abrir los codos.', 'Estiramos bien y volvemos a la posición inicial sin llegar a reposar el peso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensiones en Pronación en Máquina')
);

-- Extensiones Horizontales Internas con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensiones Horizontales Internas con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04361301-Dumbbell-Tate-Press_Triceps_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado en un banco plano, coge las mancuernas con agarre en pronación (palmas hacia los pies) y estira los brazos sobre le pecho.', 'Desciende las mancuernas hacia el interior del pecho, flexionando los codos mientras los abres para permitir el movimiento haciendo espacio para las mancuernas.', 'Estira volviendo a la posición inicial, todo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensiones Horizontales Internas con Mancuernas')
);

-- Extensiones Inclinadas con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensiones Inclinadas con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03301301-Dumbbell-Incline-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Tumbado en un banco inclinado, cogemos una mancuerna con cada mano con agarre neutro y estiramos los brazos hacia arriba.', 'Flexionamos los codos hacia atrás de forma que la mancuerna quede por detrás de la cabeza, sin dejar caer el peso.', 'Estiramos de nuevo con un movimiento controlado.', 'Debemos intentar mantener los codos cerrados, como si quisiéramos que se tocasen entre ellos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensiones Inclinadas con Mancuernas')
);

-- Extensiones Laterales Amplias con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensiones Laterales Amplias con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09931301-Band-reverse-fly_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas a la anchura de los hombros, coge una banda con las dos manos delante del pecho, con los brazos extendidos paralelos al suelo y las palmas enfrentadas.', 'Estira los brazos hacia los lados lados todo lo que puedas y retrocede a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensiones Laterales Amplias con Banda')
);

-- Extensiones Laterales con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Extensiones Laterales con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15031301-Band-Pull-Apart_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas a la anchura de los hombros, coge una banda con las dos manos delante de cada hombro, con los brazos extendidos paralelos al suelo y las palmas enfrentadas.', 'Estira los brazos hacia los lados lados todo lo que puedas y retrocede a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Extensiones Laterales con Banda')
);

-- Flexión Frontal con Disco
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexión Frontal con Disco'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Cuello. Músculos: Cuello. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Cuello'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/10431301-Weighted-Lying-Neck-Flexion_neck_720.gif'::text as gif_url,
  ARRAY['Cuello']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Tumbado hacia arriba, coger un disco y sostenerlo por delante de la cabeza con ambas manos.', 'Tirar hacia delante con el cuello y volver a la posición inicial de nuevo, todo con un movimiento lento y controlado y con el resto del cuerpo inmovilizado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexión Frontal con Disco')
);

-- Flexión Frontal en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexión Frontal en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Cuello. Músculos: Cuello. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Cuello'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/24121301-Cable-Seated-Neck-Flexion-with-head-harness_Neck_720.gif'::text as gif_url,
  ARRAY['Cuello']::text[] as musculos_involucrados,
  'Polea, Otro'::text as equipment,
  ARRAY['Sentado de espaldas a la polea, colocar el arnés en la cabeza y engancharlo a la polea alta.', 'Tirar hacia delante con el cuello y volver a la posición inicial de nuevo, todo con un movimiento lento y controlado y con el resto del cuerpo inmovilizado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexión Frontal en Polea')
);

-- Flexiones
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/06621301-Push-up-m_Chest-FIX_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Empezamos con el pecho y abdomen pegado al suelo y las manos apoyadas a la altura del pecho.', 'Los codos deben apuntar siempre hacia atrás, y no hacia los lados ya que puede llevarnos a una lesión de hombros y también a aguantar menos en tensión.', 'Además lograremos una mayor estabilidad arriba.', 'Al subir el cuerpo debes mantener apretadas las caderas, los hombros y los talones, y lo mismo al volver hacia el suelo.', 'Debes tener el mismo control que cuando haces las planchas solo que añadiendo el movimiento.', 'Los brazos deben estar completamente rectos al subir y al bajar tenemos que volver a tocar el suelo, sin descansar abajo.', 'Los brazos volverán a estar en ángulo como al comienzo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones')
);

-- Flexiones a una mano
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones a una mano'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/07251301-Single-Arm-Push-up_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['La posición será como en una flexión normal, pero colocaremos solamente una mano en el suelo.', 'Seguidamente, será importante intentar lograr una posición que nos permita mantenernos en equilibrio usando las piernas y el brazo de apoyo extendidos.', 'El brazo que va a realizar la flexión estará a la altura del hombro, completamente extendido, y el otro brazo lo mantendremos doblado, colocándolo en nuestra zona lumbar.', 'Las piernas estarán más separadas como cuando realizamos una flexión normal, ya que si no perderíamos el equilibrio.', 'Deberemos descender poco a poco, hasta tocar el suelo con la barbilla, para volver a subir de nuevo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones a una mano')
);

-- Flexiones a una mano asistidas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones a una mano asistidas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/39641301-Twist-Push-up_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['La posición será como en una flexión normal, pero colocaremos solamente una mano en el suelo.', 'La otra la pondremos sobre un banco, silla o caja, apoyando toda la parte del codo y antebrazo, a modo de sujeción.', 'Deberemos descender poco a poco, cargando el peso en la mano del suelo, para volver a subir de nuevo.', 'Al terminar la serie cambiar de mano.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones a una mano asistidas')
);

-- Flexiones Abiertas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones Abiertas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/13111301-Wide-Hand-Push-up_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Empezamos con el pecho y abdomen pegado al suelo y las manos apoyadas a la altura del pecho, a una anchura algo superior a la de los codos si estiramos los brazos a los lados.', 'Subimos estirando los brazos con los codos en ángulo, estirando bien arriba.', 'Al bajar tenemos que volver a tocar el suelo, sin descansar abajo.', 'Los brazos volverán a estar en ángulo como al comienzo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones Abiertas')
);

-- Flexiones Archer
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones Archer'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/32941301-Archer-Push-up_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Las manos deben estar colocadas en una posición más amplia en relación a los hombros.', 'Al momento de bajar, no lo harás hacia abajo de forma recta, si no que deberás colocar todo su peso en uno de los brazos.', 'Una vez hayas bajado y colocado el peso de tu cuerpo en el brazo derecho, subirás y bajarás, pero esta vez colocando el peso del cuerpo en el brazo izquierdo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones Archer')
);

-- Flexiones Básicas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones Básicas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/06721301-Reverse-Dip_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Tumbado hacia abajo en el suelo, apoya las punteras de los pies y estira los brazos levantando solo la parte superior del cuerpo, manteniendo las caderas abajo.', 'Coloca las manos a la anchura de los hombros.', 'Baja el cuerpo hacia el suelo con los codos cerca del cuerpo, y luego empuja nuevamente hacia arriba.', 'Mantén la espalda recta y tensa los abdominales y el pecho.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones Básicas')
);

-- Flexiones Cerradas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones Cerradas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/14671301-Push-up-on-Forearms_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Tumbado hacia abajo en el suelo, apoya las punteras de los pies y estira los brazos levantando el cuerpo.', 'Coloca las manos casi juntas, frente al pecho.', 'Baja el cuerpo hacia el suelo flexionando los codos, con estos cerca del cuerpo, y luego empuja nuevamente hacia arriba.', 'Mantén la espalda recta y tensa los abdominales y el pecho.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones Cerradas')
);

-- Flexiones Cerradas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones Cerradas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/02591301-Close-Grip-Push-up_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Empezamos en posición de plancha con las manos apoyadas a la altura del pecho, a una anchura inferior a la de los hombros (delante del pecho).', 'Subimos estirando los brazos con los codos en ángulo, estirando bien arriba.', 'Bajamos a la posición inicial sin descansar abajo.', 'Los brazos volverán a estar en ángulo como al comienzo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones Cerradas')
);

-- Flexiones con codos
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones con codos'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/01371301-Body-Up_Shoulders_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Tumbado hacia abajo en el suelo, apoya las punteras de los pies y los antebrazos completamente (posición de plancha).', 'Sube el cuerpo estirando los brazos de forma que apoyes solo las manos.', 'Estira bien arriba y baja lentamente de nuevo, apoyando los codos.', 'Mantén la espalda recta y tensa los abdominales y el pecho.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones con codos')
);

-- Flexiones con Soportes
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones con Soportes'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/14861301-Push-up-With-push-up-handles_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Con los soportes colocados en el suelo a la altura del pecho y a una anchura un poco superior a la de los hombros, nos colocamos en posición de plancha con una mano sobre cada soporte, brazos estirados.', 'Los codos deben apuntar siempre hacia atrás, y no hacia los lados ya que puede llevarnos a una lesión de hombros y también a aguantar menos en tensión.', 'Además lograremos una mayor estabilidad arriba.', 'Al subir el cuerpo debes mantener apretadas las caderas, los hombros y los talones, y lo mismo al volver hacia el suelo.', 'Debes tener el mismo control que cuando haces las planchas solo que añadiendo el movimiento.', 'Los brazos deben estar completamente rectos al subir y bajaremos todo lo posible, sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones con Soportes')
);

-- Flexiones Cruzadas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones Cruzadas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/37841301-Cross-Arms-Push-up_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Tumbado hacia abajo en el suelo, apoya las punteras de los pies y estira los brazos levantando el cuerpo.', 'Coloca una mano delante de otra, mirando ambas hacia el interior, frente al pecho.', 'Baja el cuerpo hacia el suelo flexionando los codos, con estos perpendiculares al torso, y luego empuja nuevamente hacia arriba.', 'Mantén la espalda recta y tensa los abdominales y el pecho.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones Cruzadas')
);

-- Flexiones Declinadas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones Declinadas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/02791301-Decline-Push-Up-m_chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Empezamos en posición de plancha con las manos apoyadas a la altura del pecho, a la anchura de los hombros.', 'Ponemos los pies en alto, sobre un banco, silla o cualquier otro elemento.', 'Subimos estirando los brazos con los codos en ángulo, estirando bien arriba.', 'Bajamos a la posición inicial sin descansar abajo.', 'Los brazos volverán a estar en ángulo como al comienzo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones Declinadas')
);

-- Flexiones Diamante
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones Diamante'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/02831301-Diamond-Push-up_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Tumbado hacia abajo en el suelo, apoya las punteras de los pies y estira los brazos levantando el cuerpo del suelo (posición de plancha).', 'Coloca las manos debajo del pecho y en forma de diamante.', 'Haz que tus dedos índices y tus pulgares se toquen entre sí.', 'De este modo formarás un diamante, o lo que se conoce también como pirámide.', 'Baja el cuerpo hacia el suelo, y luego empuja nuevamente hacia arriba.', 'Mantén la espalda recta y tensa los abdominales y el pecho.', 'Asegúrate de mantener los dedos correctamente en la posición de diamante.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones Diamante')
);

-- Flexiones en supinación
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones en supinación'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/37511301-Reverse-Push-up_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Tumbado hacia abajo en el suelo, apoya las punteras de los pies y estira los brazos levantando el cuerpo.', 'Coloca las manos a la anchura de los hombros frente al pecho, con los dedos apuntando hacia atrás.', 'Baja el cuerpo hacia el suelo flexionando los codos, con estos cerca del cuerpo, y luego empuja nuevamente hacia arriba.', 'Mantén la espalda recta y tensa los abdominales y el pecho.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones en supinación')
);

-- Flexiones Pliométricas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones Pliométricas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/13061301-Plyo-Push-Up_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Comienza en una plancha alta o en la parte superior de la posición de flexión.', 'El torso debe estar en línea recta, con el núcleo apretado y las palmas directamente debajo de los hombros.', 'Empieza a bajar el cuerpo como si fueras a hacer una lagartija hasta que tu pecho casi toque el suelo.', 'A medida que empujas hacia arriba, hazlo con suficiente fuerza para que tus manos se levanten del suelo (como un pequeño salto).', 'Aterriza suavemente en el suelo y pasa a tu siguiente repetición de inmediato.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones Pliométricas')
);

-- Flexiones Pliométricas con Palmada
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones Pliométricas con Palmada'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12731301-Clap-Push-Up_Plyometrics_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Comienza en una plancha alta o en la parte superior de la posición de flexión.', 'El torso debe estar en línea recta, con el núcleo apretado y las palmas directamente debajo de los hombros.', 'Empieza a bajar el cuerpo como si fueras a hacer una lagartija hasta que tu pecho casi toque el suelo.', 'A medida que empujas hacia arriba, hazlo con suficiente fuerza para que tus manos se levanten del suelo y te permita dar una palmada en el aire.', 'Aterriza suavemente en el suelo y pasa a tu siguiente repetición de inmediato.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones Pliométricas con Palmada')
);

-- Flexiones Verticales con Banco
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones Verticales con Banco'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33831301-Pike-Push-up-on-Bench-VERSION-2_Chest_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Pon las manos en el suelo a una anchura algo mayor a la de los hombros, en posición de flexión de pecho.', 'Sube los pies en un banco plano.', 'Inclina el torso hacia delante y realiza flexiones de los brazos de forma que los hombros carguen con el peso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones Verticales con Banco')
);

-- Flexiones Verticales entre Bancos
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Flexiones Verticales entre Bancos'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/34011301-Pike-Push-up-between-Benches_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Coloca dos bancos planos paralelos, separados a una anchura algo mayor a la de los hombros.', 'Ponte entre ellos y pon una mano y un pie en cada uno, en posición de flexión de pecho.', 'Sube los glúteos e Inclina el torso hacia delante.', 'Realiza flexiones con los brazos de forma que los hombros carguen con el peso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Flexiones Verticales entre Bancos')
);

-- Fondos Cerrados en Paralelas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Fondos Cerrados en Paralelas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/08141301-Triceps-Dip_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Ponemos las manos en las barras paralelas y estiramos los brazos, con la espalda recta y las piernas un poco recogidas.', 'Bajamos de forma controlada sin inclinar el cuerpo hasta tener los codos flexionados a 90°.', 'Volvemos a subir estirando bien arriba.', 'Podemos utilizar un cinturón de lastre para añadir peso y dificultad al ejercicio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Fondos Cerrados en Paralelas')
);

-- Fondos Coreanos en Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Fondos Coreanos en Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/32881301-Korean-dips_Chest_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Ponemos las manos en la barra, con el cuerpo delante y estiramos los brazos, con la espalda recta y las piernas un poco recogidas.', 'Bajamos de forma controlada inclinando el cuerpo un poco hacia delante y las piernas hacia atrás, hasta tener los codos flexionados a 90°.', 'Volvemos a subir estirando bien arriba.', 'Hay que aprender a jugar con el balanceo, para evitar tocar con el culo en la barra así como dañar las muñecas o los hombros.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Fondos Coreanos en Barra')
);

-- Fondos en banco
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Fondos en banco'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/13991301-Bench-dip-on-floor_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Coloca las manos encima del banco, plataforma o silla a la anchura de los hombros.', 'Los pies hacia adelante en el suelo y separados a la anchura de la cadera.', 'Empieza el movimiento inspirando y flexionando los codos para descender la parte superior del cuerpo hacia el suelo, intentando llegar con los brazos a un ángulo recto de 90º.', 'La espalda tiene que estar siempre cerca del banco.', 'Mantén los codos lo más cerca posible del cuerpo y flexionados hacia atrás.', 'De esta manera evitarás que se desplacen y trabajarás solo el tríceps.', 'De lo contrario, también estarías involucrando los hombros en el ejercicio.', 'Para regresar a la posición inicial exhala y mientras asciendes coloca los brazos rectos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Fondos en banco')
);

-- Fondos en Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Fondos en Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/24621301-Chest-Dip-on-Straight-Bar_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Ponemos las manos en las barra y estiramos los brazos, con la espalda recta y las piernas un poco recogidas.', 'Bajamos de forma controlada inclinando el cuerpo un poco hacia delante hasta tener los codos flexionados a 90°.', 'Volvemos a subir estirando bien arriba.', 'Podemos utilizar un cinturón de lastre para añadir peso y dificultad al ejercicio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Fondos en Barra')
);

-- Fondos en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Fondos en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/18711301-Lever-Triceps-Dip-plate-loaded_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentados con las piernas sujetas, cogemos los agarres con las manos en posición neutra (palmas hacia nuestro cuerpo) y estiramos los brazos hacia abajo, sin mover el cuerpo ni abrir los codos.', 'Estiramos bien y volvemos a la posición inicial sin llegar a reposar el peso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Fondos en Máquina')
);

-- Fondos en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Fondos en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/14511301-Lever-Seated-Dip_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentados en la máquina con la espalda recta, ponemos las manos en pronación (palmas hacia atrás) a una anchura un poco superior a la de los hombros.', 'Estiramos los brazos hacia abajo sin levantar el cuerpo, y volvemos a la posición inicial con un movimiento controlado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Fondos en Máquina')
);

-- Fondos en Paralelas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Fondos en Paralelas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/02511301-Chest-Dip_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Ponemos las manos en las barras paralelas y estiramos los brazos, con la espalda recta y las piernas un poco recogidas.', 'Bajamos de forma controlada inclinando el cuerpo un poco hacia delante hasta tener los codos flexionados a 90°.', 'Volvemos a subir estirando bien arriba.', 'Podemos utilizar un cinturón de lastre para añadir peso y dificultad al ejercicio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Fondos en Paralelas')
);

-- Fondos en Pronación en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Fondos en Pronación en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/05911301-Lever-Overhand-Triceps-Dip_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentados con las piernas sujetas, cogemos los agarres con las manos en pronación (palmas hacia atrás) y estiramos los brazos hacia abajo, sin mover el cuerpo ni abrir los codos.', 'Estiramos bien y volvemos a la posición inicial sin llegar a reposar el peso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Fondos en Pronación en Máquina')
);

-- Fondos entre bancos
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Fondos entre bancos'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/08121301-Triceps-Dip-bench-leg_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Coloca las manos encima del banco, plataforma o silla a la anchura de los hombros.', 'Los pies hacia adelante encima de otro banco o plataforma y separados a la anchura de la cadera.', 'Empieza el movimiento inspirando y flexionando los codos para descender la parte superior del cuerpo hacia el suelo, intentando llegar con los brazos a un ángulo recto de 90º.', 'La espalda tiene que estar siempre cerca del banco.', 'Mantén los codos lo más cerca posible del cuerpo y flexionados hacia atrás.', 'De esta manera evitarás que se desplacen y trabajarás solo el tríceps.', 'De lo contrario, también estarías involucrando los hombros en el ejercicio.', 'Para regresar a la posición inicial exhala y mientras asciendes coloca los brazos rectos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Fondos entre bancos')
);

-- Fondos Imposibles
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Fondos Imposibles'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/32891301-Impossible-dips_Upper-arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Se trata de colocarse en las barras paralelas apoyando los antebrazos en las mismas, y subir hasta bloquear los codos, sin utilizar balanceos ni impulsos, sólo por pura fuerza de tríceps.', 'Para coger fuerza y técnica, podemos empezar desde arriba descendiendo muy lentamente, y subir de un salto si es necesario.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Fondos Imposibles')
);

-- Giros de cintura de pie con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Giros de cintura de pie con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/35911301-Band-twist-male_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Pon una banda en algún soporte a la altura del pecho.', 'Colócate lateralmente a él y coge el extremo con las dos manos, con los brazos extendidos y el torso girado hacia ese lado.', 'Gira tu torso al lado contrario con el brazo bloqueado sin mover las piernas, apretando el abdomen.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Giros de cintura de pie con Banda')
);

-- Giros de cintura doblado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Giros de cintura doblado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33911301-Bent-Over-Twist_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas separadas y la espalda recta, ponte una barra sobre el trapecio y sujeta con las dos manos para fijarla.', 'Inclina el cuerpo hacia delante formando un ángulo de 90º con las piernas.', 'Gira tu torso de lado a lado sin mover las piernas, apretando el abdomen.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Giros de cintura doblado con Barra')
);

-- Giros de cintura sentado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Giros de cintura sentado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00941301-Barbell-Seated-Twist_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Siéntate en un banco y con las piernas flexionadas y la espalda recta.', 'Ponte una barra sobre el trapecio.', 'Gira tu torso de lado a lado sin mover las piernas, apretando el abdomen.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Giros de cintura sentado con Barra')
);

-- Giros de cintura sentado con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Giros de cintura sentado con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/40421301-Cable-Seated-Cross-Arm-Twist_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado de espaldas a la polea, coge el agarre pasando una mano por delante del cuerpo, con el codo flexionado, girando la cintura.', 'Gira tu torso al lado contrario con el brazo bloqueado sin mover las piernas, apretando el abdomen.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Giros de cintura sentado con Polea')
);

-- Giros Inferiores de Oblicuos en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Giros Inferiores de Oblicuos en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14531103-Lever-Seated-Twist_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina con la espalda recta, coge las manillas con ambas manos con las piernas ligeramente separadas y flexionadas.', 'Manteniendo el equilibrio gira la cadera de lado a lado, apretando el abdomen y moviendo solo la parte inferior del cuerpo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Giros Inferiores de Oblicuos en Máquina')
);

-- Giros sentado en Fitball
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Giros sentado en Fitball'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/08491301-Weighted-Seated-Twist-on-stability-ball_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Fitball, Otro'::text as equipment,
  ARRAY['Sentado en un fitball con la espalda recta, las piernas flexionadas y los pies en el suelo, gira el torso hacia los lados sin mover la parte inferior del cuerpo.', 'Puedes sostener una pesa para añadirle dificultad al ejercicio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Giros sentado en Fitball')
);

-- Giros Superiores de Oblicuos en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Giros Superiores de Oblicuos en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/06081301-Lever-Twist_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Coge las manillas con ambas manos con las piernas ligeramente separadas y la espalda recta.', 'Manteniendo el equilibrio gira la cadera de lado a lado, apretando el abdomen y evitando mover los hombros o la cabeza.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Giros Superiores de Oblicuos en Máquina')
);

-- Giros Superiores Sentado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Giros Superiores Sentado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/23291301-Spine-Twist_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Siéntate en el suelo con las piernas rectas y los pies talones en el suelo.', 'Cruza los brazos sobre tu pecho, apoyando las manos en los hombros y con los codos paralelos a las piernas.', 'Contrae los músculos abdominales y gira el torso hacia un lado, manteniendo la contracción y la postura.', 'Luego vuelve lentamente a la posición inicial.', 'Repite el movimiento hacia el otro lado.', 'Este ejercicio ayuda a mejorar la flexibilidad de la columna vertebral y a fortalecer los músculos abdominales y oblicuos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Giros Superiores Sentado')
);

-- Giros Superiores Sentado con peso
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Giros Superiores Sentado con peso'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/23711301-Weighted-Russian-Twist_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Siéntate en el suelo con las rodillas flexionadas y los pies asegurados.', 'Sostén un peso con ambas manos frente al pecho, con los brazos estirados.', 'Inclínate ligeramente hacia atrás para activar los músculos abdominales.', 'Desde esta posición, gira el torso hacia un lado, llevando el peso hacia el suelo junto a la cadera.', 'Mantén el núcleo comprometido y controla el movimiento.', 'Regresa al centro y luego gira hacia el otro lado, repitiendo el movimiento.', 'Alterna los giros de manera controlada durante el número deseado de repeticiones.', 'Este ejercicio fortalece los oblicuos y mejora la estabilidad del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Giros Superiores Sentado con peso')
);

-- Golpes alternos
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Golpes alternos'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/35311301-Alternate-Punching_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['De pie con las piernas firmes sin movernos del sitio, procedemos a lanzar puñetazos al frente alternando ambos brazos.', 'Se trata de un calentamiento típico del boxeo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Golpes alternos')
);

-- Half Wipers con piernas estiradas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Half Wipers con piernas estiradas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/12491301-Wipers-straight-leg_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba con los brazos extendidos hacia los lados y las palmas hacia abajo.', 'Levanta las piernas rectas hacia arriba.', 'Lentamente, gira las piernas hacia un lado, manteniéndolas rectas.', 'Detén el movimiento cuando las piernas estén cerca del suelo, pero sin tocarlo, y luego vuelve a la posición inicial.', 'Repite el movimiento hacia el otro lado.', 'Este ejercicio trabaja los oblicuos y abdominales, mejorando la estabilidad del core y la flexibilidad de la cadera.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Half Wipers con piernas estiradas')
);

-- Half Wipers con piernas flexionadas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Half Wipers con piernas flexionadas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/12481301-Half-Wipers-bent-leg_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba con los brazos extendidos hacia los lados y las palmas hacia abajo.', 'Levanta las piernas, doblando las rodillas a 90 grados.', 'Gira las piernas lentamente hacia un lado, manteniendo las rodillas dobladas.', 'Detén el movimiento cuando las rodillas estén cerca del suelo, pero sin tocarlo, y luego vuelve a la posición inicial.', 'Repite el movimiento hacia el otro lado.', 'Este ejercicio trabaja los oblicuos y abdominales, mejorando la estabilidad del core y la flexibilidad de la cadera.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Half Wipers con piernas flexionadas')
);

-- Hand Grip
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Hand Grip'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/33451301-Hand-Spring-Wrist-Curl_Hands_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colocar los cuatro dedos a lo largo de un mango, sujetando el otro mango con la palma.', 'El pulgar debe quedar libre, apenas apoyando el movimiento.', 'El objetivo es cerrar la mano lentamente por completo y luego abrirla lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Hand Grip')
);

-- Hip Thrust Aislado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Hip Thrust Aislado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10611301-Barbell-one-leg-hip-thrust_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Tumbado hacia arriba en el suelo con las piernas flexionadas, ponte una barra sobre la cadera.', 'Apoya la parte alta de la espalda sobre un banco.', 'Eleva la pelvis con una sola pierna tensando bien el glúteo arriba, con la espalda sobre el banco.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Hip Thrust Aislado con Barra')
);

-- Hip Thrust con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Hip Thrust con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14081301-Band-Hip-Lift_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Tumbado hacia arriba en el suelo con las piernas flexionadas, abre los brazos hacia los lados formando un ángulo de 45° con el cuerpo.', 'Con las manos hacia abajo, ponlas sobre una banda que pase por tu cadera tensando lo que consideres oportuno.', 'Eleva la pelvis tensando bien los glúteos arriba.', 'Puedes poner las manos sobre discos o alguna plataforma para alcanzar más elevación.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Hip Thrust con Banda')
);

-- Hip Thrust con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Hip Thrust con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/29641301-Barbell-Glute-Bridge-hands-on-bar_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['Tumbado hacia arriba en el suelo con las piernas flexionadas, ponte una barra sobre la cadera.', 'Eleva la pelvis tensando bien los glúteos arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Hip Thrust con Barra')
);

-- Hip Thrust con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Hip Thrust con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33351301-Dumbbell-Glute-Bridge_Hip_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Tumbado hacia arriba en el suelo con las piernas flexionadas, ponte una mancuerna sobre la cadera.', 'Eleva la pelvis tensando bien los glúteos arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Hip Thrust con Mancuerna')
);

-- Hip Thrust Declinado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Hip Thrust Declinado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/35621301-Barbell-Glute-Bridge-Two-Legs-on-Bench-male_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Tumbado hacia arriba en el suelo con las piernas flexionadas, ponte una barra sobre la cadera.', 'Apoya los pies sobre un banco plano.', 'Eleva la pelvis tensando bien los glúteos arriba, con los pies sobre el banco.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Hip Thrust Declinado con Barra')
);

-- Hip Thrust Inclinado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Hip Thrust Inclinado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10601301-Barbell-Hip-Thrust_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Tumbado hacia arriba en el suelo con las piernas flexionadas, ponte una barra sobre la cadera.', 'Apoya la parte alta de la espalda sobre un banco.', 'Eleva la pelvis tensando bien los glúteos arriba, con la espalda sobre el banco.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Hip Thrust Inclinado con Barra')
);

-- Hiperextensiones
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Hiperextensiones'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Trapecio, Lumbar. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/18601301-Hyperextension-VERSION-2_Hips_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Lumbar']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colócate hacia abajo en el banco plano con sujeción de los tobillos y la cadera apoyada.', 'Pon las manos en el pecho o tras la cabeza.', 'Flexiona el torso hasta que el cuerpo forme un ángulo de 90 grados.', 'Desde esta posición de flexión debes efectuar una extensión mientras levantas el torso hasta que el cuerpo queda en línea recta nuevamente y en la zona lumbar se forma una curva levemente acentuada.', 'Vuelve a descender mientras tomas aire y cuando extiendes el torso exhala el aire.', 'Puedes sujetar un disco en el pecho para incrementar la dificultad.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Hiperextensiones')
);

-- Hiperextensiones en Fitball
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Hiperextensiones en Fitball'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Abdomen, Lumbar. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13141301-Back-Extension-on-Exercise-Ball_Back_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Lumbar']::text[] as musculos_involucrados,
  'Fitball'::text as equipment,
  ARRAY['Coloca una Pelota Suiza delante de ti y arrodíllate.', 'Inclínate hacia adelante, colocando la parte superior de las caderas y el estómago sobre la Pelota Suiza.', 'Estira las piernas hacia atrás.', 'Empieza con la cabeza levantada, la espalda estirada, el pecho separado de la pelota y las manos detrás de la cabeza.', 'Baja el pecho y la cabeza hasta notar un buen estiramiento en los isquiotibiales y luego contrae la parte inferior de la espalda para volver a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Hiperextensiones en Fitball')
);

-- Hiperextensiones en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Hiperextensiones en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Abdomen, Trapecio, Lumbar. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/05731301-Lever-Back-Extension_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Trapecio', 'Lumbar']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Colócate en la máquina con sujeción de los tobillos y la espalda apoyada.', 'Pon las manos en el pecho o tras la cabeza.', 'Flexiona la cadera hacia atrás y retrocede lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Hiperextensiones en Máquina')
);

-- Hiperextensiones Inclinadas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Hiperextensiones Inclinadas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Trapecio, Lumbar, Glúteo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04891301-Hyperextension_Waist_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Lumbar', 'Glúteo']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colócate hacia abajo en el banco inclinado con sujeción de los tobillos y la cadera apoyada.', 'Pon las manos en el pecho o tras la cabeza.', 'Flexiona el torso hasta que el cuerpo forme un ángulo de 90 grados.', 'Desde esta posición de flexión debes efectuar una extensión mientras levantas el torso hasta que el cuerpo queda en línea recta nuevamente y en la zona lumbar se forma una curva levemente acentuada.', 'Vuelve a descender mientras tomas aire y cuando extiendes el torso exhala el aire.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Hiperextensiones Inclinadas')
);

-- Hollow Hold
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Hollow Hold'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Cuádriceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/12461301-Hollow-Hold_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Cuádriceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba con los brazos extendidos sobre la cabeza y las piernas rectas.', 'Levanta los hombros y las piernas del suelo, manteniendo la parte baja de la espalda en contacto con el suelo.', 'Contrae los músculos abdominales para mantener la posición y forma un arco en el cuerpo, manteniendo el abdomen y las piernas activados.', 'Mantén la posición durante el tiempo deseado, respirando de manera controlada.', 'Este ejercicio fortalece los músculos abdominales, especialmente los profundos, y ayuda a mejorar la estabilidad del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Hollow Hold')
);

-- Inclinación diagonal en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Inclinación diagonal en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/08621301-Cable-twist-up-down_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas a la anchura aproximada de la cadera, ponte a un lado de la polea alta.', 'Coge el soporte con las dos manos y los dedos entrelazados a un lado del cuerpo, con los brazos extendidos.', 'Flexiona el tronco lateralmente hacia abajo del lado contrario, girando el torso y bajando los brazos completamente en diagonal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Inclinación diagonal en Polea')
);

-- Jackknife Sit-Up
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jackknife Sit-Up'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/05071301-Jackknife-Sit-Up_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Acuéstate boca arriba sobre una estera con los brazos extendidos por encima de la cabeza y las piernas rectas.', 'A medida que inhalas, contrae los abdominales y levanta simultáneamente los brazos y las piernas del suelo, manteniéndolos rectos.', 'Dirige tus manos hacia tus pies, intentando tocarlos mientras elevas el torso y las piernas.', 'Mantén la posición por un momento y luego baja lentamente el torso y las piernas de vuelta al suelo.', 'Este ejercicio trabaja los músculos abdominales superiores e inferiores, así como los flexores de la cadera.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jackknife Sit-Up')
);

-- Jalón Abierto Doble Neutro en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón Abierto Doble Neutro en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33581301-Cable-Parallel-Grip-Lat-Pulldown-on-Floor_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado o de rodillas entre dos poleas altas y con la espalda recta, estira los brazos hacia arriba y coge los soportes con las manos hacia el interior.', 'Flexiona los brazos bajando las manos a la altura aproximada de los hombros.', 'Estira de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón Abierto Doble Neutro en Polea Alta')
);

-- Jalón Abierto en Pronación en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón Abierto en Pronación en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01971301-Cable-Pulldown-pro-lat-bar_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado de cara a la polea con la espalda recta, estira los brazos hacia arriba y coge la barra con las manos a una anchura muy superior a la de los hombros y las manos hacia delante.', 'Flexiona los brazos bajando la barra al mentón.', 'Estira de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón Abierto en Pronación en Polea Alta')
);

-- Jalón Abierto en Supinación en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón Abierto en Supinación en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02451301-Cable-Underhand-Pulldown_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado de cara a la polea con la espalda recta, estira los brazos hacia arriba y coge la barra con las manos a una anchura mayor a la de los hombros y las manos hacia atrás.', 'Flexiona los brazos llevando los codos a los costados y bajando la barra hasta el pecho.', 'Estira de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón Abierto en Supinación en Polea Alta')
);

-- Jalón Abierto Neutro en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón Abierto Neutro en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/42171301-Cable-Wide-Neutral-Grip-PullDown_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado de cara a la polea con la espalda recta, estira los brazos hacia arriba y coge la barra con las manos a una anchura muy superior a la de los hombros y las manos hacia el interior.', 'Flexiona los brazos bajando las manos a la altura aproximada de los hombros.', 'Estira de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón Abierto Neutro en Polea Alta')
);

-- Jalón Aislado en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón Aislado en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00071301-Alternate-Lateral-Pulldown_back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado en un banco o similar, con la espalda recta, coge la polea alta con un brazo estirado y la palma de la mano hacia delante.', 'Flexiona el brazo llevando el codo al costado y estira de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón Aislado en Polea Alta')
);

-- Jalón Aislado Prono-Neutro en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón Aislado Prono-Neutro en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/12041301-Cable-one-arm-lat-pulldown_back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado delante de la polea alta, estira un brazo hacia arriba y coge el agarre con la palma de la mano hacia delante.', 'Baja el codo hacia el costado girando la mano hacia el interior y vuelve a subir de forma controlada sin llegar a descansar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón Aislado Prono-Neutro en Polea Alta')
);

-- Jalón Aislado Prono-Supino en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón Aislado Prono-Supino en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01931301-Cable-One-Arm-Straight-Back-High-Row-kneeling_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado o de rodillas delante de la polea alta, estira un brazo hacia arriba y coge el agarre con la palma de la mano hacia delante.', 'Baja el codo hacia el costado girando la mano 180º de forma que quede la palma hacia el cuerpo y vuelve a subir de forma controlada sin llegar a descansar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón Aislado Prono-Supino en Polea Alta')
);

-- Jalón Cerrado con Cuerda en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón Cerrado con Cuerda en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01771301-Cable-Lateral-Pulldown-with-rope-attachment_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado de cara a la polea con la espalda recta, estira los brazos hacia arriba y coge la cuerda con agarre en martillo.', 'Flexiona los brazos llevando los codos a los costados y bajando las manos al esternón.', 'Estira de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón Cerrado con Cuerda en Polea Alta')
);

-- Jalón Cerrado en Pronación en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón Cerrado en Pronación en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10471301-Cable-Close-Grip-Front-Lat-Pulldown_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado de cara a la polea con la espalda recta, estira los brazos hacia arriba y coge la barra con las manos a una anchura inferior a la de los hombros y las manos hacia delante.', 'Flexiona los brazos llevando los codos a los costados y bajando la barra hasta el pecho.', 'Estira de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón Cerrado en Pronación en Polea Alta')
);

-- Jalón Cerrado Neutro con Inclinación en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón Cerrado Neutro con Inclinación en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02131301-Cable-Seated-High-Row-V-bar_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado de cara a la polea con la espalda recta, estira los brazos hacia arriba y coge el soporte con agarre en martillo.', 'Flexiona los brazos llevando los codos a los costados y bajando el soporte hasta el pecho mientras te inclinas hacia atrás.', 'Estira de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón Cerrado Neutro con Inclinación en Polea Alta')
);

-- Jalón Cerrado Neutro en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón Cerrado Neutro en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/26161301-Cable-Lateral-Pulldown-with-V-bar_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado de cara a la polea con la espalda recta, estira los brazos hacia arriba y coge el soporte con agarre en martillo.', 'Flexiona los brazos llevando los codos a los costados y bajando el soporte hasta el pecho.', 'Estira de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón Cerrado Neutro en Polea Alta')
);

-- Jalón en Pronación en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón en Pronación en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/05791301-Lever-Front-Pulldown_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado y con el pecho apoyado, estira los brazos hacia arriba y coge los agarres con las manos en pronación (palmas hacia delante).', 'Realiza la flexión de los codos llevando las manos hacia abajo con retracción escapular al final del movimiento.', 'Asciende lentamente sin llegar a apoyar el peso al final y vuelve a bajar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón en Pronación en Máquina')
);

-- Jalón en Pronación en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón en Pronación en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01981301-Cable-Pulldown_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado de cara a la polea con la espalda recta, estira los brazos hacia arriba y coge la barra con las manos a la anchura de los hombros y las manos hacia delante.', 'Flexiona los brazos llevando los codos a los costados y bajando la barra al pecho.', 'Estira de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón en Pronación en Polea Alta')
);

-- Jalón en Supinación con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón en Supinación con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/31161301-Band-Fixed-Back-Underhand-Pulldown_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Sentado en un banco o similar, pon las bandas en un lugar alto.', 'Con la espalda recta, estira los brazos hacia arriba y agarra los extremos con las manos en supinación (palmas hacia arriba).', 'Flexiona los codos llevándolos a los costados y sacando pecho.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón en Supinación con Bandas')
);

-- Jalón en Supinación en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón en Supinación en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/06731301-reverse-grip-machine-lat-pulldown_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado y con el pecho apoyado, estira los brazos hacia arriba y coge los agarres con las manos en supinación (palmas hacia atrás).', 'Realiza la flexión de los codos llevando las manos hacia abajo con retracción escapular al final del movimiento.', 'Asciende lentamente sin llegar a apoyar el peso al final y vuelve a bajar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón en Supinación en Máquina')
);

-- Jalón en Supinación en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón en Supinación en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02081301-Cable-Reverse-grip-Straight-Back-Seated-High-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado de cara a la polea con la espalda recta, estira los brazos hacia arriba y coge la barra con las manos a la anchura de los hombros y las manos hacia atrás.', 'Flexiona los brazos llevando los codos a los costados y bajando la barra hasta el pecho.', 'Estira de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón en Supinación en Polea Alta')
);

-- Jalón Neutro con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón Neutro con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/31171301-Band-Fixed-Back-Close-Grip-Pulldown_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Sentado en un banco o similar, pon las bandas en un lugar alto.', 'Con la espalda recta, estira los brazos hacia arriba y agarra los extremos con las manos en martillo o neutras (palmas hacia dentro).', 'Flexiona los codos llevándolos a los costados y sacando pecho.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón Neutro con Bandas')
);

-- Jalón Trasero Abierto en Pronación en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jalón Trasero Abierto en Pronación en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13251301-Cable-Wide-Grip-Rear-Pulldown-Behind-Neck_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado de cara a la polea con la espalda recta, estira los brazos hacia arriba y coge la barra con las manos a una anchura mayor a la de los hombros y las manos hacia delante.', 'Flexiona los brazos llevando los codos a los costados y bajando la barra tras la cabeza.', 'Estira de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jalón Trasero Abierto en Pronación en Polea Alta')
);

-- Janda Sit-up
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Janda Sit-up'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/05081301-Janda-Sit-up_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Siéntate en el suelo con las piernas ligeramente flexionadas, los brazos entrelazados en el pecho pero con los codos perpendiculares, sin apoyar.', 'Deslízate hacia atrás manteniendo el control, luego utiliza los músculos abdominales para levantar el torso de nuevo.', 'Concéntrate en activar los abdominales, evita el impulso y repite el movimiento.', 'Este ejercicio fortalece el core y las caderas.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Janda Sit-up')
);

-- Jumping Jacks
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Jumping Jacks'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/30941301-Jumping-Jack-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Comienza de pie con los pies juntos.', 'Con un solo movimiento, dando un pequeño salto, abre los pies hacia los lados y levanta los brazos por encima de la cabeza.', 'Inmediatamente invierte el movimiento volviendo a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Jumping Jacks')
);

-- Krankcycle
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Krankcycle'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/21391301-Hands-bike_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['El KRANKcycle es una bicicleta de mano que permite entrenar de manera aeróbica la parte superior del cuerpo.', 'Es un tipo de ejercicio físico que permite efectuar un entrenamiento aeróbico con una actividad centrada en los brazos y la parte superior del cuerpo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Krankcycle')
);

-- Máquina de Remo
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Máquina de Remo'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/11611301-Rowing-with-rowing-machine_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Con la espalda recta, núcleo compacto y los pies firmes, empuja primero con la parte inferior del cuerpo y a continuación utiliza la espalda para tirar las manos hacia el pecho.', 'Después, suelta los brazos hacia la base y dobla las rodillas para que puedas deslizarte y volver a la posición inicial.', 'A tener en cuenta: -Empuja con los hombros hacia atrás (para abrir el pecho) y hacia abajo (para liberar tensión en el cuello).', 'Mantén la espalda recta mediante la participación de núcleo y una respiración profunda. -Usa los músculos de la espalda superior para tirar del remo hacia el pecho.', 'Al final de cada remada, los codos deberán doblarse más de 90 grados y los antebrazos deberán tocar casi la caja torácica. -Coloca las manos en la parte exterior del remo (no en el centro).', 'El meñique debe estar fuera, descansando los pulgares en la parte superior del mango (no los envuelvas alrededor). -Cada vez que tires hacia atrás, recuerda que debes utilizar tu parte superior de la espalda, no los hombros y el bíceps.', 'Esto ayudará a aliviar la presión de tus manos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Máquina de Remo')
);

-- Máquina de Step
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Máquina de Step'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/21401301-Walk-Wave-Machine_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Los pies se deben mantener firmes pisando de una manera natural, relajando tus rodillas en todo momento.', 'Evita pararte en puntillas.', 'La postura correcta de tu cuerpo es con una ligera inclinación hacia adelante mientras se mantienen contraídos los músculos abdominales.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Máquina de Step')
);

-- Máquina Elíptica
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Máquina Elíptica'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/21921301-Elliptical-Machine-Walk_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['La elíptica es uno de los equipos de cardio que más músculos permite trabajar al mismo tiempo.', 'Aumenta la fuerza y la resistencia muscular en cuádriceps, isquiotibiales, glúteos y pantorrillas, pero también ejercita brazos, el pecho y la espalda al utilizar de forma activa las asas.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Máquina Elíptica')
);

-- Máquina Escaladora
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Máquina Escaladora'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/23111301-Walking-on-Stepmill_Thighs_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['La escaladora sirve principalmente para realizar un entrenamiento de cardio o de alta intensidad.', 'Conforme el movimiento se realiza, el ritmo de tu corazón se eleva, ayudando a la resistencia cardiovascular.', 'Intenta utilizar lo mínimo el apoyo de las manos y ve incrementando la intensidad según tus necesidades y objetivos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Máquina Escaladora')
);

-- Marcha Horizontal Aislada con pierna extendida
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Marcha Horizontal Aislada con pierna extendida'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Glúteo, Aductor, Cuádriceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/34961301-Lying-Straight-Leg-Marches_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Glúteo', 'Aductor', 'Cuádriceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Túmbate hacia arriba, con las piernas extendidas y los brazos a los lados, contrae los abdominales y levanta ligeramente los glúteos.', 'Levanta una pierna del suelo mientras mantienes la otra extendida y en contacto con el suelo.', 'Baja la pierna levantada de manera controlada hasta llegar a la posición inicial.', 'Mantén el movimiento controlado y constante durante el número deseado de repeticiones y luego cambia de pierna.', 'Este ejercicio trabaja los músculos abdominales y puede ayudar a mejorar la estabilidad del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Marcha Horizontal Aislada con pierna extendida')
);

-- Marcha Horizontal Alterna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Marcha Horizontal Alterna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Cuádriceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/39621301-Seated-Flutter-Kick_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Cuádriceps']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Desde una posición sentada en un banco con el cuerpo perpendicular al asiento y las piernas extendidas frente a ti, contrae los abdominales y levanta el torso hacia adelante mientras levantas una pierna a la vez.', 'Levanta ligeramente las piernas del suelo y realiza un movimiento de patada rápido y alternante con las piernas, como si estuvieras nadando estilo mariposa.', 'Mantén el torso erguido y los abdominales contraídos durante todo el movimiento.', 'Continúa el movimiento de patada durante el número deseado de repeticiones.', 'Este ejercicio trabaja los músculos abdominales inferiores y puede ayudar a mejorar la resistencia del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Marcha Horizontal Alterna')
);

-- Marcha Horizontal Alterna con palmada
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Marcha Horizontal Alterna con palmada'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Cuádriceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/39441301-Seated-Alternate-Crunch_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Cuádriceps']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Desde una posición sentada en un banco con el cuerpo perpendicular al asiento y las piernas extendidas frente a ti, contrae los abdominales y levanta el torso hacia adelante mientras levantas una pierna a la vez.', 'Trata de dar como una palmada debajo de la rodilla.', 'Regresa a la posición inicial y repite el movimiento con la otra pierna, alternando entre lados.', 'Mantén el movimiento controlado y continúa alternando las piernas durante el número deseado de repeticiones.', 'Este ejercicio fortalece los músculos abdominales y oblicuos, proporcionando un entrenamiento efectivo para el core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Marcha Horizontal Alterna con palmada')
);

-- Media Sentadilla con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Media Sentadilla con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00261301-Barbell-Bench-Squat_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie delante de un banco o silla, con las piernas separadas a la anchura de los hombros y una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Desciende flexionando las rodillas 90º hasta tocar el banco con los glúteos, sin descansar en él, subiendo de nuevo y estirando bien arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Media Sentadilla con Barra')
);

-- Media Sentadilla con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Media Sentadilla con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02911301-Dumbbell-Bench-Squat_thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['De pie delante de un banco o silla, con las piernas separadas a la anchura de los hombros y una barra mancuerna en cada mano.', 'Desciende flexionando las rodillas 90º hasta tocar el banco con los glúteos, sin descansar en él, subiendo de nuevo y estirando bien arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Media Sentadilla con Mancuernas')
);

-- Mountain Climbers
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Mountain Climbers'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/06301301-Mountain-Climber_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['A partir de esa postura, comienza el movimiento consistente en llevar de manera alterna las rodillas hacia el codo opuesto, es decir, elevar la rodilla izquierda hacia el codo derecho por debajo del cuerpo y la derecha hacia el codo izquierdo de igual modo.', 'El cambio de pierna se realiza mediante salto explosivo, si bien para ejecutarlo correctamente se necesita partir de una forma física inicial adecuada.', 'Para aquellos que están comenzando a introducirse en el mundo deportivo es mejor practicarlo marcando el gesto sin salto y modificando el ritmo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Mountain Climbers')
);

-- Pájaros Aislados con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pájaros Aislados con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03451301-Dumbbell-Lying-One-Arm-Rear-Lateral-Raise_shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado hacia abajo en un banco plano, coge una mancuerna con una mano y usa la otra para estabilizarte.', 'Con el codo levemente flexionado, levanta simultáneamente el peso lateralmente.', 'Debes tratar que tanto el codo como la palma de la mano vayan alineados, sin meter ningún tipo de tirón.', 'El codo no deben subir más que la muñeca, de lo contrario estaremos haciendo mal el movimiento (ocurre algo parecido a las elevaciones laterales con mancuerna).', 'Por último, vuelve a la posición de inicio, siguiendo el mismo recorrido que tomamos al hacer el ascenso, evitando dejar caer el peso de golpe.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pájaros Aislados con Mancuerna')
);

-- Pájaros Aislados en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pájaros Aislados en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/39121301-Cable-Bent-Over-One-Arm-Lateral-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie al lado de la polea con las piernas ligeramente separadas y semiflexionadas, inclina el cuerpo hacia delante y coge la polea con la.mano más lejana.', 'A continuación con el codo levemente flexionado, levanta el peso lateralmente.', 'Debes tratar que tanto el codo como la palma de la mano vayan alineados, sin meter ningún tipo de tirón.', 'Los codos no deben subir más que las muñecas, de lo contrario estaremos haciendo mal el movimiento (ocurre algo parecido a las elevaciones laterales con mancuerna).', 'Por último, vuelve a la posición de inicio, siguiendo el mismo recorrido que tomamos al hacer el ascenso, evitando dejar caer el peso de golpe.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pájaros Aislados en Polea')
);

-- Pájaros de pie con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pájaros de pie con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/39711301-Band-bent-over-rear-lateral-raise-male_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y semiflexionadas, inclina el cuerpo hacia delante y coge un extremo de las bandas (del lado opuesto) con cada mano con las palmas enfrentadas.', 'A continuación, junta ambas manos y con los codos levemente flexionados, levanta simultáneamente el peso lateralmente.', 'Debes tratar que tanto los codos como la palma de la mano vayan alineados, sin meter ningún tipo de tirón.', 'Los codos no deben subir más que las muñecas, de lo contrario estaremos haciendo mal el movimiento (ocurre algo parecido a las elevaciones laterales con mancuerna).', 'Por último, vuelve a la posición de inicio, siguiendo el mismo recorrido que tomamos al hacer el ascenso, evitando dejar caer el peso de golpe.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pájaros de pie con Bandas')
);

-- Pájaros de pie con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pájaros de pie con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03801301-Dumbbell-Rear-Lateral-Raise_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas y semiflexionadas, inclina el cuerpo hacia delante y coge una mancuerna con cada mano con las palmas enfrentadas.', 'A continuación, junta ambas mancuernas y con los codos levemente flexionados, levanta simultáneamente el peso lateralmente.', 'Debes tratar que tanto los codos como la palma de la mano vayan alineados, sin meter ningún tipo de tirón.', 'Los codos no deben subir más que las muñecas, de lo contrario estaremos haciendo mal el movimiento (ocurre algo parecido a las elevaciones laterales con mancuerna).', 'Por último, vuelve a la posición de inicio, siguiendo el mismo recorrido que tomamos al hacer el ascenso, evitando dejar caer el peso de golpe.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pájaros de pie con Mancuernas')
);

-- Pájaros sentado con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pájaros sentado con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03781301-Dumbbell-Rear-Fly_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentado inclina el cuerpo hacia delante y coge una mancuerna con cada mano con las palmas enfrentadas, a ambos lados del cuerpo.', 'Con los codos levemente flexionados, levanta simultáneamente el peso lateralmente.', 'Debes tratar que tanto los codos como la palma de la mano vayan alineados, sin meter ningún tipo de tirón.', 'Los codos no deben subir más que las muñecas, de lo contrario estaremos haciendo mal el movimiento (ocurre algo parecido a las elevaciones laterales con mancuerna).', 'Por último, vuelve a la posición de inicio, siguiendo el mismo recorrido que tomamos al hacer el ascenso, evitando dejar caer el peso de golpe.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pájaros sentado con Mancuernas')
);

-- Paso lateral con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Paso lateral con Banda'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/29261301-X-Band-Side-Walk_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Pisa la banda elástica con los pies y colócalos a anchura de las caderas.', 'Cruza la banda y tira fuerte de ella haciendo una retracción escapular llevando los codos atrás.', 'Flexiona un poco las piernas cargando la mayor parte del peso en los glúteos.', 'Desde esa posición da un paso lateral haciendo una abducción de cadera contrayendo fuerte el glúteo medio.', 'Vuelve despacio con el otro pie a la posición inicial, es decir, que los pies vuelvan a estar a anchura de las caderas (no los juntes).']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Paso lateral con Banda')
);

-- Patadas altas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Patadas altas'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36381301-Push-to-Run_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Sube una pierna flexionada a 90º de forma que la rodilla quede sobre la cadera y después extiéndela completamente.', 'Desciende y haz lo mismo con la otra pierna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Patadas altas')
);

-- Patadas Traseras Alternas con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Patadas Traseras Alternas con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17301301-Dumbbell-Seated-Bent-Over-Alternate-Kickback_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentados, cogemos una mancuerna con cada mano.', 'Las palmas deben estar enfocadas hacia el cuerpo.', 'Inclinamos el cuerpo hacia delante de forma que quede casi paralelo al suelo.', 'Los brazos, cerca del cuerpo y también paralelos al suelo.', 'Debemos de formar un ángulo recto entre el antebrazo y la parte superior del brazo.', 'Empieza el movimiento inspirando y utilizando el tríceps para levantar la mancuerna hasta que los brazos queden completamente extendidos.', 'Céntrate en mover los antebrazos.', 'Luego, párate un poco antes de descender, expulsa el aire y empieza a bajar la mancuerna hacia la posición inicial de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Patadas Traseras Alternas con Mancuernas')
);

-- Patadas Traseras con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Patadas Traseras con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03331301-Dumbbell-Kickback_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie, cogemos una mancuerna con una mano.', 'La palma debe estar enfocada hacia el cuerpo.', 'Inclinamos el cuerpo hacia delante de forma que quede casi paralelo al suelo.', 'Podemos apoyar sobre un banco la rodilla y el brazo opuestos al lado que vamos a trabajar.', 'El brazo debe estar cerca del cuerpo y también paralelo al suelo.', 'Debemos de formar un ángulo recto entre el antebrazo y la parte superior del brazo.', 'Empieza el movimiento inspirando y utilizando el tríceps para levantar la mancuerna hasta que el brazo quede completamente extendido.', 'Céntrate en mover el antebrazo.', 'Luego, párate un poco antes de descender, expulsa el aire y empieza a bajar la mancuerna hacia la posición inicial de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Patadas Traseras con Mancuernas')
);

-- Patadas Traseras en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Patadas Traseras en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/08601301-Cable-kickback_Upper-arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie de cara a la polea, coge la barra con una mano en supinación (palma hacia arriba).', 'Inclina el cuerpo hacia delante.', 'Podemos apoyar sobre un banco la rodilla y el brazo opuestos al lado que vamos a trabajar.', 'El brazo debe estar cerca del cuerpo y paralelo al suelo.', 'Empieza el movimiento inspirando y utilizando el tríceps para levantar la mancuerna hasta que el brazo quede completamente extendido.', 'Céntrate en mover el antebrazo.', 'Luego, párate un poco antes de descender, expulsa el aire y empieza a bajar la mano hacia la posición inicial de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Patadas Traseras en Polea')
);

-- Peso Muerto a una pierna con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto a una pierna con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17561301-Barbell-Single-Leg-Deadlift_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta, sujeta la barra con las manos en pronación (palmas hacia atrás) a la anchura de los hombros, activando ligeramente las escápulas y con el pecho fuera.', 'Levanta una pierna del suelo flexionando ligeramente hacia atrás.', 'Flexiona la rodilla de apoyo de 15º a 20º, empujando la cadera hacia atrás y estirando la pierna no apoyada hacia atrás de forma que quede paralela al suelo, mientras inclinas el cuerpo hacia delante quedando también paralelo al suelo.', 'Comienza a extender la cadera a medida que la barra asciende y vuelve en la posición inicial, contrayendo glúteos y activando ligeramente las escápulas con el pecho bien arriba y la posición anatómica natural de toda la columna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto a una pierna con Barra')
);

-- Peso Muerto a una pierna con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto a una pierna con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17571301-Dumbbell-Single-Leg-Deadlift_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta, sujeta las mancuernas por delante del cuerpo con las palmas hacia atrás, activando ligeramente las escápulas y con el pecho fuera.', 'Levanta una pierna del suelo flexionando ligeramente hacia atrás.', 'Flexiona la rodilla de apoyo de 15º a 20º, empujando la cadera hacia atrás y estirando la pierna no apoyada hacia atrás de forma que quede paralela al suelo, mientras inclinas el cuerpo hacia delante quedando también paralelo al suelo.', 'Comienza a extender la cadera a medida que las mancuernas ascienden y vuelve en la posición inicial, contrayendo glúteos y activando ligeramente las escápulas con el pecho bien arriba y la posición anatómica natural de toda la columna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto a una pierna con Mancuernas')
);

-- Peso Muerto Abierto con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto Abierto con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/28071301-Dumbbell-Sumo-Pull-Through_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta, sujeta una mancuerna por delante del cuerpo, activando ligeramente las escápulas y con el pecho fuera.', 'Las piernas separadas a una anchura superior a la de los hombros.', 'Flexiona las rodillas casi 90º, empujando la cadera hacia atrás, dejando todo el peso en los talones, con un movimiento llamado de “bisagra”, a medida que la mancuerna desciende aproximadamente a la altura de las rodillas, entre las piernas, notando el estiramiento de nuestros músculos isquiosurales.', 'Comienza a extender la cadera a medida que las manos ascienden y vuelve en la posición inicial, contrayendo glúteos y activando ligeramente las escápulas con el pecho bien arriba y la posición anatómica natural de toda la columna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto Abierto con Mancuerna')
);

-- Peso Muerto Asistido con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto Asistido con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00741301-Barbell-Rack-Pull_Hips-FIX_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga, Otro'::text as equipment,
  ARRAY['De pie con la espalda recta, sujeta la barra con las manos en pronación (palmas hacia atrás) a la anchura de los hombros, activando ligeramente las escápulas y con el pecho fuera.', 'Las piernas separadas a la anchura de la cadera.', 'Hazlo en una jaula o rack, con apoyo de la barra bajo las rodillas.', 'Flexiona las rodillas unos 45º, empujando la cadera hacia atrás, dejando todo el peso en los talones, con un movimiento llamado de “bisagra”, a medida que la barra desciende aproximadamente a la altura de las rodillas, notando el estiramiento de nuestros músculos isquiosurales.', 'Comienza a extender la cadera a medida que la barra asciende y vuelve en la posición inicial, contrayendo glúteos y activando ligeramente las escápulas con el pecho bien arriba y la posición anatómica natural de toda la columna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto Asistido con Barra')
);

-- Peso Muerto con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10091301-Band-stiff-leg-deadlift_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con las piernas separadas a la anchura de los hombros, pisa una banda y agáchate hacia delante con la espalda recta, sacando glúteos.', 'Coge los extremos de la banda y ponte en posición erguida, estirando bien el cuerpo en vertical y apretando los glúteos arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto con Banda')
);

-- Peso Muerto con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09911301-Band-pull-through_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con las piernas separadas a la anchura de los hombros, pon las bandas en algún soporte detrás del ti y agáchate hacia delante con la espalda recta, sacando glúteos.', 'Coge los extremos de la banda y ponte en posición erguida, estirando bien el cuerpo en vertical y apretando los glúteos arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto con Bandas')
);

-- Peso Muerto con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00321301-Barbell-Deadlift_Hips-FIX_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta, sujeta la barra con las manos en pronación (palmas hacia atrás) a la anchura de los hombros, activando ligeramente las escápulas y con el pecho fuera.', 'Las piernas separadas a la anchura de la cadera.', 'Flexiona las rodillas casi 90º, empujando la cadera hacia atrás, dejando todo el peso en los talones, con un movimiento llamado de bisagra, a medida que la barra desciende aproximadamente a la altura de las rodillas, notando el estiramiento de nuestros músculos isquiosurales.', 'Comienza a extender la cadera a medida que la barra asciende y vuelve en la posición inicial, contrayendo glúteos y activando ligeramente las escápulas con el pecho bien arriba y la posición anatómica natural de toda la columna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto con Barra')
);

-- Peso Muerto con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14591301-Dumbbell-Romanian-Deadlift_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta, sujeta una mancuerna en cada mano con agarre en pronación (palmas hacia atrás) a la anchura de los hombros, activando ligeramente las escápulas y con el pecho fuera.', 'Las piernas separadas a la anchura de la cadera.', 'Flexiona las rodillas casi 90º, empujando la cadera hacia atrás, dejando todo el peso en los talones, con un movimiento llamado de “bisagra”, a medida que las mancuernas descienden aproximadamente a la altura de las rodillas, notando el estiramiento de nuestros músculos isquiosurales.', 'Comienza a extender la cadera a medida que las manos ascienden y vuelve en la posición inicial, contrayendo glúteos y activando ligeramente las escápulas con el pecho bien arriba y la posición anatómica natural de toda la columna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto con Mancuernas')
);

-- Peso Muerto en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/12061301-Cable-pull-through_hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Colócate de espaldas a la polea baja con las piernas separadas a la anchura de los hombros.', 'Ahora dobla las rodillas y ponte en cuclillas.', 'Agarra el soporte con los brazos extendidos hacia atrás entre las piernas.', 'Procura mantener la espalda recta y estable tensando los músculos abdominales.', 'Estira el cuerpo poniéndote en vertical y contrayendo los glúteos al llegar arriba.', 'Desciende lentamente sin llegar a descansar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto en Polea')
);

-- Peso Muerto en Punta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto en Punta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/42471301-Landmine-Romanian-Deadlift-VERSION-2_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['De pie de cara a la barra con las piernas a la anchura de los hombros ligeramente flexionada y el cuerpo inclinado hacia delante, coge el extremo de la barra con las dos manos entrelazadas y los brazos estirados hacia abajo.', 'Estira el cuerpo dejándolo completamente en vertical, apretando glúteos arriba y sin cargar el peso en los brazos, con la espalda siempre recta.', 'Desciende de nuevo sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto en Punta')
);

-- Peso Muerto Rígido con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto Rígido con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04321301-Dumbbell-Stiff-Leg-Deadlift_Waist_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta, sujeta una mancuerna en cada mano con agarre en pronación (palmas hacia atrás) a la anchura de los hombros, activando ligeramente las escápulas y con el pecho fuera.', 'Las piernas casi juntas.', 'Inclina el torso hacia delante formando un ángulo de 90º con las piernas, que deben permanecer rectas.', 'Vuelve en la posición inicial, contrayendo glúteos y activando ligeramente las escápulas con el pecho bien arriba y la posición anatómica natural de toda la columna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto Rígido con Mancuernas')
);

-- Peso Muerto Rumano con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto Rumano con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00851301-Barbell-Romanian-Deadlift_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta, sujeta la barra con las manos en pronación (palmas hacia atrás) a la anchura de los hombros, activando ligeramente las escápulas y con el pecho fuera.', 'Las piernas separadas a la anchura de la cadera.', 'Flexiona las rodillas de 15º a 20º, empujando la cadera hacia atrás, dejando todo el peso en los talones, con un movimiento llamado de “bisagra”, a medida que la barra desciende aproximadamente a la altura de las rodillas, notando el estiramiento de nuestros músculos isquiosurales.', 'Comienza a extender la cadera a medida que la barra asciende y vuelve en la posición inicial, contrayendo glúteos y activando ligeramente las escápulas con el pecho bien arriba y la posición anatómica natural de toda la columna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto Rumano con Barra')
);

-- Peso Muerto Rumano con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto Rumano con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14591301-Dumbbell-Romanian-Deadlift_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta, sujeta las mancuernas con las manos en pronación (palmas hacia atrás) a la anchura de los hombros, activando ligeramente las escápulas y con el pecho fuera.', 'Las piernas separadas a la anchura de la cadera.', 'Flexiona las rodillas de 15º a 20º, empujando la cadera hacia atrás, dejando todo el peso en los talones, con un movimiento llamado de “bisagra”, a medida que las mancuernas descienden aproximadamente a la altura de las rodillas, notando el estiramiento de nuestros músculos isquiosurales.', 'Comienza a extender la cadera a medida que las manos ascienden y vuelve en la posición inicial, contrayendo glúteos y activando ligeramente las escápulas con el pecho bien arriba y la posición anatómica natural de toda la columna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto Rumano con Mancuernas')
);

-- Peso Muerto Sumo con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Peso Muerto Sumo con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01171301-Barbell-Sumo-Deadlift_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con la espalda recta, sujeta la barra con una mano hacia delante y otra hacia atrás a la anchura de los hombros, activando ligeramente las escápulas y con el pecho fuera.', 'Las piernas muy separadas.', 'Flexiona las rodillas casi 90º sacando pecho y glúteos.', 'Comienza a extender la cadera a medida que la barra asciende y estira bien arriba, contrayendo glúteos y activando ligeramente las escápulas y la posición anatómica natural de toda la columna.', 'Desciende de nuevo y repite el movimiento.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Peso Muerto Sumo con Barra')
);

-- Pies rápidos agachado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pies rápidos agachado'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/35521301-Quick-Feet-VERSION-2_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Mantente agachado durante todo el movimiento, bloquea tus brazos y da los pasos tan rápido como puedas.', 'Respira profundamente, con un ritmo suave y constante, y mantén la columna vertebral neutra y el núcleo apretado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pies rápidos agachado')
);

-- Pies rápidos de pie
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pies rápidos de pie'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/31961301-Quick-Feet-Run_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['De pie con el torso ligeramente inclinado hacia delante, acompaña con tus brazos y da los pasos tan rápido como puedas en el sitio.', 'Respira profundamente, con un ritmo suave y constante, y mantén la columna vertebral neutra y el núcleo apretado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pies rápidos de pie')
);

-- Plancha
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Plancha'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04631301-Front-Plank_waist-FIX_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Túmbate hacia abajo en el suelo, apoyando las punteras de los pies y los antebrazos, con los codos justo debajo de los hombros, poniendo especial cuidado a que la zona lumbar no se arquee.', 'Dirige tu mirada al suelo para mantener alineada la zona cervical, no trates de levantar la cabeza mirando hacia el frente.', 'Aguanta con los glúteos y abdominales contraídos, manteniendo la cadera arriba sin arquear la espalda.', 'Durante este ejercicio debes poner tu atención en sentir la activación de tus músculos y respirar correctamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Plancha')
);

-- Plancha con rodillas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Plancha con rodillas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/32381301-Kneeling-plank-male_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Túmbate hacia abajo en el suelo, apoyando las rodillas y los antebrazos, con los codos justo debajo de los hombros, poniendo especial cuidado a que la zona lumbar no se arquee.', 'Dirige tu mirada al suelo para mantener alineada la zona cervical, no trates de levantar la cabeza mirando hacia el frente.', 'Echa la cadera hacia delante y aguanta con los glúteos y abdominales contraídos.', 'Durante este ejercicio debes poner tu atención en sentir la activación de tus músculos y respirar correctamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Plancha con rodillas')
);

-- Plancha Lateral
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Plancha Lateral'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/07151301-Side-Plank-m_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Túmbate de lado en el suelo.', 'Apoya un antebrazo con el codo bajo el hombro y el otro brazo estirado sobre el cuerpo, pon los pies juntos y luego eleva la cadera apoyando sólo el pie de abajo y el antebrazo, con las piernas rectas en línea con el torso.', 'Al tratarse de un ejercicio isométrico, el esfuerzo se realiza al mantener la posición.', 'Intenta aguantar el máximo de tiempo posible en esta posición.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Plancha Lateral')
);

-- Plancha Lateral Inclinada
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Plancha Lateral Inclinada'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/35441301-Bodyweight-Incline-Side-Plank_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Ponte de lado apoyando un antebrazo sobre un banco plano, con el codo bajo el hombro y el otro brazo estirado sobre el cuerpo, pon los pies juntos y luego eleva la cadera apoyando sólo el pie de abajo y el antebrazo, con las piernas rectas en línea con el torso.', 'Al tratarse de un ejercicio isométrico, el esfuerzo se realiza al mantener la posición.', 'Intenta aguantar el máximo de tiempo posible en esta posición.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Plancha Lateral Inclinada')
);

-- Pliegue completo con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pliegue completo con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09811301-Band-jack-knife-sit-up_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Tumbado en el suelo (o colchoneta de ejercicios) sobre la espalda con los brazos estirados a los lados del cuerpo y con las piernas extendidas.', 'Ponte unas correas en los pies agarradas a unas bandas en algún soporte.', 'Flexiona el torso encogiendo el abdomen al mismo tiempo que flexionas las piernas, hasta que el abdomen quede frente a las rodillas.', 'Desciende lentamente a la posición inicial y repite.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pliegue completo con Bandas')
);

-- Pliegue completo entre Poleas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pliegue completo entre Poleas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02421301-Cable-Tuck-Reverse-Crunch_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Tumbado en el suelo (o colchoneta de ejercicios) sobre la espalda con los brazos estirados hacia atrás detrás de la cabeza y con las piernas extendidas.', 'Ponte unas correas en los pies agarradas a una polea baja.', 'Con las manos coge una cuerda también con una polea baja al lado contrario, y ponla sobre la cabeza.', 'Flexiona el torso encogiendo el abdomen al mismo tiempo que flexionas las piernas, hasta que los codos queden frente a las rodillas.', 'Desciende lentamente a la posición inicial y repite.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pliegue completo entre Poleas')
);

-- Plyo Jacks
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Plyo Jacks'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/31081301-Plyo-Jacks-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Para hacer el Plyo Jack, comienza con los pies separados y los brazos relajados.', 'Después, ponte de cuclillas, cargando bien tus glúteos.', 'Ahora salta y, estando en el aire, separa tus piernas todo lo que puedas mientras levantas los brazos.', 'Para acabar, hazlo en posición de sentadilla.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Plyo Jacks')
);

-- Post-Workout
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Post-Workout'::text as nombre,
  'Tipo: Estiramiento. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Estiramiento'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/02/estiramiento.jpg'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Estiramientos para después del entrenamiento.', 'Importante para reducir las agujetas y favorecer la recuperación muscular.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Post-Workout')
);

-- Pre-Workout
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pre-Workout'::text as nombre,
  'Tipo: Estiramiento. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Estiramiento'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/02/calentamiento.jpg'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Calentamiento para antes del entrenamiento.', 'Importante para evitar lesiones, poner énfasis en las articulaciones y principales músculos a entrenar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pre-Workout')
);

-- Prensa Inclinada
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Prensa Inclinada'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/07401301-Sled-45°-Leg-Wide-Press_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Colócate con la espalda bien apoyada en el respaldo de la máquina inclinada a 45 grados y los pies sobre la plataforma, a la anchura de los hombros.', 'Quita los soportes laterales del peso y empuja la plataforma con las piernas para dejar casi extendidas las mismas.', 'Desde allí, inspira y con las rodillas desbloqueadas flexionamos las piernas hasta que los muslos lleguen lo más cercano posible de la caja torácica sin sobrepasar el ángulo de 90 grados con las piernas.', 'Lentamente regresa a la posición inicial sin extender por completo las rodillas y exhala al final del movimiento.', 'Mantén la misma apertura de rodillas, no abrir ni cerrar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Prensa Inclinada')
);

-- Prensa Inclinada Cerrada
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Prensa Inclinada Cerrada'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15751301-Sled-45°-Narrow-Stance-Leg-Press_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Colócate con la espalda bien apoyada en el respaldo de la máquina inclinada a 45 grados y los pies sobre la plataforma, a una anchura inferior a la de los hombros.', 'Quita los soportes laterales del peso y empuja la plataforma con las piernas para dejar casi extendidas las mismas.', 'Desde allí, inspira y con las rodillas desbloqueadas flexionamos las piernas hasta que los muslos lleguen lo más cercano posible de la caja torácica sin sobrepasar el ángulo de 90 grados con las piernas.', 'Lentamente regresa a la posición inicial sin extender por completo las rodillas y exhala al final del movimiento.', 'Mantén la misma apertura de rodillas, no abrir ni cerrar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Prensa Inclinada Cerrada')
);

-- Press a una mano con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press a una mano con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Antebrazo, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/00651301-Barbell-One-Arm-Floor-Press_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Tríceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['Tumbado sobre el suelo o en un banco, coge la barra por el centro con agarre neutro.', 'Estira el brazo tensando bien arriba y desciende hasta tener el codo flexionado a 90 grados.', 'Al terminar la serie cambiar de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press a una mano con Barra')
);

-- Press Abierto Neutro con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Abierto Neutro con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/03401301-Dumbbell-Lying-Hammer-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Túmbate de espaldas en el banco plano y coge las mancuernas con agarre neutro (martillo) directamente sobre los hombros con los brazos totalmente extendidos.', 'Las mancuernas no deben estar en contacto, si no una sobre cada pectoral.', 'Junta los omóplatos y saca pecho ligeramente.', 'Baja las mancuernas a ambos lados del pecho.', 'Haz una pausa sin relajar y luego lleva las mancuernas a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Abierto Neutro con Mancuernas')
);

-- Press Aislado en Punta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Aislado en Punta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/35251301-Landmine-Kneeling-One-Arm-Shoulder-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Con una rodilla apoyada hacia atrás y un pie hacia delante flexionado para tener estabilidad, ponte en el extremo de la barra, con la espalda recta, coge la punta de la barra con una mano delante del pecho.', 'Desde ahí realiza la subida frontal, con el brazo completamente estirado hacia arriba.', 'Luego desciende de forma controlada.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Aislado en Punta')
);

-- Press Aislado en Supinación con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Aislado en Supinación con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/03431301-Dumbbell-Lying-One-Arm-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado sobre un banco, el brazo estirado verticalmente, coge una mancuerna en supinación (palma de la mano hacia la cabeza).', 'El movimiento consiste en bajar el brazo hasta la altura del torso y luego subir hasta estirar por completo .', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.', 'La otra mano la podemos colocar bajo el banco o agarrando un lateral del mismo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Aislado en Supinación con Mancuerna')
);

-- Press Arnold Abierto con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Arnold Abierto con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02871301-Dumbbell-Arnold-Press-II_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentado con la espalda recta, coge una mancuerna con cada mano y ponlas a los lados de los hombros con los codos flexionados hacia arriba y con agarre neutro (palmas enfrentadas).', 'Levanta las mancuernas hacia arriba estirando bien los brazos y abriendo a los lados, girando las muñecas para que queden las palmas hacia delante.', 'Vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Arnold Abierto con Mancuernas')
);

-- Press Arnold con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Arnold con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/21371301-Dumbbell-Arnold-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Sentado con la espalda recta apoyada en el respaldo del banco, lleva las mancuernas a la altura de los hombros, al lado del mentón, con las palmas de las manos mirando hacia el cuerpo (supinación) moviendo un poco los codos hacia delante.', 'Esta será nuestra posición inicial.', 'Inspira y eleva las mancuernas de forma vertical hasta estirar los brazos mientras haces un giro de muñeca de 90 grados dejando el agarre en pronación (las palmas de la mano mirando hacia al frente).', 'Una vez estirados los brazos con una pequeña flexión volvemos a bajar hasta la posición inicial.', 'El ejercicio tiene que ser continuo, realizando un solo movimiento tanto para la subida como para la bajada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Arnold con Mancuernas')
);

-- Press Banca Abierto con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Banca Abierto con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/01221301-Barbell-Wide-Bench-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Tumbado sobre un banco horizontal, los brazos estirados verticalmente, agarramos la barra con las manos en pronación (palmas hacia los pies) y lo más abiertas posible dentro de una posición cómoda para las muñecas.', 'El movimiento consiste en bajar la barra hasta el pecho, sin descansar abajo, y luego subir hasta la posición inicial​.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Banca Abierto con Barra')
);

-- Press Banca Abierto Inverso con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Banca Abierto Inverso con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12581301-Barbell-Wide-Reverse-Grip-Bench-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Tumbado sobre un banco horizontal, los brazos estirados verticalmente, agarramos la barra con las manos en supinación (palmas hacia la cabeza) y lo más abiertas posible dentro de una posición cómoda para las muñecas.', 'El movimiento consiste en bajar la barra hasta el pecho, sin descansar abajo, y luego subir hasta la posición inicial​.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Banca Abierto Inverso con Barra')
);

-- Press Banca Aislado con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Banca Aislado con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12601301-Cable-Decline-One-Arm-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Tumbado sobre un banco horizontal cercano a una polea baja, el brazo estirado verticalmente, con la empuñadura de la polea en pronación (palma de la mano hacia los pies).', 'El movimiento consiste en bajar el brazo hasta la altura del torso y luego subir hasta estirar por completo .', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.', 'La otra mano la podemos colocar bajo el banco o agarrando un lateral del mismo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Banca Aislado con Polea')
);

-- Press Banca Alterno con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Banca Alterno con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36951301-Dumbbell-Alternate-Bench-Press-high-start_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Túmbate de espaldas en el banco plano y coge las mancuernas con agarre en pronación (palmas hacia los pies) directamente sobre los hombros con los brazos totalmente extendidos.', 'Las mancuernas no deben estar en contacto, si no una sobre cada pectoral.', 'Junta los omóplatos y saca pecho ligeramente.', 'Baja una mancuerna a un lado del pecho mientras mantienes la otra en alto.', 'Haz una pausa sin relajar y luego súbela de nuevo.', 'Ahora haz lo mismo pero con el otro brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Banca Alterno con Mancuernas')
);

-- Press Banca Cerrado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Banca Cerrado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/24321301-EZ-bar-Close-Grip-Bench-Press_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Barra Z'::text as equipment,
  ARRAY['Tumbado sobre un banco horizontal, los brazos estirados verticalmente, agarramos la barra con las manos en pronación por la parte más interna de la barra z (recomendable está barra para no dañar las muñecas).', 'El movimiento consiste en bajar la barra hasta el pecho, sin descansar abajo, y luego subir hasta la posición inicial​.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Banca Cerrado con Barra')
);

-- Press Banca con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Banca con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12541301-Band-Bench-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Bandas'::text as equipment,
  ARRAY['Recostado sobre un banco horizontal, los brazos estirados verticalmente, con los extremos de las bandas agarrados, el movimiento consiste en bajar los brazos hasta la altura del torso y luego subir hasta la posición inicial​.', 'Las manos están en pronación, es decir, las palmas hacia los pies (la amplitud del movimiento debe adaptarse según la morfología).', 'La distancia entre las manos es generalmente un poco más ancha que el ancho de los hombros, lo que permite obtener el máximo beneficio de la fuerza combinada de los tríceps y los músculos pectorales.', 'La inspiración se hace durante el descenso de las bandas, la expiración durante el ascenso.', 'Se puede pasar la banda por debajo del banco o enganchar a algún soporte.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Banca con Bandas')
);

-- Press Banca con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Banca con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Tríceps, Pectoral. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/00251301-Barbell-Bench-Press_Chest-FIX_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Pectoral']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Tumbado sobre un banco horizontal, los brazos estirados verticalmente, agarramos la barra con las manos en pronación un poco más abiertas de la anchura de los hombros.', 'El movimiento consiste en bajar la barra hasta el pecho, sin descansar abajo, y luego subir hasta la posición inicial.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Banca con Barra')
);

-- Press Banca con giro con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Banca con giro con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17431301-Dumbbell-Twisting-Bench-Press_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado de espaldas en un banco, sujeta un par de mancuernas justo por encima del esternón con los brazos totalmente estirados.', 'Junta los omóplatos, saca un poco el pecho y pon las palmas de las manos hacia delante.', 'Baja despacio las mancuernas a los costados del pecho mientras giras las muñecas de forma que las palmas queden hacia el interior del cuerpo al llegar a abajo.', 'Haz una pausa y levanta las mancuernas hasta la posición inicial, girando de nuevo las manos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Banca con giro con Mancuernas')
);

-- Press Banca con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Banca con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/02891301-Dumbbell-Bench-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Túmbate de espaldas en el banco plano y coge las mancuernas con agarre en pronación (palmas hacia los pies), directamente sobre los hombros con los brazos totalmente extendidos.', 'Las mancuernas no deben estar en contacto, si no una sobre cada pectoral.', 'Junta los omóplatos y saca pecho ligeramente.', 'Baja las mancuernas a ambos lados del pecho.', 'Haz una pausa sin relajar y luego lleva las mancuernas a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Banca con Mancuernas')
);

-- Press Banca en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Banca en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/10411301-Lever-Lying-Chest-Press-plate-loaded_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Tumbado hacia arriba sobre un banco horizontal, agarramos con las manos en pronación un poco más abiertas de la anchura de los hombros.', 'Estiramos los brazos para empezar desde arriba.', 'Bajamos hasta la altura del pecho sin llegar a apoyar el peso, para volver a subir estirando los brazos​.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Banca en Máquina')
);

-- Press Banca en Supinación Aislado con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Banca en Supinación Aislado con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16221301-Dumbbell-One-Arm-Reverse-Grip-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado de espaldas en un banco, sujeta una mancuerna justo por encima del esternón con el brazo totalmente estirado.', 'Junta los omóplatos, saca un poco el pecho y pon la palma que tiene la mancuerna hacia la cabeza (supinación).', 'Baja despacio la mancuerna al lado del pecho.', 'Haz una pausa y levanta la mancuerna hasta la posición inicial.', 'La otra mano puedes ponerla bajo el banco para tener más estabilidad.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Banca en Supinación Aislado con Mancuerna')
);

-- Press Banca Neutro con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Banca Neutro con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03381301-Dumbbell-Lying-Elbow-Press_Triceps_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado de espaldas en un banco, sujeta un par de mancuernas justo por encima del esternón con los brazos totalmente estirados.', 'Junta los omóplatos, saca un poco el pecho y pon las palmas de las manos hacia el interior (agarre neutro).', 'Baja despacio las mancuernas a los costados del pecho .', 'Haz una pausa y levanta las mancuernas hasta la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Banca Neutro con Mancuernas')
);

-- Press Cerrado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Cerrado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/00301301-Barbell-Close-Grip-Bench-Press_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco, coge la barra con las manos en pronación (palmas hacia los pies) a la altura del pecho y a una anchura inferior a la de los hombros (una mano delante de cada pectoral).', 'Estira los brazos tensando bien los tríceps, sin abrir los codos.', 'Desciende nuevamente y mantén los brazos bien pegados al cuerpo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Cerrado con Barra')
);

-- Press Cerrado en Máquina Smith
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Cerrado en Máquina Smith'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/29191301-Smith-Hex-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Máquina'::text as equipment,
  ARRAY['Tumbado sobre un banco horizontal, agarramos la barra con ambas manos (entrelazando los dedos o poniendo un soporte en v) a la altura inferior del pecho.', 'El movimiento consiste en bajar la barra hasta el pecho, sin descansar abajo, y luego subir estirando los brazos completamente.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Cerrado en Máquina Smith')
);

-- Press Cerrado en Supinación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Cerrado en Supinación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/21871301-Barbell-Reverse-Close-grip-Bench-Press_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco, coge la barra con las manos en supinación (palmas hacia la cabeza) a la altura del pecho y a una anchura inferior a la de los hombros (una mano delante de cada pectoral).', 'Estira los brazos tensando bien los tríceps, sin abrir los codos.', 'Desciende nuevamente y mantén los brazos bien pegados al cuerpo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Cerrado en Supinación con Barra')
);

-- Press Cerrado Neutro con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Cerrado Neutro con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36811301-Dumbbell-Squeeze-Bench-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Túmbate de espaldas en el banco plano y coge las mancuernas con agarre neutro (martillo) directamente sobre los hombros con los brazos totalmente extendidos.', 'Las mancuernas deben estar en contacto.', 'Junta los omóplatos y saca pecho ligeramente.', 'Baja las mancuernas al centro del pecho.', 'Haz una pausa sin relajar y luego lleva las mancuernas a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Cerrado Neutro con Mancuernas')
);

-- Press Cubano Circular con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Cubano Circular con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02991301-Dumbbell-Cuban-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta, coge una mancuerna en cada mano con las palmas hacia el cuerpo y realiza una elevación lateral con los brazos estirados dejándolos paralelos al suelo.', 'Luego flexiona los codos bajando las manos hasta la cadera.', 'Una vez ahí realiza una rotación de los hombros de manera que las manos pasen de estar en dirección al suelo para estar hacia arriba de la cabeza y estira bien los brazos.', 'Desciende de forma controlada haciendo los movimientos a la inversa.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Cubano Circular con Mancuernas')
);

-- Press Cubano con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Cubano con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/41831301-Dumbbell-Seated-Cuban-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentado con la espalda recta, coge una mancuerna en cada mano en pronación (palmas hacia atrás) y flexiona los codos elevando las manos a la altura de los hombros.', 'Una vez ahí realiza una rotación de los hombros de manera que las manos pasen de estar en dirección al suelo para estar hacia arriba de la cabeza.', 'Ahora haz un press militar estirando bien los brazos.', 'Desciende de forma controlada haciendo los movimientos a la inversa.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Cubano con Mancuernas')
);

-- Press Declinado Aislado con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Declinado Aislado con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16171301-Dumbbell-Decline-One-Arm-Hammer-Press_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate de espaldas en el banco declinado y coge una mancuerna con agarre neutro (palma hacia el interior), con el brazo totalmente extendido.', 'Junta los omóplatos y saca pecho ligeramente.', 'Baja la mancuerna al lado del cuerpo, sin despegar el brazo del mismo.', 'Haz una pausa sin relajar y luego lleva la mancuerna a la posición inicial.', 'La otra mano puedes ponerla bajo el banco para tener estabilidad.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Declinado Aislado con Mancuerna')
);

-- Press Declinado Aislado con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Declinado Aislado con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12601301-Cable-Decline-One-Arm-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Polea'::text as equipment,
  ARRAY['Tumbado sobre un banco declinado cercano a una polea baja, el brazo estirado verticalmente, con la empuñadura de la polea en pronación (palma de la mano hacia los pies).', 'El movimiento consiste en bajar el brazo hasta la altura del torso y luego subir hasta estirar por completo .', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.', 'La otra mano la podemos colocar bajo el banco o agarrando un lateral del mismo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Declinado Aislado con Polea')
);

-- Press Declinado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Declinado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/00361301-Barbell-Decline-Wide-grip-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Tumbado sobre un banco inclinado, los brazos estirados verticalmente, agarramos la barra con las manos en pronación y un poco más abiertas de la anchura de los hombros.', 'El movimiento consiste en bajar la barra hasta el pecho, sin descansar abajo, y luego subir hasta la posición inicial​.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Declinado con Barra')
);

-- Press Declinado con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Declinado con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/03011301-Dumbbell-Decline-Bench-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate de espaldas en el banco declinado y coge las mancuernas con agarre en pronación (palmas hacia los pies), directamente sobre los hombros con los brazos totalmente extendidos.', 'Las mancuernas no deben estar en contacto, si no una sobre cada pectoral.', 'Junta los omóplatos y saca pecho ligeramente.', 'Baja las mancuernas a ambos lados del pecho.', 'Haz una pausa sin relajar y luego lleva las mancuernas a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Declinado con Mancuernas')
);

-- Press Declinado Inverso con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Declinado Inverso con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12561301-Barbell-Reverse-Grip-Decline-Bench-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Tumbado sobre un banco declinado, los brazos estirados verticalmente, agarramos la barra con las manos en supinación (palmas hacia la cabeza) y un poco más abiertas de la anchura de los hombros.', 'El movimiento consiste en bajar la barra hasta el pecho, sin descansar abajo, y luego subir hasta la posición inicial​.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Declinado Inverso con Barra')
);

-- Press Declinado Neutro con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Declinado Neutro con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/03031301-Dumbbell-Decline-Hammer-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate de espaldas en el banco declinado y coge las mancuernas con agarre neutro (palmas mirándose entre sí), directamente sobre los hombros con los brazos totalmente extendidos.', 'Las mancuernas no deben estar en contacto, si no una sobre cada pectoral.', 'Junta los omóplatos y saca pecho ligeramente.', 'Baja las mancuernas a ambos lados del pecho.', 'Haz una pausa sin relajar y luego lleva las mancuernas a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Declinado Neutro con Mancuernas')
);

-- Press Francés con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Francés con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15041301-Band-Skull-Crusher_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Bandas'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco plano, ancla las bandas a las patas del banco y coge un extremo con cada mano, con las palmas hacia arriba (agarre en pronación) a la altura del pecho y a la anchura de los hombros (una mano delante de cada pectoral).', 'Estira los brazos tensando bien los tríceps, sin abrir los codos.', 'Desciende las manos flexionando los codos a 90º.', 'Asciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Francés con Bandas')
);

-- Press Francés con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Francés con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/00601301-Barbell-Lying-Triceps-Extension-Skull-Crusher_Triceps-SFIX_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Tumbado en el banco plano, sujeta la barra con los brazos extendidos por encima del pecho.', 'Con las palmas hacia arriba, a una anchura inferior a la de los hombros.', 'Flexiona los codos y baja la barra hasta ponerla delante de la cara.', 'Empuja la barra hacia arriba, hasta que los codos queden bloqueados.', 'Vuelve a bajar lentamente hasta tener la barra en la cara.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Francés con Barra')
);

-- Press Francés con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Francés con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/04501301-EZ-Barbell-JM-Bench-Press_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Barra Z'::text as equipment,
  ARRAY['Tumbado en el banco plano, sujeta la barra con los brazos extendidos por encima del pecho.', 'Con las palmas hacia arriba, por los agarres más estrechos de la barra.', 'Flexiona los codos y baja la barra hasta ponerla delante de la cara.', 'Empuja la barra hacia arriba, hasta que los codos queden bloqueados.', 'Vuelve a bajar lentamente hasta tener la barra en la cara.', 'Puedes poner los pies sobre el suelo o sobre el banco para incrementar la dificultad.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Francés con Barra Z')
);

-- Press Francés con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Francés con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03521301-Dumbbell-Neutral-Grip-Bench-Press_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco plano, coge una mancuerna con cada mano, con las palmas hacia el interior (agarre neutro) a la altura del pecho y a la anchura de los hombros (una mano delante de cada pectoral).', 'Estira los brazos tensando bien los tríceps, sin abrir los codos.', 'Desciende las mancuernas flexionando los codos a 90º.', 'Asciende de nuevo de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Francés con Mancuernas')
);

-- Press Francés con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Francés con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01861301-Cable-Lying-Triceps-Extension-II_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Tumbado con la cabeza hacia la polea baja, coge la barra con ambas manos en pronación (palmas hacia arriba) a la anchura de los hombros y estira los brazos frente al pecho.', 'Flexiona los codos 90º sobre la cabeza de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Francés con Polea')
);

-- Press Francés Declinado Abierto con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Francés Declinado Abierto con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/21861301-EZ-Barbell-Decline-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Z'::text as equipment,
  ARRAY['Tumbado en el banco declinado, sujeta la barra con los brazos extendidos por encima del pecho.', 'Con las palmas hacia arriba, a la anchura aproximada de los hombros.', 'Flexiona los codos y baja la barra hasta llegar a la frente.', 'Empuja la barra hacia arriba, hasta que los codos queden bloqueados.', 'Vuelve a bajar lentamente hasta tener la barra en la frente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Francés Declinado Abierto con Barra Z')
);

-- Press Francés Declinado Cerrado con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Francés Declinado Cerrado con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/04481301-EZ-Barbell-Decline-Close-grip-Face-Press_Triceps_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Z'::text as equipment,
  ARRAY['Tumbado en el banco declinado, sujeta la barra con los brazos extendidos por encima del pecho.', 'Con las palmas hacia arriba, por el agarre más estrecho de la barra (manos casi juntas).', 'Flexiona los codos y baja la barra hasta llegar a la frente.', 'Empuja la barra hacia arriba, hasta que los codos queden bloqueados.', 'Vuelve a bajar lentamente hasta tener la barra en la frente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Francés Declinado Cerrado con Barra Z')
);

-- Press Francés Declinado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Francés Declinado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Antebrazo, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/00351301-Barbell-Decline-Close-Grip-To-Skull-Press_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Antebrazo', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Tumbado en el banco declinado, sujeta la barra con los brazos extendidos por encima del pecho.', 'Con las palmas hacia arriba, a una anchura inferior a la de los hombros.', 'Flexiona los codos y baja la barra hasta ponerla delante de la cara.', 'Empuja la barra hacia arriba, hasta que los codos queden bloqueados.', 'Vuelve a bajar lentamente hasta tener la barra en la cara.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Francés Declinado con Barra')
);

-- Press Francés Inclinado Alterno con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Francés Inclinado Alterno con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17291301-Dumbbell-Lying-Alternate-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco inclinado, coge una mancuerna con cada mano, con las palmas hacia el interior (agarre neutro) a la altura del pecho y a la anchura de los hombros (una mano delante de cada pectoral).', 'Estira los brazos tensando bien los tríceps, sin abrir los codos.', 'Desciende una mancuerna flexionando el codo a 90º.', 'Asciende de nuevo mientras bajas el otro brazo.', 'Así hasta terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Francés Inclinado Alterno con Mancuernas')
);

-- Press Francés Inclinado con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Francés Inclinado con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01731301-Cable-Incline-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Inclinable, Polea'::text as equipment,
  ARRAY['Tumbado en un banco inclinado con la cabeza hacia la polea baja, coge la barra con ambas manos en pronación (palmas hacia arriba) a la anchura de los hombros y estira los brazos sobre la cabeza.', 'Flexiona los codos 90º tras la cabeza de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Francés Inclinado con Polea')
);

-- Press Francés Inverso con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Francés Inverso con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/17211301-Barbell-Reverse-Grip-Skullcrusher_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Tumbado en el banco plano, sujeta la barra con los brazos extendidos por encima del pecho.', 'Estira los brazos con las palmas hacia la cabeza, a la anchura de los hombros.', 'Flexiona los codos y baja la barra hasta ponerla delante de la cara.', 'Empuja la barra hacia arriba, hasta que los codos queden bloqueados.', 'Vuelve a bajar lentamente hasta tener la barra en la cara.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Francés Inverso con Barra')
);

-- Press Francés Neutro con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Francés Neutro con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17261301-Cable-Rope-Lying-on-Floor-Tricep-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Tumbado con la cabeza hacia la polea baja, coge la cuerda con ambas manos y estira los brazos frente al pecho.', 'Flexiona los codos 90º sobre la cabeza de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Francés Neutro con Polea')
);

-- Press Francés tras nuca con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Francés tras nuca con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/00561301-Barbell-Lying-Close-grip-Triceps-Extension_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco, coge la barra a la anchura de los hombros con las palmas hacia arriba, frente al pecho y estira los brazos.', 'Deja caer los brazos extendidos hacia atrás, formando una línea recta con el cuerpo.', 'A continuación comienza el ejercicio, flexiona los codos 90 grados y desciende la barra sin mover la parte superior de los brazos.', 'Extiende de nuevo los codos con el movimiento controlado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Francés tras nuca con Barra')
);

-- Press Frontal a una mano en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Frontal a una mano en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12111301-Cable-twisting-standing-one-arm-chest-press_chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie, con una pierna adelantada y otra detrás, colocar la polea a la altura del pecho y agarrar la empuñadura en pronación (palma de la mano hacia abajo).', 'Extender el brazo al frente quedando bien estirado y acompañando el movimiento con el cuerpo, realizando una inclinación hacia delante con giro del torso.', 'Retroceder lentamente y proceder de nuevo.', 'Al terminar la serie, cambiar de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Frontal a una mano en Polea')
);

-- Press Frontal Cerrado con Poleas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Frontal Cerrado con Poleas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/33641301-Cable-Seating-Close-Press_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Polea'::text as equipment,
  ARRAY['Sentado sobre un banco con el respaldo a 90º y la espalda recta, colocar las poleas a la altura del pecho y agarrar ambas empuñaduras con posición neutra (en martillo), poniendo ambas manos delante del pecho, tocándose.', 'Extender los brazos al frente quedando bien estirados sin perder el contacto de las manos.', 'Retroceder lentamente y proceder de nuevo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Frontal Cerrado con Poleas')
);

-- Press Frontal Cerrado en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Frontal Cerrado en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/13011301-Machine-Inner-Chest-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina con el respaldo vertical, ponemos las manos en agarre neutro (palmas enfrentadas) a una anchura un poco superior a la de los hombros.', 'Estiramos los brazos y volvemos a la posición inicial con un movimiento controlado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Frontal Cerrado en Máquina')
);

-- Press Frontal con Poleas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Frontal con Poleas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/21441301-Cable-Seated-Chest-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Polea'::text as equipment,
  ARRAY['Sentado sobre un banco con el respaldo a 90º y la espalda recta, colocar las poleas a la altura del pecho y agarrar ambas empuñaduras en pronación (palmas hacia el suelo).', 'Extender los brazos al frente quedando bien estirados y con las manos delante del pecho (anchura de los hombros o algo menos).', 'Retroceder lentamente y proceder de nuevo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Frontal con Poleas')
);

-- Press Frontal en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Frontal en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/22771301-Lever-Chest-Press-VERSION-4_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina de press frontal, con el respaldo en vertical, ponemos las manos en pronación (palmas hacia el suelo) a una anchura un poco superior a la de los hombros.', 'Estiramos los brazos y volvemos a la posición inicial con un movimiento controlado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Frontal en Máquina')
);

-- Press Frontal en Pronación con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Frontal en Pronación con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/37801301-Band-Standing-Chest-Press-male_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie, con el cuerpo inclinado hacia delante y una pierna delante de la otra, enganchar las bandas a algún soporte por detrás de nuestro cuerpo a la altura del pecho y agarrarla en pronación (palma de las manos hacia abajo).', 'Extender los brazos al frente quedando bien estirados.', 'Retroceder lentamente y proceder de nuevo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Frontal en Pronación con Bandas')
);

-- Press Frontal Inclinado con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Frontal Inclinado con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/33241301-Band-Alternate-Incline-Chest-Press-with-Twist_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con las piernas estiradas y la espalda recta, enganchar la banda a algún soporte por detrás de nuestro cuerpo a la altura del pecho (o algo inferior) y agarrarla con posición en pronación (palmas hacia abajo).', 'Extender el brazo al frente quedando bien estirado y con un pequeño giro de torso.', 'Retroceder lentamente y proceder con el otro brazo, de forma alterna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Frontal Inclinado con Bandas')
);

-- Press Frontal Inferior en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Frontal Inferior en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/22781301-Lever-Decline-Chest-Press-VERSION-2_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina de press frontal, con el respaldo un poco inclinado hacia atrás, ponemos las manos en pronación (palmas hacia el suelo) a una anchura un poco superior a la de los hombros.', 'Estiramos los brazos y volvemos a la posición inicial con un movimiento controlado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Frontal Inferior en Máquina')
);

-- Press Frontal Neutral con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Frontal Neutral con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/09891301-Band-one-arm-twisting-chest-press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Sentado en el suelo o en un banco, con las piernas estiradas y la espalda recta, enganchar la banda a algún soporte por detrás de nuestro cuerpo a la altura del pecho y agarrarla con posición neutra (en martillo).', 'Extender el brazo al frente quedando bien estirado y con un pequeño giro de torso.', 'Retroceder lentamente y proceder de nuevo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Frontal Neutral con Banda')
);

-- Press Frontal Neutral con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Frontal Neutral con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/41931301-Cable-Half-Kneeling-Pallof-Press_Waist_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Apoyado sobre la rodilla izquierda, con la pierna derecha hacia delante a 90º y la espalda recta, colocar la polea a la altura del pecho dejándola a la derecha de nuestro cuerpo y agarrar con posición neutra (en martillo).', 'Extender el brazo al frente quedando bien estirado y hacia el centro del cuerpo, sujetando con la otra mano pero sin hacer fuerza..', 'Retroceder lentamente y proceder de nuevo.', 'Cambiar de brazo al terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Frontal Neutral con Polea')
);

-- Press Frontal Superior en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Frontal Superior en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12991301-Leverage-Incline-Chest-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina con el respaldo vertical, ponemos las manos en pronación (palmas hacia el suelo) a una anchura un poco superior a la de los hombros.', 'Estiramos los brazos y volvemos a la posición inicial con un movimiento controlado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Frontal Superior en Máquina')
);

-- Press Horizontal con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Horizontal con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/41251301-Dumbbell-Face-Down-Lying-Shoulder-Press-male_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado boca abajo en un banco plano, coge una mancuerna con cada mano con agarre prono (palmas hacia abajo) y pon los brazos perpendiculares al cuerpo, abiertos a los lados.', 'Flexiona los codos 90º y realiza el press hacia delante, manteniendo la altura de los codos y estirando bien los brazos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Horizontal con Mancuernas')
);

-- Press Inclinado Aislado con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Inclinado Aislado con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/16191301-Dumbbell-Incline-One-Arm-Hammer-Press_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate de espaldas en el banco inclinado y coge una mancuerna con agarre neutro (palma hacia el interior), con el brazo totalmente extendido.', 'Junta los omóplatos y saca pecho ligeramente.', 'Baja la mancuerna al lado del cuerpo, sin despegar el brazo del mismo.', 'Haz una pausa sin relajar y luego lleva la mancuerna a la posición inicial.', 'La otra mano puedes ponerla bajo el banco para tener estabilidad.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Inclinado Aislado con Mancuerna')
);

-- Press Inclinado Aislado con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Inclinado Aislado con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12811301-Dumbbell-Incline-One-Arm-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Tumbado sobre un banco inclinado, el brazo estirado verticalmente, coge una mancuerna en pronación (palma de la mano hacia los pies).', 'El movimiento consiste en bajar el brazo hasta la altura del torso y luego subir hasta estirar por completo .', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.', 'La otra mano la podemos colocar bajo el banco o agarrando un lateral del mismo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Inclinado Aislado con Mancuerna')
);

-- Press Inclinado Aislado con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Inclinado Aislado con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12651301-Cable-One-Arm-Incline-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Polea'::text as equipment,
  ARRAY['Tumbado sobre un banco inclinado cercano a una polea baja, el brazo estirado verticalmente, con la empuñadura de la polea en pronación (palma de la mano hacia los pies).', 'El movimiento consiste en bajar el brazo hasta la altura del torso y luego subir hasta estirar por completo .', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.', 'La otra mano la podemos colocar bajo el banco o agarrando un lateral del mismo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Inclinado Aislado con Polea')
);

-- Press Inclinado Cerrado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Inclinado Cerrado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/17191301-Barbell-Incline-Close-Grip-Bench-Press_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco inclinado, coge la barra con las manos en pronación (palmas hacia los pies) a la altura del pecho y a una anchura inferior a la de los hombros (una mano delante de cada pectoral).', 'Estira los brazos tensando bien los tríceps, sin abrir los codos.', 'Desciende nuevamente y mantén los brazos bien pegados al cuerpo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Inclinado Cerrado con Barra')
);

-- Press Inclinado Cerrado Neutro con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Inclinado Cerrado Neutro con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/40151301-Dumbbell-Incline-Close-grip-Press-Variation_Upper-Arms_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate de espaldas en el banco inclinado y coge una mancuerna directamente sobre los hombros con los brazos totalmente extendidos y las palmas enfrentadas.', 'Junta los omóplatos y saca pecho ligeramente.', 'Baja la mancuerna al centro del pecho.', 'Haz una pausa sin relajar y luego lleva la mancuerna a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Inclinado Cerrado Neutro con Mancuerna')
);

-- Press Inclinado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Inclinado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/00471301-Barbell-Incline-Bench-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Tumbado sobre un banco inclinado, los brazos estirados verticalmente, agarramos la barra con las manos en pronación y un poco más abiertas de la anchura de los hombros.', 'El movimiento consiste en bajar la barra hasta el pecho, sin descansar abajo, y luego subir hasta la posición inicial​.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Inclinado con Barra')
);

-- Press Inclinado en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Inclinado en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/14791301-Lever-Incline-Chest-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado en la máquina de press militar, con el respaldo un poco inclinado hacia atrás, ponemos las manos en pronación (palmas hacia el suelo) a una anchura un poco superior a la de los hombros.', 'Estiramos los brazos y volvemos a la posición inicial con un movimiento controlado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Inclinado en Máquina')
);

-- Press Inclinado en Supinación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Inclinado en Supinación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Tríceps. Músculos: Tríceps, Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Tríceps'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/00481301-Barbell-Incline-Reverse-grip-Press_Triceps_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Antebrazo']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco inclinado, coge la barra con las manos en supinación (palmas hacia la cabeza) a la altura del pecho y a la anchura de los hombros (una mano delante de cada pectoral).', 'Estira los brazos tensando bien los tríceps, sin abrir los codos.', 'Desciende nuevamente y mantén los brazos bien pegados al cuerpo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Inclinado en Supinación con Barra')
);

-- Press Inclinado en Supinación con giro con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Inclinado en Supinación con giro con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12141301-Dumbbell-Incline-reverse-grip-30-degrees-bench-press_chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate de espaldas en el banco inclinado y coge las mancuernas con agarre supino, directamente sobre los hombros con los brazos totalmente extendidos.', 'Las mancuernas no deben estar en contacto, si no una sobre cada pectoral.', 'Junta los omóplatos y saca pecho ligeramente.', 'Baja las mancuernas a ambos lados del pecho, girando las muñecas 45° hacia fuera.', 'Haz una pausa sin relajar y luego lleva las mancuernas a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Inclinado en Supinación con giro con Mancuernas')
);

-- Press Inclinado en Supinación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Inclinado en Supinación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/03241301-Dumbbell-Incline-Palm-in-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Túmbate de espaldas en el banco inclinado y coge las mancuernas con agarre supino (palmas hacia la cabeza), directamente sobre los hombros con los brazos totalmente extendidos.', 'Las mancuernas no deben estar en contacto, si no una sobre cada pectoral.', 'Junta los omóplatos y saca pecho ligeramente.', 'Baja las mancuernas a ambos lados del pecho.', 'Haz una pausa sin relajar y luego lleva las mancuernas a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Inclinado en Supinación con Mancuernas')
);

-- Press Inclinado Inverso con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Inclinado Inverso con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/12571301-Barbell-Reverse-Grip-Incline-Bench-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Tumbado sobre un banco inclinado, los brazos estirados verticalmente, agarramos la barra con las manos en supinación (palmas hacia la cabeza) y un poco más abiertas de la anchura de los hombros.', 'El movimiento consiste en bajar la barra hasta el pecho, sin descansar abajo, y luego subir hasta la posición inicial​.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Inclinado Inverso con Barra')
);

-- Press Militar Abierto con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Abierto con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14571301-Barbell-Standing-Wide-Military-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas separadas y la espalda recta, coge una barra por delante del cuerpo con las manos en pronación (palmas hacia atrás) a una anchura muy superior a la de los hombros.', 'Levanta la barra hasta arriba del pecho volteando los brazos (las palmas que queden hacia delante).', 'Sube la barra estirando bien los brazos y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Abierto con Barra')
);

-- Press Militar Aislado con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Aislado con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/29961301-Band-Single-Arm-Shoulder-Press_Shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas a la anchura de los hombros, pisa una banda y coge un extremo con una mano, poniéndola al lado de la cabeza con el brazo flexionado y con agarre en pronación (palma hacia delante).', 'Estira bien el brazo y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Aislado con Banda')
);

-- Press Militar Cerrado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Cerrado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14561301-Barbell-Standing-Close-Grip-Military-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas separadas y la espalda recta, coge una barra por delante del cuerpo con las manos en pronación (palmas hacia atrás) a una anchura inferior a la de los hombros.', 'Levanta la barra hasta arriba del pecho volteando los brazos (las palmas que queden hacia delante) y con los codos al frente.', 'Sube la barra estirando bien los brazos y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Cerrado con Barra')
);

-- Press Militar Cerrado en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Cerrado en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/40101301-Cable-Kneeling-Shoulder-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De rodillas delante de la polea, coge el agarre en martillo con las dos manos frente al pecho.', 'Estira los brazos hacia arriba, aguantando dos segundos y desciende de nuevo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Cerrado en Polea')
);

-- Press Militar con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09971301-Band-shoulder-press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas a la anchura de los hombros, coge un extremo de la banda con cada mano, poniéndolas a los lados de la cabeza con los brazos flexionados y con agarre en pronación (palmas hacia delante).', 'Estira bien los brazos sobre la cabeza y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar con Bandas')
);

-- Press Militar con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/11651301-Barbell-Standing-Military-Press-without-rack_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas separadas y la espalda recta, coge una barra por delante del cuerpo con las manos en pronación (palmas hacia atrás) a la anchura aproximada de los hombros.', 'Levanta la barra hasta arriba del pecho volteando los brazos (las palmas que queden hacia delante).', 'Sube la barra estirando bien los brazos y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar con Barra')
);

-- Press Militar con giro con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar con giro con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04381301-Dumbbell-W-press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas a la anchura de los hombros, coge una mancuerna con cada mano y ponlas frente a los hombros con los codos flexionados y con agarre neutro (palmas enfrentadas).', 'Levanta las mancuernas hacia arriba estirando bien los brazos y abriendo a los lados, girando las muñecas para que queden las palmas hacia delante.', 'Vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar con giro con Mancuernas')
);

-- Press Militar Declinado en Pronación en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Declinado en Pronación en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/41741301-Lever-Reverse-Shoulder-Press-plate-loaded_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado con el pecho apoyado en el respaldo inclinado, coge los agarres con las manos en pronación (palmas hacia delante).', 'Levanta los soportes hacia arriba estirando bien los brazos y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Declinado en Pronación en Máquina')
);

-- Press Militar en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02191301-Cable-Shoulder-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie entre dos poleas con la espalda recta y las piernas a la anchura de los hombros, coge una polea baja con cada mano y ponlas a los lados de la cabeza con los brazos flexionados y con agarre en pronación (palmas hacia delante).', 'Levanta las manos hacia arriba estirando bien los brazos y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar en Polea')
);

-- Press Militar en Pronación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar en Pronación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04261301-Dumbbell-Standing-Overhead-Press_shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas a la anchura de los hombros, coge una mancuerna con cada mano y ponlas a los lados de la cabeza con los brazos flexionados y con agarre en pronación (palmas hacia abajo).', 'Levanta las mancuernas hacia arriba estirando bien los brazos y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar en Pronación con Mancuernas')
);

-- Press Militar en Pronación en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar en Pronación en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14541103-Lever-Seated-Shoulder-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado con la espalda apoyada, coge los agarres con las manos en pronación (palmas hacia delante).', 'Levanta los soportes hacia arriba estirando bien los brazos y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar en Pronación en Máquina')
);

-- Press Militar en Supinación con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar en Supinación con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/12261301-EZ-Bar-Standing-Overhead-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Z'::text as equipment,
  ARRAY['De pie con las piernas separadas y la espalda recta, coge una barra z por delante del cuerpo con las manos en supinación (palmas hacia delante) a la anchura de los hombros.', 'Levanta la barra hasta arriba del pecho volteando los brazos (las palmas que queden hacia el cuerpo).', 'Sube la barra estirando bien los brazos y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar en Supinación con Barra Z')
);

-- Press Militar en Supinación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar en Supinación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/42371301-Dumbbell-Seated-Close-Grip-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Sentado en un banco con el respaldo recto, coge una mancuerna con cada mano y ponlas frente al pecho con los codos flexionados y con agarre en supinación (palmas hacia el cuerpo).', 'Levanta las mancuernas hacia arriba estirando bien los brazos y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar en Supinación con Mancuernas')
);

-- Press Militar Inclinado en Pronación en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Inclinado en Pronación en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/08691301-Lever-Shoulder-Press-plate-loaded-II_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado con la espalda apoyada y el respaldo inclinado, coge los agarres con las manos en pronación (palmas hacia delante).', 'Levanta los soportes hacia arriba estirando bien los brazos y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Inclinado en Pronación en Máquina')
);

-- Press Militar Inclinado Neutro en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Inclinado Neutro en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/11951301-Lever-Incline-Hammer-Chest-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado con la espalda apoyada y el respaldo inclinado, coge los agarres con las manos neutras (palmas hacia el interior).', 'Levanta los soportes hacia arriba estirando bien los brazos y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Inclinado Neutro en Máquina')
);

-- Press Militar Libre
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Libre'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04711301-Handstand-Push-Up_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Apoya las manos en el suelo cerca de la pared a la anchura de los hombros, y como si fuese a hacer el pino, de un impulso ponte totalmente cabeza abajo, con los pies apoyados arriba de la pared.', 'Flexiona los brazos y estira de nuevo totalmente levantando tu peso corporal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Libre')
);

-- Press Militar Libre entre Bancos
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Libre entre Bancos'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/39161301-Handstand-Shoulder-Press-with-Wall-between-benches_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Pon dos bancos perpendiculares a una pared, paralelos entre ellos y separados a una anchura algo mayor a la de tus hombros.', 'Apoya una mano en el extremo de cada banco y de un impulso ponte totalmente cabeza abajo, con los pies apoyados arriba de la pared.', 'Flexiona los brazos y estira de nuevo totalmente levantando tu peso corporal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Libre entre Bancos')
);

-- Press Militar Mixto con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Mixto con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01051301-Barbell-Standing-Bradford-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas separadas y la espalda recta, coge una barra por delante del cuerpo con las manos en pronación (palmas hacia atrás) a Una anchura algo mayor a la de los hombros.', 'Levanta la barra hasta arriba del pecho volteando los brazos (las palmas que queden hacia delante).', 'Sube la barra estirando bien los brazos y baja por detrás de la cabeza (no demasiado para evitar lesiones).', 'Vuelve a subir la barra y baja por delante de la cabeza.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Mixto con Barra')
);

-- Press Militar Neutro Alterno en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Neutro Alterno en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01481301-Cable-Alternate-Shoulder-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie entre dos poleas con la espalda recta y las piernas a la anchura de los hombros, coge una polea baja con cada mano y ponlas a los lados de la cabeza con los brazos flexionados y con agarre neutro (palmas hacia dentro).', 'Levanta una mano hacia arriba estirando bien el brazo y vuelve a bajar de forma controlada mientras subes el otro.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Neutro Alterno en Polea')
);

-- Press Militar Neutro con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Neutro con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04271301-Dumbbell-Standing-Palms-In-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge una mancuerna con cada mano y ponlas frente a los hombros con los codos flexionados y con agarre neutro (palmas hacia dentro).', 'Levanta las mancuernas hacia arriba estirando bien los brazos y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Neutro con Mancuernas')
);

-- Press Militar Neutro en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Neutro en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/29621301-Lever-Seated-Hammer-Grip-Shoulder-Press_Shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado con la espalda apoyada, coge los agarres con las manos neutras (palmas hacia el interior).', 'Levanta los soportes hacia arriba estirando bien los brazos y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Neutro en Máquina')
);

-- Press Militar Trasero con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Trasero con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14991301-Band-Behind-Neck-Shoulder-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas a la anchura de los hombros, coge un extremo de la banda con cada mano, poniéndolas a los lados de la cabeza con los brazos flexionados y con agarre en pronación (palmas hacia delante).', 'Estira bien los brazos por detrás de la cabeza y vuelve a bajar de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Trasero con Bandas')
);

-- Press Militar Trasero con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Militar Trasero con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/07881301-Standing-Behind-Neck-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas separadas y la espalda recta, coge una barra por delante del cuerpo con las manos en pronación (palmas hacia atrás) a una anchura superior a la de los hombros.', 'Levanta la barra volteando los brazos (las palmas que queden hacia delante).', 'Sube la barra estirando bien los brazos y desciende de forma controlada tras la cabeza.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Militar Trasero con Barra')
);

-- Press Scott con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Scott con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/23971301-Dumbbell-Scott-Press_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Coge un par de mancuernas y coloca tus brazos como si fueses a hacer un Press Arnold.', 'Es decir, los codos delante de tu pecho flexionados un poco menos de 90 grados con las palmas de las manos enfrentadas.', 'Eleva las mancuernas haciendo un arco y llevándolas hacia atrás hasta una altura que no supere las 3/4 partes de un press normal.', 'El la parte mas alta del movimiento tienes que mantener tu dedo meñique a una altura mayor que el pulgar, con eso conseguiremos mas tensión en los deltoides y menos en los tríceps que ahora no nos interesa trabajar.', 'Vuelve al punto de inicio y repite.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Scott con Mancuernas')
);

-- Press Svend
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Press Svend'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/08561301-Weighted-Svend-Press_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Nos colocaremos rectos, con los pies a la anchura de los hombros y el torso recto.', 'Con el disco apretado con fuerza, lanzaremos nuestros brazos al frente, sin permitir que éste se mueva en ningún momento.', 'Es la presión ejercida en el mismo y el peso del objeto hará que nuestros músculos trabajen.', 'Una vez que lleguemos a casi extender los brazos, volveremos a la posición inicial.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Press Svend')
);

-- Puente Lateral
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Puente Lateral'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/07051301-Side-Bridge-II_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Desde una posición de lado, apóyate en el antebrazo y el lateral del pie, manteniendo el cuerpo en línea recta desde la cabeza hasta los pies.', 'Mantén el abdomen contraído y el cuerpo en posición recta, evitando que las caderas se hundan o se eleven hacia arriba.', 'Desciende lentamente la cadera flexionando los oblicuos y vuelve a la posición inicial, manteniendo esta posición durante el tiempo deseado.', 'Tras varias repeticiones, cambia de lado.', 'Este ejercicio fortalece los músculos laterales del core y mejora la estabilidad de la parte media del cuerpo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Puente Lateral')
);

-- Puente Lateral con Abducción de Cadera
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Puente Lateral con Abducción de Cadera'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Glúteo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/17741301-Side-Bridge-Hip-Abduction_Hips_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Glúteo']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Desde una posición de lado, apóyate en el antebrazo y el lateral del pie, manteniendo el cuerpo en línea recta desde la cabeza hasta los pies.', 'Levanta la cadera hacia arriba formando una línea recta con el cuerpo.', 'Mantén esta posición y luego eleva la pierna superior hacia arriba, separándola del cuerpo.', 'Mantén la posición superior durante un momento y luego baja la pierna de forma controlada.', 'Completa el número deseado de repeticiones en un lado y luego cambia de lado para trabajar el otro lado de las caderas.', 'Este ejercicio fortalece los músculos de la cadera y el core, ayudando a mejorar la estabilidad y el equilibrio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Puente Lateral con Abducción de Cadera')
);

-- Puente Lateral con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Puente Lateral con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33371301-Dumbbell-Side-Bridge_Hips_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Tumbado de lado, apóyate en el suelo sobre el codo inferior y el lateral del pie.', 'Levanta la cadera creando una línea recta entre los tobillos, las caderas y los hombros.', 'Contrae los abdominales y los glúteos.', 'Sostén una mancuerna con el brazo superior sobre la cadera para mayor dificultad.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Puente Lateral con Mancuerna')
);

-- Puente Lateral Declinado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Puente Lateral Declinado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/43341301-Side-Plank-Oblique-Crunch_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Túmbate de lado en el suelo.', 'Apoya un antebrazo con el codo bajo el hombro y el otro brazo flexionado con la mano en el pecho, pon los pies juntos y súbelos sobre un banco.', 'Luego eleva la cadera apoyando sólo el pie de abajo y el antebrazo, con las piernas rectas en línea con el torso.', 'Al tratarse de un ejercicio isométrico, el esfuerzo se realiza al mantener la posición.', 'Intenta aguantar el máximo de tiempo posible en esta posición.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Puente Lateral Declinado')
);

-- Puente Lateral Declinado Aislada
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Puente Lateral Declinado Aislada'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17751301-Side-Plank-Hip-Adduction_Hips_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Túmbate de lado en el suelo.', 'Apoya un antebrazo con el codo bajo el hombro y el otro brazo flexionado con la mano en el pecho, apoya el pie superior en un banco y el otro déjalo en el aire bajo este.', 'Luego eleva la cadera, con las piernas rectas en línea con el torso.', 'Al tratarse de un ejercicio isométrico, el esfuerzo se realiza al mantener la posición.', 'Intenta aguantar el máximo de tiempo posible en esta posición.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Puente Lateral Declinado Aislada')
);

-- Pullover con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pullover con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Tríceps, Pectoral. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/13161301-Barbell-Bent-Arm-Pullover_Back_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Pectoral']::text[] as musculos_involucrados,
  'Banco Plano, Barra Larga'::text as equipment,
  ARRAY['Tumbado sobre un banco plano, agarra la barra con las manos a una anchura un poco mayor que los hombros, en pronación (palma de la mano hacia los pies).', 'Con los brazos estirados, llévalos hacia atrás de la cabeza.', 'Una vez abajo, vuelve a subir la barra con los brazos extendidos sobre el pecho.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pullover con Barra')
);

-- Pullover con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pullover con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/30101301-EZ-Bar-Lying-Bent-Arms-Pullover_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Barra Z'::text as equipment,
  ARRAY['Tumbado sobre un banco plano, agarra la barra con las manos a la anchura de los hombros, en pronación (palma de la mano hacia los pies).', 'Con los brazos semi flexionados, llévalos hacia atrás de la cabeza.', 'Una vez abajo, vuelve a subir la barra con los brazos sobre el pecho, manteniendo siempre la misma flexión de codos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pullover con Barra Z')
);

-- Pullover con cuerda en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pullover con cuerda en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/01841301-Cable-Lying-Extension-Pullover-with-rope-attachment_Back_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Tumbado sobre un banco plano cercano a una polea baja, los brazos estirados hacia atrás por encima de la cabeza, agarramos la cuerda conectada a la polea.', 'El movimiento consiste en realizar el ascenso de los brazos estirados hasta tener las manos frente al pecho.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pullover con cuerda en Polea')
);

-- Pullover con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pullover con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04331301-Dumbbell-Straight-Arm-Pullover_Chest-FIX_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Apoya la parte superior de la espalda sobre un banco plano, con las piernas flexionadas apoyadas en el suelo y la cadera hacia abajo.', 'Coge una mancuerna con ambas manos con los dedos entrelazados.', 'Estira los brazos con la mancuerna sobre el pecho.', 'El movimiento consiste en realizar el descenso de los brazos estirados hasta tener la mancuerna tras la cabeza.', 'Después vuelve a la posición inicial.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pullover con Mancuerna')
);

-- Pullover con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pullover con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/03751301-Dumbbell-Pullover_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Apoya la parte superior de la espalda sobre un banco plano, con las piernas flexionadas apoyadas en el suelo y el cuerpo recto (no bajes el culo).', 'Coge una mancuerna con ambas manos con los dedos entrelazados.', 'Estira los brazos con la mancuerna sobre el pecho.', 'El movimiento consiste en realizar el descenso de los brazos estirados hasta tener la mancuerna tras la cabeza.', 'Después vuelve a la posición inicial.', 'La inspiración se hace durante el descenso, la expiración durante el ascenso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pullover con Mancuerna')
);

-- Pullover Declinado Cerrado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pullover Declinado Cerrado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Tríceps, Pectoral. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/00341301-Barbell-Decline-Bent-Arm-Pullover_Back_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Pectoral']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Tumbado sobre un banco plano, agarra la barra con las manos casi juntas, en pronación (palma de la mano hacia los pies).', 'Con los brazos estirados, llévalos hacia atrás de la cabeza flexionándolos un poco.', 'Una vez abajo, vuelve a subir la barra con los brazos extendidos al llegar sobre el pecho.', 'Se puede hacer con barra z para que el agarre resulte más cómodo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pullover Declinado Cerrado con Barra')
);

-- Pullover Declinado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pullover Declinado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Tríceps, Pectoral. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/00371301-Barbell-Decline-wide-grip-pullover_Back_720.gif'::text as gif_url,
  ARRAY['Tríceps', 'Pectoral']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Tumbado sobre un banco plano, agarra la barra con las manos a una anchura un poco mayor que los hombros, en pronación (palma de la mano hacia los pies).', 'Con los brazos estirados, llévalos hacia atrás de la cabeza.', 'Una vez abajo, vuelve a subir la barra con los brazos extendidos sobre el pecho.', 'Se puede hacer con barra z para que el agarre resulte más cómodo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pullover Declinado con Barra')
);

-- Pullover Extenso con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pullover Extenso con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pecho. Músculos: Pectoral, Tríceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pecho'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/02881301-Dumbbell-Around-Pullover_Chest_720.gif'::text as gif_url,
  ARRAY['Pectoral', 'Tríceps']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco plano, coge una mancuerna con cada mano con agarre en pronación (palmas hacia los pies).', 'Estira los brazos con las mancuernas sobre el pecho.', 'Desciende los brazos estirados hacia atrás hasta tener la mancuerna tras la cabeza.', 'Después, con los brazos estirados, lleva las mancuernas hasta las caderas pasando por encima del torso.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pullover Extenso con Mancuernas')
);

-- Pulse Up
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Pulse Up'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Cuádriceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/34591301-Pulse-Up_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Cuádriceps']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Túmbate hacia arriba en el suelo y levanta las piernas hacia arriba manteniéndolas rectas.', 'Coloca las manos debajo de las caderas para mayor apoyo.', 'Eleva las caderas del suelo usando los músculos abdominales, y luego realiza un pequeño pulso hacia arriba, manteniendo el movimiento controlado.', 'Desciende las caderas hacia el suelo sin tocarlo completamente y repite el movimiento.', 'Este ejercicio trabaja los abdominales inferiores y puede mejorar la fuerza y la estabilidad del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Pulse Up')
);

-- Remo Aislado con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Aislado con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00641301-Barbell-One-Arm-Bent-over-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['Agarra la barra paralela al cuerpo cerca de un extremo con una mano, flexiona ligeramente las rodillas con las piernas separadas e inclina el torso hacia delante.', 'Ahora, mientras mantienes el torso inmóvil, coge aire mientras levantas la barra hasta llegar con la mano a la altura del abdomen, aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Mantén el codo cerca del cuerpo.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Aislado con Barra')
);

-- Remo Aislado con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Aislado con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02921301-Dumbbell-Bent-over-Row_back_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Coge una mancuerna con una mano con agarre neutro (palma hacia el interior).', 'Inclina el cuerpo hacia delante casi paralelo al suelo.', 'Puedes hacerlo de pie con las piernas separadas y apoyándote en algún sitio con la otra mano o sobre un banco, con la rodilla y brazo inversos al que sujeta la mancuerna apoyados sobre el banco.', 'Estira el brazo hacia abajo y a continuación sube la mancuerna hasta llegar a la altura del abdomen, manteniendo el brazo pegado al cuerpo y sacando pecho al llegar arriba.', 'Desciende lentamente y cambia de brazo al terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Aislado con Mancuerna')
);

-- Remo Aislado en Pronación en Máquina Smith
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Aislado en Pronación en Máquina Smith'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13601301-Smith-One-Arm-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Agarra la barra con una mano en pronación a la anchura del hombro, flexiona ligeramente las rodillas con las piernas separadas e inclina el torso hacia delante.', 'Ahora, mientras mantienes el torso inmóvil, coge aire mientras levantas la barra hasta llegar con la mano a la altura del abdomen, aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Aislado en Pronación en Máquina Smith')
);

-- Remo Aislado en Punta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Aislado en Punta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/40381301-Landmine-One-Arm-Bent-Over-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Agarra la barra perpendicular al cuerpo cerca del extremo con una mano, flexiona ligeramente las rodillas con las piernas separadas e inclina el torso hacia delante.', 'Ahora, mientras mantienes el torso inmóvil, coge aire mientras levantas la barra hasta llegar con la mano a la altura del abdomen, aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Aislado en Punta')
);

-- Remo Aislado Neutro en Máquina Smith
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Aislado Neutro en Máquina Smith'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/39451301-Smith-Single-Arm-Bent-Over-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Agarra la barra por el centro con una mano, flexiona ligeramente las rodillas con las piernas separadas e inclina el torso hacia delante.', 'Ahora, mientras mantienes el torso inmóvil, coge aire mientras levantas la barra hasta llegar con la mano a la altura del abdomen, aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Mantén el codo cerca del cuerpo.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Aislado Neutro en Máquina Smith')
);

-- Remo al mentón Cerrado con Barra Z
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo al mentón Cerrado con Barra Z'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01201301-Barbell-Upright-Row_shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Z'::text as equipment,
  ARRAY['De pie coge la barra con agarre en pronación, por la parte más interna de la barra z.', 'Eleva la barra hacia el mentón pero sin llegar a tocarlo, sacando los codos, aguanta un segundo y vuelve a bajar de forma controlada.', 'La espalda siempre recta y sin ningún tipo de balanceo corporal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo al mentón Cerrado con Barra Z')
);

-- Remo al mentón con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo al mentón con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15001301-Band-Upright-Row-Under-two-feet_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con la espalda recta y las piernas ligeramente separadas, coge los extremos de la banda con las manos en pronación (palmas hacia atrás) y ponlas delante del cuerpo.', 'Eleva las manos hacia el mentón abriendo los codos lateralmente, aguanta un segundo y vuelve a bajar de forma controlada.', 'La espalda siempre recta y sin ningún tipo de balanceo corporal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo al mentón con Banda')
);

-- Remo al mentón con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo al mentón con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01231301-Barbell-Wide-Grip-Upright-Row_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie coge la barra con agarre en pronación, con agarre algo más ancho de los hombros.', 'Eleva la barra hacia el mentón pero sin llegar a tocarlo, aguanta un segundo y vuelve a bajar de forma controlada.', 'La espalda siempre recta y sin ningún tipo de balanceo corporal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo al mentón con Barra')
);

-- Remo al mentón con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo al mentón con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04371301-Dumbbell-Upright-Row_shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie coge las mancuernas con agarre en pronación (palmas hacia atrás) por delante del cuerpo.', 'Eleva las mancuernas hacia el mentón, aguanta un segundo y vuelve a bajar de forma controlada.', 'La espalda siempre recta y sin ningún tipo de balanceo corporal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo al mentón con Mancuernas')
);

-- Remo al mentón en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo al mentón en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02461301-Cable-Upright-Row_shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie coge la barra con agarre en pronación, con agarre algo más ancho de los hombros.', 'Eleva la barra hacia el mentón pero sin llegar a tocarlo, aguanta un segundo y vuelve a bajar de forma controlada.', 'La espalda siempre recta y sin ningún tipo de balanceo corporal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo al mentón en Polea')
);

-- Remo al mentón Horizontal en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo al mentón Horizontal en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/42251301-Cable-Lying-Upright-Row_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Tumbado hacia arriba en el suelo con los pies cerca de la polea, coge la barra en pronación (palmas hacia abajo) a la anchura de los hombros.', 'Eleva la barra hacia el mentón pero sin llegar a tocarlo, aguanta un segundo y vuelve a bajar de forma controlada.', 'La espalda siempre recta y sin ningún tipo de balanceo corporal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo al mentón Horizontal en Polea')
);

-- Remo Colgado en Pronación
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Colgado en Pronación'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04991301-Inverted-Row_Back-FIX_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Coloca una barra entre dos soportes a la altura aproximada de la cadera.', 'Túmbate en el suelo y cuélgate de la barra estirando los brazos hasta que estén completamente rectos y con las manos en pronación (palmas hacia los pies) a la anchura de los hombros.', 'Sube el cuerpo flexionando los codos y retrae las escápulas para elevar el cuerpo hacia arriba hasta que nuestro pecho entre en contacto con la barra.', 'Vuelve a la posición original lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Colgado en Pronación')
);

-- Remo Colgado en Supinación
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Colgado en Supinación'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/12231301-Underhand-Grip-Inverted-Back-Row_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Coloca una barra entre dos soportes a la altura aproximada de la cadera.', 'Túmbate en el suelo y cuélgate de la barra estirando los brazos hasta que estén completamente rectos y con las manos en supinación (palmas hacia la cabeza) a la anchura de los hombros.', 'Sube el cuerpo flexionando los codos y retrae las escápulas para elevar el cuerpo hacia arriba hasta que nuestro pecho entre en contacto con la barra.', 'Vuelve a la posición original lentamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Colgado en Supinación')
);

-- Remo con giro Aislado en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo con giro Aislado en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02441301-Cable-Twisting-Pull_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas abiertas, flexionadas y una delante de otra, inclina el cuerpo hacia delante y con un brazo estirado al frente coge el agarre de la polea baja con la palma hacia abajo.', 'Realiza la flexión del codo llevándolo hacia el costado y con un giro de muñeca quedando la palma hacia arriba.', 'Vuelve a estirar suavemente.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo con giro Aislado en Polea Baja')
);

-- Remo Cruzado en Polea Alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Cruzado en Polea Alta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01531301-Cable-Cross-over-Lateral-Pulldown_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie entre dos poleas altas, con la espalda recta y las piernas ligeramente separadas, coge el agarre del lado opuesto con cada mano, estirando los brazos hacia arriba de forma que queden cruzadas.', 'Tira de ambas manos hacia atrás, llevando los codos a los costados y manteniendo la contracción dorsal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Cruzado en Polea Alta')
);

-- Remo Declinado Abierto en Pronación en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Declinado Abierto en Pronación en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01591301-Cable-Decline-Seated-Wide-Grip-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Polea'::text as equipment,
  ARRAY['Tumbado con el pecho apoyado en el respaldo del banco inclinado, con los brazos estirados coge la barra con las manos a una anchura mayor a la de los hombros y las palmas hacia abajo.', 'Flexiona los codos hacia los lados llevando la barra hasta el banco.', 'Estira de nuevo lentamente sin llegar a descansar al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Declinado Abierto en Pronación en Polea')
);

-- Remo Declinado Alterno con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Declinado Alterno con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33251301-Band-Alternate-Low-Row-wtih-Twist_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con las piernas separadas y algo flexionadas, pon la banda baja y coge los extremos con las manos hacia el interior, inclinando el torso ligeramente hacia delante.', 'Flexiona un codo llevando la mano al torso y al volver a estirar recoge el otro brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Declinado Alterno con Bandas')
);

-- Remo Declinado en Pronación en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Declinado en Pronación en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13181301-Cable-Incline-Bench-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Polea'::text as equipment,
  ARRAY['Tumbado con el pecho apoyado en el respaldo del banco inclinado, con los brazos estirados coge la barra con las manos a la anchura de los hombros y las palmas hacia abajo.', 'Flexiona los codos hacia los lados llevando la barra hasta el banco.', 'Estira de nuevo lentamente sin llegar a descansar al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Declinado en Pronación en Polea')
);

-- Remo Declinado Neutro en Pronación en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Declinado Neutro en Pronación en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13221301-Cable-Rope-Extension-Incline-Bench-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Polea'::text as equipment,
  ARRAY['Tumbado con el pecho apoyado en el respaldo del banco inclinado, con los brazos estirados coge la cuerda con las manos hacia el interior.', 'Flexiona los codos hacia los lados llevando la cuerda hasta el banco.', 'Estira de nuevo lentamente sin llegar a descansar al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Declinado Neutro en Pronación en Polea')
);

-- Remo en Barra T en Pronación
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo en Barra T en Pronación'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/11941301-Lever-Lying-T-bar-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Apoyando en pecho en el banco y las piernas ligeramente flexionadas, agarraremos con las manos en pronación (palmas hacia atrás).', 'Desde esta posición estiraremos el dorsal y separaremos las escápulas para comenzar la repetición.', 'Primero retraeremos las escápulas y acercaremos el peso lo máximo posible a nuestro pecho, intentando mover los codos hacia el cuerpo para reclutar correctamente los músculos de la espalda.', 'Descenderemos el peso de forma controlada hasta estirar bien la espalda y los brazos para volver a comenzar una repetición.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo en Barra T en Pronación')
);

-- Remo en Barra T en Supinación
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo en Barra T en Supinación'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13491301-Lever-Reverse-T-Bar-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Apoyando en pecho en el banco y las piernas ligeramente flexionadas, agarraremos con las manos en supinación (palmas hacia delante).', 'Desde esta posición estiraremos el dorsal y separaremos las escápulas para comenzar la repetición.', 'Primero retraeremos las escápulas y acercaremos el peso lo máximo posible a nuestro pecho, intentando mover los codos hacia el cuerpo para reclutar correctamente los músculos de la espalda.', 'Descenderemos el peso de forma controlada hasta estirar bien la espalda y los brazos para volver a comenzar una repetición.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo en Barra T en Supinación')
);

-- Remo en Pronación Abierto con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo en Pronación Abierto con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/37211301-Barbell-Bent-Over-Wide-Grip-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['Sosteniendo una barra con un agarre prono (palmas hacia abajo) a una anchura superior a la de los hombros, flexiona ligeramente las rodillas con las piernas separadas e inclina el torso hacia delante.', 'Ahora, mientras mantienes el torso inmóvil, coge aire mientras levantas la barra hasta llegar bajo el pecho, con contracción escapular y aguantando un segundo arriba.', 'Después desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo en Pronación Abierto con Barra')
);

-- Remo en Pronación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo en Pronación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00271301-Barbell-Bent-Over-Row_Back-FIX_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['Sosteniendo una barra con un agarre prono (palmas hacia abajo) a la anchura de los hombros, flexiona ligeramente las rodillas con las piernas separadas e inclina el torso hacia delante.', 'Ahora, mientras mantienes el torso inmóvil, coge aire mientras levantas la barra hasta llegar bajo el pecho, con contracción escapular y aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Mantén los codos cerca del cuerpo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo en Pronación con Barra')
);

-- Remo en Pronación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo en Pronación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13291301-Dumbbell-Palm-Rotational-Bent-Over-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sosteniendo dos mancuernas en pronación (palmas hacia abajo) a la anchura de los hombros, flexiona ligeramente las rodillas con las piernas separadas e inclina el torso hacia delante.', 'Ahora, mientras mantienes el torso inmóvil, coge aire mientras levantas las mancuernas hasta llegar bajo el pecho, con contracción escapular y aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Mantén los codos cerca del cuerpo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo en Pronación con Mancuernas')
);

-- Remo en Punta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo en Punta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/32001301-Lever-Bent-over-Row-with-V-bar-plate-loaded_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Deberemos mantener las piernas flexionadas, a una distancia similar a la de nuestros hombros, con la cadera flexionada y el torso lo más paralelo posible al suelo.', 'Además mantendremos la columna recta (manteniendo el arco lumbar natural) con el core activo evitando que se doble la espalda.', 'Desde esta posición estiraremos el dorsal y separaremos las escápulas para comenzar la repetición.', 'Primero retraeremos las escápulas y acercaremos el peso lo máximo posible a nuestro pecho, intentando mover los codos hacia el cuerpo para reclutar correctamente los músculos de la espalda.', 'Descenderemos el peso de forma controlada hasta estirar bien la espalda y los brazos para volver a comenzar una repetición.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo en Punta')
);

-- Remo en Supinación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo en Supinación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01181301-Barbell-Reverse-Grip-Bent-over-Row_Back-FIX_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['Sosteniendo una barra con un agarre supino (palmas hacia arriba) a la anchura de los hombros, flexiona ligeramente las rodillas con las piernas separadas e inclina el torso hacia delante.', 'Ahora, mientras mantienes el torso inmóvil, coge aire mientras levantas la barra hasta llegar bajo el pecho, con contracción escapular y aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Mantén los codos cerca del cuerpo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo en Supinación con Barra')
);

-- Remo en Supinación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo en Supinación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/37991301-Dumbbell-Bent-Over-Reverse-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sosteniendo dos mancuernas en supinación (palmas hacia arriba) a la anchura de los hombros, flexiona ligeramente las rodillas con las piernas separadas e inclina el torso hacia delante.', 'Ahora, mientras mantienes el torso inmóvil, coge aire mientras levantas las mancuernas hasta llegar bajo el pecho, con contracción escapular y aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Mantén los codos cerca del cuerpo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo en Supinación con Mancuernas')
);

-- Remo en Supinación en Máquina Smith
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo en Supinación en Máquina Smith'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13611301-Smith-Reverse-Grip-Bent-Over-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Agarra la barra con las manos en supinación a la anchura de los hombros, flexiona ligeramente las rodillas con las piernas separadas e inclina el torso hacia delante.', 'Ahora, mientras mantienes el torso inmóvil, coge aire mientras levantas la barra hasta llegar con la barra a la altura del abdomen, aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo en Supinación en Máquina Smith')
);

-- Remo Horizontal Abierto en Pronación en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Horizontal Abierto en Pronación en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02181301-Cable-Seated-Wide-grip-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado con los pies apoyados ante la polea, inclina el cuerpo hacia delante y con los brazos estirados coge la barra con las manos a una anchura mayor a la de los hombros y las palmas hacia abajo.', 'Flexiona los codos llevando la barra hasta el esternón.', 'Estira de nuevo lentamente sin llegar a descansar al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Horizontal Abierto en Pronación en Polea')
);

-- Remo Horizontal Aislado con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Horizontal Aislado con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09901301-Band-One-Arm-Twisting-Seated-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Sentado con las piernas estiradas y los pies juntos, pon la banda a la altura del pecho y coge un extremo con la mano hacia el interior.', 'Flexiona el codo llevando la mano al torso, sacando pecho.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Horizontal Aislado con Banda')
);

-- Remo Horizontal Aislado en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Horizontal Aislado en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/12051301-Cable-one-arm-twisting-seated-row_back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado con las piernas estiradas, inclina el cuerpo hacia delante y con un brazo estirado coge el agarre con la palma hacia el interior.', 'Realiza la flexión del codo llevándolo hacia el costado y con un giro del torso a favor, para lograr mayor carga del dorsal.', 'Vuelve a estirar suavemente.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Horizontal Aislado en Polea')
);

-- Remo Horizontal Cerrado en Pronación en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Horizontal Cerrado en Pronación en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13201301-Cable-Rope-Crossover-Seated-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado con los pies apoyados ante la polea, inclina el cuerpo hacia delante y con los brazos estirados coge la barra con agarre cerrado y las palmas hacia abajo.', 'Flexiona los codos llevando las manos hasta el torso mientras sacas pecho.', 'Estira de nuevo lentamente sin llegar a descansar al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Horizontal Cerrado en Pronación en Polea')
);

-- Remo Horizontal Cerrado Neutro Amplio en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Horizontal Cerrado Neutro Amplio en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/08611301-Cable-seated-row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado con los pies apoyados ante la polea, inclina el cuerpo hacia delante y con los brazos estirados coge la barra con las manos hacia el interior.', 'Flexiona los codos llevando la barra hasta el esternón con retracción escapular y echando el torso hacia atrás.', 'Estira de nuevo lentamente sin llegar a descansar al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Horizontal Cerrado Neutro Amplio en Polea')
);

-- Remo Horizontal Cerrado Neutro en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Horizontal Cerrado Neutro en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/26611301-Cable-Seated-Row-with-V-bar_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado con los pies apoyados ante la polea, inclina el cuerpo hacia delante y con los brazos estirados coge la barra con las manos hacia el interior.', 'Flexiona los codos llevando la barra hasta el esternón con retracción escapular.', 'Estira de nuevo lentamente sin llegar a descansar al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Horizontal Cerrado Neutro en Polea')
);

-- Remo Horizontal con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Horizontal con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/38961301-Band-seated-row-male_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Sentado con las piernas estiradas y los pies juntos, pon la banda a la altura del pecho y coge los extremos con las manos hacia el interior.', 'Flexiona los codos llevando las manos al torso, sacando pecho.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Horizontal con Bandas')
);

-- Remo Horizontal en Pronación en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Horizontal en Pronación en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13501301-Lever-Seated-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado y con el pecho apoyado, estira los brazos y coge los agarres con las manos en pronación (palmas hacia abajo).', 'Realiza la flexión de los codos llevando las manos hacia atrás con retracción escapular al final del movimiento.', 'Desciende lentamente sin llegar a apoyar el peso al final y vuelve a subir.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Horizontal en Pronación en Máquina')
);

-- Remo Horizontal en Pronación en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Horizontal en Pronación en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01801301-Cable-Low-Seated-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado con los pies apoyados ante la polea, inclina el cuerpo hacia delante y con los brazos estirados coge la barra con las manos a la anchura de los hombros y las palmas hacia abajo.', 'Flexiona los codos llevando la barra hasta el esternón.', 'Estira de nuevo lentamente sin llegar a descansar al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Horizontal en Pronación en Polea')
);

-- Remo Horizontal en Supinación en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Horizontal en Supinación en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13481301-Lever-Reverse-Grip-Vertical-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado y con el pecho apoyado, estira los brazos y coge los agarres con las manos en supinación (palmas hacia arriba).', 'Realiza la flexión de los codos llevando las manos hacia atrás con retracción escapular al final del movimiento.', 'Desciende lentamente sin llegar a apoyar el peso al final y vuelve a subir.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Horizontal en Supinación en Máquina')
);

-- Remo Horizontal Neutro en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Horizontal Neutro en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/26641301-Lever-Seated-Row-plate-loaded_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Sentado y con el pecho apoyado, estira los brazos y coge los agarres con las manos en posición neutra (palmas hacia el interior).', 'Realiza la flexión de los codos llevando las manos hacia atrás con retracción escapular al final del movimiento.', 'Desciende lentamente sin llegar a apoyar el peso al final y vuelve a subir.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Horizontal Neutro en Máquina')
);

-- Remo Horizontal Neutro en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Horizontal Neutro en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/12381301-Cable-Seated-Row-Bent-bar_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado con los pies apoyados ante la polea, inclina el cuerpo hacia delante y con los brazos estirados coge la barra con las manos hacia el interior.', 'Flexiona los codos llevando la barra hasta el esternón.', 'Estira de nuevo lentamente sin llegar a descansar al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Horizontal Neutro en Polea')
);

-- Remo Horizontal Superior con Cuerda en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Horizontal Superior con Cuerda en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02021301-Cable-Rear-Delt-Row-stirrups_Shoulders_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano, Polea'::text as equipment,
  ARRAY['Sentado con los pies apoyados ante la polea, inclina el cuerpo hacia delante y con los brazos estirados coge la cuerda con las manos hacia el interior.', 'Flexiona los codos llevando la barra hasta el mentón y subiendo los codos lateralmente sobre la altura de los hombros.', 'Estira de nuevo lentamente sin llegar a descansar al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Horizontal Superior con Cuerda en Polea')
);

-- Remo Inclinado Alterno con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Inclinado Alterno con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33261301-Band-Alternate-Lat-Pulldown-with-Twist_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con las piernas separadas y la espalda recta, pon las bandas en un lugar alto y agarra un extremo con cada mano estirando los brazos hacia arriba.', 'Flexiona un brazo llevando la mano hacia el costado.', 'Estíralo de nuevo mientras recoges el otro brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Inclinado Alterno con Bandas')
);

-- Remo Inclinado en Pronación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Inclinado en Pronación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00491301-Barbell-Incline-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Apoyando el pecho en el respaldo de un banco inclinado, sostén una barra con agarre en pronación (palmas hacia abajo) a una anchura algo mayor a la de los hombros.', 'Coge aire mientras levantas la barra hasta llegar tocar el respaldo por la parte inferior, con contracción escapular y aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Separa bien los codos del cuerpo en la subida.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Inclinado en Pronación con Barra')
);

-- Remo Inclinado en Pronación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Inclinado en Pronación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03271301-Dumbbell-Incline-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Apoyando el pecho en el respaldo de un banco inclinado, sostén una mancuerna con cada mano con agarre en pronación (palmas hacia abajo).', 'Coge aire mientras levantas las mancuernas hasta la altura del respaldo, con contracción escapular y aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Separa los codos del cuerpo en la subida.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Inclinado en Pronación con Mancuernas')
);

-- Remo Inclinado en Supinación con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Inclinado en Supinación con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13171301-Barbell-Reverse-Grip-Incline-Bench-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['Apoyando el pecho en el respaldo de un banco inclinado, sostén una barra con agarre en supinación (palmas hacia arriba) a una anchura algo mayor a la de los hombros.', 'Coge aire mientras levantas la barra hasta llegar tocar el respaldo por la parte inferior, con contracción escapular y aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Separa bien los codos del cuerpo en la subida.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Inclinado en Supinación con Barra')
);

-- Remo Inclinado en Supinación con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Inclinado en Supinación con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/13311301-Dumbbell-Reverse-Grip-Incline-Bench-Two-Arm-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Apoyando el pecho en el respaldo de un banco inclinado, sostén una mancuerna con cada mano con agarre en supinación (palmas hacia arriba).', 'Coge aire mientras levantas las mancuernas hasta la altura del respaldo, con contracción escapular y aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Separa los codos del cuerpo en la subida.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Inclinado en Supinación con Mancuernas')
);

-- Remo Inclinado Neutro con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Inclinado Neutro con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33201301-Dumbbell-Hammer-Grip-Incline-Bench-Two-Arm-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['Apoyando el pecho en el respaldo de un banco inclinado, sostén una mancuerna con cada mano con agarre neutro (palmas hacia el interior).', 'Coge aire mientras levantas las mancuernas hasta la altura del respaldo, con contracción escapular y aguantando un segundo arriba.', 'Después desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Inclinado Neutro con Mancuernas')
);

-- Remo Inferior Aislado con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Inferior Aislado con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09881301-Band-one-arm-Standing-Low-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con una pierna delante de otra y con el cuerpo inclinado hacia delante, pon la banda abajo y coge un extremo con la mano hacia el interior.', 'Flexiona el codo llevando la mano al torso, sacando pecho.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Inferior Aislado con Banda')
);

-- Remo Inferior Aislado en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Inferior Aislado en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01891301-Cable-One-Arm-Bent-over-Row_Back-FIX_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con una pierna delante de otra y el torso inclinado hacia delante, sacando pecho y glúteos, con un brazo estirados coge el agarre con la mano hacia el interior.', 'Flexiona el codo llevando la mano al costado.', 'Estira de nuevo lentamente sin llegar a descansar al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Inferior Aislado en Polea Baja')
);

-- Remo Inferior en Pronación en Polea Baja
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Inferior en Pronación en Polea Baja'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/38591301-Cable-Bent-Over-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie con las piernas separadas y el torso inclinado hacia delante, sacando pecho y glúteos, con los brazos estirados coge la barra con las manos a la anchura de los hombros y las palmas hacia abajo.', 'Flexiona los codos llevando la barra hasta el abdomen.', 'Estira de nuevo lentamente sin llegar a descansar al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Inferior en Pronación en Polea Baja')
);

-- Remo Libre Declinado con Cuerdas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Libre Declinado con Cuerdas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/28341301-Suspender-Weighted-Inverted-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Pon las cuerdas en un lugar alto.', 'Agarra un extremo con cada mano y déjate caer hacia atrás hasta casi tocar el suelo con la espalda, poniendo los pies sobre un banco.', 'Con los brazos estirados, realiza la flexión de los codos elevando el cuerpo hacia las bandas.', 'Puedes añadir peso poniéndote un disco sobre la pelvis.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Libre Declinado con Cuerdas')
);

-- Remo Libre Horizontal Abierto con Cuerdas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Libre Horizontal Abierto con Cuerdas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04981301-Inverted-Row-with-Straps_back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Pon la cuerda en un lugar alto.', 'Agarra un extremo con cada mano y déjate caer hacia atrás hasta casi tocar el suelo con la espalda.', 'Con los brazos estirados, realiza la flexión de los codos abriéndolos a los lados y elevando el cuerpo hacia las bandas.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Libre Horizontal Abierto con Cuerdas')
);

-- Remo Libre Horizontal Cerrado con Cuerda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Libre Horizontal Cerrado con Cuerda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/37491301-Inverted-Row-with-Bed-Sheet_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Pon la cuerda en un lugar alto.', 'Agarra un extremo con cada mano y déjate caer hacia atrás hasta casi tocar el suelo con la espalda.', 'Con los brazos estirados, realiza la flexión de los codos elevando el cuerpo hacia las bandas.', 'Mantén los codos cerca del cuerpo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Libre Horizontal Cerrado con Cuerda')
);

-- Remo Libre Inclinado Abierto con Cuerda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Libre Inclinado Abierto con Cuerda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/37441301-Rear-Delt-Fly-with-Bed-Sheet_Shoulders_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Pon la cuerda en un lugar alto.', 'Agarra un extremo con cada mano y déjate caer hacia atrás formando un ángulo aproximado de 45° con el suelo.', 'Con los brazos estirados, ábrelos hacia los lados elevando el cuerpo hacia las bandas.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Libre Inclinado Abierto con Cuerda')
);

-- Remo Libre Inclinado Cerrado con Cuerda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Libre Inclinado Cerrado con Cuerda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/37461301-Rear-Delt-Row-with-Bed-Sheet_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Pon la cuerda en un lugar alto.', 'Agarra un extremo con cada mano y déjate caer hacia atrás formando un ángulo aproximado de 45° con el suelo.', 'Con los brazos estirados, realiza la flexión de los codos elevando el cuerpo hacia las bandas, manteniendo los codos pegados.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Libre Inclinado Cerrado con Cuerda')
);

-- Remo Neutro con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Neutro con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02931301-Dumbbell-Bent-Over-Row_Back-FIX_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sosteniendo dos mancuernas en agarre neutro (palmas hacia el interior) a la anchura de los hombros, flexiona ligeramente las rodillas con las piernas separadas e inclina el torso hacia delante.', 'Ahora, mientras mantienes el torso inmóvil, coge aire mientras levantas las mancuernas hasta llegar bajo el pecho, con contracción escapular y aguantando un segundo arriba.', 'Después desciende de forma controlada.', 'Mantén los codos cerca del cuerpo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Neutro con Mancuernas')
);

-- Remo Superior Aislado con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Superior Aislado con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09831301-Band-kneeling-one-arm-pulldown_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De rodillas en el suelo con el cuerpo inclinado hacia delante, pon la banda arriba y coge un extremo con la mano hacia el suelo.', 'Flexiona el codo llevando la mano hacia el hombro.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Superior Aislado con Banda')
);

-- Remo Superior Aislado con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Superior Aislado con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03771301-Dumbbell-Rear-Delt-Row_shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Plano, Mancuernas'::text as equipment,
  ARRAY['Inclinado hacia delante en un banco plano, apoyando la rodilla y la mano de un lado del cuerpo, coge una mancuerna con la otra mano con agarre en pronación (palma hacia atrás).', 'Realiza el ascenso con el codos hacia arriba flexionándolo 90º, hasta que quede sobre la altura del hombro y perpendicular al cuerpo.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Superior Aislado con Mancuerna')
);

-- Remo Superior Aislado en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Superior Aislado en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/12101301-Cable-Twisting-Standing-high-Row_back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie frente a la polea con una pierna delante y otra detrás, con la espalda recta, estira un brazo y coge la polea alta con agarre en pronación (palma hacia el suelo).', 'Realiza la flexión del codo llevándolo hacia el costado y con un giro del torso a favor, para lograr mayor carga del dorsal.', 'Vuelve a estirar suavemente.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Superior Aislado en Polea')
);

-- Remo Superior con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Superior con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10221301-Band-standing-rear-delt-row_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con la espalda recta, pon las bandas en un lugar alto y coge un extremo con cada mano, delante de la cabeza con los codos a la altura de los hombros y las palmas de las manos hacia el suelo.', 'Lleva los codos hacia atrás como haciendo un Remo, en línea con los hombros.', 'Estira de nuevo lentamente y vuelve a flexionar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Superior con Bandas')
);

-- Remo Superior con Cuerda en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Superior con Cuerda en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01671301-Cable-High-Row-kneeling-rope-attachment_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De rodillas o sentado delante de la polea, con la espalda recta, estira los brazos hacia arriba y coge la cuerda con las manos hacia dentro.', 'Realiza la flexión de los codos llevándolos hacia los lados de los hombros hacia afuera, haciendo que las manos queden delante de los mismos.', 'Vuelve a estirar suavemente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Superior con Cuerda en Polea')
);

-- Remo Superior en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Superior en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/36971301-Cable-Kneeling-Rear-Delt-Row-with-rope-male_Shoulder_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De rodillas delante de la polea con la espalda recta, coge la cuerda de la polea alta con las dos manos y los brazos estirados Lleva los codos hacia atrás como haciendo un Remo, en línea con los hombros.', 'Estira de nuevo lentamente y vuelve a flexionar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Superior en Polea')
);

-- Remo Superior en Pronación en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Superior en Pronación en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/32321301-Cable-Standing-Rear-Delt-Horizontal-Row-with-rope_Shoulder_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie delante de la polea, con la espalda recta, estira los brazos hacia delante y coge la barra con las manos hacia abajo a una anchura inferior a la de los hombros.', 'Realiza la flexión de los codos llevándolos hacia los lados de los hombros hacia afuera, haciendo que las manos queden delante del pecho.', 'Vuelve a estirar suavemente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Superior en Pronación en Polea')
);

-- Remo Superior Trasero con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Remo Superior Trasero con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/42351301-Dumbbell-Seated-Bent-Over-Rear-Delt-Row_Shoulders_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentado con las piernas juntas y el torso inclinado hacia delante, coge una mancuerna con cada mano con agarre en pronación (palmas hacia atrás).', 'Realiza el ascenso con los codos hacia arriba flexionándolos 90º, hasta que queden sobre la altura de los hombros y perpendiculares al cuerpo.', 'Desciende de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Remo Superior Trasero con Mancuernas')
);

-- Retracción Escapular Colgado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Retracción Escapular Colgado'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/41771301-Hanging-Scapular-Shrug_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Colgado en una barra de dominadas con las manos a una anchura algo mayor que la de los hombros y las palmas hacia delante, realiza la retracción escapular (juntando omóplatos) y sacando pecho.', 'Relaja y procede de nuevo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Retracción Escapular Colgado')
);

-- Retracción Escapular entre Bancos
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Retracción Escapular entre Bancos'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17721301-Elbow-Lift-Reverse-Push-Up_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Plano'::text as equipment,
  ARRAY['Colocate entre dos bancos planos, túmbate hacia arriba con los pies en el suelo y un codo sobre cada banco, con los brazos perpendiculares al cuerpo.', 'Realiza es ascenso del torso mediante retracción escapular (juntando omóplatos) y sacando pecho.', 'Desciende lentamente y vuelve a subir.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Retracción Escapular entre Bancos')
);

-- Rodilla al codo
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rodilla al codo'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/30911301-High-Knee-Skips-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Nos colocaremos de pie, con el torso recto.', 'Es importante, que lo mantengamos apretado durante la realización del ejercicio.', 'Mejorará nuestra estabilidad y estimulación muscular en el abdomen.', 'Colocaremos los brazos a los lados del cuerpo con los codos ligeramente flexionados.', 'A continuación, elevaremos la pierna izquierda hacia el centro y acompañaremos el movimiento con el codo derecho, llegando a tocar.', 'Tras esto, realizaremos el mismo movimiento con la pierna derecha y el codo izquierdo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rodilla al codo')
);

-- Rodilla al codo con giro
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rodilla al codo con giro'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/30861301-Elbow-To-Knee-Twists-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Nos colocaremos de pie, con el torso recto.', 'Es importante, que lo mantengamos apretado durante la realización del ejercicio.', 'Mejorará nuestra estabilidad y estimulación muscular en el abdomen.', 'Deberemos tratar de colocar los codos alineados con la cabeza.', 'A continuación, elevaremos la pierna izquierda y giraremos el torso para acompañar con el codo opuesto (no tendrá que llegar a hacerlo).', 'Tras esto, realizaremos el mismo movimiento con la pierna derecha y el codo izquierdo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rodilla al codo con giro')
);

-- Rodilla al codo con sentadilla
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rodilla al codo con sentadilla'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/30921301-High-Knee-Squat-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Nos colocaremos en posición de sentadilla con las manos por detrás de la cabeza.', 'A continuación, elevaremos la rodilla izquierda y acompañaremos el movimiento girando el torso para tratar de aproximar la rodilla al codo contrario, estirando por completo la pierna de apoyo.', 'Tras esto, realizaremos el mismo movimiento con la pierna derecha y el codo izquierdo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rodilla al codo con sentadilla')
);

-- Roll Reverse Crunch
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Roll Reverse Crunch'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Glúteo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/22061301-Roll-Reverse-Crunch_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Glúteo']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Sentado en el suelo, pon el rodillo bajo los gemelos Apoya las manos a los lados por detrás del cuerpo.', 'Contrae los abdominales y levanta las caderas del suelo mientras estiras la pelvis hacia adelante.', 'Haz una pausa en la posición y luego recoge las caderas lentamente hacia la posición inicial.', 'Este ejercicio trabaja los músculos abdominales inferiores y puede ayudar a fortalecer el core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Roll Reverse Crunch')
);

-- Rotación Concentrada con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rotación Concentrada con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/03991301-Dumbbell-Seated-One-Arm-Rotate_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Sentado, con el codo apoyado sobre la rodilla o el banco, el brazo hacia abajo y la palma de la mano mirando hacia la otra mano (agarre en martillo), sujetar firmemente la mancuerna y realizar el movimiento de rotación de la muñeca sin despegar el antebrazo del apoyo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rotación Concentrada con Mancuerna')
);

-- Rotación de Aductor Externa con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rotación de Aductor Externa con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09841301-Band-Lying-Hip-Internal-Rotatio_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Tumbado hacia abajo en el suelo, con el extremo de una banda en un tobillo y el otro extremo en algún suporte a media altura.', 'Flexiona la pierna 90° hasta atrás.', 'Realiza la rotación hacia fuera, teniendo en cuenta que la banda debe tensar hacia el interior de la pierna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rotación de Aductor Externa con Banda')
);

-- Rotación de Aductor Interna con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rotación de Aductor Interna con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09821301-Band-Lying-Hip-External-Rotation_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Tumbado hacia abajo en el suelo, con el extremo de una banda en un tobillo y el otro extremo en algún suporte a media altura.', 'Flexiona la pierna 90° hasta atrás.', 'Realiza la rotación hacia dentro, teniendo en cuenta que la banda debe tensar hacia el exterior de la pierna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rotación de Aductor Interna con Banda')
);

-- Rotación de Cadera Externa con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rotación de Cadera Externa con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09961301-Band-Seated-Hip-Internal-Rotation_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Sentado en un banco o similar, con el extremo de una banda en un tobillo y el otro extremo en algún suporte.', 'Flexiona la pierna 90°.', 'Realiza la rotación hacia fuera, teniendo en cuenta que la banda debe tensar hacia el interior de la pierna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rotación de Cadera Externa con Banda')
);

-- Rotación de Cadera Interna con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rotación de Cadera Interna con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09951301-Band-Seated-Hip-External-Rotation_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Sentado en un banco o similar, con el extremo de una banda en un tobillo y el otro extremo en algún suporte.', 'Flexiona la pierna 90°.', 'Realiza la rotación hacia dentro, teniendo en cuenta que la banda debe tensar hacia el exterior de la pierna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rotación de Cadera Interna con Banda')
);

-- Rotación Externa Aislada con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rotación Externa Aislada con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/08631301-Dumbbell-lying-external-shoulder-rotation_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Tumbado lateralmente, coge una mancuerna en pronación (palma hacia el suelo) con el codo flexionado sobre el costado del cuerpo.', 'Realiza la rotación del hombro poniendo el antebrazo en vertical manteniendo la flexión.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rotación Externa Aislada con Mancuerna')
);

-- Rotación Externa Aislada en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rotación Externa Aislada en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02351301-Cable-Standing-Shoulder-External-Rotation_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie al lado de la polea, coge el agarre con la mano más lejana, el brazo flexionado 90° y la palma hacia el interior.', 'Realiza la rotación del hombro hacia el exterior del cuerpo manteniendo la flexión del codo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rotación Externa Aislada en Polea')
);

-- Rotación Externa Concentrada con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rotación Externa Concentrada con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/36931301-Dumbbell-Bench-Supported-External-Rotation_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['De pie tras un banco inclinado, apoya el codo flexionado sobre el borde del respaldo y coge una mancuerna en pronación (palma hacia el suelo) con la mano delante del pectoral opuesto.', 'Realiza la rotación del hombro poniendo el antebrazo en vertical manteniendo la flexión.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rotación Externa Concentrada con Mancuerna')
);

-- Rotación Interna Aislada en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rotación Interna Aislada en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02161301-Cable-Seated-Shoulder-Internal-Rotation_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['Sentado al lado de la polea, coge el agarre con la mano más cercana, el brazo flexionado 90° y la palma hacia el interior.', 'Realiza la rotación del hombro hacia el interior del pecho manteniendo la flexión del codo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rotación Interna Aislada en Polea')
);

-- Rotación Vertical Aislada con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rotación Vertical Aislada con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Hombro. Músculos: Trapecio, Deltoides. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Hombro'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/08641301-Dumbbell-Upright-Shoulder-External-Rotation_Back_720.gif'::text as gif_url,
  ARRAY['Trapecio', 'Deltoides']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con las piernas ligeramente separadas, coge una mancuerna en pronación (palma hacia el suelo) con el codo flexionado a 90º hacia abajo y con el brazo en línea con el hombro lateralmente.', 'Realiza la rotación del hombro poniendo el antebrazo en vertical hacia arriba manteniendo la flexión.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rotación Vertical Aislada con Mancuerna')
);

-- Rotación Vertical Aislada en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Rotación Vertical Aislada en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/41941301-Cable-Half-Kneeling-External-Rotation_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De rodillas frente a la polea, coge el soporte con la mano en pronación (palma hacia el suelo) con el codo flexionado a 90º hacia delante y con el brazo en línea con el hombro lateralmente.', 'Realiza la rotación del hombro poniendo el antebrazo en vertical hacia arriba manteniendo la flexión.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Rotación Vertical Aislada en Polea')
);

-- Russian Twist
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Russian Twist'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/06871301-Russian-Twist_Waist-FIX_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Siéntate en el suelo con las rodillas dobladas y los pies apoyados.', 'Inclina ligeramente el torso hacia atrás.', 'Junta las manos frente al pecho.', 'Gira el torso hacia un lado y luego hacia el otro, acercando el codo de ese lado hacia el suelo.', 'Mantén el equilibrio y repite alternando los lados.', 'Este ejercicio trabaja los oblicuos y mejora la estabilidad del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Russian Twist')
);

-- Russian Twist con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Russian Twist con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/34491301-Dumbbell-Russian-Twist_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['Siéntate en el suelo y con las piernas flexionadas, sujeta los pies bajo algún soporte.', 'Inclínate ligeramente hacia atrás para que tu torso y piernas formen una V, apretando tu pared abdominal para activar el core.', 'Balanceándote, gira tu torso de lado a lado sin mover las piernas.', 'Sostén una mancuerna entre los brazos para mayor dificultad.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Russian Twist con Mancuerna')
);

-- Russian Twist en Fitball con Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Russian Twist en Fitball con Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02111301-Cable-Russian-Twists-on-stability-ball_waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Fitball, Polea'::text as equipment,
  ARRAY['Túmbate con la espalda sobre un fitball con las piernas flexionadas y los pies en el suelo.', 'Agarra el soporte de la polea alta con las dos manos, quedando este a un lado.', 'Balanceándote, gira tu torso al lado contrario al de la polea, tirando del cable.', 'Al terminar la serie, date la vuelta para trabajar el otro lado.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Russian Twist en Fitball con Polea')
);

-- Salto alterno en el sitio
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Salto alterno en el sitio'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/31971301-Prancing_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Con las rodillas ligeramente flexionadas, adelantar una pierna y retrasar la otra.', 'Realizar un pequeño salto e invertir la posición de ambas piernas, acompañando siempre con los brazos opuestos.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Salto alterno en el sitio')
);

-- Salto con Cuerda Alterno Alto
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Salto con Cuerda Alterno Alto'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36771301-High-Knee-Jump-Rope-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['De pie con un solo pie sobre el suelo y la rodilla ligeramente flexionada, sostén la cuerda con ambas manos y hazla girar alrededor de tu cuerpo mientras saltas cuando pase por tus pies, manteniendo la posición, subiendo la rodilla lo máximo posible y cambiando de pie de apoyo en cada salto.', 'Puedes aumentar el ritmo progresivamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Salto con Cuerda Alterno Alto')
);

-- Salto con Cuerda Alterno Normal
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Salto con Cuerda Alterno Normal'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36761301-Skip-Jump-Rope-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['De pie con un solo pie sobre el suelo y la rodilla ligeramente flexionada, sostén la cuerda con ambas manos y hazla girar alrededor de tu cuerpo mientras saltas cuando pase por tus pies, manteniendo la posición y cambiando de pie de apoyo en cada salto.', 'Puedes aumentar el ritmo progresivamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Salto con Cuerda Alterno Normal')
);

-- Salto con Cuerda Alto
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Salto con Cuerda Alto'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36781301-High-Jump-Rope-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['De pie con los pies juntos y las rodillas ligeramente flexionadas, sostén la cuerda con ambas manos y hazla girar alrededor de tu cuerpo mientras saltas cuando pase por tus pies, manteniendo la posición y subiendo las rodillas lo máximo posible.', 'Puedes aumentar el ritmo progresivamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Salto con Cuerda Alto')
);

-- Salto con Cuerda Lateral
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Salto con Cuerda Lateral'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36751301-Side-to-Side-Jump-Rope-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['De pie con los pies juntos y las rodillas ligeramente flexionadas, sostén la cuerda con ambas manos y hazla girar alrededor de tu cuerpo mientras saltas cuando pase por tus pies, de un lado al otro manteniendo el equilibrio.', 'Puedes aumentar el ritmo progresivamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Salto con Cuerda Lateral')
);

-- Salto con Cuerda Normal
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Salto con Cuerda Normal'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/26121301-Jump-Rope-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['De pie con los pies juntos y las rodillas ligeramente flexionadas, sostén la cuerda con ambas manos y hazla girar alrededor de tu cuerpo mientras saltas cuando pase por tus pies, manteniendo la posición.', 'Puedes aumentar el ritmo progresivamente.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Salto con Cuerda Normal')
);

-- Salto con desplazamiento lateral
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Salto con desplazamiento lateral'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/35511301-Side-Shuttle_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['De pie, erguido con los pies separados a la anchura ancho de los hombros y los brazos extendidos a los lados.', 'Realiza una sentadilla y toca con una mano la parte exterior del pie.', 'Salta lateralmente desplazándote hacia el lado opuesto.', 'Al bajar, toca con la otra mano la parte exterior del pie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Salto con desplazamiento lateral')
);

-- Salto con desplazamiento lateral cruzado
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Salto con desplazamiento lateral cruzado'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36721301-Back-And-Forth-Step_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Con el cuerpo inclinado hacia delante, un pie adelantado y el otro atrás, toca el pie delantero con la mano opuesta y retrasa el otro brazo.', 'Salta lateralmente desplazándote hacia el lado opuesto y realiza la posición inversa.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Salto con desplazamiento lateral cruzado')
);

-- Salto de esquí
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Salto de esquí'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/36711301-Ski-Step_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['De pie, con las manos sobre la cintura, adelanta un poco un pie y retrasa el otro.', 'Con las rodillas ligeramente flexionadas, alterna entre ambos pies con un pequeño salto.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Salto de esquí')
);

-- Saltos rodillas en cuclillas con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Saltos rodillas en cuclillas con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14201301-Kneeling-Jump-Squat_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De rodillas en el suelo, coge una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Con la punta de los pies apoyada en el suelo (dedos flexionados), de un impulso salta hasta ponerte en cuclillas.', 'Déjate caer suavemente hacia delante y vuelve a repetir.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Saltos rodillas en cuclillas con Barra')
);

-- Sentadilla a una pierna con Banda Debajo
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla a una pierna con Banda Debajo'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10011301-Band-single-leg-split-squat_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie delante de una plataforma como puede ser un banco o silla, de espaldas a este, da un paso hacia delante y lleva una pierna hacia atrás flexionada, apoyando el empeine en el borde de la plataforma.', 'Pisa la banda con el pie de apoyo y coge los extremos con las manos.', 'Desciende flexionando la pierna de apoyo manteniendo la espalda recta.', 'Sube de nuevo estirando la pierna sin ayudarte de la que está en la plataforma, ya que es para ayudar con el equilibrio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla a una pierna con Banda Debajo')
);

-- Sentadilla a una pierna con Banda Delante
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla a una pierna con Banda Delante'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09871301-Band-One-Arm-Single-Leg-Split-Squat_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie delante de una plataforma como puede ser un banco o silla, de espaldas a este, da un paso hacia delante y lleva una pierna hacia atrás flexionada, apoyando el empeine en el borde de la plataforma.', 'Coge el extremo de la banda con la mano inversa a la pierna de apoyo, estando el otro extremo en algún soporte delante de ti.', 'Desciende flexionando la pierna de apoyo manteniendo la espalda recta.', 'Sube de nuevo estirando la pierna sin ayudarte de la que está en la plataforma, ya que es para ayudar con el equilibrio.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla a una pierna con Banda Delante')
);

-- Sentadilla a una pierna con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla a una pierna con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00681301-Barbell-One-Leg-Squat_thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con una barra tras la nuca, con las manos en ella a los lados de los hombros mirando hacia delante, ponte delante de un banco o silla.', 'Lleva una pierna hacia atrás y apoya el empeine del pie en el borde del banco para mantener el equilibrio.', 'Esta pierna no debe ejercer ningún tipo de fuerza.', 'Desciende la pierna de apoyo flexionando la rodilla 90º, sin descansar abajo, subiendo de nuevo y estirando bien arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla a una pierna con Barra')
);

-- Sentadilla a una pierna con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla a una pierna con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04101301-Dumbbell-Single-Leg-Split-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con una mancuerna en cada mano, ponte delante de un banco o silla.', 'Lleva una pierna hacia atrás y apoya el empeine del pie en el borde del banco para mantener el equilibrio.', 'Esta pierna no debe ejercer ningún tipo de fuerza.', 'Desciende la pierna de apoyo flexionando la rodilla 90º, sin descansar abajo, subiendo de nuevo y estirando bien arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla a una pierna con Mancuerna')
);

-- Sentadilla Abierta con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla Abierta con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/17601301-Dumbbell-Goblet-Squat_Thighs-FIX_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con las piernas separadas a una anchura algo superior a la de los hombros, coge una mancuerna con las dos manos y ponla delante del pecho, con los brazos flexionados.', 'Desciende flexionando las rodillas y bajando los glúteos por debajo de estas, sin descansar abajo, subiendo de nuevo y estirando bien arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla Abierta con Mancuerna')
);

-- Sentadilla Aislada Asistida con Cuerda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla Aislada Asistida con Cuerda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/37471301-Assisted-Pistol-Squat-with-Bed-Sheet_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['De pie, pon una cuerda en un lugar alto y agarra cada extremo con una mano.', 'Apóyate solo con un pie en el suelo y la otra pierna ponla hacia delante.', 'Déjate caer hacia atrás flexionando la pierna de apoyo 90° y estirando los brazos para no caerte.', 'Vuelve a estirar la pierna ayudándote de los brazos si es necesario.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla Aislada Asistida con Cuerda')
);

-- Sentadilla Asistida con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla Asistida con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/28041301-Dumbbell-Supported-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas, Otro'::text as equipment,
  ARRAY['De pie con los tobillos sujetos en un soporte, coge una mancuerna con ambas manos delante del pecho, col los brazos flexionados.', 'Flexiona las piernas 90º dejando caer el cuerpo suavemente hacia atrás, manteniendo la espalda erguida.', 'Sube de nuevo estirando bien arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla Asistida con Mancuerna')
);

-- Sentadilla Cerrada Inclinada en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla Cerrada Inclinada en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/19921301-Sled-Full-Hack-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Apoya la espalda en el respaldo inclinado, con los hombros bajo los soportes acolchados.', 'Pon los pies en la parte alta de la plataforma, a una anchura inferior a la de los hombros.', 'Sube estirando las piernas apretando glúteos arriba y desciende bajando los glúteos tras las rodillas.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla Cerrada Inclinada en Máquina')
);

-- Sentadilla con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10041301-Band-squat_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['De pie con las piernas a la anchura de los hombros y con la espalda recta agáchate flexionando las rodillas.', 'Pisa la banda y coge los extremos con las manos, tensando lo que consideres, y ponlas sobre los hombros con los brazos flexionados, sirviendo estos solo de agarre sin que carguen el peso.', 'Sube estirando las piernas y apretando glúteos arriba.', 'Desciende lentamente sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla con Banda')
);

-- Sentadilla con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00631301-Barbell-Narrow-Stance-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas separadas a la anchura de los hombros y una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Desciende flexionando las rodillas 90º, sin descansar abajo, subiendo de nuevo y estirando bien arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla con Barra')
);

-- Sentadilla con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15551301-Dumbbell-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta, coge una mancuerna con cada mano.', 'Desciende flexionando las rodillas a 90º y vuelve a subir de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla con Mancuernas')
);

-- Sentadilla con Poleas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla con Poleas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33491301-Cable-Front-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie entre dos poleas bajas, pon los pies a una anchura mayor que la de los hombros y con la espalda recta agáchate flexionando las rodillas.', 'Coge un agarre con cada mano y ponlas sobre los hombros con los brazos flexionados, sirviendo estos solo de agarre sin que carguen el peso.', 'Sube estirando las piernas y apretando glúteos arriba.', 'Desciende lentamente sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla con Poleas')
);

-- Sentadilla con salto con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla con salto con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00531301-Barbell-Jump-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas separadas a una anchura muy superior a la de los hombros coge una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Desciende flexionando las rodillas 90º, sin descansar abajo, subiendo de nuevo de un impulso dando un salto al final.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla con salto con Barra')
);

-- Sentadilla con salto con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla con salto con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15521301-Dumbbell-Jumping-Squat_Plyometric_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De cuclillas con la espalda recta, coge una mancuerna con cada mano.', 'Impúlsate saltando hacia arriba con las piernas rectas y vuelve a caer en cuclillas para inmediatamente saltar otra vez.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla con salto con Mancuernas')
);

-- Sentadilla en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/05781301-Lever-Deadlift-plate-loaded_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['De pie con los pies a la anchura de los hombros y con la espalda recta agáchate flexionando las rodillas.', 'Coge un agarre con cada mano con las palmas hacia el interior.', 'Sube estirando las piernas y apretando glúteos arriba.', 'Desciende lentamente sin descansar abajo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla en Máquina')
);

-- Sentadilla en Pared con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla en Pared con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15581301-Dumbbell-Wall-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con la espalda recta, coge una mancuerna con cada mano.', 'Apoya la espalda en una pared con los pies un poco hacia delante.', 'Desciende flexionando las rodillas a 90º sin despegar la espalda de la pared.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla en Pared con Mancuernas')
);

-- Sentadilla en Punta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla en Punta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/42461301-Landmine-Front-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['De pie de cara a la barra con las piernas a la anchura de los hombros y la espalda recta, coge el extremo de la barra con las dos manos entrelazadas delante del pecho.', 'Desciende bajando los glúteos tras las rodillas y sube estirando las piernas apretando glúteos arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla en Punta')
);

-- Sentadilla en zancada con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla en zancada con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/30301301-Barbell-Split-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie coge una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Da un paso adelantando una pierna y flexionando ambas ligeramente.', 'Inclínate hacia delante flexionando la pierna adelantada a 90º.', 'Vuelve a estirar la pierna sin despegar el pie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla en zancada con Barra')
);

-- Sentadilla en zancada inclinada con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla en zancada inclinada con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15181301-Barbell-Decline-Bench-Lunge_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Banco Inclinable, Barra Larga'::text as equipment,
  ARRAY['De pie coge una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Con un banco declinado delante, da un paso adelantando una pierna y pon el pie en el respaldo.', 'Inclínate hacia delante flexionando la pierna del banco a 90º.', 'Vuelve a estirar la pierna sin despegar el pie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla en zancada inclinada con Barra')
);

-- Sentadilla en zancada inclinada con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla en zancada inclinada con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15511301-Dumbbell-Decline-Bench-Lunge_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Banco Inclinable, Mancuernas'::text as equipment,
  ARRAY['De pie coge una mancuerna con cada mano, a los lados del cuerpo.', 'Con un banco declinado delante, da un paso adelantando una pierna y pon el pie en el respaldo.', 'Inclínate hacia delante flexionando la pierna del banco a 90º.', 'Vuelve a estirar la pierna sin despegar el pie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla en zancada inclinada con Mancuernas')
);

-- Sentadilla Profunda con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla Profunda con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00431301-Barbell-Full-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas separadas a la anchura de los hombros y una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Desciende flexionando las rodillas y bajando los glúteos hasta su altura, sin descansar abajo, subiendo de nuevo y estirando bien arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla Profunda con Barra')
);

-- Sentadilla Sumo con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla Sumo con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01241301-Barbell-Wide-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas separadas a una anchura muy superior a la de los hombros coge una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Desciende flexionando las rodillas 90º, sin descansar abajo, subiendo de nuevo y estirando bien arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla Sumo con Barra')
);

-- Sentadilla Sumo con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla Sumo con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03711301-Dumbbell-Plyo-Squat_thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con las piernas separadas a una anchura muy superior a la de los hombros, coge una mancuerna con las dos manos y ponla delante de la cadera, con los brazos estirados.', 'Desciende flexionando las rodillas y bajando los glúteos a la altura de estas, sin descansar abajo, subiendo de nuevo y estirando bien arriba.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla Sumo con Mancuerna')
);

-- Sentadilla Sumo Inclinada en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sentadilla Sumo Inclinada en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/41001301-Sled-Wide-Hack-Squat-male_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Apoya la espalda en el respaldo inclinado, con los hombros bajo los soportes acolchados.', 'Pon los pies en la parte alta de la plataforma, a una anchura superior a la de los hombros.', 'Sube estirando las piernas apretando glúteos arriba y desciende bajando los glúteos tras las rodillas.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sentadilla Sumo Inclinada en Máquina')
);

-- Serratos Aislados en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Serratos Aislados en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/35631301-Cable-One-Arm-Pulldown_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie, con los pies separados a la anchura de los hombros y las piernas ligeramente flexionadas.', 'Extiende un brazo cogiendo el agarre con la palma hacia dentro y da un paso atrás.', 'Manteniendo la postura, lleva la mano hacia el muslo (con el brazo extendido pero desbloqueado), aguantando unos instantes la contracción de la espalda.', 'Después, vuelve a subir el peso de forma controlada hasta el punto de partida (sin apoyar el peso para no descansar) provocando un estiramiento dorsal.', 'Al terminar la serie cambia de brazo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Serratos Aislados en Polea')
);

-- Serratos con Cuerda en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Serratos con Cuerda en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/12291301-Cable-Standing-Lat-Pushdown-rope-equipment_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie, con los pies separados a la anchura de los hombros y las piernas ligeramente flexionadas.', 'Extiende los brazos cogiendo la cuerda con las palmas hacia dentro y da un paso atrás, manteniendo la espalda recta con una leve inclinación hacia delante, con el pecho y glúteos hacia fuera, ejerciendo tensión sobre la musculatura dorsal.', 'Manteniendo la postura, lleva la cuerda hacia los muslos (con los brazos extendidos pero desbloqueados), aguantando unos instantes la contracción de la espalda.', 'Después, vuelve a separar el peso de forma controlada hasta el punto de partida (sin apoyar el peso para no descansar) provocando un estiramiento dorsal.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Serratos con Cuerda en Polea')
);

-- Serratos con giro en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Serratos con giro en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/24641301-Cable-Thibaudeau-Kayak-Row_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie, con los pies separados a la anchura de los hombros y las piernas ligeramente estiradas.', 'Extiende los brazos cogiendo la barra con las palmas hacia abajo y da un paso atrás.', 'Manteniendo la postura, lleva la barra a un lado de la cadera con un pequeño giro del torso.', 'Después, vuelve a subir el peso de forma controlada hasta el punto de partida (sin apoyar el peso para no descansar) provocando un estiramiento dorsal.', 'Puedes alternar una vez a cada lado o terminar la serie y cambiar.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Serratos con giro en Polea')
);

-- Serratos Inclinados Cerrados con Barra en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Serratos Inclinados Cerrados con Barra en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/01721301-Cable-Incline-Pushdown_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Polea'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco inclinado de espaldas a la polea alta, extiende los brazos cogiendo la barra con las palmas hacia delante a una anchura inferior a la de los hombros.', 'Con los brazos rectos, baja la barra hasta la altura del esternón, apretando los dorsales y aguantando un poco, para volver a subir de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Serratos Inclinados Cerrados con Barra en Polea')
);

-- Serratos Inclinados con Barra en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Serratos Inclinados con Barra en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/41801301-Cable-Seated-Pullover_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Banco Inclinable, Polea'::text as equipment,
  ARRAY['Tumbado hacia arriba en un banco ligeramente inclinado inclinado de espaldas a la polea alta, extiende los brazos cogiendo la barra con las palmas hacia delante a la anchura de los hombros.', 'Con los brazos rectos, baja la barra hasta la altura de la cadera, apretando los dorsales y aguantando un poco, para volver a subir de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Serratos Inclinados con Barra en Polea')
);

-- Serratos Inferiores con Barra en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Serratos Inferiores con Barra en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Espalda. Músculos: Dorsal, Trapecio, Bíceps. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Espalda'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/02381301-Cable-Straight-Arm-Pulldown_Back_720.gif'::text as gif_url,
  ARRAY['Dorsal', 'Trapecio', 'Bíceps']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie, con los pies separados a la anchura de los hombros y las piernas ligeramente flexionadas.', 'Extiende los brazos cogiendo la barra de la polea alta con las palmas hacia abajo, manteniendo la espalda recta.', 'Lleva la barra a la altura del abdomen (posición inicial).', 'Desde ahí, bájala hasta los muslos y vuelve a la posición inicial de forma controlada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Serratos Inferiores con Barra en Polea')
);

-- Sit Up con Bandas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sit Up con Bandas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/09921301-Band-push-sit-up_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Tumbado en el suelo hacia arriba con la espalda recta y las piernas estiradas y algo separadas, levanta los brazos en vertical y agarra dos bandas conectadas a algún soporte a esa altura, por detrás de la cabeza.', 'Desde atrás, inspira y mientras exhalas el aire inicia el encogimiento abdominal para elevar el torso mediante la contracción de los músculos de la zona media del cuerpo, formando un ángulo de 90º con las piernas.', 'Regresa lentamente a la posición inicial y repite tantas veces como necesites para completar la serie de ejercicios.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sit Up con Bandas')
);

-- Sit Up en Fitball
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sit Up en Fitball'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/22971301-Stability-Ball-Crunch-Full-range-hands-behind-head_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Fitball'::text as equipment,
  ARRAY['Apoya la espalda sobre el fitball, con los pies apoyados en el suelo, las rodillas flexionadas a 90° y las manos detrás de la cabeza.', 'Desde atrás, con la espalda casi en su totalidad apoyada sobre el fitball excepto la cabeza y columna dorsal que deben estar levemente despegadas del objeto, inspira y mientras exhalas el aire inicia el encogimiento abdominal para elevar el torso mediante la contracción de los músculos de la zona media del cuerpo.', 'Regresa lentamente a la posición inicial y repite tantas veces como necesites para completar la serie de ejercicios.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sit Up en Fitball')
);

-- Sit Up en Máquina
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sit Up en Máquina'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/18581301-Lever-Decline-Sit-up_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['Tumbado en el banco de la máquina hacia arriba con la espalda recta y las piernas flexionadas y los pies en los soportes fijos, agarra el soporte móvil con las manos delante del pecho.', 'Desde atrás, inspira y mientras exhalas el aire inicia el encogimiento abdominal para elevar el torso mediante la contracción de los músculos de la zona media del cuerpo, formando un ángulo de 90º con las piernas.', 'Regresa lentamente a la posición inicial y repite tantas veces como necesites para completar la serie de ejercicios.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sit Up en Máquina')
);

-- Skips
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Skips'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/31991301-Skips_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['El skipping es uno de los ejercicios más efectivos para incluir en el entrenamiento de un corredor con el objetivo de mejorar o aprender la técnica de carrera.', 'Gracias a este trabajo seremos capaces de fortalecer el tren inferior, prevenir lesiones o incluso economizar mayor energía durante la carrera.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Skips')
);

-- Split Jacks
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Split Jacks'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/31131301-Split-Jacks-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Comienza dando un paso hacia atrás hasta quedar en estocada mientras relajas los brazos.', 'Una vez estés en esta posición, salta y, mientras lo haces, cambia la posición de tus piernas para aterrizar en una estocada del lado contrario.', 'A medida que saltas, mueve los brazos hacia abajo y hacia arriba de forma alterna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Split Jacks')
);

-- Sprints con rodilla alta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Sprints con rodilla alta'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/37011301-High-Knee-Sprints_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['La forma eficiente de hacer este ejercicio es elevando las rodillas constantemente sobre la altura de la cadera, manteniendo la espalda recta, el pecho erguido, los abdominales contraídos y las rodillas suaves al impacto.', 'La parte superior del cuerpo debe participar en la actividad moviendo los brazos de forma alterna adelantando el opuesto a las rodillas.', 'Y es así como la carrera ponderada de rodilla alta elevará el ritmo cardíaco al entrenamiento máximo del 90%, aumentando la activación muscular.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Sprints con rodilla alta')
);

-- Squat Tuck Jumps
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Squat Tuck Jumps'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/37061301-Squat-Tuck-Jump_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Consiste en realizar sentadillas con salto impulsándonos para elevar los pies del suelo elevando ambas rodillas al pecho y después caer de pie.', 'Con este ejercicio trabajaremos piernas y glúteos sobre todo.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Squat Tuck Jumps')
);

-- Step Up
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Step Up'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/37651301-Jump-Step-Up-male_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Mantener el tronco erguido, tratando de evitar inclinarlo hacia adelante.', 'Mantener el pie de la pierna de atrás en la posición inicial, pero cargando el peso corporal sobre la pierna adelantada.', 'Extender la cadera y la rodilla adelantadas para ponerse de pie encima del cajón.', 'Se puede hacer sobre un banco o cualquier superficie elevada.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Step Up')
);

-- Step Up con Banda
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Step Up con Banda'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/10081301-Band-step-up_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Bandas'::text as equipment,
  ARRAY['Delante de alguna plataforma como puede ser un banco o una silla, sube una pierna flexionando la rodilla 90°.', 'Pisa el centro de una banda y agarra cada extremo con una mano, tensando lo que necesites.', 'Sube a la plataforma estirando la pierna que está encima, sin impulsarte con la de abajo.', 'Desciende lentamente y vuelve a subir.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Step Up con Banda')
);

-- Step Up con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Step Up con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/37281301-Barbell-Front-Step-Up_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga, Otro'::text as equipment,
  ARRAY['De pie con la espalda recta, sostén una barra sobre el pecho con las manos hacia arriba y los codos hacia delante.', 'Da un paso hacia delante subiendo en el step o plataforma completamente, estirando bien la pierna de apoyo y vuelve a bajar en el orden de subida.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Step Up con Barra')
);

-- Step Up con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Step Up con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/04311301-Dumbbell-Step-up_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas, Otro'::text as equipment,
  ARRAY['De pie con la espalda recta, sostén una mancuerna con cada mano a los lados del cuerpo.', 'Da un paso hacia delante subiendo en el step, banco o plataforma completamente, estirando bien la pierna de apoyo y vuelve a bajar en el orden de subida.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Step Up con Mancuernas')
);

-- Step Up Lateral
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Step Up Lateral'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/42561301-Stepdown-Squat_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Ponte sobre un step o plataforma con un pie, con el otro en el aire.', 'Baja de la plataforma lateralmente flexionando la pierna que está encima, cargando el peso sobre ella.', 'Apoya ligeramente el otro pie y vuelve a subir utilizando la pierna de la plataforma.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Step Up Lateral')
);

-- Tuck Jumps
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Tuck Jumps'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/37001301-Tuck-Jump-VERSION-2_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['Consiste en saltar elevando ambas rodillas al pecho, lo más alto posible, para ello, lo ideal es comenzar y culminar el salto con las rodillas flexionadas, de manera de amortiguar el impacto cuando volvemos a caer con ambos pies en el suelo.', 'Con este se trabaja principalmente piernas y abdomen, además de quemar calorías.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Tuck Jumps')
);

-- Wheel Rollout de pie
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Wheel Rollout de pie'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos, Deltoides, Pectoral. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/07961301-Standing-Wheel-Rollout_Waist_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos', 'Deltoides', 'Pectoral']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Ponte de pie con los pies separados a la anchura de los hombros y sostén un rodillo de rueda con ambas manos frente a ti.', 'Mantén la espalda recta y comienza a rodar el rodillo hacia adelante, doblando lentamente la cintura y bajando el torso hacia el suelo.', 'Continúa rodando hacia adelante hasta que sientas un estiramiento en los abdominales, pero evita arquear la espalda baja.', 'Detén el movimiento y, utilizando la fuerza de los abdominales, comienza a rodar el rodillo hacia atrás para volver a la posición inicial.', 'Mantén el control del movimiento en todo momento y evita extender demasiado la espalda.', 'Repite el movimiento durante el número deseado de repeticiones.', 'Este ejercicio trabaja principalmente los músculos abdominales, especialmente los rectos abdominales y los oblicuos, así como los músculos estabilizadores del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Wheel Rollout de pie')
);

-- Wheel Rollout de rodillas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Wheel Rollout de rodillas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Abdomen. Músculos: Abdomen, Oblicuos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Abdomen'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2024/05/08571301-Wheel-Rollout_Waist-FIX_720.gif'::text as gif_url,
  ARRAY['Abdomen', 'Oblicuos']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['Desde una posición de rodillas en el suelo, sostén un rodillo de rueda con ambas manos frente a ti, con los brazos extendidos y los abdominales contraídos.', 'Mantén la espalda recta y comienza a rodar el rodillo hacia adelante, doblando lentamente la cintura y bajando el torso hacia el suelo.', 'Continúa rodando hacia adelante hasta que sientas un estiramiento en los abdominales, pero evita arquear la espalda baja.', 'Detén el movimiento y, utilizando la fuerza de los abdominales, comienza a rodar el rodillo hacia atrás para volver a la posición inicial.', 'Mantén el control del movimiento en todo momento y evita extender demasiado la espalda.', 'Repite el movimiento durante el número deseado de repeticiones.', 'Este ejercicio trabaja principalmente los músculos abdominales, especialmente los rectos abdominales y los oblicuos, así como los músculos estabilizadores del core.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Wheel Rollout de rodillas')
);

-- Wrist Roller
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Wrist Roller'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Antebrazo. Músculos: Antebrazo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Antebrazo'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/08591301-Wrist-Roller_Forearms_720.gif'::text as gif_url,
  ARRAY['Antebrazo']::text[] as musculos_involucrados,
  'Otro'::text as equipment,
  ARRAY['De pie, con los brazos estirados hacia delante, realizar la recogida de la cuerda con giro de las muñecas de una en una.', 'Repetir cambiando el sentido.', 'Podemos apoyar los antebrazos sobre una barra, por ejemplo en un rack.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Wrist Roller')
);

-- Zancada con salto
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Zancada con salto'::text as nombre,
  'Tipo: Cardio. Grupo muscular: Todos. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Cardio'::text as tipo,
  'Todos'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/03/37081301-Cardio-Lunge_Cardio_720.gif'::text as gif_url,
  ARRAY['Todos']::text[] as musculos_involucrados,
  'Ninguno'::text as equipment,
  ARRAY['La técnica es sencilla: damos un paso largo con nuestra pierna derecha hacia adelante y flexionamos ambas rodillas hasta que queden en un ángulo de 90 grados (la referencia suele ser que la rodilla izquierda, la de la pierna que queda atrás, esté a punto de rozar el suelo).', 'Una vez abajo (con la zancada dada), cogemos impulso dando un pequeño salto para proceder con la pierna contraria.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Zancada con salto')
);

-- Zancada Delantera con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Zancada Delantera con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03361301-Dumbbell-Lunge_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con las piernas a la anchura de los hombros y la espalda recta, coge una mancuerna con cada mano a los lados del cuerpo.', 'Da una zancada hacia delante, flexionando la pierna de apoyo 90° y la otra de forma que quede la rodilla cerca del suelo.', 'Vuelve a la posición inicial.', 'Puedes alternar una vez cada pierna o cambiar al terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Zancada Delantera con Mancuernas')
);

-- Zancada Delantera en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Zancada Delantera en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33561301-Cable-Forward-Lunge_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie de espaldas a la polea con las piernas a la anchura de los hombros y la espalda recta, coge la cuerda de la polea alta con una mano a cada lado del cuello.', 'Da una zancada hacia delante, flexionando la pierna de apoyo 90° y la otra de forma que quede la rodilla cerca del suelo.', 'Vuelve a la posición inicial.', 'Puedes alternar una vez cada pierna o cambiar al terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Zancada Delantera en Polea')
);

-- Zancada Lateral con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Zancada Lateral con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/14101301-Barbell-Lateral-Lunge_Hips_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con los pies a la anchura de los hombros, coge una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Ahora haz un desplazamiento lateral con una pierna hacia fuera, flexionando al apoyar.', 'Vuelve a la posición inicial manteniendo el equilibrio.', 'Al terminal la serie cambia de pierna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Zancada Lateral con Barra')
);

-- Zancada Lateral con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Zancada Lateral con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 1/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '1/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/34481301-Dumbbell-Side-Lunge-VERSION-3_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con los pies a la anchura de los hombros, coge una mancuerna delante del pecho con los brazos flexionados.', 'Ahora haz un desplazamiento lateral con una pierna hacia fuera, flexionando al apoyar.', 'Vuelve a la posición inicial manteniendo el equilibrio.', 'Al terminal la serie cambia de pierna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Zancada Lateral con Mancuerna')
);

-- Zancada Lateral Cruzada con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Zancada Lateral Cruzada con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/37231301-Barbell-Curtsey-Lunge_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con los pies a la anchura de los hombros, coge una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Ahora haz un desplazamiento lateral hacia un lado pero moviendo la contraria por detrás de la pierna de apoyo, flexionando esta 90º.', 'Vuelve a la posición inicial manteniendo el equilibrio.', 'Al terminal la serie cambia de pierna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Zancada Lateral Cruzada con Barra')
);

-- Zancada Lateral Cruzada con Mancuerna
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Zancada Lateral Cruzada con Mancuerna'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/36831301-Dumbbell-Gobelt-Curtsey-Lunge_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con los pies a la anchura de los hombros, coge una mancuerna delante del pecho con los brazos flexionados.', 'Ahora haz un desplazamiento lateral hacia un lado pero moviendo la contraria por detrás de la pierna de apoyo, flexionando esta 90º.', 'Vuelve a la posición inicial manteniendo el equilibrio.', 'Al terminal la serie cambia de pierna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Zancada Lateral Cruzada con Mancuerna')
);

-- Zancada Lateral en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Zancada Lateral en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33551301-Cable-Lateral-Lunge-VERSION-2_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie al lado a la polea baja, con las piernas a la anchura de los hombros y la espalda recta, coge el soporte con la mano más cercana a la polea y póntelo junto al cuello con el codo flexionado.', 'Esto es solo para sostener el peso de la polea con el cuerpo.', 'Ahora haz un desplazamiento lateral con la pierna de fuera, flexionando al apoyar.', 'Vuelve a la posición inicial manteniendo el equilibrio.', 'Al terminal la serie cambia de pierna.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Zancada Lateral en Polea')
);

-- Zancada Trasera con Barra
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Zancada Trasera con Barra'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 3/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '3/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/00771301-Barbell-Rear-Lunge-II_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Barra Larga'::text as equipment,
  ARRAY['De pie con las piernas separadas a una anchura inferior a la de los hombros y una barra sobre el trapecio, ayudando a mantenerla con las manos a los lados de los hombros.', 'Da un paso hacia atrás con una pierna, flexionando la de apoyo 90º quedando el muslo paralelo al suelo, y sin descansar abajo sube de nuevo a la posición inicial.', 'Cambia de pierna en cada repetición o al final de la serie.', 'Para mayor dificultad, inicia el ejercicio sobre un step o plataforma con cierta altura.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Zancada Trasera con Barra')
);

-- Zancada Trasera con Mancuernas
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Zancada Trasera con Mancuernas'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/03811301-Dumbbell-Rear-Lunge_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie con las piernas a la anchura de los hombros y la espalda recta, coge una mancuerna con cada mano a los lados del cuerpo.', 'Da una zancada hacia atrás, flexionando la pierna de apoyo 90° y la otra de forma que quede la rodilla cerca del suelo.', 'Vuelve a la posición inicial.', 'Puedes alternar una vez cada pierna o cambiar al terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Zancada Trasera con Mancuernas')
);

-- Zancada Trasera en Polea
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Zancada Trasera en Polea'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/33511301-Cable-Lunge_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Polea'::text as equipment,
  ARRAY['De pie de cara a la polea baja con las piernas a la anchura de los hombros y la espalda recta, coge el agarre de la polea baja con las dos manos entrelazadas delante del abdomen.', 'Da una zancada hacia atrás, flexionando la pierna de apoyo 90° y la otra de forma que quede la rodilla cerca del suelo.', 'Vuelve a la posición inicial.', 'Puedes alternar una vez cada pierna o cambiar al terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Zancada Trasera en Polea')
);

-- Zancada Trasera en Punta
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Zancada Trasera en Punta'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/40401301-Landmine-Rear-Lunge-VERSION-2_Thighs_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Máquina'::text as equipment,
  ARRAY['De pie de cara a la barra con las piernas a la anchura de los hombros y la espalda recta, coge el extremo de la barra con las dos manos entrelazadas delante del pecho.', 'Da una zancada hacia atrás, flexionando la pierna de apoyo 90° y la otra de forma que quede la rodilla cerca del suelo.', 'Vuelve a la posición inicial.', 'Puedes alternar una vez cada pierna o cambiar al terminar la serie.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Zancada Trasera en Punta')
);

-- Zancadas con salto
insert into public.tipo_ejercicio (nombre, descripcion, tipo, grupo_muscular, dificultad, usuario_id, gif_url, musculos_involucrados, equipment, instructions)
select
  'Zancadas con salto'::text as nombre,
  'Tipo: Fuerza. Grupo muscular: Pierna. Músculos: Glúteo, Aductor, Cuádriceps, Gemelo. Dificultad: 2/3. Catálogo FitCron.'::text as descripcion,
  'Fuerza'::text as tipo,
  'Pierna'::text as grupo_muscular,
  '2/3'::text as dificultad,
  null::uuid as usuario_id,
  'https://fitcron.com/wp-content/uploads/2021/04/15541301-Dumbbell-Split-Jump_Plyometric_720.gif'::text as gif_url,
  ARRAY['Glúteo', 'Aductor', 'Cuádriceps', 'Gemelo']::text[] as musculos_involucrados,
  'Mancuernas'::text as equipment,
  ARRAY['De pie coge una mancuerna con cada mano, a los lados del cuerpo.', 'Da un paso adelantando una pierna y flexiona ligeramente las dos, con el cuerpo entre medias y la espalda recta.', 'A continuación da un salto de un impulso y cambia el sentido de las piernas, es decir, la de atrás ponla delante y viceversa.']::text[] as instructions
where not exists (
  select 1 from public.tipo_ejercicio te where public.gym_normalize_tipo_nombre(te.nombre) = public.gym_normalize_tipo_nombre('Zancadas con salto')
);

commit;
