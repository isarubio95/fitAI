import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Heart, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, drawerSafeAreaBottom } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useCardioDisciplinas, useCardioSessionById, useUpsertCardioSession } from "@/hooks/useCardioSessions";
import { cn } from "@/lib/utils";
import { getDefaultCardioTitle } from "@/lib/defaultWorkoutTitle";
import { Switch } from "@/components/ui/switch";
import type { CardioBlockInput, CardioDisciplineCode, CardioSportDetailInput, CardioTrackInput, CardioTrackPointInput } from "@/types/cardio";

type NestedOneOrMany<T> = T | T[] | null | undefined;
type CardioRunningRow = {
  ritmo_medio_seg_km: number | null;
  cadencia_media_spm: number | null;
  desnivel_positivo_m: number | null;
  zancada_media_cm: number | null;
};
type CardioCyclingRow = {
  potencia_media_w: number | null;
  potencia_normalizada_w: number | null;
  cadencia_media_rpm: number | null;
  desnivel_positivo_m: number | null;
  tipo_bici: string | null;
};
type CardioTrackPointRow = {
  orden: number;
  lat: number;
  lng: number;
  elevacion_m: number | null;
  timestamp_utc: string | null;
  velocidad_m_s: number | null;
  fc: number | null;
  cadencia: number | null;
  potencia_w: number | null;
};
type CardioTrackRow = {
  distancia_total_m?: number | null;
  duracion_total_seg?: number | null;
  cardio_track_point?: CardioTrackPointRow[] | null;
};

const sectionCardClass = cn("space-y-4 rounded-xl border border-border/60 bg-secondary/40 p-4");

type CardioFormSnapshot = {
  titulo: string;
  disciplinaId: string | null;
  fechaInicio: string;
  fechaFin: string;
  distanciaKm: string;
  durHoras: string;
  durMinutos: string;
  durSegundos: string;
  comentarios: string;
  esPublica: boolean;
  runningRitmo: string;
  runningCadencia: string;
  runningDesnivel: string;
  runningZancada: string;
  cyclingPotenciaMedia: string;
  cyclingPotenciaNp: string;
  cyclingCadencia: string;
  cyclingDesnivel: string;
  cyclingTipoBici: string;
  trackJson: string;
  bloques: CardioBlockInput[];
};

function snapshotKey(s: CardioFormSnapshot) {
  return JSON.stringify(s);
}

function FormField({ id, label, className, children }: { id?: string; label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function emptyBlock(): CardioBlockInput {
  return {
    tipo_bloque: "work",
    distancia_m: null,
    duracion_seg: null,
    elevacion_m: null,
    fc_media: null,
    fc_max: null,
    calorias: null,
  };
}

function durationPartsFromSeconds(total: number) {
  const s = Math.max(0, Math.floor(total));
  return {
    h: Math.floor(s / 3600),
    m: Math.floor((s % 3600) / 60),
    sec: s % 60,
  };
}

/** Devuelve segundos totales, o null si los valores no son válidos. */
function secondsFromDurationParts(h: string, m: string, s: string): number | null {
  const hours = h.trim() === "" ? 0 : Number(h);
  const mins = m.trim() === "" ? 0 : Number(m);
  const secs = s.trim() === "" ? 0 : Number(s);
  if ([hours, mins, secs].some((n) => Number.isNaN(n) || n < 0 || !Number.isFinite(n))) return null;
  if (!Number.isInteger(hours) || !Number.isInteger(mins) || !Number.isInteger(secs)) return null;
  if (mins > 59 || secs > 59) return null;
  return hours * 3600 + mins * 60 + secs;
}

function toDatetimeLocalValue(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function CardioLogger() {
  const { state, setOpen } = useGlobalCardioDrawer();
  const { toast } = useToast();
  const upsert = useUpsertCardioSession();
  const { data: sessionData, isLoading } = useCardioSessionById(state.sessionId);
  const { data: disciplinas } = useCardioDisciplinas();

  const [titulo, setTitulo] = useState("");
  const [disciplinaId, setDisciplinaId] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [distanciaKm, setDistanciaKm] = useState("");
  const [durHoras, setDurHoras] = useState("");
  const [durMinutos, setDurMinutos] = useState("");
  const [durSegundos, setDurSegundos] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [esPublica, setEsPublica] = useState(false);
  const [runningRitmo, setRunningRitmo] = useState("");
  const [runningCadencia, setRunningCadencia] = useState("");
  const [runningDesnivel, setRunningDesnivel] = useState("");
  const [runningZancada, setRunningZancada] = useState("");
  const [cyclingPotenciaMedia, setCyclingPotenciaMedia] = useState("");
  const [cyclingPotenciaNp, setCyclingPotenciaNp] = useState("");
  const [cyclingCadencia, setCyclingCadencia] = useState("");
  const [cyclingDesnivel, setCyclingDesnivel] = useState("");
  const [cyclingTipoBici, setCyclingTipoBici] = useState("");
  const [trackJson, setTrackJson] = useState("");
  const [bloques, setBloques] = useState<CardioBlockInput[]>([emptyBlock()]);
  const [initialSnapshot, setInitialSnapshot] = useState<string | null>(null);

  const isEdit = !!state.sessionId;

  const defaultStart = useMemo(() => toDatetimeLocalValue(new Date().toISOString()), []);

  const disciplineMeta = useMemo(
    () => (disciplinas ?? []).find((d) => d.id === disciplinaId) ?? null,
    [disciplinas, disciplinaId],
  );
  const disciplineCode = (disciplineMeta?.codigo ?? null) as CardioDisciplineCode | null;

  const sheetTitle = useMemo(() => {
    const name = disciplineMeta?.nombre?.trim();
    if (state.sessionId) {
      return name ? `Editar ${name}` : "Editar entrenamiento";
    }
    return name ?? "Entrenamiento de cardio";
  }, [disciplineMeta?.nombre, state.sessionId]);

  const showRunningMetrics = disciplineCode === "running";
  const showCyclingMetrics = disciplineCode === "cycling";
  const showTrackGps = disciplineCode != null && disciplineCode !== "swimming";

  const hrSummary = useMemo(() => {
    const medias = bloques.map((b) => b.fc_media).filter((v): v is number => v != null && Number.isFinite(v) && v > 0);
    const maxes = bloques.map((b) => b.fc_max).filter((v): v is number => v != null && Number.isFinite(v) && v > 0);
    if (medias.length === 0 && maxes.length === 0) return null;
    const fcMedia =
      medias.length > 0 ? Math.round(medias.reduce((a, b) => a + b, 0) / medias.length) : null;
    const fcMax = maxes.length > 0 ? Math.max(...maxes) : null;
    return { fcMedia, fcMax };
  }, [bloques]);

  useEffect(() => {
    if (!state.open) return;
    const first = <T,>(value: NestedOneOrMany<T>): T | null => (Array.isArray(value) ? (value[0] ?? null) : (value ?? null));

    if (state.sessionId) {
      if (!sessionData) return;
      const nextTitulo = sessionData.titulo ?? "";
      const nextDisciplinaId = sessionData.cardio_disciplina_id ?? null;
      const nextFechaInicio = toDatetimeLocalValue(sessionData.fecha_inicio ?? "");
      const nextFechaFin = toDatetimeLocalValue(sessionData.fecha_fin ?? "");
      const nextComentarios = sessionData.comentarios ?? "";
      const nextEsPublica = !!sessionData.es_publica;
      const running = first(sessionData.cardio_sesion_running as NestedOneOrMany<CardioRunningRow>);
      const cycling = first(sessionData.cardio_sesion_cycling as NestedOneOrMany<CardioCyclingRow>);
      const track = first(sessionData.cardio_track as NestedOneOrMany<CardioTrackRow>);
      const points = track?.cardio_track_point ?? [];
      const sessionBlocks = sessionData.cardio_bloque ?? [];
      const totalDistM =
        sessionBlocks.reduce((acc, b) => acc + (Number(b.distancia_m) || 0), 0) ||
        Number(track?.distancia_total_m) ||
        0;
      const totalDurFromBlocks = sessionBlocks.reduce((acc, b) => acc + (Number(b.duracion_seg) || 0), 0);
      let durSec = totalDurFromBlocks || Number(track?.duracion_total_seg) || 0;
      if (
        durSec <= 0 &&
        sessionData.fecha_inicio &&
        sessionData.fecha_fin
      ) {
        durSec = Math.max(
          0,
          Math.round(
            (new Date(sessionData.fecha_fin).getTime() - new Date(sessionData.fecha_inicio).getTime()) / 1000,
          ),
        );
      }
      const durParts = durationPartsFromSeconds(durSec);
      const nextDistanciaKm = totalDistM > 0 ? String(Math.round((totalDistM / 1000) * 1000) / 1000) : "";
      const nextDurHoras = durParts.h > 0 ? String(durParts.h) : "";
      const nextDurMinutos = durSec > 0 ? String(durParts.m) : "";
      const nextDurSegundos = durSec > 0 ? String(durParts.sec) : "";
      const nextRunningRitmo = running?.ritmo_medio_seg_km?.toString() ?? "";
      const nextRunningCadencia = running?.cadencia_media_spm?.toString() ?? "";
      const nextRunningDesnivel = running?.desnivel_positivo_m?.toString() ?? "";
      const nextRunningZancada = running?.zancada_media_cm?.toString() ?? "";
      const nextCyclingPotenciaMedia = cycling?.potencia_media_w?.toString() ?? "";
      const nextCyclingPotenciaNp = cycling?.potencia_normalizada_w?.toString() ?? "";
      const nextCyclingCadencia = cycling?.cadencia_media_rpm?.toString() ?? "";
      const nextCyclingDesnivel = cycling?.desnivel_positivo_m?.toString() ?? "";
      const nextCyclingTipoBici = cycling?.tipo_bici ?? "";
      const nextTrackJson = points.length
        ? JSON.stringify(
            points
              .slice()
              .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
              .map((p) => ({
                lat: p.lat,
                lng: p.lng,
                elevacion_m: p.elevacion_m,
                timestamp_utc: p.timestamp_utc,
                velocidad_m_s: p.velocidad_m_s,
                fc: p.fc,
                cadencia: p.cadencia,
                potencia_w: p.potencia_w,
              })),
            null,
            2,
          )
        : "";
      const nextBloques: CardioBlockInput[] = sessionBlocks.length
        ? sessionBlocks.map((b) => ({
            tipo_bloque: b.tipo_bloque ?? "work",
            distancia_m: b.distancia_m,
            duracion_seg: b.duracion_seg,
            elevacion_m: b.elevacion_m,
            fc_media: b.fc_media,
            fc_max: b.fc_max,
            calorias: b.calorias,
          }))
        : [emptyBlock()];

      setTitulo(nextTitulo);
      setDisciplinaId(nextDisciplinaId);
      setFechaInicio(nextFechaInicio);
      setFechaFin(nextFechaFin);
      setComentarios(nextComentarios);
      setEsPublica(nextEsPublica);
      setDistanciaKm(nextDistanciaKm);
      setDurHoras(nextDurHoras);
      setDurMinutos(nextDurMinutos);
      setDurSegundos(nextDurSegundos);
      setRunningRitmo(nextRunningRitmo);
      setRunningCadencia(nextRunningCadencia);
      setRunningDesnivel(nextRunningDesnivel);
      setRunningZancada(nextRunningZancada);
      setCyclingPotenciaMedia(nextCyclingPotenciaMedia);
      setCyclingPotenciaNp(nextCyclingPotenciaNp);
      setCyclingCadencia(nextCyclingCadencia);
      setCyclingDesnivel(nextCyclingDesnivel);
      setCyclingTipoBici(nextCyclingTipoBici);
      setTrackJson(nextTrackJson);
      setBloques(nextBloques);
      setInitialSnapshot(
        snapshotKey({
          titulo: nextTitulo,
          disciplinaId: nextDisciplinaId,
          fechaInicio: nextFechaInicio,
          fechaFin: nextFechaFin,
          distanciaKm: nextDistanciaKm,
          durHoras: nextDurHoras,
          durMinutos: nextDurMinutos,
          durSegundos: nextDurSegundos,
          comentarios: nextComentarios,
          esPublica: nextEsPublica,
          runningRitmo: nextRunningRitmo,
          runningCadencia: nextRunningCadencia,
          runningDesnivel: nextRunningDesnivel,
          runningZancada: nextRunningZancada,
          cyclingPotenciaMedia: nextCyclingPotenciaMedia,
          cyclingPotenciaNp: nextCyclingPotenciaNp,
          cyclingCadencia: nextCyclingCadencia,
          cyclingDesnivel: nextCyclingDesnivel,
          cyclingTipoBici: nextCyclingTipoBici,
          trackJson: nextTrackJson,
          bloques: nextBloques,
        }),
      );
      return;
    }

    if (state.templateBlocks?.length) {
      setTitulo(state.templateTitle || "Sesión cardio");
      setDisciplinaId(state.templateDisciplineId ?? null);
      setBloques(
        state.templateBlocks.map((b) => ({
          tipo_bloque: b.tipo_bloque,
          distancia_m: b.distancia_objetivo_m ?? null,
          duracion_seg: b.duracion_objetivo_seg ?? null,
          fc_media: b.fc_objetivo ?? null,
          elevacion_m: null,
          fc_max: null,
          calorias: null,
        })),
      );
    } else {
      const initialDiscId = state.initialDisciplineId ?? null;
      const discName = (disciplinas ?? []).find((d) => d.id === initialDiscId)?.nombre;
      setTitulo(getDefaultCardioTitle(discName));
      setDisciplinaId(initialDiscId);
      setBloques([emptyBlock()]);
    }
    setFechaInicio(defaultStart);
    setFechaFin("");
    setDistanciaKm("");
    setDurHoras("");
    setDurMinutos("");
    setDurSegundos("");
    setComentarios("");
    setEsPublica(false);
    setRunningRitmo("");
    setRunningCadencia("");
    setRunningDesnivel("");
    setRunningZancada("");
    setCyclingPotenciaMedia("");
    setCyclingPotenciaNp("");
    setCyclingCadencia("");
    setCyclingDesnivel("");
    setCyclingTipoBici("");
    setTrackJson("");
    setInitialSnapshot(null);
  }, [state.open, state.sessionId, sessionData, state.templateBlocks, state.templateTitle, state.templateDisciplineId, state.initialDisciplineId, defaultStart, disciplinas]);

  const isDirty = useMemo(() => {
    if (!isEdit || !initialSnapshot) return false;
    return (
      snapshotKey({
        titulo,
        disciplinaId,
        fechaInicio,
        fechaFin,
        distanciaKm,
        durHoras,
        durMinutos,
        durSegundos,
        comentarios,
        esPublica,
        runningRitmo,
        runningCadencia,
        runningDesnivel,
        runningZancada,
        cyclingPotenciaMedia,
        cyclingPotenciaNp,
        cyclingCadencia,
        cyclingDesnivel,
        cyclingTipoBici,
        trackJson,
        bloques,
      }) !== initialSnapshot
    );
  }, [
    isEdit,
    initialSnapshot,
    titulo,
    disciplinaId,
    fechaInicio,
    fechaFin,
    distanciaKm,
    durHoras,
    durMinutos,
    durSegundos,
    comentarios,
    esPublica,
    runningRitmo,
    runningCadencia,
    runningDesnivel,
    runningZancada,
    cyclingPotenciaMedia,
    cyclingPotenciaNp,
    cyclingCadencia,
    cyclingDesnivel,
    cyclingTipoBici,
    trackJson,
    bloques,
  ]);

  const updateBlock = (idx: number, patch: Partial<CardioBlockInput>) => {
    setBloques((prev) => prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  };

  const save = async () => {
    const resolvedTitulo = titulo.trim() || getDefaultCardioTitle(disciplineMeta?.nombre);
    if (!fechaInicio) {
      toast({ title: "Añade fecha de inicio", variant: "destructive" });
      return;
    }
    if (!disciplinaId) {
      toast({
        title: "Falta la disciplina",
        description: "Elige un tipo de cardio en el selector antes de registrar la sesión.",
        variant: "destructive",
      });
      return;
    }
    const selectedDiscipline = (disciplinas ?? []).find((d) => d.id === disciplinaId);
    const code = selectedDiscipline?.codigo;

    const inicioDate = new Date(fechaInicio);
    if (Number.isNaN(inicioDate.getTime())) {
      toast({ title: "Fecha de inicio no válida", variant: "destructive" });
      return;
    }

    let fechaFinIso: string | null = fechaFin ? new Date(fechaFin).toISOString() : null;
    let bloquesToSave = bloques;

    if (code === "cycling") {
      const distanciaKmNum = Number(distanciaKm.replace(",", "."));
      if (!distanciaKm.trim() || Number.isNaN(distanciaKmNum) || distanciaKmNum <= 0) {
        toast({
          title: "Distancia obligatoria",
          description: "Indica la distancia de la salida en kilómetros.",
          variant: "destructive",
        });
        return;
      }
      const duracionSeg = secondsFromDurationParts(durHoras, durMinutos, durSegundos);
      if (duracionSeg == null || duracionSeg <= 0) {
        toast({
          title: "Duración obligatoria",
          description: "Indica horas, minutos y segundos (al menos 1 segundo).",
          variant: "destructive",
        });
        return;
      }
      fechaFinIso = new Date(inicioDate.getTime() + duracionSeg * 1000).toISOString();
      const distancia_m = Math.round(distanciaKmNum * 1000);
      const base = bloques[0] ?? emptyBlock();
      bloquesToSave = [
        {
          ...base,
          tipo_bloque: base.tipo_bloque || "work",
          distancia_m,
          duracion_seg: duracionSeg,
        },
        ...bloques.slice(1).map((b) => ({
          ...b,
          distancia_m: null,
          duracion_seg: null,
        })),
      ];
    }

    let sport_detail: CardioSportDetailInput | null = null;
    if (code === "running") {
      sport_detail = {
        disciplina_codigo: "running",
        running: {
          ritmo_medio_seg_km: runningRitmo ? Number(runningRitmo) : null,
          cadencia_media_spm: runningCadencia ? Number(runningCadencia) : null,
          desnivel_positivo_m: runningDesnivel ? Number(runningDesnivel) : null,
          zancada_media_cm: runningZancada ? Number(runningZancada) : null,
        },
      };
    } else if (code === "cycling") {
      sport_detail = {
        disciplina_codigo: "cycling",
        cycling: {
          potencia_media_w: cyclingPotenciaMedia ? Number(cyclingPotenciaMedia) : null,
          potencia_normalizada_w: cyclingPotenciaNp ? Number(cyclingPotenciaNp) : null,
          cadencia_media_rpm: cyclingCadencia ? Number(cyclingCadencia) : null,
          desnivel_positivo_m: cyclingDesnivel ? Number(cyclingDesnivel) : null,
          tipo_bici: cyclingTipoBici.trim() || null,
        },
      };
    } else if (code && code !== "running" && code !== "cycling") {
      sport_detail = {
        disciplina_codigo: code as Exclude<CardioDisciplineCode, "running" | "cycling">,
      };
    }

    let track: CardioTrackInput | null = null;
    if (trackJson.trim()) {
      try {
        const parsed: unknown = JSON.parse(trackJson);
        if (!Array.isArray(parsed)) throw new Error("El track debe ser un array JSON.");
        const points: CardioTrackPointInput[] = parsed.map((p, idx) => {
          const point = p as Record<string, unknown>;
          return {
            orden: idx,
            lat: Number(point.lat),
            lng: Number(point.lng),
            elevacion_m: point.elevacion_m != null ? Number(point.elevacion_m) : null,
            timestamp_utc: (point.timestamp_utc as string | undefined) ?? null,
            velocidad_m_s: point.velocidad_m_s != null ? Number(point.velocidad_m_s) : null,
            fc: point.fc != null ? Number(point.fc) : null,
            cadencia: point.cadencia != null ? Number(point.cadencia) : null,
            potencia_w: point.potencia_w != null ? Number(point.potencia_w) : null,
          };
        });
        track = {
          fuente: "manual-json",
          puntos: points,
        };
        if (track.puntos.some((p) => Number.isNaN(p.lat) || Number.isNaN(p.lng))) {
          throw new Error("Cada punto del track debe incluir lat/lng numéricos.");
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Formato no válido";
        toast({ title: "Track GPS inválido", description: message, variant: "destructive" });
        return;
      }
    }

    await upsert.mutateAsync({
      id: state.sessionId,
      input: {
        titulo: resolvedTitulo,
        cardio_disciplina_id: disciplinaId,
        sport_detail,
        track,
        fecha_inicio: inicioDate.toISOString(),
        fecha_fin: fechaFinIso,
        comentarios: comentarios.trim() || null,
        es_publica: esPublica,
        bloques: bloquesToSave,
      },
    });
    toast({ title: state.sessionId ? "Entrenamiento actualizado" : "Entrenamiento guardado" });
    setOpen(false);
  };

  const saveLabel = state.sessionId ? "Actualizar" : "Guardar";

  useEffect(() => {
    if (!state.open) return;
    const t = window.setTimeout(() => {
      const activeEl = document.activeElement as HTMLElement | null;
      activeEl?.blur?.();
    }, 0);
    return () => window.clearTimeout(t);
  }, [state.open]);

  return (
    <Drawer open={state.open && !state.liveOpen} onOpenChange={setOpen}>
      <DrawerContent
        side="bottom"
        className="flex h-[92lvh] max-h-[92lvh] min-h-0 flex-col overflow-hidden rounded-t-[20px] bg-card p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DrawerHeader className="shrink-0 border-b border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <DrawerTitle className="text-lg">{sheetTitle}</DrawerTitle>
            <Button type="button" size="sm" onClick={save} disabled={upsert.isPending || isLoading || (isEdit && !isDirty)}>
              {(upsert.isPending || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {upsert.isPending ? "Guardando..." : saveLabel}
            </Button>
          </div>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-card">
        <div className={cn("space-y-6 p-4", drawerSafeAreaBottom)}>
          {hrSummary ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-sm">
              <span className="inline-flex items-center gap-1.5 font-medium text-rose-700 dark:text-rose-300">
                <Heart className="h-4 w-4" />
                Pulsaciones
              </span>
              {hrSummary.fcMedia != null ? (
                <span className="tabular-nums text-muted-foreground">
                  Media <span className="font-semibold text-foreground">{hrSummary.fcMedia}</span> bpm
                </span>
              ) : null}
              {hrSummary.fcMax != null ? (
                <span className="tabular-nums text-muted-foreground">
                  Máx <span className="font-semibold text-foreground">{hrSummary.fcMax}</span> bpm
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <FormField id="cardio-titulo" label="Título">
                <Input
                  id="cardio-titulo"
                  className="h-12"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Ciclismo de tarde"
                />
              </FormField>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <FormField id="cardio-comentarios" label="Comentarios">
                <Input
                  id="cardio-comentarios"
                  className="h-12"
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="Notas..."
                />
              </FormField>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2.5">
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
                onCheckedChange={setEsPublica}
                aria-label="Publicar en comunidad"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={cn("col-span-2", showCyclingMetrics ? "sm:col-span-2" : "sm:col-span-1")}>
              <FormField id="cardio-inicio" label={showCyclingMetrics ? "Fecha y hora" : "Inicio"}>
                <Input
                  id="cardio-inicio"
                  className="h-12"
                  type="datetime-local"
                  step={1}
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </FormField>
            </div>
            {showCyclingMetrics ? (
              <>
                <div className="col-span-2 sm:col-span-1">
                  <FormField id="cyc-distancia" label="Distancia (km)">
                    <Input
                      id="cyc-distancia"
                      className="h-12"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.001"
                      value={distanciaKm}
                      onChange={(e) => setDistanciaKm(e.target.value)}
                      placeholder="Obligatorio"
                      required
                    />
                  </FormField>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <FormField label="Duración">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Input
                          id="cyc-dur-h"
                          className="h-12"
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={1}
                          value={durHoras}
                          onChange={(e) => setDurHoras(e.target.value)}
                          placeholder="0"
                          aria-label="Horas"
                        />
                        <p className="text-center text-[11px] text-muted-foreground">h</p>
                      </div>
                      <div className="space-y-1">
                        <Input
                          id="cyc-dur-m"
                          className="h-12"
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={59}
                          step={1}
                          value={durMinutos}
                          onChange={(e) => setDurMinutos(e.target.value)}
                          placeholder="0"
                          aria-label="Minutos"
                        />
                        <p className="text-center text-[11px] text-muted-foreground">min</p>
                      </div>
                      <div className="space-y-1">
                        <Input
                          id="cyc-dur-s"
                          className="h-12"
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={59}
                          step={1}
                          value={durSegundos}
                          onChange={(e) => setDurSegundos(e.target.value)}
                          placeholder="0"
                          aria-label="Segundos"
                        />
                        <p className="text-center text-[11px] text-muted-foreground">s</p>
                      </div>
                    </div>
                  </FormField>
                </div>
              </>
            ) : (
              <div className="col-span-2 sm:col-span-1">
                <FormField id="cardio-fin" label="Fin (opcional)">
                  <Input
                    id="cardio-fin"
                    className="h-12"
                    type="datetime-local"
                    step={1}
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </FormField>
              </div>
            )}
          </div>

          {showRunningMetrics ? (
            <div className={sectionCardClass}>
              <p className="text-sm font-semibold">Métricas opcionales</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField id="run-ritmo" label="Ritmo medio (seg/km)">
                  <Input
                    id="run-ritmo"
                    className="h-12"
                    type="number"
                    inputMode="decimal"
                    value={runningRitmo}
                    onChange={(e) => setRunningRitmo(e.target.value)}
                    placeholder="Opcional"
                  />
                </FormField>
                <FormField id="run-cadencia" label="Cadencia media (pasos/min)">
                  <Input
                    id="run-cadencia"
                    className="h-12"
                    type="number"
                    inputMode="decimal"
                    value={runningCadencia}
                    onChange={(e) => setRunningCadencia(e.target.value)}
                    placeholder="Opcional"
                  />
                </FormField>
                <FormField id="run-desnivel" label="Desnivel positivo (m)">
                  <Input
                    id="run-desnivel"
                    className="h-12"
                    type="number"
                    inputMode="decimal"
                    value={runningDesnivel}
                    onChange={(e) => setRunningDesnivel(e.target.value)}
                    placeholder="Opcional"
                  />
                </FormField>
                <FormField id="run-zancada" label="Zancada media (cm)">
                  <Input
                    id="run-zancada"
                    className="h-12"
                    type="number"
                    inputMode="decimal"
                    value={runningZancada}
                    onChange={(e) => setRunningZancada(e.target.value)}
                    placeholder="Opcional"
                  />
                </FormField>
              </div>
            </div>
          ) : null}

          {showCyclingMetrics ? (
            <div className={sectionCardClass}>
              <p className="text-sm font-semibold">Métricas opcionales</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField id="cyc-pot" label="Potencia media (W)">
                  <Input
                    id="cyc-pot"
                    className="h-12"
                    type="number"
                    inputMode="decimal"
                    value={cyclingPotenciaMedia}
                    onChange={(e) => setCyclingPotenciaMedia(e.target.value)}
                    placeholder="Opcional"
                  />
                </FormField>
                <FormField id="cyc-np" label="Potencia normalizada (W)">
                  <Input
                    id="cyc-np"
                    className="h-12"
                    type="number"
                    inputMode="decimal"
                    value={cyclingPotenciaNp}
                    onChange={(e) => setCyclingPotenciaNp(e.target.value)}
                    placeholder="Opcional"
                  />
                </FormField>
                <FormField id="cyc-cad" label="Cadencia media (rpm)">
                  <Input
                    id="cyc-cad"
                    className="h-12"
                    type="number"
                    inputMode="decimal"
                    value={cyclingCadencia}
                    onChange={(e) => setCyclingCadencia(e.target.value)}
                    placeholder="Opcional"
                  />
                </FormField>
                <FormField id="cyc-desnivel" label="Desnivel positivo (m)">
                  <Input
                    id="cyc-desnivel"
                    className="h-12"
                    type="number"
                    inputMode="decimal"
                    value={cyclingDesnivel}
                    onChange={(e) => setCyclingDesnivel(e.target.value)}
                    placeholder="Opcional"
                  />
                </FormField>
                <FormField id="cyc-bici" label="Tipo de bici" className="sm:col-span-2">
                  <Input
                    id="cyc-bici"
                    className="h-12"
                    value={cyclingTipoBici}
                    onChange={(e) => setCyclingTipoBici(e.target.value)}
                    placeholder="Ruta, MTB, rodillo..."
                  />
                </FormField>
              </div>
            </div>
          ) : null}

          {showTrackGps ? (
            <div className={sectionCardClass}>
              <FormField id="cardio-track" label="Track GPS (JSON de puntos, opcional)">
                <Textarea
                  id="cardio-track"
                  value={trackJson}
                  onChange={(e) => setTrackJson(e.target.value)}
                  placeholder='[{"lat":40.42,"lng":-3.70,"timestamp_utc":"2026-01-01T10:00:00Z"}]'
                  className="min-h-28 font-mono text-xs"
                />
              </FormField>
            </div>
          ) : null}

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Segmentos / bloques</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setBloques((p) => [...p, emptyBlock()])}>
                <Plus className="mr-1 h-4 w-4" /> Añadir bloque
              </Button>
            </div>
            {bloques.map((bloque, idx) => (
              <div key={idx} className={sectionCardClass}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField id={`bloque-${idx}-tipo`} label="Tipo">
                    <Input
                      id={`bloque-${idx}-tipo`}
                      className="h-12"
                      value={bloque.tipo_bloque}
                      onChange={(e) => updateBlock(idx, { tipo_bloque: e.target.value })}
                      placeholder="work, descanso…"
                    />
                  </FormField>
                  {!showCyclingMetrics ? (
                    <>
                      <FormField id={`bloque-${idx}-dist`} label="Distancia (m)">
                        <Input
                          id={`bloque-${idx}-dist`}
                          className="h-12"
                          type="number"
                          value={bloque.distancia_m ?? ""}
                          onChange={(e) => updateBlock(idx, { distancia_m: e.target.value ? Number(e.target.value) : null })}
                          placeholder="Opcional"
                        />
                      </FormField>
                      <FormField id={`bloque-${idx}-dur`} label="Duración (s)">
                        <Input
                          id={`bloque-${idx}-dur`}
                          className="h-12"
                          type="number"
                          value={bloque.duracion_seg ?? ""}
                          onChange={(e) => updateBlock(idx, { duracion_seg: e.target.value ? Number(e.target.value) : null })}
                          placeholder="Opcional"
                        />
                      </FormField>
                    </>
                  ) : null}
                  <FormField id={`bloque-${idx}-fcm`} label="FC media">
                    <Input
                      id={`bloque-${idx}-fcm`}
                      className="h-12"
                      type="number"
                      value={bloque.fc_media ?? ""}
                      onChange={(e) => updateBlock(idx, { fc_media: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Opcional"
                    />
                  </FormField>
                  <FormField id={`bloque-${idx}-fcmx`} label="FC max">
                    <Input
                      id={`bloque-${idx}-fcmx`}
                      className="h-12"
                      type="number"
                      value={bloque.fc_max ?? ""}
                      onChange={(e) => updateBlock(idx, { fc_max: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Opcional"
                    />
                  </FormField>
                  <FormField id={`bloque-${idx}-kcal`} label="Calorías (kcal)">
                    <Input
                      id={`bloque-${idx}-kcal`}
                      className="h-12"
                      type="number"
                      value={bloque.calorias ?? ""}
                      onChange={(e) => updateBlock(idx, { calorias: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Opcional"
                    />
                  </FormField>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setBloques((prev) => prev.filter((_, i) => i !== idx))}
                  disabled={bloques.length === 1}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Eliminar bloque
                </Button>
              </div>
            ))}
          </div>
        </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
