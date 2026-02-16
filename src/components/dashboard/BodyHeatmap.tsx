import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMuscleVolume, type TimePeriod } from "@/hooks/useMuscleVolume";
import { MuscleDetailSheet } from "./MuscleDetailSheet";
import type { MainMuscleGroup } from "@/constants/muscleGroups";

type BodyView = "front" | "back";

/** Returns an HSL color string based on set count intensity */
function getHeatColor(sets: number): string {
  if (sets === 0) return "hsl(var(--muted))";
  if (sets <= 5) return "hsl(210 80% 60%)";       // Blue
  if (sets <= 10) return "hsl(160 70% 45%)";       // Teal
  if (sets <= 20) return "hsl(30 90% 55%)";        // Orange
  return "hsl(270 70% 55%)";                        // Purple
}

function getHeatOpacity(sets: number, max: number): number {
  if (sets === 0 || max === 0) return 0.3;
  return 0.4 + 0.6 * (sets / max);
}

/** Simplified front body SVG paths mapped to muscle groups */
const FRONT_MUSCLES: { group: MainMuscleGroup; d: string; label: string; labelPos: [number, number] }[] = [
  // Head (not a muscle group, just for shape)
  { group: "Core" as MainMuscleGroup, d: "", label: "", labelPos: [100, 30] },
  // Pecho
  { group: "Pecho", d: "M70,95 Q75,80 100,78 Q125,80 130,95 L125,110 Q100,115 75,110 Z", label: "Pecho", labelPos: [100, 97] },
  // Hombro
  { group: "Hombro", d: "M55,80 Q60,70 70,75 L70,95 L60,100 Q50,90 55,80 Z", label: "Hombro", labelPos: [55, 87] },
  { group: "Hombro", d: "M145,80 Q140,70 130,75 L130,95 L140,100 Q150,90 145,80 Z", label: "", labelPos: [145, 87] },
  // Bíceps
  { group: "Bíceps", d: "M50,100 Q45,105 45,125 Q47,140 52,145 L60,145 Q62,130 60,100 Z", label: "Bíceps", labelPos: [50, 123] },
  { group: "Bíceps", d: "M150,100 Q155,105 155,125 Q153,140 148,145 L140,145 Q138,130 140,100 Z", label: "", labelPos: [150, 123] },
  // Antebrazo
  { group: "Antebrazo", d: "M48,145 Q45,155 42,175 L50,178 Q55,160 55,145 Z", label: "", labelPos: [48, 162] },
  { group: "Antebrazo", d: "M152,145 Q155,155 158,175 L150,178 Q145,160 145,145 Z", label: "", labelPos: [152, 162] },
  // Core
  { group: "Core", d: "M78,112 Q100,118 122,112 L120,165 Q100,170 80,165 Z", label: "Core", labelPos: [100, 140] },
  // Cuádriceps
  { group: "Cuádriceps", d: "M75,168 Q73,190 70,220 Q72,240 80,245 L95,245 Q98,230 97,200 Q96,180 93,168 Z", label: "Cuádri.", labelPos: [82, 208] },
  { group: "Cuádriceps", d: "M125,168 Q127,190 130,220 Q128,240 120,245 L105,245 Q102,230 103,200 Q104,180 107,168 Z", label: "", labelPos: [118, 208] },
  // Pantorrilla (front view – tibial)
  { group: "Pantorrilla", d: "M78,248 Q76,270 75,295 L90,295 Q92,270 90,248 Z", label: "", labelPos: [83, 272] },
  { group: "Pantorrilla", d: "M122,248 Q124,270 125,295 L110,295 Q108,270 110,248 Z", label: "", labelPos: [117, 272] },
];

const BACK_MUSCLES: { group: MainMuscleGroup; d: string; label: string; labelPos: [number, number] }[] = [
  // Espalda (upper + lats)
  { group: "Espalda", d: "M70,80 Q100,75 130,80 L128,130 Q100,135 72,130 Z", label: "Espalda", labelPos: [100, 105] },
  // Hombro (rear delts)
  { group: "Hombro", d: "M55,78 Q60,68 70,73 L70,95 L58,98 Q48,90 55,78 Z", label: "Hombro", labelPos: [58, 85] },
  { group: "Hombro", d: "M145,78 Q140,68 130,73 L130,95 L142,98 Q152,90 145,78 Z", label: "", labelPos: [142, 85] },
  // Tríceps
  { group: "Tríceps", d: "M50,100 Q45,110 45,130 Q47,145 52,148 L60,148 Q62,135 60,100 Z", label: "Tríceps", labelPos: [50, 125] },
  { group: "Tríceps", d: "M150,100 Q155,110 155,130 Q153,145 148,148 L140,148 Q138,135 140,100 Z", label: "", labelPos: [150, 125] },
  // Glúteo
  { group: "Glúteo", d: "M75,135 Q100,140 125,135 L123,168 Q100,175 77,168 Z", label: "Glúteo", labelPos: [100, 152] },
  // Femoral
  { group: "Femoral", d: "M75,170 Q73,195 72,225 L92,225 Q93,195 92,170 Z", label: "Femoral", labelPos: [82, 198] },
  { group: "Femoral", d: "M125,170 Q127,195 128,225 L108,225 Q107,195 108,170 Z", label: "", labelPos: [118, 198] },
  // Pantorrilla
  { group: "Pantorrilla", d: "M73,228 Q72,255 73,290 L90,290 Q91,255 90,228 Z", label: "Pantorr.", labelPos: [81, 260] },
  { group: "Pantorrilla", d: "M127,228 Q128,255 127,290 L110,290 Q109,255 110,228 Z", label: "", labelPos: [119, 260] },
];

export function BodyHeatmap() {
  const [period, setPeriod] = useState<TimePeriod>("week");
  const [view, setView] = useState<BodyView>("front");
  const [selectedGroup, setSelectedGroup] = useState<MainMuscleGroup | null>(null);
  const { data, isLoading } = useMuscleVolume(period);

  const groupVolume = data?.groupVolume ?? {};
  const specificVolume = data?.specificVolume ?? {};
  const maxVol = data?.maxGroupVolume ?? 0;

  const muscles = view === "front" ? FRONT_MUSCLES : BACK_MUSCLES;

  const handleMuscleClick = (group: MainMuscleGroup) => {
    setSelectedGroup(group);
  };

  return (
    <>
      <Card>
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
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="space-y-3">
              {/* View toggle */}
              <div className="flex justify-center">
                <Tabs value={view} onValueChange={(v) => setView(v as BodyView)}>
                  <TabsList className="h-8 rounded-full bg-muted p-0.5">
                    <TabsTrigger value="front" className="rounded-full px-4 text-xs data-[state=active]:shadow-sm">Frontal</TabsTrigger>
                    <TabsTrigger value="back" className="rounded-full px-4 text-xs data-[state=active]:shadow-sm">Trasera</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* SVG Body */}
              <div className="flex justify-center">
                <svg viewBox="0 0 200 310" className="w-48 h-auto max-h-72">
                  {/* Body outline */}
                  {/* Head */}
                  <ellipse cx="100" cy="40" rx="18" ry="22" fill="hsl(var(--muted))" opacity="0.5" />
                  {/* Neck */}
                  <rect x="92" y="60" width="16" height="15" rx="4" fill="hsl(var(--muted))" opacity="0.4" />

                  {/* Muscle zones */}
                  {muscles.map((m, i) => {
                    if (!m.d) return null;
                    const sets = groupVolume[m.group] || 0;
                    const color = getHeatColor(sets);
                    const opacity = getHeatOpacity(sets, maxVol);
                    return (
                      <g
                        key={`${view}-${i}`}
                        onClick={() => handleMuscleClick(m.group)}
                        className="cursor-pointer transition-all duration-200 hover:brightness-125"
                      >
                        <path
                          d={m.d}
                          fill={color}
                          opacity={opacity}
                          stroke="hsl(var(--border))"
                          strokeWidth="0.5"
                          className="transition-all duration-300"
                        />
                        {m.label && (
                          <text
                            x={m.labelPos[0]}
                            y={m.labelPos[1]}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-foreground text-[6px] font-medium pointer-events-none select-none"
                          >
                            {m.label}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Hands/feet placeholders */}
                  <ellipse cx="42" cy="185" rx="6" ry="8" fill="hsl(var(--muted))" opacity="0.3" />
                  <ellipse cx="158" cy="185" rx="6" ry="8" fill="hsl(var(--muted))" opacity="0.3" />
                </svg>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--muted))" }} />0
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(210 80% 60%)" }} />1-5
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(160 70% 45%)" }} />6-10
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(30 90% 55%)" }} />11-20
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(270 70% 55%)" }} />20+
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
