import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Dumbbell, BarChart3, ClipboardList, Scale, Plus, Activity, Sparkles, ChevronDown, FileUp, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { PredefinedRoutinesExplorer } from "@/components/routine/PredefinedRoutinesExplorer";

// Añadimos un objeto especial de tipo "add" para representarlo en el centro
const navItems = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/routines", icon: ClipboardList, label: "Rutinas" },
  { type: "add" }, // El botón central
  { to: "/community", icon: Users, label: "Comunidad" },
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
    <>
      {/* Overlay que difumina la página cuando el menú Añadir está abierto */}
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      />
      <nav
        ref={navRef}
        data-app-bottom-nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/5 dark:border-white/10 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl md:hidden pb-[env(safe-area-inset-bottom)]"
      >
        {/* MENÚ DESPLEGABLE DE ACCIONES */}
      <div
        className={cn(
          "absolute bottom-[85px] left-1/2 -translate-x-1/2 flex flex-col rounded-2xl bg-card border border-border shadow-xl transition-all duration-300 ease-in-out origin-bottom w-[min(92vw,360px)] overflow-hidden",
          isMenuOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-50 opacity-0 pointer-events-none"
        )}
      >
        <button
          className="flex items-center gap-3 rounded-none p-3 hover:bg-accent/30 transition-colors text-base text-left w-full"
          onClick={() => { navigate("/", { state: { openPlanWizard: true } }); setIsMenuOpen(false); setShowRoutineSubmenu(false); }}
        >
          <Calendar className="h-6 w-6 shrink-0 text-violet-500" />
          <div className="min-w-0">
            <p className="font-medium">Hoja de Ruta</p>
            <p className="text-xs text-muted-foreground">Planifica qué rutina hacer cada día</p>
          </div>
        </button>
        <div>
          <button
            className="flex items-center justify-between w-full gap-3 rounded-none p-3 hover:bg-accent/30 transition-colors text-base text-left"
            onClick={() => { setShowRoutineSubmenu(!showRoutineSubmenu); }}
          >
            <span className="flex items-center gap-3 min-w-0">
              <ClipboardList className="h-6 w-6 shrink-0 text-blue-500" />
              <div className="min-w-0">
                <p className="font-medium">Rutina</p>
                <p className="text-xs text-muted-foreground">Crea o explora plantillas de entrenamiento</p>
              </div>
            </span>
            <ChevronDown
              className={cn("h-5 w-5 shrink-0 transition-transform duration-300", showRoutineSubmenu && "rotate-180")}
            />
          </button>
          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              showRoutineSubmenu ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="space-y-0.5 bg-muted/30 px-3 pb-2 pt-0">
                <button
                  className="flex w-full items-center gap-3 rounded-lg p-2.5 hover:bg-accent/30 transition-colors text-base text-left"
                  onClick={() => { setExplorerOpen(true); setIsMenuOpen(false); setShowRoutineSubmenu(false); }}
                >
                  <Sparkles className="h-5 w-5 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-medium">Explorar Predefinidas</p>
                    <p className="text-xs text-muted-foreground">Descubre rutinas creadas por expertos</p>
                  </div>
                </button>
                <button
                  className="flex w-full items-center gap-3 rounded-lg p-2.5 hover:bg-accent/30 transition-colors text-base text-left"
                  onClick={() => { navigate("/routines", { state: { action: "new" } }); setIsMenuOpen(false); setShowRoutineSubmenu(false); }}
                >
                  <Plus className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Crear desde cero</p>
                    <p className="text-xs text-muted-foreground">Configura tus propios ejercicios</p>
                  </div>
                </button>
                <button
                  className="flex w-full items-center gap-3 rounded-lg p-2.5 hover:bg-accent/30 transition-colors text-base text-left"
                  onClick={() => { navigate("/routines", { state: { action: "import-csv" } }); setIsMenuOpen(false); setShowRoutineSubmenu(false); }}
                >
                  <FileUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Importar desde CSV</p>
                    <p className="text-xs text-muted-foreground">Sube un archivo con la rutina</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        <button
          className="flex items-center gap-3 rounded-none p-3 hover:bg-accent/30 transition-colors text-base text-left w-full"
          onClick={() => { openNew(); setIsMenuOpen(false); }}
        >
          <Activity className="h-6 w-6 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="font-medium">Entrenamiento Libre</p>
            <p className="text-xs text-muted-foreground">Registra una sesión de gym</p>
          </div>
        </button>
        <button
          className="flex items-center gap-3 rounded-none p-3 hover:bg-accent/30 transition-colors text-base text-left w-full"
          onClick={() => { navigate("/routines?tab=ejercicios", { state: { action: "new" } }); setIsMenuOpen(false); setShowRoutineSubmenu(false); }}
        >
          <Dumbbell className="h-6 w-6 shrink-0 text-orange-500" />
          <div className="min-w-0">
            <p className="font-medium">Ejercicio</p>
            <p className="text-xs text-muted-foreground">Añade un ejercicio a tu biblioteca</p>
          </div>
        </button>
        <button
          className="flex items-center gap-3 rounded-none p-3 hover:bg-accent/30 transition-colors text-base text-left w-full"
          onClick={() => { navigate("/evolution", { state: { tab: "measurements", action: "new" } }); setIsMenuOpen(false); setShowRoutineSubmenu(false); }}
        >
          <Scale className="h-6 w-6 shrink-0 text-emerald-500" />
          <div className="min-w-0">
            <p className="font-medium">Medida</p>
            <p className="text-xs text-muted-foreground">Registra peso, cintura, etc.</p>
          </div>
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
                    "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300 ease-out active:scale-90 shadow-md",
                    isMenuOpen && "rotate-45 drop-shadow-[0_0_12px_rgba(var(--primary),0.6)]" // Rotación y neón
                  )}>
                    <Plus className="h-5 w-5 stroke-[2px]" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide transition-colors duration-300",
                      isMenuOpen ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Añadir
                  </span>
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
                          : "text-muted-foreground stroke-[2px] group-hover:text-foreground"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide transition-colors duration-300",
                      isActive ? "text-primary" : "text-muted-foreground"
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
    </>
  );
}