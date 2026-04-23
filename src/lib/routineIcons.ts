import type { LucideIcon } from "lucide-react";
import { Dumbbell, Flame, Shield, Zap, Target, Swords, Activity, HeartPulse } from "lucide-react";

export type RoutineIconKey =
  | "dumbbell"
  | "flame"
  | "shield"
  | "zap"
  | "target"
  | "swords"
  | "activity"
  | "heartPulse";

export const ROUTINE_ICON_OPTIONS: Array<{ key: RoutineIconKey; label: string; Icon: LucideIcon }> = [
  { key: "dumbbell", label: "Mancuerna", Icon: Dumbbell },
  { key: "flame", label: "Fuego", Icon: Flame },
  { key: "shield", label: "Escudo", Icon: Shield },
  { key: "zap", label: "Rayo", Icon: Zap },
  { key: "target", label: "Objetivo", Icon: Target },
  { key: "swords", label: "Espadas", Icon: Swords },
  { key: "activity", label: "Actividad", Icon: Activity },
  { key: "heartPulse", label: "Pulso", Icon: HeartPulse },
];

const ROUTINE_ICON_STORAGE_KEY = "gym-log.routine-icons.v1";

function readRoutineIconMap(): Record<string, RoutineIconKey> {
  try {
    const raw = localStorage.getItem(ROUTINE_ICON_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, RoutineIconKey>;
    return parsed && typeof parsed === "object" ? parsed : {};
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

export function resolveRoutineIcon(iconKey: RoutineIconKey | null | undefined): LucideIcon {
  return ROUTINE_ICON_OPTIONS.find((opt) => opt.key === iconKey)?.Icon ?? Dumbbell;
}

