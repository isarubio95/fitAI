import { describe, expect, it } from "vitest";
import {
  isReopeningKnownActiveWorkout,
  mergeServerExercisesIntoForm,
  sessionHasStartedForDrawer,
  shouldShowWorkoutEmptyStart,
} from "@/components/workout/workout-logger/activeSessionRestore";

describe("isReopeningKnownActiveWorkout", () => {
  it("es cierto al abrir la pill de un entreno con ejercicios", () => {
    expect(
      isReopeningKnownActiveWorkout({
        workoutId: "w1",
        activeId: "w1",
        hasExercises: true,
      }),
    ).toBe(true);
  });

  it("es falso si el entreno activo aún no tiene ejercicios", () => {
    expect(
      isReopeningKnownActiveWorkout({
        workoutId: "w1",
        activeId: "w1",
        hasExercises: false,
      }),
    ).toBe(false);
  });
});

describe("sessionHasStartedForDrawer", () => {
  it("no trata la pill como «comenzar entrenamiento»", () => {
    expect(
      sessionHasStartedForDrawer({
        sessionClockStartedAt: null,
        reopeningKnownActiveWorkout: true,
      }),
    ).toBe(true);
  });

  it("sigue en «comenzar» si el cronómetro no está armado y no es una reapertura", () => {
    expect(
      sessionHasStartedForDrawer({
        sessionClockStartedAt: null,
        reopeningKnownActiveWorkout: false,
      }),
    ).toBe(false);
  });
});

describe("shouldShowWorkoutEmptyStart", () => {
  it("oculta el CTA vacío mientras carga un entreno ya iniciado", () => {
    expect(
      shouldShowWorkoutEmptyStart({
        showFloatingActionBar: true,
        exerciseCount: 0,
        waitingForExistingWorkout: true,
      }),
    ).toBe(false);
  });

  it("muestra el CTA si el alta en blanco no tiene ejercicios", () => {
    expect(
      shouldShowWorkoutEmptyStart({
        showFloatingActionBar: true,
        exerciseCount: 0,
        waitingForExistingWorkout: false,
      }),
    ).toBe(true);
  });
});

describe("mergeServerExercisesIntoForm", () => {
  const map = (row: { id: string; nombre: string }) => ({ id: row.id, nombre: row.nombre, sets: [] });
  const server = [
    { id: "e1", nombre: "Sentadillas" },
    { id: "e2", nombre: "Abdominales" },
    { id: "e3", nombre: "Curl" },
  ];

  it("no reañade el entreno ya hidratado (duplicado al recargar la app)", () => {
    const current = server.map(map);
    expect(mergeServerExercisesIntoForm(current, server, map)).toBe(current);
  });

  it("dedup contra la lista pendiente, no contra la del render anterior", () => {
    // El efecto pasivo corre con `exercises` vacío mientras el layout effect
    // ya dejó la lista hidratada en cola: el updater recibe la hidratada.
    const pending = server.map(map);
    const merged = mergeServerExercisesIntoForm(pending, server, map);
    expect(merged.map((e) => e.id)).toEqual(["e1", "e2", "e3"]);
  });

  it("cuela las filas nuevas creadas desde el catálogo", () => {
    const current = [map(server[0])];
    const merged = mergeServerExercisesIntoForm(current, server, map);
    expect(merged.map((e) => e.id)).toEqual(["e1", "e2", "e3"]);
  });

  it("ignora las filas locales aún sin id", () => {
    const local = [{ id: undefined, nombre: "Press", sets: [] }];
    const merged = mergeServerExercisesIntoForm(local, [server[0]], map);
    expect(merged).toHaveLength(2);
  });
});
