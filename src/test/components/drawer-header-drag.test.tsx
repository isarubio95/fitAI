import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

describe("DrawerHeader dragEntireHeader", () => {
  it("cubre el header con un handle de Vaul y deja los botones fuera del arrastre", () => {
    render(
      <Drawer open handleOnly>
        <DrawerContent>
          <DrawerHeader dragEntireHeader>
            <DrawerTitle>Entrenamiento activo</DrawerTitle>
            <button type="button" className="pointer-events-auto" data-vaul-no-drag>
              Opciones de entrenamiento
            </button>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>,
    );

    const header = document.querySelector("[data-drawer-header-drag]");
    expect(header).toBeTruthy();
    expect(header).toHaveClass("pointer-events-none");

    const overlay = header?.querySelector("[data-drawer-header-drag-overlay]");
    expect(overlay).toBeTruthy();
    expect(overlay).toHaveClass("pointer-events-auto");

    const button = screen.getByRole("button", { name: "Opciones de entrenamiento" });
    expect(button).toHaveAttribute("data-vaul-no-drag");
    expect(button).toHaveClass("pointer-events-auto");
  });
});
