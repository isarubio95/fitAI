import { forwardRef, type PointerEvent as ReactPointerEvent } from "react";
import { Loader2, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { HeartRatePanel } from "@/components/cardio/live/HeartRatePanel";
import { cn } from "@/lib/utils";

type HrProps = {
  bpm: number | null;
  connected: boolean;
  connection: string;
  deviceName: string | null;
  zone: number | null;
  connecting: boolean;
  error: string | null;
  onConnectClick: () => void;
};

type Props = {
  headerTitle: string;
  isSetup: boolean;
  paused: boolean;
  /** Si es "auto", el botón muestra "Pausa automática". */
  pauseSource?: "manual" | "auto" | null;
  showAutoPauseToggle?: boolean;
  autoPauseEnabled?: boolean;
  onAutoPauseEnabledChange?: (enabled: boolean) => void;
  controlsExpanded: boolean;
  setupDisciplineId: string | null;
  startPending: boolean;
  drawerPillProps: Record<string, unknown>;
  hr: HrProps;
  onOpenChange: (open: boolean) => void;
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerMove: (e: ReactPointerEvent) => void;
  onPointerUp: () => void;
  onToggleExpanded: () => void;
  onStart: () => void;
  onPauseToggle: () => void;
  onFinish: () => void;
  onOpenManual: () => void;
};

export const LiveControlsDrawer = forwardRef<HTMLDivElement, Props>(function LiveControlsDrawer(
  {
    headerTitle,
    isSetup,
    paused,
    pauseSource = null,
    showAutoPauseToggle = false,
    autoPauseEnabled = true,
    onAutoPauseEnabledChange,
    controlsExpanded,
    setupDisciplineId,
    startPending,
    drawerPillProps,
    hr,
    onOpenChange,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onToggleExpanded,
    onStart,
    onPauseToggle,
    onFinish,
    onOpenManual,
  },
  ref,
) {
  return (
    <Drawer open modal={false} dismissible={false} handleOnly onOpenChange={onOpenChange}>
      <DrawerContent
        ref={ref}
        side="bottom"
        className="z-110 mt-0 max-h-[85lvh] overflow-hidden bg-card p-0 transition-[height] duration-300 ease-out"
        overlayClassName="z-110 pointer-events-none bg-transparent backdrop-blur-none dark:bg-transparent dark:backdrop-blur-none"
        {...drawerPillProps}
      >
        <div
          className="touch-pan-x"
          onPointerDownCapture={onPointerDown}
          onPointerMoveCapture={onPointerMove}
          onPointerUpCapture={onPointerUp}
          onPointerCancelCapture={onPointerUp}
          onDoubleClick={onToggleExpanded}
        >
          <div className="shrink-0">
            <DrawerHeader className="gap-0 px-0 pb-0 pt-2.5">
              <DrawerTitle className="sr-only">{headerTitle} — controles de grabación</DrawerTitle>
            </DrawerHeader>
            <div
              className={cn(
                "space-y-4 bg-card px-4",
                controlsExpanded ? "pb-4" : "pb-[max(1rem,env(safe-area-inset-bottom))]",
              )}
            >
              <div className="flex flex-wrap items-center justify-center gap-3">
                {isSetup ? (
                  <Button
                    type="button"
                    size="lg"
                    className="h-14 w-14 rounded-full p-0 shadow-none hover:shadow-none hover:translate-y-0 active:translate-y-0"
                    disabled={!setupDisciplineId || startPending}
                    onClick={onStart}
                    aria-label="Iniciar entrenamiento"
                  >
                    {startPending ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Play className="h-6 w-6 fill-current" />
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      size="lg"
                      variant="secondary"
                      className={cn(
                        "h-11 min-w-30 rounded-full gap-2 px-8 shadow-none",
                        paused && "border-sky-500/50",
                        paused && pauseSource === "auto" && "min-w-40",
                      )}
                      onClick={onPauseToggle}
                    >
                      {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                      {paused
                        ? pauseSource === "auto"
                          ? "Pausa automática"
                          : "Reanudar"
                        : "Pausa"}
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      className="h-11 min-w-30 rounded-full gap-2 px-8 shadow-none hover:shadow-none hover:translate-y-0 active:translate-y-0"
                      onClick={onFinish}
                    >
                      <Square className="h-4 w-4 fill-current" />
                      Finalizar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-out",
              controlsExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="space-y-4 bg-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <HeartRatePanel
                  bpm={hr.bpm}
                  connected={hr.connected}
                  connection={hr.connection}
                  deviceName={hr.deviceName}
                  zone={hr.zone}
                  connecting={hr.connecting}
                  error={hr.error}
                  onConnectClick={hr.onConnectClick}
                />

                {showAutoPauseToggle ? (
                  <div
                    className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5"
                    onPointerDown={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium">Autopausa GPS</p>
                      <p className="text-[12px] text-muted-foreground">
                        {autoPauseEnabled
                          ? "Pausa y reanuda sola si dejas de moverte."
                          : "Desactivada: solo pausa manual."}
                      </p>
                    </div>
                    <Switch
                      checked={autoPauseEnabled}
                      onCheckedChange={onAutoPauseEnabledChange}
                      aria-label="Autopausa GPS"
                    />
                  </div>
                ) : null}

                {!isSetup ? (
                  <button
                    type="button"
                    className="block w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
                    onClick={onOpenManual}
                  >
                    Registrar o editar en formulario manual
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
});
