import { format } from "date-fns";
import { formatSleepHoursInput } from "@/lib/healthMetrics";

export function isoDateKey(value: string): string {
  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? value.trim();
}

export function sameHealthDay(a: string, b: string): boolean {
  return isoDateKey(a) === isoDateKey(b);
}

export const MEASURE_FIELDS = [
  { key: "peso", label: "Peso (kg)", step: "0.1", inputMode: "decimal" },
  { key: "grasa", label: "% Grasa", step: "0.1", inputMode: "decimal" },
  { key: "cintura", label: "Cintura (cm)", step: "0.1", inputMode: "decimal" },
  { key: "pecho", label: "Pecho (cm)", step: "0.1", inputMode: "decimal" },
  { key: "brazo", label: "Brazo (cm)", step: "0.1", inputMode: "decimal" },
  { key: "pierna", label: "Pierna (cm)", step: "0.1", inputMode: "decimal" },
] as const;

export type MeasureKey = (typeof MEASURE_FIELDS)[number]["key"];

export const COMPOSITION_FIELDS = MEASURE_FIELDS.filter((field) => field.key !== "peso");

export type HealthLogForm = Record<MeasureKey, string> & {
  fecha: string;
  calorias: string;
  suenoHoras: string;
  fcReposo: string;
  notas: string;
  calidad: number | null;
};

export type HealthLogMedidaSource = Partial<Record<MeasureKey, number | null>> & {
  fecha: string;
  notas?: string | null;
};

export type HealthLogDailySource = {
  fecha: string;
  calorias?: number | null;
  sueno_min?: number | null;
  calidad_sueno?: number | null;
  fc_reposo?: number | null;
  notas?: string | null;
};

export function todayIso(now = new Date()): string {
  return format(now, "yyyy-MM-dd");
}

export function emptyHealthLogForm(fecha = todayIso()): HealthLogForm {
  return {
    fecha,
    peso: "",
    grasa: "",
    cintura: "",
    pecho: "",
    brazo: "",
    pierna: "",
    calorias: "",
    suenoHoras: "",
    fcReposo: "",
    notas: "",
    calidad: null,
  };
}

function numToInput(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "";
  return String(value);
}

export function formFromRecords(
  fecha: string,
  medida?: HealthLogMedidaSource,
  daily?: HealthLogDailySource,
): HealthLogForm {
  const day = isoDateKey(fecha);
  const form = emptyHealthLogForm(day);
  if (medida && sameHealthDay(medida.fecha, day)) {
    for (const field of MEASURE_FIELDS) {
      form[field.key] = numToInput(medida[field.key]);
    }
    if (medida.notas) form.notas = medida.notas;
  }
  if (daily && sameHealthDay(daily.fecha, day)) {
    form.calorias = numToInput(daily.calorias);
    form.suenoHoras = daily.sueno_min != null ? formatSleepHoursInput(daily.sueno_min) : "";
    form.fcReposo = numToInput(daily.fc_reposo);
    form.calidad = daily.calidad_sueno ?? null;
    if (daily.notas) form.notas = daily.notas;
  }
  return form;
}

export function findRecordByFecha<T extends { fecha: string }>(
  rows: T[] | undefined,
  fecha: string,
): T | undefined {
  const day = isoDateKey(fecha);
  return rows?.find((row) => sameHealthDay(row.fecha, day));
}

export function dateHasHealthRecord(
  fecha: string,
  medida?: HealthLogMedidaSource,
  daily?: HealthLogDailySource,
): boolean {
  return (
    (medida != null && sameHealthDay(medida.fecha, fecha)) ||
    (daily != null && sameHealthDay(daily.fecha, fecha))
  );
}

export function hasCompositionValues(
  medida: HealthLogMedidaSource | undefined,
  fecha: string,
): boolean {
  if (!medida || !sameHealthDay(medida.fecha, fecha)) return false;
  return COMPOSITION_FIELDS.some((field) => medida[field.key] != null);
}

export function parseOptionalNumber(
  raw: string,
  min?: number,
  max?: number,
): { ok: true; value: number | null } | { ok: false } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };
  const n = Number(trimmed.replace(",", "."));
  if (!Number.isFinite(n)) return { ok: false };
  if (min != null && n < min) return { ok: false };
  if (max != null && n > max) return { ok: false };
  return { ok: true, value: n };
}

export function parseSleepHours(
  raw: string,
): { ok: true; value: number | null } | { ok: false } {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return { ok: true, value: null };

  const colon = trimmed.match(/^(\d{1,2}):(\d{1,2})(?::\d{1,2})?$/);
  if (colon) {
    const minutes = Number(colon[2]);
    const hours = Number(colon[1]) + minutes / 60;
    if (!Number.isFinite(hours) || minutes >= 60 || hours < 0 || hours > 24) return { ok: false };
    return { ok: true, value: hours };
  }

  const compact = trimmed.replace(/\s+/g, "");
  const hm = compact.match(/^(\d{1,2}(?:[.,]\d+)?)h(?:(\d{1,2})m?)?$/);
  if (hm) {
    const minutes = hm[2] ? Number(hm[2]) : 0;
    const hours = Number(hm[1].replace(",", ".")) + minutes / 60;
    if (!Number.isFinite(hours) || minutes >= 60 || hours < 0 || hours > 24) return { ok: false };
    return { ok: true, value: hours };
  }

  const labeled = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*h(?:oras?)?$/);
  if (labeled) return parseOptionalNumber(labeled[1], 0, 24);

  return parseOptionalNumber(trimmed, 0, 24);
}

export type DailyHealthFields = {
  fecha: string;
  calorias?: number;
  sueno_min?: number;
  calidad_sueno?: number;
  fc_reposo?: number;
  notas?: string;
};

export function dailyHealthFieldsFromForm(
  form: HealthLogForm,
): { ok: true; fields: DailyHealthFields | null } | { ok: false; error: "calorias" | "sueno" | "fc" } {
  const fecha = isoDateKey(form.fecha) || todayIso();
  const calorias = parseOptionalNumber(form.calorias, 0, 20000);
  const suenoHoras = parseSleepHours(form.suenoHoras);
  const fcReposo = parseOptionalNumber(form.fcReposo, 30, 120);
  if (!calorias.ok) return { ok: false, error: "calorias" };
  if (!suenoHoras.ok) return { ok: false, error: "sueno" };
  if (!fcReposo.ok) return { ok: false, error: "fc" };

  const fields: DailyHealthFields = { fecha };
  if (calorias.value != null) fields.calorias = Math.round(calorias.value);
  if (suenoHoras.value != null) fields.sueno_min = Math.round(suenoHoras.value * 60);
  if (form.calidad != null) fields.calidad_sueno = form.calidad;
  if (fcReposo.value != null) fields.fc_reposo = Math.round(fcReposo.value);
  const notas = form.notas.trim();
  if (notas) fields.notas = notas;

  if (
    fields.calorias == null &&
    fields.sueno_min == null &&
    fields.calidad_sueno == null &&
    fields.fc_reposo == null
  ) {
    return { ok: true, fields: null };
  }
  return { ok: true, fields };
}

export function readInputValue(id: string, stateValue: string): string {
  if (typeof document === "undefined") return stateValue;
  const el = document.getElementById(id) as HTMLInputElement | null;
  const dom = el?.value ?? "";
  return stateValue.trim() ? stateValue : dom;
}

export const HEALTH_FOCUS_FIELD: Record<"peso" | "calorias" | "fc" | "sueno", string> = {
  peso: "health-log-peso",
  calorias: "health-log-calorias",
  fc: "health-log-fc",
  sueno: "health-log-sueno",
};
