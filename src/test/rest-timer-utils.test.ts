import { describe, expect, it } from "vitest";
import { formatMSS, parseMSS, restTimerForNewDuration } from "@/hooks/useRestTimer";

describe("rest timer utils", () => {
  it("formatea segundos en M:SS", () => {
    expect(formatMSS(0)).toBe("0:00");
    expect(formatMSS(59)).toBe("0:59");
    expect(formatMSS(60)).toBe("1:00");
    expect(formatMSS(125)).toBe("2:05");
  });

  it("parsea formato M:SS o segundos", () => {
    expect(parseMSS("2:05")).toBe(125);
    expect(parseMSS("00:30")).toBe(30);
    expect(parseMSS("75")).toBe(75);
    expect(parseMSS("0")).toBe(0);
  });

  it("devuelve null en entradas invalidas", () => {
    expect(parseMSS("")).toBeNull();
    expect(parseMSS("abc")).toBeNull();
    // Al no cumplir M:SS, hace fallback a parseInt.
    expect(parseMSS("1:5")).toBe(1);
    expect(parseMSS("-1")).toBeNull();
  });

  it("alarga un descanso en marcha conservando lo ya transcurrido", () => {
    const now = 1_000_000;
    const current = { duration: 90, endTime: now + 60_000 };
    const next = restTimerForNewDuration(current, 150, now);
    expect(next.duration).toBe(150);
    expect(next.finished).toBe(false);
    expect(next.remaining).toBe(120);
    expect(next.endTime).toBe(now + 120_000);
  });

  it("termina el descanso si el nuevo tiempo ya se ha cumplido", () => {
    const now = 1_000_000;
    const current = { duration: 90, endTime: now + 10_000 };
    const next = restTimerForNewDuration(current, 30, now);
    expect(next.finished).toBe(true);
    expect(next.remaining).toBe(0);
    expect(next.duration).toBe(30);
  });
});

