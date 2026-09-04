import { describe, expect, it } from "vitest";
import {
  defaultSetForMode,
  formPatchFromLastSet,
  initialSetCountForRegistro,
  normalizeRegistroSeries,
  registroUsesDuration,
  registroUsesReps,
  registroUsesWeight,
  setIsUnlogged,
  type SetFormData,
} from "@/types/workout";
import { estimateRoutineDurationMinutes } from "@/lib/estimateRoutineDuration";
import { applyPlanPreset, buildSimplePlan } from "@/lib/seriesPlan";
import { suggestProgressiveOverload } from "@/lib/progressiveOverload";

function set(partial: Partial<SetFormData> = {}): SetFormData {
  return { repeticiones: 0, peso_kg: 0, duracion_seg: null, ritmo_seg_km: null, ...partial };
}

describe("normalizeRegistroSeries", () => {
  it("reconoce solo_reps", () => {
    expect(normalizeRegistroSeries("solo_reps")).toBe("solo_reps");
  });

  it("sigue cayendo a peso_reps con basura", () => {
    expect(normalizeRegistroSeries("inventado")).toBe("peso_reps");
    expect(normalizeRegistroSeries(null)).toBe("peso_reps");
  });
});

describe("predicados de modo", () => {
  it("solo peso_reps registra carga", () => {
    expect(registroUsesWeight("peso_reps")).toBe(true);
    expect(registroUsesWeight("solo_reps")).toBe(false);
    expect(registroUsesWeight("duracion")).toBe(false);
  });

  it("solo_reps cuenta repeticiones", () => {
    expect(registroUsesReps("solo_reps")).toBe(true);
    expect(registroUsesReps("peso_reps")).toBe(true);
    expect(registroUsesReps("duracion")).toBe(false);
    expect(registroUsesReps("duracion_ritmo")).toBe(false);
  });

  it("solo_reps no es un modo cronometrado", () => {
    expect(registroUsesDuration("solo_reps")).toBe(false);
    expect(registroUsesDuration("duracion")).toBe(true);
    expect(registroUsesDuration("duracion_ritmo")).toBe(true);
  });
});

describe("solo_reps en el formulario de series", () => {
  it("una serie con reps ya no esta vacia", () => {
    expect(setIsUnlogged(set(), "solo_reps")).toBe(true);
    expect(setIsUnlogged(set({ repeticiones: 5 }), "solo_reps")).toBe(false);
  });

  it("un peso suelto no cuenta como dato registrado", () => {
    // En peso_reps si cuenta; en solo_reps el peso no significa nada.
    expect(setIsUnlogged(set({ peso_kg: 20 }), "peso_reps")).toBe(false);
    expect(setIsUnlogged(set({ peso_kg: 20 }), "solo_reps")).toBe(true);
  });

  it("no arrastra el peso del ultimo registro", () => {
    const last = { peso_kg: 60, repeticiones: 5 };
    expect(formPatchFromLastSet("solo_reps", last)).toEqual({ repeticiones: 5, peso_kg: 0 });
    expect(formPatchFromLastSet("peso_reps", last)).toEqual({ repeticiones: 5, peso_kg: 60 });
  });

  it("arranca con varias series, como la fuerza", () => {
    expect(initialSetCountForRegistro("solo_reps")).toBe(3);
    expect(initialSetCountForRegistro("peso_reps")).toBe(3);
    expect(initialSetCountForRegistro("duracion")).toBe(1);
  });

  it("la serie por defecto no lleva duracion ni ritmo", () => {
    expect(defaultSetForMode("solo_reps")).toEqual(set());
  });
});

describe("duracion estimada", () => {
  const base = {
    series_objetivo: 4,
    descanso: 120,
    duracion_objetivo_seg: null,
    superset_id: null,
    orden: 0,
  };

  it("cuenta menos trabajo por serie que peso_reps", () => {
    const plio = estimateRoutineDurationMinutes([{ ...base, registro_series: "solo_reps" }]);
    const fuerza = estimateRoutineDurationMinutes([{ ...base, registro_series: "peso_reps" }]);
    expect(plio).not.toBeNull();
    expect(fuerza).not.toBeNull();
    expect(plio!).toBeLessThan(fuerza!);
  });
});

describe("preset de potencia", () => {
  const ej = {
    series_objetivo: 4,
    repes_min: 10,
    repes_max: 12,
    rir: 2,
    descanso: 90,
    duracion_objetivo_seg: null,
    ritmo_objetivo_seg_km: null,
  };

  it("acorta las series, sube el RIR y alarga el descanso", () => {
    const plan = applyPlanPreset("potencia", buildSimplePlan(ej), ej);
    expect(plan).toHaveLength(4);
    for (const s of plan) {
      expect(s.repes_min).toBe(3);
      expect(s.repes_max).toBe(5);
      expect(s.rir).toBe(5);
      expect(s.descanso).toBe(180);
    }
  });

  it("respeta el dropset, que vive de no descansar", () => {
    const conDrop = applyPlanPreset("dropset_final", buildSimplePlan(ej), ej);
    const plan = applyPlanPreset("potencia", conDrop, ej);
    const drop = plan.find((s) => s.tipo_serie === "dropset");
    expect(drop).toBeDefined();
    expect(drop!.descanso).toBe(0);
  });
});

describe("sobrecarga progresiva en solo_reps", () => {
  const target = { repesMin: 3, repesMax: 5, targetRir: 4 };
  const sets = [
    { peso_kg: 0, repeticiones: 5, rir: 4 },
    { peso_kg: 0, repeticiones: 5, rir: 4 },
  ];

  it("nunca sugiere subir peso", () => {
    const r = suggestProgressiveOverload({ lastSets: sets, target, mode: "solo_reps" });
    expect(r).not.toBeNull();
    expect(r!.action).not.toBe("increase_weight");
    expect(r!.suggestedWeight).toBe(0);
  });

  it("al tocar el techo del rango propone una repeticion mas", () => {
    const r = suggestProgressiveOverload({ lastSets: sets, target, mode: "solo_reps" });
    expect(r!.action).toBe("increase_reps");
    expect(r!.suggestedReps).toBe(6);
    expect(r!.reason).toContain("variante");
  });

  it("dentro del rango sigue la doble progresion normal", () => {
    const r = suggestProgressiveOverload({
      lastSets: [{ peso_kg: 0, repeticiones: 3, rir: 4 }],
      target,
      mode: "solo_reps",
    });
    expect(r!.action).toBe("increase_reps");
    expect(r!.suggestedReps).toBe(4);
  });

  it("no cambia el comportamiento de peso_reps", () => {
    const r = suggestProgressiveOverload({
      lastSets: [
        { peso_kg: 60, repeticiones: 12, rir: 1 },
        { peso_kg: 60, repeticiones: 12, rir: 1 },
      ],
      target: { repesMin: 8, repesMax: 12, targetRir: 2 },
    });
    expect(r!.action).toBe("increase_weight");
    expect(r!.suggestedWeight).toBeGreaterThan(60);
  });
});
