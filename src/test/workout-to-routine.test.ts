import { describe, expect, it } from "vitest";
import {
  buildWorkoutRoutineSnapshot,
  exercisesToRoutineExercises,
  workoutSnapshotToRoutineFormSnapshot,
} from "@/lib/workoutToRoutine";
import type { ExerciseFormData } from "@/types/workout";

describe("workoutToRoutine", () => {
  it("convierte series registradas en objetivos de rutina", () => {
    const exercises: ExerciseFormData[] = [
      {
        tipo_ejercicio_id: "press-id",
        nombre: "Press banca",
        targetRir: 2,
        descanso: 90,
        registro_series: "peso_reps",
        sets: [
          { repeticiones: 8, peso_kg: 60, completed: true },
          { repeticiones: 10, peso_kg: 60, completed: true },
        ],
      },
      {
        usuario_ejercicio_id: "curl-id",
        nombre: "Curl",
        superset_id: "ss-1",
        sets: [{ repeticiones: 12, peso_kg: 12, completed: true }],
      },
    ];

    const routineExercises = exercisesToRoutineExercises(exercises);

    expect(routineExercises).toHaveLength(2);
    expect(routineExercises[0]).toMatchObject({
      tipo_ejercicio_id: "press-id",
      nombre: "Press banca",
      series_objetivo: 2,
      repes_min: 8,
      repes_max: 10,
      rir: 2,
      descanso: 90,
      registro_series: "peso_reps",
    });
    expect(routineExercises[1]).toMatchObject({
      usuario_ejercicio_id: "curl-id",
      series_objetivo: 1,
      repes_min: 12,
      repes_max: 12,
      superset_id: "ss-1",
    });
  });

  it("ignora ejercicios sin series registradas", () => {
    const snapshot = buildWorkoutRoutineSnapshot("Pierna", "dumbbell", [
      {
        nombre: "Sentadilla",
        sets: [{ repeticiones: 0, peso_kg: 0 }],
      },
    ]);

    expect(snapshot).toBeNull();
  });

  it("genera snapshot listo para el formulario de rutina", () => {
    const snapshot = buildWorkoutRoutineSnapshot("Torso", "dumbbell", [
      {
        nombre: "Remo",
        repRange: "6-8",
        sets: [{ repeticiones: 7, peso_kg: 50, completed: true }],
      },
    ]);

    expect(snapshot).not.toBeNull();
    expect(workoutSnapshotToRoutineFormSnapshot(snapshot!)).toMatchObject({
      nombre: "Torso",
      descripcion: "",
      icono: "dumbbell",
      ejercicios: [
        expect.objectContaining({
          nombre: "Remo",
          series_objetivo: 1,
          repes_min: 6,
          repes_max: 8,
        }),
      ],
    });
  });
});
