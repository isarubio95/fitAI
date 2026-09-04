import { describe, expect, it } from "vitest";
import {
  mapLyftaWorkout,
  parseLyftaDurationToMs,
  mapLyftaRoutineFromTemplate,
  extractLyftaTemplateList,
} from "@/lib/lyfta/mapLyftaWorkout";
import { reconstructRoutinesFromWorkouts } from "@/lib/lyfta/reconstructRoutines";
import type { MappedLyftaWorkout } from "@/lib/lyfta/mapLyftaWorkout";

describe("parseLyftaDurationToMs", () => {
  it("parsea HH:MM:SS", () => {
    expect(parseLyftaDurationToMs("01:06:25")).toBe(((1 * 60 + 6) * 60 + 25) * 1000);
  });

  it("parsea segundos sueltos", () => {
    expect(parseLyftaDurationToMs("90")).toBe(90_000);
  });
});

describe("mapLyftaWorkout", () => {
  it("mapea título, fecha, peso/reps y RIR", () => {
    const mapped = mapLyftaWorkout({
      id: 42,
      title: "Push day",
      workout_perform_date: "2025-07-15 06:42:09",
      workout_duration: "00:10:00",
      exercises: [
        {
          exercise_id: "ex-bench",
          excercise_name: "Bench Press",
          exercise_type: "weight_reps",
          exercise_rest_time: 90,
          sets: [
            { reps: "10", weight: "60", rir: "2", is_completed: true },
            { reps: "8", weight: "65", rir: "1", is_completed: true },
          ],
        },
      ],
    });

    expect(mapped).not.toBeNull();
    expect(mapped!.origenExternoId).toBe("42");
    expect(mapped!.titulo).toBe("Push day");
    expect(mapped!.fechaFin).not.toBe(mapped!.fecha);
    expect(mapped!.exercises).toHaveLength(1);
    expect(mapped!.exercises[0]).toMatchObject({
      lyftaExerciseId: "ex-bench",
      nombre: "Bench Press",
      registro_series: "peso_reps",
      descanso: 90,
      sets: [
        { repeticiones: 10, peso_kg: 60, rir: 2, tipo_serie: "efectiva" },
        { repeticiones: 8, peso_kg: 65, rir: 1, tipo_serie: "efectiva" },
      ],
    });
  });

  it("omite series vacías y workouts sin series", () => {
    expect(
      mapLyftaWorkout({
        id: 1,
        title: "Empty",
        exercises: [{ excercise_name: "Curl", sets: [{ reps: "", weight: "" }] }],
      }),
    ).toBeNull();
  });

  it("mapea ejercicios de duración", () => {
    const mapped = mapLyftaWorkout({
      id: 7,
      title: "Finisher",
      workout_perform_date: "2025-01-01T10:00:00",
      exercises: [
        {
          exercise_name: "Plank",
          exercise_type: "duration",
          sets: [{ duration: "45", is_completed: true }],
        },
      ],
    });
    expect(mapped!.exercises[0].registro_series).toBe("duracion");
    expect(mapped!.exercises[0].sets[0].duracion_seg).toBe(45);
    expect(mapped!.exercises[0].sets[0].tipo_serie).toBe("efectiva");
  });

  it("mapea set_type_id a tipo_serie y deja ids desconocidos como efectiva", () => {
    const mapped = mapLyftaWorkout({
      id: 3,
      title: "Bench",
      workout_perform_date: "2025-01-01T10:00:00",
      exercises: [
        {
          exercise_name: "Bench Press",
          exercise_type: "weight_reps",
          sets: [
            { reps: "12", weight: "40", set_type_id: 1, is_completed: true },
            { reps: "8", weight: "60", set_type_id: 0, is_completed: true },
            { reps: "8", weight: "50", set_type_id: "2", is_completed: true },
            { reps: "6", weight: "60", set_type_id: 3, is_completed: true },
            { reps: "8", weight: "55", set_type_id: 9, is_completed: true },
          ],
        },
      ],
    });
    expect(mapped!.exercises[0].sets.map((s) => s.tipo_serie)).toEqual([
      "calentamiento",
      "efectiva",
      "dropset",
      "amrap",
      "efectiva",
    ]);
  });
});

describe("reconstructRoutinesFromWorkouts", () => {
  it("deja un rutina por título usando el workout más reciente", () => {
    const workouts: MappedLyftaWorkout[] = [
      {
        origenExternoId: "1",
        titulo: "Push",
        fecha: "2025-01-01T10:00:00.000Z",
        fechaFin: "2025-01-01T11:00:00.000Z",
        exercises: [
          {
            lyftaExerciseId: "b1",
            nombre: "Bench",
            registro_series: "peso_reps",
            descanso: 90,
            supersetKey: null,
            sets: [{ repeticiones: 8, peso_kg: 50, duracion_seg: null, rir: null, tipo_serie: "efectiva" }],
          },
        ],
      },
      {
        origenExternoId: "2",
        titulo: "Push",
        fecha: "2025-02-01T10:00:00.000Z",
        fechaFin: "2025-02-01T11:00:00.000Z",
        exercises: [
          {
            lyftaExerciseId: "b2",
            nombre: "Bench",
            registro_series: "peso_reps",
            descanso: 120,
            supersetKey: null,
            sets: [{ repeticiones: 6, peso_kg: 70, duracion_seg: null, rir: null, tipo_serie: "efectiva" }],
          },
        ],
      },
      {
        origenExternoId: "3",
        titulo: "Pull",
        fecha: "2025-01-15T10:00:00.000Z",
        fechaFin: "2025-01-15T11:00:00.000Z",
        exercises: [
          {
            lyftaExerciseId: "3",
            nombre: "Row",
            registro_series: "peso_reps",
            descanso: 90,
            supersetKey: null,
            sets: [{ repeticiones: 10, peso_kg: 40, duracion_seg: null, rir: null, tipo_serie: "efectiva" }],
          },
        ],
      },
    ];

    const routines = reconstructRoutinesFromWorkouts(workouts);
    expect(routines).toHaveLength(2);
    const push = routines.find((r) => r.nombre === "Push")!;
    expect(push.origenExternoId).toBe("title:push");
    expect(push.exercises[0].sets[0].peso_kg).toBe(70);
  });
});

describe("Lyfta templates payload", () => {
  it("extrae listas anidadas y mapea plantillas", () => {
    const list = extractLyftaTemplateList({
      data: {
        templates: [
          {
            id: 9,
            title: "Leg day",
            exercises: [
              {
                excercise_name: "Squat",
                exercise_type: "weight_reps",
                sets: [{ reps: "5", weight: "100" }],
              },
            ],
          },
        ],
      },
    });
    expect(list).toHaveLength(1);
    const mapped = mapLyftaRoutineFromTemplate(list[0]);
    expect(mapped).toMatchObject({
      origenExternoId: "template:9",
      nombre: "Leg day",
    });
  });
});
