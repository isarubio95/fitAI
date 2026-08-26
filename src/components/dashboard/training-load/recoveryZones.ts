import { chartColors } from "@/lib/chart-colors";
import {
  RECOVERY_ZONE_BOUNDS,
  formatRecoveryDays,
  getRecoveryZoneDef,
  type RecoveryZoneKey,
} from "@/lib/trainingLoad";

export type { RecoveryZoneKey };

export interface RecoveryZone {
  key: RecoveryZoneKey;
  label: string;
  min: number;
  max: number;
  color: string;
}

const ZONE_COLORS: Record<RecoveryZoneKey, string> = {
  listo: chartColors.positive,
  casi: chartColors.fresh,
  recuperando: chartColors.fatigue,
  cargado: chartColors.danger,
};

export const RECOVERY_ZONES: readonly RecoveryZone[] = RECOVERY_ZONE_BOUNDS.map((zone) => ({
  ...zone,
  color: ZONE_COLORS[zone.key],
}));

export function getRecoveryZone(days: number): RecoveryZone {
  const def = getRecoveryZoneDef(days);
  return RECOVERY_ZONES.find((zone) => zone.key === def.key) ?? RECOVERY_ZONES[0];
}

export function getRecoveryAdvice(days: number, group: string | null): string {
  const zone = getRecoveryZone(days);
  switch (zone.key) {
    case "listo":
      return "Ningún grupo limita el entrenamiento de hoy.";
    case "casi":
      return group ? `${group} estará listo mañana.` : "Casi recuperado.";
    case "recuperando":
      return group ? `${group} necesita un par de días más.` : "Todavía recuperando.";
    case "cargado":
      return group ? `${group} sigue muy cargado; mejor otro grupo.` : "Hay grupos muy cargados.";
  }
}

export { formatRecoveryDays };
