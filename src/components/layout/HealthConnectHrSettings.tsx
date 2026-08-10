import { useCallback, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getHealthConnectHrAvailability,
  hasHrPermission,
  openHealthConnectHrSettings,
  requestHrPermission,
  type HealthConnectHrAvailability,
} from "@/lib/healthConnectHr";
import { useToast } from "@/hooks/use-toast";

type ConnState = "loading" | "ready" | "needs_permission" | HealthConnectHrAvailability;

const COMMON_STEPS = [
  "Concede a FitAI la lectura de frecuencia cardíaca en Health Connect.",
  "En la app del reloj, activa la sincronización o el compartir con Health Connect (incluye FC).",
  "Antes de finalizar el entreno, abre esa app o reconecta el reloj: la FC continua puede tardar en llegar al hub.",
  "Al guardar cardio o fuerza sin sensor Bluetooth, FitAI importa la FC del intervalo desde Health Connect.",
] as const;

const BRAND_GUIDES = [
  {
    id: "samsung",
    title: "Samsung / Galaxy Watch",
    body: "En Samsung Health: Ajustes → Health Connect → permitir los datos (incluida frecuencia cardíaca). Tras el entreno, abre Samsung Health para forzar la sync al teléfono antes de guardar en FitAI.",
  },
  {
    id: "pixel",
    title: "Google Pixel Watch / Wear OS",
    body: "Con Google Fit o la app del reloj, activa la sincronización con Health Connect y asegúrate de que la FC esté incluida. Abre Fit o reconecta el reloj si los datos aún no aparecen en el hub.",
  },
  {
    id: "garmin",
    title: "Garmin",
    body: "En Garmin Connect, activa la sincronización con Health Connect si tu versión lo ofrece. Si no escribe en el hub, conecta el sensor por Bluetooth en el panel de FC del entreno.",
  },
  {
    id: "otras",
    title: "Otras (Polar, bandas, etc.)",
    body: "Lo más fiable es el sensor Bluetooth en vivo desde el panel de FC del entreno. Health Connect solo ayuda si la app del fabricante escribe frecuencia cardíaca en el hub.",
  },
] as const;

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
          "Conecta Health Connect para importar la FC del reloj al guardar cardio o fuerza si no usaste sensor Bluetooth.",
      };
    case "ready":
      return {
        title: "Conectado",
        detail:
          "Al guardar cardio o fuerza sin sensor BLE, se importará la FC del intervalo desde Health Connect.",
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

      {state !== "unsupported" && state !== "loading" && (
        <div className="space-y-3 border-t border-border/40 pt-3">
          <p className="text-xs font-medium text-foreground">Cómo conectar el reloj</p>
          <ol className="list-decimal space-y-1.5 pl-4 text-xs leading-snug text-muted-foreground">
            {COMMON_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <p className="rounded-md bg-muted/50 px-2.5 py-2 text-xs leading-snug text-muted-foreground">
            El permiso en FitAI no basta: el reloj midiendo en su app no llega aquí hasta que esa
            app escriba la FC en Health Connect.
          </p>

          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground">Según tu marca</p>
            <Accordion type="single" collapsible className="w-full">
              {BRAND_GUIDES.map((brand) => (
                <AccordionItem key={brand.id} value={brand.id} className="border-border/40">
                  <AccordionTrigger className="py-2 text-left text-xs font-medium hover:no-underline">
                    {brand.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs leading-snug text-muted-foreground">
                    {brand.body}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      )}
    </div>
  );
}
