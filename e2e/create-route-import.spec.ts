import { expect, test, type Page } from "@playwright/test";
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

/** WebGL tumba Chromium headless: los chunks de mapa se sustituyen por componentes vacíos. */
async function stubMapChunks(page: Page) {
  for (const name of ["RouteDrawMap", "CardioRouteMap"]) {
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
          body: `export function ${name}(){ return null; }\n`,
        });
      },
    );
  }
}

test.describe("E2E: crear ruta", () => {
  test("importar un GPX desde rutas guardadas lo persiste en cardio_ruta", async ({ page }) => {
    const mock = await loginAsE2EUser(page);
    await stubMapChunks(page);

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

    const [puntos] = findMutation(mock, "cardio_ruta_punto", (m) => m.method === "POST");
    const puntosRows = puntos.body as Array<Record<string, unknown>>;
    expect(puntosRows).toHaveLength(3);
    expect(puntosRows[0]).toMatchObject({ orden: 0, lat: 40.415, lng: -3.683 });

    // Al guardar, la ruta queda seleccionada para la sesión.
    await expect(page.getByText("Vuelta al Retiro").first()).toBeVisible();
  });
});
