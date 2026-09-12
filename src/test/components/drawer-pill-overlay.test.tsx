import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";

describe("Drawer overlay from pill", () => {
  it("replica la fase del círculo en el overlay de Vaul", () => {
    render(
      <Drawer open handleOnly>
        <DrawerContent data-open-from-pill data-pill-circle="in">
          <DrawerTitle>Entrenamiento activo</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const overlay = document.querySelector("[data-vaul-overlay]");
    expect(overlay).toBeTruthy();
    expect(overlay).toHaveAttribute("data-open-from-pill", "true");
    expect(overlay).toHaveAttribute("data-pill-circle", "in");
  });

  it("no marca el overlay si el drawer no abre desde la pill", () => {
    render(
      <Drawer open handleOnly>
        <DrawerContent>
          <DrawerTitle>Entrenamiento activo</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const overlay = document.querySelector("[data-vaul-overlay]");
    expect(overlay).toBeTruthy();
    expect(overlay).not.toHaveAttribute("data-open-from-pill");
    expect(overlay).not.toHaveAttribute("data-pill-circle");
  });
});
