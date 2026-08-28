/** Fórmulas de XP por sesión. Puras: sin I/O. */

export const SESSION_BASE_XP = 100;
export const XP_PER_SET = 5;
export const XP_PER_CARDIO_MINUTE = 2;
export const STREAK_BONUS_PER_WEEK = 20;
/** Tope de base + volumen. El bonus de racha va aparte. */
export const SESSION_XP_CAP = 250;
/** Por debajo, el cardio no da XP (sí puede contar para racha). */
export const MIN_CARDIO_DURATION_SEC = 8 * 60;

export type SessionXpParts = {
  base: number;
  series: number;
  streakBonus: number;
  total: number;
  volumeLabel: "Volumen" | "Duración";
};

export function streakBonusXp(streakWeeks: number): number {
  return Math.max(0, (Math.floor(streakWeeks) - 1) * STREAK_BONUS_PER_WEEK);
}

function capBaseAndVolume(base: number, volume: number): { base: number; volume: number } {
  const raw = base + volume;
  if (raw <= SESSION_XP_CAP) return { base, volume };
  return { base, volume: Math.max(0, SESSION_XP_CAP - base) };
}

function withStreak(
  base: number,
  volume: number,
  streakWeeks: number,
  volumeLabel: SessionXpParts["volumeLabel"],
): SessionXpParts {
  const capped = capBaseAndVolume(base, volume);
  const streakBonus = streakBonusXp(streakWeeks);
  return {
    base: capped.base,
    series: capped.volume,
    streakBonus,
    total: capped.base + capped.volume + streakBonus,
    volumeLabel,
  };
}

export function calculateStrengthSessionXp(completedSets: number, streakWeeks: number): SessionXpParts {
  const sets = Math.max(0, Math.floor(completedSets));
  return withStreak(SESSION_BASE_XP, sets * XP_PER_SET, streakWeeks, "Volumen");
}

export function calculateCardioSessionXp(durationSec: number, streakWeeks: number): SessionXpParts {
  const sec = Number.isFinite(durationSec) ? Math.max(0, durationSec) : 0;
  if (sec < MIN_CARDIO_DURATION_SEC) {
    return { base: 0, series: 0, streakBonus: 0, total: 0, volumeLabel: "Duración" };
  }
  const durationMin = Math.floor(sec / 60);
  return withStreak(SESSION_BASE_XP, durationMin * XP_PER_CARDIO_MINUTE, streakWeeks, "Duración");
}

/** Misma precedencia que `computeCardioSessionMetrics`. */
export function resolveCardioDurationSec(opts: {
  blockDurationsSec?: Array<number | null | undefined>;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  trackDurationSec?: number | null;
}): number {
  let fromBlocks = 0;
  for (const d of opts.blockDurationsSec ?? []) {
    if (d != null && Number.isFinite(d) && d > 0) fromBlocks += d;
  }
  if (fromBlocks > 0) return fromBlocks;

  if (opts.fechaInicio && opts.fechaFin) {
    const ms = new Date(opts.fechaFin).getTime() - new Date(opts.fechaInicio).getTime();
    if (Number.isFinite(ms) && ms > 0) return Math.round(ms / 1000);
  }

  const track = opts.trackDurationSec;
  if (track != null && Number.isFinite(track) && track > 0) return track;
  return 0;
}
