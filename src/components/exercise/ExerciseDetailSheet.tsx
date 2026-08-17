import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  drawerSafeAreaBottom,
  drawerSheetRadiusTop,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Dumbbell, Layers, Pencil, Bookmark, Wrench } from "lucide-react";
import {
  useExerciseFavorites,
  type ExerciseFavoriteSource,
} from "@/hooks/useExerciseFavorites";
import { useToast } from "@/hooks/use-toast";
import { fetchExerciseCatalogDetail } from "@/hooks/useExerciseCatalog";
import { resolveExerciseMediaUrl } from "@/lib/exerciseMediaUrl";

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
    <span className={cn("inline-flex items-end gap-[3px]", color)} aria-hidden>
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
  __source?: ExerciseFavoriteSource;
}

interface ExerciseDetailSheetProps {
  exercise: ExerciseDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
  onEdit?: (exercise: ExerciseDetail) => void;
  /** Origen del ejercicio para favoritos; si no se pasa se infiere de usuario_id / __source. */
  favoriteSource?: ExerciseFavoriteSource;
  /** Clases extra del panel (p. ej. z-index en drawers anidados). */
  className?: string;
  overlayClassName?: string;
}

function resolveFavoriteSource(
  exercise: ExerciseDetail,
  explicit?: ExerciseFavoriteSource,
): ExerciseFavoriteSource {
  if (explicit) return explicit;
  if (exercise.__source === "usuario" || exercise.__source === "catalogo") return exercise.__source;
  return exercise.usuario_id ? "usuario" : "catalogo";
}

const ExerciseDetailSheet = ({
  exercise,
  open,
  onOpenChange,
  currentUserId,
  onEdit,
  favoriteSource,
  className,
  overlayClassName,
}: ExerciseDetailSheetProps) => {
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useExerciseFavorites();
  const [detail, setDetail] = useState<ExerciseDetail | null>(exercise);

  useEffect(() => {
    setDetail(exercise);
    if (!open || !exercise) return;
    const source = resolveFavoriteSource(exercise, favoriteSource);
    let cancelled = false;
    void fetchExerciseCatalogDetail(exercise.id, source)
      .then((row) => {
        if (!cancelled) setDetail(row);
      })
      .catch(() => {
        /* el listado ya muestra nombre; el gif/instrucciones quedan opcionales */
      });
    return () => {
      cancelled = true;
    };
  }, [exercise, favoriteSource, open]);

  if (!detail) return null;

  const mediaUrl = resolveExerciseMediaUrl(detail.gif_url || detail.imagen);
  const isOwn = detail.usuario_id && detail.usuario_id === currentUserId;
  const source = resolveFavoriteSource(detail, favoriteSource);
  const canFavorite = !!currentUserId;
  const favored = canFavorite && isFavorite(source, detail.id);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="bottom"
        overlayClassName={overlayClassName}
        className={cn("h-[85lvh] max-h-[85lvh] bg-card p-0", className)}
      >
        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {/* Media */}
            <div className={cn("relative w-full aspect-video bg-muted flex items-center justify-center overflow-hidden", drawerSheetRadiusTop)}>
              {mediaUrl ? (
                <img
                  src={mediaUrl}
                  alt={detail.nombre}
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

            <div className={cn("p-5 space-y-5", drawerSafeAreaBottom)}>
              {/* Header */}
              <DrawerHeader className="p-0">
                <div className="flex items-center justify-between gap-3">
                  <DrawerTitle className="min-w-0 flex-1 text-left text-xl leading-snug">
                    {detail.nombre}
                  </DrawerTitle>
                  <div className="flex shrink-0 items-center gap-2 self-center">
                    {canFavorite && (
                      <button
                        type="button"
                        className={cn(
                          "touch-styled inline-flex size-5 shrink-0 items-center justify-center p-0",
                          favored ? "text-primary" : "text-muted-foreground",
                        )}
                        aria-label={
                          favored
                            ? `Quitar ${detail.nombre} de favoritos`
                            : `Guardar ${detail.nombre} en favoritos`
                        }
                        aria-pressed={favored}
                        onClick={async (e) => {
                          (e.currentTarget as HTMLButtonElement).blur();
                          try {
                            await toggleFavorite({ source, id: detail.id });
                          } catch (err: unknown) {
                            toast({
                              title: "No se pudo actualizar favoritos",
                              description: err instanceof Error ? err.message : "Error desconocido",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Bookmark
                          className={cn("size-5", favored && "fill-current")}
                          strokeWidth={2}
                        />
                      </button>
                    )}
                    {isOwn && onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => onEdit(detail)}
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </Button>
                    )}
                  </div>
                </div>
              </DrawerHeader>

              {/* Metadatos en líneas separadas */}
              {(detail.body_part || detail.equipment || detail.tipo || detail.grupo_muscular || detail.dificultad) && (
                <div className="rounded-2xl bg-background p-4 space-y-2.5">
                  {difficultyToLevel(detail.dificultad) && (
                    <MetaRow label="Dificultad">
                      <DifficultyBars level={difficultyToLevel(detail.dificultad)!} />
                    </MetaRow>
                  )}
                  {detail.tipo && (
                    <MetaRow label="Tipo">
                      <span className="inline-flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-primary" />
                        <span className="capitalize">{detail.tipo}</span>
                      </span>
                    </MetaRow>
                  )}
                  {detail.grupo_muscular && (
                    <MetaRow label="Grupo">
                      <span className="inline-flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        <span className="capitalize">{detail.grupo_muscular}</span>
                      </span>
                    </MetaRow>
                  )}
                  {detail.equipment && (
                    <MetaRow label="Equipamiento">
                      <span className="inline-flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-primary" />
                        <span className="capitalize">{detail.equipment}</span>
                      </span>
                    </MetaRow>
                  )}
                  {detail.body_part && (
                    <MetaRow label="Músculos">
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(detail.body_part) ? detail.body_part : [detail.body_part]).map((part) => (
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
              {detail.instructions && detail.instructions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Instrucciones</h3>
                  <ol className="space-y-2.5 list-none">
                    {detail.instructions.map((step, i) => (
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
