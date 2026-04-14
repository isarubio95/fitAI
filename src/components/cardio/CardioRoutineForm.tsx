import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpsertCardioRoutine } from "@/hooks/useCardioRoutines";
import { useCardioDisciplinas } from "@/hooks/useCardioSessions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { CardioRoutineBlockInput } from "@/types/cardio";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: {
    id?: string;
    nombre: string;
    descripcion?: string | null;
    cardio_disciplina_id?: string | null;
    bloques: CardioRoutineBlockInput[];
  } | null;
};

const emptyBlock = (): CardioRoutineBlockInput => ({
  tipo_bloque: "work",
  distancia_objetivo_m: null,
  duracion_objetivo_seg: null,
  ritmo_objetivo_seg_km: null,
  fc_objetivo: null,
});

const sectionCardClass = "rounded-xl border border-border bg-card p-4 space-y-4";

export function CardioRoutineForm({ open, onOpenChange, initial }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [disciplinaId, setDisciplinaId] = useState<string | null>(null);
  const [bloques, setBloques] = useState<CardioRoutineBlockInput[]>([emptyBlock()]);
  const upsert = useUpsertCardioRoutine();
  const { data: disciplinas } = useCardioDisciplinas();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setNombre(initial?.nombre ?? "");
    setDescripcion(initial?.descripcion ?? "");
    setDisciplinaId(initial?.cardio_disciplina_id ?? null);
    setBloques(initial?.bloques?.length ? initial.bloques : [emptyBlock()]);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const activeEl = document.activeElement as HTMLElement | null;
      activeEl?.blur?.();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  const save = async () => {
    if (!nombre.trim()) {
      toast({ title: "Añade nombre de rutina", variant: "destructive" });
      return;
    }
    await upsert.mutateAsync({
      id: initial?.id,
      input: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        cardio_disciplina_id: disciplinaId,
        bloques,
      },
    });
    toast({ title: initial?.id ? "Rutina cardio actualizada" : "Rutina cardio creada" });
    onOpenChange(false);
  };

  const title = initial?.id ? "Editar rutina cardio" : "Nueva rutina cardio";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="bottom"
        className="h-[92dvh] overflow-y-auto rounded-t-[20px] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DrawerHeader className="sticky top-0 z-10 border-b border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <DrawerTitle className="text-lg">{title}</DrawerTitle>
            <Button type="button" size="sm" onClick={save} disabled={upsert.isPending}>
              {upsert.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {upsert.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </DrawerHeader>

        <div className="space-y-6 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="rutina-nombre">Nombre</Label>
              <Input id="rutina-nombre" className="h-12" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="rutina-desc">Descripción</Label>
              <Input id="rutina-desc" className="h-12" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Disciplina</Label>
              <Select value={disciplinaId ?? "none"} onValueChange={(value) => setDisciplinaId(value === "none" ? null : value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {(disciplinas ?? []).map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Bloques objetivo</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setBloques((p) => [...p, emptyBlock()])}>
                <Plus className="mr-1 h-4 w-4" /> Añadir
              </Button>
            </div>
            {bloques.map((b, idx) => (
              <div key={idx} className={cn(sectionCardClass, "space-y-4")}>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="col-span-2 space-y-1.5 sm:col-span-1">
                    <Label htmlFor={`rb-${idx}-tipo`}>Tipo</Label>
                    <Input
                      id={`rb-${idx}-tipo`}
                      className="h-12"
                      value={b.tipo_bloque}
                      onChange={(e) => setBloques((p) => p.map((x, i) => (i === idx ? { ...x, tipo_bloque: e.target.value } : x)))}
                      placeholder="work"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5 sm:col-span-1">
                    <Label htmlFor={`rb-${idx}-dist`}>Distancia (m)</Label>
                    <Input
                      id={`rb-${idx}-dist`}
                      className="h-12"
                      type="number"
                      value={b.distancia_objetivo_m ?? ""}
                      onChange={(e) =>
                        setBloques((p) =>
                          p.map((x, i) => (i === idx ? { ...x, distancia_objetivo_m: e.target.value ? Number(e.target.value) : null } : x)),
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5 sm:col-span-1">
                    <Label htmlFor={`rb-${idx}-dur`}>Duración (s)</Label>
                    <Input
                      id={`rb-${idx}-dur`}
                      className="h-12"
                      type="number"
                      value={b.duracion_objetivo_seg ?? ""}
                      onChange={(e) =>
                        setBloques((p) =>
                          p.map((x, i) => (i === idx ? { ...x, duracion_objetivo_seg: e.target.value ? Number(e.target.value) : null } : x)),
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5 sm:col-span-1">
                    <Label htmlFor={`rb-${idx}-ritmo`}>Ritmo (seg/km)</Label>
                    <Input
                      id={`rb-${idx}-ritmo`}
                      className="h-12"
                      type="number"
                      value={b.ritmo_objetivo_seg_km ?? ""}
                      onChange={(e) =>
                        setBloques((p) =>
                          p.map((x, i) => (i === idx ? { ...x, ritmo_objetivo_seg_km: e.target.value ? Number(e.target.value) : null } : x)),
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5 sm:col-span-1">
                    <Label htmlFor={`rb-${idx}-fc`}>FC objetivo</Label>
                    <Input
                      id={`rb-${idx}-fc`}
                      className="h-12"
                      type="number"
                      value={b.fc_objetivo ?? ""}
                      onChange={(e) =>
                        setBloques((p) => p.map((x, i) => (i === idx ? { ...x, fc_objetivo: e.target.value ? Number(e.target.value) : null } : x)))
                      }
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setBloques((p) => p.filter((_, i) => i !== idx))}
                  disabled={bloques.length === 1}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Eliminar bloque
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
