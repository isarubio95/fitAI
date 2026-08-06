import { NavLink } from "react-router-dom";
import { Home, BarChart3, LogOut, ClipboardList, Plus, Users } from "lucide-react";
import { CardioWorkoutIcon } from "@/components/icons/CardioWorkoutIcon";
import { GymWorkoutIcon } from "@/components/icons/GymWorkoutIcon";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ProfileDrawerTrigger } from "./ProfileDrawer";
import { SettingsDrawer } from "./SettingsDrawer";
import { InAppNotificationsBell } from "@/components/notifications/InAppNotificationsBell";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const { openNew } = useGlobalWorkoutDrawer();
  const { openLiveSetup } = useGlobalCardioDrawer();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border bg-white/50 dark:bg-card/50 backdrop-blur-2xl h-dvh sticky top-0">
      <div className="shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Track Gym" className="h-8 w-8 shrink-0 rounded-lg" />
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-muted-foreground">Track Gym</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full justify-start gap-3 mb-3 text-base" size="sm">
              <Plus className="h-5 w-5" />
              Crear Nuevo
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 text-base">
            <DropdownMenuItem className="text-base" onClick={() => openNew()}>
              <GymWorkoutIcon className="h-5 w-5 mr-2 text-primary" />
              <div className="min-w-0">
                <p className="font-medium">Fuerza</p>
                <p className="text-xs text-muted-foreground">Registra una sesión de gym</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-base" onClick={() => openLiveSetup()}>
              <CardioWorkoutIcon className="h-5 w-5 mr-2 text-blue-500" />
              <div className="min-w-0">
                <p className="font-medium">Cardio</p>
                <p className="text-xs text-muted-foreground">Registra carrera, bici, cinta, etc.</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary/20 text-primary dark:bg-primary/10"
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
        <div className="flex flex-wrap items-center justify-end gap-0.5 pb-3">
          <div id="sidebar-header-actions-slot" className="flex items-center gap-0.5" />
          <InAppNotificationsBell />
          <SettingsDrawer />
          <ProfileDrawerTrigger />
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
