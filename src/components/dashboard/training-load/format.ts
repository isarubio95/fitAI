/** Signo menos tipográfico (U+2212): no se corta ni se confunde con un guion. */
export const MINUS = "−";

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("es-ES");
}

export function formatSigned(value: number): string {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded}`;
  if (rounded < 0) return `${MINUS}${Math.abs(rounded)}`;
  return "0";
}

export function formatAxisValue(value: number): string {
  const rounded = Math.round(value);
  return rounded < 0 ? `${MINUS}${Math.abs(rounded)}` : `${rounded}`;
}
