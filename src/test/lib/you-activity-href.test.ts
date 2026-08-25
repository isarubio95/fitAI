import { describe, expect, it } from "vitest";
import { pinFocusedYouActivity, youActivityHref } from "@/lib/youActivityHref";
import type { ProfileActivityItem } from "@/hooks/useProfileActivityHistory";

describe("youActivityHref", () => {
  it("abre Tú > Actividades con el entreno de gym", () => {
    expect(youActivityHref({ targetType: "actividad", targetId: "w1" })).toBe(
      "/evolution?tab=activities&gym=w1",
    );
  });

  it("abre Tú > Actividades con la sesión de cardio y comentarios", () => {
    expect(
      youActivityHref({ targetType: "cardio", targetId: "c1", openComments: true }),
    ).toBe("/evolution?tab=activities&cardio=c1&comments=1");
  });
});

describe("pinFocusedYouActivity", () => {
  const gym = (id: string): ProfileActivityItem =>
    ({ type: "gym", fecha: "2026-08-01", workout: { id } }) as ProfileActivityItem;

  it("sube la actividad enfocada al principio", () => {
    const items = [gym("w1"), gym("w2"), gym("w3")];
    expect(
      pinFocusedYouActivity(items, "w3", null).map((item) =>
        item.type === "gym" ? item.workout.id : item.session.id,
      ),
    ).toEqual(["w3", "w1", "w2"]);
  });

  it("deja la lista igual si el id no está", () => {
    const items = [gym("w1"), gym("w2")];
    expect(pinFocusedYouActivity(items, "missing", null)).toBe(items);
  });
});
