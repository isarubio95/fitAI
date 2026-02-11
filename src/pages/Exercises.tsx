import { useState } from "react";
import { useExerciseCatalog, useCreateExercise, useDeleteExercise } from "@/hooks/useExerciseCatalog";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Dumbbell, Plus, User, Globe, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Exercises = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { data: exercises, isLoading } = useExerciseCatalog(search);
  const createExercise = useCreateExercise();
  const deleteExercise = useDeleteExercise();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    try {
      await createExercise.mutateAsync({
        nombre: newName,
        descripcion: newDesc,
        usuario_id: user.id,
      });
      toast({ title: "Ejercicio creado" });
      setCreateOpen(false);
      setNewName("");
      setNewDesc("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteExercise.mutateAsync(deleteId);
      toast({ title: "Ejercicio eliminado" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setDeleteId(null);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ejercicios</h1>
          <p className="text-sm text-muted-foreground">Catálogo de ejercicios disponibles</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Crear
        </Button>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ejercicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          : exercises?.map((ex) => {
              const isOwn = (ex as any).usuario_id === user?.id;
              return (
                <Card
                  key={ex.id}
                  className={`transition-colors ${
                    isOwn
                      ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                      : "hover:border-primary/50"
                  }`}
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        isOwn ? "bg-primary/20" : "bg-primary/10"
                      }`}
                    >
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{ex.nombre}</p>
                        {isOwn ? (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                            <User className="h-3 w-3 mr-0.5" /> Personal
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                            <Globe className="h-3 w-3 mr-0.5" /> Global
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {ex.descripcion || "Sin descripción"}
                      </p>
                    </div>
                    {isOwn && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive"
                        onClick={() => setDeleteId(ex.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Ejercicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input
                placeholder="Ej: Curl Martillo"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Descripción opcional..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || createExercise.isPending}>
              {createExercise.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ejercicio?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Exercises;
