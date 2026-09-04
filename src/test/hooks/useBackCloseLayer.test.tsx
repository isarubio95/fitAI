import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBackCloseLayer } from "@/hooks/useBackCloseLayer";

/**
 * jsdom recorre el historial en una tarea diferida: un `setTimeout(0)` se
 * ejecuta antes de que llegue el `popstate`, así que hace falta un margen real.
 */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
}

type LayerKind = Parameters<typeof useBackCloseLayer>[0]["kind"];

function renderLayer(kind: LayerKind = "drawer") {
  const onOpenChange = vi.fn();
  const view = renderHook(
    ({ open }: { open: boolean }) => useBackCloseLayer({ open, onOpenChange, kind }),
    { initialProps: { open: false } },
  );
  return { ...view, onOpenChange };
}

describe("useBackCloseLayer", () => {
  beforeEach(() => {
    // El hook solo actúa en entornos tipo móvil.
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("pointer: coarse") || query.includes("max-width: 768px"),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    window.history.replaceState(null, "", "/");
  });

  afterEach(async () => {
    // `cleanup()` de testing-library desmonta las capas que sigan abiertas y eso
    // dispara `history.back()` de forma asíncrona: hay que drenarlos aquí o el
    // popstate cae dentro del test siguiente.
    await settle();
    vi.restoreAllMocks();
  });

  it("empuja una entrada de historial al abrir", () => {
    const push = vi.spyOn(window.history, "pushState");
    const { rerender } = renderLayer();

    rerender({ open: true });

    expect(push).toHaveBeenCalledTimes(1);
  });

  it("cierra la capa cuando el usuario pulsa atrás", async () => {
    const { rerender, onOpenChange } = renderLayer();
    rerender({ open: true });

    act(() => {
      window.history.back();
    });
    await settle();

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("no pide un segundo back cuando la capa ya se cerró por popstate", async () => {
    const { rerender } = renderLayer();
    rerender({ open: true });

    act(() => {
      window.history.back();
    });
    await settle();

    const back = vi.spyOn(window.history, "back");
    rerender({ open: false });

    // El navegador ya consumió la entrada al ir atrás: no debemos pedir otra.
    expect(back).not.toHaveBeenCalled();
  });

  it("consume la entrada empujada cuando la capa se cierra con la X", async () => {
    const { rerender } = renderLayer();
    rerender({ open: true });

    const back = vi.spyOn(window.history, "back");
    rerender({ open: false });
    await settle();

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("no deshace una navegación ocurrida mientras la capa estaba abierta", async () => {
    const { rerender } = renderLayer();
    rerender({ open: true });

    window.history.pushState({}, "", "/otra-ruta");
    const back = vi.spyOn(window.history, "back");
    rerender({ open: false });
    await settle();

    expect(back).not.toHaveBeenCalled();
  });

  it("no toca el historial si al cerrar una capa se abre otra", async () => {
    // Secuencia real de la bottom nav: el menú "Registrar" se cierra en el mismo
    // gesto que abre el drawer de entreno. `history.back()` es asíncrono, así
    // que si se emite aquí, su `popstate` llega cuando el drawer ya ha empujado
    // su entrada y acaba cerrándolo — el drawer se abría y caía solo.
    //
    // La garantía que se comprueba es la del mecanismo: en esta secuencia no se
    // debe emitir ningún back. Reproducir el desenlace exacto no sirve, porque
    // jsdom no modela igual que Chrome un back() seguido de pushState.
    const menu = renderLayer("popover");
    const drawer = renderLayer("drawer");

    menu.rerender({ open: true });

    const back = vi.spyOn(window.history, "back");
    menu.rerender({ open: false });
    drawer.rerender({ open: true });
    await settle();

    expect(back).not.toHaveBeenCalled();
    expect(drawer.onOpenChange).not.toHaveBeenCalled();
  });

  it("el back programático de una capa no cierra la que queda debajo", async () => {
    const outer = renderLayer("drawer");
    const inner = renderLayer("dialog");

    outer.rerender({ open: true });
    inner.rerender({ open: true });
    outer.onOpenChange.mockClear();

    // Se cierra la capa interior con la X: consume su entrada, pero la capa
    // exterior debe seguir abierta.
    inner.rerender({ open: false });
    await settle();

    expect(outer.onOpenChange).not.toHaveBeenCalled();
  });
});
