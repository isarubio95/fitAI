import { describe, expect, it } from "vitest";
// @ts-expect-error -- módulo de scripts en JS puro, sin tipos.
import { norm, tagExercise } from "../../../scripts/lib/exerciseTagging.mjs";
import {
  CUALIDADES,
  PATRONES_MOVIMIENTO,
  PLANOS,
  isCualidad,
  isPatronMovimiento,
  isPlano,
} from "@/constants/exerciseTaxonomy";
import { normalizeRegistroSeries } from "@/types/workout";

type Tag = {
  patron_movimiento: string[];
  cualidad: string[];
  plano: string | null;
  unilateral: boolean;
  registro_series: string;
  confianza: "alta" | "media" | "baja";
};

const tag = (
  name: string,
  equipment: string[] = [],
  bodyParts: string[] = [],
  category: string | null = null,
): Tag => tagExercise({ name, equipment, bodyParts, category }) as Tag;

describe("norm", () => {
  it("quita acentos y colapsa separadores", () => {
    expect(norm("Rotación  Explosiva")).toBe("rotacion explosiva");
    expect(norm("Single-Leg Hop")).toBe("single leg hop");
    expect(norm(null)).toBe("");
  });
});

describe("tagExercise · vocabulario", () => {
  const casos: string[] = [
    "Depth Jump to Hurdle Hop",
    "Medicine Ball Rotational Throw",
    "Barbell Bench Press",
    "Nordic Hamstring Curl",
    "Farmers Walk",
    "Pallof Press",
    "Hanging Leg Raise",
    "Standing Calf Raise",
    "Atlas Stones",
  ];

  it("solo emite valores del vocabulario de la taxonomia", () => {
    for (const nombre of casos) {
      const t = tag(nombre, ["Barbell"]);
      for (const p of t.patron_movimiento) {
        expect(isPatronMovimiento(p), `${nombre} → patron ${p}`).toBe(true);
      }
      for (const c of t.cualidad) {
        expect(isCualidad(c), `${nombre} → cualidad ${c}`).toBe(true);
      }
      if (t.plano != null) expect(isPlano(t.plano), `${nombre} → plano`).toBe(true);
      // El modo tiene que sobrevivir a normalizeRegistroSeries sin caer al defecto.
      expect(normalizeRegistroSeries(t.registro_series)).toBe(t.registro_series);
    }
  });

  it("los catalogos de la taxonomia no estan vacios", () => {
    expect(PATRONES_MOVIMIENTO.length).toBeGreaterThan(10);
    expect(CUALIDADES.length).toBeGreaterThan(5);
    expect(PLANOS.length).toBe(4);
  });
});

describe("tagExercise · patrones", () => {
  it("un depth jump es aterrizaje y salto a la vez", () => {
    const t = tag("Depth Jump to Hurdle Hop", ["Body weight"], ["Plyometrics"]);
    expect(t.patron_movimiento).toContain("aterrizaje");
    expect(t.patron_movimiento).toContain("salto");
    expect(t.cualidad).toContain("pliometria");
  });

  it("un lanzamiento rotacional es transversal", () => {
    const t = tag("Medicine Ball Rotational Throw", ["Medicine Ball"]);
    expect(t.patron_movimiento).toContain("lanzamiento");
    expect(t.patron_movimiento).toContain("rotacion");
    expect(t.plano).toBe("transversal");
  });

  it("distingue el press vertical del de banca", () => {
    expect(tag("Alternating Kettlebell Press", ["Kettlebell"]).patron_movimiento).toContain(
      "empuje_vertical",
    );
    expect(tag("Barbell Bench Press", ["Barbell"]).patron_movimiento).toContain(
      "empuje_horizontal",
    );
    expect(tag("Leg Press", ["Machine"]).patron_movimiento).toContain("sentadilla");
  });

  it("reconoce la flexion de core", () => {
    for (const n of ["Ab Crunch Machine", "Hanging Leg Raise", "Barbell Side Bend", "Cocoons"]) {
      expect(tag(n, ["Body weight"]).patron_movimiento, n).toContain("flexion_core");
    }
  });

  it("separa antirrotacion de rotacion", () => {
    expect(tag("Pallof Press", ["Cable"]).patron_movimiento).toContain("antirotacion");
    expect(tag("Russian Twist", ["Medicine Ball"]).patron_movimiento).toContain("rotacion");
  });

  it("marca el trabajo analitico como aislado", () => {
    expect(tag("Standing Calf Raise", ["Machine"]).patron_movimiento).toEqual(["aislado"]);
  });
});

describe("tagExercise · unilateral", () => {
  it("detecta el trabajo a una pierna o un brazo", () => {
    expect(tag("Single-Leg Lateral Hop", ["Body weight"]).unilateral).toBe(true);
    expect(tag("One Arm Dumbbell Row", ["Dumbbell"]).unilateral).toBe(true);
    expect(tag("Bulgarian Split Squat", ["Dumbbell"]).unilateral).toBe(true);
  });

  it("no confunde alternar con unilateral", () => {
    // Alternar sigue siendo trabajo de los dos lados en la misma serie.
    expect(tag("Alternating Kettlebell Row", ["Kettlebell"]).unilateral).toBe(false);
    expect(tag("Barbell Bench Press", ["Barbell"]).unilateral).toBe(false);
  });
});

describe("tagExercise · modo de registro", () => {
  it("los balisticos sin carga van a solo_reps", () => {
    expect(tag("Lateral Bound", ["Body weight"], [], "plyometrics").registro_series).toBe(
      "solo_reps",
    );
    expect(tag("Knee Tuck Jump", ["Body weight"]).registro_series).toBe("solo_reps");
  });

  it("con carga externa vuelve a peso_reps aunque sea un salto", () => {
    // Un jump squat con barra sí tiene kilos que registrar.
    expect(tag("Barbell Jump Squat", ["Barbell"]).registro_series).toBe("peso_reps");
    expect(tag("Dumbbell Jumping Squat", ["Dumbbell"]).registro_series).toBe("peso_reps");
  });

  it("los isometricos y acarreos van a duracion", () => {
    expect(tag("Front Plank", ["Body weight"]).registro_series).toBe("duracion");
    expect(tag("Farmers Walk", ["Kettlebell"]).registro_series).toBe("duracion");
    expect(tag("Wall Sit", ["Body weight"]).registro_series).toBe("duracion");
  });

  it("los estiramientos van a duracion", () => {
    expect(tag("All Fours Quad Stretch", ["Body weight"], [], "stretching").registro_series).toBe(
      "duracion",
    );
  });
});

describe("tagExercise · confianza", () => {
  it("un estiramiento sin patron no cuenta como fallo", () => {
    // No tiene patrón mecánico por naturaleza: es correcto, no un fallo.
    const t = tag("Behind Head Chest Stretch", ["Body weight"], [], "stretching");
    expect(t.patron_movimiento).toHaveLength(0);
    expect(t.cualidad).toContain("movilidad");
    expect(t.confianza).toBe("alta");
  });

  it("marca baja confianza cuando no reconoce nada", () => {
    expect(tag("Chirimbolo Invertido Doble", []).confianza).toBe("baja");
  });

  it("un ejercicio bien reconocido sale con confianza alta", () => {
    expect(tag("Barbell Bench Press", ["Barbell"]).confianza).toBe("alta");
    expect(tag("Depth Jump", ["Body weight"], ["Plyometrics"]).confianza).toBe("alta");
  });
});

describe("tagExercise · vocabulario de equipo de las dos fuentes", () => {
  it("reconoce los plurales de free-exercise-db", () => {
    // free-exercise-db usa "kettlebells"/"bands"; Lyfta usa "Kettlebell"/"Band".
    // Sin los plurales media librería se quedaba sin cualidad.
    for (const eq of ["kettlebells", "bands", "dumbbell", "e-z curl bar", "cable"]) {
      const t = tag("Preacher Curl", [eq]);
      expect(t.cualidad.length, eq).toBeGreaterThan(0);
    }
  });
});
