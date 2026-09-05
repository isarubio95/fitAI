import { describe, expect, it } from "vitest";
import {
  measureGap,
  offsetForIndex,
  resolveDropIndex,
  restingTop,
  type SortableMetrics,
} from "@/lib/sortableGeometry";

/** Tres filas de altura muy distinta, separadas por 4 px. */
const varied: SortableMetrics = {
  //        alta        baja        media
  heights: [400, 100, 200],
  tops: [0, 404, 508],
  gap: 4,
};

/** Igual que `varied` pero con una cabecera de 30 px antes de la última fila. */
const withHeader: SortableMetrics = {
  heights: [400, 100, 200],
  tops: [0, 404, 542],
  gap: 4,
};

describe("measureGap", () => {
  it("toma la separación mínima, no la que incluye una cabecera", () => {
    expect(measureGap(withHeader.tops, withHeader.heights)).toBe(4);
  });

  it("devuelve 0 con una sola fila", () => {
    expect(measureGap([0], [100])).toBe(0);
  });
});

describe("offsetForIndex", () => {
  it("la fila arrastrada no se mueve: su hueco sigue ocupando sitio", () => {
    expect(offsetForIndex(varied, 0, 2, 0)).toBe(0);
  });

  it("al bajar, las filas rebasadas suben la altura liberada más la separación", () => {
    expect(offsetForIndex(varied, 0, 2, 1)).toBe(-404);
    expect(offsetForIndex(varied, 0, 2, 2)).toBe(-404);
  });

  it("al subir, las filas rebasadas bajan", () => {
    expect(offsetForIndex(varied, 2, 0, 0)).toBe(204);
    expect(offsetForIndex(varied, 2, 0, 1)).toBe(204);
  });

  it("no toca las filas fuera del tramo recorrido", () => {
    expect(offsetForIndex(varied, 0, 1, 2)).toBe(0);
  });
});

describe("restingTop", () => {
  it("sin movimiento, la fila se queda donde estaba", () => {
    expect(restingTop(varied, 1, 1)).toBe(404);
  });

  it("bajando, queda alineada por su base con la última fila rebasada", () => {
    // La fila baja (100 px) que baja al final ocupa la base de la fila de 200 px.
    expect(restingTop(varied, 1, 2)).toBe(508 + 200 - 100);
  });

  it("subiendo, queda en el borde superior de la fila rebasada", () => {
    expect(restingTop(varied, 2, 0)).toBe(0);
  });

  /**
   * Comprobación cruzada: el resultado de `restingTop` y el de `offsetForIndex`
   * describen la misma maqueta. Si no encajaran, al soltar las filas darían un
   * salto al limpiar los transforms.
   */
  it("coincide con el hueco que dejan las demás filas, incluso con cabeceras", () => {
    // Bajamos la fila 0 (400 px) al final. La fila 2 sube 404 px.
    const filaDosNueva = withHeader.tops[2] + offsetForIndex(withHeader, 0, 2, 2);
    const baseDeLaLista = filaDosNueva + withHeader.heights[2] + withHeader.gap;
    expect(restingTop(withHeader, 0, 2)).toBe(baseDeLaLista);
  });
});

describe("resolveDropIndex", () => {
  it("en reposo devuelve la posición de partida", () => {
    for (let from = 0; from < 3; from++) {
      expect(resolveDropIndex(varied, from, varied.tops[from])).toBe(from);
    }
  });

  it("una ficha alta sobre una baja no se intercambia sola", () => {
    // El fallo clásico de comparar centro contra centro: la fila de 400 px ya
    // estaría "rebasada" sin moverla ni un píxel.
    expect(resolveDropIndex(varied, 0, 1)).toBe(0);
    expect(resolveDropIndex(varied, 0, 40)).toBe(0);
  });

  it("baja una posición cuando el borde inferior cruza el centro de la vecina", () => {
    const centroFila1 = varied.tops[1] + varied.heights[1] / 2; // 454
    const justoAntes = centroFila1 - varied.heights[0] - 1;
    const justoDespues = centroFila1 - varied.heights[0] + 1;
    expect(resolveDropIndex(varied, 0, justoAntes)).toBe(0);
    expect(resolveDropIndex(varied, 0, justoDespues)).toBe(1);
  });

  it("sube cuando el borde superior cruza el centro de la vecina de arriba", () => {
    const centroFila1 = varied.tops[1] + varied.heights[1] / 2; // 454
    expect(resolveDropIndex(varied, 2, centroFila1 + 1)).toBe(2);
    expect(resolveDropIndex(varied, 2, centroFila1 - 1)).toBe(1);
  });

  it("es monótona: arrastrar más lejos nunca retrocede el destino", () => {
    let previo = -1;
    for (let top = 0; top <= 900; top += 7) {
      const destino = resolveDropIndex(varied, 0, top);
      expect(destino).toBeGreaterThanOrEqual(previo);
      previo = destino;
    }
  });

  it("no se sale de la lista por muy lejos que se arrastre", () => {
    expect(resolveDropIndex(varied, 0, 10_000)).toBe(2);
    expect(resolveDropIndex(varied, 2, -10_000)).toBe(0);
  });
});
