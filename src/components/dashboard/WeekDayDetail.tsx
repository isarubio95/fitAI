import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Hash, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActividadWithDetails } from "@/types/workout";

interface WeekDayDetailProps {
  workouts: ActividadWithDetails[];
  dateKey: string;
  onWorkoutClick?: (id: string) => void;
}

export function WeekDayDetail({ workouts, dateKey, onWorkoutClick }: WeekDayDetailProps) {
  const hasWorkouts = workouts.length > 0;

  return (
    <AnimatePresence mode="wait">
      {hasWorkouts && (
        <motion.div
          key={dateKey}
          initial={{ height: 0, opacity: 0, y: -10 }}
          animate={{ height: "auto", opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          <div className="space-y-2 pt-3">
            {workouts.map((w) => {
              const totalSets = w.ejercicios.reduce((acc, ej) => acc + ej.series.length, 0);
              return (
                <Card key={w.id} className="border-border/50">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm">{w.titulo}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Dumbbell className="h-3 w-3" />
                          {w.ejercicios.length} ejercicios
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {totalSets} series
                        </span>
                      </div>
                    </div>
                    {onWorkoutClick && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => onWorkoutClick(w.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
