import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUpsertCardioRoutine } from "@/hooks/useCardioRoutines";
import { useToast } from "@/hooks/use-toast";
import type { CardioRoutineBlockInput } from "@/types/cardio";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: {
    id?: string;
    nombre: string;
    descripcion?: string | null;
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

export function CardioRoutineForm({ open, onOpenChange, initial }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [bloques, setBloques] = useState<CardioRoutineBlockInput[]>([emptyBlock()]);
  const upsert = useUpsertCardioRoutine();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setNombre(initial?.nombre ?? "");
    setDescripcion(initial?.descripcion ?? "");
    setBloques(initial?.bloques?.length ? initial.bloques : [emptyBlock()]);
  }, [open, initial]);

  const save = async () => {
    if (!nombre.trim()) {
      toast({ title: "Añade nombre de rutina", variant: "destructive" });
      return;
    }
    await upsert.mutateAsync({
      id: initial?.id,
      input: { nombre: nombre.trim(), descripcion: descripcion.trim() || null, bloques },
    });
    toast({ title: initial?.id ? "Rutina cardio actualizada" : "Rutina cardio creada" });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92svh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initial?.id ? "Editar rutina cardio" : "Nueva rutina cardio"}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Bloques objetivo</Label>
            <Button variant="outline" size="sm" onClick={() => setBloques((p) => [...p, emptyBlock()])}>
              <Plus className="mr-1 h-4 w-4" /> Añadir
            </Button>
          </div>
          {bloques.map((b, idx) => (
            <div key={idx} className="space-y-2 rounded-lg border p-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Input
                  value={b.tipo_bloque}
                  onChange={(e) => setBloques((p) => p.map((x, i) => (i === idx ? { ...x, tipo_bloque: e.target.value } : x)))}
                  placeholder="tipo"
                />
                <Input
                  type="number"
                  value={b.distancia_objetivo_m ?? ""}
                  onChange={(e) =>
                    setBloques((p) =>
                      p.map((x, i) => (i === idx ? { ...x, distancia_objetivo_m: e.target.value ? Number(e.target.value) : null } : x)),
                    )
                  }
                  placeholder="distancia (m)"
                />
                <Input
                  type="number"
                  value={b.duracion_objetivo_seg ?? ""}
                  onChange={(e) =>
                    setBloques((p) =>
                      p.map((x, i) => (i === idx ? { ...x, duracion_objetivo_seg: e.target.value ? Number(e.target.value) : null } : x)),
                    )
                  }
                  placeholder="duración (s)"
                />
                <Input
                  type="number"
                  value={b.ritmo_objetivo_seg_km ?? ""}
                  onChange={(e) =>
                    setBloques((p) =>
                      p.map((x, i) => (i === idx ? { ...x, ritmo_objetivo_seg_km: e.target.value ? Number(e.target.value) : null } : x)),
                    )
                  }
                  placeholder="ritmo (seg/km)"
                />
                <Input
                  type="number"
                  value={b.fc_objetivo ?? ""}
                  onChange={(e) =>
                    setBloques((p) => p.map((x, i) => (i === idx ? { ...x, fc_objetivo: e.target.value ? Number(e.target.value) : null } : x)))
                  }
                  placeholder="FC objetivo"
                />
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
          <Button onClick={save} className="w-full" disabled={upsert.isPending}>
            {upsert.isPending ? "Guardando..." : "Guardar rutina cardio"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

