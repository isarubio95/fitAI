import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isNative: false,
  isActive: true,
  appListeners: [] as Array<(state: { isActive: boolean }) => void>,
  schedule: vi.fn(async () => ({ notifications: [{ id: 9001 }] })),
  cancel: vi.fn(async () => {}),
  createChannel: vi.fn(async () => {}),
  checkPermissions: vi.fn(async () => ({ display: "granted" })),
  requestPermissions: vi.fn(async () => ({ display: "granted" })),
  checkExactNotificationSetting: vi.fn(async () => ({ exact_alarm: "granted" })),
  changeExactNotificationSetting: vi.fn(async () => {}),
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => mocks.isNative,
  },
}));

vi.mock("@capacitor/app", () => ({
  App: {
    getState: vi.fn(async () => ({ isActive: mocks.isActive })),
    addListener: vi.fn(async (_event: string, cb: (state: { isActive: boolean }) => void) => {
      mocks.appListeners.push(cb);
      return { remove: async () => {} };
    }),
  },
}));

vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: {
    schedule: mocks.schedule,
    cancel: mocks.cancel,
    createChannel: mocks.createChannel,
    checkPermissions: mocks.checkPermissions,
    requestPermissions: mocks.requestPermissions,
    checkExactNotificationSetting: mocks.checkExactNotificationSetting,
    changeExactNotificationSetting: mocks.changeExactNotificationSetting,
  },
}));

describe("shouldDeliverRestFinishedNotification", () => {
  it("no avisa si el drawer de entrenamiento está abierto y la app en primer plano", async () => {
    const { shouldDeliverRestFinishedNotification } = await import("@/lib/restTimerNotifications");
    expect(shouldDeliverRestFinishedNotification(true, true)).toBe(false);
  });

  it("avisa si el drawer está cerrado", async () => {
    const { shouldDeliverRestFinishedNotification } = await import("@/lib/restTimerNotifications");
    expect(shouldDeliverRestFinishedNotification(false, true)).toBe(true);
  });

  it("avisa si la app está en segundo plano aunque el drawer siga abierto", async () => {
    const { shouldDeliverRestFinishedNotification } = await import("@/lib/restTimerNotifications");
    expect(shouldDeliverRestFinishedNotification(true, false)).toBe(true);
  });
});

describe("scheduleRestTimerNotification y drawer", () => {
  beforeEach(() => {
    mocks.isNative = true;
    mocks.isActive = true;
    mocks.appListeners.length = 0;
    mocks.schedule.mockClear();
    mocks.cancel.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.resetModules();
  });

  async function loadModule() {
    vi.resetModules();
    return import("@/lib/restTimerNotifications");
  }

  it("no programa el aviso si el drawer está abierto", async () => {
    const mod = await loadModule();
    const endTime = Date.now() + 60_000;
    mod.setWorkoutDrawerOpen(true);
    await mod.scheduleRestTimerNotification(endTime);
    expect(mocks.schedule).not.toHaveBeenCalled();
    expect(mocks.cancel).toHaveBeenCalled();
  });

  it("programa el aviso al cerrar el drawer con un descanso pendiente", async () => {
    const mod = await loadModule();
    const endTime = Date.now() + 60_000;
    mod.setWorkoutDrawerOpen(true);
    await mod.scheduleRestTimerNotification(endTime);
    mocks.schedule.mockClear();
    mocks.cancel.mockClear();

    mod.setWorkoutDrawerOpen(false);
    await vi.waitFor(() => {
      expect(mocks.schedule).toHaveBeenCalled();
    });
  });

  it("cancela el aviso programado al abrir el drawer", async () => {
    const mod = await loadModule();
    const endTime = Date.now() + 60_000;
    await mod.scheduleRestTimerNotification(endTime);
    expect(mocks.schedule).toHaveBeenCalled();
    mocks.cancel.mockClear();

    mod.setWorkoutDrawerOpen(true);
    await vi.waitFor(() => {
      expect(mocks.cancel).toHaveBeenCalled();
    });
  });

  it("reprograma el aviso al pasar la app a segundo plano con el drawer abierto", async () => {
    const mod = await loadModule();
    const endTime = Date.now() + 60_000;
    mod.setWorkoutDrawerOpen(true);
    await mod.scheduleRestTimerNotification(endTime);
    mocks.schedule.mockClear();

    mocks.isActive = false;
    mocks.appListeners.forEach((cb) => cb({ isActive: false }));
    await vi.waitFor(() => {
      expect(mocks.schedule).toHaveBeenCalled();
    });
  });
});
