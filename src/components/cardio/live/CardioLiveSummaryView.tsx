import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  formatCardioDistanceM,
  formatCardioDuration,
  formatCardioElevationM,
} from "@/lib/cardioFormat";

type Props = {
  elapsedSec: number;
  distanceM: number;
  elevationM: number;
  fcMedia: number | null;
  fcMax: number | null;
  recordingMap: boolean;
  pointsCount: number;
  titulo: string;
  comentarios: string;
  esPublica: boolean;
  saving: boolean;
  discarding: boolean;
  onTituloChange: (v: string) => void;
  onComentariosChange: (v: string) => void;
  onEsPublicaChange: (v: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
  onBack: () => void;
};

export function CardioLiveSummaryView({
  elapsedSec,
  distanceM,
  elevationM,
  fcMedia,
  fcMax,
  recordingMap,
  pointsCount,
  titulo,
  comentarios,
  esPublica,
  saving,
  discarding,
  onTituloChange,
  onComentariosChange,
  onEsPublicaChange,
  onSave,
  onDiscard,
  onBack,
}: Props) {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="rounded-2xl border border-border bg-muted/30 p-4">
        <p className="text-xs font-medium text-muted-foreground">Resumen</p>
        <p className="mt-2 font-mono text-lg tabular-nums">
          {formatCardioDuration(elapsedSec)} · {formatCardioDistanceM(distanceM)} · ↑
          {formatCardioElevationM(elevationM)}
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
        {recordingMap && pointsCount === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Sin puntos GPS; se guardará solo tiempo y título.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardio-live-titulo">Título</Label>
        <Input
          id="cardio-live-titulo"
          value={titulo}
          onChange={(e) => onTituloChange(e.target.value)}
          className="h-12 rounded-xl"
          placeholder="Ej. Ciclismo de tarde"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardio-live-comentarios">Comentarios (opcional)</Label>
        <Textarea
          id="cardio-live-comentarios"
          value={comentarios}
          onChange={(e) => onComentariosChange(e.target.value)}
          className="min-h-22 rounded-xl resize-none"
          placeholder="Sensaciones, clima…"
        />
      </div>

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

      <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:justify-end">
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
        <Button type="button" variant="outline" className="rounded-xl" onClick={onBack}>
          Volver
        </Button>
      </div>
    </div>
  );
}
