/**
 * Corrige el mojibake típico de UTF-8 interpretado como latin1/CP1252.
 *
 * Ejemplos comunes:
 * - "NiÃ±o" -> "Niño"
 * - "CafÃ©"  -> "Café"
 *
 * Si el texto no parece mojibake, lo deja tal cual.
 *
 * @param {unknown} input
 * @returns {string}
 */
export function fixMojibake(input) {
  if (typeof input !== "string") return "";
  // U+00C3 = Ã, U+00C2 = Â, U+00E2 = â (patrones típicos de mojibake UTF-8 -> latin1)
  if (!/[\u00c3\u00c2\u00e2]/.test(input)) return input;

  try {
    const fixed = Buffer.from(input, "latin1").toString("utf8");
    // Si algo sale mal (p.ej. caracteres de reemplazo) mejor no tocar.
    if (!fixed || fixed.includes("�")) return input;
    return fixed;
  } catch {
    return input;
  }
}

