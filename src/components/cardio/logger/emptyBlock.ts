import type { CardioBlockInput } from "@/types/cardio";

export function emptyBlock(): CardioBlockInput {
  return {
    tipo_bloque: "work",
    distancia_m: null,
    duracion_seg: null,
    elevacion_m: null,
    fc_media: null,
    fc_max: null,
    calorias: null,
  };
}
