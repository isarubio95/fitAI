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

  it("no confunde el agarre invertido con un acarreo", () => {
    // "bottoms up" es un estilo de agarre de kettlebell, no un transporte:
    // etiquetaba como `carry` presses y levantadas turcas.
    const t = tag("Kettlebell Standing Bottoms Up One Arm Shoulder Press", ["Kettlebell"]);
    expect(t.patron_movimiento).toContain("empuje_vertical");
    expect(t.patron_movimiento).not.toContain("carry");
    expect(t.registro_series).toBe("peso_reps");
  });

  it("una patada de glúteo no es locomoción", () => {
    // "kick" estaba en `desplazamiento`, así que un kickback analítico salía
    // como el mejor ejercicio para fútbol al puntuar los perfiles deportivos.
    expect(tag("Glute Kickback", ["Cable"]).patron_movimiento).toEqual(["aislado"]);
    expect(tag("Triceps Kickback", ["Dumbbell"]).patron_movimiento).toEqual(["aislado"]);
    // Las patadas de artes marciales son golpeos.
    expect(tag("Roundhouse Kick. Kickboxing", ["Body weight"]).patron_movimiento).toContain(
      "lanzamiento",
    );
    // El talón al glúteo sí es técnica de carrera.
    expect(tag("Double Leg Butt Kick", ["Body weight"]).patron_movimiento).toContain(
      "desplazamiento",
    );
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

  it("no confunde la halterofilia colgante con una suspensión", () => {
    // "hang" a secas marcaba como cronometradas 20 filas de halterofilia:
    // un hang clean es un levantamiento por repeticiones, no un colgarse.
    expect(tag("Hang Clean", ["Barbell"]).registro_series).toBe("peso_reps");
    expect(tag("Hang Snatch", ["Barbell"]).registro_series).toBe("peso_reps");
    expect(tag("Hanging Leg Raise", ["Body weight"]).registro_series).toBe("peso_reps");
    // La suspensión pasiva sí es tiempo.
    expect(tag("Dead Hang", ["Body weight"]).registro_series).toBe("duracion");
    expect(tag("One Handed Hang", ["Body weight"]).registro_series).toBe("duracion");
  });

  it("los acarreos y sujeciones van a duracion", () => {
    for (const [n, eq] of [
      ["Farmer's Walk", "Dumbbell"],
      ["Yoke Walk", "Weighted"],
      ["Sled Drag - Harness", "Sled machine"],
      ["Plate Pinch", "Weighted"],
      ["StrongMan Hercules Hold", "Weighted"],
    ] as [string, string][]) {
      expect(tag(n, [eq]).registro_series, n).toBe("duracion");
    }
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

describe("tagExercise · palabras que significan lo contrario según el contexto", () => {
  // Los cinco fallos que destapó auditar el etiquetado contra reglas mecánicas
  // sobre el catálogo real: eran el 8,8% de los casos comprobables. Todos son
  // la misma familia de bug —un término que se dispara donde no toca— que ya
  // había aparecido con `kick`/`Glute Kickback` y con `bottoms up`/`carry`.

  it("los fondos son empuje vertical, no horizontal", () => {
    // Estaban en la lista de empuje_horizontal: las 12 filas con 'dip' del
    // catálogo salían mal, paralelas y anillas incluidas.
    for (const n of ["Parallel Bar Dip", "Ring Dips", "Triceps Dip", "Korean dips"]) {
      const t = tag(n);
      expect(t.patron_movimiento, n).toContain("empuje_vertical");
      expect(t.patron_movimiento, n).not.toContain("empuje_horizontal");
    }
    // El fondo en banco sí es el gesto horizontal de tríceps.
    expect(tag("Bench Dip").patron_movimiento).toContain("empuje_horizontal");
  });

  it("un reverse fly es tracción, no la apertura de pecho", () => {
    // Las cuatro grafías y con palabras intercaladas: con listas de frases
    // solas se escapaban "Reverse Flyes" y "Reverse Machine Flyes".
    const variantes = [
      "Lever Seated Reverse Fly",
      "Band reverse fly",
      "Rear Delt Fly",
      "Reverse Peck Deck",
      "Reverse Flyes",
      "Reverse Flyes With External Rotation",
      "Reverse Machine Flyes",
      "Sled Reverse Flye",
      "Back Flyes - With Bands",
      "Dumbbell Lying Rear Lateral Raise",
    ];
    for (const n of variantes) {
      const t = tag(n);
      expect(t.patron_movimiento, n).toContain("traccion_horizontal");
      expect(t.patron_movimiento, n).not.toContain("empuje_horizontal");
    }
    // La apertura de pecho de toda la vida sigue siendo empuje horizontal.
    expect(tag("Dumbbell Chest Fly").patron_movimiento).toContain("empuje_horizontal");
  });

  it("un drag curl no es un acarreo", () => {
    for (const n of ["Barbell Drag Curl", "Cable Drag Curl"]) {
      const t = tag(n);
      expect(t.patron_movimiento, n).not.toContain("carry");
      expect(t.patron_movimiento, n).toContain("aislado");
    }
    // El arrastre de trineo sí lo es.
    expect(tag("Sled Drag").patron_movimiento).toContain("carry");
  });

  it("'overhead' y 'pulldown' no convierten un analítico en empuje ni en jalón", () => {
    expect(tag("Standing Overhead Barbell Triceps Extension").patron_movimiento).toEqual(["aislado"]);
    expect(tag("Band one arm overhead biceps curl").patron_movimiento).toEqual(["aislado"]);
    expect(tag("Cable Pulldown Bicep Curl").patron_movimiento).toEqual(["aislado"]);
    // Y el press por encima de la cabeza sigue siendo empuje vertical.
    expect(tag("Barbell Overhead Press").patron_movimiento).toContain("empuje_vertical");
  });

  it("tumbado se empuja en horizontal aunque el nombre no diga 'bench'", () => {
    for (const n of ["Dumbbell Lying Elbow Press", "Dumbbell Lying Hammer Press", "Barbell Floor Press"]) {
      const t = tag(n);
      expect(t.patron_movimiento, n).toContain("empuje_horizontal");
      expect(t.patron_movimiento, n).not.toContain("empuje_vertical");
    }
  });

  it("'cross body' no es el directo de boxeo", () => {
    const t = tag("Dumbbell Cross Body Hammer Curl");
    expect(t.patron_movimiento).not.toContain("lanzamiento");
    expect(t.patron_movimiento).toContain("aislado");
    // El directo sí.
    expect(tag("Boxing Cross").patron_movimiento).toContain("lanzamiento");
  });

  it("el aparato donde se hace no manda sobre el gesto", () => {
    // El nombre del asset arrastra a veces la máquina: "Lever Calf Raise
    // bench press machine" no es un press de banca.
    const t = tag("Lever Calf Raise bench press machine");
    expect(t.patron_movimiento).toContain("aislado");
    expect(t.patron_movimiento).not.toContain("empuje_horizontal");
  });
});

describe("tagExercise · cruce de poleas", () => {
  it("un crossover es aducción de pecho, no un lanzamiento", () => {
    for (const n of ["Cable Crossover", "Band Crossover", "Low Cable Crossover"]) {
      const t = tag(n);
      expect(t.patron_movimiento, n).toContain("empuje_horizontal");
      expect(t.patron_movimiento, n).not.toContain("lanzamiento");
    }
  });
});
