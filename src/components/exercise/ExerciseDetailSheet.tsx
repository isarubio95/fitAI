import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Dumbbell, Layers, Pencil, SignalMedium, Wrench } from "lucide-react";

function difficultyToLevel(d: unknown): 1 | 2 | 3 | null {
  if (d == null) return null;
  if (typeof d === "number" && Number.isFinite(d)) {
    const n = Math.max(1, Math.min(3, Math.round(d)));
    return n as 1 | 2 | 3;
  }
  const s = String(d).trim().toLowerCase();
  const num = Number.parseInt(s, 10);
  if (Number.isFinite(num)) {
    const n = Math.max(1, Math.min(3, num));
    return n as 1 | 2 | 3;
  }
  if (s.includes("baja")) return 1;
  if (s.includes("media")) return 2;
  if (s.includes("alta")) return 3;
  return null;
}

function DifficultyBars({ level }: { level: 1 | 2 | 3 }) {
  const color =
    level === 1
      ? "text-emerald-600 dark:text-emerald-400"
      : level === 2
        ? "text-amber-600 dark:text-amber-400"
        : "text-orange-600 dark:text-orange-400";

  return (
    <span className={cn("inline-flex items-center gap-1", color)}>
      <SignalMedium className="h-3.5 w-3.5" />
      <span className="inline-flex items-end gap-[3px]">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "inline-block w-[4px] rounded-sm",
              i === 1 ? "h-[6px]" : i === 2 ? "h-[9px]" : "h-[12px]",
              i <= level ? "bg-current" : "bg-current/25",
            )}
          />
        ))}
      </span>
    </span>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 uppercase tracking-wide text-[11px] text-muted-foreground/80">
        {label}
      </span>
      <div className="min-w-0 text-sm text-foreground/90">{children}</div>
    </div>
  );
}

interface ExerciseDetail {
  id: string;
  nombre: string;
  imagen?: string | null;
  gif_url?: string | null;
  body_part?: string | string[] | null;
  equipment?: string | null;
  instructions?: string[] | null;
  tipo?: string | null;
  grupo_muscular?: string | null;
  dificultad?: string | null;
  usuario_id?: string | null;
}

interface ExerciseDetailSheetProps {
  exercise: ExerciseDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
  onEdit?: (exercise: ExerciseDetail) => void;
}

const ExerciseDetailSheet = ({
  exercise,
  open,
  onOpenChange,
  currentUserId,
  onEdit,
}: ExerciseDetailSheetProps) => {
  if (!exercise) return null;

  const mediaUrl = exercise.gif_url || exercise.imagen;
  const isOwn = exercise.usuario_id && exercise.usuario_id === currentUserId;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="bottom" className="h-[85dvh] rounded-t-2xl p-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {/* Media */}
            <div className="relative w-full aspect-video bg-muted flex items-center justify-center overflow-hidden rounded-t-2xl">
              {mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt={exercise.nombre}
                  className="w-full h-full object-contain bg-muted"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Dumbbell className="h-12 w-12" />
                  <span className="text-sm">Sin imagen disponible</span>
                </div>
              )}
            </div>

            <div className="p-5 space-y-5">
              {/* Header */}
              <DrawerHeader className="p-0">
                <div className="flex items-start justify-between gap-3">
                  <DrawerTitle className="text-xl text-left leading-tight">
                    {exercise.nombre}
                  </DrawerTitle>
                  {isOwn && onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5"
                      onClick={() => onEdit(exercise)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                  )}
                </div>
              </DrawerHeader>

              {/* Metadatos en líneas separadas */}
              {(exercise.body_part || exercise.equipment || exercise.tipo || exercise.grupo_muscular || exercise.dificultad) && (
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2.5">
                  {difficultyToLevel(exercise.dificultad) && (
                    <MetaRow label="Dificultad">
                      <DifficultyBars level={difficultyToLevel(exercise.dificultad)!} />
                    </MetaRow>
                  )}
                  {exercise.tipo && (
                    <MetaRow label="Tipo">
                      <span className="inline-flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-primary" />
                        <span className="capitalize">{exercise.tipo}</span>
                      </span>
                    </MetaRow>
                  )}
                  {exercise.grupo_muscular && (
                    <MetaRow label="Grupo">
                      <span className="inline-flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        <span className="capitalize">{exercise.grupo_muscular}</span>
                      </span>
                    </MetaRow>
                  )}
                  {exercise.equipment && (
                    <MetaRow label="Equipamiento">
                      <span className="inline-flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-primary" />
                        <span className="capitalize">{exercise.equipment}</span>
                      </span>
                    </MetaRow>
                  )}
                  {exercise.body_part && (
                    <MetaRow label="Músculos">
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(exercise.body_part) ? exercise.body_part : [exercise.body_part]).map((part) => (
                          <Badge key={part} variant="secondary" className="capitalize">
                            💪 {part}
                          </Badge>
                        ))}
                      </div>
                    </MetaRow>
                  )}
                </div>
              )}

              {/* Instructions */}
              {exercise.instructions && exercise.instructions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Instrucciones</h3>
                  <ol className="space-y-2.5 list-none">
                    {exercise.instructions.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default ExerciseDetailSheet;
