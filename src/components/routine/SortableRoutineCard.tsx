import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pencil, Trash2, Dumbbell, GripVertical } from "lucide-react";
import type { RutinaWithDetails } from "@/types/routine";

interface SortableRoutineCardProps {
  routine: RutinaWithDetails;
  isDragMode: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStart: (routine: RutinaWithDetails) => void;
}

export function SortableRoutineCard({
  routine: r,
  isDragMode,
  onEdit,
  onDelete,
  onStart,
}: SortableRoutineCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: r.id, disabled: !isDragMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden ${isDragging ? "shadow-lg ring-2 ring-primary/30" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {isDragMode && (
              <button
                {...attributes}
                {...listeners}
                className="mt-0.5 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground p-1 -ml-1"
              >
                <GripVertical className="h-5 w-5" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-base">{r.nombre}</h2>
              {r.descripcion && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {r.descripcion}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <Dumbbell className="h-3 w-3" />
                {r.ejercicios.length} ejercicio{r.ejercicios.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(r.id)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onDelete(r.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button className="w-full mt-3" onClick={() => onStart(r)}>
          <Play className="h-4 w-4 mr-2" /> Iniciar Entrenamiento
        </Button>
      </CardContent>
    </Card>
  );
}
