import { NavLink, useLocation } from "react-router-dom";
import { Home, Dumbbell, BarChart3, ClipboardList, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/routines", icon: ClipboardList, label: "Rutinas" },
  { to: "/exercises", icon: Dumbbell, label: "Ejercicios" },
  { to: "/history", icon: BarChart3, label: "Progreso" },
  { to: "/measurements", icon: Scale, label: "Medidas" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/70 backdrop-blur-2xl md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-[80px] items-center justify-around px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => {
              if (location.pathname === to) {
                window.scrollTo(0, 0);
              }
            }}
            className={({ isActive }) =>
              cn(
                "group flex flex-1 flex-col items-center justify-center gap-1.5 transition-transform duration-100 ease-out active:scale-90",
                "focus:outline-none"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* ICONO:
                  - Sin rellenos forzados.
                  - Juego puramente con el GROSOR (stroke-width) y el COLOR.
                  - Sutil Drop-Shadow (resplandor) solo cuando está activo.
                */}
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-6 w-6 transition-all duration-300 ease-out",
                      isActive 
                        ? "text-primary stroke-[2px] drop-shadow-[0_0_12px_rgba(var(--primary),0.6)]" // Efecto Neón sutil
                        : "text-zinc-500 stroke-[2px] group-hover:text-zinc-300"
                    )}
                  />
                </div>

                {/* LABEL:
                  - Tipografía muy pequeña pero legible (tracking).
                  - Transición de opacidad en lugar de negrita para evitar saltos de layout.
                */}
                <span
                  className={cn(
                    "text-[10px] font-medium tracking-wide transition-colors duration-300",
                    isActive ? "text-primary" : "text-zinc-500"
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}