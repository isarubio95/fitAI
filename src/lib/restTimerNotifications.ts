import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export const REST_TIMER_NOTIFICATION_ID = 9001;
const CHANNEL_ID = "rest-timer";

let channelReady = false;

async function ensureChannel() {
  if (!Capacitor.isNativePlatform() || channelReady) return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "Descanso",
      description: "Aviso cuando termina el descanso entre series",
      importance: 5,
      visibility: 1,
      sound: "default",
      vibration: true,
    });
    channelReady = true;
  } catch {
    // ignore
  }
}

export async function requestRestTimerNotificationPermission(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await ensureChannel();
      await LocalNotifications.requestPermissions();
    } catch {
      // ignore
    }
    return;
  }

  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

export async function scheduleRestTimerNotification(endTimeMs: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (endTimeMs <= Date.now()) return;

  try {
    await ensureChannel();
    await LocalNotifications.cancel({ notifications: [{ id: REST_TIMER_NOTIFICATION_ID }] });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REST_TIMER_NOTIFICATION_ID,
          title: "¡Descanso terminado!",
          body: "Hora de tu siguiente serie. 💪",
          channelId: CHANNEL_ID,
          schedule: { at: new Date(endTimeMs) },
          sound: "default",
        },
      ],
    });
  } catch (error) {
    console.warn("No se pudo programar la notificación de descanso:", error);
  }
}

export async function cancelRestTimerNotification(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: REST_TIMER_NOTIFICATION_ID }] });
  } catch {
    // ignore
  }
}
