import { describe, expect, it } from "vitest";
import {
  EXPLICIT_SPORT_BONUS,
  rankExercisesForSport,
  scoreExerciseForDeporte,
  type ScorableExercise,
} from "@/lib/sportExerciseScore";
import { DEPORTES } from "@/constants/exerciseTaxonomy";
import { SPORT_PROFILES } from "@/constants/sportProfiles";

const saltoUnipodal: ScorableExercise = {
  patron_movimiento: ["salto", "aterrizaje"],
  cualidad: ["pliometria", "potencia"],
  plano: "sagital",
  unilateral: true,
};

const lanzamientoRotacional: ScorableExercise = {
  patron_movimiento: ["rotacion", "lanzamiento"],
  cualidad: ["potencia", "pliometria"],
  plano: "transversal",
  unilateral: false,
};

const curlBiceps: ScorableExercise = {
  patron_movimiento: ["aislado"],
  cualidad: ["hipertrofia"],
  plano: "sagital",
  unilateral: false,
};

const braceoBanda: ScorableExercise = {
  patron_movimiento: ["braceo", "traccion_vertical"],
  cualidad: ["prevencion", "movilidad", "resistencia"],
  plano: "sagital",
  unilateral: false,
};

describe("scoreExerciseForDeporte", () => {
  it("puntua 0 un ejercicio sin etiquetar", () => {
    expect(scoreExerciseForDeporte({}, "padel")).toBe(0);
    expect(scoreExerciseForDeporte({ patron_movimiento: [], cualidad: [] }, "futbol")).toBe(0);
  });

  it("ignora valores fuera del vocabulario", () => {
    const basura: ScorableExercise = {
      patron_movimiento: ["inventado", 42, null],
      cualidad: ["tambien_inventado"],
      plano: "diagonal",
    };
    expect(scoreExerciseForDeporte(basura, "tenis")).toBe(0);
  });

  it("prefiere el salto unipodal en baloncesto y el giro en golf", () => {
    expect(scoreExerciseForDeporte(saltoUnipodal, "baloncesto")).toBeGreaterThan(
      scoreExerciseForDeporte(lanzamientoRotacional, "baloncesto"),
    );
    expect(scoreExerciseForDeporte(lanzamientoRotacional, "golf")).toBeGreaterThan(
      scoreExerciseForDeporte(saltoUnipodal, "golf"),
    );
  });

  it("coloca el braceo por delante del salto en natacion", () => {
    expect(scoreExerciseForDeporte(braceoBanda, "natacion")).toBeGreaterThan(
      scoreExerciseForDeporte(saltoUnipodal, "natacion"),
    );
  });

  it("deja el trabajo analitico de brazo por debajo del umbral en todo deporte", () => {
    for (const deporte of DEPORTES) {
      expect(scoreExerciseForDeporte(curlBiceps, deporte)).toBeLessThan(0.35);
    }
  });

  it("el match explicito de deporte sube la puntuacion", () => {
    const sin = scoreExerciseForDeporte(curlBiceps, "padel");
    const con = scoreExerciseForDeporte({ ...curlBiceps, deportes: ["padel"] }, "padel");
    expect(con).toBeGreaterThan(sin);
    expect(con).toBeCloseTo(Math.min(1, sin + EXPLICIT_SPORT_BONUS), 5);
  });

  it("nunca se sale de 0..1", () => {
    const todo: ScorableExercise = {
      patron_movimiento: ["salto", "aterrizaje", "rotacion", "desplazamiento"],
      cualidad: ["pliometria", "potencia", "velocidad", "estabilidad"],
      plano: "transversal",
      unilateral: true,
      deportes: ["padel"],
    };
    const score = scoreExerciseForDeporte(todo, "padel");
    expect(score).toBeLessThanOrEqual(1);
    expect(score).toBeGreaterThan(0.5);
  });
});

describe("rankExercisesForSport", () => {
  const catalogo = [saltoUnipodal, lanzamientoRotacional, curlBiceps, braceoBanda];

  it("ordena de mayor a menor y filtra por umbral", () => {
    const ranked = rankExercisesForSport(catalogo, "padel");
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked).not.toContainEqual(expect.objectContaining({ exercise: curlBiceps }));
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
    }
  });

  it("respeta el limite", () => {
    expect(rankExercisesForSport(catalogo, "tenis", { minScore: 0, limit: 2 })).toHaveLength(2);
  });

  it("con minScore 0 devuelve todo el catalogo", () => {
    expect(rankExercisesForSport(catalogo, "tenis", { minScore: 0 })).toHaveLength(catalogo.length);
  });
});

describe("SPORT_PROFILES", () => {
  it("cubre todos los deportes del vocabulario", () => {
    for (const deporte of DEPORTES) {
      expect(SPORT_PROFILES[deporte]).toBeDefined();
      expect(SPORT_PROFILES[deporte].deporte).toBe(deporte);
    }
  });

  it("usa pesos dentro de 0..1", () => {
    for (const deporte of DEPORTES) {
      const p = SPORT_PROFILES[deporte];
      const pesos = [
        ...Object.values(p.patrones),
        ...Object.values(p.cualidades),
        ...Object.values(p.planos),
        p.unilateral,
      ];
      for (const w of pesos) {
        expect(w).toBeGreaterThanOrEqual(0);
        expect(w).toBeLessThanOrEqual(1);
      }
    }
  });
});
