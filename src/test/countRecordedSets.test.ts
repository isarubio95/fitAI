import { describe, expect, it } from "vitest";
import { countRecordedSets } from "@/types/workout";

describe("countRecordedSets", () => {
  it("cuenta series con datos reales de trabajo", () => {
    expect(
      countRecordedSets([
        {
          sets: [
            { repeticiones: 0, peso_kg: 0 },
            { repeticiones: 8, peso_kg: 60 },
            { repeticiones: 0, peso_kg: 0, duracion_seg: 45 },
          ],
        },
      ]),
    ).toBe(2);
  });

  it("ignora series solo marcadas como completadas sin datos", () => {
    expect(
      countRecordedSets([
        {
          sets: [{ repeticiones: 0, peso_kg: 0, completed: true }],
        },
      ]),
    ).toBe(0);
  });

  it("cuenta series a peso corporal (reps sin carga externa)", () => {
    expect(countRecordedSets([{ sets: [{ repeticiones: 20, peso_kg: 0 }] }])).toBe(1);
  });

  it("devuelve 0 si no hay series válidas", () => {
    expect(countRecordedSets([{ sets: [{ repeticiones: 0, peso_kg: 0 }] }])).toBe(0);
    expect(countRecordedSets([])).toBe(0);
  });
});
