import { describe, expect, it } from "vitest";
import {
  applyPlanPreset,
  buildSimplePlan,
  expandExerciseToSets,
  formatRepTarget,
  parseRepTarget,
  planFromRows,
  restForSet,
  routineExercisesToFormData,
  summarizeSeriesPlan,
  withSeriesPlan,
  type RoutineExerciseLike,
} from "@/lib/seriesPlan";
import { isWorkingSet, normalizeTipoSerie } from "@/lib/setTypes";
import type { RoutineExerciseFormData, RoutineSetPlan } from "@/types/routine";

const scalars = {
  series_objetivo: 3,
  repes_min: 8,
  repes_max: 12,
  rir: 1,
  descanso: 120,
  duracion_objetivo_seg: null,
  ritmo_objetivo_seg_km: null,
};

function planRow(orden: number, over: Partial<RoutineSetPlan> = {}): RoutineSetPlan {
  return {
    orden,
    tipo_serie: "efectiva",
    repes_min: 8,
    repes_max: 12,
    rir: 1,
    peso_objetivo_kg: null,
    descanso: null,
    duracion_objetivo_seg: null,
    ritmo_objetivo_seg_km: null,
    ...over,
  };
}

describe("formatRepTarget / parseRepTarget", () => {
  it("formatea rangos, valores únicos y rangos abiertos", () => {
    expect(formatRepTarget(8, 12)).toBe("8-12");
    expect(formatRepTarget(10, 10)).toBe("10");
    expect(formatRepTarget(8, null)).toBe("8+");
    expect(formatRepTarget(null, null)).toBe("—");
  });

  it("parsea las tres formas", () => {
    expect(parseRepTarget("8-12")).toEqual({ min: 8, max: 12 });
    expect(parseRepTarget("6 - 10")).toEqual({ min: 6, max: 10 });
    expect(parseRepTarget("8+")).toEqual({ min: 8, max: null });
    expect(parseRepTarget("10")).toEqual({ min: 10, max: 10 });
  });

  it("devuelve null cuando no hay número", () => {
    expect(parseRepTarget("Tiempo")).toBeNull();
    expect(parseRepTarget(undefined)).toBeNull();
  });

  it("hace ida y vuelta sin perder información", () => {
    for (const label of ["8-12", "10", "8+"]) {
      const parsed = parseRepTarget(label)!;
      expect(formatRepTarget(parsed.min, parsed.max)).toBe(label);
    }
  });
});

describe("buildSimplePlan", () => {
  it("materializa el modo simple sin cambiar el objetivo", () => {
    const plan = buildSimplePlan(scalars);
    expect(plan).toHaveLength(3);
    expect(plan.every((s) => s.repes_min === 8 && s.repes_max === 12 && s.rir === 1)).toBe(true);
    expect(plan.every((s) => s.tipo_serie === "efectiva")).toBe(true);
    expect(plan.map((s) => s.orden)).toEqual([0, 1, 2]);
  });

  it("nunca genera menos de una serie", () => {
    expect(buildSimplePlan({ ...scalars, series_objetivo: 0 })).toHaveLength(1);
  });
});

describe("summarizeSeriesPlan", () => {
  it("resume una pirámide al rango que la cubre", () => {
    const plan = [
      planRow(0, { repes_min: 12, repes_max: 12, rir: 3 }),
      planRow(1, { repes_min: 10, repes_max: 10, rir: 2 }),
      planRow(2, { repes_min: 8, repes_max: 8, rir: 0 }),
    ];
    const summary = summarizeSeriesPlan(plan, scalars);

    expect(summary.series_objetivo).toBe(3);
    expect(summary.repes_min).toBe(8);
    expect(summary.repes_max).toBe(12);
    // El RIR resumen es el de la serie más exigente.
    expect(summary.rir).toBe(0);
  });

  it("ignora el calentamiento al resumir el rango", () => {
    const plan = [
      planRow(0, { tipo_serie: "calentamiento", repes_min: 20, repes_max: 20, rir: 5 }),
      planRow(1, { repes_min: 8, repes_max: 10, rir: 1 }),
    ];
    const summary = summarizeSeriesPlan(plan, scalars);

    expect(summary.repes_max).toBe(10);
    expect(summary.rir).toBe(1);
    // Pero sí cuenta como serie a ejecutar.
    expect(summary.series_objetivo).toBe(2);
  });

  it("un rango abierto no infla el máximo", () => {
    const plan = [planRow(0, { repes_min: 8, repes_max: null })];
    expect(summarizeSeriesPlan(plan, scalars).repes_max).toBe(8);
  });

  it("con plan vacío devuelve los escalares tal cual", () => {
    expect(summarizeSeriesPlan([], scalars)).toEqual(scalars);
  });
});

describe("withSeriesPlan", () => {
  const exercise: RoutineExerciseFormData = {
    ...scalars,
    nombre: "Press banca",
    orden: 0,
    registro_series: "peso_reps",
    series_plan: null,
  };

  it("sincroniza los escalares al aplicar el plan", () => {
    const next = withSeriesPlan(exercise, [
      planRow(0, { repes_min: 12, repes_max: 12 }),
      planRow(1, { repes_min: 6, repes_max: 6 }),
    ]);

    expect(next.series_objetivo).toBe(2);
    expect(next.repes_min).toBe(6);
    expect(next.repes_max).toBe(12);
    expect(next.series_plan).toHaveLength(2);
  });

  it("volver al modo simple conserva los escalares", () => {
    const advanced = withSeriesPlan(exercise, [planRow(0), planRow(1)]);
    const simple = withSeriesPlan(advanced, null);

    expect(simple.series_plan).toBeNull();
    expect(simple.series_objetivo).toBe(2);
  });

  it("reindexa el orden tras borrar una serie", () => {
    const advanced = withSeriesPlan(exercise, [planRow(0), planRow(1), planRow(2)]);
    const removed = withSeriesPlan(
      advanced,
      advanced.series_plan!.filter((_, i) => i !== 1),
    );
    expect(removed.series_plan!.map((s) => s.orden)).toEqual([0, 1]);
  });
});

describe("presets", () => {
  it("la pirámide descendente baja reps y RIR serie a serie", () => {
    const plan = applyPlanPreset("piramidal_desc", buildSimplePlan(scalars), scalars);

    expect(plan.map((s) => s.repes_min)).toEqual([8, 6, 4]);
    expect(plan.map((s) => s.repes_max)).toEqual([12, 10, 8]);
    expect(plan.map((s) => s.rir)).toEqual([1, 0, 0]);
  });

  it("la pirámide ascendente empieza pesada y termina en el rango base", () => {
    const plan = applyPlanPreset("piramidal_asc", buildSimplePlan(scalars), scalars);

    expect(plan.map((s) => s.repes_min)).toEqual([4, 6, 8]);
    expect(plan[plan.length - 1].repes_max).toBe(12);
  });

  it("añadir calentamiento antepone una serie que no cuenta como volumen", () => {
    const plan = applyPlanPreset("con_calentamiento", buildSimplePlan(scalars), scalars);

    expect(plan).toHaveLength(4);
    expect(plan[0].tipo_serie).toBe("calentamiento");
    expect(isWorkingSet(plan[0].tipo_serie)).toBe(false);
    expect(plan.map((s) => s.orden)).toEqual([0, 1, 2, 3]);
  });

  it("no duplica el calentamiento si ya existe", () => {
    const once = applyPlanPreset("con_calentamiento", buildSimplePlan(scalars), scalars);
    const twice = applyPlanPreset("con_calentamiento", once, scalars);
    expect(twice).toHaveLength(once.length);
  });

  it("el dropset final se encadena sin descanso", () => {
    const plan = applyPlanPreset("dropset_final", buildSimplePlan(scalars), scalars);
    const last = plan[plan.length - 1];

    expect(last.tipo_serie).toBe("dropset");
    expect(last.descanso).toBe(0);
    // Un dropset sí es trabajo efectivo.
    expect(isWorkingSet(last.tipo_serie)).toBe(true);
  });

  it("recta iguala todas las series manteniendo los tipos", () => {
    const conWarmup = applyPlanPreset("con_calentamiento", buildSimplePlan(scalars), scalars);
    const recta = applyPlanPreset("recta", conWarmup, scalars);

    expect(recta[0].tipo_serie).toBe("calentamiento");
    expect(new Set(recta.map((s) => s.repes_min)).size).toBe(1);
  });
});

describe("expandExerciseToSets", () => {
  const base: RoutineExerciseLike = {
    ...scalars,
    tipo_ejercicio: { nombre: "Press banca", grupo_muscular: "pecho" },
    registro_series: "peso_reps",
    orden: 0,
  };

  it("modo simple: N series con el objetivo del ejercicio", () => {
    const sets = expandExerciseToSets(base);

    expect(sets).toHaveLength(3);
    expect(sets.every((s) => s.objetivo_repes_min === 8 && s.objetivo_repes_max === 12)).toBe(true);
    expect(sets.every((s) => normalizeTipoSerie(s.tipo_serie) === "efectiva")).toBe(true);
  });

  it("con plan: cada serie arrastra su propio objetivo", () => {
    const sets = expandExerciseToSets({
      ...base,
      rutina_ejercicio_serie: [
        {
          id: "s2",
          rutina_ejercicio_id: "ej",
          created_at: "",
          orden: 1,
          tipo_serie: "efectiva",
          repes_min: 8,
          repes_max: 10,
          rir: 1,
          peso_objetivo_kg: 70,
          descanso: 180,
          duracion_objetivo_seg: null,
          ritmo_objetivo_seg_km: null,
        },
        {
          id: "s1",
          rutina_ejercicio_id: "ej",
          created_at: "",
          orden: 0,
          tipo_serie: "calentamiento",
          repes_min: 15,
          repes_max: 15,
          rir: 4,
          peso_objetivo_kg: 40,
          descanso: 60,
          duracion_objetivo_seg: null,
          ritmo_objetivo_seg_km: null,
        },
      ],
    });

    // Las filas llegan desordenadas y deben salir por `orden`.
    expect(sets).toHaveLength(2);
    expect(sets[0].tipo_serie).toBe("calentamiento");
    expect(sets[0].objetivo_peso_kg).toBe(40);
    expect(sets[0].descanso).toBe(60);
    expect(sets[1].objetivo_repes_max).toBe(10);
    expect(sets[1].descanso).toBe(180);
  });

  it("las series arrancan vacías, no rellenas con el objetivo", () => {
    const sets = expandExerciseToSets(base);
    expect(sets.every((s) => s.repeticiones === 0 && s.peso_kg === 0)).toBe(true);
  });
});

describe("routineExercisesToFormData", () => {
  it("ordena por `orden` y resuelve el nombre del ejercicio propio", () => {
    const exercises = routineExercisesToFormData([
      { ...scalars, orden: 1, usuario_ejercicio: { nombre: "Curl casero" } },
      { ...scalars, orden: 0, tipo_ejercicio: { nombre: "Press banca" } },
    ]);

    expect(exercises.map((e) => e.nombre)).toEqual(["Press banca", "Curl casero"]);
    expect(exercises[0].repRange).toBe("8-12");
    expect(exercises[0].descanso).toBe(120);
  });
});

describe("restForSet", () => {
  it("el descanso propio de la serie manda sobre el del ejercicio", () => {
    expect(restForSet({ descanso: 0 }, 120)).toBe(0);
    expect(restForSet({ descanso: 180 }, 120)).toBe(180);
  });

  it("sin descanso propio hereda el del ejercicio", () => {
    expect(restForSet({}, 90)).toBe(90);
    expect(restForSet({}, null)).toBe(120);
  });
});

describe("planFromRows", () => {
  it("sin filas devuelve null (modo simple)", () => {
    expect(planFromRows(null)).toBeNull();
    expect(planFromRows([])).toBeNull();
  });
});
