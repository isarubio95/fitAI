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

function resolveExerciseMuscleGroups(source: ExerciseMuscleSource | null | undefined): Set<MainMuscleGroup> {
  const groups = new Set<MainMuscleGroup>();
  if (!source) return groups;

  for (const muscle of source.musculos_involucrados ?? []) {
    const group = resolveMainMuscleGroup(muscle);
    if (group) groups.add(group);
  }
  if (groups.size === 0) {
    const fallback = resolveMainMuscleGroup(source.grupo_muscular);
    if (fallback) groups.add(fallback);
  }
  return groups;
}

/** Grupos principales de una rutina, ordenados por frecuencia en sus ejercicios. */
export function summarizeRoutineMuscleGroups(
  exercises: { tipo_ejercicio?: ExerciseMuscleSource | null }[],
  limit = 3,
): MainMuscleGroup[] {
  const counts = new Map<MainMuscleGroup, number>();

  for (const exercise of exercises) {
    for (const group of resolveExerciseMuscleGroups(exercise.tipo_ejercicio)) {
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
    .slice(0, Math.max(0, limit))
    .map(([group]) => group);
}

export type RoutineMuscleVolume = {
  groupSets: Record<MainMuscleGroup, number>;
  maxSets: number;
};

/** Series objetivo por grupo muscular, para el heatmap de una rutina. */
export function aggregateRoutineMuscleSets(
  exercises: Array<{
    series_objetivo?: number | null;
    tipo_ejercicio?: ExerciseMuscleSource | null;
  }>,
): RoutineMuscleVolume {
  const groupSets = {} as Record<MainMuscleGroup, number>;
  let maxSets = 0;

  for (const exercise of exercises) {
    const sets = Math.max(0, Number(exercise.series_objetivo) || 0);
    if (sets === 0) continue;

    for (const group of resolveExerciseMuscleGroups(exercise.tipo_ejercicio)) {
      const next = (groupSets[group] ?? 0) + sets;
      groupSets[group] = next;
      if (next > maxSets) maxSets = next;
    }
  }

  return { groupSets, maxSets };
}
