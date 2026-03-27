import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useCardioSessionById, useUpsertCardioSession } from "@/hooks/useCardioSessions";
import type { CardioBlockInput } from "@/types/cardio";

function emptyBlock(): CardioBlockInput {
  return {
    tipo_bloque: "work",
    distancia_m: null,
    duracion_seg: null,
    elevacion_m: null,
    fc_media: null,
    fc_max: null,
    calorias: null,
  };
}

export function CardioLogger() {
  const { state, setOpen } = useGlobalCardioDrawer();
  const { toast } = useToast();
  const upsert = useUpsertCardioSession();
  const { data: sessionData, isLoading } = useCardioSessionById(state.sessionId);

  const [titulo, setTitulo] = useState("");
  const [deporte, setDeporte] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [esPublica, setEsPublica] = useState(false);
  const [bloques, setBloques] = useState<CardioBlockInput[]>([emptyBlock()]);

  const defaultStart = useMemo(() => new Date().toISOString().slice(0, 16), []);

  useEffect(() => {
    if (!state.open) return;
    if (state.sessionId && sessionData) {
      setTitulo(sessionData.titulo ?? "");
      setDeporte(sessionData.deporte ?? "");
      setFechaInicio((sessionData.fecha_inicio ?? "").slice(0, 16));
      setFechaFin((sessionData.fecha_fin ?? "").slice(0, 16));
      setComentarios(sessionData.comentarios ?? "");
      setEsPublica(sessionData.es_publica ?? false);
      setBloques(
        (sessionData.cardio_bloque ?? []).map((b) => ({
          tipo_bloque: b.tipo_bloque ?? "work",
          distancia_m: b.distancia_m,
          duracion_seg: b.duracion_seg,
          elevacion_m: b.elevacion_m,
          fc_media: b.fc_media,
          fc_max: b.fc_max,
          calorias: b.calorias,
        })),
      );
      return;
    }

    if (state.templateBlocks?.length) {
      setTitulo(state.templateTitle || "Sesión cardio");
      setBloques(
        state.templateBlocks.map((b) => ({
          tipo_bloque: b.tipo_bloque,
          distancia_m: b.distancia_objetivo_m ?? null,
          duracion_seg: b.duracion_objetivo_seg ?? null,
          fc_media: b.fc_objetivo ?? null,
          elevacion_m: null,
          fc_max: null,
          calorias: null,
        })),
      );
    } else {
      setTitulo("");
      setBloques([emptyBlock()]);
    }
    setDeporte("");
    setFechaInicio(defaultStart);
    setFechaFin("");
    setComentarios("");
    setEsPublica(false);
  }, [state.open, state.sessionId, sessionData, state.templateBlocks, state.templateTitle, defaultStart]);

  const updateBlock = (idx: number, patch: Partial<CardioBlockInput>) => {
    setBloques((prev) => prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  };

  const save = async () => {
    if (!titulo.trim()) {
      toast({ title: "Añade un título", variant: "destructive" });
      return;
    }
    if (!fechaInicio) {
      toast({ title: "Añade fecha de inicio", variant: "destructive" });
      return;
    }
    await upsert.mutateAsync({
      id: state.sessionId,
      input: {
        titulo: titulo.trim(),
        deporte: deporte.trim() || null,
        fecha_inicio: new Date(fechaInicio).toISOString(),
        fecha_fin: fechaFin ? new Date(fechaFin).toISOString() : null,
        comentarios: comentarios.trim() || null,
        es_publica: esPublica,
        bloques,
      },
    });
    toast({ title: state.sessionId ? "Cardio actualizado" : "Cardio guardado" });
    setOpen(false);
  };

  return (
    <Sheet open={state.open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{state.sessionId ? "Editar entrenamiento de cardio" : "Entrenamiento de cardio"}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: 10K suave" />
          </div>
          <div className="space-y-2">
            <Label>Deporte</Label>
            <Input value={deporte} onChange={(e) => setDeporte(e.target.value)} placeholder="Running, bici, remo..." />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Inicio</Label>
              <Input type="datetime-local" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fin</Label>
              <Input type="datetime-local" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={esPublica} onCheckedChange={setEsPublica} />
            <Label>Sesión pública</Label>
          </div>

          <div className="space-y-2">
            <Label>Comentarios</Label>
            <Input value={comentarios} onChange={(e) => setComentarios(e.target.value)} placeholder="Notas..." />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Bloques</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setBloques((p) => [...p, emptyBlock()])}>
                <Plus className="mr-1 h-4 w-4" /> Añadir bloque
              </Button>
            </div>
            {bloques.map((bloque, idx) => (
              <div key={idx} className="space-y-2 rounded-lg border p-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Input
                    value={bloque.tipo_bloque}
                    onChange={(e) => updateBlock(idx, { tipo_bloque: e.target.value })}
                    placeholder="tipo"
                  />
                  <Input
                    type="number"
                    value={bloque.distancia_m ?? ""}
                    onChange={(e) => updateBlock(idx, { distancia_m: e.target.value ? Number(e.target.value) : null })}
                    placeholder="distancia (m)"
                  />
                  <Input
                    type="number"
                    value={bloque.duracion_seg ?? ""}
                    onChange={(e) => updateBlock(idx, { duracion_seg: e.target.value ? Number(e.target.value) : null })}
                    placeholder="duración (s)"
                  />
                  <Input
                    type="number"
                    value={bloque.fc_media ?? ""}
                    onChange={(e) => updateBlock(idx, { fc_media: e.target.value ? Number(e.target.value) : null })}
                    placeholder="FC media"
                  />
                  <Input
                    type="number"
                    value={bloque.fc_max ?? ""}
                    onChange={(e) => updateBlock(idx, { fc_max: e.target.value ? Number(e.target.value) : null })}
                    placeholder="FC max"
                  />
                  <Input
                    type="number"
                    value={bloque.calorias ?? ""}
                    onChange={(e) => updateBlock(idx, { calorias: e.target.value ? Number(e.target.value) : null })}
                    placeholder="kcal"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setBloques((prev) => prev.filter((_, i) => i !== idx))}
                  disabled={bloques.length === 1}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Eliminar bloque
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={save} className="w-full" disabled={upsert.isPending || isLoading}>
            {upsert.isPending ? "Guardando..." : "Guardar cardio"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

