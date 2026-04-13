ALTER TABLE public.perfil
ADD COLUMN IF NOT EXISTS es_premium boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.plan_generado_ia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  respuesta jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
