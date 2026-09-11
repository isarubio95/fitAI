import { normalizeRegistroSeries, type RegistroSeries } from "@/types/workout";

export type CatalogExerciseSource = "catalogo" | "usuario";

/** Ejercicio del catálogo que se lleva a un entreno o a una rutina. */
export type CatalogExerciseCarry = {
  source: CatalogExerciseSource;
  id: string;
  nombre: string;
  registro_series: RegistroSeries;
};

export type CatalogExerciseRef = {
  tipo_ejercicio_id?: string;
  usuario_ejercicio_id?: string;
  registro_series: RegistroSeries;
};

const ADD_KEY = "add";
const ADD_NAME_KEY = "addName";
const ADD_REG_KEY = "addReg";

function parseSourceId(raw: string | null): { source: CatalogExerciseSource; id: string } | null {
  if (!raw) return null;
  const sep = raw.indexOf(":");
  if (sep <= 0 || sep === raw.length - 1) return null;
  const source = raw.slice(0, sep);
  const id = raw.slice(sep + 1).trim();
  if ((source !== "catalogo" && source !== "usuario") || !id) return null;
  return { source, id };
}

export function catalogRefFromCarry(carry: CatalogExerciseCarry): CatalogExerciseRef {
  const registro_series = normalizeRegistroSeries(carry.registro_series);
  return carry.source === "usuario"
    ? { usuario_ejercicio_id: carry.id, registro_series }
    : { tipo_ejercicio_id: carry.id, registro_series };
}

export function writeCarryToSearchParams(
  sp: URLSearchParams,
  carry: CatalogExerciseCarry,
): URLSearchParams {
  const next = new URLSearchParams(sp);
  next.set(ADD_KEY, `${carry.source}:${carry.id}`);
  next.set(ADD_NAME_KEY, carry.nombre);
  next.set(ADD_REG_KEY, normalizeRegistroSeries(carry.registro_series));
  return next;
}

export function readCarryFromSearchParams(sp: URLSearchParams): CatalogExerciseCarry | null {
  const parsed = parseSourceId(sp.get(ADD_KEY));
  const nombre = (sp.get(ADD_NAME_KEY) ?? "").trim();
  if (!parsed || !nombre) return null;
  return {
    source: parsed.source,
    id: parsed.id,
    nombre,
    registro_series: normalizeRegistroSeries(sp.get(ADD_REG_KEY)),
  };
}

export function clearCarryFromSearchParams(sp: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(sp);
  next.delete(ADD_KEY);
  next.delete(ADD_NAME_KEY);
  next.delete(ADD_REG_KEY);
  return next;
}
