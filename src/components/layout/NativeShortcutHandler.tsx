import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";

/**
 * Atajos del launcher (res/xml/shortcuts.xml): al mantener pulsado el icono de
 * la app, Android ofrece "Fuerza" y "Cardio", que abren directamente el drawer
 * correspondiente en vez de dejar al usuario en el dashboard.
 *
 * Hay que cubrir los dos caminos: si la app ya estaba viva llega por
 * `appUrlOpen`, y si arranca en frío hay que preguntar por la URL de lanzamiento
 * porque el evento ya se disparó antes de montar este componente.
 */

const SHORTCUT_PREFIX = "com.trackgym.app://start/";

export function NativeShortcutHandler() {
  const { openNew } = useGlobalWorkoutDrawer();
  const { openLiveSetup } = useGlobalCardioDrawer();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;

    const handle = (url: string | undefined | null) => {
      if (cancelled || !url || !url.startsWith(SHORTCUT_PREFIX)) return;
      const action = url.slice(SHORTCUT_PREFIX.length).replace(/[/?#].*$/, "");
      if (action === "gym") openNew();
      else if (action === "cardio") openLiveSetup();
    };

    // Arranque en frío: el intent ya venía en el lanzamiento.
    void CapacitorApp.getLaunchUrl()
      .then((result) => handle(result?.url))
      .catch(() => {});

    // App ya en segundo plano: llega como evento.
    const listener = CapacitorApp.addListener("appUrlOpen", ({ url }) => handle(url));

    return () => {
      cancelled = true;
      void listener.then((handle) => handle.remove()).catch(() => {});
    };
  }, [openNew, openLiveSetup]);

  return null;
}
