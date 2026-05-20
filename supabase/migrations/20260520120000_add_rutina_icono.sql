-- Icono visual de rutina (clave usada en el cliente, p. ej. dumbbell, flame).
alter table public.rutina
  add column if not exists icono text not null default 'dumbbell';

alter table public.rutina
  drop constraint if exists rutina_icono_check;

alter table public.rutina
  add constraint rutina_icono_check check (
    icono in (
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

comment on column public.rutina.icono is 'Clave del icono Lucide/custom mostrado junto al nombre de la rutina.';
