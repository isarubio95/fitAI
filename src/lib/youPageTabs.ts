export const YOU_TABS = ["progress", "health", "activities"] as const;
export type YouTab = (typeof YOU_TABS)[number];

const LEGACY_YOU_TABS: Record<string, YouTab> = {
  history: "progress",
  measurements: "health",
};

export const YOU_TAB_LABELS: Record<YouTab, string> = {
  progress: "Progreso",
  health: "Salud",
  activities: "Actividades",
};

export function isYouTab(value: string): value is YouTab {
  return (YOU_TABS as readonly string[]).includes(value);
}

export function normalizeYouTab(raw: string | null | undefined): YouTab {
  if (!raw) return "progress";
  if (isYouTab(raw)) return raw;
  return LEGACY_YOU_TABS[raw] ?? "progress";
}

export function youTabNeedsRedirect(raw: string | null | undefined): boolean {
  if (!raw) return false;
  return !isYouTab(raw);
}
