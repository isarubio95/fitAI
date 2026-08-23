import { describe, expect, it } from "vitest";
import {
  buildNotificationFeed,
  formatNotificationTimestamp,
  notificationEntryAction,
  notificationEntryDetail,
} from "@/lib/notificationFeed";
import type { InAppNotificationItem } from "@/types/inAppNotification";

const NOW = new Date("2026-08-23T12:00:00Z");

function like(id: string, targetTitle: string, createdAt: string, autorId = "autor-1"): InAppNotificationItem {
  return {
    id,
    variant: "social-interaction",
    kind: "action",
    dismissable: true,
    interaction: "like",
    targetType: "actividad",
    targetId: `target-${id}`,
    targetTitle,
    autorId,
    username: "noelia_pinillos",
    avatarUrl: null,
    texto: null,
    createdAt,
  };
}

describe("buildNotificationFeed", () => {
  it("agrupa por sección temporal y descarta las vacías", () => {
    const items: InAppNotificationItem[] = [
      like("a", "Día B", "2026-08-23T10:00:00Z"),
      {
        id: "f1",
        variant: "new-follower",
        kind: "action",
        dismissable: true,
        seguidorId: "u2",
        username: "joseba",
        avatarUrl: null,
        createdAt: "2026-08-18T09:00:00Z",
      },
    ];

    const sections = buildNotificationFeed(items, NOW);
    expect(sections.map((s) => s.label)).toEqual(["Hoy", "Esta semana"]);
    expect(sections[1].entries[0].type).toBe("follower");
  });

  it("funde los me gusta del mismo autor dentro de una sección", () => {
    const sections = buildNotificationFeed(
      [
        like("a", "Día B", "2026-08-23T07:00:00Z"),
        like("b", "Día C", "2026-08-23T06:30:00Z"),
        like("c", "Día A", "2026-08-23T06:00:00Z", "autor-2"),
      ],
      NOW,
    );

    const [hoy] = sections;
    expect(hoy.entries).toHaveLength(2);
    const merged = hoy.entries[0];
    expect(merged.ids).toEqual(["a", "b"]);
    expect(notificationEntryAction(merged)).toBe("dio me gusta a 2 entrenos tuyos");
    expect(notificationEntryDetail(merged)).toBe("Día B · Día C");
  });

  it("mantiene los comentarios separados y muestra el texto", () => {
    const sections = buildNotificationFeed(
      [
        {
          ...like("c1", "Día B", "2026-08-23T10:00:00Z"),
          interaction: "comment",
          texto: "Y los ABS??",
        } as InAppNotificationItem,
      ],
      NOW,
    );

    const entry = sections[0].entries[0];
    expect(notificationEntryAction(entry)).toBe("comentó en tu Día B");
    expect(notificationEntryDetail(entry)).toBe("«Y los ABS??»");
  });
});

describe("formatNotificationTimestamp", () => {
  it("usa horas dentro del día y día de la semana en los 7 días previos", () => {
    expect(formatNotificationTimestamp("2026-08-23T10:00:00Z", NOW)).toBe("2 h");
    expect(formatNotificationTimestamp("2026-08-23T11:45:00Z", NOW)).toBe("15 min");
    expect(formatNotificationTimestamp("2026-08-18T11:00:00Z", NOW)).toBe("mar");
    expect(formatNotificationTimestamp("2026-07-04T11:00:00Z", NOW)).toBe("4 jul");
  });
});
