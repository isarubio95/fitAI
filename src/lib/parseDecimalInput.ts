/** Parsea un número decimal aceptando "," y "." como separador. */
export function parseDecimalInput(raw: string): number | null {
  const trimmed = raw.trim().replace(/\s+/g, "");
  if (trimmed === "" || trimmed === "," || trimmed === ".") return null;

  const withDot = trimmed.replace(/,/g, ".");
  const firstDot = withDot.indexOf(".");
  const collapsed =
    firstDot === -1
      ? withDot
      : withDot.slice(0, firstDot + 1) + withDot.slice(firstDot + 1).replace(/\./g, "");

  const n = Number(collapsed);
  return Number.isFinite(n) ? n : null;
}

/** Filtra el texto mientras se escribe: dígitos y un único separador decimal. */
export function sanitizeDecimalDraft(raw: string, allowDecimal: boolean): string {
  const chars = raw.replace(/[^\d.,]/g, "");
  if (!allowDecimal) return chars.replace(/[.,]/g, "");

  let sepSeen = false;
  let out = "";
  for (const ch of chars) {
    if (ch === "." || ch === ",") {
      if (sepSeen) continue;
      sepSeen = true;
      out += ch;
      continue;
    }
    out += ch;
  }
  return out;
}

/** Valor canónico al salir del input: punto decimal, sin ceros sobrantes. */
export function formatCommittedNumber(n: number): string {
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round(n * 1000) / 1000;
  return String(rounded);
}
