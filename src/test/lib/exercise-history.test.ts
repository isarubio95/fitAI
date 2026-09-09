import { describe, expect, it } from "vitest";
import {
  barWidthPct,
  dayScore,
  deriveScoreUnit,
  filterDaysByPeriod,
  formatScore,
  formatSetLine,
  formatVolumeValue,
  groupSetsByDay,
  monthsForPeriod,
  peakDay,
  scoreMetricLabel,
  sortDays,
  withScoredWork,
  type ExerciseHistorySet,
} from "@/lib/exerciseHistory";
import type { TipoSerie } from "@/lib/setTypes";

function mkSet(
  day: string,
  numeroSerie: number,
  pesoKg: number,
  repeticiones: number,
  tipoSerie: TipoSerie = "efectiva",
): ExerciseHistorySet {
  return {
    day,
    actividadId: `act-${day}`,
    actividadTitulo: "Empuje",
    numeroSerie,
    pesoKg,
    repeticiones,
    tipoSerie,
    rir: null,
    duracionSeg: null,
  };
}

describe("deriveScoreUnit", () => {
  it("usa 1rm si alguna serie efectiva lleva carga", () => {
    expect(deriveScoreUnit([mkSet("2026-03-01", 1, 0, 10), mkSet("2026-03-01", 2, 60, 5)])).toBe(
      "1rm",
    );
  });

  it("usa reps si todo el trabajo efectivo es a peso corporal", () => {
    expect(deriveScoreUnit([mkSet("2026-03-01", 1, 0, 10), mkSet("2026-03-01", 2, 0, 8)])).toBe(
      "reps",
    );
  });

  it("ignora los calentamientos al decidir la unidad", () => {
    // El calentamiento con carga no debe convertir un ejercicio a peso
    // corporal en un ejercicio de 1RM.
    const sets = [
      mkSet("2026-03-01", 1, 20, 10, "calentamiento"),
      mkSet("2026-03-01", 2, 0, 12),
    ];
    expect(deriveScoreUnit(sets)).toBe("reps");
  });

  it("cae a 1rm cuando no hay trabajo efectivo", () => {
    expect(deriveScoreUnit([mkSet("2026-03-01", 1, 40, 10, "calentamiento")])).toBe("1rm");
  });
});

describe("groupSetsByDay", () => {
  const sets = [
    mkSet("2026-03-01", 1, 40, 10, "calentamiento"),
    mkSet("2026-03-01", 2, 80, 5),
    mkSet("2026-03-01", 3, 85, 4),
    mkSet("2026-03-08", 1, 90, 3),
  ];

  it("agrupa por día y ordena cronológicamente de más antiguo a más reciente", () => {
    const days = groupSetsByDay(sets);
    expect(days.map((d) => d.day)).toEqual(["2026-03-01", "2026-03-08"]);
  });

  it("conserva el calentamiento en las series visibles", () => {
    const [first] = groupSetsByDay(sets);
    expect(first.sets).toHaveLength(3);
    expect(first.sets[0].tipoSerie).toBe("calentamiento");
  });

  it("excluye el calentamiento del volumen y del recuento efectivo", () => {
    const [first] = groupSetsByDay(sets);
    expect(first.workingSets).toBe(2);
    expect(first.volume).toBe(80 * 5 + 85 * 4);
  });

  it("toma como mejor serie la de mayor 1RM Epley entre las efectivas", () => {
    const [first] = groupSetsByDay(sets);
    // 85×4 = 96.32 supera a 80×5 = 93.32.
    expect(first.best).toEqual({ value: 85 * (1 + 0.0333 * 4), pesoKg: 85, repeticiones: 4 });
  });

  it("un calentamiento muy cargado no puede ser el récord del día", () => {
    const days = groupSetsByDay([
      mkSet("2026-03-01", 1, 200, 5, "calentamiento"),
      mkSet("2026-03-01", 2, 80, 5),
    ]);
    expect(days[0].best?.pesoKg).toBe(80);
  });

  it("a peso corporal el volumen es la suma de reps", () => {
    const days = groupSetsByDay([mkSet("2026-03-01", 1, 0, 12), mkSet("2026-03-01", 2, 0, 10)]);
    expect(days[0].volume).toBe(22);
    expect(days[0].best).toEqual({ value: 12, pesoKg: 0, repeticiones: 12 });
  });

  it("en un ejercicio con carga, una serie sin peso no gana a una cargada", () => {
    // `estimateSetProgress` puntúa la serie sin peso en reps, otra escala.
    const days = groupSetsByDay([mkSet("2026-03-01", 1, 0, 30), mkSet("2026-03-01", 2, 60, 5)]);
    expect(days[0].best?.pesoKg).toBe(60);
  });

  it("cuenta como trabajo el dropset y el amrap", () => {
    const days = groupSetsByDay([
      mkSet("2026-03-01", 1, 60, 8, "dropset"),
      mkSet("2026-03-01", 2, 40, 15, "amrap"),
    ]);
    expect(days[0].workingSets).toBe(2);
    expect(days[0].volume).toBe(60 * 8 + 40 * 15);
  });
});

describe("withScoredWork", () => {
  it("descarta los días que solo tienen calentamiento", () => {
    const days = groupSetsByDay([
      mkSet("2026-03-01", 1, 40, 10, "calentamiento"),
      mkSet("2026-03-08", 1, 80, 5),
    ]);
    expect(withScoredWork(days).map((d) => d.day)).toEqual(["2026-03-08"]);
  });
});

describe("sortDays", () => {
  const days = groupSetsByDay([
    mkSet("2026-01-10", 1, 100, 3), // 1RM alto, fecha antigua
    mkSet("2026-02-10", 1, 70, 5),
    mkSet("2026-03-10", 1, 80, 5),
  ]);

  it("por fecha deja la sesión más reciente arriba", () => {
    expect(sortDays(days, "date", "1rm").map((d) => d.day)).toEqual([
      "2026-03-10",
      "2026-02-10",
      "2026-01-10",
    ]);
  });

  it("por puntuación ordena de mayor a menor", () => {
    expect(sortDays(days, "score", "1rm").map((d) => d.day)).toEqual([
      "2026-01-10",
      "2026-03-10",
      "2026-02-10",
    ]);
  });

  it("por puntuación respeta la métrica elegida", () => {
    const byVolume = groupSetsByDay([
      mkSet("2026-01-10", 1, 100, 1), // 1RM alto, volumen bajo
      mkSet("2026-02-10", 1, 50, 20), // 1RM bajo, volumen alto
    ]);
    expect(sortDays(byVolume, "score", "volume").map((d) => d.day)).toEqual([
      "2026-02-10",
      "2026-01-10",
    ]);
    expect(sortDays(byVolume, "score", "1rm").map((d) => d.day)).toEqual([
      "2026-01-10",
      "2026-02-10",
    ]);
  });

  it("desempata por fecha, para que el orden sea estable", () => {
    const tied = groupSetsByDay([mkSet("2026-01-10", 1, 80, 5), mkSet("2026-03-10", 1, 80, 5)]);
    expect(sortDays(tied, "score", "1rm").map((d) => d.day)).toEqual(["2026-03-10", "2026-01-10"]);
  });

  it("no muta el array recibido", () => {
    const original = [...days];
    sortDays(days, "score", "1rm");
    expect(days).toEqual(original);
  });
});

describe("filterDaysByPeriod", () => {
  const now = new Date("2026-03-15T10:00:00Z");
  const days = groupSetsByDay([
    mkSet("2026-03-10", 1, 80, 5),
    mkSet("2026-01-20", 1, 80, 5),
    mkSet("2025-06-01", 1, 80, 5),
  ]);

  it("recorta a un mes", () => {
    expect(filterDaysByPeriod(days, 1, now).map((d) => d.day)).toEqual(["2026-03-10"]);
  });

  it("recorta a tres meses", () => {
    expect(filterDaysByPeriod(days, 3, now).map((d) => d.day)).toEqual([
      "2026-01-20",
      "2026-03-10",
    ]);
  });

  it("a doce meses mantiene todo lo del último año", () => {
    expect(filterDaysByPeriod(days, 12, now)).toHaveLength(3);
  });
});

describe("monthsForPeriod", () => {
  it("traduce las claves del filtro", () => {
    expect(monthsForPeriod("1m")).toBe(1);
    expect(monthsForPeriod("12m")).toBe(12);
  });
});

describe("dayScore y peakDay", () => {
  const days = groupSetsByDay([
    mkSet("2026-01-10", 1, 100, 3),
    mkSet("2026-03-10", 1, 80, 5),
  ]);

  it("dayScore devuelve el 1RM o el volumen según la métrica", () => {
    expect(dayScore(days[1], "volume")).toBe(80 * 5);
    expect(dayScore(days[1], "1rm")).toBeCloseTo(80 * (1 + 0.0333 * 5), 5);
  });

  it("peakDay encuentra el mejor del tramo", () => {
    expect(peakDay(days, "1rm")?.day).toBe("2026-01-10");
    expect(peakDay(days, "volume")?.day).toBe("2026-03-10");
  });

  it("peakDay es null si no hay nada que puntuar", () => {
    expect(peakDay([], "1rm")).toBeNull();
  });
});

describe("barWidthPct", () => {
  it("es proporcional al máximo", () => {
    expect(barWidthPct(50, 100)).toBe(50);
    expect(barWidthPct(100, 100)).toBe(100);
  });

  it("garantiza un mínimo visible", () => {
    expect(barWidthPct(0.1, 1000)).toBe(2);
  });

  it("no se pasa de 100 ni rompe con un máximo inválido", () => {
    expect(barWidthPct(200, 100)).toBe(100);
    expect(barWidthPct(10, 0)).toBe(0);
    expect(barWidthPct(Number.NaN, 100)).toBe(0);
  });
});

describe("formateo", () => {
  it("formatVolumeValue pasa a toneladas a partir de 1000 kg", () => {
    expect(formatVolumeValue(940)).toBe("940 kg");
    expect(formatVolumeValue(4250)).toBe("4.3 t");
  });

  it("formatScore usa la unidad de las cuatro combinaciones", () => {
    expect(formatScore(102.4, "1rm", "1rm")).toBe("102 kg");
    expect(formatScore(4250, "volume", "1rm")).toBe("4.3 t");
    expect(formatScore(12, "1rm", "reps")).toBe("12 reps");
    expect(formatScore(48, "volume", "reps")).toBe("48 reps");
  });

  it("scoreMetricLabel nombra la métrica según el tipo de ejercicio", () => {
    expect(scoreMetricLabel("1rm", "1rm")).toBe("1RM");
    expect(scoreMetricLabel("1rm", "reps")).toBe("Máx. reps");
    expect(scoreMetricLabel("volume", "1rm")).toBe("Volumen");
    expect(scoreMetricLabel("volume", "reps")).toBe("Reps totales");
  });

  it("formatSetLine describe la serie tal y como se registró", () => {
    expect(formatSetLine(mkSet("2026-03-01", 1, 82.5, 5))).toBe("82.5 kg × 5");
    expect(formatSetLine(mkSet("2026-03-01", 1, 80, 5))).toBe("80 kg × 5");
    expect(formatSetLine(mkSet("2026-03-01", 1, 0, 12))).toBe("12 reps");
    expect(
      formatSetLine({ ...mkSet("2026-03-01", 1, 0, 0), duracionSeg: 45 }),
    ).toBe("45s");
    expect(formatSetLine(mkSet("2026-03-01", 1, 0, 0))).toBe("—");
  });
});

describe("series en blanco", () => {
  it("no cuentan como trabajo, así una sesión sin rellenar no deja barra a cero", () => {
    const days = groupSetsByDay([mkSet("2026-03-01", 1, 0, 0), mkSet("2026-03-01", 2, 0, 0)]);
    expect(days[0].workingSets).toBe(0);
    expect(days[0].volume).toBe(0);
    expect(withScoredWork(days)).toHaveLength(0);
  });

  it("una serie por tiempo sí cuenta aunque no tenga reps", () => {
    const days = groupSetsByDay([{ ...mkSet("2026-03-01", 1, 0, 0), duracionSeg: 45 }]);
    expect(days[0].workingSets).toBe(1);
    expect(withScoredWork(days)).toHaveLength(1);
  });

  it("no arrastran la unidad a reps en un ejercicio con carga", () => {
    expect(deriveScoreUnit([mkSet("2026-03-01", 1, 0, 0), mkSet("2026-03-01", 2, 80, 5)])).toBe(
      "1rm",
    );
  });
});
