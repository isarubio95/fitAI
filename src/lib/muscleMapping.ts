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
