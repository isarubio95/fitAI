import { chartColors } from "@/lib/chart-colors";

export type FormZoneKey = "muy-fatigado" | "fatigado" | "optimo" | "fresco" | "bajo";

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

/** Extremos de la escala visual: la forma se recorta aquí para posicionar el marcador. */
export const FORM_SCALE_MIN = -80;
export const FORM_SCALE_MAX = 45;

export const FORM_ZONES: readonly FormZone[] = [
  {
    key: "muy-fatigado",
    label: "Muy fatigado",
    min: FORM_SCALE_MIN,
    max: -30,
    color: chartColors.danger,
    hint: "Necesitas descanso: la fatiga domina con claridad.",
  },
  {
    key: "fatigado",
    label: "Fatigado",
    min: -30,
    max: -10,
    color: chartColors.fatigue,
    hint: "Carga productiva, pero sostenida en el tiempo pasa factura.",
  },
  {
    key: "optimo",
    label: "Óptimo",
    min: -10,
    max: 5,
    color: chartColors.positive,
    hint: "Equilibrio entre entrenar y recuperar.",
  },
  {
    key: "fresco",
    label: "Fresco",
    min: 5,
    max: 25,
    color: chartColors.fresh,
    hint: "Buen momento para rendir o competir.",
  },
  {
    key: "bajo",
    label: "Bajo",
    min: 25,
    max: FORM_SCALE_MAX,
    color: chartColors.neutral,
    hint: "Llevas tiempo sin carga: estás perdiendo fitness.",
  },
];

export function getFormZone(form: number): FormZone {
  return FORM_ZONES.find((zone) => form < zone.max) ?? FORM_ZONES[FORM_ZONES.length - 1];
}

/** Posición 0–100 del valor de forma dentro de la escala visual. */
export function formToScalePct(form: number): number {
  const clamped = Math.min(Math.max(form, FORM_SCALE_MIN), FORM_SCALE_MAX);
  return ((clamped - FORM_SCALE_MIN) / (FORM_SCALE_MAX - FORM_SCALE_MIN)) * 100;
}

export function zoneWidthPct(zone: FormZone): number {
  return ((zone.max - zone.min) / (FORM_SCALE_MAX - FORM_SCALE_MIN)) * 100;
}
