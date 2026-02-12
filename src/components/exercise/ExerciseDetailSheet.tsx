import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dumbbell, Pencil } from "lucide-react";

interface ExerciseDetail {
  id: string;
  nombre: string;
  descripcion?: string | null;
  imagen?: string | null;
  gif_url?: string | null;
  body_part?: string | null;
  equipment?: string | null;
  instructions?: string[] | null;
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
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
              <SheetHeader className="p-0">
                <div className="flex items-start justify-between gap-3">
                  <SheetTitle className="text-xl text-left leading-tight">
                    {exercise.nombre}
                  </SheetTitle>
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
              </SheetHeader>

              {/* Badges */}
              {(exercise.body_part || exercise.equipment) && (
                <div className="flex flex-wrap gap-2">
                  {exercise.body_part && (
                    <Badge variant="secondary" className="capitalize">
                      💪 {exercise.body_part}
                    </Badge>
                  )}
                  {exercise.equipment && (
                    <Badge variant="outline" className="capitalize">
                      🏋️ {exercise.equipment}
                    </Badge>
                  )}
                </div>
              )}

              {/* Description */}
              {exercise.descripcion && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {exercise.descripcion}
                </p>
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
      </SheetContent>
    </Sheet>
  );
};

export default ExerciseDetailSheet;
