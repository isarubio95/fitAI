import { NavLink } from "react-router-dom";
import { Home, Dumbbell, BarChart3, LogOut, ClipboardList, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ProfileDrawer } from "./ProfileDrawer";

const navItems = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/routines", icon: ClipboardList, label: "Rutinas" },
  { to: "/exercises", icon: Dumbbell, label: "Ejercicios" },
  { to: "/history", icon: BarChart3, label: "Progreso" },
  { to: "/measurements", icon: Scale, label: "Medidas" },
];

export function DesktopSidebar() {
  const { signOut } = useAuth();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border bg-card h-[100dvh] sticky top-0">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Dumbbell className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold flex-1">TrackGym</span>
        <ProfileDrawer />
      </div>
      <nav className="flex-1 space-y-1 p-4">
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
