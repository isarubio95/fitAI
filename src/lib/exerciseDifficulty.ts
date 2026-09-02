/**
 * Normalización de `tipo_ejercicio.dificultad`.
 *
 * La columna es texto libre y arrastra tres convenciones distintas: los
 * números `"1" | "2" | "3"` del grueso del catálogo, las etiquetas `"baja" |
 * "media" | "alta"` de la UI, y unas pocas filas con `"Principiante" |
 * "Intermedio" | "Avanzado"` heredadas de importaciones antiguas. Esta era la
 * única familia de valores que no se reconocía: se mostraban sin dificultad.
 */

export type DifficultyLevel = 1 | 2 | 3;

export const DIFFICULTY_OPTIONS: { level: DifficultyLevel; label: string }[] = [
  { level: 1, label: "Baja" },
  { level: 2, label: "Media" },
  { level: 3, label: "Alta" },
];

function clamp(n: number): DifficultyLevel {
  return Math.max(1, Math.min(3, Math.round(n))) as DifficultyLevel;
}

export function difficultyToLevel(d: unknown): DifficultyLevel | null {
  if (d == null) return null;
  if (typeof d === "number" && Number.isFinite(d)) return clamp(d);

  const s = String(d).trim().toLowerCase();
  if (!s) return null;

  const num = Number.parseInt(s, 10);
  if (Number.isFinite(num)) return clamp(num);

  if (s.includes("baja") || s.includes("principiante") || s.includes("facil")) return 1;
  if (s.includes("media") || s.includes("intermedi") || s.includes("normal")) return 2;
  if (s.includes("alta") || s.includes("avanzad") || s.includes("dificil") || s.includes("experto")) {
    return 3;
  }

  return null;
}

export function difficultyLabel(level: DifficultyLevel): string {
  return DIFFICULTY_OPTIONS.find((o) => o.level === level)?.label ?? String(level);
}

/** Valor canónico a escribir en BD: siempre `"1" | "2" | "3"`. */
export function difficultyToStored(d: unknown): string | null {
  const level = difficultyToLevel(d);
  return level == null ? null : String(level);
}
