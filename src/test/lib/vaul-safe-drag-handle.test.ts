import { describe, expect, it, vi } from "vitest";
import type { PointerEvent as ReactPointerEvent } from "react";
import { vaulSafeDragHandleProps } from "@/lib/vaulSafeDragHandle";

describe("vaulSafeDragHandleProps", () => {
  it("devuelve undefined si no hay mango", () => {
    expect(vaulSafeDragHandleProps(undefined)).toBeUndefined();
  });

  it("marca el mango para Vaul y corta la burbuja del pointerdown", () => {
    const onPointerDown = vi.fn();
    const props = vaulSafeDragHandleProps({ onPointerDown });

    expect(props?.["data-vaul-no-drag"]).toBe(true);

    const stopPropagation = vi.fn();
    const event = { stopPropagation } as unknown as ReactPointerEvent;
    props?.onPointerDown(event);

    expect(onPointerDown).toHaveBeenCalledWith(event);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });
});
