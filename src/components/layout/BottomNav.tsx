import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, User, ClipboardList, CirclePlus, Users } from "lucide-react";
import { CardioWorkoutIcon } from "@/components/icons/CardioWorkoutIcon";
import { GymWorkoutIcon } from "@/components/icons/GymWorkoutIcon";
import { cn } from "@/lib/utils";
import { floatingGlassSurface } from "@/lib/surface-styles";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useBackCloseLayer } from "@/hooks/useBackCloseLayer";

const navItems = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/routines", icon: ClipboardList, label: "Biblioteca" },
  { type: "add" },
  { to: "/community", icon: Users, label: "Comunidad" },
  { to: "/evolution", icon: User, label: "Tú" },
];

export function BottomNav({
  skipInsetSync = false,
  locationOverride,
  onNavigate,
}: {
  skipInsetSync?: boolean;
  locationOverride?: string;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const { openNew } = useGlobalWorkoutDrawer();
  const { openLiveSetup } = useGlobalCardioDrawer();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const activePath = locationOverride ?? location.pathname;

  useBackCloseLayer({
    open: isMenuOpen,
    onOpenChange: (next) => {
      setIsMenuOpen(next);
    },
    kind: "popover",
  });

  // Expone el espacio inferior real (nav + safe area) para FAB, pills y overlays
  // aunque el usuario tenga el tamaño de fuente del sistema aumentado.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || skipInsetSync) return;

    const updateBottomNavInset = () => {
      const rect = nav.getBoundingClientRect();
      const gapPx = 8;
      const inset = window.innerHeight - rect.top + gapPx;
      document.documentElement.style.setProperty("--app-bottom-nav-inset", `${Math.round(inset)}px`);
    };

    updateBottomNavInset();
    const observer = new ResizeObserver(updateBottomNavInset);
    observer.observe(nav);
    window.addEventListener("resize", updateBottomNavInset);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateBottomNavInset);
    };
  }, [skipInsetSync]);

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
  }, [location.pathname]);

  return (
    <>
      {/* Overlay que difumina la página cuando el menú Registrar está abierto */}
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden",
          isMenuOpen
            ? "pointer-events-auto opacity-100 transition-opacity duration-300"
            : "pointer-events-none opacity-0 duration-0",
        )}
        onClick={() => setIsMenuOpen(false)}
      />
      <nav
        ref={navRef}
        data-app-bottom-nav
        className={cn(
          // Barra flotante: el contenido pasa por debajo, así que la nav se lee
          // como una pieza aparte y no como el final de la página.
          "fixed inset-x-0 bottom-0 z-50 w-full px-3 pb-[calc(0.625rem+var(--app-safe-area-bottom,env(safe-area-inset-bottom,0px)))] md:hidden",
        )}
      >
        {/* MENÚ DESPLEGABLE DE ACCIONES (fuera del contenedor con overflow-hidden) */}
      <div
        className={cn(
          "absolute bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 flex w-[min(92vw,22.5rem)] origin-bottom flex-col overflow-hidden rounded-3xl bg-card ease-in-out",
          floatingGlassSurface,
          isMenuOpen
            ? "pointer-events-auto scale-100 opacity-100 transition-all duration-300"
            : "pointer-events-none scale-50 opacity-0 duration-0",
        )}
      >
        <button
          className="flex w-full items-center gap-3.5 rounded-none px-4 py-3 text-left text-base transition-colors hover:bg-accent/30"
          onClick={() => { openNew(); setIsMenuOpen(false); }}
        >
          <GymWorkoutIcon className="h-6 w-6 text-primary" />
          <div className="min-w-0">
            <p className="font-medium">Fuerza</p>
            <p className="text-xs text-muted-foreground">Registra una sesión de gym</p>
          </div>
        </button>
        <button
          className="flex w-full items-center gap-3.5 rounded-none px-4 py-3 text-left text-base transition-colors hover:bg-accent/30"
          onClick={() => { openLiveSetup(); setIsMenuOpen(false); }}
        >
          <CardioWorkoutIcon className="h-6 w-6 text-blue-500" />
          <div className="min-w-0">
            <p className="font-medium">Cardio</p>
            <p className="text-xs text-muted-foreground">Registra carrera, bici, cinta, etc.</p>
          </div>
        </button>
      </div>

      {/* BARRA DE NAVEGACIÓN */}
      <div
        className={cn(
          "relative flex items-center justify-around rounded-[1.75rem] px-1.5 py-2",
          floatingGlassSurface,
        )}
      >
        {navItems.map((item, index) => {
          // Renderizado del botón central +
          if (item.type === "add") {
            return (
              <div key="add-button" className="flex flex-1 flex-col items-center justify-center gap-1">
                <button
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate();
                      return;
                    }
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className={cn(
                    "touch-styled group flex flex-col items-center justify-center gap-1",
                    "transition-transform duration-200 ease-out active:scale-[0.94] active:duration-100",
                    "focus:outline-none"
                  )}
                >
                  <div className="relative">
                    <CirclePlus
                      className={cn(
                        "h-6 w-6 stroke-[2px] transition-[color,transform] duration-200 ease-out",
                        isMenuOpen
                          ? "rotate-45 nav-icon-pop text-primary"
                          : "text-muted-foreground dark:text-foreground group-hover:text-foreground"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide transition-colors duration-200",
                      isMenuOpen
                        ? "text-primary"
                        : "text-muted-foreground dark:text-foreground"
                    )}
                  >
                    Registrar
                  </span>
                </button>
              </div>
            );
          }

          // Renderizado normal de los NavLinks
          const { to, icon: Icon, label } = item;
          const isItemActive = to === "/" ? activePath === "/" : activePath.startsWith(to!);
          return (
            <NavLink
              key={to}
              to={to!}
              end={to === "/"}
              onClick={() => {
                onNavigate?.();
                if (location.pathname === to) window.scrollTo(0, 0);
              }}
              className={cn(
                "touch-styled group flex flex-1 flex-col items-center justify-center gap-1",
                "transition-transform duration-200 ease-out active:scale-[0.94] active:duration-100",
                "focus:outline-none"
              )}
            >
              <>
                  <div className="relative">
                    <Icon
                      key={isItemActive ? "active" : "inactive"}
                      className={cn(
                        "h-6 w-6 stroke-[2px] transition-colors duration-200 ease-out",
                        isItemActive
                          ? "nav-icon-pop text-primary"
                          : "text-muted-foreground dark:text-foreground group-hover:text-foreground"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide transition-colors duration-200",
                      isItemActive
                        ? "text-primary"
                        : "text-muted-foreground dark:text-foreground"
                    )}
                  >
                    {label}
                  </span>
              </>
            </NavLink>
          );
        })}
      </div>
    </nav>
    </>
  );
}
