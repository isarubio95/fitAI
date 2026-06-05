import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Home, BarChart3, ClipboardList, Scale, Plus, Users } from "lucide-react";
import { CardioWorkoutIcon } from "@/components/icons/CardioWorkoutIcon";
import { GymWorkoutIcon } from "@/components/icons/GymWorkoutIcon";
import { cn } from "@/lib/utils";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useStartCardioLiveSession, useCardioDisciplinas } from "@/hooks/useCardioSessions";
import { useToast } from "@/hooks/use-toast";
import { CardioTypePickerDialog } from "@/components/cardio/CardioTypePickerDialog";
import { useBackCloseLayer } from "@/hooks/useBackCloseLayer";

const navItems = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/routines", icon: ClipboardList, label: "Rutinas" },
  { type: "add" },
  { to: "/community", icon: Users, label: "Comunidad" },
  { to: "/evolution", icon: BarChart3, label: "Evolución" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openNew } = useGlobalWorkoutDrawer();
  const { openNewWithDiscipline, openLiveRecording } = useGlobalCardioDrawer();
  const startCardioLive = useStartCardioLiveSession();
  const { data: cardioDisciplinas } = useCardioDisciplinas();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cardioTypeDialogOpen, setCardioTypeDialogOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useBackCloseLayer({
    open: isMenuOpen,
    onOpenChange: (next) => {
      setIsMenuOpen(next);
    },
    kind: "popover",
  });

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
        className="fixed bottom-3 left-1/2 z-50 w-[min(96vw,29rem)] -translate-x-1/2 md:hidden"
      >
        {/* MENÚ DESPLEGABLE DE ACCIONES (fuera del contenedor con overflow-hidden) */}
      <div
        className={cn(
          "absolute bottom-[calc(100%+0.75rem)] left-1/2 -translate-x-1/2 flex w-[min(92vw,22.5rem)] origin-bottom flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl transition-all duration-300 ease-in-out",
          isMenuOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-50 opacity-0 pointer-events-none"
        )}
      >
        <button
          className="flex items-center gap-3 rounded-none p-3 hover:bg-accent/30 transition-colors text-base text-left w-full"
          onClick={() => { openNew(); setIsMenuOpen(false); }}
        >
          <GymWorkoutIcon className="h-6 w-6 text-primary" />
          <div className="min-w-0">
            <p className="font-medium">Entreno de Gimnasio</p>
            <p className="text-xs text-muted-foreground">Registra una sesión de gym</p>
          </div>
        </button>
        <button
          className="flex items-center gap-3 rounded-none p-3 hover:bg-accent/30 transition-colors text-base text-left w-full"
          onClick={() => { setCardioTypeDialogOpen(true); setIsMenuOpen(false); }}
        >
          <CardioWorkoutIcon className="h-6 w-6 text-blue-500" />
          <div className="min-w-0">
            <p className="font-medium">Entreno de Cardio</p>
            <p className="text-xs text-muted-foreground">Registra carrera, bici, cinta, etc.</p>
          </div>
        </button>
        <button
          className="flex items-center gap-3 rounded-none p-3 hover:bg-accent/30 transition-colors text-base text-left w-full"
          onClick={() => { navigate("/evolution", { state: { tab: "measurements", action: "new" } }); setIsMenuOpen(false); }}
        >
          <Scale className="h-6 w-6 shrink-0 text-emerald-500" />
          <div className="min-w-0">
            <p className="font-medium">Medida</p>
            <p className="text-xs text-muted-foreground">Registra peso, cintura, etc.</p>
          </div>
        </button>
      </div>

      <CardioTypePickerDialog
        open={cardioTypeDialogOpen}
        onOpenChange={setCardioTypeDialogOpen}
        isConfirmPending={startCardioLive.isPending}
        onConfirm={async (disciplineId) => {
          const d = cardioDisciplinas?.find((x) => x.id === disciplineId);
          const titulo = `${(d?.nombre ?? "Cardio").trim()} · ${format(new Date(), "d MMM HH:mm", { locale: es })}`;
          try {
            const id = await startCardioLive.mutateAsync({
              cardio_disciplina_id: disciplineId,
              titulo,
            });
            openLiveRecording(id);
            setCardioTypeDialogOpen(false);
            } catch (e: unknown) {
              const msg =
                e && typeof e === "object" && "message" in e && typeof (e as { message: string }).message === "string"
                  ? (e as { message: string }).message
                  : e instanceof Error
                    ? e.message
                    : "Inténtalo de nuevo.";
              toast({ title: "No se pudo iniciar la sesión", description: msg, variant: "destructive" });
            }
        }}
        onConfirmManual={(disciplineId) => {
          openNewWithDiscipline(disciplineId);
          setCardioTypeDialogOpen(false);
        }}
      />

      {/* BARRA DE NAVEGACIÓN */}
      <div className="relative flex h-[72px] items-center justify-around overflow-hidden rounded-[1.75rem] border border-black/10 bg-white/70 px-2 pb-[calc(env(safe-area-inset-bottom)*0.55)] pt-1 shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-[hsl(222_47%_12%/0.88)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)] dark:ring-1 dark:ring-white/5">
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