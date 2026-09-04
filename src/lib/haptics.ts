import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * Capa única de háptica.
 *
 * Todas las funciones son *fire-and-forget*: no devuelven promesa, no lanzan y
 * no bloquean el gesto que las dispara. En web hacen no-op (el plugin tiene
 * implementación web basada en `navigator.vibrate`, pero es errática y no
 * existe en iOS Safari, así que preferimos el silencio a un patrón inconsistente).
 *
 * Sustituye a los `navigator.vibrate` sueltos que había en PostWorkoutModal,
 * useRestTimer y SortableRoutineCard.
 */

const isNative = () => Capacitor.isNativePlatform();

function fire(run: () => Promise<unknown>) {
  if (!isNative()) return;
  try {
    void run().catch(() => {});
  } catch {
    // Un fallo de háptica nunca debe romper la interacción.
  }
}

/** Toque breve: confirmar un tap significativo, cruzar el umbral de un swipe. */
export function tapLight() {
  fire(() => Haptics.impact({ style: ImpactStyle.Light }));
}

/** Golpe con cuerpo: acciones con peso (empezar/terminar sesión, borrar). */
export function tapMedium() {
  fire(() => Haptics.impact({ style: ImpactStyle.Medium }));
}

/** Cambio de selección: tabs, toggles, pasar de opción en un picker. */
export function selection() {
  fire(() => Haptics.selectionChanged());
}

/**
 * Secuencia de arrastre. `selectionStart` al levantar el elemento,
 * `selectionChanged` en cada reordenación y `selectionEnd` al soltar — es el
 * detalle que más acerca el drag & drop a una lista nativa.
 */
export function dragStart() {
  fire(() => Haptics.selectionStart());
}

export function dragOver() {
  fire(() => Haptics.selectionChanged());
}

export function dragEnd() {
  fire(() => Haptics.selectionEnd());
}

/**
 * Tarea completada: entreno guardado, sesión de cardio cerrada.
 * En Android es un doble pulso de 121 ms, así que no vale para gestos
 * repetitivos — para esos, `tapMedium` (43 ms).
 */
export function success() {
  fire(() => Haptics.notification({ type: NotificationType.Success }));
}

/** Aviso: fin del temporizador de descanso, límite alcanzado. */
export function warning() {
  fire(() => Haptics.notification({ type: NotificationType.Warning }));
}

/** Error: validación fallida, acción rechazada. */
export function error() {
  fire(() => Haptics.notification({ type: NotificationType.Error }));
}

/**
 * Vibración explícita por duración. Reservado para avisos que deben notarse con
 * la app en segundo plano (fin de descanso), donde un impact es demasiado sutil.
 */
export function vibrate(durationMs: number) {
  fire(() => Haptics.vibrate({ duration: durationMs }));
}
