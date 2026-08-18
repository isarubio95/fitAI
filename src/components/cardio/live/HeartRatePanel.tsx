import { Bluetooth, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  bpm: number | null;
  connected: boolean;
  connection: string;
  deviceName: string | null;
  zone: number | null;
  connecting: boolean;
  error: string | null;
  onConnectClick: () => void;
  className?: string;
};

export function HeartRatePanel({
  bpm,
  connected,
  connection,
  deviceName,
  zone,
  connecting,
  error,
  onConnectClick,
  className,
}: Props) {
  const hasBpm = connected && bpm != null;

  return (
    <div className={cn("rounded-2xl border border-border bg-card px-4 py-3", className)}>
      <div className="flex items-center gap-4">
        <Heart
          className={cn(
            "h-6 w-6 shrink-0",
            connected ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground",
            hasBpm && "animate-pulse",
          )}
        />
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-sm font-medium">Pulsaciones</p>
          {hasBpm ? (
            <p className="font-mono text-2xl font-semibold tabular-nums">
              {bpm}
              <span className="ml-1 text-sm font-medium text-muted-foreground">bpm</span>
            </p>
          ) : connecting ? (
            <p className="text-[12px] text-muted-foreground">Conectando…</p>
          ) : connection === "disconnected" ? (
            <p className="text-[12px] text-amber-600 dark:text-amber-400">Sin señal</p>
          ) : (
            <p className="text-[12px] text-muted-foreground">
              Bandas y relojes Bluetooth con sensor de pulso.
            </p>
          )}
          {deviceName ? (
            <p className="truncate text-[12px] text-muted-foreground">
              {connected
                ? `${deviceName}${zone != null ? ` · Zona ${zone}` : ""}`
                : deviceName}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shrink-0 rounded-full gap-1.5"
          disabled={connecting}
          onClick={onConnectClick}
        >
          {connecting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Bluetooth className="h-3.5 w-3.5" />
          )}
          {connected ? "Desconectar" : connection === "disconnected" || deviceName ? "Reconectar" : "Conectar"}
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{error}</p> : null}
    </div>
  );
}
