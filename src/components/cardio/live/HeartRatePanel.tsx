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
}: Props) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
            connected ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" : "bg-muted text-muted-foreground",
          )}
        >
          <Heart className={cn("h-5 w-5", connected && bpm != null && "animate-pulse")} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Pulsaciones</p>
          <p className="mt-0.5 font-mono text-2xl font-semibold tabular-nums">
            {connected && bpm != null ? (
              <>
                {bpm}
                <span className="ml-1 text-sm font-medium text-muted-foreground">bpm</span>
              </>
            ) : connecting ? (
              <span className="text-base font-medium text-muted-foreground">Conectando…</span>
            ) : connection === "disconnected" ? (
              <span className="text-base font-medium text-amber-600 dark:text-amber-400">Sin señal</span>
            ) : (
              <span className="text-base font-medium text-muted-foreground">—</span>
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {connected && deviceName
              ? `${deviceName}${zone != null ? ` · Zona ${zone}` : ""}`
              : deviceName
                ? deviceName
                : "Sensor Bluetooth"}
          </p>
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
