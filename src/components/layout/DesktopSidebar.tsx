import { NavLink, useNavigate } from "react-router-dom";
import { Home, Dumbbell, BarChart3, LogOut, ClipboardList, Plus, Activity, Scale, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ProfileDrawer } from "./ProfileDrawer";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/routines", icon: ClipboardList, label: "Rutinas" },
  { to: "/exercises", icon: Dumbbell, label: "Ejercicios" },
  { to: "/evolution", icon: BarChart3, label: "Evolución" },
];

export function DesktopSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { openNew } = useGlobalWorkoutDrawer();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border bg-card h-[100dvh] sticky top-0">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
        <img src="/logo.svg" alt="TrackGym" className="h-9 w-9 rounded-lg flex-shrink-0" />
        <span className="text-lg font-bold flex-1">TrackGym</span>
        <ProfileDrawer />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full justify-start gap-3 mb-3" size="sm">
              <Plus className="h-4 w-4" />
              Crear Nuevo
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem onClick={() => openNew()}>
              <Activity className="h-4 w-4 mr-2 text-primary" />
              Entrenamiento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/routines", { state: { action: "new" } })}>
              <ClipboardList className="h-4 w-4 mr-2 text-blue-500" />
              Rutina
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/routines", { state: { action: "import-csv" } })}>
              <FileUp className="h-4 w-4 mr-2 text-muted-foreground" />
              Importar rutina desde CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/exercises", { state: { action: "new" } })}>
              <Dumbbell className="h-4 w-4 mr-2 text-orange-500" />
              Ejercicio
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/evolution", { state: { tab: "measurements", action: "new" } })}>
              <Scale className="h-4 w-4 mr-2 text-emerald-500" />
              Medida
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
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}

