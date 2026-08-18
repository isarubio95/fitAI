import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useExerciseCatalog } from "@/hooks/useExerciseCatalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  clearPreparedLyftaImport,
  completeLyftaImport,
  prepareLyftaImport,
  type LyftaExerciseResolution,
  type LyftaImportResult,
  type UnmatchedLyftaExercise,
} from "@/lib/lyfta/importLyfta";
import { openLyftaApiKeyPage } from "@/lib/lyfta/openLyftaApiKey";
import { LYFTA_API_KEY_URL, type LyftaImportScope } from "@/lib/lyfta/types";
import { LyftaProxyError } from "@/lib/lyfta/proxy";
import { LyftaMatchReviewDialog } from "@/components/layout/LyftaMatchReviewDialog";

const settingsSectionCardClass = cn(
  "space-y-4 rounded-xl border border-border/60 bg-card p-4",
);

const SCOPE_OPTIONS: Array<{ value: LyftaImportScope; label: string }> = [
  { value: "history", label: "Historial" },
  { value: "routines", label: "Rutinas" },
  { value: "both", label: "Ambas" },
];

type Props = {
  resetToken?: boolean;
};

function toastDescription(result: LyftaImportResult, scope: LyftaImportScope): string {
  const parts: string[] = [];
  if (scope !== "routines") {
    parts.push(`${result.workoutsImported} entreno${result.workoutsImported === 1 ? "" : "s"}`);
  }
  if (scope !== "history") {
    parts.push(`${result.routinesImported} rutina${result.routinesImported === 1 ? "" : "s"}`);
  }
  const skipped = result.workoutsSkipped + result.routinesSkipped;
  return (
    parts.join(" y ") +
    " importados." +
    (skipped ? ` ${skipped} ya estaban.` : "") +
    (result.customExercises
      ? ` ${result.customExercises} ejercicio${result.customExercises === 1 ? "" : "s"} personalizado${result.customExercises === 1 ? "" : "s"} creado${result.customExercises === 1 ? "" : "s"}.`
      : "") +
    (result.exercisesOmitted
      ? ` ${result.exercisesOmitted} ejercicio${result.exercisesOmitted === 1 ? "" : "s"} omitido${result.exercisesOmitted === 1 ? "" : "s"}.`
      : "")
  );
}

export function LyftaImportSettings({ resetToken }: Props) {
  const { user } = useAuth();
  const { data: catalog, isLoading: catalogLoading } = useExerciseCatalog();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [scope, setScope] = useState<LyftaImportScope | "">("");
  const [importing, setImporting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [unmatched, setUnmatched] = useState<UnmatchedLyftaExercise[]>([]);

  const catalogOptions = useMemo(
    () =>
      (catalog ?? [])
        .filter((e) => e.__source === "catalogo")
        .map((e) => ({ id: e.id, nombre: e.nombre })),
    [catalog],
  );

  useEffect(() => {
    if (!resetToken) {
      setApiKey("");
      setScope("");
      setProgressLabel(null);
      setUnmatched([]);
      clearPreparedLyftaImport();
    }
  }, [resetToken]);

  const reviewing = unmatched.length > 0;
  const canImport =
    !!user &&
    apiKey.trim().length > 0 &&
    !!scope &&
    !importing &&
    !catalogLoading &&
    !reviewing &&
    !confirming;

  const invalidateImportedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["monthWorkouts"] });
    queryClient.invalidateQueries({ queryKey: ["monthWorkoutDates"] });
    queryClient.invalidateQueries({ queryKey: ["workoutHistory"] });
    queryClient.invalidateQueries({ queryKey: ["workoutsForDate"] });
    queryClient.invalidateQueries({ queryKey: ["routines"] });
    queryClient.invalidateQueries({ queryKey: ["exerciseCatalog"] });
    queryClient.invalidateQueries({ queryKey: ["exerciseCatalogInfinite"] });
    queryClient.invalidateQueries({ queryKey: ["trainingLoad"] });
    queryClient.invalidateQueries({ queryKey: ["muscleVolume"] });
    queryClient.invalidateQueries({ queryKey: ["lastWorkout"] });
  };

  const finishSuccess = (result: LyftaImportResult) => {
    invalidateImportedQueries();
    toast({
      title: "Importación de Lyfta",
      description: scope ? toastDescription(result, scope) : "Importación completada.",
    });
    setApiKey("");
    setScope("");
    setUnmatched([]);
  };

  const failImport = (error: unknown) => {
    const message =
      error instanceof LyftaProxyError
        ? error.lyftaStatus === 401
          ? "La API key no es válida. Genera una nueva en Lyfta."
          : error.message
        : error instanceof Error
          ? error.message
          : "No se pudo importar.";
    toast({
      title: "Error al importar de Lyfta",
      description: message,
      variant: "destructive",
    });
  };

  const onImport = async () => {
    if (!user || !canImport || !scope) return;
    setImporting(true);
    setProgressLabel("Conectando con Lyfta…");
    try {
      const prepared = await prepareLyftaImport({
        userId: user.id,
        apiKey: apiKey.trim(),
        scope,
        catalog: (catalog ?? []).map((e) => ({
          id: e.id,
          nombre: e.nombre,
          source: e.__source,
          registro_series: e.registro_series,
        })),
        onProgress: (p) => setProgressLabel(p.label),
      });

      if (prepared.status === "needs_review") {
        setUnmatched(prepared.unmatched);
        return;
      }

      finishSuccess(prepared.result);
    } catch (error) {
      failImport(error);
    } finally {
      setImporting(false);
      setProgressLabel(null);
    }
  };

  const onCancelReview = () => {
    clearPreparedLyftaImport();
    setUnmatched([]);
  };

  const onConfirmReview = async (resolutions: LyftaExerciseResolution[]) => {
    setConfirming(true);
    setProgressLabel("Importando…");
    try {
      const result = await completeLyftaImport({
        resolutions,
        onProgress: (p) => setProgressLabel(p.label),
      });
      finishSuccess(result);
    } catch (error) {
      failImport(error);
    } finally {
      setConfirming(false);
      setProgressLabel(null);
    }
  };

  return (
    <div className={settingsSectionCardClass}>
      <p className="flex items-center gap-2 text-sm font-medium">
        <Download className="h-4 w-4 text-muted-foreground" />
        Importar de Lyfta
      </p>
      <p className="text-xs leading-snug text-muted-foreground">
        Trae tu historial y/o rutinas. Track Gym no guarda tu API key: se usa solo en esta
        importación. Si un ejercicio de Lyfta no está en el catálogo, podrás emparejarlo, crearlo
        como personalizado u omitirlo.
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => void openLyftaApiKeyPage()}
      >
        <ExternalLink className="h-4 w-4" />
        Generar API key de Lyfta
      </Button>
      <a
        href={LYFTA_API_KEY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="sr-only"
      >
        Abrir página de API key de Lyfta
      </a>

      <div className="space-y-1.5">
        <Label htmlFor="lyfta-api-key" className="text-xs">
          API key
        </Label>
        <Input
          id="lyfta-api-key"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="Pega aquí la clave"
          value={apiKey}
          disabled={importing || confirming || reviewing}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium">Qué importar</p>
        <RadioGroup
          value={scope}
          onValueChange={(v) => setScope(v as LyftaImportScope)}
          className="grid grid-cols-3 gap-1.5"
          aria-label="Qué importar de Lyfta"
        >
          {SCOPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              htmlFor={`lyfta-scope-${opt.value}`}
              className="flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border/50 px-1.5 py-2"
            >
              <RadioGroupItem
                value={opt.value}
                id={`lyfta-scope-${opt.value}`}
                className="shrink-0 border-foreground text-foreground"
                disabled={importing || confirming || reviewing}
              />
              <span className="truncate text-sm font-medium leading-none">{opt.label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      {progressLabel ? (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {progressLabel}
        </p>
      ) : null}

      <Button type="button" size="sm" className="w-full" disabled={!canImport} onClick={() => void onImport()}>
        {importing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Importando…
          </>
        ) : (
          "Importar"
        )}
      </Button>

      <LyftaMatchReviewDialog
        open={reviewing}
        unmatched={unmatched}
        catalog={catalogOptions}
        confirming={confirming}
        onCancel={onCancelReview}
        onConfirm={(resolutions) => void onConfirmReview(resolutions)}
      />
    </div>
  );
}
