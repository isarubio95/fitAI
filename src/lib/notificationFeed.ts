import { differenceInCalendarDays, differenceInMinutes, format, isSameYear } from "date-fns";
import { es } from "date-fns/locale";
import {
  isNewFollowerNotification,
  isSocialInteractionNotification,
  type InAppNotificationItem,
  type SocialInteractionTargetType,
  type SocialInteractionType,
  type StandardInAppNotificationItem,
} from "@/types/inAppNotification";

export type NotificationFeedSectionKey = "hoy" | "semana" | "antes";

export type NotificationFeedTarget = {
  targetType: SocialInteractionTargetType;
  targetId: string;
  targetTitle: string;
};

export type NotificationFeedEntry =
  | {
      type: "follower";
      /** Clave de render. */
      id: string;
      /** Ids de las notificaciones que cubre la fila (para descartarlas juntas). */
      ids: string[];
      createdAt?: string;
      seguidorId: string;
      username: string | null;
      avatarUrl: string | null;
    }
  | {
      type: "social";
      id: string;
      ids: string[];
      createdAt: string;
      interaction: SocialInteractionType;
      autorId: string;
      username: string | null;
      avatarUrl: string | null;
      /** Varios destinos solo cuando se agrupan me gusta del mismo autor. */
      targets: NotificationFeedTarget[];
      /** Solo en comentarios. */
      texto: string | null;
    }
  | {
      type: "standard";
      id: string;
      ids: string[];
      createdAt?: string;
      item: StandardInAppNotificationItem;
    };

export type NotificationFeedSection = {
  key: NotificationFeedSectionKey;
  label: string;
  entries: NotificationFeedEntry[];
};

const SECTION_LABELS: Record<NotificationFeedSectionKey, string> = {
  hoy: "Hoy",
  semana: "Esta semana",
  antes: "Anteriores",
};

function toValidDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function notificationSectionKey(
  createdAt: string | undefined,
  now: Date = new Date(),
): NotificationFeedSectionKey {
  const date = toValidDate(createdAt);
  if (!date) return "antes";
  const days = differenceInCalendarDays(now, date);
  if (days <= 0) return "hoy";
  if (days < 7) return "semana";
  return "antes";
}

/** Marca de tiempo corta al estilo del feed: «ahora», «12 min», «2 h», «mar», «12 mar». */
export function formatNotificationTimestamp(
  createdAt: string | undefined,
  now: Date = new Date(),
): string {
  const date = toValidDate(createdAt);
  if (!date) return "";

  const minutes = differenceInMinutes(now, date);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `${minutes} min`;

  const days = differenceInCalendarDays(now, date);
  if (days <= 0) return `${Math.floor(minutes / 60)} h`;
  if (days < 7) return format(date, "eee", { locale: es }).replace(".", "");
  if (isSameYear(now, date)) return format(date, "d MMM", { locale: es }).replace(".", "");
  return format(date, "d MMM yy", { locale: es }).replace(".", "");
}

function socialTargetsLabel(targets: NotificationFeedTarget[]): string {
  const allCardio = targets.every((t) => t.targetType === "cardio");
  const allEntreno = targets.every((t) => t.targetType === "actividad");

  if (targets.length === 1) {
    return allCardio ? "tu sesión de cardio" : "tu entreno";
  }
  if (allCardio) return `${targets.length} sesiones de cardio tuyas`;
  if (allEntreno) return `${targets.length} entrenos tuyos`;
  return `${targets.length} publicaciones tuyas`;
}

/** Texto principal de la fila, sin el nombre de usuario (que va en negrita aparte). */
export function notificationEntryAction(entry: NotificationFeedEntry): string {
  if (entry.type === "follower") return "te sigue";
  if (entry.type === "standard") return entry.item.title;
  if (entry.interaction === "like") {
    return `dio me gusta a ${socialTargetsLabel(entry.targets)}`;
  }
  const target = entry.targets[0];
  return target ? `comentó en tu ${target.targetTitle}` : "comentó en tu entreno";
}

/** Segunda línea opcional: comentario, o los destinos de los me gusta agrupados. */
export function notificationEntryDetail(entry: NotificationFeedEntry): string | null {
  if (entry.type === "standard") return entry.item.body ?? null;
  if (entry.type === "follower") return null;
  if (entry.interaction === "comment") {
    const clean = entry.texto?.trim();
    return clean ? `«${clean}»` : null;
  }
  return entry.targets.map((t) => t.targetTitle).join(" · ") || null;
}

/**
 * Agrupa las notificaciones en secciones temporales y funde los me gusta
 * del mismo autor dentro de una misma sección en una sola fila.
 */
export function buildNotificationFeed(
  items: InAppNotificationItem[],
  now: Date = new Date(),
): NotificationFeedSection[] {
  const order: NotificationFeedSectionKey[] = ["hoy", "semana", "antes"];
  const bySection = new Map<NotificationFeedSectionKey, NotificationFeedEntry[]>();
  /** `${sección}:${autor}` → índice de la fila de me gusta ya creada. */
  const likeRows = new Map<string, NotificationFeedEntry>();

  for (const item of items) {
    const createdAt = "createdAt" in item ? item.createdAt : undefined;
    const key = notificationSectionKey(createdAt, now);
    const entries = bySection.get(key) ?? [];
    if (!bySection.has(key)) bySection.set(key, entries);

    if (isNewFollowerNotification(item)) {
      entries.push({
        type: "follower",
        id: item.id,
        ids: [item.id],
        createdAt: item.createdAt,
        seguidorId: item.seguidorId,
        username: item.username,
        avatarUrl: item.avatarUrl,
      });
      continue;
    }

    if (isSocialInteractionNotification(item)) {
      const target: NotificationFeedTarget = {
        targetType: item.targetType,
        targetId: item.targetId,
        targetTitle: item.targetTitle,
      };

      if (item.interaction === "like") {
        const groupKey = `${key}:${item.autorId}`;
        const existing = likeRows.get(groupKey);
        if (existing && existing.type === "social") {
          existing.ids.push(item.id);
          if (!existing.targets.some((t) => t.targetId === target.targetId)) {
            existing.targets.push(target);
          }
          continue;
        }
        const row: NotificationFeedEntry = {
          type: "social",
          id: item.id,
          ids: [item.id],
          createdAt: item.createdAt,
          interaction: "like",
          autorId: item.autorId,
          username: item.username,
          avatarUrl: item.avatarUrl,
          targets: [target],
          texto: null,
        };
        likeRows.set(groupKey, row);
        entries.push(row);
        continue;
      }

      entries.push({
        type: "social",
        id: item.id,
        ids: [item.id],
        createdAt: item.createdAt,
        interaction: "comment",
        autorId: item.autorId,
        username: item.username,
        avatarUrl: item.avatarUrl,
        targets: [target],
        texto: item.texto,
      });
      continue;
    }

    entries.push({ type: "standard", id: item.id, ids: [item.id], item });
  }

  return order
    .map((key) => ({ key, label: SECTION_LABELS[key], entries: bySection.get(key) ?? [] }))
    .filter((section) => section.entries.length > 0);
}

/** Filas visibles del feed (me gusta del mismo autor ya fusionados). */
export function flattenNotificationFeedEntries(
  items: InAppNotificationItem[],
  now: Date = new Date(),
): NotificationFeedEntry[] {
  return buildNotificationFeed(items, now).flatMap((section) => section.entries);
}

/**
 * Recuento del badge: una unidad por fila del panel, no por like/comentario crudo.
 * Si no, dos me gusta del mismo autor cuentan 2 y en la lista se ven como 1.
 */
export function countNotificationFeedEntries(
  items: InAppNotificationItem[],
  now: Date = new Date(),
): number {
  return flattenNotificationFeedEntries(items, now).length;
}
