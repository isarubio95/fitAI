import { createElement, type ComponentType, type SVGProps } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Dumbbell,
  Flame,
  Shield,
  Zap,
  Target,
  Swords,
  Activity,
  HeartPulse,
  BicepsFlexed,
  CircleDot,
  LayoutGrid,
} from "lucide-react";

export type RoutineIconKey =
  | "dumbbell"
  | "flame"
  | "shield"
  | "zap"
  | "target"
  | "swords"
  | "activity"
  | "heartPulse"
  | "arm"
  | "leg"
  | "abs"
  | "fullBody";

function LegIcon(props: SVGProps<SVGSVGElement>) {
  return createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ...props,
    },
    createElement("path", { d: "M15 3l2 4l-3 4l1 4l3 6" }),
    createElement("path", { d: "M11 11l-4 2" }),
    createElement("path", { d: "M16 21h4" }),
  );
}

type RoutineIconComponent = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;

export const ROUTINE_ICON_OPTIONS: Array<{ key: RoutineIconKey; label: string; Icon: RoutineIconComponent }> = [
  { key: "dumbbell", label: "Mancuerna", Icon: Dumbbell },
  { key: "flame", label: "Fuego", Icon: Flame },
  { key: "shield", label: "Escudo", Icon: Shield },
  { key: "zap", label: "Rayo", Icon: Zap },
  { key: "target", label: "Objetivo", Icon: Target },
  { key: "swords", label: "Espadas", Icon: Swords },
  { key: "activity", label: "Actividad", Icon: Activity },
  { key: "heartPulse", label: "Pulso", Icon: HeartPulse },
  { key: "arm", label: "Brazo", Icon: BicepsFlexed },
  { key: "leg", label: "Pierna", Icon: LegIcon },
  { key: "abs", label: "Abdomen", Icon: CircleDot },
  { key: "fullBody", label: "Cuerpo entero", Icon: LayoutGrid },
];

const ROUTINE_ICON_STORAGE_KEY = "gym-log.routine-icons.v1";

function readRoutineIconMap(): Record<string, RoutineIconKey> {
  try {
    const raw = localStorage.getItem(ROUTINE_ICON_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    // Compatibilidad: migramos "customPose" -> "leg"
    const migrated = Object.fromEntries(
      Object.entries(parsed).map(([k, v]) => [k, v === "customPose" ? "leg" : v]),
    ) as Record<string, RoutineIconKey>;
    return migrated;
  } catch {
    return {};
  }
}

function writeRoutineIconMap(map: Record<string, RoutineIconKey>) {
  try {
    localStorage.setItem(ROUTINE_ICON_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore localStorage errors (private mode, quota, etc.)
  }
}

export function getRoutineIconKey(routineId: string): RoutineIconKey | null {
  if (!routineId) return null;
  return readRoutineIconMap()[routineId] ?? null;
}

export function setRoutineIconKey(routineId: string, iconKey: RoutineIconKey) {
  if (!routineId || !iconKey) return;
  const current = readRoutineIconMap();
  current[routineId] = iconKey;
  writeRoutineIconMap(current);
}

export function resolveRoutineIcon(iconKey: RoutineIconKey | null | undefined): RoutineIconComponent {
  return ROUTINE_ICON_OPTIONS.find((opt) => opt.key === iconKey)?.Icon ?? Dumbbell;
}

