import { describe, expect, it } from "vitest";
import { appendHealthConnectFuente } from "@/lib/healthConnectHr";

describe("appendHealthConnectFuente", () => {
  it("appends health-connect once", () => {
    expect(appendHealthConnectFuente("gps-web")).toBe("gps-web+health-connect");
    expect(appendHealthConnectFuente("gps-web+health-connect")).toBe("gps-web+health-connect");
    expect(appendHealthConnectFuente(null)).toBe("gps-web+health-connect");
  });
});
