import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useCardioDisciplinas } from "@/hooks/useCardioSessions";
import { iconForCardioDisciplineCodigo } from "@/lib/cardioIcons";
import { cardioDisciplineUsesGpsMap } from "@/lib/cardioLiveMap";
import { cn } from "@/lib/utils";

type Discipline = {
  id: string;
  nombre: string;
  codigo: string;
};

type Props = {
  selectedId: string | null;
  /** Preferencia (p. ej. último cardio); si no hay selección aún, se aplica. */
  preferredId?: string | null;
  onSelect: (id: string) => void;
};

function pickFallbackId(list: Discipline[]): string | null {
  if (list.length === 0) return null;
  const gps = list.find((d) => cardioDisciplineUsesGpsMap(d.codigo));
  return gps?.id ?? list[0]?.id ?? null;
}

export function CardioDisciplineIsland({
  selectedId,
  preferredId = null,
  onSelect,
}: Props) {
  const { data: disciplinas, isLoading } = useCardioDisciplinas();
  const list = (disciplinas ?? []) as Discipline[];
  const [expanded, setExpanded] = useState(false);
  const islandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedId || list.length === 0) return;
    const preferred =
      preferredId && list.some((d) => d.id === preferredId) ? preferredId : null;
    const id = preferred ?? pickFallbackId(list);
    if (id) onSelect(id);
  }, [list, selectedId, preferredId, onSelect]);

  useEffect(() => {
    if (!expanded) return;
    const handlePointerDownOutside = (event: PointerEvent) => {
      const root = islandRef.current;
      if (!root || root.contains(event.target as Node)) return;
      setExpanded(false);
    };
    document.addEventListener("pointerdown", handlePointerDownOutside);
    return () => document.removeEventListener("pointerdown", handlePointerDownOutside);
  }, [expanded]);

  const selected = useMemo(
    () => list.find((d) => d.id === selectedId) ?? null,
    [list, selectedId],
  );
  const SelectedIcon = iconForCardioDisciplineCodigo(selected?.codigo);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div
        ref={islandRef}
        className={cn(
          "pointer-events-auto w-full max-w-[13.5rem] overflow-hidden rounded-[2rem]",
          "border border-border/80 bg-[hsl(var(--surface-elevated)/0.95)] shadow-lg backdrop-blur-xl",
          "transition-[box-shadow] duration-300 ease-out",
        )}
      >
        <div className="flex items-center px-1.5 py-1.5">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1.5 text-left transition-colors hover:bg-muted/50"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            aria-label={expanded ? "Cerrar tipo de cardio" : "Elegir tipo de cardio"}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SelectedIcon className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight">
              {selected?.nombre ?? (isLoading ? "Cargando…" : "Tipo de cardio")}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out",
                expanded && "rotate-180",
              )}
            />
          </button>
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={cn(
                "space-y-1 px-2 pb-2.5 transition-opacity duration-300 ease-out",
                expanded ? "opacity-100" : "opacity-0",
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando…
                </div>
              ) : list.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No hay disciplinas disponibles.
                </p>
              ) : (
                <ul className="max-h-52 space-y-0.5 overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {list.map((d) => {
                    const Icon = iconForCardioDisciplineCodigo(d.codigo);
                    const active = d.id === selectedId;
                    return (
                      <li key={d.id}>
                        <button
                          type="button"
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                            active
                              ? "bg-primary/10 text-foreground"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                          )}
                          onClick={() => {
                            onSelect(d.id);
                            setExpanded(false);
                          }}
                        >
                          <Icon
                            className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "")}
                            aria-hidden
                          />
                          <span className={cn("truncate text-sm font-medium", active && "text-foreground")}>
                            {d.nombre}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
