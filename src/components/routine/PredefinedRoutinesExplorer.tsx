import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  usePredefinedRoutines,
  useCloneRoutine,
  type PredefinedRoutine,
} from "@/hooks/usePredefinedRoutines";
import {
  ArrowLeft,
  Dumbbell,
  Clock,
  Hourglass,
  Timer,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Zap,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// --- Mock data for empty state ---
const MOCK_ROUTINES: PredefinedRoutine[] = [
  { id: "mock-1", nombre: "Full Body Principiante", descripcion: "Rutina ideal para empezar en el gimnasio", nivel: "Principiante", duracion_minutos: 45, grupo_muscular: "Full Body", ejercicios: [] },
  { id: "mock-2", nombre: "Push Day Avanzado", descripcion: "Empuje intenso: pecho, hombro y tríceps", nivel: "Avanzado", duracion_minutos: 60, grupo_muscular: "Empuje", ejercicios: [] },
  { id: "mock-3", nombre: "Pull Day Intermedio", descripcion: "Tracción para espalda y bíceps", nivel: "Intermedio", duracion_minutos: 50, grupo_muscular: "Tracción", ejercicios: [] },
  { id: "mock-4", nombre: "Piernas y Glúteos", descripcion: "Tren inferior completo con énfasis en glúteo", nivel: "Intermedio", duracion_minutos: 55, grupo_muscular: "Piernas", ejercicios: [] },
  { id: "mock-5", nombre: "Torso Express", descripcion: "Torso completo en 30 minutos", nivel: "Principiante", duracion_minutos: 30, grupo_muscular: "Torso", ejercicios: [] },
  { id: "mock-6", nombre: "Brazos & Core", descripcion: "Bíceps, tríceps y abdominales", nivel: "Avanzado", duracion_minutos: 40, grupo_muscular: "Brazos", ejercicios: [] },
];

const NIVELES = [
  { value: "Principiante", label: "Baja", icon: SignalLow },
  { value: "Intermedio", label: "Media", icon: SignalMedium },
  { value: "Avanzado", label: "Alta", icon: SignalHigh },
];

/** Normaliza valores de nivel de la BD (Bajo, bajo, etc.) al valor usado en filtros (Principiante, Intermedio, Avanzado). */
function normalizeNivelForFilter(nivel: string | null): string | null {
  if (!nivel || typeof nivel !== "string") return null;
  const n = nivel.trim().toLowerCase();
  if (["principiante", "bajo", "baja"].includes(n)) return "Principiante";
  if (["intermedio", "medio", "media"].includes(n)) return "Intermedio";
  if (["avanzado", "alto", "alta"].includes(n)) return "Avanzado";
  return nivel;
}

const DURACIONES = [
  { value: 30, label: "30 min", icon: Timer },
  { value: 45, label: "45 min", icon: Clock },
  { value: 60, label: "60+ min", icon: Hourglass },
];

const GRUPOS = [
  "Full Body", "Torso", "Piernas", "Empuje", "Tracción",
  "Pecho y Tríceps", "Espalda y Bíceps", "Brazos", "Hombro y Core",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PredefinedRoutinesExplorer({ open, onOpenChange }: Props) {
  const { data: routines, isLoading } = usePredefinedRoutines();
  const cloneRoutine = useCloneRoutine();

  const [filterNivel, setFilterNivel] = useState<string | null>(null);
  const [filterDuracion, setFilterDuracion] = useState<number | null>(null);
  const [filterGrupo, setFilterGrupo] = useState<string | null>(null);

  const isMock = !routines?.length && !isLoading;
  const source = isMock ? MOCK_ROUTINES : routines || [];

  const filtered = useMemo(() => {
    return source.filter((r) => {
      if (filterNivel && normalizeNivelForFilter(r.nivel) !== filterNivel) return false;
      if (filterGrupo && r.grupo_muscular !== filterGrupo) return false;
      if (filterDuracion) {
        const dur = r.duracion_minutos ?? 0;
        if (filterDuracion === 60 && dur < 60) return false;
        if (filterDuracion < 60 && dur !== filterDuracion) return false;
      }
      return true;
    });
  }, [source, filterNivel, filterDuracion, filterGrupo]);

  const handleClone = async (id: string) => {
    if (isMock) return;
    await cloneRoutine.mutateAsync(id);
    // Mantenemos el modal abierto para poder añadir más rutinas
  };

  const toggleFilter = <T,>(value: T, setter: React.Dispatch<React.SetStateAction<T | null>>) => {
    setter((prev) => (prev === value ? null : value));
  };

  const nivelColor = (nivel: string | null) => {
    switch (nivel) {
      case "Principiante": return "text-emerald-400";
      case "Intermedio": return "text-amber-400";
      case "Avanzado": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full h-[90dvh] max-h-[90dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <DialogTitle className="text-lg font-bold">Rutinas Predefinidas</DialogTitle>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 space-y-3 border-b border-border shrink-0">
          {/* Nivel */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nivel</p>
            <div className="flex gap-2">
              {NIVELES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => toggleFilter(value, setFilterNivel)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    filterNivel === value
                      ? "bg-secondary text-secondary-foreground ring-1 ring-ring"
                      : "text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Duración */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Duración</p>
            <div className="flex gap-2">
              {DURACIONES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => toggleFilter(value, setFilterDuracion)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    filterDuracion === value
                      ? "bg-secondary text-secondary-foreground ring-1 ring-ring"
                      : "text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Grupo muscular */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Grupo muscular</p>
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-1">
                {GRUPOS.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleFilter(g, setFilterGrupo)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
                      filterGrupo === g
                        ? "bg-secondary text-secondary-foreground ring-1 ring-ring"
                        : "text-muted-foreground hover:bg-secondary/50"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>

        {/* Cards */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Sparkles className="h-10 w-10 mx-auto text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No se encontraron rutinas con esos filtros.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout" key={`${filterNivel ?? ""}-${filterDuracion ?? ""}-${filterGrupo ?? ""}`}>
                {filtered.map((r) => (
                  <RoutineCard
                    key={r.id}
                    routine={r}
                    isMock={isMock}
                    nivelColor={nivelColor}
                    onClone={handleClone}
                    isCloning={cloneRoutine.isPending}
                  />
                ))}
              </AnimatePresence>
            )}

            {isMock && (
              <p className="text-center text-xs text-muted-foreground/60 pt-2">
                Estas son rutinas de ejemplo. Añade plantillas predefinidas desde tu base de datos.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function RoutineCard({
  routine: r,
  isMock,
  nivelColor,
  onClone,
  isCloning,
}: {
  routine: PredefinedRoutine;
  isMock: boolean;
  nivelColor: (n: string | null) => string;
  onClone: (id: string) => void;
  isCloning: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-2xl border border-border bg-card p-4 space-y-3",
        isMock && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight truncate">{r.nombre}</h3>
          {r.descripcion && (
            <p className="text-xs text-muted-foreground line-clamp-2">{r.descripcion}</p>
          )}
        </div>
        <Dumbbell className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {r.nivel && (
          <Badge variant="secondary" className={cn("text-[10px] gap-1", nivelColor(r.nivel))}>
            <Signal className="h-3 w-3" />
            {r.nivel}
          </Badge>
        )}
        {r.duracion_minutos && (
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Clock className="h-3 w-3" />
            {r.duracion_minutos} min
          </Badge>
        )}
        {r.grupo_muscular && (
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Zap className="h-3 w-3" />
            {r.grupo_muscular}
          </Badge>
        )}
        {r.ejercicios.length > 0 && (
          <Badge variant="outline" className="text-[10px]">
            {r.ejercicios.length} ejercicios
          </Badge>
        )}
      </div>

      <Button
        size="sm"
        className="w-full gap-1.5"
        disabled={isMock || isCloning}
        onClick={() => onClone(r.id)}
      >
        {isCloning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Añadir a mis rutinas
      </Button>
    </motion.div>
  );
}
