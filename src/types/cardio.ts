import type { Tables } from "@/integrations/supabase/types";

export type CardioSesion = Tables<"cardio_sesion">;
export type CardioBloque = Tables<"cardio_bloque">;

export type CardioBlockInput = {
  tipo_bloque: string;
  distancia_m?: number | null;
  duracion_seg?: number | null;
  elevacion_m?: number | null;
  fc_media?: number | null;
  fc_max?: number | null;
  calorias?: number | null;
};

export type CardioRoutineBlockInput = {
  tipo_bloque: string;
  distancia_objetivo_m?: number | null;
  duracion_objetivo_seg?: number | null;
  ritmo_objetivo_seg_km?: number | null;
  fc_objetivo?: number | null;
};

