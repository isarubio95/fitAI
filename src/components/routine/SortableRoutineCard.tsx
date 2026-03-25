import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Play, Pencil, Trash2, Dumbbell, GripVertical, ChevronDown } from "lucide-react";
import type { RutinaWithDetails } from "@/types/routine";
import { cn } from "@/lib/utils";

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
  const [isOpen, setIsOpen] = useState(false);

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

  const sortedEjercicios = [...r.ejercicios].sort((a, b) => a.orden - b.orden);

  const formatDescanso = (s: number | null) => {
    if (!s) return "—";
    return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : `${s}s`;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "overflow-hidden w-full rounded-none border-x-0 md:rounded-3xl md:border-x",
        isDragging && "shadow-lg ring-2 ring-primary/30",
      )}
    >
      <CardContent className="px-6 py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {isDragMode && (
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground p-1 -ml-1"
              >
                <GripVertical className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="flex-1 min-w-0 text-left"
            >
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
            </button>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen((v) => !v)}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </Button>
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

        {/* Expandable exercise list */}
        <div
          className={`grid transition-all duration-200 ease-out ${
            isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="rounded-lg bg-muted/30 p-3 space-y-0">
              {sortedEjercicios.map((ej, idx) => (
                <div key={ej.id}>
                  {idx > 0 && <Separator className="my-2" />}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">
                      {ej.tipo_ejercicio?.nombre ?? "Ejercicio sin datos"}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {ej.series_objetivo}×{ej.repes_min}-{ej.repes_max}
                      </Badge>
                      {ej.rir != null && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          RIR {ej.rir}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatDescanso(ej.descanso)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button className="w-full mt-3" variant="once" onClick={() => onStart(r)}>
          <Play className="h-4 w-4 mr-2" /> Iniciar Entrenamiento
        </Button>
      </CardContent>
    </Card>
  );
}
