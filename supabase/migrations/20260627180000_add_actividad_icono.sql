-- Icono visual del entrenamiento (independiente del título / rutina).
alter table public.actividad
  add column if not exists icono text;

alter table public.actividad
  drop constraint if exists actividad_icono_check;

alter table public.actividad
  add constraint actividad_icono_check check (
    icono is null
    or icono in (
      'dumbbell',
      'flame',
      'shield',
      'zap',
      'target',
      'swords',
      'activity',
      'heartPulse',
      'arm',
      'leg',
      'abs',
      'fullBody'
    )
  );

comment on column public.actividad.icono is 'Clave del icono mostrado junto al título del entrenamiento.';
