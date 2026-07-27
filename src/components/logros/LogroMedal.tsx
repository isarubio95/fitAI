import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bike,
  CalendarCheck,
  CalendarDays,
  Compass,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Layers,
  Medal,
  Moon,
  Route,
  Star,
  Sunrise,
  Target,
  Timer,
  Weight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import medalBronce from "@/assets/logros/medal-bronce.png";
import medalPlata from "@/assets/logros/medal-plata.png";
import medalOro from "@/assets/logros/medal-oro.png";
import medalPlatino from "@/assets/logros/medal-platino.png";
import medalDiamante from "@/assets/logros/medal-diamante.png";
import medalReto from "@/assets/logros/medal-reto.png";

const MEDAL_IMAGES: Record<string, string> = {
  bronce: medalBronce,
  plata: medalPlata,
  oro: medalOro,
  platino: medalPlatino,
  diamante: medalDiamante,
  reto: medalReto,
};

/** Color del icono central, entonado con el material de cada medalla. */
const ICON_COLORS: Record<string, string> = {
  bronce: "text-[#5e3a1e]",
  plata: "text-[#5f6670]",
  oro: "text-[#7a5a05]",
  platino: "text-[#4d5a6b]",
  diamante: "text-[#2d6aa3]",
  reto: "text-[#b58900]",
};

const ICONS: Record<string, LucideIcon> = {
  Dumbbell,
  Flame,
  Weight,
  Target,
  HeartPulse,
  Route,
  Star,
  Bike,
  Sunrise,
  Moon,
  CalendarDays,
  Layers,
  CalendarCheck,
  Medal,
  Compass,
  Timer,
  Footprints,
};

export const NIVEL_LABELS: Record<string, string> = {
  bronce: "Bronce",
  plata: "Plata",
  oro: "Oro",
  platino: "Platino",
  diamante: "Diamante",
  reto: "Reto",
};

interface LogroMedalProps {
  nivel: string;
  icono: string;
  unlocked?: boolean;
  /** Tamaño del lado en px (la medalla es cuadrada). */
  size?: number;
  className?: string;
}

export function LogroMedal({ nivel, icono, unlocked = true, size = 72, className }: LogroMedalProps) {
  const img = MEDAL_IMAGES[nivel] ?? medalBronce;
  const Icon = ICONS[icono] ?? Award;
  const iconSize = Math.round(size * 0.26);

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center transition-all",
        // Misma intensidad para todos los bloqueados (iguala bronce…diamante)
        !unlocked && "opacity-40 grayscale brightness-[0.55] contrast-75",
        className
      )}
      style={{ width: size, height: size }}
    >
      <img src={img} alt="" aria-hidden draggable={false} className="h-full w-full object-contain select-none" />
      <Icon
        className={cn(
          "absolute",
          unlocked ? (ICON_COLORS[nivel] ?? "text-foreground/70") : "text-muted-foreground",
        )}
        style={{
          width: iconSize,
          height: iconSize,
          left: "50%",
          top: "46%",
          transform: "translate(-50%, -50%)",
        }}
        strokeWidth={2.4}
      />
    </div>
  );
}
