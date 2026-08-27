import { describe, expect, it } from "vitest";
import {
  actividadToRoutineFormSnapshot,
  buildWorkoutRoutineSnapshot,
  exercisesToRoutineExercises,
  workoutSnapshotToRoutineFormSnapshot,
} from "@/lib/workoutToRoutine";
import type { ActividadWithDetails, ExerciseFormData } from "@/types/workout";

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

  it("no genera plan por serie si todas las series fueron iguales", () => {
    const [ejercicio] = exercisesToRoutineExercises([
      {
        nombre: "Press banca",
        registro_series: "peso_reps",
        sets: [
          { repeticiones: 10, peso_kg: 60, completed: true },
          { repeticiones: 10, peso_kg: 60, completed: true },
        ],
      },
    ]);

    expect(ejercicio.series_plan).toBeNull();
    expect(ejercicio.series_objetivo).toBe(2);
  });

  it("conserva la pirámide al guardar el entreno como rutina", () => {
    const [ejercicio] = exercisesToRoutineExercises([
      {
        nombre: "Press banca",
        registro_series: "peso_reps",
        targetRir: 1,
        sets: [
          { repeticiones: 15, peso_kg: 40, completed: true, tipo_serie: "calentamiento" },
          { repeticiones: 12, peso_kg: 60, completed: true },
          { repeticiones: 10, peso_kg: 70, completed: true },
          { repeticiones: 8, peso_kg: 80, completed: true },
        ],
      },
    ]);

    expect(ejercicio.series_plan).toHaveLength(4);
    expect(ejercicio.series_plan!.map((s) => s.tipo_serie)).toEqual([
      "calentamiento",
      "efectiva",
      "efectiva",
      "efectiva",
    ]);
    // Los pesos que se levantaron pasan a ser el objetivo de cada serie.
    expect(ejercicio.series_plan!.map((s) => s.peso_objetivo_kg)).toEqual([40, 60, 70, 80]);
    // El resumen ignora el calentamiento (15 reps no ensancha el rango).
    expect(ejercicio.repes_min).toBe(8);
    expect(ejercicio.repes_max).toBe(12);
    expect(ejercicio.series_objetivo).toBe(4);
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

  it("convierte actividad pública a snapshot de rutina (solo catálogo)", () => {
    const actividad = {
      id: "act-1",
      titulo: "Push day",
      icono: "dumbbell",
      comentarios: null,
      created_at: "",
      es_publica: true,
      fecha: "",
      fecha_fin: "",
      usuario_id: "other-user",
      ejercicios: [
        {
          id: "ej-1",
          actividad_id: "act-1",
          created_at: "",
          descanso: 90,
          registro_series: "peso_reps",
          rep_range: "8-10",
          rir_objetivo: 2,
          superset_id: null,
          tipo_ejercicio_id: "press-id",
          usuario_ejercicio_id: null,
          usuario_id: "other-user",
          tipo_ejercicio: {
            id: "press-id",
            nombre: "Press banca",
            created_at: "",
            dificultad: null,
            equipment: null,
            gif_url: null,
            grupo_muscular: null,
            imagen: null,
            instructions: null,
            musculos_involucrados: null,
            registro_series: "peso_reps",
            tipo: null,
          },
          series: [
            {
              id: "s1",
              ejercicio_id: "ej-1",
              numero_serie: 1,
              repeticiones: 8,
              peso_kg: 60,
              created_at: "",
              duracion_seg: null,
              ritmo_seg_km: null,
              rir: null,
              completed: true,
              descanso: null,
              usuario_id: "other-user",
            },
          ],
        },
        {
          id: "ej-2",
          actividad_id: "act-1",
          created_at: "",
          descanso: 60,
          registro_series: "peso_reps",
          rep_range: null,
          rir_objetivo: null,
          superset_id: null,
          tipo_ejercicio_id: null,
          usuario_ejercicio_id: "custom-id",
          usuario_id: "other-user",
          tipo_ejercicio: {
            id: "custom-id",
            nombre: "Curl casero",
            created_at: "",
            dificultad: null,
            equipment: null,
            gif_url: null,
            grupo_muscular: null,
            imagen: null,
            instructions: null,
            musculos_involucrados: null,
            registro_series: "peso_reps",
            tipo: null,
            usuario_id: "other-user",
            descripcion: null,
          },
          series: [
            {
              id: "s2",
              ejercicio_id: "ej-2",
              numero_serie: 1,
              repeticiones: 12,
              peso_kg: 10,
              created_at: "",
              duracion_seg: null,
              ritmo_seg_km: null,
              rir: null,
              completed: true,
              descanso: null,
              usuario_id: "other-user",
            },
          ],
        },
      ],
    } as unknown as ActividadWithDetails;

    const form = actividadToRoutineFormSnapshot(actividad, { savedFromUsername: "ana" });
    expect(form).toMatchObject({
      nombre: "Push day",
      descripcion: "Guardada de @ana",
      icono: "dumbbell",
    });
    expect(form!.ejercicios).toHaveLength(1);
    expect(form!.ejercicios[0]).toMatchObject({
      tipo_ejercicio_id: "press-id",
      nombre: "Press banca",
      series_objetivo: 1,
    });
  });
});
