import { useState } from "react";
import { useWorkoutHistory } from "@/hooks/useWorkouts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, Dumbbell, Hash, Pencil } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { WorkoutLogger } from "@/components/workout/WorkoutLogger";

const WorkoutHistory = () => {
  const { data: workouts, isLoading } = useWorkoutHistory();
  const [editId, setEditId] = useState<string | null>(null);
  const [loggerOpen, setLoggerOpen] = useState(false);

  const openEdit = (id: string) => {
    setEditId(id);
    setLoggerOpen(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold">Historial</h1>
        <p className="text-sm text-muted-foreground">Todos tus entrenamientos</p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !workouts?.length ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Aún no tienes entrenamientos registrados.
        </p>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {workouts.map((w) => {
            const totalSets = w.ejercicios.reduce((a, ej) => a + ej.series.length, 0);
            return (
              <AccordionItem key={w.id} value={w.id} className="border rounded-xl px-4">
                <AccordionTrigger className="hover:no-underline py-3">
                  <article className="flex flex-col items-start text-left gap-1">
                    <h2 className="font-semibold">{w.titulo}</h2>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <time className="flex items-center gap-1" dateTime={w.fecha}>
                        <Calendar className="h-3 w-3" />
                        {format(new Date(w.fecha), "d MMM yyyy", { locale: es })}
                      </time>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="h-3 w-3" />
                        {w.ejercicios.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {totalSets} series
                      </span>
                    </div>
                  </article>
                </AccordionTrigger>
                <AccordionContent>
                  <section className="space-y-3 pb-2">
                    {w.ejercicios.map((ej) => (
                      <div key={ej.id} className="space-y-1">
                        <h3 className="text-sm font-medium">{ej.tipo_ejercicio.nombre}</h3>
                        <div className="space-y-0.5">
                          {ej.series
                            .sort((a, b) => a.numero_serie - b.numero_serie)
                            .map((s) => (
                              <p key={s.id} className="text-xs text-muted-foreground pl-3">
                                Serie {s.numero_serie}: {s.repeticiones} reps × {s.peso_kg} kg
                              </p>
                            ))}
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => openEdit(w.id)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
                    </Button>
                  </section>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <WorkoutLogger
        open={loggerOpen}
        onOpenChange={setLoggerOpen}
        workoutId={editId}
      />
    </div>
  );
};

export default WorkoutHistory;
