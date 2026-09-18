import { describe, expect, it } from "vitest";
import { summarizeSeriesPlan } from "@/lib/seriesPlan";
import type { RoutineSetPlan } from "@/types/routine";

/**
 * Paridad entre `summarizeSeriesPlan` (TypeScript) y `summarize_series_plan`
 * (SQL, migración 20260918102000).
 *
 * Las dos existen porque las escribe gente distinta en momentos distintos: el
 * formulario de la app resume el plan en el cliente, y el servidor MCP lo hace
 * en la base de datos. Si divergen, los escalares de `rutina_ejercicio` dependen
 * de quién guardó la rutina, y eso solo se nota mirando la tarjeta de la rutina
 * o la duración estimada — tarde y sin pista de por qué.
 *
 * Los valores esperados NO están calculados a mano: son la salida real de la
 * función SQL ejecutada contra el proyecto. Escribirlos aquí ya cazó una
 * divergencia (el caso `duracion`: el SQL miraba si `repes_min` tenía valor
 * después de caer al fallback, cuando el original mira si el PLAN traía
 * mínimos).
 *
 * Al tocar cualquiera de las dos versiones, reejecutar la función SQL con estos
 * mismos planes y actualizar los esperados si el cambio es intencionado.
 */

const FALLBACK = {
  series_objetivo: 3,
  repes_min: 8,
  repes_max: 12,
  rir: 2,
  descanso: 90,
  duracion_objetivo_seg: null,
  ritmo_objetivo_seg_km: null,
};

function plan(filas: Array<Partial<RoutineSetPlan>>): RoutineSetPlan[] {
  return filas.map((fila, orden) => ({
    orden,
    tipo_serie: "efectiva",
    repes_min: null,
    repes_max: null,
    rir: null,
    peso_objetivo_kg: null,
    descanso: null,
    duracion_objetivo_seg: null,
    ritmo_objetivo_seg_km: null,
    ...fila,
  })) as RoutineSetPlan[];
}

/** Cada caso: el plan, y lo que devolvió `summarize_series_plan` en Postgres. */
const CASOS: Array<{ nombre: string; plan: RoutineSetPlan[]; sql: Record<string, unknown> }> = [
  {
    nombre: "serie recta: RIR resumen es el mínimo, descanso es la media",
    plan: plan([
      { repes_min: 8, repes_max: 12, rir: 2, descanso: 90 },
      { repes_min: 8, repes_max: 12, rir: 2, descanso: 90 },
      { repes_min: 8, repes_max: 12, rir: 1, descanso: 120 },
    ]),
    sql: { series_objetivo: 3, repes_min: 8, repes_max: 12, rir: 1, descanso: 100 },
  },
  {
    nombre: "con calentamiento: repeticiones solo de las efectivas, descanso de todas",
    plan: plan([
      { tipo_serie: "calentamiento", repes_min: 15, repes_max: 15, rir: 5, descanso: 30 },
      { repes_min: 6, repes_max: 10, rir: 2, descanso: 120 },
      { repes_min: 6, repes_max: 8, rir: 0, descanso: 150 },
    ]),
    sql: { series_objetivo: 3, repes_min: 6, repes_max: 10, rir: 0, descanso: 100 },
  },
  {
    nombre: "rango abierto: sin techo, repes_max cae al mínimo y no se inventa",
    plan: plan([
      { repes_min: 8, rir: 2, descanso: 60 },
      { repes_min: 10, rir: 1, descanso: 60 },
    ]),
    sql: { series_objetivo: 2, repes_min: 8, repes_max: 8, rir: 1, descanso: 60 },
  },
  {
    nombre: "una sola serie AMRAP",
    plan: plan([{ tipo_serie: "amrap", repes_min: 5, repes_max: 5, rir: 0, descanso: 180 }]),
    sql: { series_objetivo: 1, repes_min: 5, repes_max: 5, rir: 0, descanso: 180 },
  },
  {
    nombre: "plan entero de calentamiento: se resume sobre todas, no sobre ninguna",
    plan: plan([
      { tipo_serie: "calentamiento", repes_min: 12, repes_max: 15, rir: 4, descanso: 45 },
      { tipo_serie: "calentamiento", repes_min: 10, repes_max: 12, rir: 3, descanso: 45 },
    ]),
    sql: { series_objetivo: 2, repes_min: 10, repes_max: 15, rir: 3, descanso: 45 },
  },
  {
    nombre: "ejercicio por duración: sin repeticiones en el plan mandan los valores previos",
    plan: plan([
      { duracion_objetivo_seg: 60, descanso: 30 },
      { duracion_objetivo_seg: 45, descanso: 30 },
    ]),
    sql: {
      series_objetivo: 2,
      repes_min: 8,
      repes_max: 12,
      rir: 2,
      descanso: 30,
      duracion_objetivo_seg: 53,
    },
  },
];

describe("summarizeSeriesPlan: paridad TypeScript / SQL", () => {
  for (const caso of CASOS) {
    it(caso.nombre, () => {
      const ts = summarizeSeriesPlan(caso.plan, FALLBACK);

      for (const [campo, esperado] of Object.entries(caso.sql)) {
        expect(ts[campo as keyof typeof ts], `campo ${campo}`).toBe(esperado);
      }
    });
  }
});
