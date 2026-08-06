/** Helpers de duración y datetime-local para el formulario manual de cardio. */

export function durationPartsFromSeconds(total: number) {
  const s = Math.max(0, Math.floor(total));
  return {
    h: Math.floor(s / 3600),
    m: Math.floor((s % 3600) / 60),
    sec: s % 60,
  };
}

/** Devuelve segundos totales, o null si los valores no son válidos. */
export function secondsFromDurationParts(h: string, m: string, s: string): number | null {
  const hours = h.trim() === "" ? 0 : Number(h);
  const mins = m.trim() === "" ? 0 : Number(m);
  const secs = s.trim() === "" ? 0 : Number(s);
  if ([hours, mins, secs].some((n) => Number.isNaN(n) || n < 0 || !Number.isFinite(n))) return null;
  if (!Number.isInteger(hours) || !Number.isInteger(mins) || !Number.isInteger(secs)) return null;
  if (mins > 59 || secs > 59) return null;
  return hours * 3600 + mins * 60 + secs;
}

export function toDatetimeLocalValue(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
