import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// Node >= 22 define sus propios globals `localStorage`/`sessionStorage`
// (experimentales) que devuelven `undefined` si no se arranca con
// `--localstorage-file`. Ese accessor gana al de jsdom, así que dentro de los
// tests `window.localStorage` queda en undefined y revienta cualquier código
// que persista preferencias. Instalamos un Storage en memoria equivalente.
class MemoryStorage implements Storage {
  #data = new Map<string, string>();

  get length() {
    return this.#data.size;
  }

  key(index: number) {
    return [...this.#data.keys()][index] ?? null;
  }

  getItem(key: string) {
    return this.#data.get(String(key)) ?? null;
  }

  setItem(key: string, value: string) {
    this.#data.set(String(key), String(value));
  }

  removeItem(key: string) {
    this.#data.delete(String(key));
  }

  clear() {
    this.#data.clear();
  }
}

for (const name of ["localStorage", "sessionStorage"] as const) {
  if (!globalThis[name]) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value: new MemoryStorage(),
    });
  }
}

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

// jsdom no implementa `Range.getBoundingClientRect`, que `AnimatedTabsList`
// usa para medir el ancho del texto de la pestaña activa (variante underline).
if (typeof Range !== "undefined" && !Range.prototype.getBoundingClientRect) {
  Range.prototype.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    toJSON: () => ({}),
  }) as DOMRect;
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
