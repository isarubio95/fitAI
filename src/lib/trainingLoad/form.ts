/** Extremos de la escala visual: la forma se recorta aquí para posicionar el marcador. */
export const FORM_SCALE_MIN = -80;
export const FORM_SCALE_MAX = 45;

export type FormZoneKey = "muy-fatigado" | "fatigado" | "optimo" | "fresco" | "bajo";
export type FormLabel = "Agotado" | "Fatigado" | "Óptimo" | "Fresco" | "Inactivo";

export type FormZoneBound = {
  key: FormZoneKey;
  label: FormLabel;
  /** Límite inferior incluido, en puntos de forma. */
  min: number;
  /** Límite superior excluido. */
  max: number;
};

/** Zonas TSB (Coggan / TrainingPeaks): < -30 agotado, -30 a -10 fatigado, -10 a +5 óptimo, +5 a +25 fresco, >= +25 inactivo. */
export const FORM_ZONE_BOUNDS: readonly FormZoneBound[] = [
  { key: "muy-fatigado", label: "Agotado", min: FORM_SCALE_MIN, max: -30 },
  { key: "fatigado", label: "Fatigado", min: -30, max: -10 },
  { key: "optimo", label: "Óptimo", min: -10, max: 5 },
  { key: "fresco", label: "Fresco", min: 5, max: 25 },
  { key: "bajo", label: "Inactivo", min: 25, max: FORM_SCALE_MAX },
];

export function getFormZoneDef(form: number): FormZoneBound {
  return FORM_ZONE_BOUNDS.find((zone) => form < zone.max) ?? FORM_ZONE_BOUNDS[FORM_ZONE_BOUNDS.length - 1];
}

export function getFormLabel(form: number): FormLabel {
  return getFormZoneDef(form).label;
}

export function getFormClass(form: number): string {
  switch (getFormZoneDef(form).key) {
    case "muy-fatigado":
      return "text-red-500";
    case "fatigado":
      return "text-amber-500";
    case "optimo":
      return "text-emerald-500";
    case "fresco":
      return "text-sky-500";
    default:
      return "text-muted-foreground";
  }
}
