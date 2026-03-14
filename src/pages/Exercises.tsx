import { useState, useEffect, useMemo } from "react";
import { useExerciseCatalog, useCreateExercise, useDeleteExercise } from "@/hooks/useExerciseCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Search, Dumbbell, User, Trash2, Loader2, ArrowUpDown, ArrowDownAZ, Check, Heart, PanelTopClose, CircleDot, Hand, Footprints, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExerciseDetailSheet from "@/components/exercise/ExerciseDetailSheet";
import MuscleMultiSelect from "@/components/exercise/MuscleMultiSelect";
import { MUSCLE_GROUPS, type MainMuscleGroup } from "@/constants/muscleGroups";

/** Devuelve el grupo principal del primer músculo en body_part, o null */
function getMainGroupFromBodyPart(bodyPart: string[] | null | undefined): MainMuscleGroup | null {
  if (!bodyPart?.length) return null;
  for (const muscle of bodyPart) {
    for (const [group, muscles] of Object.entries(MUSCLE_GROUPS) as [MainMuscleGroup, readonly string[]][]) {
      if (muscles.includes(muscle)) return group;
    }
  }
  return null;
}

const MUSCLE_GROUP_ICONS: Record<MainMuscleGroup, typeof Dumbbell> = {
  Pecho: Heart,
  Espalda: PanelTopClose,
  Hombro: CircleDot,
  Bíceps: Hand,
  Tríceps: Hand,
  Antebrazo: Hand,
  Cuádriceps: Footprints,
  Femoral: Footprints,
  Glúteo: Footprints,
  Pantorrilla: Footprints,
  Core: LayoutGrid,
};

function getExerciseIcon(ex: { body_part?: string[] | null }) {
  const group = getMainGroupFromBodyPart(ex.body_part as string[] | null);
  return group ? MUSCLE_GROUP_ICONS[group] : Dumbbell;
}

const Exercises = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: exercises, isLoading } = useExerciseCatalog(search);
  const createExercise = useCreateExercise();
  const deleteExercise = useDeleteExercise();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newBodyParts, setNewBodyParts] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedExercises = useMemo(() => {
    if (!exercises?.length) return [];
    const list = [...exercises];
    list.sort((a, b) => {
      const cmp = a.nombre.localeCompare(b.nombre, undefined, { sensitivity: "base" });
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return list;
  }, [exercises, sortOrder]);

  useEffect(() => {
    if (location.state?.action === "new") {
      setCreateOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    try {
      await createExercise.mutateAsync({
        nombre: newName,
        descripcion: newDesc,
        usuario_id: user.id,
        body_part: newBodyParts,
      });
      toast({ title: "Ejercicio creado" });
      setCreateOpen(false);
      setNewName("");
      setNewDesc("");
      setNewBodyParts([]);
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
    <div className="w-full min-w-0 p-4 md:p-8 pt-6 space-y-6 max-w-2xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ejercicios</h1>
          <p className="text-sm text-muted-foreground">Catálogo de ejercicios disponibles</p>
        </div>
        {!!exercises?.length && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">{sortOrder === "asc" ? "A → Z" : "Z → A"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-popover">
              <DropdownMenuLabel className="flex items-center gap-2 text-xs">
                <ArrowDownAZ className="h-3.5 w-3.5" /> Ordenar por nombre
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                A → Z {sortOrder === "asc" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                Z → A {sortOrder === "desc" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
          : sortedExercises.map((ex) => {
              const isOwn = (ex as any).usuario_id === user?.id;
              const IconComponent = getExerciseIcon(ex as { body_part?: string[] | null });
              return (
                <Card
                  key={ex.id}
                  className={`transition-colors cursor-pointer ${
                    isOwn
                      ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedExercise(ex)}
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        isOwn ? "bg-primary/20" : "bg-primary/10"
                      }`}
                    >
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{ex.nombre}</p>
                        {isOwn && <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
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
                        onClick={(e) => { e.stopPropagation(); setDeleteId(ex.id); }}
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
            <div className="space-y-1.5">
              <Label>Músculos Trabajados</Label>
              <MuscleMultiSelect value={newBodyParts} onChange={setNewBodyParts} />
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

      {/* Exercise Detail Sheet */}
      <ExerciseDetailSheet
        exercise={selectedExercise}
        open={!!selectedExercise}
        onOpenChange={(open) => !open && setSelectedExercise(null)}
        currentUserId={user?.id}
      />
    </div>
  );
};

export default Exercises;
