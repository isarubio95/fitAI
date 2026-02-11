import { useState, useEffect, useCallback, useRef } from "react";

interface TimerState {
  /** Which exercise+set is running, e.g. "0-2" */
  activeKey: string | null;
  /** Absolute end time (Date.now() based) */
  endTime: number | null;
  /** Remaining seconds for display */
  remaining: number;
  /** Whether the timer finished */
  finished: boolean;
}

let notificationPermissionRequested = false;

function requestNotifPermission() {
  if (notificationPermissionRequested) return;
  notificationPermissionRequested = true;
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
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
  const [state, setState] = useState<TimerState>({
    activeKey: null,
    endTime: null,
    remaining: 0,
    finished: false,
  });

  const notifRef = useRef<Notification | null>(null);
  const rafRef = useRef<number | null>(null);

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

  // Handle completion side-effects
  useEffect(() => {
    if (state.finished) {
      // Vibrate
      if ("vibrate" in navigator) {
        navigator.vibrate([500, 200, 500]);
      }
      // Sound
      playBeep();
      // Notification if hidden
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

  const start = useCallback((key: string, durationSeconds: number) => {
    requestNotifPermission();
    setState({
      activeKey: key,
      endTime: Date.now() + durationSeconds * 1000,
      remaining: durationSeconds,
      finished: false,
    });
  }, []);

  const stop = useCallback(() => {
    setState({ activeKey: null, endTime: null, remaining: 0, finished: false });
  }, []);

  return {
    activeKey: state.activeKey,
    remaining: state.remaining,
    finished: state.finished,
    isRunning: !!state.activeKey && !state.finished,
    start,
    stop,
  };
}
