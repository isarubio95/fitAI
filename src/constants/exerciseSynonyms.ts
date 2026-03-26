/**
 * Sinónimos curados para búsqueda.
 * Claves y valores se comparan tras normalizar (minúsculas + sin acentos + espacios colapsados).
 */
export const EXERCISE_SYNONYMS: Record<string, string[]> = {
  "dominada supina": ["chin up", "chin-up", "dominada supinacion", "dominada en supinacion"],
  dominada: ["pull up", "pull-up", "pullup"],
  "dominada neutra": ["hammer grip pull up", "neutral grip pull up", "pull up neutra"],
  fondos: ["dip", "dips"],
  "press militar": ["overhead press", "ohp", "press hombros"],
  "remo con barra": ["barbell row", "bent over row", "remo inclinado"],
  "peso muerto": ["deadlift"],
  sentadilla: ["squat"],
  "curl biceps": ["biceps curl", "curl de biceps"],
  "elevacion lateral": ["lateral raise", "elevaciones laterales"],
  plancha: ["plank"],
  "plancha lateral": ["side plank"],
  "air bike": ["assault bike"],
};

