import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { ColorThemeSelector } from "@/components/ColorThemeSelector";
import { PhysiologySettings } from "@/components/layout/PhysiologySettings";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Bell, MapPin, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { cn } from "@/lib/utils";

const settingsSectionCardClass = cn(
  "space-y-4 rounded-xl border border-border/60 bg-card p-4",
);

export function SettingsDrawer() {
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const {
    liveSessionEnabled,
    restFinishedEnabled,
    setLiveSessionEnabled,
    setRestFinishedEnabled,
  } = useNotificationPreferences();
  const [open, setOpen] = useState(false);
  const showLiveToggle = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-full bg-transparent text-muted-foreground transition-colors hover:bg-transparent active:bg-transparent focus-visible:bg-transparent hover:text-foreground/58 dark:text-foreground dark:hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-5"
          aria-label="Ajustes"
        >
          <Settings />
        </Button>
      </DrawerTrigger>

      <DrawerContent
        side="right"
        className="flex h-full w-full flex-col border-0 bg-background p-0 shadow-none"
      >
        <DrawerHeader className="px-6 pt-[calc(1.25rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] text-left">
          <DrawerTitle className="text-lg">Ajustes</DrawerTitle>
        </DrawerHeader>

        <div className="mt-3 flex-1 space-y-6 overflow-y-auto px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {/* Color de acento */}
          <ColorThemeSelector />

          {/* Apariencia (tema claro/oscuro) */}
          <div className="space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">Apariencia</p>
            <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-200 bg-popover">
                <SelectItem value="system">Automático (Sistema)</SelectItem>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Oscuro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notificaciones */}
          <div className={settingsSectionCardClass}>
            <p className="flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Notificaciones
            </p>

            {showLiveToggle && (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium leading-none">Sesión en curso</p>
                  <p className="text-xs leading-snug text-muted-foreground">
                    Muestra una notificación persistente mientras entrenas, con el
                    progreso del descanso.
                  </p>
                </div>
                <Switch
                  checked={liveSessionEnabled}
                  onCheckedChange={setLiveSessionEnabled}
                  aria-label="Activar notificación de sesión en curso"
                />
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium leading-none">Descanso terminado</p>
                <p className="text-xs leading-snug text-muted-foreground">
                  Aviso cuando acaba el temporizador de descanso entre series.
                </p>
              </div>
              <Switch
                checked={restFinishedEnabled}
                onCheckedChange={setRestFinishedEnabled}
                aria-label="Activar notificación de descanso terminado"
              />
            </div>
          </div>

          <PhysiologySettings />

          <Link
            to="/gimnasios"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Gimnasios de España
          </Link>

          <div className="border-t border-border/40 pt-5">
            <nav
              className="flex flex-wrap items-center justify-around gap-x-4 gap-y-2 text-center text-xs text-muted-foreground/70"
              aria-label="Cuenta y legal"
            >
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="transition-colors hover:text-muted-foreground"
              >
                Cerrar sesión
              </button>
              <Link
                to="/eliminar-cuenta"
                onClick={() => setOpen(false)}
                className="transition-colors hover:text-destructive/80"
              >
                Eliminar cuenta
              </Link>
              <Link
                to="/privacidad"
                onClick={() => setOpen(false)}
                className="transition-colors hover:text-muted-foreground"
              >
                Política de privacidad
              </Link>
            </nav>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
