import { describe, expect, it } from "vitest";
import {
  isReopeningKnownActiveWorkout,
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
