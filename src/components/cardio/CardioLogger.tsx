import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { useCommunitySettings } from "@/hooks/useCommunitySettings";
import { useGlobalCardioDrawer } from "@/hooks/useGlobalCardioDrawer";
import { useCardioDisciplinas, useCardioSessionById, useUpsertCardioSession } from "@/hooks/useCardioSessions";
import { cn } from "@/lib/utils";
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
  cardio_track_point?: CardioTrackPointRow[] | null;
};

const sectionCardClass = "rounded-xl border border-border bg-card p-4 space-y-4";

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

export function CardioLogger() {
  const { state, setOpen } = useGlobalCardioDrawer();
  const { toast } = useToast();
  const upsert = useUpsertCardioSession();
  const { data: sessionData, isLoading } = useCardioSessionById(state.sessionId);
  const { data: disciplinas } = useCardioDisciplinas();
  const { comunidadPublicaActividad } = useCommunitySettings();

  const [titulo, setTitulo] = useState("");
  const [disciplinaId, setDisciplinaId] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [comentarios, setComentarios] = useState("");
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

  const defaultStart = useMemo(() => new Date().toISOString().slice(0, 16), []);

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

  useEffect(() => {
    if (!state.open) return;
    const first = <T,>(value: NestedOneOrMany<T>): T | null => (Array.isArray(value) ? (value[0] ?? null) : (value ?? null));

    if (state.sessionId && sessionData) {
      setTitulo(sessionData.titulo ?? "");
      setDisciplinaId(sessionData.cardio_disciplina_id ?? null);
      setFechaInicio((sessionData.fecha_inicio ?? "").slice(0, 16));
      setFechaFin((sessionData.fecha_fin ?? "").slice(0, 16));
      setComentarios(sessionData.comentarios ?? "");
      const running = first(sessionData.cardio_sesion_running as NestedOneOrMany<CardioRunningRow>);
      const cycling = first(sessionData.cardio_sesion_cycling as NestedOneOrMany<CardioCyclingRow>);
      const track = first(sessionData.cardio_track as NestedOneOrMany<CardioTrackRow>);
      const points = track?.cardio_track_point ?? [];
      setRunningRitmo(running?.ritmo_medio_seg_km?.toString() ?? "");
      setRunningCadencia(running?.cadencia_media_spm?.toString() ?? "");
      setRunningDesnivel(running?.desnivel_positivo_m?.toString() ?? "");
      setRunningZancada(running?.zancada_media_cm?.toString() ?? "");
      setCyclingPotenciaMedia(cycling?.potencia_media_w?.toString() ?? "");
      setCyclingPotenciaNp(cycling?.potencia_normalizada_w?.toString() ?? "");
      setCyclingCadencia(cycling?.cadencia_media_rpm?.toString() ?? "");
      setCyclingDesnivel(cycling?.desnivel_positivo_m?.toString() ?? "");
      setCyclingTipoBici(cycling?.tipo_bici ?? "");
      setTrackJson(
        points.length
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
          : "",
      );
      setBloques(
        (sessionData.cardio_bloque ?? []).map((b) => ({
          tipo_bloque: b.tipo_bloque ?? "work",
          distancia_m: b.distancia_m,
          duracion_seg: b.duracion_seg,
          elevacion_m: b.elevacion_m,
          fc_media: b.fc_media,
          fc_max: b.fc_max,
          calorias: b.calorias,
        })),
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
      setTitulo("");
      setDisciplinaId(state.initialDisciplineId ?? null);
      setBloques([emptyBlock()]);
    }
    setFechaInicio(defaultStart);
    setFechaFin("");
    setComentarios("");
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
  }, [state.open, state.sessionId, sessionData, state.templateBlocks, state.templateTitle, state.templateDisciplineId, state.initialDisciplineId, defaultStart]);

  const updateBlock = (idx: number, patch: Partial<CardioBlockInput>) => {
    setBloques((prev) => prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  };

  const save = async () => {
    if (!titulo.trim()) {
      toast({ title: "Añade un título", variant: "destructive" });
      return;
    }
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
    } else if (code) {
      sport_detail = { disciplina_codigo: code as CardioDisciplineCode };
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
        titulo: titulo.trim(),
        cardio_disciplina_id: disciplinaId,
        sport_detail,
        track,
        fecha_inicio: new Date(fechaInicio).toISOString(),
        fecha_fin: fechaFin ? new Date(fechaFin).toISOString() : null,
        comentarios: comentarios.trim() || null,
        es_publica: comunidadPublicaActividad,
        bloques,
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
        className="h-[92lvh] max-h-[92lvh] overflow-y-auto rounded-t-[20px] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DrawerHeader className="sticky top-0 z-10 border-b border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <DrawerTitle className="text-lg">{sheetTitle}</DrawerTitle>
            <Button type="button" size="sm" onClick={save} disabled={upsert.isPending || isLoading}>
              {(upsert.isPending || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {upsert.isPending ? "Guardando..." : saveLabel}
            </Button>
          </div>
        </DrawerHeader>

        <div className="space-y-6 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <FormField id="cardio-titulo" label="Título">
                <Input
                  id="cardio-titulo"
                  className="h-12"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: 10K suave"
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <FormField id="cardio-inicio" label="Inicio">
                <Input
                  id="cardio-inicio"
                  className="h-12"
                  type="datetime-local"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </FormField>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <FormField id="cardio-fin" label="Fin (opcional)">
                <Input
                  id="cardio-fin"
                  className="h-12"
                  type="datetime-local"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </FormField>
            </div>
          </div>

          {showRunningMetrics ? (
            <div className={sectionCardClass}>
              <p className="text-sm font-semibold">Métricas de carrera</p>
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
              <p className="text-sm font-semibold">Métricas de ciclismo</p>
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
              <div key={idx} className={cn(sectionCardClass, "space-y-4")}>
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
      </DrawerContent>
    </Drawer>
  );
}
