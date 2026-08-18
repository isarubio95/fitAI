import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { isRestFinishedNotificationEnabled } from "@/lib/notificationPreferences";

export const REST_TIMER_NOTIFICATION_ID = 9001;
const CHANNEL_ID = "rest-timer";
const EXACT_ALARM_PROMPT_KEY = "fitai-exact-alarm-prompted";

let channelReady = false;
let appListenerRegistered = false;
let pendingEndTimeMs: number | null = null;
let workoutDrawerOpen = false;
let appIsActive = true;
let scheduleGeneration = 0;
let scheduleInFlight = false;

/**
 * El aviso de descanso no debe saltar si el usuario ya está mirando el
 * entrenamiento activo: ahí se ve RestProgressBar.
 */
export function shouldDeliverRestFinishedNotification(
  drawerOpen: boolean,
  appActive: boolean,
): boolean {
  return !(drawerOpen && appActive);
}

export function isWorkoutDrawerOpen(): boolean {
  return workoutDrawerOpen;
}

export function setWorkoutDrawerOpen(open: boolean): void {
  if (workoutDrawerOpen === open) return;
  workoutDrawerOpen = open;
  syncScheduledRestNotification();
}

function shouldDeliverNow(): boolean {
  return shouldDeliverRestFinishedNotification(workoutDrawerOpen, appIsActive);
}

function syncScheduledRestNotification() {
  if (!pendingEndTimeMs || pendingEndTimeMs <= Date.now()) return;
  if (shouldDeliverNow()) {
    void scheduleRestTimerNotification(pendingEndTimeMs);
    return;
  }
  void cancelScheduledNotificationOnly();
}

async function ensureChannel() {
  if (!Capacitor.isNativePlatform() || channelReady) return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "Descanso",
      description: "Aviso cuando termina el descanso entre series",
      importance: 5,
      visibility: 1,
      vibration: true,
    });
    channelReady = true;
  } catch {
    // ignore
  }
}

async function cancelScheduledNotificationOnly(): Promise<void> {
  scheduleGeneration += 1;
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: REST_TIMER_NOTIFICATION_ID }] });
  } catch {
    // ignore
  }
}

function registerAppStateListener() {
  if (!Capacitor.isNativePlatform() || appListenerRegistered) return;
  appListenerRegistered = true;

  void App.getState()
    .then((state) => {
      appIsActive = state.isActive;
      syncScheduledRestNotification();
    })
    .catch(() => {
      // ignore
    });

  void App.addListener("appStateChange", ({ isActive }) => {
    appIsActive = isActive;
    syncScheduledRestNotification();
  });
}

async function ensureExactAlarmPermission(): Promise<boolean> {
  try {
    const setting = await LocalNotifications.checkExactNotificationSetting();
    if (setting.exact_alarm === "granted") return true;

    const prompted = localStorage.getItem(EXACT_ALARM_PROMPT_KEY);
    if (!prompted) {
      localStorage.setItem(EXACT_ALARM_PROMPT_KEY, "1");
      await LocalNotifications.changeExactNotificationSetting();
    }
    return false;
  } catch {
    return true;
  }
}

export async function ensureRestTimerNotificationsReady(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  if (!isRestFinishedNotificationEnabled()) return false;

  registerAppStateListener();
  await ensureChannel();

  const current = await LocalNotifications.checkPermissions();
  if (current.display !== "granted") {
    const requested = await LocalNotifications.requestPermissions();
    if (requested.display !== "granted") return false;
  }

  return ensureExactAlarmPermission();
}

export async function requestRestTimerNotificationPermission(): Promise<void> {
  if (!isRestFinishedNotificationEnabled()) return;
  await ensureRestTimerNotificationsReady();

  if (!Capacitor.isNativePlatform() && "Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

export async function scheduleRestTimerNotification(endTimeMs: number): Promise<void> {
  if (!isRestFinishedNotificationEnabled()) {
    pendingEndTimeMs = null;
    return;
  }
  if (endTimeMs <= Date.now()) return;

  pendingEndTimeMs = endTimeMs;
  registerAppStateListener();

  if (!Capacitor.isNativePlatform()) return;

  if (!shouldDeliverNow()) {
    await cancelScheduledNotificationOnly();
    return;
  }

  if (scheduleInFlight) return;
  scheduleInFlight = true;
  const token = scheduleGeneration;
  try {
    const ready = await ensureRestTimerNotificationsReady();
    if (!ready) {
      console.warn("Permisos de alarma exacta no concedidos; el aviso de descanso puede retrasarse.");
    }

    if (token !== scheduleGeneration || !shouldDeliverNow()) return;

    try {
      await ensureChannel();
      await LocalNotifications.cancel({ notifications: [{ id: REST_TIMER_NOTIFICATION_ID }] });

      if (token !== scheduleGeneration || !shouldDeliverNow()) return;

      const result = await LocalNotifications.schedule({
        notifications: [
          {
            id: REST_TIMER_NOTIFICATION_ID,
            title: "¡Descanso terminado!",
            body: "Hora de tu siguiente serie.",
            channelId: CHANNEL_ID,
            smallIcon: "ic_stat_notification",
            schedule: {
              at: new Date(endTimeMs),
              allowWhileIdle: true,
            },
          },
        ],
      });

      if (token !== scheduleGeneration || !shouldDeliverNow()) {
        await cancelScheduledNotificationOnly();
        return;
      }

      const scheduled = result.notifications.some((n) => n.id === REST_TIMER_NOTIFICATION_ID);
      if (!scheduled) {
        console.warn("La notificación de descanso no quedó programada.");
      }
    } catch (error) {
      console.warn("No se pudo programar la notificación de descanso:", error);
    }
  } finally {
    scheduleInFlight = false;
  }
}

export async function cancelRestTimerNotification(): Promise<void> {
  pendingEndTimeMs = null;
  await cancelScheduledNotificationOnly();
}
