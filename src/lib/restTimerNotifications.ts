import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export const REST_TIMER_NOTIFICATION_ID = 9001;
const CHANNEL_ID = "rest-timer";
const EXACT_ALARM_PROMPT_KEY = "fitai-exact-alarm-prompted";

let channelReady = false;
let appListenerRegistered = false;
let pendingEndTimeMs: number | null = null;

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

function registerAppStateListener() {
  if (!Capacitor.isNativePlatform() || appListenerRegistered) return;
  appListenerRegistered = true;

  void App.addListener("appStateChange", ({ isActive }) => {
    if (!isActive && pendingEndTimeMs && pendingEndTimeMs > Date.now()) {
      void scheduleRestTimerNotification(pendingEndTimeMs);
    }
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
  await ensureRestTimerNotificationsReady();

  if (!Capacitor.isNativePlatform() && "Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

export async function scheduleRestTimerNotification(endTimeMs: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (endTimeMs <= Date.now()) return;

  pendingEndTimeMs = endTimeMs;
  registerAppStateListener();

  const ready = await ensureRestTimerNotificationsReady();
  if (!ready) {
    console.warn("Permisos de alarma exacta no concedidos; el aviso de descanso puede retrasarse.");
  }

  try {
    await ensureChannel();
    await LocalNotifications.cancel({ notifications: [{ id: REST_TIMER_NOTIFICATION_ID }] });

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

    const scheduled = result.notifications.some((n) => n.id === REST_TIMER_NOTIFICATION_ID);
    if (!scheduled) {
      console.warn("La notificación de descanso no quedó programada.");
    }
  } catch (error) {
    console.warn("No se pudo programar la notificación de descanso:", error);
  }
}

export async function cancelRestTimerNotification(): Promise<void> {
  pendingEndTimeMs = null;
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: REST_TIMER_NOTIFICATION_ID }] });
  } catch {
    // ignore
  }
}
