/**
 * Convierte el párrafo de instrucciones de FitCron en pasos (array de strings)
 * para guardar como JSON en CSV / leer en BD.
 */

function normalizeWhitespace(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function mergeTrailingTinyFragments(steps, minChars) {
  if (steps.length <= 1) return steps;
  const out = [...steps];
  while (out.length >= 2 && out[out.length - 1].length < minChars) {
    const last = out.pop();
    out[out.length - 1] = `${out[out.length - 1]} ${last}`.trim();
  }
  return out;
}

/**
 * Divide por frases (. ! ? + espacio + inicio de nueva frase en español).
 * Si queda un solo bloque muy largo, intenta por punto y coma.
 */
export function instructionTextToStepArray(text) {
  const cleaned = normalizeWhitespace(text);
  if (!cleaned) return [];

  let steps = cleaned
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/u)
    .map((s) => s.trim())
    .filter(Boolean);

  steps = mergeTrailingTinyFragments(steps, 15);

  if (steps.length === 1 && steps[0].length > 220) {
    const bySemi = steps[0]
      .split(/\s*;\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (bySemi.length > 1) steps = bySemi;
  }

  return steps;
}

/** Celda CSV: JSON array escapable con csvEscape del caller. */
export function instructionStepsToJsonCell(steps) {
  return JSON.stringify(steps ?? []);
}
