import { useMemo, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, Pencil, Trash2, Copy, GripVertical, ChevronDown } from "lucide-react";
import { WorkoutMuscleMiniMap } from "@/components/dashboard/WorkoutMuscleMiniMap";
import type { RutinaWithDetails } from "@/types/routine";
import { formatRitmoSegKmLabel } from "@/types/workout";
import { cn } from "@/lib/utils";
import { tapMedium } from "@/lib/haptics";
import {
  aggregateRoutineMuscleSets,
  summarizeRoutineMuscleGroups,
} from "@/lib/muscleMapping";
import { resolveRoutineIcon } from "@/lib/routineIcons";
import {
  estimateRoutineDurationMinutes,
  formatEstimatedDurationLabel,
} from "@/lib/estimateRoutineDuration";
import { formatActivityRelativeDate } from "@/lib/formatActivityRelativeDate";
import type { PillCircleOrigin } from "@/lib/pillCircleTransition";
import { pillCircleOriginFromElement } from "@/lib/pillCircleTransition";
import { MUSCLE_GROUP_ICON_SRC, type MainMuscleGroup } from "@/constants/muscleGroups";

/** Handlers inertes para la copia de solo lectura del DragOverlay. */
const noop = () => {};

const LONG_PRESS_MS = 480;
const LONG_PRESS_MOVE_PX = 12;

interface RoutineCardProps {
  routine: RutinaWithDetails;
  isDragMode: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lastTrainedAt?: string | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (routine: RutinaWithDetails) => void;
  onStart: (routine: RutinaWithDetails, origin?: PillCircleOrigin) => void;
}

interface RoutineCardBaseProps extends RoutineCardProps {
  /** Ref del nodo sortable. Ausente en la copia que pinta el DragOverlay. */
  cardRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}

function RoutineCardBase({
  routine: r,
  isDragMode,
  isOpen,
  onOpenChange,
  lastTrainedAt = null,
  onEdit,
  onDelete,
  onDuplicate,
  onStart,
  cardRef,
  style,
  dragHandleProps,
  isDragging = false,
}: RoutineCardBaseProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const suppressClickRef = useRef(false);
  const longPressRef = useRef<{
    timer: ReturnType<typeof setTimeout> | null;
    x: number;
    y: number;
  }>({ timer: null, x: 0, y: 0 });

  const RoutineTitleIcon = resolveRoutineIcon(r.icono);
  const description = r.descripcion?.trim() || null;
  const durationLabel = formatEstimatedDurationLabel(
    estimateRoutineDurationMinutes(r.ejercicios),
  );
  const lastTrainedLabel = lastTrainedAt
    ? formatActivityRelativeDate(lastTrainedAt) || "Nunca"
    : "Nunca";
  const { groupSets, maxSets } = useMemo(
    () => aggregateRoutineMuscleSets(r.ejercicios),
    [r.ejercicios],
  );
  const primaryMuscles = useMemo(
    () => summarizeRoutineMuscleGroups(r.ejercicios, 3),
    [r.ejercicios],
  );
  const volumeRows = useMemo(
    () =>
      (Object.entries(groupSets) as [MainMuscleGroup, number][])
        .filter(([, sets]) => sets > 0)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es")),
    [groupSets],
  );
  const { totalSeries, repsMinTotal, repsMaxTotal } = useMemo(() => {
    let series = 0;
    let repsMin = 0;
    let repsMax = 0;
    for (const ej of r.ejercicios) {
      const sets = Math.max(0, Number(ej.series_objetivo) || 0);
      series += sets;
      const reg = (ej as { registro_series?: string }).registro_series;
      if (reg === "duracion" || reg === "duracion_ritmo") continue;
      repsMin += sets * Math.max(0, Number(ej.repes_min) || 0);
      repsMax += sets * Math.max(0, Number(ej.repes_max) || 0);
    }
    return { totalSeries: series, repsMinTotal: repsMin, repsMaxTotal: repsMax };
  }, [r.ejercicios]);

  const sortedEjercicios = [...r.ejercicios].sort((a, b) => a.orden - b.orden);

  const formatDescanso = (s: number | null) => {
    if (!s) return "—";
    return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : `${s}s`;
  };

  const metaLine = [durationLabel, lastTrainedLabel].filter(Boolean).join(" · ");
  const muscleLine = primaryMuscles.join(" · ");

  const clearLongPress = () => {
    if (longPressRef.current.timer != null) {
      clearTimeout(longPressRef.current.timer);
      longPressRef.current.timer = null;
    }
  };

  const openActionsMenu = () => {
    clearLongPress();
    suppressClickRef.current = true;
    // Efecto predefinido del sistema en vez de un buzz de 12 ms: es el mismo
    // tick que da Android al confirmar un long-press.
    tapMedium();
    setMenuOpen(true);
  };

  const handleCardPointerDown = (e: React.PointerEvent) => {
    if (isDragMode || menuOpen) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    clearLongPress();
    longPressRef.current.x = e.clientX;
    longPressRef.current.y = e.clientY;
    longPressRef.current.timer = setTimeout(openActionsMenu, LONG_PRESS_MS);
  };

  const handleCardPointerMove = (e: React.PointerEvent) => {
    if (longPressRef.current.timer == null) return;
    const dx = e.clientX - longPressRef.current.x;
    const dy = e.clientY - longPressRef.current.y;
    if (dx * dx + dy * dy > LONG_PRESS_MOVE_PX * LONG_PRESS_MOVE_PX) {
      clearLongPress();
    }
  };

  const handleCardPointerEnd = () => {
    clearLongPress();
  };

  const toggleOpen = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onOpenChange(!isOpen);
  };

  return (
    <DropdownMenu
      open={menuOpen}
      onOpenChange={(open) => {
        setMenuOpen(open);
        if (!open) suppressClickRef.current = false;
      }}
    >
      <Card
        ref={cardRef}
        style={style}
        className={cn(
          "relative w-full select-none overflow-hidden rounded-xl border border-border/40 bg-card shadow-none [-webkit-touch-callout:none]",
          // La tarjeta visible durante el arrastre la pinta el DragOverlay;
          // esta se queda como hueco atenuado en su sitio.
          isDragging && "opacity-30",
        )}
        onPointerDown={handleCardPointerDown}
        onPointerMove={handleCardPointerMove}
        onPointerUp={handleCardPointerEnd}
        onPointerCancel={handleCardPointerEnd}
        onContextMenu={(e) => {
          if (isDragMode) return;
          e.preventDefault();
          openActionsMenu();
        }}
      >
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="pointer-events-none absolute left-1/2 top-3 h-0 w-0 opacity-0"
            aria-hidden
            tabIndex={-1}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex w-44 flex-col gap-1 bg-popover">
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

        <CardContent className="p-0">
          <div className="flex items-stretch gap-1 px-2 py-3 min-[361px]:px-3">
            {isDragMode && (
              <button
                type="button"
                {...dragHandleProps}
                className="cursor-grab active:cursor-grabbing touch-none self-center text-muted-foreground hover:text-foreground p-1 -ml-1"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-5 w-5" />
              </button>
            )}

            <button
              type="button"
              onClick={toggleOpen}
              className="flex min-w-0 flex-1 items-center gap-3.5 text-left"
              aria-expanded={isOpen}
              aria-label={isOpen ? `Ocultar ejercicios de ${r.nombre}` : `Ver ejercicios de ${r.nombre}`}
            >
              <WorkoutMuscleMiniMap
                groupSets={groupSets}
                maxSets={maxSets}
                variant="routine"
                size="compact"
                className="h-full w-24 shrink-0 pointer-events-none"
              />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex min-w-0 items-center gap-2">
                  <h2 className="flex min-w-0 items-center gap-2 font-semibold text-base">
                    <RoutineTitleIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{r.nombre}</span>
                  </h2>
                  <Badge
                    variant="secondary"
                    className="shrink-0 border-0 bg-muted/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted/70"
                  >
                    <span className="max-[409px]:hidden">
                      {r.ejercicios.length} ejercicio{r.ejercicios.length !== 1 ? "s" : ""}
                    </span>
                    <span className="min-[410px]:hidden">{r.ejercicios.length} ejs</span>
                  </Badge>
                </div>
                {muscleLine ? (
                  <p className="text-sm text-muted-foreground truncate">{muscleLine}</p>
                ) : description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2 my-0.5">{description}</p>
                ) : null}
                {metaLine && (
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{metaLine}</p>
                )}
              </div>
            </button>

            <div
              className="flex shrink-0 flex-col items-center justify-center gap-0.5"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 text-foreground"
                aria-label="Iniciar entrenamiento"
                onClick={(e) => onStart(r, pillCircleOriginFromElement(e.currentTarget))}
              >
                <Play className="h-6 w-6 fill-current" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground"
                aria-label={isOpen ? "Ocultar ejercicios" : "Ver ejercicios"}
                aria-expanded={isOpen}
                onClick={toggleOpen}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          </div>

          <div
            className={`grid px-2 min-[361px]:px-3 transition-all duration-200 ease-out ${
              isOpen ? "grid-rows-[1fr] opacity-100 mt-3 pb-3" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden" inert={!isOpen ? true : undefined}>
              <div className="space-y-4">
                {volumeRows.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium text-muted-foreground">Series por grupo</p>
                    <div className="grid grid-cols-[max-content_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2">
                      {volumeRows.map(([group, sets]) => {
                        const pct = maxSets > 0 ? (sets / maxSets) * 100 : 0;
                        return (
                          <div key={group} className="contents">
                            <div className="flex items-center gap-1.5">
                              <img
                                src={MUSCLE_GROUP_ICON_SRC[group]}
                                alt=""
                                className="h-6 w-6 shrink-0"
                                draggable={false}
                              />
                              <span className="whitespace-nowrap text-xs text-muted-foreground">{group}</span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                            <span className="text-right text-xs tabular-nums text-muted-foreground">{sets}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-[11px] font-medium text-muted-foreground">
                    {[
                      `${sortedEjercicios.length} ejercicio${sortedEjercicios.length !== 1 ? "s" : ""}`,
                      totalSeries > 0
                        ? `${totalSeries} serie${totalSeries !== 1 ? "s" : ""}`
                        : null,
                      repsMaxTotal > 0
                        ? repsMinTotal === repsMaxTotal
                          ? `${repsMaxTotal} reps`
                          : `${repsMinTotal}–${repsMaxTotal} reps`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {sortedEjercicios.map((ej, idx) => {
                    const reg = (ej as { registro_series?: string }).registro_series;
                    const durObj = (ej as { duracion_objetivo_seg?: number | null }).duracion_objetivo_seg;
                    const ritmoObj = (ej as { ritmo_objetivo_seg_km?: number | null }).ritmo_objetivo_seg_km;
                    const setsLabel =
                      reg === "duracion"
                        ? `${ej.series_objetivo} x ${durObj ?? "—"}s`
                        : reg === "duracion_ritmo"
                          ? `${ej.series_objetivo} x ${durObj ?? "—"}s @ ${formatRitmoSegKmLabel(ritmoObj ?? null)}`
                          : `${ej.series_objetivo} x ${ej.repes_min}-${ej.repes_max}`;
                    const metaParts = [setsLabel];
                    if (ej.rir != null) metaParts.push(`RIR ${ej.rir}`);
                    const rest = formatDescanso(ej.descanso);
                    if (rest !== "—") metaParts.push(`${rest} desc.`);

                    return (
                      <div key={ej.id}>
                        {idx > 0 && <Separator className="my-2" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {ej.tipo_ejercicio?.nombre ?? "Ejercicio sin datos"}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {metaParts.join(" · ")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="grid grid-cols-3 gap-3"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 px-2 text-xs font-medium text-muted-foreground"
                    onClick={() => onEdit(r.id)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 px-2 text-xs font-medium text-muted-foreground"
                    onClick={() => onDuplicate(r)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Duplicar
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 px-2 text-xs font-medium text-destructive"
                    onClick={() => onDelete(r.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DropdownMenu>
  );
}

export function SortableRoutineCard(props: RoutineCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.routine.id,
    disabled: !props.isDragMode,
  });

  return (
    <RoutineCardBase
      {...props}
      cardRef={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      dragHandleProps={{ ...attributes, ...listeners }}
      isDragging={isDragging}
    />
  );
}

/**
 * Copia inerte de la tarjeta para el `DragOverlay`: no registra nada en dnd-kit
 * (registrar el mismo id dos veces rompería la detección de colisiones) y se
 * muestra siempre plegada.
 */
export function RoutineCardDragPreview({ routine }: { routine: RutinaWithDetails }) {
  return (
    <RoutineCardBase
      routine={routine}
      isDragMode
      isOpen={false}
      onOpenChange={noop}
      onEdit={noop}
      onDelete={noop}
      onDuplicate={noop}
      onStart={noop}
    />
  );
}
