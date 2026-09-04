import { describe, expect, it } from "vitest";
// @ts-expect-error -- módulo de scripts en JS puro, sin tipos.
import { translateExerciseName } from "../../../scripts/lib/exerciseNaming.mjs";

type Traduccion = { nombre: string; sinTraducir: string[]; confianza: string };
const tr = (en: string): Traduccion => translateExerciseName(en) as Traduccion;

describe("translateExerciseName · orden del español", () => {
  it("mueve el equipo al final con 'con'", () => {
    expect(tr("Barbell Bench Press").nombre).toBe("Press de Banca con Barra");
    expect(tr("Dumbbell Fly").nombre).toBe("Aperturas con Mancuernas");
    expect(tr("Kettlebell Swing").nombre).toBe("Swing con Kettlebell");
  });

  it("coloca el cualificador unilateral al final", () => {
    // "Salto Lateral a una Pierna" se lee mejor que "Salto a una Pierna Lateral".
    expect(tr("Single-Leg Lateral Hop").nombre).toBe("Salto Lateral a una Pierna");
    expect(tr("One Arm Dumbbell Row").nombre).toBe("Remo a un Brazo con Mancuernas");
  });

  it("gana la frase más larga sobre la corta", () => {
    // "bench press" tiene que ganar a "press", y "single leg" a "leg".
    expect(tr("Bench Press").nombre).toBe("Press de Banca");
    expect(tr("Romanian Deadlift").nombre).toBe("Peso Muerto Rumano");
    expect(tr("Bulgarian Split Squat").nombre).toBe("Sentadilla Búlgara");
  });

  it("no duplica el modificador que ya lleva el movimiento", () => {
    // "split squat" + "bulgarian" daba "Sentadilla Búlgara Búlgara".
    expect(tr("Bulgarian Split Squat").nombre).not.toMatch(/Búlgara.*Búlgara/);
  });
});

describe("translateExerciseName · términos ambiguos", () => {
  it("no rompe las frases de movimiento que contienen equipo", () => {
    // bench, box, floor, wall y ball son parte de frases de movimiento; si se
    // extraen como equipo antes del movimiento, "Press de Banca" se rompe.
    expect(tr("Barbell Bench Press").nombre).toBe("Press de Banca con Barra");
    expect(tr("Floor Press").nombre).toBe("Press en Suelo");
    expect(tr("Wall Sit").nombre).toBe("Sentadilla Isométrica en Pared");
    expect(tr("Bench Dips").nombre).toBe("Fondos en Banco");
  });

  it("los usa como modificador cuando no forman movimiento", () => {
    expect(tr("Bench Jump").nombre).toBe("Salto en Banco");
    expect(tr("Box Jump").nombre).toBe("Salto al Cajón");
    expect(tr("Box Squat").nombre).toBe("Sentadilla al Cajón");
  });
});

describe("translateExerciseName · unicidad", () => {
  it("conserva los términos que no sabe traducir en vez de tirarlos", () => {
    // Tirarlos colapsaba ejercicios distintos en el mismo nombre y el
    // deduplicador los descartaba como si fueran el mismo ejercicio.
    const nombres = [
      "Frog Hops",
      "Hurdle Hops",
      "Backward Jump",
      "Bench Jump",
      "Box Jump",
    ].map((n) => tr(n).nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it("distingue las variantes de sentadilla", () => {
    const nombres = ["Goblet Squat", "Box Squat", "Chair Squat", "Front Squat", "Squat"].map(
      (n) => tr(n).nombre,
    );
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it("nunca devuelve nombre vacío para una entrada con texto", () => {
    for (const n of ["Chirimbolo Raro", "Zzz", "Atlas Stones", "Conan's Wheel"]) {
      expect(tr(n).nombre.length, n).toBeGreaterThan(0);
    }
  });
});

describe("translateExerciseName · movimientos encadenados", () => {
  it("conserva el segundo movimiento de un nombre compuesto", () => {
    expect(tr("Depth Jump to Hurdle Hop").nombre).toBe("Salto en Profundidad a Salto de Vallas");
  });
});

describe("translateExerciseName · confianza", () => {
  it("marca alta cuando reconoce el movimiento y todo el resto", () => {
    expect(tr("Barbell Bench Press").confianza).toBe("alta");
  });

  it("marca baja cuando no reconoce ningún movimiento", () => {
    expect(tr("Chirimbolo Invertido").confianza).toBe("baja");
  });

  it("informa de los términos pendientes para ampliar el diccionario", () => {
    const r = tr("Zzzz Widget Press");
    expect(r.sinTraducir).toContain("zzzz");
    expect(r.sinTraducir).toContain("widget");
  });

  it("tolera entrada vacía o nula", () => {
    expect(tr("").nombre).toBe("");
    expect(translateExerciseName(null as unknown as string).nombre).toBe("");
  });
});
