import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMuscleVolume, type TimePeriod } from "@/hooks/useMuscleVolume";
import { MuscleDetailSheet } from "./MuscleDetailSheet";
import type { MainMuscleGroup } from "@/constants/muscleGroups";

/** Heat color based on set count – cyber palette */
function getHeatColor(sets: number): string {
  if (sets === 0) return "transparent";
  // Usamos colores ligeramente más saturados para que tiñan bien la imagen realista
  if (sets <= 4) return "#00d9ff";   // Cyan brillante
  if (sets <= 12) return "#a855f7";  // Violeta intenso
  return "#ff0055";                  // Rosa neón
}

function getHeatOpacity(sets: number, max: number): number {
  if (sets === 0) return 0;
  if (max === 0) return 0.7;
  // Opacidad más alta (0.7 a 0.95) porque el modo 'color' necesita fuerza para teñir el rojo
  return 0.7 + 0.25 * (sets / max);
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
  
  // Core / Abdomen y Oblicuos
  { group: "Core", d: "M 99,103 C 82,106 72,118 72,138 C 72,148 80,158 99,160 C 118,158 128,148 128,138 C 128,118 118,106 101,103 Z" },  
  
  // Cuádriceps
  { group: "Cuádriceps", d: "M 96,158 C 86,160 74,170 74,184 C 74,209 80,222 84,222 C 92,222 98,204 98,174 Z" },
  { group: "Cuádriceps", d: "M 104,158 C 114,160 126,170 126,184 C 126,209 120,222 116,222 C 108,222 102,204 102,174 Z" },

  // Pantorrillas
  { group: "Pantorrilla", d: "M 82,229 C 72,244 72,269 76,286 C 84,289 98,276 100,254 C 100,244 88,232 82,229 Z" },
  { group: "Pantorrilla", d: "M 118,229 C 128,244 128,269 124,286 C 116,289 102,276 100,254 C 100,244 112,232 118,229 Z" },
];

const BACK_MUSCLES: MuscleZone[] = [
  { group: "Espalda", d: "M72,82 C82,78 100,76 100,76 C100,76 118,78 128,82 L120,128 C110,132 90,132 80,128 Z" },
  { group: "Espalda", d: "M88,68 C92,64 100,62 100,62 C100,62 108,64 112,68 L114,82 C108,80 92,80 86,82Z" },
  { group: "Hombro", d: "M56,80 C58,70 66,72 72,78 L72,96 C66,100 52,94 56,80Z" },
  { group: "Hombro", d: "M144,80 C142,70 134,72 128,78 L128,96 C134,100 148,94 144,80Z" },
  { group: "Tríceps", d: "M50,98 C46,106 44,120 44,136 C46,146 50,150 54,150 L62,150 C64,140 64,112 60,98Z" },
  { group: "Tríceps", d: "M150,98 C154,106 156,120 156,136 C154,146 150,150 146,150 L138,150 C136,140 136,112 140,98Z" },
  { group: "Glúteo", d: "M78,132 C86,136 100,138 100,138 C100,138 114,136 122,132 L120,170 C112,176 88,176 80,170Z" },
  { group: "Femoral", d: "M76,174 C74,192 72,212 72,230 L90,230 C92,212 92,192 90,174Z" },
  { group: "Femoral", d: "M124,174 C126,192 128,212 128,230 L110,230 C108,212 108,192 110,174Z" },
  { group: "Pantorrilla", d: "M74,234 C72,252 72,274 74,294 L88,294 C90,274 90,252 88,234Z" },
  { group: "Pantorrilla", d: "M126,234 C128,252 128,274 126,294 L112,294 C110,274 110,252 112,234Z" },
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
        <div className="relative w-full max-w-[180px] aspect-[1/2.1]">
          {/* 1. Imagen Realista de Fondo (Sin opacidad, a todo color) */}
          <div className="absolute inset-0 w-full h-full flex justify-center items-center">
             <img 
               src={bgImage} 
               alt={`Cuerpo realista ${viewLabel}`}
               className="w-full h-full object-contain pointer-events-none" 
             />
          </div>

          {/* 2. Superposición vectorial con modo de fusión COLOR */}
          <svg viewBox="0 0 200 360" className="absolute inset-0 w-full h-full">
            {muscles.map((m, i) => {
              const sets = groupVolume[m.group] || 0;
              const color = getHeatColor(sets);
              const opacity = getHeatOpacity(sets, maxVol);

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
          </svg>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="overflow-hidden border-border/40 bg-card/95 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Mapa Muscular</CardTitle>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
              <TabsList className="h-9 rounded-full bg-muted/60 p-1">
                <TabsTrigger value="week" className="rounded-full px-4 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Semana</TabsTrigger>
                <TabsTrigger value="month" className="rounded-full px-4 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">Mes</TabsTrigger>
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

              {/* Leyenda */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded bg-transparent border border-border/50" />
                  0
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: "#00d9ff" }} />
                  1-4
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: "#a855f7" }} />
                  5-12
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: "#ff0055" }} />
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