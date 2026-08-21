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
  hint: string;
}

export { FORM_SCALE_MIN, FORM_SCALE_MAX };

const ZONE_HINTS: Record<FormZoneKey, string> = {
  "muy-fatigado": "Necesitas descanso: la fatiga domina con claridad.",
  fatigado: "Carga productiva, pero sostenida en el tiempo pasa factura.",
  optimo: "Equilibrio entre entrenar y recuperar.",
  fresco: "Buen momento para rendir o competir.",
  bajo: "Llevas tiempo sin carga: estás perdiendo fitness.",
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
  hint: ZONE_HINTS[zone.key],
}));

export function getFormZone(form: number): FormZone {
  const def = getFormZoneDef(form);
  return FORM_ZONES.find((zone) => zone.key === def.key) ?? FORM_ZONES[FORM_ZONES.length - 1];
}

/**
 * Posición 0–100 del valor de forma en la escala visual.
 * Cada zona ocupa el mismo ancho; el marcador se interpola dentro de su zona.
 */
export function formToScalePct(form: number): number {
  const clamped = Math.min(Math.max(form, FORM_SCALE_MIN), FORM_SCALE_MAX);
  const zone = getFormZone(clamped);
  const index = FORM_ZONES.findIndex((z) => z.key === zone.key);
  const span = zone.max - zone.min;
  const progress = span <= 0 ? 0 : (clamped - zone.min) / span;
  return ((index + progress) / FORM_ZONES.length) * 100;
}
