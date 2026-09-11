import type { RoutineExerciseFormData } from "@/types/routine";
import { normalizeRegistroSeries, type RegistroSeries } from "@/types/workout";
import { catalogRefFromCarry, type CatalogExerciseCarry } from "@/lib/catalogExerciseCarry";

/** Misma fila en blanco que `RoutineForm.addExercise` (sin superserie). */
export function routineExerciseFromCatalog(
  carry: CatalogExerciseCarry,
  orden = 0,
): RoutineExerciseFormData {
  const ref = catalogRefFromCarry(carry);
  const registro_series: RegistroSeries = normalizeRegistroSeries(ref.registro_series);
  return {
    tipo_ejercicio_id: ref.tipo_ejercicio_id,
    usuario_ejercicio_id: ref.usuario_ejercicio_id,
    nombre: carry.nombre,
    series_objetivo: 3,
    repes_min: 8,
    repes_max: 12,
    rir: 1,
    orden,
    superset_id: null,
    descanso: 120,
    registro_series,
    duracion_objetivo_seg:
      registro_series === "duracion" || registro_series === "duracion_ritmo"
        ? registro_series === "duracion_ritmo"
          ? 600
          : 45
        : null,
    ritmo_objetivo_seg_km: registro_series === "duracion_ritmo" ? 300 : null,
    series_plan: null,
  };
}
