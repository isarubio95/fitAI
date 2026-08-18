-- Gimnasio por defecto del usuario (Ajustes). ON DELETE SET NULL si desaparece del catálogo.

ALTER TABLE public.perfil
  ADD COLUMN IF NOT EXISTS gimnasio_id uuid REFERENCES public.gimnasio (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gimnasio_nombre text;

CREATE INDEX IF NOT EXISTS perfil_gimnasio_id_idx
  ON public.perfil (gimnasio_id)
  WHERE gimnasio_id IS NOT NULL;
