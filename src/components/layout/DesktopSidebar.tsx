import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Dumbbell, BarChart3, LogOut, ClipboardList, Plus, Activity, Scale, FileUp, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ProfileDrawerTrigger } from "./ProfileDrawer";
import { SettingsDrawer } from "./SettingsDrawer";
import { InAppNotificationsBell } from "@/components/notifications/InAppNotificationsBell";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { PredefinedRoutinesExplorer } from "@/components/routine/PredefinedRoutinesExplorer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/routines", icon: ClipboardList, label: "Rutinas" },
  { to: "/community", icon: Users, label: "Comunidad" },
  { to: "/evolution", icon: BarChart3, label: "Evolución" },
];

export function DesktopSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { openNew } = useGlobalWorkoutDrawer();
  const [explorerOpen, setExplorerOpen] = useState(false);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl h-dvh sticky top-0">
      <div className="flex h-[calc(4rem+1px)] shrink-0 items-center gap-2 border-b border-border px-6">
        <img src="/logo.svg" alt="TrackGym" className="h-9 w-9 rounded-lg shrink-0" />
        <span className="text-lg font-bold flex-1 min-w-0 truncate">TrackGym</span>
        <ProfileDrawerTrigger />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full justify-start gap-3 mb-3 text-base" size="sm">
              <Plus className="h-5 w-5" />
              Crear Nuevo
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 text-base">
            <DropdownMenuItem className="text-base" onClick={() => openNew()}>
              <Activity className="h-5 w-5 mr-2 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="font-medium">Entreno Libre</p>
                <p className="text-xs text-muted-foreground">Registra una sesión de gym</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 text-base [&_svg]:h-5 [&_svg]:w-5">
                <ClipboardList className="h-5 w-5 shrink-0 text-blue-500" />
                <div className="min-w-0">
                  <p className="font-medium">Rutina</p>
                  <p className="text-xs text-muted-foreground">Crea o explora plantillas de entrenamiento</p>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-80 text-base">
                <DropdownMenuItem className="text-base" onClick={() => setExplorerOpen(true)}>
                  <Sparkles className="h-5 w-5 mr-2 shrink-0 text-amber-400" />
                  <div className="min-w-0">
                    <p className="font-medium">Explorar Predefinidas</p>
                    <p className="text-xs text-muted-foreground">Descubre rutinas creadas por expertos</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-base" onClick={() => navigate("/routines", { state: { action: "new" } })}>
                  <Plus className="h-5 w-5 mr-2 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="font-medium">Crear desde cero</p>
                    <p className="text-xs text-muted-foreground">Configura tus propios ejercicios</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-base" onClick={() => navigate("/routines", { state: { action: "import-csv" } })}>
                  <FileUp className="h-5 w-5 mr-2 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="font-medium">Importar desde CSV</p>
                    <p className="text-xs text-muted-foreground">Sube un archivo con la rutina</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem className="text-base" onClick={() => navigate("/routines?tab=ejercicios", { state: { action: "new" } })}>
              <Dumbbell className="h-5 w-5 mr-2 shrink-0 text-orange-500" />
              <div className="min-w-0">
                <p className="font-medium">Ejercicio</p>
                <p className="text-xs text-muted-foreground">Añade un ejercicio a tu biblioteca</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base" onClick={() => navigate("/evolution", { state: { tab: "measurements", action: "new" } })}>
              <Scale className="h-5 w-5 mr-2 shrink-0 text-emerald-500" />
              <div className="min-w-0">
                <p className="font-medium">Medida</p>
                <p className="text-xs text-muted-foreground">Registra peso, cintura, etc.</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <PredefinedRoutinesExplorer open={explorerOpen} onOpenChange={setExplorerOpen} />

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary/20 bg-primary/10 text-primary dark:border-primary/42 dark:bg-primary/8"
                  : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto shrink-0 border-t border-border px-4 pb-4 pt-4">
        <div className="flex items-center justify-end gap-0.5 pb-3">
          <InAppNotificationsBell />
          <SettingsDrawer />
        </div>
        <div className="flex justify-end border-t border-border pt-3">
          <Button
            variant="ghost"
            className="gap-3 text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </aside>
  );
}

