import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { Activity, Bike, CircleEllipsis, Footprints, Loader2, Ship, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCardioDisciplinas } from "@/hooks/useCardioSessions";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT_PX = 48;
const WHEEL_VIEWPORT_PX = 216;
/** Copias de la lista para scroll cíclico (bloque central = índice 2). */
const WHEEL_COPIES = 5;
const WHEEL_MIDDLE_COPY = Math.floor(WHEEL_COPIES / 2);
/** Deltas en píxeles por encima de esto se tratan como rueda discreta (1 fila / evento). */
const WHEEL_CHUNKY_PX = 24;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (disciplineId: string) => void | Promise<void>;
  /** Abre el formulario manual (sin grabación en vivo / GPS). */
  onConfirmManual?: (disciplineId: string) => void;
  /** Deshabilita «Continuar» mientras se crea la sesión en vivo. */
  isConfirmPending?: boolean;
};

function iconForDisciplineCodigo(codigo: string): LucideIcon {
  switch (codigo) {
    case "running":
      return Activity;
    case "cycling":
      return Bike;
    case "walking":
      return Footprints;
    case "rowing":
      return Ship;
    case "swimming":
      return Waves;
    default:
      return CircleEllipsis;
  }
}

export function CardioTypePickerDialog({ open, onOpenChange, onConfirm, onConfirmManual, isConfirmPending }: Props) {
  const { data: disciplinas, isLoading } = useCardioDisciplinas();
  const list = disciplinas ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const pickerWrapRef = useRef<HTMLDivElement>(null);
  const wheelPixelAccumRef = useRef(0);
  /** Fila virtual bajo el punto de mira (hay N×WHEEL_COPIES filas; una sola coincide con el centro). */
  const [centerVirtualRow, setCenterVirtualRow] = useState(0);

  const padY = useMemo(() => (WHEEL_VIEWPORT_PX - ITEM_HEIGHT_PX) / 2, []);
  const n = list.length;

  const correctVirtualRowAndScroll = useCallback(
    (el: HTMLDivElement): number => {
      if (n === 0) return 0;
      // Centro del viewport alineado con fila vi cuando scrollTop ≈ vi * ITEM_HEIGHT (ver padding simétrico padY).
      let row = Math.round(el.scrollTop / ITEM_HEIGHT_PX);
      const maxRow = WHEEL_COPIES * n - 1;
      row = Math.max(0, Math.min(row, maxRow));
      if (row < n) {
        el.scrollTop += n * ITEM_HEIGHT_PX;
        row += n;
      } else if (row >= (WHEEL_COPIES - 1) * n) {
        el.scrollTop -= n * ITEM_HEIGHT_PX;
        row -= n;
      }
      return row;
    },
    [n],
  );

  const logicalFromVirtualRow = useCallback(
    (row: number) => ((row % n) + n) % n,
    [n],
  );

  useEffect(() => {
    if (!open || n === 0) return;
    const id = window.requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) {
        const top = WHEEL_MIDDLE_COPY * n * ITEM_HEIGHT_PX;
        el.scrollTop = top;
        setCenterVirtualRow(top / ITEM_HEIGHT_PX);
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, n, padY]);

  useLayoutEffect(() => {
    if (!open || n === 0 || isLoading) return;
    const wrap = pickerWrapRef.current;
    const scrollEl = scrollRef.current;
    if (!wrap || !scrollEl) return;

    const stepByWheel = (dir: number) => {
      if (dir === 0) return;
      const el = scrollRef.current;
      if (!el) return;
      let row = correctVirtualRowAndScroll(el);
      row += dir;
      row = Math.max(0, Math.min(WHEEL_COPIES * n - 1, row));
      el.scrollTop = row * ITEM_HEIGHT_PX;
      row = correctVirtualRowAndScroll(el);
      setCenterVirtualRow(row);
    };

    const onWheel = (e: WheelEvent) => {
      if (!wrap.contains(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
      let dir = 0;
      const lineOrPage =
        e.deltaMode === WheelEvent.DOM_DELTA_LINE || e.deltaMode === WheelEvent.DOM_DELTA_PAGE;
      const chunky = Math.abs(e.deltaY) >= WHEEL_CHUNKY_PX;

      if (lineOrPage || chunky) {
        wheelPixelAccumRef.current = 0;
        dir = Math.sign(e.deltaY);
      } else {
        wheelPixelAccumRef.current += e.deltaY;
        const t = ITEM_HEIGHT_PX * 0.65;
        if (Math.abs(wheelPixelAccumRef.current) >= t) {
          dir = wheelPixelAccumRef.current > 0 ? 1 : -1;
          wheelPixelAccumRef.current = 0;
        }
      }

      stepByWheel(dir);
    };

    wrap.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => {
      wheelPixelAccumRef.current = 0;
      wrap.removeEventListener("wheel", onWheel, true);
    };
  }, [open, n, isLoading, correctVirtualRowAndScroll]);

  const onWheelScroll = () => {
    const el = scrollRef.current;
    if (!el || n === 0) return;
    const row = correctVirtualRowAndScroll(el);
    setCenterVirtualRow(row);
  };

  const selectedId =
    n > 0 ? list[logicalFromVirtualRow(centerVirtualRow)]?.id ?? null : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setCenterVirtualRow(0);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader className="space-y-2 text-center sm:text-center">
          <DialogTitle className="text-base font-semibold tracking-tight">Tipo de cardio</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Desplaza la lista circular y elige una modalidad.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando...
          </div>
        ) : list.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No hay disciplinas disponibles.</p>
        ) : (
          <div ref={pickerWrapRef} className="relative w-full">
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 z-20 h-[calc(50%-24px)] rounded-t-xl",
                "bg-gradient-to-b from-background via-background/85 to-transparent",
              )}
              aria-hidden
            />
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[calc(50%-24px)] rounded-b-xl",
                "bg-gradient-to-t from-background via-background/85 to-transparent",
              )}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-3 top-1/2 z-10 h-12 -translate-y-1/2 rounded-lg border border-primary/30 bg-transparent shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.1)]"
              aria-hidden
            />
            <div
              ref={scrollRef}
              onScroll={onWheelScroll}
              className={cn(
                "relative z-0 max-h-[var(--wheel-h)] overflow-y-auto overscroll-y-contain rounded-xl border border-border/80 bg-muted/25",
                "scroll-py-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              )}
              style={
                {
                  "--wheel-h": `${WHEEL_VIEWPORT_PX}px`,
                  maxHeight: WHEEL_VIEWPORT_PX,
                  scrollSnapType: "y proximity",
                  WebkitOverflowScrolling: "touch",
                  maskImage:
                    "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
                } as CSSProperties
              }
            >
              <div style={{ paddingTop: padY, paddingBottom: padY }}>
                {Array.from({ length: WHEEL_COPIES * n }, (_, vi) => {
                  const d = list[vi % n];
                  const Icon = iconForDisciplineCodigo(d.codigo);
                  const isActive = vi === centerVirtualRow;
                  return (
                    <div
                      key={`${vi}-${d.id}`}
                      className={cn(
                        "flex h-12 shrink-0 snap-center snap-always items-center justify-center gap-4 px-4",
                        "transition-[transform,opacity] duration-150 ease-out",
                        isActive ? "scale-100 opacity-100" : "scale-[0.92] opacity-40",
                      )}
                      style={{ height: ITEM_HEIGHT_PX }}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                        aria-hidden
                      />
                      <span
                        className={cn(
                          "text-[15px] font-medium tracking-tight",
                          isActive ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {d.nombre}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {onConfirmManual ? (
          <button
            type="button"
            className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
            disabled={!selectedId}
            onClick={() => {
              if (!selectedId) return;
              onConfirmManual(selectedId);
              setCenterVirtualRow(0);
            }}
          >
            Registrar sin GPS (formulario manual)
          </button>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="rounded-xl font-semibold inline-flex items-center justify-center gap-2"
            disabled={!selectedId || isConfirmPending}
            onClick={() => {
              if (!selectedId) return;
              void Promise.resolve(onConfirm(selectedId)).finally(() => setCenterVirtualRow(0));
            }}
          >
            {isConfirmPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Iniciando…
              </>
            ) : (
              "Continuar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
