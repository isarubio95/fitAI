import { describe, expect, it } from "vitest";
import {
  SESSION_XP_CAP,
  calculateCardioSessionXp,
  calculateStrengthSessionXp,
  resolveCardioDurationSec,
  streakBonusXp,
} from "@/lib/sessionXp";

describe("sessionXp", () => {
  it("bonus de racha: 0 en la 1.ª semana, 20 desde la 2.ª", () => {
    expect(streakBonusXp(0)).toBe(0);
    expect(streakBonusXp(1)).toBe(0);
    expect(streakBonusXp(2)).toBe(20);
    expect(streakBonusXp(3)).toBe(40);
  });

  it("gym: 100 base + 5 por serie", () => {
    expect(calculateStrengthSessionXp(20, 1)).toEqual({
      base: 100,
      series: 100,
      streakBonus: 0,
      total: 200,
      volumeLabel: "Volumen",
    });
  });

  it("gym: tope 250 en base+volumen; la racha va aparte", () => {
    const capped = calculateStrengthSessionXp(50, 3);
    expect(capped.base + capped.series).toBe(SESSION_XP_CAP);
    expect(capped.streakBonus).toBe(40);
    expect(capped.total).toBe(SESSION_XP_CAP + 40);
  });

  it("cardio: 45 min ≈ 190 XP", () => {
    expect(calculateCardioSessionXp(45 * 60, 1)).toEqual({
      base: 100,
      series: 90,
      streakBonus: 0,
      total: 190,
      volumeLabel: "Duración",
    });
  });

  it("cardio: menos de 8 min no da XP", () => {
    expect(calculateCardioSessionXp(7 * 60 + 59, 4)).toEqual({
      base: 0,
      series: 0,
      streakBonus: 0,
      total: 0,
      volumeLabel: "Duración",
    });
    expect(calculateCardioSessionXp(8 * 60, 1).total).toBe(116);
  });

  it("cardio: tope 250 en una salida larga", () => {
    const longRide = calculateCardioSessionXp(2 * 3600, 1);
    expect(longRide.base + longRide.series).toBe(SESSION_XP_CAP);
    expect(longRide.total).toBe(SESSION_XP_CAP);
  });

  it("resuelve duración: bloques, si no fechas, si no track", () => {
    expect(
      resolveCardioDurationSec({
        blockDurationsSec: [600, 120],
        fechaInicio: "2026-08-01T10:00:00.000Z",
        fechaFin: "2026-08-01T12:00:00.000Z",
        trackDurationSec: 999,
      }),
    ).toBe(720);

    expect(
      resolveCardioDurationSec({
        blockDurationsSec: [0, null],
        fechaInicio: "2026-08-01T10:00:00.000Z",
        fechaFin: "2026-08-01T10:10:00.000Z",
      }),
    ).toBe(600);

    expect(
      resolveCardioDurationSec({
        trackDurationSec: 321,
      }),
    ).toBe(321);
  });
});
