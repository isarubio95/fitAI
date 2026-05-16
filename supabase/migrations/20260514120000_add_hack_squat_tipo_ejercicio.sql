-- Catálogo: Hack Squat (GIF en /public/ejercicios, esquema sin external_id ni descripcion)
update public.tipo_ejercicio
set
  nombre = 'Hack Squat',
  gif_url = '/ejercicios/41221301-Hack-Squat_Thighs_720.gif',
  imagen = '/ejercicios/41221301-Hack-Squat_Thighs_720.gif'
where lower(trim(nombre)) = 'hack squat';

insert into public.tipo_ejercicio (
  nombre,
  gif_url,
  imagen,
  musculos_involucrados,
  equipment,
  instructions,
  tipo,
  grupo_muscular,
  dificultad,
  registro_series
)
select
  'Hack Squat',
  '/ejercicios/41221301-Hack-Squat_Thighs_720.gif',
  '/ejercicios/41221301-Hack-Squat_Thighs_720.gif',
  array['Vasto Lateral', 'Vasto Medial', 'Vasto Intermedio', 'Recto Femoral']::text[],
  'Máquina hack squat',
  array[
    'Coloca los pies en la plataforma a la anchura de hombros o ligeramente más abiertos.',
    'Apoya la espalda en el respaldo y encaja los hombros bajo las almohadillas.',
    'Desciende controlando hasta aproximadamente 90° en rodillas y empuja extendiendo sin bloquear por completo las articulaciones.'
  ]::text[],
  'Fuerza',
  'Cuádriceps',
  'media',
  'peso_reps'
where not exists (
  select 1 from public.tipo_ejercicio te where lower(trim(te.nombre)) = 'hack squat'
);
