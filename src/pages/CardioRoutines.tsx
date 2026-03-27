import { useMemo, useState } from "react";
import { Play, Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CardioRoutineForm } from "@/components/cardio/CardioRoutineForm";
import { useCardioRoutines, useDeleteCardioRoutine } from "@/hooks/useCardioRoutines";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useToast } from "@/hooks/use-toast";

export default function CardioRoutines() {
  const { data, isLoading } = useCardioRoutines();
  const { openFromTemplate } = useGlobalCardioDrawer();
  const deleteRoutine = useDeleteCardioRoutine();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const editing = useMemo(() => data?.find((r) => r.id === editId) ?? null, [data, editId]);

  return (
    <div className="w-full min-w-0 space-y-4 px-4 pb-8 pt-6 md:mx-auto md:max-w-2xl md:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Rutinas de Cardio</h2>
        <Button onClick={() => { setEditId(null); setFormOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" /> Nueva
        </Button>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">Aún no tienes Rutinas de Cardio.</p>
      ) : (
        data.map((r) => (
          <Card key={r.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{r.nombre}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {r.descripcion ? <p className="text-sm text-muted-foreground">{r.descripcion}</p> : null}
              <p className="text-xs text-muted-foreground">{(r.cardio_rutina_bloque ?? []).length} bloques</p>
              {r.cardio_disciplina?.nombre ? <p className="text-xs text-muted-foreground">Disciplina: {r.cardio_disciplina.nombre}</p> : null}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    openFromTemplate(
                      r.nombre,
                      r.cardio_disciplina_id,
                      (r.cardio_rutina_bloque ?? []).map((b) => ({
                        tipo_bloque: b.tipo_bloque,
                        distancia_objetivo_m: b.distancia_objetivo_m,
                        duracion_objetivo_seg: b.duracion_objetivo_seg,
                        ritmo_objetivo_seg_km: b.ritmo_objetivo_seg_km,
                        fc_objetivo: b.fc_objetivo,
                      })),
                    )
                  }
                >
                  <Play className="mr-1 h-4 w-4" /> Iniciar
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setEditId(r.id); setFormOpen(true); }}>
                  <Pencil className="mr-1 h-4 w-4" /> Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <CardioRoutineForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={
          editing
            ? {
                id: editing.id,
                nombre: editing.nombre,
                descripcion: editing.descripcion,
                cardio_disciplina_id: editing.cardio_disciplina_id,
                bloques: (editing.cardio_rutina_bloque ?? []).map((b) => ({
                  tipo_bloque: b.tipo_bloque,
                  distancia_objetivo_m: b.distancia_objetivo_m,
                  duracion_objetivo_seg: b.duracion_objetivo_seg,
                  ritmo_objetivo_seg_km: b.ritmo_objetivo_seg_km,
                  fc_objetivo: b.fc_objetivo,
                })),
              }
            : null
        }
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar rutina cardio</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteId) return;
                await deleteRoutine.mutateAsync(deleteId);
                toast({ title: "Rutina cardio eliminada" });
                setDeleteId(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

