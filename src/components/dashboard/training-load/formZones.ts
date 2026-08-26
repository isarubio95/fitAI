import { chartColors } from "@/lib/chart-colors";
import {
  FORM_SCALE_MAX,
  FORM_SCALE_MIN,
  FORM_ZONE_BOUNDS,
  getFormZoneDef,
  type FormZoneKey,
} from "@/lib/trainingLoad";

export type { FormZoneKey };

export interface FormZone {
  key: FormZoneKey;
  label: string;
  /** Límite inferior incluido, en puntos de forma. */
  min: number;
  /** Límite superior excluido. */
  max: number;
  color: string;
  /** Qué hacer hoy con esta forma, en una frase. */
  advice: string;
}

export { FORM_SCALE_MIN, FORM_SCALE_MAX };

const ZONE_ADVICE: Record<FormZoneKey, string> = {
  "muy-fatigado": "Toca descargar: la fatiga domina con claridad.",
  fatigado: "Mejor una sesión suave o un día de descanso.",
  optimo: "Buena ventana para una sesión exigente.",
  fresco: "Estás fresco: buen día para rendir o competir.",
  bajo: "Llevas tiempo sin carga y estás perdiendo fitness.",
};

const ZONE_COLORS: Record<FormZoneKey, string> = {
  "muy-fatigado": chartColors.danger,
  fatigado: chartColors.fatigue,
  optimo: chartColors.positive,
  fresco: chartColors.fresh,
  bajo: chartColors.neutral,
};

export const FORM_ZONES: readonly FormZone[] = FORM_ZONE_BOUNDS.map((zone) => ({
  ...zone,
  color: ZONE_COLORS[zone.key],
  advice: ZONE_ADVICE[zone.key],
}));

export function getFormZone(form: number): FormZone {
  const def = getFormZoneDef(form);
  return FORM_ZONES.find((zone) => zone.key === def.key) ?? FORM_ZONES[FORM_ZONES.length - 1];
}
