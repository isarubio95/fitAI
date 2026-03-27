import type { Tables } from "@/integrations/supabase/types";

export type CardioSesion = Tables<"cardio_sesion">;
export type CardioBloque = Tables<"cardio_bloque">;
export type CardioDisciplina = Tables<"cardio_disciplina">;
export type CardioSesionRunning = Tables<"cardio_sesion_running">;
export type CardioSesionCycling = Tables<"cardio_sesion_cycling">;
export type CardioTrack = Tables<"cardio_track">;
export type CardioTrackPoint = Tables<"cardio_track_point">;

export type CardioDisciplineCode = "running" | "cycling" | "walking" | "rowing" | "swimming" | "other";

export type CardioBlockInput = {
  tipo_bloque: string;
  distancia_m?: number | null;
  duracion_seg?: number | null;
  elevacion_m?: number | null;
  fc_media?: number | null;
  fc_max?: number | null;
  calorias?: number | null;
};

export type CardioRunningInput = {
  ritmo_medio_seg_km?: number | null;
  cadencia_media_spm?: number | null;
  desnivel_positivo_m?: number | null;
  zancada_media_cm?: number | null;
};

export type CardioCyclingInput = {
  potencia_media_w?: number | null;
  potencia_normalizada_w?: number | null;
  cadencia_media_rpm?: number | null;
  desnivel_positivo_m?: number | null;
  tipo_bici?: string | null;
};

export type CardioTrackPointInput = {
  orden: number;
  lat: number;
  lng: number;
  elevacion_m?: number | null;
  timestamp_utc?: string | null;
  velocidad_m_s?: number | null;
  fc?: number | null;
  cadencia?: number | null;
  potencia_w?: number | null;
};

export type CardioTrackInput = {
  fuente?: string | null;
  distancia_total_m?: number | null;
  duracion_total_seg?: number | null;
  elevacion_positiva_m?: number | null;
  puntos: CardioTrackPointInput[];
};

export type CardioSportDetailInput =
  | { disciplina_codigo: "running"; running: CardioRunningInput; cycling?: never }
  | { disciplina_codigo: "cycling"; cycling: CardioCyclingInput; running?: never }
  | { disciplina_codigo: Exclude<CardioDisciplineCode, "running" | "cycling">; running?: never; cycling?: never };

export type CardioRoutineBlockInput = {
  tipo_bloque: string;
  distancia_objetivo_m?: number | null;
  duracion_objetivo_seg?: number | null;
  ritmo_objetivo_seg_km?: number | null;
  fc_objetivo?: number | null;
};

