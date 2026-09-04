import { beforeEach, describe, expect, it, vi } from "vitest";
import { LyftaProxyError } from "@/lib/lyfta/proxy";
import type { MappedLyftaExercise } from "@/lib/lyfta/mapLyftaWorkout";

const { mockFetchLyfta, inserts, mapStore, createFrom } = vi.hoisted(() => {
  const inserts: Array<{ table: string; payload: unknown }> = [];
  const mapStore = new Map<string, { lyfta_nombre: string; tipo_ejercicio_id: string | null }>();

  function thenableData(data: unknown, count?: number) {
    return Promise.resolve({
      data,
      error: null,
      count: count ?? (Array.isArray(data) ? data.length : 0),
    });
  }

  function applyMapUpsert(payload: unknown) {
    const rows = Array.isArray(payload) ? payload : [payload];
    for (const row of rows as Array<{
      lyfta_id: string;
      lyfta_nombre?: string;
      tipo_ejercicio_id?: string | null;
    }>) {
      const existing = mapStore.get(row.lyfta_id);
      if (row.tipo_ejercicio_id) {
        mapStore.set(row.lyfta_id, {
          lyfta_nombre: row.lyfta_nombre ?? existing?.lyfta_nombre ?? "",
          tipo_ejercicio_id: row.tipo_ejercicio_id,
        });
        continue;
      }
      if (!existing) {
        mapStore.set(row.lyfta_id, {
          lyfta_nombre: row.lyfta_nombre ?? "",
          tipo_ejercicio_id: null,
        });
      }
    }
  }

  function resolveSelect(table: string, state: { isNull?: string }) {
    if (table === "lyfta_ejercicio_map") {
      let rows = [...mapStore.entries()].map(([lyfta_id, v]) => ({
        lyfta_id,
        lyfta_nombre: v.lyfta_nombre,
        tipo_ejercicio_id: v.tipo_ejercicio_id,
      }));
      if (state.isNull === "tipo_ejercicio_id") {
        rows = rows.filter((r) => r.tipo_ejercicio_id == null);
      }
      return thenableData(rows);
    }
    return thenableData([]);
  }

  function createFrom(table: string) {
    const state: { isNull?: string } = {};
    const self: Record<string, unknown> = {};
    const api = self as {
      select: () => typeof api;
      eq: () => typeof api;
      not: () => typeof api;
      is: (col: string, val: unknown) => typeof api;
      range: () => Promise<unknown>;
      insert: (payload: unknown) => unknown;
      upsert: (payload: unknown) => Promise<unknown>;
      delete: () => typeof api;
      in: () => Promise<unknown>;
      then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) => Promise<unknown>;
    };
    api.select = () => api;
    api.eq = () => api;
    api.not = () => api;
    api.is = (col, val) => {
      if (val === null) state.isNull = col;
      return api;
    };
    api.range = () => resolveSelect(table, state);
    api.insert = (payload) => {
      inserts.push({ table, payload });
      return {
        select: () => ({
          single: async () => ({ data: { id: `${table}-1` }, error: null }),
          then: (onFulfilled: (v: unknown) => unknown) =>
            Promise.resolve({
              data: Array.isArray(payload)
                ? (payload as unknown[]).map((_, i) => ({ id: `${table}-${i}` }))
                : [{ id: `${table}-0` }],
              error: null,
            }).then(onFulfilled),
        }),
      };
    };
    api.upsert = (payload) => {
      if (table === "lyfta_ejercicio_map") applyMapUpsert(payload);
      return Promise.resolve({ error: null });
    };
    api.delete = () => api;
    api.in = () => Promise.resolve({ error: null });
    api.then = (resolve, reject) => resolveSelect(table, state).then(resolve, reject);
    return api;
  }

  return { mockFetchLyfta: vi.fn(), inserts, mapStore, createFrom };
});

vi.mock("@/lib/lyfta/proxy", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/lyfta/proxy")>();
  return { ...actual, fetchLyftaResource: mockFetchLyfta };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => createFrom(table),
  },
}));

function workoutWith(exercise: {
  exercise_id: string;
  exercise_name: string;
}) {
  return {
    id: 1,
    title: "Push",
    workout_perform_date: "2025-01-01T10:00:00Z",
    exercises: [
      {
        ...exercise,
        exercise_type: "weight_reps",
        sets: [{ reps: "8", weight: "60", is_completed: true }],
      },
    ],
  };
}

function mockUnmatchedGizmo() {
  mockFetchLyfta.mockImplementation(async ({ resource }: { resource: string }) => {
    if (resource === "exercises_library") {
      return {
        results: [{ id: "gizmo", name: "Gizmo Twist 9000" }],
        pagination: { hasMore: false },
      };
    }
    if (resource === "workouts_summary") throw new LyftaProxyError("not found", 404);
    if (resource === "workouts") {
      return {
        total_pages: 1,
        workouts: [workoutWith({ exercise_id: "gizmo", exercise_name: "Gizmo Twist 9000" })],
      };
    }
    throw new LyftaProxyError("not found", 404);
  });
}

beforeEach(async () => {
  inserts.length = 0;
  mapStore.clear();
  mockFetchLyfta.mockReset();
  mockFetchLyfta.mockImplementation(async ({ resource }: { resource: string }) => {
    if (resource === "exercises_library") {
      return {
        results: [{ id: "lyfta-bench", name: "Barbell Bench Press" }],
        pagination: { hasMore: false },
      };
    }
    if (resource === "workouts_summary") {
      throw new LyftaProxyError("not found", 404);
    }
    if (resource === "workouts") {
      return { total_pages: 1, workouts: [workoutWith({ exercise_id: "lyfta-bench", exercise_name: "Barbell Bench Press" })] };
    }
    throw new LyftaProxyError("not found", 404);
  });
  const { clearPreparedLyftaImport } = await import("@/lib/lyfta/importLyfta");
  clearPreparedLyftaImport();
});

const catalog = [
  { id: "banca-barra", nombre: "Press Banca con Barra", source: "catalogo" as const },
];

describe("prepareLyftaImport / completeLyftaImport", () => {
  it("no inserta usuario_ejercicio al importar un match automático", async () => {
    const { prepareLyftaImport } = await import("@/lib/lyfta/importLyfta");
    const result = await prepareLyftaImport({
      userId: "u1",
      apiKey: "key",
      scope: "history",
      catalog,
    });
    expect(result.status).toBe("done");
    expect(inserts.some((i) => i.table === "usuario_ejercicio")).toBe(false);
    expect(inserts.some((i) => i.table === "actividad")).toBe(true);
  });

  it("persiste set_type_id de Lyfta en serie.tipo_serie", async () => {
    mockFetchLyfta.mockImplementation(async ({ resource }: { resource: string }) => {
      if (resource === "exercises_library") {
        return {
          results: [{ id: "lyfta-bench", name: "Barbell Bench Press" }],
          pagination: { hasMore: false },
        };
      }
      if (resource === "workouts_summary") throw new LyftaProxyError("not found", 404);
      if (resource === "workouts") {
        return {
          total_pages: 1,
          workouts: [
            {
              id: 1,
              title: "Push",
              workout_perform_date: "2025-01-01T10:00:00Z",
              exercises: [
                {
                  exercise_id: "lyfta-bench",
                  exercise_name: "Barbell Bench Press",
                  exercise_type: "weight_reps",
                  sets: [
                    { reps: "12", weight: "40", set_type_id: 1, is_completed: true },
                    { reps: "8", weight: "60", set_type_id: 0, is_completed: true },
                    { reps: "8", weight: "50", set_type_id: 2, is_completed: true },
                  ],
                },
              ],
            },
          ],
        };
      }
      throw new LyftaProxyError("not found", 404);
    });

    const { prepareLyftaImport } = await import("@/lib/lyfta/importLyfta");
    const result = await prepareLyftaImport({
      userId: "u1",
      apiKey: "key",
      scope: "history",
      catalog,
    });
    expect(result.status).toBe("done");
    const serieInsert = inserts.find((i) => i.table === "serie");
    const rows = Array.isArray(serieInsert?.payload) ? serieInsert.payload : [serieInsert?.payload];
    expect(rows).toMatchObject([
      { tipo_serie: "calentamiento", peso_kg: 40, repeticiones: 12 },
      { tipo_serie: "efectiva", peso_kg: 60, repeticiones: 8 },
      { tipo_serie: "dropset", peso_kg: 50, repeticiones: 8 },
    ]);
  });

  it("en rutinas no cuenta el calentamiento en series_objetivo ni en el rango", async () => {
    mockFetchLyfta.mockImplementation(async ({ resource }: { resource: string }) => {
      if (resource === "exercises_library") {
        return {
          results: [{ id: "lyfta-bench", name: "Barbell Bench Press" }],
          pagination: { hasMore: false },
        };
      }
      if (resource === "workouts") {
        return {
          total_pages: 1,
          workouts: [
            {
              id: 1,
              title: "Push",
              workout_perform_date: "2025-01-01T10:00:00Z",
              exercises: [
                {
                  exercise_id: "lyfta-bench",
                  exercise_name: "Barbell Bench Press",
                  exercise_type: "weight_reps",
                  sets: [
                    { reps: "15", weight: "20", set_type_id: 1, is_completed: true },
                    { reps: "8", weight: "60", set_type_id: 0, is_completed: true },
                    { reps: "6", weight: "70", set_type_id: 0, is_completed: true },
                  ],
                },
              ],
            },
          ],
        };
      }
      throw new LyftaProxyError("not found", 404);
    });

    const { prepareLyftaImport } = await import("@/lib/lyfta/importLyfta");
    const result = await prepareLyftaImport({
      userId: "u1",
      apiKey: "key",
      scope: "routines",
      catalog,
    });
    expect(result.status).toBe("done");
    const rutinaEj = inserts.find((i) => i.table === "rutina_ejercicio");
    const rows = Array.isArray(rutinaEj?.payload) ? rutinaEj.payload : [rutinaEj?.payload];
    expect(rows[0]).toMatchObject({
      series_objetivo: 2,
      repes_min: 6,
      repes_max: 8,
    });
  });

  it("no persiste historial si hay ejercicios sin par", async () => {
    mockUnmatchedGizmo();

    const { prepareLyftaImport, completeLyftaImport } = await import("@/lib/lyfta/importLyfta");
    const prepared = await prepareLyftaImport({
      userId: "u1",
      apiKey: "key",
      scope: "history",
      catalog,
    });
    expect(prepared.status).toBe("needs_review");
    expect(inserts.some((i) => i.table === "actividad")).toBe(false);
    expect(inserts.some((i) => i.table === "usuario_ejercicio")).toBe(false);

    if (prepared.status !== "needs_review") throw new Error("expected review");
    const completed = await completeLyftaImport({
      resolutions: prepared.unmatched.map((u) => ({ lyftaId: u.lyftaId, tipoEjercicioId: null })),
    });
    expect(completed.exercisesOmitted).toBe(1);
    expect(completed.workoutsImported).toBe(0);
    expect(completed.customExercises).toBe(0);
    expect(inserts.some((i) => i.table === "actividad")).toBe(false);
  });

  it("crea usuario_ejercicio cuando se elige crear personalizado", async () => {
    mockUnmatchedGizmo();

    const { prepareLyftaImport, completeLyftaImport } = await import("@/lib/lyfta/importLyfta");
    const prepared = await prepareLyftaImport({
      userId: "u1",
      apiKey: "key",
      scope: "history",
      catalog,
    });
    expect(prepared.status).toBe("needs_review");
    if (prepared.status !== "needs_review") throw new Error("expected review");

    const completed = await completeLyftaImport({
      resolutions: prepared.unmatched.map((u) => ({
        lyftaId: u.lyftaId,
        tipoEjercicioId: null,
        createCustom: true,
      })),
    });
    expect(completed.customExercises).toBe(1);
    expect(completed.workoutsImported).toBe(1);
    expect(inserts.some((i) => i.table === "usuario_ejercicio")).toBe(true);
    const ejercicioInsert = inserts.find((i) => i.table === "ejercicio");
    const rows = Array.isArray(ejercicioInsert?.payload)
      ? ejercicioInsert.payload
      : [ejercicioInsert?.payload];
    expect(rows[0]).toMatchObject({
      tipo_ejercicio_id: null,
      usuario_ejercicio_id: "usuario_ejercicio-1",
    });
  });

  it("reutiliza un ejercicio personalizado del usuario con el mismo nombre", async () => {
    mockUnmatchedGizmo();

    const { prepareLyftaImport } = await import("@/lib/lyfta/importLyfta");
    const result = await prepareLyftaImport({
      userId: "u1",
      apiKey: "key",
      scope: "history",
      catalog: [
        ...catalog,
        { id: "my-gizmo", nombre: "Gizmo Twist 9000", source: "usuario" as const },
      ],
    });
    expect(result.status).toBe("done");
    expect(inserts.some((i) => i.table === "usuario_ejercicio")).toBe(false);
    expect(inserts.some((i) => i.table === "actividad")).toBe(true);
    const ejercicioInsert = inserts.find((i) => i.table === "ejercicio");
    const rows = Array.isArray(ejercicioInsert?.payload)
      ? ejercicioInsert.payload
      : [ejercicioInsert?.payload];
    expect(rows[0]).toMatchObject({
      tipo_ejercicio_id: null,
      usuario_ejercicio_id: "my-gizmo",
    });
  });
});

describe("filterMappedExercisesForImport", () => {
  it("omite unmatched y deja los mapeados", async () => {
    const { filterMappedExercisesForImport } = await import("@/lib/lyfta/importLyfta");
    const exercises: MappedLyftaExercise[] = [
      {
        lyftaExerciseId: "keep",
        nombre: "Bench",
        registro_series: "peso_reps",
        descanso: 90,
        supersetKey: null,
        sets: [{ repeticiones: 8, peso_kg: 50, duracion_seg: null, rir: null, tipo_serie: "efectiva" }],
      },
      {
        lyftaExerciseId: "skip",
        nombre: "Gizmo",
        registro_series: "peso_reps",
        descanso: 90,
        supersetKey: null,
        sets: [{ repeticiones: 8, peso_kg: 50, duracion_seg: null, rir: null, tipo_serie: "efectiva" }],
      },
    ];
    const kept = filterMappedExercisesForImport(
      exercises,
      new Map([["keep", "tipo-1"]]),
      new Set(["skip"]),
    );
    expect(kept).toHaveLength(1);
    expect(kept[0].lyftaExerciseId).toBe("keep");
  });

  it("mantiene ejercicios resueltos como personalizados", async () => {
    const { filterMappedExercisesForImport } = await import("@/lib/lyfta/importLyfta");
    const exercises: MappedLyftaExercise[] = [
      {
        lyftaExerciseId: "custom",
        nombre: "Gizmo",
        registro_series: "peso_reps",
        descanso: 90,
        supersetKey: null,
        sets: [{ repeticiones: 8, peso_kg: 50, duracion_seg: null, rir: null, tipo_serie: "efectiva" }],
      },
    ];
    const kept = filterMappedExercisesForImport(
      exercises,
      new Map(),
      new Set(),
      new Map([["custom", "ue-1"]]),
    );
    expect(kept).toHaveLength(1);
  });
});
