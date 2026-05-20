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
import type { SupabaseClient } from "@supabase/supabase-js";

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

export const DEFAULT_ROUTINE_ICON_KEY: RoutineIconKey = "dumbbell";

const ROUTINE_ICON_STORAGE_KEY = "gym-log.routine-icons.v1";

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

const VALID_ICON_KEYS = new Set<string>(ROUTINE_ICON_OPTIONS.map((opt) => opt.key));

export function resolveRoutineIconKey(iconKey: string | null | undefined): RoutineIconKey {
  if (!iconKey) return DEFAULT_ROUTINE_ICON_KEY;
  if (iconKey === "customPose") return "leg";
  if (VALID_ICON_KEYS.has(iconKey)) return iconKey as RoutineIconKey;
  return DEFAULT_ROUTINE_ICON_KEY;
}

export function resolveRoutineIcon(iconKey: string | null | undefined): RoutineIconComponent {
  const key = resolveRoutineIconKey(iconKey);
  return ROUTINE_ICON_OPTIONS.find((opt) => opt.key === key)?.Icon ?? Dumbbell;
}

/** Migra iconos guardados en localStorage (versión anterior) a la columna rutina.icono. */
export async function migrateRoutineIconsFromLocalStorage(
  userId: string,
  client: SupabaseClient,
): Promise<void> {
  try {
    const raw = localStorage.getItem(ROUTINE_ICON_STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") {
      localStorage.removeItem(ROUTINE_ICON_STORAGE_KEY);
      return;
    }

    const updates = Object.entries(parsed)
      .map(([routineId, value]) => {
        if (typeof value !== "string") return null;
        const iconKey = resolveRoutineIconKey(value);
        if (iconKey === DEFAULT_ROUTINE_ICON_KEY) return null;
        return { routineId, iconKey };
      })
      .filter(Boolean) as { routineId: string; iconKey: RoutineIconKey }[];

    if (updates.length > 0) {
      await Promise.all(
        updates.map(({ routineId, iconKey }) =>
          client.from("rutina").update({ icono: iconKey }).eq("id", routineId).eq("usuario_id", userId),
        ),
      );
    }

    localStorage.removeItem(ROUTINE_ICON_STORAGE_KEY);
  } catch {
    // ignore localStorage / migration errors
  }
}
