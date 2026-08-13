import { MUSCLE_GROUPS, type MainMuscleGroup } from "@/constants/muscleGroups";

function normalizeToken(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

const SPECIFIC_MUSCLE_TO_GROUP: Record<string, MainMuscleGroup> = (() => {
  const map: Record<string, MainMuscleGroup> = {};
  for (const [group, muscles] of Object.entries(MUSCLE_GROUPS) as [MainMuscleGroup, readonly string[]][]) {
    for (const muscle of muscles) {
      map[normalizeToken(muscle)] = group;
    }
  }
  return map;
})();

// Alias de seguridad mínimos para tolerar variaciones comunes de catálogo.
// La fuente de verdad sigue siendo MUSCLE_GROUPS + catálogo normalizado en BD.
const SAFE_ALIASES: Record<string, MainMuscleGroup> = {
  // Grupos frecuentes en texto libre
  pecho: "Pecho",
  espalda: "Espalda",
  hombro: "Hombro",
  biceps: "Bíceps",
  triceps: "Tríceps",
  antebrazo: "Antebrazo",
  cuadriceps: "Cuádriceps",
  femoral: "Femoral",
  isquiotibiales: "Femoral",
  gluteo: "Glúteo",
  pantorrilla: "Pantorrilla",
  core: "Core",
  abdomen: "Core",
  // Casos detectados en dataset histórico
  lumbar: "Espalda",
  aductor: "Femoral",
  gemelos: "Pantorrilla",
  soleo: "Pantorrilla",
};

export function resolveMainMuscleGroup(value: string | null | undefined): MainMuscleGroup | null {
  const key = normalizeToken(value);
  if (!key) return null;
  return SPECIFIC_MUSCLE_TO_GROUP[key] ?? SAFE_ALIASES[key] ?? null;
}

type ExerciseMuscleSource = {
  musculos_involucrados?: string[] | null;
  grupo_muscular?: string | null;
};

/** Grupos principales de una rutina, ordenados por frecuencia en sus ejercicios. */
export function summarizeRoutineMuscleGroups(
  exercises: { tipo_ejercicio?: ExerciseMuscleSource | null }[],
  limit = 3,
): MainMuscleGroup[] {
  const counts = new Map<MainMuscleGroup, number>();

  for (const exercise of exercises) {
    const source = exercise.tipo_ejercicio;
    if (!source) continue;

    const groups = new Set<MainMuscleGroup>();
    for (const muscle of source.musculos_involucrados ?? []) {
      const group = resolveMainMuscleGroup(muscle);
      if (group) groups.add(group);
    }
    if (groups.size === 0) {
      const fallback = resolveMainMuscleGroup(source.grupo_muscular);
      if (fallback) groups.add(fallback);
    }
    for (const group of groups) {
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    .slice(0, Math.max(0, limit))
    .map(([group]) => group);
}
