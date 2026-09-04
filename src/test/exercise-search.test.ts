import { describe, expect, it } from "vitest";
import {
  compareExerciseNames,
  exerciseMatchesQuery,
  expandQueryVariants,
  normalizeSearchText,
  rankExercises,
  searchExercises,
  tokenizeSearchText,
} from "@/lib/exerciseSearch";

type Ex = {
  nombre: string;
  tipo?: string | null;
  grupo_muscular?: string | null;
  equipment?: string | null;
  equipment_list?: string[] | null;
  musculos_involucrados?: string[] | null;
  descripcion?: string | null;
};

const CATALOG: Ex[] = [
  {
    nombre: "Press de Banca",
    tipo: "Fuerza",
    grupo_muscular: "Pecho",
    equipment: "Barra",
    equipment_list: ["Barra", "Banco Plano"],
    musculos_involucrados: ["Pectoral Mayor", "Tríceps"],
  },
  {
    nombre: "Press de Banca Inclinado con Mancuernas",
    tipo: "Fuerza",
    grupo_muscular: "Pecho",
    equipment: "Mancuernas",
    equipment_list: ["Mancuernas", "Banco Inclinable"],
    musculos_involucrados: ["Pectoral Mayor"],
  },
  {
    nombre: "Curl de Bíceps con Barra",
    tipo: "Fuerza",
    grupo_muscular: "Bíceps",
    equipment: "Barra",
    musculos_involucrados: ["Bíceps Braquial"],
  },
  {
    nombre: "Dominada",
    tipo: "Fuerza",
    grupo_muscular: "Espalda",
    equipment: "Barra de Dominadas",
    musculos_involucrados: ["Dorsal Ancho"],
  },
  {
    nombre: "Sentadilla Búlgara",
    tipo: "Fuerza",
    grupo_muscular: "Cuádriceps",
    equipment: "Mancuernas",
    musculos_involucrados: ["Cuádriceps", "Glúteo Mayor"],
  },
  {
    nombre: "Elevación Lateral con Mancuernas",
    tipo: "Fuerza",
    grupo_muscular: "Hombro",
    equipment: "Mancuernas",
    musculos_involucrados: ["Deltoides Lateral"],
  },
  {
    nombre: "Peso Muerto Rumano",
    tipo: "Fuerza",
    grupo_muscular: "Femoral",
    equipment: "Barra",
    musculos_involucrados: ["Isquiotibiales"],
  },
];

const names = (items: Ex[]) => items.map((x) => x.nombre);
const find = (query: string) => names(searchExercises(CATALOG, query));

describe("normalizeSearchText", () => {
  it("baja a minúsculas y quita tildes, diéresis y la virgulilla de la ñ", () => {
    expect(normalizeSearchText("BÍCEPS")).toBe("biceps");
    expect(normalizeSearchText("Elevación")).toBe("elevacion");
    expect(normalizeSearchText("pingüino")).toBe("pinguino");
    expect(normalizeSearchText("Español")).toBe("espanol");
    expect(normalizeSearchText("Búlgara")).toBe("bulgara");
  });

  it("convierte cualquier signo en separador y colapsa espacios", () => {
    expect(normalizeSearchText("  press-de/banca  ")).toBe("press de banca");
    expect(normalizeSearchText("Press (Banca), 45°")).toBe("press banca 45");
  });

  it("tolera valores no textuales", () => {
    expect(normalizeSearchText(null)).toBe("");
    expect(normalizeSearchText(undefined)).toBe("");
    expect(normalizeSearchText(42)).toBe("42");
  });

  it("tokeniza sin dejar cadenas vacías", () => {
    expect(tokenizeSearchText("  Press   de  Banca ")).toEqual(["press", "de", "banca"]);
    expect(tokenizeSearchText("   ")).toEqual([]);
  });
});

describe("búsqueda insensible a mayúsculas y tildes", () => {
  it("encuentra igual escrito de cualquier forma", () => {
    for (const query of ["biceps", "BICEPS", "Bíceps", "bÍcEpS", "bíceps"]) {
      expect(find(query)).toContain("Curl de Bíceps con Barra");
    }
  });

  it("encuentra aunque el dato lleve tilde y la consulta no, y al revés", () => {
    expect(find("elevacion lateral")).toContain("Elevación Lateral con Mancuernas");
    expect(find("séntadílla")).toContain("Sentadilla Búlgara");
  });

  it("ignora guiones, puntuación y espacios sobrantes", () => {
    expect(find("press-de-banca")).toContain("Press de Banca");
    expect(find("   press   banca   ")).toContain("Press de Banca");
    expect(find("pressbanca")).toContain("Press de Banca");
  });

  it("encuentra press de banca con el prefijo 'pres'", () => {
    expect(find("Pres banca")).toContain("Press de Banca");
  });
});

describe("coincidencia de términos", () => {
  it("exige todos los términos (AND), no cualquiera de ellos", () => {
    expect(find("press banca")).toContain("Press de Banca");
    expect(find("press bicicleta")).toEqual([]);
  });

  it("acepta los términos en cualquier orden", () => {
    expect(find("banca press")).toContain("Press de Banca");
    expect(find("mancuernas inclinado press")).toContain("Press de Banca Inclinado con Mancuernas");
  });

  it("busca por prefijo mientras se escribe", () => {
    expect(find("dom")).toContain("Dominada");
    expect(find("sentad")).toContain("Sentadilla Búlgara");
  });

  it("busca también en material, grupo muscular y músculos", () => {
    expect(find("mancuernas")).toContain("Elevación Lateral con Mancuernas");
    expect(find("dorsal")).toContain("Dominada");
    expect(find("femoral")).toContain("Peso Muerto Rumano");
  });

  it("no devuelve nada cuando ningún campo coincide", () => {
    expect(find("natacion")).toEqual([]);
  });

  it("con consulta vacía no filtra", () => {
    expect(searchExercises(CATALOG, "")).toHaveLength(CATALOG.length);
    expect(searchExercises(CATALOG, "   ")).toHaveLength(CATALOG.length);
  });
});

describe("tolerancia a erratas", () => {
  it("perdona una letra cambiada, sobrante o ausente", () => {
    expect(find("dominadda")).toContain("Dominada");
    expect(find("sentadila")).toContain("Sentadilla Búlgara");
    expect(find("bicebs")).toContain("Curl de Bíceps con Barra");
  });

  it("perdona dos letras contiguas del revés", () => {
    expect(find("bacna")).toContain("Press de Banca");
  });

  it("no perdona erratas en palabras muy cortas (evita ruido)", () => {
    expect(find("xyz")).toEqual([]);
  });
});

describe("sinónimos", () => {
  it("relaciona español e inglés en ambos sentidos", () => {
    expect(find("pull up")).toContain("Dominada");
    expect(find("deadlift")).toContain("Peso Muerto Rumano");
    expect(find("lateral raise")).toContain("Elevación Lateral con Mancuernas");
  });

  it("expande la consulta manteniendo el original primero", () => {
    const variants = expandQueryVariants("dominada");
    expect(variants[0]).toBe("dominada");
    expect(variants).toContain("pull up");
  });

  it("sustituye la frase dentro de una consulta más larga", () => {
    expect(expandQueryVariants("dominada lastrada")).toContain("pull up lastrada");
  });
});

describe("orden por relevancia", () => {
  it("pone primero la coincidencia exacta del nombre", () => {
    expect(find("press de banca")[0]).toBe("Press de Banca");
  });

  it("prefiere el nombre corto que empieza por la consulta", () => {
    expect(find("press")[0]).toBe("Press de Banca");
  });

  it("puntúa el nombre por encima de los campos secundarios", () => {
    const ranked = rankExercises(CATALOG, "biceps");
    expect(ranked[0].item.nombre).toBe("Curl de Bíceps con Barra");
  });

  it("con la consulta completa deja el más específico arriba", () => {
    expect(find("press banca inclinado")[0]).toBe("Press de Banca Inclinado con Mancuernas");
  });

  it("desempata alfabéticamente para que el orden sea estable", () => {
    const a = rankExercises(CATALOG, "mancuernas").map((r) => r.item.nombre);
    const b = rankExercises(CATALOG, "mancuernas").map((r) => r.item.nombre);
    expect(a).toEqual(b);
  });
});

describe("helpers", () => {
  it("exerciseMatchesQuery responde en booleano", () => {
    expect(exerciseMatchesQuery(CATALOG[0], "banca")).toBe(true);
    expect(exerciseMatchesQuery(CATALOG[0], "natacion")).toBe(false);
  });

  it("compareExerciseNames ignora tildes y mayúsculas", () => {
    expect(compareExerciseNames({ nombre: "Elevación" }, { nombre: "elevacion" })).toBe(0);
    expect(compareExerciseNames({ nombre: "Abdominal" }, { nombre: "Zancada" })).toBeLessThan(0);
  });

  it("no se rompe con filas incompletas", () => {
    const parciales = [{ nombre: "Solo Nombre" }, { nombre: "" }, {}] as Ex[];
    expect(() => searchExercises(parciales, "nombre")).not.toThrow();
    expect(names(searchExercises(parciales, "nombre"))).toEqual(["Solo Nombre"]);
  });
});
