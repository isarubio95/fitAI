import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Home, User, ClipboardList, CirclePlus, Users } from "lucide-react";
import { CardioWorkoutIcon } from "@/components/icons/CardioWorkoutIcon";
import { GymWorkoutIcon } from "@/components/icons/GymWorkoutIcon";
import { cn } from "@/lib/utils";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useBackCloseLayer } from "@/hooks/useBackCloseLayer";
import { tapLight } from "@/lib/haptics";
import { preloadRoute } from "@/lib/routePreload";
import { markNavDirection } from "@/lib/navDirection";

const navItems = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/routines", icon: ClipboardList, label: "Biblioteca" },
  { type: "add" as const },
  { to: "/community", icon: Users, label: "Comunidad" },
  { to: "/evolution", icon: User, label: "Tú" },
];

/** Misma curva que el indicador de `AnimatedTabsList`. */
const INDICATOR_TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] } as const;

function isTabActive(to: string, path: string) {
  return to === "/" ? path === "/" : path.startsWith(to);
}

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
  const reduceMotion = useReducedMotion();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const canAnimateIndicator = useRef(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const activePath = locationOverride ?? location.pathname;

  const activeIndex = isMenuOpen
    ? navItems.findIndex((item) => item.type === "add")
    : navItems.findIndex((item) => item.to && isTabActive(item.to, activePath));

  useBackCloseLayer({
    open: isMenuOpen,
    onOpenChange: (next) => {
      setIsMenuOpen(next);
    },
    kind: "popover",
  });

  const updateIndicator = useCallback(() => {
    const bar = barRef.current;
    const item = activeIndex >= 0 ? itemRefs.current[activeIndex] : null;
    if (!bar || !item) {
      setIndicator((prev) => (prev.width === 0 ? prev : { left: 0, width: 0 }));
      return;
    }

    const barRect = bar.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const inset = 4;
    const next = {
      left: itemRect.left - barRect.left + inset,
      width: Math.max(itemRect.width - inset * 2, 0),
    };
    setIndicator((prev) =>
      prev.left === next.left && prev.width === next.width ? prev : next,
    );
  }, [activeIndex]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, activePath, isMenuOpen]);

  useEffect(() => {
    if (indicator.width > 0) canAnimateIndicator.current = true;
  }, [indicator.width]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const observer = new ResizeObserver(updateIndicator);
    observer.observe(bar);
    window.addEventListener("resize", updateIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

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

  const itemClassName = "relative z-10 flex flex-1 flex-col items-center justify-center gap-1 px-1 py-2";

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
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 w-full px-3 pb-[calc(0.5rem+var(--app-safe-area-bottom,env(safe-area-inset-bottom,0px)))] pt-1 md:hidden"
      >
        {/* MENÚ DESPLEGABLE DE ACCIONES (fuera del contenedor con overflow-hidden) */}
      <div
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        className={cn(
          "pointer-events-auto absolute bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 flex w-[min(92vw,22.5rem)] origin-bottom flex-col overflow-hidden rounded-3xl border border-border bg-card ease-in-out",
          isMenuOpen
            ? "pointer-events-auto scale-100 opacity-100 transition-all duration-300"
            : "pointer-events-none scale-50 opacity-0 duration-0",
        )}
      >
        <button
          className="flex w-full items-center gap-3.5 rounded-none px-4 py-3 text-left text-base transition-colors hover:bg-accent/30"
          onClick={() => { tapLight(); openNew(); setIsMenuOpen(false); }}
        >
          <GymWorkoutIcon className="h-6 w-6 text-primary" />
          <div className="min-w-0">
            <p className="font-medium">Fuerza</p>
            <p className="text-xs text-muted-foreground">Registra una sesión de gym</p>
          </div>
        </button>
        <button
          className="flex w-full items-center gap-3.5 rounded-none px-4 py-3 text-left text-base transition-colors hover:bg-accent/30"
          onClick={() => { tapLight(); openLiveSetup(); setIsMenuOpen(false); }}
        >
          <CardioWorkoutIcon className="h-6 w-6 text-chart-fitness" />
          <div className="min-w-0">
            <p className="font-medium">Cardio</p>
            <p className="text-xs text-muted-foreground">Registra carrera, bici, cinta, etc.</p>
          </div>
        </button>
      </div>

      {/* BARRA DE NAVEGACIÓN */}
      <div
        ref={barRef}
        data-app-bottom-nav-bar
        className="relative flex items-center overflow-hidden rounded-full border border-border px-1 py-1 shadow-float pointer-events-auto"
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-primary/10"
          initial={false}
          animate={{
            left: indicator.left,
            width: indicator.width,
            opacity: indicator.width > 0 ? 1 : 0,
          }}
          transition={
            reduceMotion || !canAnimateIndicator.current
              ? { duration: 0 }
              : INDICATOR_TRANSITION
          }
        />
        {navItems.map((item, index) => {
          // Renderizado del botón central +
          if (item.type === "add") {
            return (
              <button
                key="add-button"
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                onClick={() => {
                  tapLight();
                  if (onNavigate) {
                    onNavigate();
                    return;
                  }
                  setIsMenuOpen(!isMenuOpen);
                }}
                data-press-sink
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                className={cn(
                  "touch-styled group",
                  itemClassName,
                  "focus:outline-none",
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
            );
          }

          // Renderizado normal de los NavLinks
          const { to, icon: Icon, label } = item;
          const isItemActive = !isMenuOpen && isTabActive(to!, activePath);
          return (
            <NavLink
              key={to}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              to={to!}
              end={to === "/"}
              // Anima la entrada de la nueva sección (ver ::view-transition-* en
              // index.css). Donde la API no existe, React Router navega normal.
              viewTransition
              // Adelanta el chunk ~150 ms al click: elimina el hueco en blanco.
              onPointerDown={() => preloadRoute(to!)}
              onClick={() => {
                markNavDirection(location.pathname, to!);
                // Mismo pulso que el botón central: toda la barra responde igual,
                // también al tocar el tab en el que ya estás.
                tapLight();
                onNavigate?.();
                if (location.pathname === to) window.scrollTo(0, 0);
              }}
              data-press-sink
              className={cn(
                "touch-styled group",
                itemClassName,
                "focus:outline-none",
              )}
            >
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
            </NavLink>
          );
        })}
      </div>
    </nav>
    </>
  );
}
