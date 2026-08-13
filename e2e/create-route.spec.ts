import { expect, test, type Page } from "@playwright/test";
import { E2E_CARDIO_DISCIPLINE_ID } from "./fixtures/ids";
import { findMutation } from "./fixtures/supabaseMock";
import { loginAsE2EUser, openCardioLive } from "./fixtures/ui";

const GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="e2e" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Vuelta al Retiro</name>
    <trkseg>
      <trkpt lat="40.4150" lon="-3.6830"><ele>650</ele></trkpt>
      <trkpt lat="40.4160" lon="-3.6820"><ele>655</ele></trkpt>
      <trkpt lat="40.4170" lon="-3.6810"><ele>660</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`;

/**
 * WebGL tumba Chromium headless: los chunks de mapa se sustituyen por componentes vacíos.
 * `RouteDrawMap` publica sus props en `window` para poder simular toques en el mapa.
 */
async function stubMapChunks(page: Page) {
  const bodies: Record<string, string> = {
    RouteDrawMap:
      "export function RouteDrawMap(props){ window.__routeDrawProps = props; return null; }\n",
    CardioRouteMap: "export function CardioRouteMap(){ return null; }\n",
  };

  for (const [name, body] of Object.entries(bodies)) {
    await page.route(
      (url) => url.pathname.includes(name),
      (route) => {
        if (route.request().url().includes(".css")) {
          return route.fulfill({ status: 200, contentType: "text/css", body: "/* stub */" });
        }
        return route.fulfill({
          status: 200,
          contentType: "application/javascript",
          headers: { "Cache-Control": "no-store" },
          body,
        });
      },
    );
  }
}

async function tapMap(page: Page, lat: number, lng: number) {
  await page.evaluate(
    ([latitude, longitude]) => {
      (
        window as unknown as {
          __routeDrawProps?: { onAddPoint: (p: { lat: number; lng: number }) => void };
        }
      ).__routeDrawProps?.onAddPoint({ lat: latitude, lng: longitude });
    },
    [lat, lng],
  );
}

/**
 * El botón de rutas solo aparece en disciplinas con GPS; el mock compartido solo
 * expone una de interior. Este override es local a este spec.
 */
async function useOutdoorDiscipline(page: Page) {
  await page.route("**/rest/v1/cardio_disciplina*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify([
        {
          id: E2E_CARDIO_DISCIPLINE_ID,
          nombre: "Correr",
          codigo: "running",
          activo: true,
          orden: 1,
        },
      ]),
    }),
  );
}

test.describe("E2E: crear ruta", () => {
  test.use({
    geolocation: { latitude: 40.4168, longitude: -3.7038, accuracy: 8 },
    permissions: ["geolocation"],
  });

  test("importar un GPX desde rutas guardadas lo persiste en cardio_ruta", async ({ page }) => {
    const mock = await loginAsE2EUser(page);
    await stubMapChunks(page);
    await useOutdoorDiscipline(page);
    await page.reload();

    await openCardioLive(page);
    await page.getByRole("button", { name: "Elegir ruta guardada" }).click();
    await expect(page.getByText("Rutas guardadas")).toBeVisible();

    await page.getByRole("button", { name: "Crear ruta" }).first().click();
    const sheet = page.getByRole("dialog", { name: "Nueva ruta" });
    await expect(sheet).toBeVisible();

    await sheet.getByRole("tab", { name: "Importar" }).click();
    await sheet.locator('input[type="file"]').setInputFiles({
      name: "retiro.gpx",
      mimeType: "application/gpx+xml",
      buffer: Buffer.from(GPX, "utf8"),
    });

    // El parseo ocurre en el navegador: métricas y nombre salen del archivo.
    await expect(sheet.getByText("3 puntos")).toBeVisible();
    await expect(sheet.getByLabel("Nombre")).toHaveValue("Vuelta al Retiro");

    await sheet.getByRole("button", { name: "Guardar ruta" }).click();

    await expect
      .poll(() => findMutation(mock, "cardio_ruta", (m) => m.method === "POST").length, {
        timeout: 20_000,
      })
      .toBeGreaterThan(0);

    const [ruta] = findMutation(mock, "cardio_ruta", (m) => m.method === "POST");
    const rutaRow = (Array.isArray(ruta.body) ? ruta.body[0] : ruta.body) as Record<string, unknown>;
    expect(rutaRow.nombre).toBe("Vuelta al Retiro");
    expect(Number(rutaRow.distancia_total_m)).toBeGreaterThan(0);
    expect(Number(rutaRow.elevacion_positiva_m)).toBeGreaterThan(0);

    await expect
      .poll(() => findMutation(mock, "cardio_ruta_punto", (m) => m.method === "POST").length, {
        timeout: 20_000,
      })
      .toBeGreaterThan(0);

    const [puntos] = findMutation(mock, "cardio_ruta_punto", (m) => m.method === "POST");
    const puntosRows = puntos.body as Array<Record<string, unknown>>;
    expect(puntosRows).toHaveLength(3);
    expect(puntosRows[0]).toMatchObject({ orden: 0, lat: 40.415, lng: -3.683 });

    // Al guardar, la ruta queda seleccionada para la sesión.
    await expect(page.getByText("Vuelta al Retiro").first()).toBeVisible();
  });

  test("trazar puntos en el mapa guarda la polilínea dibujada", async ({ page }) => {
    const mock = await loginAsE2EUser(page);
    await stubMapChunks(page);
    await useOutdoorDiscipline(page);
    // Sin enrutador los tramos quedan rectos: el trazado es determinista.
    await page.route("**/brouter.de/**", (route) => route.abort());
    await page.reload();

    await openCardioLive(page);
    await page.getByRole("button", { name: "Elegir ruta guardada" }).click();
    await page.getByRole("button", { name: "Crear ruta" }).first().click();

    const sheet = page.getByRole("dialog", { name: "Nueva ruta" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("tab", { name: "Dibujar" })).toHaveAttribute(
      "data-state",
      "active",
    );

    await tapMap(page, 40.415, -3.683);
    await tapMap(page, 40.42, -3.678);
    await tapMap(page, 40.425, -3.673);
    await expect(sheet.getByText("3 puntos")).toBeVisible();

    // Sin nombre, se usa el generado a partir de la distancia.
    await sheet.getByRole("button", { name: "Guardar ruta" }).click();

    await expect
      .poll(() => findMutation(mock, "cardio_ruta_punto", (m) => m.method === "POST").length, {
        timeout: 20_000,
      })
      .toBeGreaterThan(0);

    const [ruta] = findMutation(mock, "cardio_ruta", (m) => m.method === "POST");
    const rutaRow = (Array.isArray(ruta.body) ? ruta.body[0] : ruta.body) as Record<
      string,
      unknown
    >;
    expect(String(rutaRow.nombre)).toMatch(/^Ruta · /);
    expect(rutaRow.cardio_disciplina_id).toBeTruthy();

    const [puntos] = findMutation(mock, "cardio_ruta_punto", (m) => m.method === "POST");
    const puntosRows = puntos.body as Array<Record<string, unknown>>;
    expect(puntosRows).toHaveLength(3);
    expect(puntosRows.map((p) => p.orden)).toEqual([0, 1, 2]);
    expect(puntosRows[2]).toMatchObject({ lat: 40.425, lng: -3.673 });
  });
});
