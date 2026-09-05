import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SortableList, useSortableItem } from "@/components/ui/sortable-list";

const ROW_HEIGHT = 100;

function Row({ id }: { id: string }) {
  const { setNodeRef, handleProps, isDragging } = useSortableItem(id);
  return (
    <div ref={setNodeRef} data-testid={`row-${id}`} data-dragging={isDragging || undefined}>
      <div {...handleProps} data-testid={`handle-${id}`} />
      <span>{id}</span>
    </div>
  );
}

function renderList(ids: string[], onReorder = vi.fn()) {
  const view = render(
    <SortableList
      items={ids}
      onReorder={onReorder}
      getItemLabel={(id) => `ejercicio ${id}`}
      renderOverlay={(id) => <span>copia {id}</span>}
    >
      {ids.map((id) => (
        <Row key={id} id={id} />
      ))}
    </SortableList>,
  );

  // jsdom no hace layout: le damos a cada fila una geometría verosímil, filas
  // de 100 px pegadas una a otra.
  ids.forEach((id, index) => {
    const node = screen.getByTestId(`row-${id}`);
    node.getBoundingClientRect = () =>
      ({ top: index * ROW_HEIGHT, height: ROW_HEIGHT, left: 0, width: 320 }) as DOMRect;
  });

  return { ...view, onReorder };
}

/** Ejecuta los frames pendientes del bucle de arrastre. */
function runFrames(count = 2) {
  for (let i = 0; i < count; i++) {
    act(() => {
      frames.splice(0).forEach((cb) => cb(performance.now()));
    });
  }
}

let frames: FrameRequestCallback[] = [];

beforeEach(() => {
  frames = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frames.push(cb);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SortableList", () => {
  it("mueve la fila a la posición donde se suelta", () => {
    const { onReorder } = renderList(["a", "b", "c"]);
    const handle = screen.getByTestId("handle-a");

    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 10, clientY: 10 });
    // Bajamos hasta que el borde inferior de la ficha rebasa el centro de "b".
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 10, clientY: 160 });
    runFrames();
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 10, clientY: 160 });

    expect(onReorder).toHaveBeenCalledWith(0, 1);
  });

  it("no reordena si se suelta sin llegar a cruzar la fila vecina", () => {
    const { onReorder } = renderList(["a", "b", "c"]);
    const handle = screen.getByTestId("handle-a");

    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 10, clientY: 50 });
    runFrames();
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 10, clientY: 50 });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it("Escape cancela el arrastre en curso", () => {
    const { onReorder } = renderList(["a", "b", "c"]);
    const handle = screen.getByTestId("handle-a");

    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 10, clientY: 300 });
    runFrames();
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 10, clientY: 300 });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it("la fila levantada se oculta: la pinta el overlay flotante", () => {
    renderList(["a", "b", "c"]);
    const handle = screen.getByTestId("handle-a");

    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 10, clientY: 10 });

    expect(screen.getByTestId("row-a")).toHaveAttribute("data-dragging", "true");
    expect(screen.getByText("copia a")).toBeInTheDocument();
    expect(screen.getByTestId("row-b")).not.toHaveAttribute("data-dragging");
  });

  it("se reordena con teclado y se anuncia la posición", () => {
    const { onReorder } = renderList(["a", "b", "c"]);
    const handle = screen.getByTestId("handle-a");

    fireEvent.keyDown(handle, { key: " " });
    expect(handle).toHaveAttribute("aria-pressed", "true");

    fireEvent.keyDown(handle, { key: "ArrowDown" });
    expect(screen.getByRole("status")).toHaveTextContent("ejercicio a, posición 2 de 3");

    fireEvent.keyDown(handle, { key: "Enter" });
    expect(onReorder).toHaveBeenCalledWith(0, 1);
  });

  it("con teclado la fila sigue visible: no hay overlay que la sustituya", () => {
    renderList(["a", "b", "c"]);
    const handle = screen.getByTestId("handle-a");

    fireEvent.keyDown(handle, { key: " " });

    // Ocultarla (o marcarla `inert`) le quitaría el foco al propio mango y
    // cortaría el gesto en el primer Espacio.
    expect(screen.getByTestId("row-a")).not.toHaveAttribute("data-dragging");
    expect(screen.getByTestId("row-a")).not.toHaveAttribute("inert");
    expect(screen.queryByText("copia a")).not.toBeInTheDocument();
  });

  it("Escape deshace el movimiento por teclado", () => {
    const { onReorder } = renderList(["a", "b", "c"]);
    const handle = screen.getByTestId("handle-a");

    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    fireEvent.keyDown(handle, { key: "Escape" });

    expect(onReorder).not.toHaveBeenCalled();
  });

  it("el mango no arrastra el drawer que lo contiene", () => {
    renderList(["a", "b"]);
    const handle = screen.getByTestId("handle-a");
    expect(handle).toHaveAttribute("data-vaul-no-drag");
    expect(handle).toHaveStyle({ touchAction: "none" });
    expect(handle).toHaveAttribute("aria-label", "Reordenar ejercicio a");
  });

  it("no levanta nada si la lista tiene una sola fila", () => {
    renderList(["a"]);
    fireEvent.pointerDown(screen.getByTestId("handle-a"), {
      pointerId: 1,
      button: 0,
      clientX: 10,
      clientY: 10,
    });
    expect(screen.queryByText("copia a")).not.toBeInTheDocument();
  });
});
