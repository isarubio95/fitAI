import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { WorkoutLeadingRoutineIcon } from "@/components/dashboard/WorkoutDetailsSheet";
import { RoutineIconPicker, WorkoutIconPickerTrigger } from "@/components/routine/RoutineIconPicker";
import { GymPickerSheet } from "@/components/gym/GymPickerSheet";
import type { RoutineIconKey } from "@/lib/routineIcons";
import type { SelectedGimnasio } from "@/types/gimnasio";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { useState } from "react";

type WorkoutMetaFormProps = {
  hideWorkoutDate: boolean;
  titulo: string;
  onTituloChange: (value: string) => void;
  isActiveWorkout: boolean;
  workoutIcon: RoutineIconKey;
  onWorkoutIconChange: (icon: RoutineIconKey) => void;
  creatingActive: boolean;
  fecha: string;
  onFechaChange: (value: string) => void;
  isEditingCompletedWorkout: boolean;
  esPublica: boolean;
  onEsPublicaChange: (value: boolean) => void;
  gimnasio: SelectedGimnasio | null;
  onGimnasioChange: (value: SelectedGimnasio | null) => void;
  gymDisabled?: boolean;
};

export function WorkoutMetaForm({
  hideWorkoutDate,
  titulo,
  onTituloChange,
  isActiveWorkout,
  workoutIcon,
  onWorkoutIconChange,
  creatingActive,
  fecha,
  onFechaChange,
  isEditingCompletedWorkout,
  esPublica,
  onEsPublicaChange,
  gimnasio,
  onGimnasioChange,
  gymDisabled = false,
}: WorkoutMetaFormProps) {
  const [gymPickerOpen, setGymPickerOpen] = useState(false);
  return (
    <Card className="w-full max-w-none rounded-none border-x-0 border-border/20 bg-card shadow-none md:border-x">
      <CardContent className="space-y-3 px-6 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div
            className={cn(
              "space-y-1.5",
              hideWorkoutDate ? "col-span-2" : "col-span-2 sm:col-span-1",
            )}
          >
            <Label htmlFor="titulo">Título</Label>
            <div className="flex items-center gap-3">
              {isActiveWorkout ? (
                <WorkoutIconPickerTrigger
                  value={workoutIcon}
                  onChange={onWorkoutIconChange}
                  disabled={creatingActive}
                />
              ) : (
                <WorkoutLeadingRoutineIcon iconKey={workoutIcon} />
              )}
              <Input
                id="titulo"
                placeholder="Ej: Día de Pierna"
                value={titulo}
                onChange={(e) => onTituloChange(e.target.value)}
                className="h-12 min-w-0 flex-1"
              />
            </div>
          </div>
          {!hideWorkoutDate && (
            <div className="col-span-2 space-y-1.5 sm:col-span-1">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => onFechaChange(e.target.value)}
                className="h-12"
              />
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gimnasio">Gimnasio</Label>
          <button
            type="button"
            id="gimnasio"
            disabled={gymDisabled}
            onClick={() => setGymPickerOpen(true)}
            className={cn(
              "flex h-12 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-base md:text-sm",
              "focus-visible:border-emerald-500/30 focus-visible:outline-none",
              gymDisabled && "cursor-not-allowed opacity-50",
            )}
          >
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className={cn("min-w-0 flex-1 truncate", !gimnasio && "text-muted-foreground")}>
              {gimnasio?.nombre ?? "Dónde has entrenado (opcional)"}
            </span>
          </button>
        </div>
        {isEditingCompletedWorkout && (
          <>
            <RoutineIconPicker
              value={workoutIcon}
              onChange={onWorkoutIconChange}
              label="Icono del entrenamiento"
            />
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium">Publicar en comunidad</p>
                <p className="text-[12px] text-muted-foreground">
                  {esPublica
                    ? "Este entreno se verá en el feed público."
                    : "Este entreno se mantendrá privado."}
                </p>
              </div>
              <Switch
                checked={esPublica}
                onCheckedChange={onEsPublicaChange}
                aria-label="Publicar en comunidad"
              />
            </div>
          </>
        )}
      </CardContent>
      <GymPickerSheet
        open={gymPickerOpen}
        onOpenChange={setGymPickerOpen}
        selected={gimnasio}
        onSelect={onGimnasioChange}
      />
    </Card>
  );
}
