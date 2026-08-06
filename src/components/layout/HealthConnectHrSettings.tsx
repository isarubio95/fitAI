import { useCallback, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getHealthConnectHrAvailability,
  hasHrPermission,
  openHealthConnectHrSettings,
  requestHrPermission,
  type HealthConnectHrAvailability,
} from "@/lib/healthConnectHr";
import { useToast } from "@/hooks/use-toast";

type ConnState = "loading" | "ready" | "needs_permission" | HealthConnectHrAvailability;

function statusCopy(state: ConnState): { title: string; detail: string } {
  switch (state) {
    case "loading":
      return { title: "Comprobando…", detail: "Verificando Health Connect en este dispositivo." };
    case "unsupported":
      return {
        title: "No disponible",
        detail: "Health Connect solo está disponible en la app Android.",
      };
    case "unavailable":
      return {
        title: "No compatible",
        detail: "Este dispositivo no admite Health Connect.",
      };
    case "needs_update":
      return {
        title: "Requiere instalación o actualización",
        detail: "Instala o actualiza Health Connect desde Play Store y vuelve a intentar.",
      };
    case "needs_permission":
      return {
        title: "Sin permiso",
        detail:
          "Conecta Health Connect para importar la FC del reloj al guardar cardio si no usaste sensor Bluetooth.",
      };
    case "ready":
      return {
        title: "Conectado",
        detail:
          "Al guardar un cardio sin sensor BLE, se importará la FC del intervalo desde Health Connect.",
      };
  }
}

export function HealthConnectHrSettings() {
  const { toast } = useToast();
  const show = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
  const [state, setState] = useState<ConnState>("loading");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!show) {
      setState("unsupported");
      return;
    }
    setState("loading");
    const availability = await getHealthConnectHrAvailability();
    if (availability !== "ready") {
      setState(availability);
      return;
    }
    const granted = await hasHrPermission();
    setState(granted ? "ready" : "needs_permission");
  }, [show]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!show) return null;

  const copy = statusCopy(state);

  const onConnect = async () => {
    setBusy(true);
    try {
      if (state === "needs_update" || state === "unavailable") {
        await openHealthConnectHrSettings();
        return;
      }
      const ok = await requestHrPermission();
      if (ok) {
        toast({ title: "Health Connect conectado" });
      } else {
        toast({
          title: "Permiso no concedido",
          description: "Puedes activarlo más tarde en Ajustes de Health Connect.",
          variant: "destructive",
        });
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <HeartPulse className="h-4 w-4 text-muted-foreground" />
        Salud / Frecuencia cardíaca
      </p>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{copy.title}</p>
        <p className="text-xs leading-snug text-muted-foreground">{copy.detail}</p>
      </div>
      {state !== "ready" && state !== "loading" && state !== "unsupported" && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={busy}
          onClick={() => void onConnect()}
        >
          {state === "needs_update" || state === "unavailable"
            ? "Abrir Health Connect"
            : "Conectar Health Connect"}
        </Button>
      )}
      {state === "ready" && (
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full px-0 text-xs text-muted-foreground"
          disabled={busy}
          onClick={() => void openHealthConnectHrSettings()}
        >
          Gestionar permisos en Health Connect
        </Button>
      )}
    </div>
  );
}
