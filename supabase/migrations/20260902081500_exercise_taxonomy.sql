-- Taxonomía de ejercicios: patrón de movimiento, cualidad física, plano y deporte.
--
-- GENERADO por scripts/gen-taxonomy-migration.mjs desde
-- src/constants/exerciseTaxonomy.ts. No editar a mano: regenerar.
--
-- Habilita el catálogo deportivo. El encaje ejercicio↔deporte NO se guarda
-- fila a fila: se infiere puntuando patrón/cualidad/plano contra el perfil del
-- deporte (src/constants/sportProfiles.ts, src/lib/sportExerciseScore.ts).
-- La columna `deportes` es solo el override para lo verdaderamente específico.

-- ── Catálogo del sistema ──────────────────────────────────────────────────
alter table public.tipo_ejercicio
  add column if not exists video_url text,
  add column if not exists patron_movimiento text[] not null default '{}',
  add column if not exists cualidad text[] not null default '{}',
  add column if not exists plano text,
  add column if not exists unilateral boolean,
  add column if not exists deportes text[] not null default '{}',
  add column if not exists equipment_list text[] not null default '{}',
  add column if not exists origen text,
  add column if not exists origen_externo_id text;

alter table public.tipo_ejercicio
  drop constraint if exists tipo_ejercicio_patron_movimiento_check,
  drop constraint if exists tipo_ejercicio_cualidad_check,
  drop constraint if exists tipo_ejercicio_plano_check,
  drop constraint if exists tipo_ejercicio_deportes_check;

alter table public.tipo_ejercicio
  add constraint tipo_ejercicio_patron_movimiento_check check (
    patron_movimiento <@ array[
      'empuje_horizontal',
      'empuje_vertical',
      'traccion_horizontal',
      'traccion_vertical',
      'sentadilla',
      'bisagra',
      'zancada',
      'rotacion',
      'antirotacion',
      'flexion_core',
      'salto',
      'aterrizaje',
      'lanzamiento',
      'desplazamiento',
      'carry',
      'braceo',
      'aislado'
    ]::text[]
  ),
  add constraint tipo_ejercicio_cualidad_check check (
    cualidad <@ array[
      'fuerza_maxima',
      'hipertrofia',
      'potencia',
      'pliometria',
      'velocidad',
      'resistencia',
      'estabilidad',
      'movilidad',
      'coordinacion',
      'prevencion'
    ]::text[]
  ),
  add constraint tipo_ejercicio_plano_check check (
    plano is null or plano in (
    'sagital',
    'frontal',
    'transversal',
    'multiplanar'
    )
  ),
  add constraint tipo_ejercicio_deportes_check check (
    deportes <@ array[
      'futbol',
      'futbol_sala',
      'baloncesto',
      'balonmano',
      'voleibol',
      'rugby',
      'tenis',
      'padel',
      'badminton',
      'squash',
      'tenis_mesa',
      'natacion',
      'waterpolo',
      'remo',
      'piraguismo',
      'surf',
      'atletismo_velocidad',
      'atletismo_salto',
      'atletismo_lanzamiento',
      'ciclismo',
      'running',
      'esqui',
      'escalada',
      'boxeo',
      'artes_marciales',
      'hockey',
      'beisbol',
      'golf'
    ]::text[]
  );

alter table public.tipo_ejercicio
  drop constraint if exists tipo_ejercicio_origen_check;

alter table public.tipo_ejercicio
  add constraint tipo_ejercicio_origen_check check (
    origen is null or origen in (
    'nativo',
    'fdb',
    'lyfta',
    'curado'
    )
  );

comment on column public.tipo_ejercicio.video_url is 'URL de YouTube con la demostración. Se usa cuando no hay animación propia.';
comment on column public.tipo_ejercicio.patron_movimiento is 'Patrones mecánicos del ejercicio. Vocabulario en src/constants/exerciseTaxonomy.ts.';
comment on column public.tipo_ejercicio.cualidad is 'Cualidades físicas que entrena. Vocabulario en src/constants/exerciseTaxonomy.ts.';
comment on column public.tipo_ejercicio.plano is 'Plano de movimiento dominante.';
comment on column public.tipo_ejercicio.unilateral is 'true si se ejecuta a una pierna/brazo. Los deportes premian el trabajo unilateral.';
comment on column public.tipo_ejercicio.deportes is 'Override explícito: deportes a los que sirve. El encaje normal se infiere del patrón y la cualidad (src/constants/sportProfiles.ts).';
comment on column public.tipo_ejercicio.equipment_list is 'equipment partido en átomos. equipment es un string con comas y no se puede filtrar en servidor.';
comment on column public.tipo_ejercicio.origen is 'Fuente de la fila. Determina la licencia del medio asociado.';
comment on column public.tipo_ejercicio.origen_externo_id is 'Id en la fuente externa. Junto con origen hace la importación idempotente.';

create index if not exists tipo_ejercicio_deportes_gin
  on public.tipo_ejercicio using gin (deportes);
create index if not exists tipo_ejercicio_cualidad_gin
  on public.tipo_ejercicio using gin (cualidad);
create index if not exists tipo_ejercicio_patron_movimiento_gin
  on public.tipo_ejercicio using gin (patron_movimiento);
create index if not exists tipo_ejercicio_equipment_list_gin
  on public.tipo_ejercicio using gin (equipment_list);

-- Reimportar no debe duplicar. No parcial: ON CONFLICT necesita un índice
-- que no lleve WHERE para poder usarlo como destino de inferencia. Las filas
-- nativas (origen y origen_externo_id ambos null) no chocan entre sí de
-- todos modos, porque Postgres trata cada NULL como distinto en un índice
-- único.
create unique index if not exists tipo_ejercicio_origen_externo_uidx
  on public.tipo_ejercicio (origen, origen_externo_id);

-- ── Ejercicios creados por el usuario ─────────────────────────────────────
-- Mismas etiquetas para que un ejercicio propio también entre en rutinas
-- deportivas. Sin origen/origen_externo_id: no se importan de ninguna fuente.
alter table public.usuario_ejercicio
  add column if not exists video_url text,
  add column if not exists patron_movimiento text[] not null default '{}',
  add column if not exists cualidad text[] not null default '{}',
  add column if not exists plano text,
  add column if not exists unilateral boolean,
  add column if not exists deportes text[] not null default '{}',
  add column if not exists equipment_list text[] not null default '{}';

alter table public.usuario_ejercicio
  drop constraint if exists usuario_ejercicio_patron_movimiento_check,
  drop constraint if exists usuario_ejercicio_cualidad_check,
  drop constraint if exists usuario_ejercicio_plano_check,
  drop constraint if exists usuario_ejercicio_deportes_check;

alter table public.usuario_ejercicio
  add constraint usuario_ejercicio_patron_movimiento_check check (
    patron_movimiento <@ array[
      'empuje_horizontal',
      'empuje_vertical',
      'traccion_horizontal',
      'traccion_vertical',
      'sentadilla',
      'bisagra',
      'zancada',
      'rotacion',
      'antirotacion',
      'flexion_core',
      'salto',
      'aterrizaje',
      'lanzamiento',
      'desplazamiento',
      'carry',
      'braceo',
      'aislado'
    ]::text[]
  ),
  add constraint usuario_ejercicio_cualidad_check check (
    cualidad <@ array[
      'fuerza_maxima',
      'hipertrofia',
      'potencia',
      'pliometria',
      'velocidad',
      'resistencia',
      'estabilidad',
      'movilidad',
      'coordinacion',
      'prevencion'
    ]::text[]
  ),
  add constraint usuario_ejercicio_plano_check check (
    plano is null or plano in (
    'sagital',
    'frontal',
    'transversal',
    'multiplanar'
    )
  ),
  add constraint usuario_ejercicio_deportes_check check (
    deportes <@ array[
      'futbol',
      'futbol_sala',
      'baloncesto',
      'balonmano',
      'voleibol',
      'rugby',
      'tenis',
      'padel',
      'badminton',
      'squash',
      'tenis_mesa',
      'natacion',
      'waterpolo',
      'remo',
      'piraguismo',
      'surf',
      'atletismo_velocidad',
      'atletismo_salto',
      'atletismo_lanzamiento',
      'ciclismo',
      'running',
      'esqui',
      'escalada',
      'boxeo',
      'artes_marciales',
      'hockey',
      'beisbol',
      'golf'
    ]::text[]
  );

comment on column public.usuario_ejercicio.video_url is 'URL de YouTube con la demostración. Se usa cuando no hay animación propia.';
comment on column public.usuario_ejercicio.patron_movimiento is 'Patrones mecánicos del ejercicio. Vocabulario en src/constants/exerciseTaxonomy.ts.';
comment on column public.usuario_ejercicio.cualidad is 'Cualidades físicas que entrena. Vocabulario en src/constants/exerciseTaxonomy.ts.';
comment on column public.usuario_ejercicio.plano is 'Plano de movimiento dominante.';
comment on column public.usuario_ejercicio.unilateral is 'true si se ejecuta a una pierna/brazo. Los deportes premian el trabajo unilateral.';
comment on column public.usuario_ejercicio.deportes is 'Override explícito: deportes a los que sirve. El encaje normal se infiere del patrón y la cualidad (src/constants/sportProfiles.ts).';
comment on column public.usuario_ejercicio.equipment_list is 'equipment partido en átomos. equipment es un string con comas y no se puede filtrar en servidor.';

create index if not exists usuario_ejercicio_deportes_gin
  on public.usuario_ejercicio using gin (deportes);
create index if not exists usuario_ejercicio_cualidad_gin
  on public.usuario_ejercicio using gin (cualidad);
create index if not exists usuario_ejercicio_patron_movimiento_gin
  on public.usuario_ejercicio using gin (patron_movimiento);
create index if not exists usuario_ejercicio_equipment_list_gin
  on public.usuario_ejercicio using gin (equipment_list);
