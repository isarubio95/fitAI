import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useCommunitySettings } from "@/hooks/useCommunitySettings";
import { useAuth } from "@/hooks/useAuth";
import { ColorThemeSelector } from "@/components/ColorThemeSelector";
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
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Panel de preferencia de comunidad: se distingue del bloque plano de color de acento. */
const preferencePanelClass =
  "rounded-none border border-border/80 bg-secondary/50 p-4 shadow-sm dark:bg-secondary/25 dark:border-border/60";

export function SettingsDrawer() {
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { comunidadPublicaActividad, isLoading: settingsLoading, isUpdating, setComunidadPublicaActividad } = useCommunitySettings();
  const [open, setOpen] = useState(false);

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
        className="flex h-full w-full flex-col border-0 bg-card p-0 shadow-none"
      >
        <DrawerHeader className="px-6 pt-6 text-left">
          <DrawerTitle className="text-lg">Ajustes</DrawerTitle>
        </DrawerHeader>

        <div className="mt-3 flex-1 space-y-6 overflow-y-auto px-6 pb-4">
          {/* Privacidad en comunidad */}
          <div className="space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">Comunidad</p>
            <div
              data-drawer-section
              className={cn(preferencePanelClass, "flex items-center justify-between gap-4")}
            >
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-semibold">Publicar entrenos</p>
                <p className="text-[12px] text-muted-foreground">
                  {settingsLoading
                    ? "Cargando..."
                    : comunidadPublicaActividad
                      ? "Tus entrenos se verán en el feed público."
                      : "Tus entrenos se mantendrán privados."}
                </p>
              </div>
              <Switch
                checked={comunidadPublicaActividad}
                onCheckedChange={(v) => {
                  setComunidadPublicaActividad(v).catch(() => {
                    // Error silencioso: el backend puede no estar migrado aún.
                  });
                }}
                disabled={settingsLoading || isUpdating}
              />
            </div>
          </div>

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
        </div>

        <div className="mt-auto shrink-0 border-t border-border/40 px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <nav
            className="flex flex-col items-center gap-2.5 text-center text-xs text-muted-foreground/70"
            aria-label="Cuenta y legal"
          >
            <Link
              to="/privacidad"
              onClick={() => setOpen(false)}
              className="transition-colors hover:text-muted-foreground"
            >
              Política de privacidad
            </Link>
            <Link
              to="/eliminar-cuenta"
              onClick={() => setOpen(false)}
              className="transition-colors hover:text-destructive/80"
            >
              Eliminar cuenta
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="mt-0.5 transition-colors hover:text-muted-foreground"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

