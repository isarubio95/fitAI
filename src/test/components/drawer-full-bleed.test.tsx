import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";

describe("Drawer fullBleed", () => {
  it("el lateral por defecto reserva el hueco de 92vw para pulsar fuera", () => {
    render(
      <Drawer open handleOnly>
        <DrawerContent side="right">
          <DrawerTitle>Ajustes</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const panel = document.querySelector("[data-vaul-drawer]");
    expect(panel).toBeTruthy();
    expect(panel).not.toHaveAttribute("data-drawer-full-bleed");
    expect(panel).toHaveClass("w-[min(28rem,92vw)]");
    expect(panel).not.toHaveClass("w-full");
    expect(panel).not.toHaveClass("w-dvw");
  });

  it("a sangre ocupa el viewport y no deja franja para el overlay", () => {
    render(
      <Drawer open handleOnly>
        <DrawerContent side="right" fullBleed>
          <DrawerTitle>Perfil</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const panel = document.querySelector("[data-vaul-drawer]");
    expect(panel).toBeTruthy();
    expect(panel).toHaveAttribute("data-drawer-full-bleed");
    expect(panel).toHaveClass("w-dvw");
    expect(panel).toHaveClass("max-w-none");
    expect(panel).not.toHaveClass("w-full");
    expect(panel).not.toHaveClass("w-[92vw]");
    expect(panel).not.toHaveClass("max-w-md");
  });

  it("un lateral con w-full (Ajustes) usa un min() estable, no 100dvw a sangre", () => {
    render(
      <Drawer open handleOnly>
        <DrawerContent side="right" className="z-drawer flex h-full w-full flex-col">
          <DrawerTitle>Ajustes</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const panel = document.querySelector("[data-vaul-drawer]");
    expect(panel).toBeTruthy();
    expect(panel).toHaveClass("w-[min(28rem,100dvw)]");
    expect(panel).not.toHaveClass("w-full");
    expect(panel).not.toHaveClass("w-dvw");
  });

  it("un lateral con w-full max-w-none sí pasa a w-dvw", () => {
    render(
      <Drawer open handleOnly>
        <DrawerContent side="right" className="w-full max-w-none">
          <DrawerTitle>Gimnasios</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );

    const panel = document.querySelector("[data-vaul-drawer]");
    expect(panel).toBeTruthy();
    expect(panel).toHaveClass("w-dvw");
    expect(panel).toHaveClass("max-w-none");
    expect(panel).not.toHaveClass("w-full");
  });
});
