import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, Pencil, Trash2, Copy, Dumbbell, Clock, History, GripVertical, ChevronDown, MoreVertical } from "lucide-react";
import type { RutinaWithDetails } from "@/types/routine";
import { formatRitmoSegKmLabel } from "@/types/workout";
import { cn } from "@/lib/utils";
import { summarizeRoutineMuscleGroups, resolveMainMuscleGroup } from "@/lib/muscleMapping";
import { resolveRoutineIcon } from "@/lib/routineIcons";
import {
  estimateRoutineDurationMinutes,
  formatEstimatedDurationLabel,
} from "@/lib/estimateRoutineDuration";
import { formatActivityRelativeDate } from "@/lib/formatActivityRelativeDate";
import type { PillCircleOrigin } from "@/lib/pillCircleTransition";
import { pillCircleOriginFromElement } from "@/lib/pillCircleTransition";

interface SortableRoutineCardProps {
  routine: RutinaWithDetails;
  isDragMode: boolean;
  lastTrainedAt?: string | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (routine: RutinaWithDetails) => void;
  onStart: (routine: RutinaWithDetails, origin?: PillCircleOrigin) => void;
}

export function SortableRoutineCard({
  routine: r,
  isDragMode,
  lastTrainedAt = null,
  onEdit,
  onDelete,
  onDuplicate,
  onStart,
}: SortableRoutineCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const RoutineTitleIcon = resolveRoutineIcon(r.icono);
  const description = r.descripcion?.trim() || null;
  const fromExercises = summarizeRoutineMuscleGroups(r.ejercicios);
  const muscleGroupsLabel =
    fromExercises.length > 0
      ? fromExercises.join(" · ")
      : resolveMainMuscleGroup(r.grupo_muscular) ?? (r.grupo_muscular?.trim() || null);
  const subtitle = description ?? muscleGroupsLabel;
  const durationLabel = formatEstimatedDurationLabel(
    estimateRoutineDurationMinutes(r.ejercicios),
  );
  const lastTrainedLabel = lastTrainedAt
    ? formatActivityRelativeDate(lastTrainedAt) || "Nunca"
    : "Nunca";

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
        "w-full overflow-hidden rounded-xl border border-border/40 bg-card shadow-none",
        isDragging && "shadow-lg ring-2 ring-primary/30",
      )}
    >
      <CardContent className="p-3 px-4">
        {/* Header */}
        <div className="flex items-stretch justify-between gap-3">
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
              <h2 className="font-semibold text-base flex items-center gap-2 min-w-0">
                <RoutineTitleIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{r.nombre}</span>
              </h2>
              {subtitle && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {subtitle}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <Dumbbell className="h-3 w-3" />
                  {r.ejercicios.length} ejercicio{r.ejercicios.length !== 1 ? "s" : ""}
                </span>
                {durationLabel && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {durationLabel}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <History className="h-3 w-3" />
                  {lastTrainedLabel}
                </span>
              </p>
            </button>
          </div>
          <div className="flex flex-col items-end justify-between shrink-0 -mr-1">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 text-foreground"
                aria-label="Iniciar entrenamiento"
                onClick={(e) => onStart(r, pillCircleOriginFromElement(e.currentTarget))}
              >
                <Play className="h-6 w-6 fill-current" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground"
                    aria-label="Más opciones"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="flex w-44 flex-col gap-1 bg-popover">
                  <DropdownMenuItem onClick={() => onEdit(r.id)}>
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(r)}>
                    <Copy className="mr-2 h-4 w-4" /> Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(r.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              aria-label={isOpen ? "Ocultar ejercicios" : "Ver ejercicios"}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((v) => !v)}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
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
              {sortedEjercicios.map((ej, idx) => {
                const reg = (ej as { registro_series?: string }).registro_series;
                const durObj = (ej as { duracion_objetivo_seg?: number | null }).duracion_objetivo_seg;
                const ritmoObj = (ej as { ritmo_objetivo_seg_km?: number | null }).ritmo_objetivo_seg_km;
                const setsBadge =
                  reg === "duracion"
                    ? `${ej.series_objetivo}×${durObj ?? "—"}s`
                    : reg === "duracion_ritmo"
                      ? `${ej.series_objetivo}×${durObj ?? "—"}s @ ${formatRitmoSegKmLabel(ritmoObj ?? null)}`
                      : `${ej.series_objetivo}×${ej.repes_min}-${ej.repes_max}`;
                return (
                <div key={ej.id}>
                  {idx > 0 && <Separator className="my-2" />}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">
                      {ej.tipo_ejercicio?.nombre ?? "Ejercicio sin datos"}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {setsBadge}
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
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
