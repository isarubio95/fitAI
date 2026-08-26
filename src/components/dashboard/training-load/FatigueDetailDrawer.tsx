import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { differenceInCalendarDays, parseISO, startOfDay } from "date-fns";
import { MUSCLE_GROUPS, MUSCLE_GROUP_ICON_SRC, type MainMuscleGroup } from "@/constants/muscleGroups";
import { useMuscleFatigue } from "@/hooks/useMuscleFatigue";
import { useMuscleVolume } from "@/hooks/useMuscleVolume";
import {
  LOCAL_MUSCLE_TIME_CONSTANT_DAYS,
  rankGroupsByRecovery,
  type MuscleRecoveryRow,
  type MuscleRecoverySnapshot,
} from "@/lib/trainingLoad";
import {
  FATIGUE_COLORS,
  getHeatLevel,
  heatLevelToLoad,
} from "@/components/dashboard/bodyMapPaths";
import { MuscleLoadPanel } from "@/components/dashboard/MuscleLoadPanel";
import { MuscleSpecificBreakdown } from "@/components/dashboard/MuscleSpecificBreakdown";
import { cn } from "@/lib/utils";
import { DetailDrawerShell, DetailSection } from "./DetailDrawerShell";
import { FatigueSparkline } from "./FatigueSparkline";
import { RecoveryHero } from "./RecoveryHero";
import { formatRecoveryDays, getRecoveryZone, RECOVERY_ZONES } from "./recoveryZones";

const ALL_GROUPS = Object.keys(MUSCLE_GROUPS) as MainMuscleGroup[];
/** Misma cota inferior que usa el mapa corporal para no saturar la escala. */
const FATIGUE_SCALE_FLOOR = 8;
/** Horizonte de la cronología de recuperación, en días. */
const TIMELINE_DAYS = 7;

function daysSince(dateKey: string | null): number | null {
  if (!dateKey) return null;
  const diff = differenceInCalendarDays(startOfDay(new Date()), parseISO(dateKey));
  return diff >= 0 ? diff : null;
}

function lastTrainedLabel(dateKey: string | null): string {
  const diff = daysSince(dateKey);
  if (diff == null) return "Sin registro reciente";
  if (diff === 0) return "Entrenado hoy";
  if (diff === 1) return "Entrenado ayer";
  return `Hace ${diff} días`;
}

function GroupIcon({ group }: { group: MainMuscleGroup }) {
  return (
    <img
      src={MUSCLE_GROUP_ICON_SRC[group]}
      alt=""
      draggable={false}
      className="h-7 w-8 shrink-0 object-contain opacity-80 dark:invert"
    />
  );
}

function TrainedGroupRow({
  row,
  max,
  series,
  specificVolume,
  expanded,
  onToggle,
  rowRef,
}: {
  row: MuscleRecoveryRow;
  max: number;
  series: readonly number[] | undefined;
  specificVolume: Record<string, number>;
  expanded: boolean;
  onToggle: () => void;
  rowRef: (node: HTMLLIElement | null) => void;
}) {
  const group = row.group as MainMuscleGroup;
  const zone = getRecoveryZone(row.days);
  const barColor = FATIGUE_COLORS[heatLevelToLoad(getHeatLevel(row.fatigue, max))];
  const pct = Math.min(100, (row.fatigue / max) * 100);

  return (
    <li
      ref={rowRef}
      className={cn(
        "overflow-hidden rounded-lg transition-colors",
        expanded ? "bg-muted/60" : "bg-muted/30",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="touch-styled flex w-full items-start gap-3 px-2.5 py-2.5 text-left"
      >
        <GroupIcon group={group} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium">{group}</span>
            <span
              className="shrink-0 text-xs font-medium tabular-nums"
              style={{ color: zone.color }}
            >
              {formatRecoveryDays(row.days)} · {zone.label}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: barColor }}
              />
            </div>
            {series && <FatigueSparkline series={series} max={max} color={barColor} />}
          </div>
          <p className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>{lastTrainedLabel(row.lastTrainedAt)}</span>
            <span className="tabular-nums">Fatiga {Math.round(row.fatigue)}</span>
          </p>
        </div>
        <ChevronDown
          aria-hidden
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded && (
        <div className="space-y-2 border-t border-border/40 px-2.5 pb-3 pt-3">
          <p className="text-[11px] text-muted-foreground">Series por músculo en el último mes</p>
          <MuscleSpecificBreakdown group={group} specificVolume={specificVolume} />
        </div>
      )}
    </li>
  );
}

export function FatigueDetailDrawer({
  open,
  onOpenChange,
  snapshot,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: MuscleRecoverySnapshot;
}) {
  const { data: fatigueData } = useMuscleFatigue("week");
  const { data: volumeData } = useMuscleVolume("month");
  const [expanded, setExpanded] = useState<MainMuscleGroup | null>(null);
  const rowRefs = useRef(new Map<string, HTMLLIElement>());

  const rows = useMemo(
    () =>
      rankGroupsByRecovery(
        ALL_GROUPS,
        fatigueData?.groupFatigue ?? {},
        fatigueData?.daysToBaseline ?? {},
        fatigueData?.lastTrainedAt ?? {},
      ),
    [fatigueData],
  );
  // Cada grupo cae en una lista y solo una: con fatiga acumulada o del todo limpio.
  const trained = useMemo(() => rows.filter((row) => row.fatigue > 0), [rows]);
  const fresh = useMemo(() => rows.filter((row) => row.fatigue <= 0), [rows]);
  const max = Math.max(fatigueData?.maxGroupFatigue ?? 0, FATIGUE_SCALE_FLOOR);
  const specificVolume = volumeData?.specificVolume ?? {};

  const counts = useMemo(
    () => ({
      cargado: rows.filter((row) => row.zone.key === "cargado").length,
      pendiente: rows.filter((row) => row.zone.key === "recuperando" || row.zone.key === "casi")
        .length,
      listo: rows.filter((row) => row.zone.key === "listo").length,
    }),
    [rows],
  );

  /** El mapa no abre un sheet anidado: despliega y centra la fila del grupo. */
  const handleZoneSelect = useCallback((group: MainMuscleGroup) => {
    setExpanded(group);
    requestAnimationFrame(() => {
      rowRefs.current.get(group)?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }, []);

  const timeline = useMemo(() => {
    const buckets: { day: number; groups: string[] }[] = [];
    for (let day = 0; day <= TIMELINE_DAYS; day += 1) {
      const groups = rows
        .filter((row) => (day === TIMELINE_DAYS ? row.days >= day : row.days === day))
        .map((row) => row.group);
      if (groups.length) buckets.push({ day, groups });
    }
    return buckets;
  }, [rows]);

  return (
    <DetailDrawerShell
      open={open}
      onOpenChange={onOpenChange}
      title="Fatiga muscular"
      description="Fatiga local por grupo en los últimos 28 días"
    >
      <DetailSection>
        <RecoveryHero snapshot={snapshot} />
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/40 pt-4">
          {[
            { label: "Cargados", value: counts.cargado, color: RECOVERY_ZONES[3].color },
            { label: "Recuperando", value: counts.pendiente, color: RECOVERY_ZONES[2].color },
            { label: "Listos", value: counts.listo, color: RECOVERY_ZONES[0].color },
          ].map((chip) => (
            <div key={chip.label} className="text-center">
              <p
                className="text-2xl font-light leading-none tabular-nums"
                style={{ color: chip.color }}
              >
                {chip.value}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">{chip.label}</p>
            </div>
          ))}
        </div>
      </DetailSection>

      <DetailSection title="Mapa de carga" hint="Toca un músculo para ver su desglose más abajo.">
        <MuscleLoadPanel onZoneSelect={handleZoneSelect} />
      </DetailSection>

      {trained.length > 0 && (
        <DetailSection
          title={`Entrenados recientemente (${trained.length})`}
          hint="Ordenados por lo que les queda para volver a baseline."
        >
          <ul className="space-y-1.5">
            {trained.map((row) => (
              <TrainedGroupRow
                key={row.group}
                row={row}
                max={max}
                series={fatigueData?.fatigueSeries?.[row.group]}
                specificVolume={specificVolume}
                expanded={expanded === row.group}
                onToggle={() =>
                  setExpanded((current) =>
                    current === row.group ? null : (row.group as MainMuscleGroup),
                  )
                }
                rowRef={(node) => {
                  if (node) rowRefs.current.set(row.group, node);
                  else rowRefs.current.delete(row.group);
                }}
              />
            ))}
          </ul>
        </DetailSection>
      )}

      {fresh.length > 0 && (
        <DetailSection
          title={`Frescos y listos (${fresh.length})`}
          hint="Sin fatiga pendiente: disponibles para hoy."
        >
          <ul className="grid grid-cols-2 gap-1.5">
            {fresh.map((row) => (
              <li
                key={row.group}
                className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-2"
              >
                <GroupIcon group={row.group as MainMuscleGroup} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.group}</p>
                  <p className="text-[11px]" style={{ color: RECOVERY_ZONES[0].color }}>
                    Listo
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {timeline.length > 1 && (
        <DetailSection title="Cuándo estará listo cada grupo">
          <ol className="space-y-1">
            {timeline.map(({ day, groups }) => (
              <li key={day} className="flex items-start gap-3 rounded-lg px-1 py-1.5">
                <span className="w-16 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                  {day === 0
                    ? "Hoy"
                    : day === 1
                      ? "Mañana"
                      : day >= TIMELINE_DAYS
                        ? `${TIMELINE_DAYS}+ días`
                        : `En ${day} días`}
                </span>
                <span className="min-w-0 flex-1 text-sm">{groups.join(" · ")}</span>
              </li>
            ))}
          </ol>
        </DetailSection>
      )}

      <DetailSection title="Cómo funciona la fatiga local">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Cada serie reparte su impulso entre los músculos que trabaja: el principal recibe la
            carga completa y los secundarios la mitad. Ese impulso se acumula por grupo y decae de
            forma exponencial con una constante de ~{LOCAL_MUSCLE_TIME_CONSTANT_DAYS} días.
          </p>
          <p>
            Los días a baseline son el tiempo estimado hasta que la fatiga del grupo vuelve a un
            nivel despreciable. La ventana de cálculo son los últimos 28 días.
          </p>
        </div>
      </DetailSection>
    </DetailDrawerShell>
  );
}
