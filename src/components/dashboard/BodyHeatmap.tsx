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
  { group: "Core", d: "M 99,105 C 86,108 76,118 76,138 C 76,142 84,154 99,154 C 114,154 124,142 124,138 C 124,118 114,108 101,105 Z" },

  // Cuádriceps
  { group: "Cuádriceps", d: "M 96,158 C 86,160 74,170 74,184 C 74,209 80,222 84,222 C 92,222 98,204 98,174 Z" },
  { group: "Cuádriceps", d: "M 104,158 C 114,160 126,170 126,184 C 126,209 120,222 116,222 C 108,222 102,204 102,174 Z" },

  // Pantorrillas
  { group: "Pantorrilla", d: "M 82,229 C 72,244 72,269 76,286 C 84,289 98,276 100,254 C 100,244 88,232 82,229 Z" },
  { group: "Pantorrilla", d: "M 118,229 C 128,244 128,269 124,286 C 116,289 102,276 100,254 C 100,244 112,232 118,229 Z" },
];

const BACK_MUSCLES: MuscleZone[] = [
{ group: "Espalda", d: "M76,60 C86,56 104,54 104,54 C104,54 122,56 132,60 L124,133 C114,137 94,137 84,133 Z" },{ group: "Hombro", d: "M60,68 C62,58 70,60 76,66 L76,84 C70,88 56,82 60,68 Z" },
{ group: "Hombro", d: "M148,68 C146,58 138,60 132,66 L132,84 C138,88 152,82 148,68 Z" },
{ group: "Tríceps", d: "M54,86 C50,94 48,108 48,124 C50,134 54,138 58,138 L66,138 C68,128 68,100 64,86 Z" },
{ group: "Tríceps", d: "M154,86 C158,94 160,108 160,124 C158,134 154,138 150,138 L142,138 C140,128 140,100 144,86 Z" },
{ group: "Glúteo", d: "M82,132 C90,136 104,138 104,138 C104,138 118,136 126,132 L124,170 C116,176 92,176 84,170 Z" },
{ group: "Femoral", d: "M 80,174 C 78,192 76,212 76,230 L 98,230 C 100,212 100,192 98,174 Z" },
{ group: "Femoral", d: "M 128,174 C 130,192 132,212 132,230 L 110,230 C 108,212 108,192 110,174 Z" },
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
        <div className="relative w-full max-w-[200px] aspect-[1/1.8]">
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
            <CardTitle className="text-base font-bold">Mapa Muscular</CardTitle>
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
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-muted-foreground">
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