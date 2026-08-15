import { describe, expect, it } from "vitest";
import { acquireMapThumbSlot } from "@/lib/mapThumbSlots";

describe("mapThumbSlots", () => {
  it("caps concurrent slots and releases waiters in order", async () => {
    const releases: Array<() => void> = [];
    const order: number[] = [];

    await Promise.all([
      acquireMapThumbSlot().then((r) => {
        order.push(1);
        releases.push(r);
      }),
      acquireMapThumbSlot().then((r) => {
        order.push(2);
        releases.push(r);
      }),
      acquireMapThumbSlot().then((r) => {
        order.push(3);
        releases.push(r);
      }),
    ]);
    expect(order).toEqual([1, 2, 3]);

    let fourthGranted = false;
    const fourth = acquireMapThumbSlot().then((r) => {
      fourthGranted = true;
      releases.push(r);
    });

    // Aún no hay cupo libre.
    await Promise.resolve();
    expect(fourthGranted).toBe(false);

    releases[0]!();
    await fourth;
    expect(fourthGranted).toBe(true);

    for (const release of releases.slice(1)) release();
  });
});
