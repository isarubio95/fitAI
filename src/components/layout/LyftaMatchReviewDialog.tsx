import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LyftaExerciseResolution, UnmatchedLyftaExercise } from "@/lib/lyfta/importLyfta";

type CatalogOption = { id: string; nombre: string };

type RowState = {
  query: string;
  tipoId: string | null;
  omitted: boolean;
  createCustom: boolean;
};

type Props = {
  open: boolean;
  unmatched: UnmatchedLyftaExercise[];
  catalog: CatalogOption[];
  confirming?: boolean;
  onCancel: () => void;
  onConfirm: (resolutions: LyftaExerciseResolution[]) => void;
};

const emptyRow = (): RowState => ({
  query: "",
  tipoId: null,
  omitted: false,
  createCustom: false,
});

export function LyftaMatchReviewDialog({
  open,
  unmatched,
  catalog,
  confirming,
  onCancel,
  onConfirm,
}: Props) {
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const unmatchedKey = unmatched.map((u) => u.lyftaId).join(",");

  useEffect(() => {
    if (open) setRows({});
  }, [open, unmatchedKey]);

  const stateFor = (id: string): RowState => rows[id] ?? emptyRow();

  const allResolved = unmatched.every((u) => {
    const s = stateFor(u.lyftaId);
    return s.omitted || s.createCustom || !!s.tipoId;
  });

  const selectedNames = useMemo(() => new Map(catalog.map((c) => [c.id, c.nombre])), [catalog]);

  const filtered = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalog.filter((c) => c.nombre.toLowerCase().includes(q)).slice(0, 12);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onCancel() : undefined)}>
      <DialogContent className="sm:max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Emparejar ejercicios de Lyfta</DialogTitle>
        </DialogHeader>
        <p className="text-xs leading-snug text-muted-foreground">
          Estos ejercicios no tienen par automático. Elige uno del catálogo, créalo como
          personalizado u omítelo.
        </p>
        <ul className="max-h-[50dvh] space-y-4 overflow-y-auto pr-1">
          {unmatched.map((item) => {
            const s = stateFor(item.lyftaId);
            const options = filtered(s.query);
            return (
              <li key={item.lyftaId} className="space-y-2 rounded-xl border border-border/50 p-3">
                <p className="text-sm font-medium">{item.nombre}</p>
                {s.omitted ? (
                  <p className="text-xs text-muted-foreground">Se omitirá en este import.</p>
                ) : s.createCustom ? (
                  <p className="text-xs text-muted-foreground">
                    Se creará como ejercicio personalizado.
                  </p>
                ) : s.tipoId ? (
                  <p className="text-xs text-muted-foreground">
                    Par: {selectedNames.get(s.tipoId) ?? "catálogo"}
                  </p>
                ) : (
                  <>
                    <Input
                      aria-label={`Buscar par para ${item.nombre}`}
                      placeholder="Buscar en el catálogo…"
                      value={s.query}
                      onChange={(e) =>
                        setRows((prev) => ({
                          ...prev,
                          [item.lyftaId]: {
                            ...stateFor(item.lyftaId),
                            query: e.target.value,
                            tipoId: null,
                            createCustom: false,
                          },
                        }))
                      }
                    />
                    <div className="flex flex-col gap-1">
                      {options.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          className={cn("rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent/50")}
                          onClick={() =>
                            setRows((prev) => ({
                              ...prev,
                              [item.lyftaId]: {
                                query: opt.nombre,
                                tipoId: opt.id,
                                omitted: false,
                                createCustom: false,
                              },
                            }))
                          }
                        >
                          {opt.nombre}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <div className="flex flex-wrap gap-2">
                  {s.tipoId || s.omitted || s.createCustom ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRows((prev) => ({
                          ...prev,
                          [item.lyftaId]: emptyRow(),
                        }))
                      }
                    >
                      Cambiar
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Crear «${item.nombre}»`}
                      onClick={() =>
                        setRows((prev) => ({
                          ...prev,
                          [item.lyftaId]: {
                            query: "",
                            tipoId: null,
                            omitted: false,
                            createCustom: true,
                          },
                        }))
                      }
                    >
                      Crear personalizado
                    </Button>
                  )}
                  {!s.omitted ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setRows((prev) => ({
                          ...prev,
                          [item.lyftaId]: {
                            query: "",
                            tipoId: null,
                            omitted: true,
                            createCustom: false,
                          },
                        }))
                      }
                    >
                      Omitir
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        <Button
          type="button"
          size="sm"
          className="w-full"
          disabled={!allResolved || confirming}
          onClick={() =>
            onConfirm(
              unmatched.map((u) => {
                const s = stateFor(u.lyftaId);
                return {
                  lyftaId: u.lyftaId,
                  tipoEjercicioId: s.omitted || s.createCustom ? null : s.tipoId,
                  createCustom: s.createCustom || undefined,
                };
              }),
            )
          }
        >
          {confirming ? "Importando…" : "Continuar importación"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
