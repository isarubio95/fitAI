import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

describe("useDebouncedValue", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("actualiza al instante si el delay es 0", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "a", delay: 0 } },
    );
    expect(result.current).toBe("a");
    rerender({ value: "ab", delay: 0 });
    expect(result.current).toBe("ab");
  });

  it("espera el delay cuando hay texto", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "", delay: 250 } },
    );
    rerender({ value: "ba", delay: 250 });
    expect(result.current).toBe("");
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe("ba");
  });
});
