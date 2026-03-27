-- Ejecutar en Supabase SQL si el INSERT de cardio en vivo falla por usuario_id NULL
-- (el cliente ya no envía usuario_id y confía en DEFAULT auth.uid()).

ALTER TABLE public.cardio_sesion
  ALTER COLUMN usuario_id SET DEFAULT auth.uid();
