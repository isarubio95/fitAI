import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Dumbbell, BarChart3, ClipboardList, Scale, Plus, Activity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { PredefinedRoutinesExplorer } from "@/components/routine/PredefinedRoutinesExplorer";

// Añadimos un objeto especial de tipo "add" para representarlo en el centro
const navItems = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/routines", icon: ClipboardList, label: "Rutinas" },
  { type: "add" }, // El botón central
  { to: "/exercises", icon: Dumbbell, label: "Ejercicios" },
  { to: "/evolution", icon: BarChart3, label: "Evolución" }, // Nueva ruta unificada
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openNew } = useGlobalWorkoutDrawer();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRoutineSubmenu, setShowRoutineSubmenu] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Cerrar el menú si se hace click fuera de la barra de navegación
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Cerrar el menú automáticamente al cambiar de página
  useEffect(() => {
    setIsMenuOpen(false);
    setShowRoutineSubmenu(false);
  }, [location.pathname]);

  return (
    <nav 
      ref={navRef} 
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/70 backdrop-blur-2xl md:hidden pb-[env(safe-area-inset-bottom)]"
    >
      {/* MENÚ DESPLEGABLE DE ACCIONES */}
      <div
        className={cn(
          "absolute bottom-[85px] left-1/2 -translate-x-1/2 flex flex-col gap-1 rounded-2xl bg-card border border-border p-2 shadow-xl transition-all duration-300 ease-out origin-bottom w-48",
          isMenuOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-50 opacity-0 pointer-events-none"
        )}
      >
        <button 
          className="flex items-center gap-3 rounded-xl p-3 hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
          onClick={() => { openNew(); setIsMenuOpen(false); }}
        >
          <Activity className="h-5 w-5 text-primary" />
          Entrenamiento
        </button>
        <button 
          className="flex items-center gap-3 rounded-xl p-3 hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
          onClick={() => { setShowRoutineSubmenu(!showRoutineSubmenu); }}
        >
          <ClipboardList className="h-5 w-5 text-blue-500" />
          Rutina
        </button>
        {showRoutineSubmenu && (
          <div className="ml-4 space-y-0.5 border-l-2 border-border pl-3">
            <button
              className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
              onClick={() => { setExplorerOpen(true); setIsMenuOpen(false); setShowRoutineSubmenu(false); }}
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <div className="text-left">
                <p className="font-medium">Explorar Predefinidas</p>
                <p className="text-[10px] text-muted-foreground">Descubre rutinas creadas por expertos</p>
              </div>
            </button>
            <button
              className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
              onClick={() => { navigate("/routines", { state: { action: "new" } }); setIsMenuOpen(false); setShowRoutineSubmenu(false); }}
            >
              <Plus className="h-4 w-4 text-primary" />
              <div className="text-left">
                <p className="font-medium">Crear desde cero</p>
                <p className="text-[10px] text-muted-foreground">Configura tus propios ejercicios</p>
              </div>
            </button>
          </div>
        )}
        <button 
          className="flex items-center gap-3 rounded-xl p-3 hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
          onClick={() => { navigate("/exercises", { state: { action: "new" } }); setIsMenuOpen(false); setShowRoutineSubmenu(false); }}
        >
          <Dumbbell className="h-5 w-5 text-orange-500" />
          Ejercicio
        </button>
        <button 
          className="flex items-center gap-3 rounded-xl p-3 hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
          onClick={() => { navigate("/evolution", { state: { tab: "measurements", action: "new" } }); setIsMenuOpen(false); setShowRoutineSubmenu(false); }}
        >
          <Scale className="h-5 w-5 text-emerald-500" />
          Medida
        </button>
      </div>

      <PredefinedRoutinesExplorer open={explorerOpen} onOpenChange={setExplorerOpen} />

      {/* BARRA DE NAVEGACIÓN */}
      <div className="flex h-[80px] items-center justify-around px-2 relative">
        {navItems.map((item, index) => {
          // Renderizado del botón central +
          if (item.type === "add") {
            return (
              <div key="add-button" className="flex flex-1 flex-col items-center justify-center gap-1.5">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="group flex flex-col items-center justify-center gap-1.5 focus:outline-none"
                >
                  <div className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300 ease-out active:scale-90 shadow-md",
                    isMenuOpen && "rotate-45 drop-shadow-[0_0_12px_rgba(var(--primary),0.6)]" // Rotación y neón
                  )}>
                    <Plus className="h-6 w-6 stroke-[2px]" />
                  </div>
                </button>
              </div>
            );
          }

          // Renderizado normal de los NavLinks
          const { to, icon: Icon, label } = item;
          return (
            <NavLink
              key={to}
              to={to!}
              end={to === "/"}
              onClick={() => {
                if (location.pathname === to) window.scrollTo(0, 0);
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
                  <div className="relative">
                    <Icon
                      className={cn(
                        "h-6 w-6 transition-all duration-300 ease-out",
                        isActive
                          ? "text-primary stroke-[2px] drop-shadow-[0_0_12px_rgba(var(--primary),0.6)]"
                          : "text-zinc-500 stroke-[2px] group-hover:text-zinc-300"
                      )}
                    />
                  </div>
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
          );
        })}
      </div>
    </nav>
  );
}