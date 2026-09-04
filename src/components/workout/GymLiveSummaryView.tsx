import { Heart, Loader2, ListPlus, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  COMMUNITY_PUBLISH_HINT_OFF,
  COMMUNITY_PUBLISH_HINT_ON,
} from "@/lib/communityFeedVisibility";
import { SessionRpePicker } from "@/components/training/SessionRpePicker";
import { GymPickerSheet } from "@/components/gym/GymPickerSheet";
import { WorkoutIconPickerTrigger } from "@/components/routine/RoutineIconPicker";
import { formatCardioDuration } from "@/lib/cardioFormat";
import { cn } from "@/lib/utils";
import type { RoutineIconKey } from "@/lib/routineIcons";
import type { SelectedGimnasio } from "@/types/gimnasio";

function formatGymVolumeKg(volume: number) {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)} t`;
  return `${Math.round(volume)} kg`;
}

type Props = {
  elapsedSec: number;
  completedSets: number;
  volumeKg: number;
  fcMedia: number | null;
  fcMax: number | null;
  titulo: string;
  icono: RoutineIconKey;
  allowEditTitleAndIcon: boolean;
  comentarios: string;
  esPublica: boolean;
  rpe: number | null;
  gimnasio: SelectedGimnasio | null;
  saving: boolean;
  discarding: boolean;
  canSaveAsRoutine: boolean;
  onTituloChange: (v: string) => void;
  onIconoChange: (v: RoutineIconKey) => void;
  onComentariosChange: (v: string) => void;
  onEsPublicaChange: (v: boolean) => void;
  onRpeChange: (v: number) => void;
  onGimnasioChange: (v: SelectedGimnasio | null) => void;
  onSaveAsRoutine: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onBack: () => void;
};

export function GymLiveSummaryView({
  elapsedSec,
  completedSets,
  volumeKg,
  fcMedia,
  fcMax,
  titulo,
  icono,
  allowEditTitleAndIcon,
  comentarios,
  esPublica,
  rpe,
  gimnasio,
  saving,
  discarding,
  canSaveAsRoutine,
  onTituloChange,
  onIconoChange,
  onComentariosChange,
  onEsPublicaChange,
  onRpeChange,
  onGimnasioChange,
  onSaveAsRoutine,
  onSave,
  onDiscard,
  onBack,
}: Props) {
  const [gymPickerOpen, setGymPickerOpen] = useState(false);
  const setsLabel = completedSets === 1 ? "serie" : "series";

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-card p-4 pt-[calc(1rem+var(--app-safe-area-top,env(safe-area-inset-top,0px)))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="rounded-2xl border border-border bg-muted/30 p-4">
        <p className="text-xs font-medium text-muted-foreground">Resumen</p>
        <p className="mt-2 font-mono text-lg tabular-nums">
          {formatCardioDuration(elapsedSec)} · {completedSets} {setsLabel} · {formatGymVolumeKg(volumeKg)}
        </p>
        {fcMedia != null || fcMax != null ? (
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm tabular-nums">
            <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <Heart className="h-3.5 w-3.5" />
              {fcMedia != null ? (
                <span>
                  Media <span className="font-semibold">{fcMedia}</span> bpm
                </span>
              ) : null}
            </span>
            {fcMax != null ? (
              <span className="text-muted-foreground">
                Máx <span className="font-semibold text-foreground">{fcMax}</span> bpm
              </span>
            ) : null}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gym-live-titulo">Título</Label>
        <div className="flex items-center gap-3">
          {allowEditTitleAndIcon ? (
            <WorkoutIconPickerTrigger value={icono} onChange={onIconoChange} disabled={saving} />
          ) : null}
          <Input
            id="gym-live-titulo"
            value={titulo}
            onChange={(e) => onTituloChange(e.target.value)}
            className="h-12 min-w-0 flex-1 rounded-xl"
            placeholder="Ej. Día de pierna"
            disabled={saving}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gym-live-comentarios">Comentarios (opcional)</Label>
        <Textarea
          id="gym-live-comentarios"
          value={comentarios}
          onChange={(e) => onComentariosChange(e.target.value)}
          className="min-h-22 rounded-xl resize-none"
          placeholder="Sensaciones, cargas, notas…"
          disabled={saving}
        />
      </div>

      <SessionRpePicker id="gym-live-rpe" value={rpe} onChange={onRpeChange} disabled={saving} />

      <div className="space-y-2">
        <Label htmlFor="gym-live-gimnasio">Gimnasio</Label>
        <button
          type="button"
          id="gym-live-gimnasio"
          disabled={saving}
          onClick={() => setGymPickerOpen(true)}
          className={cn(
            "flex h-12 w-full items-center gap-2 rounded-xl border border-input bg-background px-3 text-left text-base md:text-sm",
            "focus-visible:border-emerald-500/30 focus-visible:outline-none",
            saving && "cursor-not-allowed opacity-50",
          )}
        >
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className={cn("min-w-0 flex-1 truncate", !gimnasio && "text-muted-foreground")}>
            {gimnasio?.nombre ?? "Dónde has entrenado (opcional)"}
          </span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5">
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium">Publicar en comunidad</p>
          <p className="text-[12px] text-muted-foreground">
            {esPublica ? COMMUNITY_PUBLISH_HINT_ON : COMMUNITY_PUBLISH_HINT_OFF}
          </p>
        </div>
        <Switch
          checked={esPublica}
          onCheckedChange={onEsPublicaChange}
          disabled={saving}
          aria-label="Publicar en comunidad"
        />
      </div>

      <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:justify-end">
        {canSaveAsRoutine ? (
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl"
            disabled={saving || discarding}
            onClick={onSaveAsRoutine}
          >
            <ListPlus className="h-4 w-4" />
            Guardar como rutina
          </Button>
        ) : null}
        <Button
          type="button"
          className="rounded-xl font-semibold shadow-none hover:shadow-none hover:translate-y-0 active:translate-y-0"
          disabled={saving || discarding}
          onClick={onSave}
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Guardar entrenamiento
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          disabled={discarding || saving}
          onClick={onDiscard}
        >
          Descartar
        </Button>
        <Button type="button" variant="outline" className="rounded-xl" onClick={onBack} disabled={saving}>
          Volver
        </Button>
      </div>

      <GymPickerSheet
        open={gymPickerOpen}
        onOpenChange={setGymPickerOpen}
        selected={gimnasio}
        onSelect={onGimnasioChange}
      />
    </div>
  );
}
