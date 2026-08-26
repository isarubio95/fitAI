import { LOCAL_MUSCLE_TIME_CONSTANT_DAYS } from "./constants";

/** Extremo visual de la escala: a partir de aquí el anillo se queda en Cargado. */
export const RECOVERY_SCALE_MIN = 0;
export const RECOVERY_SCALE_MAX = 8;

export type RecoveryZoneKey = "listo" | "casi" | "recuperando" | "cargado";
export type RecoveryLabel = "Listo" | "Casi" | "Recuperando" | "Cargado";

export type RecoveryZoneBound = {
  key: RecoveryZoneKey;
  label: RecoveryLabel;
  /** Límite inferior incluido, en días a baseline. */
  min: number;
  /** Límite superior excluido. */
  max: number;
};

/**
 * Días estimados a baseline del grupo más fatigado.
 * 0 listo, 1 casi, 2–3 recuperando, 4+ cargado.
 */
export const RECOVERY_ZONE_BOUNDS: readonly RecoveryZoneBound[] = [
  { key: "listo", label: "Listo", min: 0, max: 1 },
  { key: "casi", label: "Casi", min: 1, max: 2 },
  { key: "recuperando", label: "Recuperando", min: 2, max: 4 },
  { key: "cargado", label: "Cargado", min: 4, max: RECOVERY_SCALE_MAX },
];

export function getRecoveryZoneDef(days: number): RecoveryZoneBound {
  const clamped = Math.max(RECOVERY_SCALE_MIN, days);
  return (
    RECOVERY_ZONE_BOUNDS.find((zone) => clamped < zone.max) ??
    RECOVERY_ZONE_BOUNDS[RECOVERY_ZONE_BOUNDS.length - 1]
  );
}

export function formatRecoveryDays(days: number): string {
  return `${Math.max(0, Math.round(days))}d`;
}

export type MuscleRecoverySnapshot = {
  group: string | null;
  days: number;
  fatigue: number;
};

/**
 * El anillo lo mueve el grupo con más días a baseline.
 * Si todos están en 0, no hay cuello de botella.
 */
export function pickMuscleRecoveryBottleneck(
  daysToBaseline: Record<string, number>,
  groupFatigue: Record<string, number> = {},
): MuscleRecoverySnapshot {
  let best: MuscleRecoverySnapshot | null = null;

  for (const [group, rawDays] of Object.entries(daysToBaseline)) {
    const days = Math.max(0, Math.round(Number(rawDays) || 0));
    const fatigue = Number(groupFatigue[group]) || 0;
    if (!best) {
      best = { group, days, fatigue };
      continue;
    }
    if (days > best.days) {
      best = { group, days, fatigue };
      continue;
    }
    if (days === best.days && fatigue > best.fatigue) {
      best = { group, days, fatigue };
      continue;
    }
    if (days === best.days && fatigue === best.fatigue && group < (best.group ?? "")) {
      best = { group, days, fatigue };
    }
  }

  if (!best || best.days <= 0) {
    return { group: null, days: 0, fatigue: best?.fatigue ?? 0 };
  }
  return best;
}

export type MuscleRecoveryRow = {
  group: string;
  /** Fatiga local actual del grupo. */
  fatigue: number;
  /** Días estimados a baseline, redondeados. */
  days: number;
  zone: RecoveryZoneBound;
  /** Último día entrenado (`yyyy-MM-dd`) o null si no hay registro en la ventana. */
  lastTrainedAt: string | null;
};

/**
 * Todos los grupos ordenados por cuánto queda por recuperar: más días primero,
 * luego más fatiga, luego alfabético. Los grupos sin datos entran como Listo,
 * que es justo lo que necesita la columna de músculos frescos.
 */
export function rankGroupsByRecovery(
  groups: readonly string[],
  groupFatigue: Record<string, number>,
  daysToBaseline: Record<string, number>,
  lastTrainedAt: Record<string, string | null> = {},
): MuscleRecoveryRow[] {
  return groups
    .map((group) => {
      const days = Math.max(0, Math.round(Number(daysToBaseline[group]) || 0));
      return {
        group,
        fatigue: Math.max(0, Number(groupFatigue[group]) || 0),
        days,
        zone: getRecoveryZoneDef(days),
        lastTrainedAt: lastTrainedAt[group] ?? null,
      };
    })
    .sort((a, b) => {
      if (b.days !== a.days) return b.days - a.days;
      if (b.fatigue !== a.fatigue) return b.fatigue - a.fatigue;
      return a.group.localeCompare(b.group, "es");
    });
}

/** Fatiga estimada dentro de `daysAhead` días con el mismo decay que el modelo local. */
export function projectFatigue(
  current: number,
  daysAhead: number,
  tauDays: number = LOCAL_MUSCLE_TIME_CONSTANT_DAYS,
): number {
  if (!(current > 0) || tauDays <= 0) return 0;
  return current * Math.exp(-Math.max(0, daysAhead) / tauDays);
}
