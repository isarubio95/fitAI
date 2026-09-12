import { describe, expect, it } from "vitest";
import { healthFabBottomClass, healthPageBottomPad } from "@/hooks/useActiveSessionFabOffset";

describe("health FAB offset", () => {
  it("sube el FAB cuando hay una sesión en curso", () => {
    expect(healthFabBottomClass(0)).toContain("+0.5rem");
    expect(healthFabBottomClass(1)).toContain("+4.5rem");
    expect(healthFabBottomClass(2)).toContain("+8.5rem");
  });

  it("reserva padding para no tapar el lienzo", () => {
    expect(healthPageBottomPad(0)).toContain("+3.5rem");
    expect(healthPageBottomPad(1)).toContain("+7.5rem");
    expect(healthPageBottomPad(2)).toContain("+11.5rem");
  });
});
