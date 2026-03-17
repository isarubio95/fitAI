import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMuscleVolume, type TimePeriod } from "@/hooks/useMuscleVolume";
import { MuscleDetailSheet } from "./MuscleDetailSheet";
import type { MainMuscleGroup } from "@/constants/muscleGroups";

const HEATMAP_PERIOD_STORAGE_KEY = "gym-log.dashboard.heatmap-period";

function loadHeatmapPeriod(): TimePeriod {
  try {
    const raw = localStorage.getItem(HEATMAP_PERIOD_STORAGE_KEY);
    if (raw === "week" || raw === "month") return raw;
    return "month";
  } catch {
    return "month";
  }
}

function saveHeatmapPeriod(period: TimePeriod) {
  try {
    localStorage.setItem(HEATMAP_PERIOD_STORAGE_KEY, period);
  } catch {
    // ignore
  }
}

/** Escala de 5 niveles: 0 = invisible, 1–4 = rojo claro → oscuro */
const RED_SCALE = [
  "transparent",  // 0 – no se ve
  "#fecaca",     // 1 – rojo muy claro (red-200)
  "#f87171",     // 2 – rojo claro (red-400)
  "#dc2626",     // 3 – rojo medio (red-600)
  "#991b1b",     // 4 – rojo oscuro (red-800)
] as const;

/** Devuelve el nivel 0–4 según sets y max (0 = transparente, 1–4 = rojos) */
function getHeatLevel(sets: number, max: number): number {
  if (sets === 0 || max === 0) return 0;
  if (sets >= max) return 4;
  const ratio = sets / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function getHeatColor(sets: number, max: number): string {
  const level = getHeatLevel(sets, max);
  return RED_SCALE[level];
}

function getHeatOpacity(sets: number, max: number): number {
  const level = getHeatLevel(sets, max);
  if (level === 0) return 0;
  return Math.min(1, 0.7 + 0.08 * level);
}

interface MuscleZone {
  group: MainMuscleGroup;
  d: string;
}

/// Coordenadas ajustadas con precisión quirúrgica para el modelo 3D (viewBox 0 0 200 360)
const FRONT_MUSCLES: MuscleZone[] = [
  // Pecho (Izquierdo y Derecho en la imagen)
  { group: "Pecho", d: "M 99,68 C 85,68 72,74 68,78 C 65,86 68,96 75,102 C 82,107 92,106 99,103 Z" },
  { group: "Pecho", d: "M 101,68 C 115,68 128,74 132,78 C 135,86 132,96 125,102 C 118,107 108,106 101,103 Z" },
  
  // Hombro / Deltoides (Izquierdo y Derecho en la imagen)
  { group: "Hombro", d: "M 68,76 C 62,78 59,78 59,90 C 59,98 62,105 65,105 C 68,105 68,95 68,85 Z" },
  { group: "Hombro", d: "M 132,76 C 138,78 141,78 141,90 C 141,98 138,105 135,105 C 132,105 132,95 132,85 Z" },
  
  // Bíceps / Brazo superior (Izquierdo y Derecho en la imagen)
  { group: "Bíceps", d: "M 64,95 C 56,102 50,118 48,130 C 54,135 61,130 64,120 C 68,110 68,100 64,95 Z" },
  { group: "Bíceps", d: "M 136,95 C 144,102 150,118 152,130 C 146,135 139,130 136,120 C 132,110 132,100 136,95 Z" },
  
  // Antebrazo (Izquierdo y Derecho en la imagen, capturando el ángulo hacia afuera)
  { group: "Antebrazo", d: "M 42,140 C 32,152 25,165 22,175 C 28,182 35,178 38,168 C 42,158 48,148 42,140 Z" },
  { group: "Antebrazo", d: "M 158,140 C 168,152 175,165 178,175 C 172,182 165,178 162,168 C 158,158 152,148 158,140 Z" },
  
  // Core / Abdomen y Oblicuos (altura extendida hacia arriba)
  { group: "Core", d: "M 99,97 C 86,100 76,110 76,138 C 76,142 84,154 99,154 C 114,154 124,142 124,138 C 124,110 114,100 101,97 Z" },

  // Cuádriceps (encaje mejor: bordes superiores e inferior más redondeados)
  { group: "Cuádriceps", d: "M 96,158 C 88,161 75,171 74,182 C 74,205 79,220 84,222 C 91,221 97,207 97,177 Z" },
  { group: "Cuádriceps", d: "M 104,158 C 112,161 125,171 126,182 C 126,205 121,220 116,222 C 109,221 103,207 103,177 Z" },

  // Pantorrillas (ancho reducido en vista frontal; mitad inferior más estrecha)
  { group: "Pantorrilla", d: "M 86,229 C 82,244 82,269 86,286 C 93,289 99,276 100,254 C 100,244 90,232 86,229 Z" },
  { group: "Pantorrilla", d: "M 114,229 C 118,244 118,269 114,286 C 107,289 101,276 100,254 C 100,244 110,232 114,229 Z" },
];

const BACK_MUSCLES: MuscleZone[] = [
  { group: "Espalda", d: "M76,60 C84,57 104,54 104,54 C104,54 124,57 132,60 C128,88 126,115 124,133 C114,136 94,136 84,133 C82,115 80,88 76,60 Z" },
  { group: "Hombro", d: "M60,68 C62,60 70,62 76,66 L76,84 C72,87 58,84 60,68 Z" },
  { group: "Hombro", d: "M148,68 C146,60 138,62 132,66 L132,84 C136,87 150,84 148,68 Z" },
  // Tríceps: encaje mejor, bordes más redondeados (vista espalda)
  { group: "Tríceps", d: "M 58,87 C 58,95 57,102 57,108 C 55,110 54,111 55,112 C 62,110 69,100 72,90 C 69,89 61,87 58,87 Z" },
  { group: "Tríceps", d: "M 147,87 C 147,95 148,102 148,108 C 150,110 151,111 150,112 C 143,110 131,100 128,90 C 131,89 139,87 147,87 Z" },
  { group: "Glúteo", d: "M79,132 C87,136 104,138 104,138 C104,138 121,136 129,132 L130,170 C122,176 86,176 78,170 Z" },
  { group: "Femoral", d: "M 76,174 C 75,180 82,212 82,230 L 98,230 C 100,212 103,180 102,174 Z" },
  { group: "Femoral", d: "M 132,174 C 133,180 126,212 126,230 L 110,230 C 108,212 105,180 106,174 Z" },
  // Pantorrillas: Curvatura superior añadida para un look más muscular
  { group: "Pantorrilla", d: "M 84,234 C 88,228 94,228 98,234 C 100,252 97,270 95,290 L 87,290 C 85,270 82,252 84,234 Z" },
  { group: "Pantorrilla", d: "M 124,234 C 120,228 114,228 110,234 C 108,252 111,270 113,290 L 121,290 C 123,270 126,252 124,234 Z" }
];

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  group: string;
  sets: number;
}

export function BodyHeatmap() {
  const [period, setPeriod] = useState<TimePeriod>(loadHeatmapPeriod);
  const [selectedGroup, setSelectedGroup] = useState<MainMuscleGroup | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, group: "", sets: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useMuscleVolume(period);

  useEffect(() => {
    saveHeatmapPeriod(period);
  }, [period]);

  const groupVolume = data?.groupVolume ?? {};
  const specificVolume = data?.specificVolume ?? {};
  const maxVol = data?.maxGroupVolume ?? 0;
  /** Rango más alto en mes para que la escala sea coherente con la semana (no todo saturado) */
  const effectiveMax = period === "month" ? Math.max(maxVol, 36) : Math.max(maxVol, 6);

  const handleMouseMove = (e: React.MouseEvent, group: MainMuscleGroup) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 25,
      group,
      sets: groupVolume[group] || 0,
    });
  };

  const handleMouseLeave = () => setTooltip((t) => ({ ...t, visible: false }));

  const renderBody = (muscles: MuscleZone[], viewLabel: string) => {
    // Asegúrate de tener estas imágenes realistas en tu carpeta public
    const bgImage = viewLabel === "FRONTAL" ? "/anatomy-front.png" : "/anatomy-back.png";

    return (
      <div className="flex flex-col items-center">
        {/* Aspect ratio ajustado para el cuerpo realista más alto */}
        <div className="relative w-full max-w-[200px] aspect-[1/1.8]">
          {/* 1. Imagen Realista de Fondo: filtro de color solo en la imagen para que destaque el rojo del heatmap */}
          <div className="absolute inset-0 w-full h-full flex justify-center items-center">
             <img 
               src={bgImage} 
               alt={`Cuerpo realista ${viewLabel}`}
               className="w-full h-full object-contain pointer-events-none saturate-[0.25]"
             />
          </div>

          {/* 2. Superposición vectorial con modo de fusión COLOR (frontal 15px abajo, trasera 20px abajo) */}
          <svg viewBox="0 0 200 360" className="absolute inset-0 w-full h-full">
            <g transform={viewLabel === "FRONTAL" ? "translate(0, 15)" : "translate(0, 20)"}>
            {muscles.map((m, i) => {
              const sets = groupVolume[m.group] || 0;
              const color = getHeatColor(sets, effectiveMax);
              const opacity = getHeatOpacity(sets, effectiveMax);

              return (
                <path
                  key={`${viewLabel}-${i}`}
                  d={m.d}
                  fill={color}
                  opacity={opacity}
                  // CLAVE: 'mix-blend-mode: color' tiñe la imagen realista 
                  // manteniendo sus sombras y luces 3D.
                  style={{ mixBlendMode: 'color' }}
                  onClick={() => setSelectedGroup(m.group)}
                  onMouseMove={(e) => handleMouseMove(e, m.group)}
                  onMouseLeave={handleMouseLeave}
                  className="cursor-pointer transition-all duration-300 hover:opacity-100"
                />
              );
            })}
            </g>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="overflow-hidden border-border/40 bg-card/95 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">Mapa Muscular</CardTitle>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
              <TabsList className="h-9 rounded-full bg-muted/60 p-1">
                <TabsTrigger value="month" className="rounded-full px-4 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs">Mes</TabsTrigger>
                <TabsTrigger value="week" className="rounded-full px-4 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-xs">Semana</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent className="relative pb-6" ref={containerRef}>
          {isLoading ? (
            <Skeleton className="h-[400px] w-full rounded-xl" />
          ) : (
            <div className="space-y-6">
              
              {/* Contenedor de las dos vistas (Frontal y Trasera) */}
              <div className="grid grid-cols-2 gap-4 pt-4 items-start">
                {renderBody(FRONT_MUSCLES, "FRONTAL")}
                {renderBody(BACK_MUSCLES, "TRASERA")}
              </div>

              {/* Tooltip estilo burbuja blanca interactiva */}
              {tooltip.visible && (
                <div
                  className="pointer-events-none absolute z-50 flex flex-col justify-center rounded-xl border border-border/20 bg-white px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-100 ease-out"
                  style={{ left: tooltip.x, top: tooltip.y }}
                >
                  <div className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-border/20 bg-white"></div>
                  
                  <div className="relative z-10">
                    <span className="block text-[13px] font-semibold text-zinc-900 leading-tight">{tooltip.group}</span>
                    <span className="block text-[11px] text-zinc-500 font-medium leading-tight">{tooltip.sets} series</span>
                  </div>
                </div>
              )}

              {/* Leyenda: escala de rojos con series según periodo (semana/mes) */}
              {(() => {
                const labels = period === "week"
                  ? ["0", "1", "2–3", "4", "5+ series"]
                  : ["0", "1–9", "10–18", "19–27", "28+ series"];
                return (
                  <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded bg-transparent border border-border/50" />
                      {labels[0]}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: RED_SCALE[1] }} />
                      {labels[1]}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: RED_SCALE[2] }} />
                      {labels[2]}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: RED_SCALE[3] }} />
                      {labels[3]}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: RED_SCALE[4] }} />
                      {labels[4]}
                    </span>
                  </div>
                );
              })()}
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