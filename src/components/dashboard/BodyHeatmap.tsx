import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMuscleVolume, type TimePeriod } from "@/hooks/useMuscleVolume";
import { MuscleDetailSheet } from "./MuscleDetailSheet";
import type { MainMuscleGroup } from "@/constants/muscleGroups";

/** Heat color based on set count – cyber palette */
function getHeatColor(sets: number): string {
  if (sets === 0) return "rgba(100,100,120,0.15)";
  if (sets <= 4) return "#06b6d4";   // Cyan
  if (sets <= 12) return "#8b5cf6";  // Violet
  return "#f43f5e";                   // Rose/Neon
}

function getGlowFilter(sets: number): string {
  if (sets === 0) return "";
  if (sets <= 4) return "drop-shadow(0 0 4px rgba(6,182,212,0.4))";
  if (sets <= 12) return "drop-shadow(0 0 6px rgba(139,92,246,0.5))";
  return "drop-shadow(0 0 8px rgba(244,63,94,0.6))";
}

function getHeatOpacity(sets: number, max: number): number {
  if (sets === 0 || max === 0) return 0.25;
  return 0.5 + 0.5 * (sets / max);
}

interface MuscleZone {
  group: MainMuscleGroup;
  d: string;
  label: string;
}

// ── More organic / anatomical front paths ──
const FRONT_MUSCLES: MuscleZone[] = [
  // Pecho (two pec shapes)
  { group: "Pecho", d: "M72,98 C74,88 85,82 100,80 C100,80 100,100 100,108 C90,110 78,108 72,98Z", label: "Pecho" },
  { group: "Pecho", d: "M128,98 C126,88 115,82 100,80 C100,80 100,100 100,108 C110,110 122,108 128,98Z", label: "" },
  // Hombro
  { group: "Hombro", d: "M58,82 C60,72 68,74 72,80 L72,98 C66,100 56,94 58,82Z", label: "Hombro" },
  { group: "Hombro", d: "M142,82 C140,72 132,74 128,80 L128,98 C134,100 144,94 142,82Z", label: "" },
  // Bíceps
  { group: "Bíceps", d: "M52,98 C48,104 46,118 46,132 C48,142 52,148 56,148 L62,148 C64,138 64,110 60,98Z", label: "Bíceps" },
  { group: "Bíceps", d: "M148,98 C152,104 154,118 154,132 C152,142 148,148 144,148 L138,148 C136,138 136,110 140,98Z", label: "" },
  // Antebrazo
  { group: "Antebrazo", d: "M50,150 C47,158 44,172 42,182 L50,184 C54,174 56,160 56,150Z", label: "" },
  { group: "Antebrazo", d: "M150,150 C153,158 156,172 158,182 L150,184 C146,174 144,160 144,150Z", label: "" },
  // Core (abs shape)
  { group: "Core", d: "M80,110 C88,114 100,116 100,116 C100,116 112,114 120,110 L118,170 C110,174 90,174 82,170Z", label: "Core" },
  // Cuádriceps
  { group: "Cuádriceps", d: "M78,174 C76,190 72,210 70,228 C72,238 78,244 86,246 L96,246 C98,236 98,210 96,188 C94,180 92,174 90,174Z", label: "Cuádri." },
  { group: "Cuádriceps", d: "M122,174 C124,190 128,210 130,228 C128,238 122,244 114,246 L104,246 C102,236 102,210 104,188 C106,180 108,174 110,174Z", label: "" },
  // Pantorrilla
  { group: "Pantorrilla", d: "M76,250 C74,264 73,282 74,298 L88,298 C90,282 90,264 88,250Z", label: "" },
  { group: "Pantorrilla", d: "M124,250 C126,264 127,282 126,298 L112,298 C110,282 110,264 112,250Z", label: "" },
];

const BACK_MUSCLES: MuscleZone[] = [
  // Espalda (upper back / lats – wide shape)
  { group: "Espalda", d: "M72,82 C82,78 100,76 100,76 C100,76 118,78 128,82 L130,120 C120,128 100,132 80,128 L72,82Z", label: "Espalda" },
  // Trapecio area (part of espalda)
  { group: "Espalda", d: "M88,68 C92,64 100,62 100,62 C100,62 108,64 112,68 L114,82 C108,80 92,80 86,82Z", label: "" },
  // Hombro (rear delt)
  { group: "Hombro", d: "M56,80 C58,70 66,72 72,78 L72,96 C66,100 52,94 56,80Z", label: "Hombro" },
  { group: "Hombro", d: "M144,80 C142,70 134,72 128,78 L128,96 C134,100 148,94 144,80Z", label: "" },
  // Tríceps
  { group: "Tríceps", d: "M50,98 C46,106 44,120 44,136 C46,146 50,150 54,150 L62,150 C64,140 64,112 60,98Z", label: "Tríceps" },
  { group: "Tríceps", d: "M150,98 C154,106 156,120 156,136 C154,146 150,150 146,150 L138,150 C136,140 136,112 140,98Z", label: "" },
  // Glúteo
  { group: "Glúteo", d: "M78,132 C86,136 100,138 100,138 C100,138 114,136 122,132 L120,170 C112,176 88,176 80,170Z", label: "Glúteo" },
  // Femoral
  { group: "Femoral", d: "M76,174 C74,192 72,212 72,230 L90,230 C92,212 92,192 90,174Z", label: "Femoral" },
  { group: "Femoral", d: "M124,174 C126,192 128,212 128,230 L110,230 C108,212 108,192 110,174Z", label: "" },
  // Pantorrilla
  { group: "Pantorrilla", d: "M74,234 C72,252 72,274 74,294 L88,294 C90,274 90,252 88,234Z", label: "Pantorr." },
  { group: "Pantorrilla", d: "M126,234 C128,252 128,274 126,294 L112,294 C110,274 110,252 112,234Z", label: "" },
];

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  group: string;
  sets: number;
}

export function BodyHeatmap() {
  const [period, setPeriod] = useState<TimePeriod>("week");
  const [selectedGroup, setSelectedGroup] = useState<MainMuscleGroup | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, group: "", sets: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useMuscleVolume(period);

  const groupVolume = data?.groupVolume ?? {};
  const specificVolume = data?.specificVolume ?? {};
  const maxVol = data?.maxGroupVolume ?? 0;

  const handleMouseMove = (e: React.MouseEvent, group: MainMuscleGroup) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 40,
      group,
      sets: groupVolume[group] || 0,
    });
  };

  const handleMouseLeave = () => setTooltip((t) => ({ ...t, visible: false }));

  const renderBody = (muscles: MuscleZone[], viewLabel: string) => (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">{viewLabel}</span>
      <svg viewBox="0 0 200 310" className="w-full h-auto max-h-[280px]">
        {/* SVG glow filters */}
        <defs>
          <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#06b6d4" floodOpacity="0.4" />
            <feComposite in2="blur" operator="in" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-violet" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#8b5cf6" floodOpacity="0.5" />
            <feComposite in2="blur" operator="in" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-rose" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feFlood floodColor="#f43f5e" floodOpacity="0.6" />
            <feComposite in2="blur" operator="in" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Head */}
        <ellipse cx="100" cy="42" rx="16" ry="20" fill="rgba(100,100,120,0.12)" stroke="rgba(140,140,160,0.2)" strokeWidth="0.5" />
        {/* Neck */}
        <rect x="93" y="60" width="14" height="14" rx="5" fill="rgba(100,100,120,0.1)" />

        {/* Muscle zones */}
        {muscles.map((m, i) => {
          const sets = groupVolume[m.group] || 0;
          const color = getHeatColor(sets);
          const opacity = getHeatOpacity(sets, maxVol);
          const glowId = sets === 0 ? undefined : sets <= 4 ? "url(#glow-cyan)" : sets <= 12 ? "url(#glow-violet)" : "url(#glow-rose)";

          return (
            <path
              key={`${viewLabel}-${i}`}
              d={m.d}
              fill={color}
              opacity={opacity}
              stroke={sets > 0 ? color : "rgba(140,140,160,0.25)"}
              strokeWidth={sets > 0 ? "0.8" : "0.4"}
              filter={glowId}
              onClick={() => setSelectedGroup(m.group)}
              onMouseMove={(e) => handleMouseMove(e, m.group)}
              onMouseLeave={handleMouseLeave}
              className="cursor-pointer transition-all duration-300 hover:brightness-125 hover:scale-[1.03]"
              style={{ transformOrigin: "center", transformBox: "fill-box" }}
            />
          );
        })}

        {/* Labels */}
        {muscles.filter((m) => m.label).map((m, i) => (
          <text
            key={`label-${viewLabel}-${i}`}
            x={viewLabel === "FRONTAL"
              ? (m.group === "Hombro" ? 56 : m.group === "Bíceps" ? 48 : m.group === "Core" ? 100 : m.group === "Cuádriceps" ? 82 : 100)
              : (m.group === "Hombro" ? 56 : m.group === "Tríceps" ? 48 : m.group === "Espalda" ? 100 : m.group === "Glúteo" ? 100 : m.group === "Femoral" ? 82 : m.group === "Pantorrilla" ? 80 : 100)
            }
            y={viewLabel === "FRONTAL"
              ? (m.group === "Pecho" ? 96 : m.group === "Hombro" ? 88 : m.group === "Bíceps" ? 124 : m.group === "Core" ? 142 : m.group === "Cuádriceps" ? 210 : 275)
              : (m.group === "Espalda" ? 100 : m.group === "Hombro" ? 88 : m.group === "Tríceps" ? 126 : m.group === "Glúteo" ? 154 : m.group === "Femoral" ? 202 : 264)
            }
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground/60 text-[5px] font-medium pointer-events-none select-none"
          >
            {m.label}
          </text>
        ))}

        {/* Hands */}
        <ellipse cx="40" cy="190" rx="5" ry="7" fill="rgba(100,100,120,0.08)" />
        <ellipse cx="160" cy="190" rx="5" ry="7" fill="rgba(100,100,120,0.08)" />
      </svg>
    </div>
  );

  return (
    <>
      <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Mapa Muscular</CardTitle>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
              <TabsList className="h-8 rounded-full bg-muted p-0.5">
                <TabsTrigger value="week" className="rounded-full px-3 text-xs data-[state=active]:shadow-sm">Semana</TabsTrigger>
                <TabsTrigger value="month" className="rounded-full px-3 text-xs data-[state=active]:shadow-sm">Mes</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="relative" ref={containerRef}>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="space-y-3">
              {/* Side-by-side bodies */}
              <div className="grid grid-cols-2 gap-2">
                {renderBody(FRONT_MUSCLES, "FRONTAL")}
                {renderBody(BACK_MUSCLES, "TRASERA")}
              </div>

              {/* Floating tooltip */}
              {tooltip.visible && (
                <div
                  className="pointer-events-none absolute z-50 rounded-lg border border-border/60 bg-popover/95 px-3 py-1.5 text-xs shadow-lg backdrop-blur-sm transition-opacity duration-150"
                  style={{ left: tooltip.x, top: tooltip.y, transform: "translateX(-50%)" }}
                >
                  <span className="font-semibold text-foreground">{tooltip.group}</span>
                  <span className="ml-1.5 text-muted-foreground">{tooltip.sets} series</span>
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full border border-border/40" style={{ backgroundColor: "rgba(100,100,120,0.15)" }} />
                  0
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full shadow-[0_0_6px_rgba(6,182,212,0.5)]" style={{ backgroundColor: "#06b6d4" }} />
                  1-4
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full shadow-[0_0_6px_rgba(139,92,246,0.5)]" style={{ backgroundColor: "#8b5cf6" }} />
                  5-12
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" style={{ backgroundColor: "#f43f5e" }} />
                  13+
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <MuscleDetailSheet
        open={!!selectedGroup}
        onOpenChange={(open) => !open && setSelectedGroup(null)}
        group={selectedGroup}
        specificVolume={specificVolume}
      />
    </>
  );
}
