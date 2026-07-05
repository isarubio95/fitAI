import { useState, useEffect, useCallback, useRef } from "react";
import {
  cancelRestTimerNotification,
  requestRestTimerNotificationPermission,
  scheduleRestTimerNotification,
} from "@/lib/restTimerNotifications";

interface TimerState {
  /** Which exercise+set is running, e.g. "0-2" */
  activeKey: string | null;
  /** Absolute end time (Date.now() based) */
  endTime: number | null;
  /** Remaining seconds for display */
  remaining: number;
  /** Initial duration in seconds (for progress UI) */
  duration: number;
  /** Whether the timer finished */
  finished: boolean;
}

interface PersistedRestTimer {
  activeKey: string;
  endTime: number;
  duration: number;
  workoutId?: string | null;
}

const REST_TIMER_STORAGE_KEY = "fitai-rest-timer";
/** Tras este margen, un descanso ya vencido no se restaura al recargar. */
const FINISHED_GRACE_MS = 5 * 60 * 1000;

function clearPersistedRestTimer() {
  try {
    localStorage.removeItem(REST_TIMER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function loadPersistedRestTimer(): TimerState | null {
  try {
    const raw = localStorage.getItem(REST_TIMER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PersistedRestTimer;
    if (!parsed.activeKey || !parsed.endTime || !parsed.duration) return null;

    const remainingMs = parsed.endTime - Date.now();
    if (remainingMs <= 0) {
      if (Date.now() - parsed.endTime > FINISHED_GRACE_MS) {
        clearPersistedRestTimer();
        return null;
      }
      return {
        activeKey: parsed.activeKey,
        endTime: parsed.endTime,
        remaining: 0,
        duration: parsed.duration,
        finished: true,
      };
    }

    return {
      activeKey: parsed.activeKey,
      endTime: parsed.endTime,
      remaining: Math.ceil(remainingMs / 1000),
      duration: parsed.duration,
      finished: false,
    };
  } catch {
    clearPersistedRestTimer();
    return null;
  }
}

function persistRestTimer(state: TimerState, workoutId?: string | null) {
  if (!state.activeKey || !state.endTime || !state.duration) {
    clearPersistedRestTimer();
    return;
  }
  try {
    const payload: PersistedRestTimer = {
      activeKey: state.activeKey,
      endTime: state.endTime,
      duration: state.duration,
      workoutId: workoutId ?? null,
    };
    localStorage.setItem(REST_TIMER_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

let notificationPermissionRequested = false;

function requestNotifPermission() {
  if (notificationPermissionRequested) return;
  notificationPermissionRequested = true;
  void requestRestTimerNotificationPermission();
}

/** Format seconds to M:SS */
export function formatMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Parse M:SS string to seconds. Returns null if invalid. */
export function parseMSS(value: string): number | null {
  // Accept "M:SS", "MM:SS", or bare number of seconds
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }
  const num = parseInt(value, 10);
  if (!isNaN(num) && num >= 0) return num;
  return null;
}

// Singleton audio context to reuse
let beepAudio: HTMLAudioElement | null = null;
function playBeep() {
  try {
    if (!beepAudio) {
      // Generate a short beep using a data URI (440Hz sine wave, ~0.3s)
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      // Second beep
      setTimeout(() => {
        try {
          const ctx2 = new AudioContext();
          const osc2 = ctx2.createOscillator();
          const gain2 = ctx2.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx2.destination);
          osc2.frequency.value = 880;
          gain2.gain.value = 0.3;
          osc2.start();
          osc2.stop(ctx2.currentTime + 0.3);
        } catch {}
      }, 400);
    }
  } catch {
    // Audio not available
  }
}

export function useRestTimer() {
  const hydratedFinishedRef = useRef(false);
  const workoutIdRef = useRef<string | null>(null);

  const [state, setState] = useState<TimerState>(() => {
    const restored = loadPersistedRestTimer();
    if (restored?.finished) hydratedFinishedRef.current = true;
    return restored ?? {
      activeKey: null,
      endTime: null,
      remaining: 0,
      duration: 0,
      finished: false,
    };
  });

  const notifRef = useRef<Notification | null>(null);
  const rafRef = useRef<number | null>(null);

  // Restaurar workoutId asociado al descanso persistido
  useEffect(() => {
    try {
      const raw = localStorage.getItem(REST_TIMER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedRestTimer;
      workoutIdRef.current = parsed.workoutId ?? null;
    } catch {
      // ignore
    }
  }, []);

  // Reprogramar notificación nativa si el descanso se restauró tras recargar la app
  useEffect(() => {
    if (state.activeKey && state.endTime && !state.finished) {
      void scheduleRestTimerNotification(state.endTime);
    }
    // Solo al montar: el estado inicial ya incluye el descanso persistido
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistir en localStorage mientras haya descanso activo o recién terminado
  useEffect(() => {
    if (state.activeKey && state.endTime && state.duration) {
      persistRestTimer(state, workoutIdRef.current);
    } else {
      clearPersistedRestTimer();
    }
  }, [state.activeKey, state.endTime, state.duration, state.finished]);

  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.endTime || !prev.activeKey) return prev;
      const remaining = Math.max(0, Math.ceil((prev.endTime - Date.now()) / 1000));
      if (remaining <= 0 && !prev.finished) {
        // Timer done
        return { ...prev, remaining: 0, finished: true };
      }
      return { ...prev, remaining };
    });
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Handle completion side-effects (solo si el descanso sigue activo al terminar)
  useEffect(() => {
    if (hydratedFinishedRef.current) {
      hydratedFinishedRef.current = false;
      return;
    }
    if (state.finished && state.activeKey) {
      void cancelRestTimerNotification();

      // Vibrate
      if ("vibrate" in navigator) {
        navigator.vibrate([500, 200, 500]);
      }
      // Sound
      playBeep();
      // Web notification if hidden (native uses scheduled local notification)
      if (document.visibilityState === "hidden" && "Notification" in window && Notification.permission === "granted") {
        notifRef.current = new Notification("¡Descanso terminado!", {
          body: "Hora de tu siguiente serie. 💪",
          tag: "rest-timer",
        });
        notifRef.current.onclick = () => {
          window.focus();
          notifRef.current?.close();
        };
      }
    }
  }, [state.finished]);

  // Auto-dismiss notification when app becomes visible
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible" && state.finished && notifRef.current) {
        notifRef.current.close();
        notifRef.current = null;
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [state.finished]);

  // Start/stop the rAF loop
  useEffect(() => {
    if (state.activeKey && !state.finished) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.activeKey, state.finished, tick]);

  const start = useCallback((key: string, durationSeconds: number, workoutId?: string | null) => {
    requestNotifPermission();
    workoutIdRef.current = workoutId ?? null;
    hydratedFinishedRef.current = false;
    const endTime = Date.now() + durationSeconds * 1000;
    const next: TimerState = {
      activeKey: key,
      endTime,
      remaining: durationSeconds,
      duration: durationSeconds,
      finished: false,
    };
    persistRestTimer(next, workoutIdRef.current);
    void scheduleRestTimerNotification(endTime);
    setState(next);
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
    if (notifRef.current) {
      notifRef.current.close();
      notifRef.current = null;
    }
    void cancelRestTimerNotification();
    workoutIdRef.current = null;
    clearPersistedRestTimer();
    setState({ activeKey: null, endTime: null, remaining: 0, duration: 0, finished: false });
  }, []);

  return {
    activeKey: state.activeKey,
    remaining: state.remaining,
    duration: state.duration,
    finished: state.finished,
    isRunning: !!state.activeKey && !state.finished,
    start,
    stop,
  };
}
