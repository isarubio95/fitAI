import { useState } from "react";
import { useExerciseCatalog } from "@/hooks/useExerciseCatalog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Dumbbell } from "lucide-react";

const Exercises = () => {
  const [search, setSearch] = useState("");
  const { data: exercises, isLoading } = useExerciseCatalog(search);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold">Ejercicios</h1>
        <p className="text-sm text-muted-foreground">Catálogo de ejercicios disponibles</p>
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
          : exercises?.map((ex) => (
              <Card key={ex.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{ex.nombre}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ex.descripcion || "Sin descripción"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
};

export default Exercises;
